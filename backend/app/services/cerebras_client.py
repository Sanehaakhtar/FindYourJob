"""Cerebras LLM client"""

import json
import logging
import asyncio
from typing import Dict, Any, List
from openai import OpenAI
from app.config import settings

logger = logging.getLogger(__name__)


class CerebrasClient:
    """Client for Cerebras Cloud (OpenAI-compatible)"""
    
    def __init__(self):
        self.client = OpenAI(
            api_key=settings.cerebras_api_key,
            base_url=settings.cerebras_base_url
        )
        self.model = settings.cerebras_model
        logger.info(f"[INFO] Cerebras initialized: {self.model}")
    
    async def structure_cv(self, cv_text: str) -> Dict[str, Any]:
        """Parse CV and return structured data"""
        logger.info("[INFO] Structuring CV with AI...")
        
        prompt = f"""Analyze this CV/Resume and extract information as JSON.
        
CV Text:
{cv_text[:4000]}

Return valid JSON:
{{
    "full_name": "Person's name",
    "email": "email@example.com",
    "phone": "phone number or empty",
    "location": "City, Country (e.g. Islamabad, Pakistan)",
    "skills": ["skill1", "skill2", "skill3"],
    "experience_summary": "2-3 sentence summary"
}}

Return ONLY JSON, nothing else."""

        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": "You are a CV parser. Return only valid JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.1,
                    max_tokens=500
                )
            )
            
            result = response.choices[0].message.content.strip()
            
            # Clean markdown if present
            if "```" in result:
                result = result.split("```")[1]
                if result.startswith("json"):
                    result = result[4:]
            
            data = json.loads(result.strip())
            logger.info(f"[SUCCESS] Parsed CV for: {data.get('full_name')} at {data.get('location')}")
            return data
            
        except Exception as e:
            logger.error(f"[ERROR] CV parsing failed: {e}")
            raise
    
    async def generate_search_query(self, skills: List[str], experience: str, location: str = "") -> str:
        """Generate optimized job search query"""
        logger.info(f"[INFO] Generating search query with location: {location}...")
        
        skills_str = ", ".join(skills[:8])
        location_clause = f" in {location}" if location else " (Remote or localized)"
        
        prompt = f"""Create a job search query based on this profile:

Skills: {skills_str}
Experience: {experience[:300]}
Target Location: {location if location else "Anywhere (MUST prioritize Remote or local to the user)"}

Instructions:
1. Generate ONE search query (5-10 words) STRICTLY IN ENGLISH.
2. If location is "{location}", the query MUST include "{location}".
3. Avoid generic global terms that might lead to irrelevant results (like mass-market Chinese listings).
4. Focus on professional SDR/Sales roles.

Return ONLY the search query in English. No other characters or languages. """

        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.2,
                    max_tokens=50
                )
            )
            
            query = response.choices[0].message.content.strip().strip('"\'')
            # Extra safety: if location is missing from query but exists in profile, append it
            if location and location.lower() not in query.lower():
                query = f"{query} in {location}"
                
            logger.info(f"[SUCCESS] Generated query: {query}")
            return query
            
        except Exception as e:
            logger.error(f"[ERROR] Query generation failed: {e}")
            return f"{' '.join(skills[:3])}{location_clause} jobs"

    async def generate_cover_letter(self, user_name: str, skills: List[str], experience: str, job_title: str, company: str, job_description: str) -> str:
        """Generate a human-like cover letter"""
        logger.info(f"[INFO] Generating cover letter for {company}...")
        
        prompt = f"""Write a professional yet natural cover letter for this job application.

My Details:
Name: {user_name}
Skills: {', '.join(skills)}
Experience: {experience}

Job Details:
Role: {job_title}
Company: {company}
Description: {job_description[:800]}

Instructions:
1. Tone: Professional, confident, but conversational (human-like).
2. Format: Standard cover letter (Dear Hiring Manager...).
3. content: specificially mention how my skills match the job requirements.
4. STRICT RULES: 
   - NO placeholders like [Your Name] (use {user_name}).
   - ABSOLUTELY NO EMOJIS allowed.
   - NO robot-like phrases ("I am writing to express my interest..."). Open with something stronger.
   - Keep it concise (under 250 words).

Write ONLY the letter body."""

        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": "You are a professional career coach. Write in simple, persuasive English."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7,
                    max_tokens=600
                )
            )
            
            letter = response.choices[0].message.content.strip()
            logger.info("[SUCCESS] Cover letter generated")
            return letter
            
        except Exception as e:
            logger.error(f"[ERROR] Cover letter generation failed: {e}")
            return "Could not generate cover letter at this time. Please try again."


# Singleton
cerebras_client = CerebrasClient()