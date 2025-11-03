"""Get profile query resolver"""
import strawberry
from typing import Optional
from ....types import Profile
from app.graphql.info import Info
from app.graphql.utils.field_selectors import get_requested_db_fields


@strawberry.field
async def profile(info: Info, user_id: str) -> Optional[Profile]:
    """Get a user profile by ID"""
    context = info.context
    
    fields = get_requested_db_fields(Profile, info)
    result = await context.supabase.table("profiles").select(fields).eq("id", user_id).execute()
    
    if result.data:
        return Profile(**result.data[0])
    return None
