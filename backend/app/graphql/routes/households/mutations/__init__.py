"""Room mutation resolvers"""
import strawberry
from .create_household import create_household
from .update_household import update_household
from .delete_household import delete_household
from .join_household import join_household
from .leave_household import leave_household


@strawberry.type
class HouseholdMutations:
    """Household related mutations"""
    
    create_household = create_household
    update_household = update_household
    delete_household = delete_household
    join_household = join_household
    leave_household = leave_household


__all__ = [
    "HouseholdMutations",
    "create_household",
    "update_household",
    "delete_household",
    "join_household",
    "leave_household",
]
