"""Get household query resolver"""
import strawberry
from typing import Optional
from ....types import Room
from app.graphql.info import Info
from app.graphql.utils.field_selectors import get_requested_db_fields


@strawberry.field
async def household(info: Info, household_id: str) -> Optional[Room]:
    """Get a household by ID"""
    context = info.context
    
    fields = get_requested_db_fields(Room, info)
    result = await context.supabase.table("households").select(fields).eq("id", household_id).execute()
    
    if result.data:
        return Room(**result.data[0])
    return None
