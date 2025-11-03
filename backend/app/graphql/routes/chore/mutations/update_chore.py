"""Update chore mutation resolver"""
import strawberry
from typing import Optional
from ....types import Chore
from ..inputs import UpdateChoreInput
from app.graphql.info import Info
from app.graphql.utils.parsers import parse_datetime_fields


@strawberry.mutation
async def update_chore(
    info: Info,
    chore_id: str,
    input: UpdateChoreInput
) -> Optional[Chore]:
    """Update a chore template"""
    context = info.context
    
    if not context.user_id:
        raise Exception("Not authenticated")
    
    # Get the chore to verify household membership
    chore_result = await context.supabase.table("chores").select("household_id").eq("id", chore_id).execute()
    
    if not chore_result.data:
        raise Exception("Chore not found")
    
    household_id = chore_result.data[0]["household_id"]
    
    # Verify user is in the household
    roommate_result = await context.supabase.table("roommates").select("*").eq("user_id", context.user_id).eq("household_id", household_id).eq("status", "accepted").execute()
    
    if not roommate_result.data:
        raise Exception("Not a member of this household")
    
    # Build update data
    update_data = {}
    if input.title is not None:
        update_data["title"] = input.title
    if input.description is not None:
        update_data["description"] = input.description
    if input.recurrence is not None:
        update_data["recurrence"] = input.recurrence
    if input.points is not None:
        update_data["points"] = input.points
    if input.requires_proof is not None:
        update_data["requires_proof"] = input.requires_proof
    
    if not update_data:
        raise Exception("No fields to update")
    
    # Note: updated_at is automatically set by database trigger
    result = await context.supabase.table("chores").update(update_data).eq("id", chore_id).execute()
    
    if result.data:
        chore_data = parse_datetime_fields(result.data[0], "created_at", "updated_at")
        return Chore(**chore_data)
    return None
