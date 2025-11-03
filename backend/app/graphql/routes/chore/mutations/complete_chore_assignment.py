"""Complete chore assignment mutation resolver"""
import strawberry
from typing import Optional
from datetime import datetime, timezone
from ....types import ChoreAssignment, Chore, Profile
from ..inputs import CompleteChoreAssignmentInput
from app.graphql.info import Info
from app.graphql.utils.parsers import parse_datetime_fields, datetime_to_iso


@strawberry.mutation
async def complete_chore_assignment(
    info: Info,
    input: CompleteChoreAssignmentInput
) -> Optional[ChoreAssignment]:
    """Mark a chore assignment as complete"""
    context = info.context
    
    if not context.user_id:
        raise Exception("Not authenticated")
    
    # Get the assignment
    assignment_result = await context.supabase.table("chore_assignments").select(
        "*, chores:chore_id(*)"
    ).eq("id", input.assignment_id).execute()
    
    if not assignment_result.data:
        raise Exception("Assignment not found")
    
    assignment = assignment_result.data[0]
    
    # Verify user owns this assignment
    if assignment["user_id"] != context.user_id:
        raise Exception("You can only complete your own chore assignments")
    
    # Check if chore requires proof
    if assignment["chores"]["requires_proof"] and not input.proof_url:
        raise Exception("This chore requires proof of completion")
    
    # Update assignment
    update_data = {
        "is_complete": True,
        "completed_at": datetime_to_iso(datetime.now(timezone.utc)),
    }
    
    if input.proof_url:
        update_data["proof_url"] = input.proof_url
    
    result = await context.supabase.table("chore_assignments").update(update_data).eq("id", input.assignment_id).execute()
    
    if result.data:
        # Get the full user data
        user_result = await context.supabase.table("profiles").select("*").eq("id", assignment["user_id"]).execute()
        
        chore_data = parse_datetime_fields(assignment["chores"], "created_at", "updated_at")
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
