"""Notification input types"""
import strawberry
from typing import Optional


@strawberry.input
class CreateNotificationInput:
    """Input for creating a notification"""
    
    user_id: str
    title: str
    message: str
    type: str
    metadata: Optional[str] = None


@strawberry.input
class MarkNotificationReadInput:
    """Input for marking a notification as read"""
    
    notification_id: str
