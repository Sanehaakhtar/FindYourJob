import asyncio
import logging
from app.services.supabase_service import supabase_service

logging.basicConfig(level=logging.INFO)

async def test_creation():
    test_data = {
        "full_name": "Test User",
        "email": "test_location@example.com",
        "location": "New York, USA",
        "skills": ["Python"],
        "experience_summary": "Test summary",
        "cv_text": "Test CV content"
    }
    try:
        result = await supabase_service.create_profile(test_data)
        print(f"Success: {result}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_creation())
