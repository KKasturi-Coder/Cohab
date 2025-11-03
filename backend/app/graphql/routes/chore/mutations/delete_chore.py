"""Delete chore mutation resolver"""
import strawberry
from app.graphql.info import Info


@strawberry.mutation
async def delete_chore(
    info: Info,
    chore_id: str
) -> bool:
    """Delete a chore template and all its assignments"""
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
    
    # Delete the chore (cascade will delete assignments)
    await context.supabase.table("chores").delete().eq("id", chore_id).execute()
    
    return True
