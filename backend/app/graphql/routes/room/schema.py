"""Room schema combining queries and mutations"""
import strawberry
from .queries import RoomQueries
from .mutations import RoomMutations


@strawberry.type
class RoomsQueries(RoomQueries):
    """Combined Room queries and mutations"""
    pass

@strawberry.type
class RoomsMutations(RoomMutations):
    """Combined Room queries and mutations"""
    pass
