import os
from dataclasses import dataclass
from typing import Optional


@dataclass
class SupabaseConfig:
    """Configuration for Supabase client."""

    url: str
    key: str
    anon_key: str
    jwt_secret: Optional[str] = None

    @classmethod
    def from_env(cls) -> "SupabaseConfig":
        """Create SupabaseConfig from environment variables."""
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        anon_key = os.getenv("SUPABASE_ANON_KEY")
        jwt_secret = os.getenv("SUPABASE_JWT_SECRET")
                
        if not url or not key or not anon_key:
            raise ValueError("Missing required Supabase configuration. Check SUPABASE_URL, SUPABASE_KEY, and SUPABASE_ANON_KEY environment variables.")
        
        return cls(
            url=url,
            key=key,
            anon_key=anon_key,
            jwt_secret=jwt_secret,
        )


# Global instance
supabase_config = SupabaseConfig.from_env()
