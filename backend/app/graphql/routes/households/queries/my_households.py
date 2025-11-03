"""Get my households query resolver"""
import strawberry
from typing import List
from ....types import Room
from app.graphql.info import Info


@strawberry.field
async def my_households(info: Info) -> List[Room]:
    """Get households created by or joined by current user"""
    context = info.context
    
    if not context.user_id:
        return []
    
    # Get households where user is a roommate
    roommate_result = await context.supabase.table("roommates").select("household_id").eq("user_id", context.user_id).eq("status", "active").execute()
    
    if not roommate_result.data:
        return []
    
    household_ids = [r["household_id"] for r in roommate_result.data]
    
    # Get the actual household data
    result = await context.supabase.table("households").select("*").in_("id", household_ids).execute()
    
    return [Room(**household) for household in result.data]
