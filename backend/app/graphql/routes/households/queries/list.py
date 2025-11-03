"""List households query resolver"""
import strawberry
from typing import List
from ....types import Room
from app.graphql.info import Info


@strawberry.field
async def list(
    info: Info, 
    available_only: bool = False,
    limit: int = 10
) -> List[Room]:
    """Get all households"""
    context = info.context
    
    query = context.supabase.table("households").select("*")
    
    if available_only:
        query = query.eq("is_available", True)
    
    result = await query.limit(limit).execute()
    
    return [Room(**household) for household in result.data]
