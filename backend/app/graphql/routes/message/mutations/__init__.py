"""Message mutation resolvers"""
import strawberry
from .send_message import send_message


@strawberry.type
class MessageMutations:
    """Message related mutations"""
    
    send_message = send_message


__all__ = [
    "MessageMutations",
    "send_message",
]
