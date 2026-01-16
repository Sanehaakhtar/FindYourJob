"""Tavily job search client"""

import logging
import asyncio
from typing import List, Dict, Any
from tavily import TavilyClient as TavilySDK
from app.config import settings

logger = logging.getLogger(__name__)


class TavilyClient:
    """Search for jobs using Tavily AI Search"""
    
    def __init__(self):
        self.client = TavilySDK(api_key=settings.tavily_api_key)
        logger.info("🔍 Tavily initialized")
    
    async def search_jobs(self, query: str, max_results: int = 30) -> List[Dict[str, Any]]:
        """Search for job postings"""
        logger.info(f"🔍 Searching: {query}")
        
        # 1. HARDEN QUERY: Force site filtering and language
        # We manually append 'site:...' for the most popular boards to ensure Tavily stays on track
        site_filter = "(site:linkedin.com OR site:indeed.com OR site:glassdoor.com OR site:rozee.pk OR site:jobee.pk OR site:glassdoor.co.uk OR site:lever.co OR site:greenhouse.io)"
        search_query = f"{query} {site_filter} job posting hiring English"
        
        try:
            loop = asyncio.get_event_loop()
            
            # Run in thread with timeout
            response = await asyncio.wait_for(
                loop.run_in_executor(
                    None,
                    lambda: self.client.search(
                        query=search_query,
                        search_depth="advanced",
                        max_results=max_results,
                        include_domains=[
                            "linkedin.com",
                            "indeed.com",
                            "glassdoor.com",
                            "rozee.pk",
                            "mustakbil.com",
                            "jobee.pk",
                            "lever.co",
                            "greenhouse.io",
                            "workable.com"
                        ]
                    )
                ),
                timeout=45.0
            )
            
            raw_results = response.get("results", [])
            logger.info(f"✅ Found {len(raw_results)} raw results")
            
            # 2. STRICT DOMAIN FILTER: Throw away anything that isn't a job board or ATS
            trusted_domains = [
                "linkedin.com", "indeed.com", "glassdoor.com", "rozee.pk", 
                "mustakbil.com", "jobee.pk", "lever.co", "greenhouse.io", 
                "workable.com", "remoteok.com", "we_work_remotely.com"
            ]
            
            jobs = []
            for r in raw_results:
                url = r.get("url", "").lower()
                
                # Check if URL belongs to a trusted domain
                if not any(domain in url for domain in trusted_domains):
                    continue
                
                # Filter out obvious non-jobs
                content = r.get("content", "")
                if len(content) < 100: # Too short to be a job post
                    continue
                    
                job = {
                    "title": self._clean_title(r.get("title", "Untitled")),
                    "company": self._extract_company(r.get("title", "")),
                    "url": r.get("url", ""),
                    "description": content[:500],
                    "location": self._extract_location(content),
                    "source": "tavily"
                }
                
                if job["url"]:
                    jobs.append(job)
            
            logger.info(f"Filtered down to {len(jobs)} high-quality job results")
            return jobs
            
        except asyncio.TimeoutError:
            logger.error("Tavily search timed out")
            raise Exception("Search service timed out (45s)")
        except Exception as e:
            logger.error(f"Search failed: {e}")
            raise
    
    def _clean_title(self, title: str) -> str:
        """Clean job title"""
        for suffix in [" - LinkedIn", " | Indeed", " - Glassdoor"]:
            title = title.replace(suffix, "")
        return title.strip()[:200]
    
    def _extract_company(self, title: str) -> str:
        """Try to extract company from title"""
        for sep in [" at ", " - ", " | ", " @ "]:
            if sep in title:
                return title.split(sep)[-1].strip()[:100]
        return None
    
    def _extract_location(self, content: str) -> str:
        """Extract location hints"""
        content_lower = content.lower()
        if "remote" in content_lower:
            return "Remote"
        if "hybrid" in content_lower:
            return "Hybrid"
        if "islamabad" in content_lower:
            return "Islamabad"
        if "lahore" in content_lower:
            return "Lahore"
        if "karachi" in content_lower:
            return "Karachi"
        return None


# Singleton
tavily_client = TavilyClient()