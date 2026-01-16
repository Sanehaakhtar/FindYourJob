from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from typing import List
from app.services.cerebras_client import cerebras_client
from app.services.supabase_service import supabase_service

router = APIRouter(prefix="/generate", tags=["Generator"])

class CoverLetterRequest(BaseModel):
    email: str
    job_title: str = "Job Application"
    company: str = "Hiring Manager"
    description: str = ""

class CoverLetterResponse(BaseModel):
    letter: str

@router.post("/cover-letter", response_model=CoverLetterResponse)
async def generate_cover_letter(req: CoverLetterRequest):
    # 1. Fetch User Profile
    profile = await supabase_service.get_profile_by_email(req.email)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found. Please upload CV first.")
    
    # 2. Generate Letter
    letter = await cerebras_client.generate_cover_letter(
        user_name=profile.get("full_name", "Applicant"),
        skills=profile.get("skills", []),
        experience=profile.get("experience_summary", ""),
        job_title=req.job_title,
        company=req.company,
        job_description=req.description
    )
    
    return CoverLetterResponse(letter=letter)
