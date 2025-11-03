"""Notification mutation resolvers"""
import strawberry
from .mark_notification_read import mark_notification_read
from .mark_all_notifications_read import mark_all_notifications_read


@strawberry.type
class NotificationMutations:
    """Notification related mutations"""
    
    mark_notification_read = mark_notification_read
    mark_all_notifications_read = mark_all_notifications_read


__all__ = [
    "NotificationMutations",
    "mark_notification_read",
    "mark_all_notifications_read",
]
