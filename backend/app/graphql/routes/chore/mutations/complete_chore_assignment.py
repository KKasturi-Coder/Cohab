"""Complete chore assignment mutation resolver"""
import strawberry
from typing import Optional
from ....types import ChoreAssignment, Chore, Profile # Assuming these are defined elsewhere
from ..inputs import CompleteChoreAssignmentInput
from app.graphql.info import Info
from app.graphql.utils.parsers import parse_datetime_fields

@strawberry.mutation
async def complete_chore_assignment(
    info: Info,
    input: CompleteChoreAssignmentInput
) -> Optional[ChoreAssignment]:
    """
    Marks a chore assignment as complete and awards points to the user.
    This is handled by a single, atomic database function.
    """
    context = info.context
    
    # 1. Authenticate the user
    if not context.user_id:
        raise Exception("Not authenticated")
    
    # 2. Call the atomic RPC function
    # It handles authorization, validation, point updates, and chore completion.
    rpc_params = {
        "p_assignment_id": str(input.assignment_id),
        "p_user_id": str(context.user_id),
        "p_proof_url": input.proof_url
    }
    
    # The function will raise an exception on failure (e.g., auth error), which Strawberry will catch.
    result = await context.supabase.rpc("complete_chore_and_award_points", rpc_params).execute()
    
    if not result.data:
        # This might happen if the assignment ID was invalid or if an error occurred
        # that didn't raise a PostgreSQL exception.
        return None

    updated_assignment = result.data[0]

    # 3. Fetch nested data to fully construct the GraphQL response type
    # The RPC function only returns the 'chore_assignments' row, so we need to
    # fetch the related 'chore' and 'user' (profile) data.
    
    # Fetch the chore template
    chore_result = await context.supabase.table("chores").select("*").eq(
        "id", updated_assignment["chore_id"]
    ).single().execute()
    
    # Fetch the user's profile
    user_result = await context.supabase.table("profiles").select("*").eq(
        "id", updated_assignment["user_id"]
    ).single().execute()

    if not chore_result.data or not user_result.data:
        raise Exception("Could not retrieve full chore or user details after completion.")

    # 4. Parse and construct the final Strawberry object to return to the client
    chore_data = parse_datetime_fields(chore_result.data, "created_at", "updated_at")
    user_data = parse_datetime_fields(user_result.data, "created_at", "updated_at")
    assignment_data = parse_datetime_fields(updated_assignment, "due_date", "completed_at", "created_at")

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