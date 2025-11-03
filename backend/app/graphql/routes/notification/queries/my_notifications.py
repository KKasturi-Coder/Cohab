"""Get my notifications query resolver"""
import strawberry
from typing import List
from ....types import Notification
from app.graphql.info import Info
from app.graphql.utils.field_selectors import get_requested_db_fields
from app.graphql.utils.parsers import parse_datetime_fields


@strawberry.field
async def my_notifications(
    info: Info,
    unread_only: bool = False,
    limit: int = 20
) -> List[Notification]:
    """Get notifications for current user"""
    context = info.context
    
    if not context.user_id:
        return []
    
    fields = get_requested_db_fields(Notification, info)
    query = context.supabase.table("notifications").select(fields).eq("user_id", context.user_id)
    
    if unread_only:
        query = query.eq("is_read", False)
    
    result = await query.order("created_at", desc=True).limit(limit).execute()
    
    return [Notification(**parse_datetime_fields(notification, "created_at")) for notification in result.data]
