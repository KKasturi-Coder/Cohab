"""Create chore mutation resolver"""
import strawberry
from typing import Optional
from ....types import Chore
from ..inputs import CreateChoreInput
from app.graphql.info import Info
from app.graphql.utils.parsers import parse_datetime_fields


@strawberry.mutation
async def create_chore(
    info: Info,
    input: CreateChoreInput
) -> Optional[Chore]:
    """Create a new chore template"""
    context = info.context
    
    if not context.user_id:
        raise Exception("Not authenticated")
    
    # Verify user is in the household
    roommate_result = await context.supabase.table("roommates").select("*").eq("user_id", context.user_id).eq("household_id", input.household_id).eq("status", "accepted").execute()
    
    if not roommate_result.data:
        raise Exception("Not a member of this household")
    
    # Create chore
    chore_data = {
        "household_id": input.household_id,
        "title": input.title,
        "description": input.description,
        "recurrence": input.recurrence,
        "points": input.points,
        "requires_proof": input.requires_proof,
        "created_by": context.user_id,
    }
    
    result = await context.supabase.table("chores").insert(chore_data).execute()
    
    if result.data:
        chore_data = parse_datetime_fields(result.data[0], "created_at", "updated_at")
        return Chore(**chore_data)
    return None
