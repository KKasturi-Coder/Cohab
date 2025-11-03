"""Get my households query resolver"""
import strawberry
from typing import List
from ....types import Household
from app.graphql.info import Info
from app.graphql.utils.field_selectors import get_requested_db_fields
from app.graphql.utils.parsers import parse_datetime_fields


@strawberry.field
async def my_households(info: Info) -> List[Household]:
    """Get households created by or joined by current user"""
    context = info.context
    
    if not context.user_id:
        return []
    
    # Get households where user is a roommate
    roommate_result = await context.supabase.table("roommates").select("household_id").eq("user_id", context.user_id).eq("status", "accepted").execute()
    
    if not roommate_result.data:
        return []
    
    household_ids = [r["household_id"] for r in roommate_result.data]
    
    # Get the actual household data
    fields = get_requested_db_fields(Household, info)
    result = await context.supabase.table("households").select(fields).in_("id", household_ids).execute()
    
    return [Household(**parse_datetime_fields(household, "created_at", "updated_at")) for household in result.data]
