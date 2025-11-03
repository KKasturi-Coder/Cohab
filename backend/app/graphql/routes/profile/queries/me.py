"""Get my profile query resolver"""
import strawberry
from typing import Optional
from ....types import Profile
from app.graphql.info import Info
from app.graphql.utils.field_selectors import get_requested_db_fields


@strawberry.field
async def me(info: Info) -> Optional[Profile]:
    """Get current user's profile"""
    context = info.context
    
    if not context.user_id:
        return None
    
    fields = get_requested_db_fields(Profile, info)
    result = await context.supabase.table("profiles").select(fields).eq("id", context.user_id).execute()
    
    if result.data:
        return Profile(**result.data[0])
    return None
