"""Notification domain resolvers"""
from .queries import NotificationQueries
from .mutations import NotificationMutations
from .inputs import CreateNotificationInput, MarkNotificationReadInput

__all__ = [
    "NotificationQueries",
    "NotificationMutations",
    "CreateNotificationInput",
    "MarkNotificationReadInput",
]
