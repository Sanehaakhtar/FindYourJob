"""Jobs endpoint for retrieving saved jobs"""

import logging
from fastapi import APIRouter, Query, HTTPException
from typing import List
from app.models import JobResponse
from app.services.supabase_service import supabase_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.get("", response_model=List[JobResponse])
async def get_jobs(
    limit: int = Query(default=100, ge=1, le=100, description="Number of jobs")
):
    """Get recently saved jobs from database"""
    logger.info(f"[INFO] Fetching {limit} recent jobs")
    
    try:
        jobs = await supabase_service.get_recent_jobs(limit)
        
        return [
            JobResponse(
                id=job.get("id", ""),
                title=job.get("title", "Untitled"),
                company=job.get("company"),
                url=job.get("url", ""),
                description=job.get("description"),
                location=job.get("location"),
                source=job.get("source", "tavily"),
                created_at=job.get("created_at")
            )
            for job in jobs
        ]
        
    except Exception as e:
        logger.error(f"[ERROR] Failed to fetch jobs: {e}")
        raise HTTPException(status_code=500, detail=str(e))