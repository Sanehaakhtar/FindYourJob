"""Supabase database operations"""

import logging
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.database import supabase

logger = logging.getLogger(__name__)


class SupabaseService:
    """Database operations for profiles and jobs"""
    
    def __init__(self):
        self.client = supabase
    
    async def create_profile(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create or update user profile"""
        def _sync_create():
            logger.info(f"💾 Saving profile: {profile_data.get('email')}")
            
            try:
                # Check existing
                existing = self.client.table("profiles").select("*").eq(
                    "email", profile_data.get("email")
                ).execute()
                
                data = {
                    "full_name": profile_data.get("full_name"),
                    "email": profile_data.get("email"),
                    "phone": profile_data.get("phone", ""),
                    "location": profile_data.get("location", ""),
                    "skills": profile_data.get("skills", []),
                    "experience_summary": profile_data.get("experience_summary", ""),
                    "cv_text": profile_data.get("cv_text", ""),
                    "updated_at": datetime.utcnow().isoformat()
                }
                
                if existing.data:
                    result = self.client.table("profiles").update(data).eq(
                        "email", profile_data.get("email")
                    ).execute()
                else:
                    data["created_at"] = datetime.utcnow().isoformat()
                    result = self.client.table("profiles").insert(data).execute()
                
                logger.info("✅ Profile saved")
                return result.data[0] if result.data else None
                
            except Exception as e:
                # If location column is missing, try saving without it
                if "location" in data and "column" in str(e).lower():
                    logger.warning("⚠️ 'location' column missing in Supabase. Falling back...")
                    del data["location"]
                    try:
                        if existing.data:
                            result = self.client.table("profiles").update(data).eq(
                                "email", profile_data.get("email")
                            ).execute()
                        else:
                            data["created_at"] = datetime.utcnow().isoformat()
                            result = self.client.table("profiles").insert(data).execute()
                        return result.data[0] if result.data else None
                    except Exception as fallback_e:
                        logger.error(f"❌ Fallback failed: {fallback_e}")
                        raise fallback_e
                
                logger.error(f"❌ Failed to save profile: {e}")
                raise e

        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _sync_create)
    
    async def get_profile_by_email(self, email: str) -> Optional[Dict]:
        """Get profile by email"""
        def _sync_get_profile():
            try:
                result = self.client.table("profiles").select("*").eq(
                    "email", email
                ).execute()
                return result.data[0] if result.data else None
            except Exception as e:
                logger.error(f"❌ Failed to fetch profile: {e}")
                return None

        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _sync_get_profile)
    
    async def store_jobs(self, jobs: List[Dict], search_query: str) -> int:
        """Store jobs (skip duplicates)"""
        def _sync_store():
            logger.info(f"💾 Storing {len(jobs)} jobs...")
            
            stored = 0
            for job in jobs:
                try:
                    # Check duplicate
                    existing = self.client.table("jobs").select("id").eq(
                        "url", job.get("url")
                    ).execute()
                    
                    if existing.data:
                        continue
                    
                    data = {
                        "title": job.get("title"),
                        "company": job.get("company"),
                        "url": job.get("url"),
                        "description": job.get("description"),
                        "location": job.get("location"),
                        "source": job.get("source", "tavily"),
                        "search_query": search_query,
                        "created_at": datetime.utcnow().isoformat()
                    }
                    
                    self.client.table("jobs").insert(data).execute()
                    stored += 1
                    
                except Exception as e:
                    logger.warning(f"⚠️ Failed to store job: {e}")
                    continue
            
            logger.info(f"✅ Stored {stored} new jobs")
            return stored

        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _sync_store)
    
    async def get_recent_jobs(self, limit: int = 100) -> List[Dict]:
        """Get most recent jobs"""
        def _sync_get_jobs():
            try:
                result = self.client.table("jobs").select("*").order(
                    "created_at", desc=True
                ).limit(limit).execute()
                return result.data if result.data else []
            except Exception as e:
                logger.error(f"❌ Failed to fetch jobs: {e}")
                return []

        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _sync_get_jobs)


# Singleton
supabase_service = SupabaseService()