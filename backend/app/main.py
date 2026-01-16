"""FastAPI Application - SDR Job Agent"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import search, jobs, onboard, generator

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    logger.info("=" * 50)
    logger.info("SDR Job Agent Starting...")
    logger.info(f"[INFO] Database: {settings.supabase_url}")
    logger.info("=" * 50)
    yield
    logger.info("Shutting down...")


# Create app
app = FastAPI(
    title="SDR Job Agent API",
    description="AI-Powered Job Hunting Assistant",
    version="1.0.0",
    lifespan=lifespan
)

# CORS - Allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(onboard.router)
app.include_router(search.router)
app.include_router(jobs.router)
app.include_router(generator.router)


@app.get("/", tags=["Health"])
async def root():
    """API Info"""
    return {
        "name": "SDR Job Agent API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "search": "GET /search?query=Python jobs Islamabad",
            "jobs": "GET /jobs",
            "onboard": "POST /onboard (upload PDF)"
        }
    }


@app.get("/health", tags=["Health"])
async def health():
    """Health check"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)