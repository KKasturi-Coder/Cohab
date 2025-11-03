"""Expense mutation resolvers"""
import strawberry
from .create_expense import create_expense
from .update_expense import update_expense
from .mark_expense_paid import mark_expense_paid
from .delete_expense import delete_expense


@strawberry.type
class ExpenseMutations:
    """Expense related mutations"""
    
    create_expense = create_expense
    update_expense = update_expense
    mark_expense_paid = mark_expense_paid
    delete_expense = delete_expense


__all__ = [
    "ExpenseMutations",
    "create_expense",
    "update_expense",
    "mark_expense_paid",
    "delete_expense",
]
