"""Notification query resolvers"""
import strawberry
from .my_notifications import my_notifications


@strawberry.type
class NotificationQueries:
    """Notification related queries"""
    
    my_notifications = my_notifications


__all__ = [
    "NotificationQueries",
    "my_notifications",
]
