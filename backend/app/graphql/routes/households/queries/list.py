"""List households query resolver"""
import strawberry
from typing import List
from ....types import Room
from app.graphql.info import Info
from app.graphql.utils.field_selectors import get_requested_db_fields


@strawberry.field
async def list(
    info: Info, 
    available_only: bool = False,
    limit: int = 10
) -> List[Room]:
    """Get all households"""
    context = info.context
    
    fields = get_requested_db_fields(Room, info)
    query = context.supabase.table("households").select(fields)
    
    if available_only:
        query = query.eq("is_available", True)
    
    result = await query.limit(limit).execute()
    
    return [Room(**household) for household in result.data]
