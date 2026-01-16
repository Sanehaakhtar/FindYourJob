"""Onboarding endpoint for CV upload"""

import logging
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models import OnboardingResponse, ProfileResponse
from app.services.pdf_parser import PDFParser
from app.services.cerebras_client import cerebras_client
from app.services.supabase_service import supabase_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/onboard", tags=["Onboarding"])


@router.post("", response_model=OnboardingResponse)
async def onboard_user(file: UploadFile = File(..., description="PDF Resume")):
    """
    Upload CV/Resume to create profile.
    
    1. Extracts text from PDF
    2. AI parses name, email, skills
    3. Saves to database
    """
    logger.info(f"\n{'='*50}")
    logger.info(f"[FILE] ONBOARDING: {file.filename}")
    logger.info(f"{'='*50}")
    
    # Validate file
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files accepted")
    
    content = await file.read()
    
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Empty file")
    
    if len(content) > 10 * 1024 * 1024:  # 10MB
        raise HTTPException(status_code=413, detail="File too large (max 10MB)")
    
    try:
        # Validate PDF
        if not PDFParser.validate_pdf(content):
            raise HTTPException(status_code=400, detail="Invalid PDF file")
        
        # Extract text
        cv_text = await PDFParser.extract_text(content)
        
        if len(cv_text) < 50:
            raise HTTPException(status_code=422, detail="Could not extract text from PDF")
        
        # Parse with AI
        profile_data = await cerebras_client.structure_cv(cv_text)
        profile_data["cv_text"] = cv_text
        
        # Save to database
        saved_profile = await supabase_service.create_profile(profile_data)
        
        logger.info("[SUCCESS] Onboarding complete!")
        
        return OnboardingResponse(
            success=True,
            profile=ProfileResponse(
                id=saved_profile.get("id", ""),
                full_name=saved_profile.get("full_name", ""),
                email=saved_profile.get("email", ""),
                skills=saved_profile.get("skills", []),
                location=saved_profile.get("location", ""),
                experience_summary=saved_profile.get("experience_summary", "")
            ),
            message=f"Profile created for {saved_profile.get('full_name')}"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        logger.error(f"[ERROR] Onboarding failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))