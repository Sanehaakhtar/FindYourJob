import asyncio
import logging
from app.database import supabase

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def clear_database():
    """Delete all records from jobs and profiles tables"""
    logger.info("🗑️ Clearing database...")
    
    try:
        # Delete jobs
        logger.info("Deleting jobs...")
        jobs_result = supabase.table("jobs").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        logger.info(f"✅ Deleted jobs")

        # Delete profiles
        logger.info("Deleting profiles...")
        profiles_result = supabase.table("profiles").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        logger.info(f"✅ Deleted profiles")
        
        logger.info("✨ Database is now empty!")
        
    except Exception as e:
        logger.error(f"❌ Failed to clear database: {e}")

if __name__ == "__main__":
    asyncio.run(clear_database())
