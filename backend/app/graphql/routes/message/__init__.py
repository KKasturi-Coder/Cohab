"""Message domain resolvers"""
from .queries import MessageQueries
from .mutations import MessageMutations
from .inputs import CreateMessageInput

__all__ = [
    "MessageQueries",
    "MessageMutations",
    "CreateMessageInput",
]
