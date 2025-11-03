"""Profile schema combining queries and mutations"""
import strawberry
from .queries import ProfileQueries
from .mutations import ProfileMutations


@strawberry.type
class ProfilesQueries(ProfileQueries):
    """Combined Profile queries and mutations"""
    pass
@strawberry.type
class ProfilesMutations(ProfileMutations):
    """Combined Profile queries and mutations"""
    pass