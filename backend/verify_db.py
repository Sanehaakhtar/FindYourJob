import asyncio
import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

async def verify_supabase():
    print(f"Checking Supabase connection...")
    print(f"URL: {url}")
    print(f"Key: {key[:5]}..." if key else "Key: Not found")

    if not url or not key:
        print("❌ Missing SUPABASE_URL or SUPABASE_KEY in .env")
        return

    try:
        supabase: Client = create_client(url, key)
        
        # Try to select from profiles
        print("Attempting to select from 'profiles' table...")
        response = supabase.table("profiles").select("*").execute()
        print(f"[OK] Connection successful! Found {len(response.data)} profiles.")
        print(f"Profiles: {response.data}")
        
        # Try to select from jobs
        print("Attempting to select from 'jobs' table...")
        response = supabase.table("jobs").select("*").execute()
        print(f"[OK] Connection successful! Found {len(response.data)} jobs.")

    except Exception as e:
        print(f"[ERROR] Connection failed: {e}")
        print("\nPossible fix: Ensure you have created the 'profiles' and 'jobs' tables in your Supabase dashboard.")

async def test_insert():
    print("\n--- Testing INSERT Permission ---")
    try:
        supabase: Client = create_client(url, key)
        test_data = {
            "email": "test_user_verification@example.com",
            "full_name": "Test User",
            "skills": ["Debugging"],
            "experience_summary": "Testing connection",
            "cv_text": "Test content",
            "updated_at": "2024-01-01T00:00:00"
        }
        # Attempt insert
        response = supabase.table("profiles").insert(test_data).execute()
        print(f"[OK] Insert successful! Result: {response.data}")
    except Exception as e:
        print(f"[ERROR] INSERT failed: {e}")
        print("-> This likely means Row Level Security (RLS) is preventing writes.")
        print("-> Solution: Go to Supabase > Authentication > Policies and disable RLS for 'profiles' table.")

if __name__ == "__main__":
    asyncio.run(verify_supabase())
    asyncio.run(test_insert())
