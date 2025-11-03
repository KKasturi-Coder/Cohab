"""Mark notification read mutation resolver"""
import strawberry
from ..inputs import MarkNotificationReadInput
from app.graphql.info import Info


@strawberry.mutation
async def mark_notification_read(
    info: Info,
    input: MarkNotificationReadInput
) -> bool:
    """Mark a notification as read"""
    context = info.context
    
    if not context.user_id:
        raise Exception("Not authenticated")
    
    # Verify user owns this notification
    notif_result = await context.supabase.table("notifications").select("user_id").eq("id", input.notification_id).execute()
    
    if not notif_result.data or notif_result.data[0]["user_id"] != context.user_id:
        raise Exception("Not authorized")
    
    # Update notification
    update_data = {"is_read": True}
    await context.supabase.table("notifications").update(update_data).eq("id", input.notification_id).execute()
    
    return True
