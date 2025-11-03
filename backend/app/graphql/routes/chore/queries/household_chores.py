"""Get household chores query resolver"""
import strawberry
from typing import List
from ....types import Chore
from app.graphql.info import Info
from app.graphql.utils.field_selectors import get_requested_db_fields
from app.graphql.utils.parsers import parse_datetime_fields


@strawberry.field
async def household_chores(
    info: Info, 
    household_id: str,
    limit: int = 50
) -> List[Chore]:
    """Get all chores for a household"""
    context = info.context
    
    fields = get_requested_db_fields(Chore, info)
    result = await context.supabase.table("chores").select(fields).eq("household_id", household_id).order("created_at", desc=True).limit(limit).execute()
    
    return [Chore(**parse_datetime_fields(chore, "created_at", "updated_at")) for chore in result.data]
