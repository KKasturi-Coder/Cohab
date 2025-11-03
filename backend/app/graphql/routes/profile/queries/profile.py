"""Get profile query resolver"""
import strawberry
from typing import Optional
from ....types import Profile
from app.graphql.info import Info


@strawberry.field
async def profile(info: Info, user_id: str) -> Optional[Profile]:
    """Get a user profile by ID"""
    context = info.context
    
    result = await context.supabase.table("profiles").select("*").eq("id", user_id).execute()
    
    if result.data:
        return Profile(**result.data[0])
    return None
