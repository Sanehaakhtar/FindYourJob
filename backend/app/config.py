"""Configuration management"""

import os
from functools import lru_cache
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """App settings from environment variables"""
    
    # Cerebras
    cerebras_api_key: str = Field(..., env="CEREBRAS_API_KEY")
    cerebras_base_url: str = Field(default="https://api.cerebras.ai/v1")
    cerebras_model: str = Field(default="llama3.1-8b")
    
    # Tavily
    tavily_api_key: str = Field(..., env="TAVILY_API_KEY")
    
    # Supabase
    supabase_url: str = Field(..., env="SUPABASE_URL")
    supabase_key: str = Field(..., env="SUPABASE_KEY")
    
    # App
    debug: bool = Field(default=False)
    log_level: str = Field(default="INFO")
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()