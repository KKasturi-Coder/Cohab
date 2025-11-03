"""Delete household mutation resolver"""
import strawberry
from app.graphql.info import Info


@strawberry.mutation
async def delete_household(
    info: Info,
    household_id: str
) -> bool:
    """Delete a household"""
    context = info.context
    
    if not context.user_id:
        raise Exception("Not authenticated")
    
    # Verify user is the creator
    household_result = await context.supabase.table("households").select("created_by").eq("id", household_id).execute()
    
    if not household_result.data or household_result.data[0]["created_by"] != context.user_id:
        raise Exception("Not authorized to delete this household")
    
    # Delete household
    await context.supabase.table("households").delete().eq("id", household_id).execute()
    
    return True
