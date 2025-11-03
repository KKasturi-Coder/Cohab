"""Get single chore query resolver"""
import strawberry
from typing import Optional
from ....types import Chore
from app.graphql.info import Info
from app.graphql.utils.field_selectors import get_requested_db_fields
from app.graphql.utils.parsers import parse_datetime_fields


@strawberry.field
async def chore(
    info: Info, 
    chore_id: str
) -> Optional[Chore]:
    """Get a single chore by ID"""
    context = info.context
    
    fields = get_requested_db_fields(Chore, info)
    result = await context.supabase.table("chores").select(fields).eq("id", chore_id).execute()
    
    if result.data:
        return Chore(**parse_datetime_fields(result.data[0], "created_at", "updated_at"))
    return None
