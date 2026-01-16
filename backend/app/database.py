"""Supabase database client"""

import logging
from supabase import create_client, Client
from app.config import settings

logger = logging.getLogger(__name__)


def get_supabase_client() -> Client:
    """Create Supabase client"""
    try:
        client = create_client(
            settings.supabase_url,
            settings.supabase_key
        )
        logger.info("Supabase connected")
        return client
    except Exception as e:
        logger.error(f"Supabase connection failed: {e}")
        raise


supabase: Client = get_supabase_client()