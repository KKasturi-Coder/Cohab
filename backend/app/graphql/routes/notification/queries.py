"""Notification query resolvers"""
import strawberry
from typing import List
from ...types import Notification
from ...context import CustomContext


@strawberry.type
class NotificationQueries:
    """Notification related queries"""
    
    @strawberry.field
    async def my_notifications(
        self, 
        info: strawberry.Info[CustomContext, None],
        unread_only: bool = False,
        limit: int = 20
    ) -> List[Notification]:
        """Get notifications for current user"""
        context = info.context
        
        if not context.user_id:
            return []
        
        query = context.supabase.table("notifications").select("*").eq("user_id", context.user_id)
        
        if unread_only:
            query = query.eq("is_read", False)
        
        result = query.order("created_at", desc=True).limit(limit).execute()
        
        return [Notification(**notification) for notification in result.data]
