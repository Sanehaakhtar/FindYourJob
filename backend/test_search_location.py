import asyncio
from app.services.cerebras_client import cerebras_client

async def test_search_logic():
    skills = ["Sales", "Cold Calling", "Lead Generation"]
    experience = "3 years in tech software sales"
    location = "Pakistan"
    
    print(f"Testing with location: {location}")
    query = await cerebras_client.generate_search_query(skills, experience, location)
    print(f"Generated Query: {query}")

if __name__ == "__main__":
    asyncio.run(test_search_logic())
