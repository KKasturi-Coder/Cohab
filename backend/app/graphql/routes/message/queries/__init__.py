"""Message query resolvers"""
import strawberry
from .household_messages import household_messages


@strawberry.type
class MessageQueries:
    """Message related queries"""
    
    household_messages = household_messages


__all__ = [
    "MessageQueries",
    "household_messages",
]
