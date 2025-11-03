"""Message input types"""
import strawberry
from typing import Optional


@strawberry.input
class CreateMessageInput:
    """Input for creating a new message"""
    
    household_id: str
    content: str
    message_type: Optional[str] = "text"
    metadata: Optional[str] = None
