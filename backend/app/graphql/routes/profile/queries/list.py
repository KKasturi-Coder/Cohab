"""List profiles query resolver"""
import strawberry
from typing import List
from ....types import Profile
from app.graphql.info import Info
from app.graphql.utils.field_selectors import get_requested_db_fields


@strawberry.field
async def list(info: Info, limit: int = 10) -> List[Profile]:
    """Get all profiles"""
    context = info.context
    
    fields = get_requested_db_fields(Profile, info)
    result = await context.supabase.table("profiles").select(fields).limit(limit).execute()
    
    return [Profile(**profile) for profile in result.data]
