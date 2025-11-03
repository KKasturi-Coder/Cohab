"""Profile query resolvers"""
import strawberry
from .profile import profile
from .me import me
from .list import list as list_profiles


@strawberry.type
class ProfileQueries:
    """Profile related queries"""
    
    profile = profile
    me = me
    list = list_profiles


__all__ = [
    "ProfileQueries",
    "profile",
    "me",
    "list_profiles",
]
