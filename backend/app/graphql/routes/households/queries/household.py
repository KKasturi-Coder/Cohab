"""Get household query resolver"""
import strawberry
from typing import Optional
from ....types import Household
from app.graphql.info import Info
from app.graphql.utils.field_selectors import get_requested_db_fields
from app.graphql.utils.parsers import parse_datetime_fields


@strawberry.field
async def household(info: Info, household_id: str) -> Optional[Household]:
    """Get a household by ID"""
    context = info.context
    
    fields = get_requested_db_fields(Household, info)
    result = await context.supabase.table("households").select(fields).eq("id", household_id).execute()
    
    if result.data:
        household_data = parse_datetime_fields(result.data[0], "created_at", "updated_at")
        return Household(**household_data)
    return None
