"""Notification mutation resolvers"""
import strawberry
from .inputs import MarkNotificationReadInput
from ...context import CustomContext


@strawberry.type
class NotificationMutations:
    """Notification related mutations"""
    
    @strawberry.mutation
    async def mark_notification_read(
        self, 
        info: strawberry.Info[CustomContext, None],
        input: MarkNotificationReadInput
    ) -> bool:
        """Mark a notification as read"""
        context = info.context
        
        if not context.user_id:
            raise Exception("Not authenticated")
        
        # Verify user owns this notification
        notif_result = context.supabase.table("notifications").select("user_id").eq("id", input.notification_id).execute()
        
        if not notif_result.data or notif_result.data[0]["user_id"] != context.user_id:
            raise Exception("Not authorized")
        
        # Update notification
        update_data = {"is_read": True}
        context.supabase.table("notifications").update(update_data).eq("id", input.notification_id).execute()
        
        return True
    
    @strawberry.mutation
    async def mark_all_notifications_read(
        self, 
        info: strawberry.Info[CustomContext, None]
    ) -> bool:
        """Mark all notifications as read for current user"""
        context = info.context
        
        if not context.user_id:
            raise Exception("Not authenticated")
        
        # Update all notifications
        update_data = {"is_read": True}
        context.supabase.table("notifications").update(update_data).eq("user_id", context.user_id).eq("is_read", False).execute()
        
        return True
