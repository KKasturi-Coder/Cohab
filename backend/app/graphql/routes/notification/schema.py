"""Notification schema combining queries and mutations"""
import strawberry
from .queries import NotificationQueries
from .mutations import NotificationMutations


@strawberry.type
class NotificationsQueries(NotificationQueries):
    """Combined Notification queries and mutations"""
    pass

@strawberry.type
class NotificationsMutations(NotificationMutations):
    """Combined Notification queries and mutations"""
    pass
