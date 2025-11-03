"""Mark all notifications read mutation resolver"""
import strawberry
from app.graphql.info import Info


@strawberry.mutation
async def mark_all_notifications_read(
    info: Info
) -> bool:
    """Mark all notifications as read for current user"""
    context = info.context
    
    if not context.user_id:
        raise Exception("Not authenticated")
    
    # Update all notifications
    update_data = {"is_read": True}
    await context.supabase.table("notifications").update(update_data).eq("user_id", context.user_id).eq("is_read", False).execute()
    
    return True
