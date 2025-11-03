"""Chore query resolvers"""
import strawberry
from .chore import chore
from .household_chores import household_chores
from .my_chore_assignments import my_chore_assignments
from .household_chore_assignments import household_chore_assignments


@strawberry.type
class ChoreQueries:
    """Chore related queries"""
    
    chore = chore
    household_chores = household_chores
    my_chore_assignments = my_chore_assignments
    household_chore_assignments = household_chore_assignments


__all__ = [
    "ChoreQueries",
    "chore",
    "household_chores",
    "my_chore_assignments",
    "household_chore_assignments",
]
