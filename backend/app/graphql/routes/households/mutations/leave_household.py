"""Leave household mutation resolver"""
import strawberry
from app.graphql.info import Info


@strawberry.mutation
async def leave_household(
    info: Info,
    household_id: str
) -> bool:
    """Leave a household"""
    context = info.context
    
    if not context.user_id:
        raise Exception("Not authenticated")
    
    # Update roommate status
    update_data = {"status": "left"}
    await context.supabase.table("roommates").update(update_data).eq("user_id", context.user_id).eq("household_id", household_id).execute()
    
    return True
