"""Message schema combining queries and mutations"""
import strawberry
from .queries import MessageQueries
from .mutations import MessageMutations


@strawberry.type
class MessagesQueries(MessageQueries):
    """Combined Message queries and mutations"""
    pass

@strawberry.type
class MessagesMutations(MessageMutations):
    """Combined Message queries and mutations"""
    pass
