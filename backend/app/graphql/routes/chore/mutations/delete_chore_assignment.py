"""Delete chore assignment mutation resolver"""
import strawberry
from app.graphql.info import Info


@strawberry.mutation
async def delete_chore_assignment(
    info: Info,
    assignment_id: str
) -> bool:
    """Delete a chore assignment"""
    context = info.context
    
    if not context.user_id:
        raise Exception("Not authenticated")
    
    # Get the assignment to verify access
    assignment_result = await context.supabase.table("chore_assignments").select(
        "*, chores:chore_id(household_id)"
    ).eq("id", assignment_id).execute()
    
    if not assignment_result.data:
        raise Exception("Assignment not found")
    
    household_id = assignment_result.data[0]["chores"]["household_id"]
    
    # Verify user is in the household
    roommate_result = await context.supabase.table("roommates").select("*").eq("user_id", context.user_id).eq("household_id", household_id).eq("status", "accepted").execute()
    
    if not roommate_result.data:
        raise Exception("Not a member of this household")
    
    # Delete the assignment
    await context.supabase.table("chore_assignments").delete().eq("id", assignment_id).execute()
    
    return True
