"""List profiles query resolver"""
import strawberry
from typing import List
from ....types import Profile
from app.graphql.info import Info


@strawberry.field
async def list(info: Info, limit: int = 10) -> List[Profile]:
    """Get all profiles"""
    context = info.context
    
    result = await context.supabase.table("profiles").select("*").limit(limit).execute()
    
    return [Profile(**profile) for profile in result.data]
