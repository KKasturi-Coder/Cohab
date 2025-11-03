"""Room domain resolvers"""
from .queries import RoomQueries
from .mutations import RoomMutations
from .inputs import CreateRoomInput, UpdateRoomInput

__all__ = [
    "RoomQueries",
    "RoomMutations",
    "CreateRoomInput",
    "UpdateRoomInput",
]
