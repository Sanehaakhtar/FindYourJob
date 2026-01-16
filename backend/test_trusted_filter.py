import asyncio
from app.services.tavily_client import tavily_client

async def test_filter():
    query = "Web"
    print(f"Testing filter for query: {query}")
    jobs = await tavily_client.search_jobs(query)
    
    print(f"\nFound {len(jobs)} filtered jobs:")
    for job in jobs[:5]:
        print(f"- {job['title']} ({job['url']})")
        
    # Check if any Zhihu or non-job domains were included
    bad_found = [j['url'] for j in jobs if 'zhihu.com' in j['url'].lower() or 'wikipedia' in j['url'].lower()]
    if bad_found:
        print(f"\n❌ FAIL: Found irrelevant domains: {bad_found}")
    else:
        print("\n✅ SUCCESS: No irrelevant domains found!")

if __name__ == "__main__":
    asyncio.run(test_filter())
