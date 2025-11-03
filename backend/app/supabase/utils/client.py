"""Supabase client utilities for per-request authentication."""

from supabase import AsyncClient, AsyncClientOptions, create_async_client

from app.supabase.config import supabase_config


async def get_supabase() -> AsyncClient:
    """
    Create a new Supabase client instance.

    This is deprecated in favor of per-request clients via GraphQL context.
    For REST endpoints, use this but call set_session() with the user's token.

    Returns:
        AsyncClient: A new Supabase client instance
    """
    return await create_async_client(supabase_config.url, supabase_config.key)


async def create_authenticated_client(token: str) -> AsyncClient:
    """
    Create a new Supabase client authenticated with the given token.

    This function creates a brand new client instance for each request
    and authenticates it with the user's JWT token. This ensures proper
    isolation between requests and correct RLS enforcement.

    Args:
        token: JWT token from the Authorization header

    Returns:
        AsyncClient: Authenticated Supabase client instance
    """
    
    if not token or token == "":
        return await create_async_client(supabase_config.url, supabase_config.anon_key)

    return await create_async_client(
        supabase_config.url,
        supabase_config.anon_key,
        options=AsyncClientOptions(
            headers={"Authorization": f"Bearer {token}"},
            auto_refresh_token=False,
            persist_session=False,
        ),
    )
