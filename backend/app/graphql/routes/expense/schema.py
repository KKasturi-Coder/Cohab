"""Expense schema combining queries and mutations"""
import strawberry
from .queries import ExpenseQueries
from .mutations import ExpenseMutations


@strawberry.type
class ExpensesQueries(ExpenseQueries):
    """Combined Expense queries and mutations"""
    pass

@strawberry.type
class ExpensesMutations(ExpenseMutations):
    """Combined Expense queries and mutations"""
    pass
