"""Profile domain resolvers"""
from .queries import ProfileQueries
from .mutations import ProfileMutations
from .inputs import UpdateProfileInput

__all__ = [
    "ProfileQueries",
    "ProfileMutations",
    "UpdateProfileInput",
]
