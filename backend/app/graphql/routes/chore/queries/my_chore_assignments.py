"""Get my chore assignments query resolver"""
import strawberry
from typing import List
from ....types import ChoreAssignment, Chore, Profile
from app.graphql.info import Info
from app.graphql.utils.parsers import parse_datetime_fields


@strawberry.field
async def my_chore_assignments(
    info: Info,
    household_id: str,
    include_completed: bool = False,
    limit: int = 50
) -> List[ChoreAssignment]:
    """Get chore assignments for the current user"""
    context = info.context
    
    if not context.user_id:
        raise Exception("Not authenticated")
    
    # Build query
    query = context.supabase.table("chore_assignments").select(
        "*, chores:chore_id(*), profiles:user_id(*)"
    ).eq("user_id", context.user_id)
    
    # Filter by household through the chore relationship
    query = query.eq("chores.household_id", household_id)
    
    if not include_completed:
        query = query.eq("is_complete", False)
    
    result = await query.order("due_date", desc=False).limit(limit).execute()
    
    assignments = []
    for assignment in result.data:
        # Skip if chore data is missing
        if not assignment.get("chores"):
            continue
            
        # Skip if profile data is missing
        if not assignment.get("profiles"):
            continue
            
        try:
            chore_data = parse_datetime_fields(assignment["chores"], "created_at", "updated_at")
            user_data = parse_datetime_fields(assignment["profiles"], "created_at", "updated_at")
            assignment_data = parse_datetime_fields(assignment, "due_date", "completed_at", "created_at")
            
            
            assignments.append(ChoreAssignment(
                id=assignment_data["id"],
                chore=Chore(**chore_data),
                user=Profile(**user_data),
                due_date=assignment_data["due_date"],
                is_complete=assignment_data["is_complete"],
                completed_at=assignment_data.get("completed_at"),
                proof_url=assignment_data.get("proof_url"),
                created_at=assignment_data["created_at"]
            ))
        except Exception as e:
            # Log the error but don't fail the entire request
            print(f"Error processing chore assignment {assignment.get('id')}: {str(e)}")
            continue
    
    return assignments
