"""Pydantic models for request/response"""

from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from enum import Enum


class SearchMode(str, Enum):
    RESUME = "resume"
    KEYWORD = "keyword"


# Profile Models
class ProfileResponse(BaseModel):
    id: str
    full_name: str
    email: str
    skills: List[str] = []
    location: Optional[str] = None
    experience_summary: str = ""
    created_at: Optional[datetime] = None


# Job Models
class JobResponse(BaseModel):
    id: str
    title: str
    company: Optional[str] = None
    url: str
    description: Optional[str] = None
    location: Optional[str] = None
    source: str = "tavily"
    created_at: Optional[datetime] = None


# Search Models
class SearchRequest(BaseModel):
    query: str = Field(..., min_length=3, description="Search keywords")


class SearchResponse(BaseModel):
    success: bool
    query_used: str
    jobs_found: int
    jobs: List[JobResponse] = []
    message: str


# Onboarding Models
class OnboardingResponse(BaseModel):
    success: bool
    profile: Optional[ProfileResponse] = None
    message: str