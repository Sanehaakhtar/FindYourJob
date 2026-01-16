# D:\AutoJobFinder\sdr-job-agent\backend\app\routers\search.py

from fastapi import APIRouter, Query
from typing import List
from pydantic import BaseModel

router = APIRouter()

# This is what frontend expects
class JobResponse(BaseModel):
    title: str
    company: str | None = None
    url: str
    location: str | None = None
    description: str | None = None

class SearchResponse(BaseModel):
    success: bool = True
    query: str
    count: int
    jobs: List[JobResponse]

from app.services.tavily_client import tavily_client
from app.services.supabase_service import supabase_service
from app.services.cerebras_client import cerebras_client
import re

@router.post("/search", response_model=SearchResponse)
async def search_jobs(
    query: str = Query(..., min_length=3, description="e.g. Python internship Islamabad")
):
    actual_query = query
    is_auto = False

    # 1. Check if query is an email (Resume Mode)
    email_regex = r"[^@]+@[^@]+\.[^@]+"
    if re.match(email_regex, query.strip()):
        profile = await supabase_service.get_profile_by_email(query.strip())
        
        if profile:
            location = profile.get("location", "")
            print(f"DEBUG: Found profile for {query.strip()}. Location in DB: '{location}'")
            
            # Generate optimized query from profile
            actual_query = await cerebras_client.generate_search_query(
                skills=profile.get("skills", []),
                experience=profile.get("experience_summary", ""),
                location=location
            )
            print(f"DEBUG: AI Generated Query: '{actual_query}'")
            is_auto = True
        else:
            # Fallback if profile not found (although ideally we'd warn contextually)
            # For now, we search just in case, or we could return empty.
            pass

    # 2. Search with the determined query
    jobs = await tavily_client.search_jobs(actual_query)
    
    # Save to DB
    if jobs:
        await supabase_service.store_jobs(jobs, query)
    
    # 3. Prioritize by Location
    user_location = ""
    if re.match(email_regex, query.strip()):
        profile = await supabase_service.get_profile_by_email(query.strip())
        if profile:
            user_location = profile.get("location", "").lower()
            
    def get_sort_score(job):
        job_loc = (job.get("location") or "").lower()
        if not user_location or not job_loc:
            return 0
        # If user location is in job location or vice versa
        if user_location in job_loc or job_loc in user_location:
            return 10
        return 0

    sorted_jobs = sorted(jobs, key=get_sort_score, reverse=True)

    # Convert to proper format
    formatted_jobs = [
        JobResponse(
            title=j["title"],
            company=j.get("company"),
            url=j["url"],
            location=j.get("location"),
            description=j.get("description")
        )
        for j in sorted_jobs
    ]
    
    return SearchResponse(
        query=actual_query if is_auto else query,
        count=len(formatted_jobs),
        jobs=formatted_jobs
    )