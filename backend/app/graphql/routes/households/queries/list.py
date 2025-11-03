"""List households query resolver"""
import strawberry
from typing import List
from ....types import Household
from app.graphql.info import Info
from app.graphql.utils.field_selectors import get_requested_db_fields
from app.graphql.utils.parsers import parse_datetime_fields


@strawberry.field
async def list(
    info: Info, 
    available_only: bool = False,
    limit: int = 10
) -> List[Household]:
    """Get all households"""
    context = info.context
    
    fields = get_requested_db_fields(Household, info)
    query = context.supabase.table("households").select(fields)
    
    if available_only:
        query = query.eq("is_available", True)
    
    result = await query.limit(limit).execute()
    
    return [Household(**parse_datetime_fields(household, "created_at", "updated_at")) for household in result.data]
