"""Profile mutation resolvers"""
import strawberry
from .update_profile import update_profile


@strawberry.type
class ProfileMutations:
    """Profile related mutations"""
    
    update_profile = update_profile


__all__ = [
    "ProfileMutations",
    "update_profile",
]
