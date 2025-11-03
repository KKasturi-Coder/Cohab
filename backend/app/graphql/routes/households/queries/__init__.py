"""Room query resolvers"""
import strawberry
from .household import household
from .list import list as list_households
from .my_households import my_households


@strawberry.type
class HouseholdQueries:
    """Room related queries"""
    
    household = household
    list = list_households
    my_households = my_households


__all__ = [
    "HouseholdQueries",
    "household",
    "list_households",
    "my_households",
]
