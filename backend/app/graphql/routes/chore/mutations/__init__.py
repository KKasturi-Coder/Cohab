"""Chore mutation resolvers"""
import strawberry
from .create_chore import create_chore
from .update_chore import update_chore
from .delete_chore import delete_chore
from .create_chore_assignment import create_chore_assignment
from .complete_chore_assignment import complete_chore_assignment
from .delete_chore_assignment import delete_chore_assignment


@strawberry.type
class ChoreMutations:
    """Chore related mutations"""
    
    create_chore = create_chore
    update_chore = update_chore
    delete_chore = delete_chore
    create_chore_assignment = create_chore_assignment
    complete_chore_assignment = complete_chore_assignment
    delete_chore_assignment = delete_chore_assignment


__all__ = [
    "ChoreMutations",
    "create_chore",
    "update_chore",
    "delete_chore",
    "create_chore_assignment",
    "complete_chore_assignment",
    "delete_chore_assignment",
]
