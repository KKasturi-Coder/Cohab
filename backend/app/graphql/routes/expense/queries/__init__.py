"""Expense query resolvers"""
import strawberry
from .expense import expense
from .household_expenses import household_expenses
from .my_expenses import my_expenses
from .expense_splits import expense_splits


@strawberry.type
class ExpenseQueries:
    """Expense related queries"""
    
    expense = expense
    household_expenses = household_expenses
    my_expenses = my_expenses
    expense_splits = expense_splits


__all__ = [
    "ExpenseQueries",
    "expense",
    "household_expenses",
    "my_expenses",
    "expense_splits",
]
