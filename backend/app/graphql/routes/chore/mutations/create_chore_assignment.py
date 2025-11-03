"""Create chore assignment mutation resolver"""
import strawberry
from typing import Optional
from ....types import ChoreAssignment, Chore, Profile
from ..inputs import CreateChoreAssignmentInput
from app.graphql.info import Info
from app.graphql.utils.parsers import parse_datetime_fields, datetime_to_iso


@strawberry.mutation
async def create_chore_assignment(
    info: Info,
    input: CreateChoreAssignmentInput
) -> Optional[ChoreAssignment]:
    """Create a new chore assignment"""
    context = info.context
    
    if not context.user_id:
        raise Exception("Not authenticated")
    
    # Get the chore to verify household membership
    chore_result = await context.supabase.table("chores").select("*").eq("id", input.chore_id).execute()
    
    if not chore_result.data:
        raise Exception("Chore not found")
    
    household_id = chore_result.data[0]["household_id"]
    
    # Verify user is in the household
    roommate_result = await context.supabase.table("roommates").select("*").eq("user_id", context.user_id).eq("household_id", household_id).eq("status", "accepted").execute()
    
    if not roommate_result.data:
        raise Exception("Not a member of this household")
    
    # Verify assigned user is in the household
    assigned_roommate = await context.supabase.table("roommates").select("*").eq("user_id", input.user_id).eq("household_id", household_id).eq("status", "accepted").execute()
    
    if not assigned_roommate.data:
        raise Exception("Assigned user is not a member of this household")
    
    # Create assignment
    assignment_data = {
        "chore_id": input.chore_id,
        "user_id": input.user_id,
        "due_date": datetime_to_iso(input.due_date),
    }
    
    result = await context.supabase.table("chore_assignments").insert(assignment_data).execute()
    
    if result.data:
        # Get the full chore and user data
        user_result = await context.supabase.table("profiles").select("*").eq("id", input.user_id).execute()
        
        chore_data = parse_datetime_fields(chore_result.data[0], "created_at", "updated_at")
        user_data = parse_datetime_fields(user_result.data[0], "created_at", "updated_at")
        assignment_data = parse_datetime_fields(result.data[0], "due_date", "completed_at", "created_at")
        
        return ChoreAssignment(
            id=assignment_data["id"],
            chore=Chore(**chore_data),
            user=Profile(**user_data),
            due_date=assignment_data["due_date"],
            is_complete=assignment_data["is_complete"],
            completed_at=assignment_data.get("completed_at"),
            proof_url=assignment_data.get("proof_url"),
            created_at=assignment_data["created_at"]
        )
    return None
