"""Join household mutation resolver"""
import strawberry
from app.graphql.info import Info


@strawberry.mutation
async def join_household(
    info: Info,
    household_id: str
) -> bool:
    """Join a household as a roommate"""
    context = info.context
    
    if not context.user_id:
        raise Exception("Not authenticated")
    
    # Check if household exists and is available
    household_result = await context.supabase.table("households").select("is_available").eq("id", household_id).execute()
    
    if not household_result.data:
        raise Exception("Room not found")
    
    if not household_result.data[0]["is_available"]:
        raise Exception("Room is not available")
    
    # Check if already a roommate
    existing = await context.supabase.table("roommates").select("*").eq("user_id", context.user_id).eq("household_id", household_id).execute()
    
    if existing.data:
        raise Exception("Already a member of this household")
    
    # Add as roommate
    roommate_data = {
        "user_id": context.user_id,
        "household_id": household_id,
        "status": "active",
    }
    await context.supabase.table("roommates").insert(roommate_data).execute()
    
    return True
