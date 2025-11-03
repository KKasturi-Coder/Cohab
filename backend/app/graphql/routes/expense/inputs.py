"""Expense input types"""
import strawberry
from typing import Optional, List
from datetime import datetime


@strawberry.input
class CreateExpenseInput:
    """Input for creating a new expense"""
    
    household_id: str
    title: str
    description: Optional[str] = None
    amount: float
    currency: Optional[str] = "USD"
    category: Optional[str] = None
    due_date: Optional[datetime] = None
    split_with: List[str]  # List of user IDs to split with


@strawberry.input
class UpdateExpenseInput:
    """Input for updating an expense"""
    
    title: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    category: Optional[str] = None
    due_date: Optional[datetime] = None


@strawberry.input
class MarkExpensePaidInput:
    """Input for marking an expense split as paid"""
    
    expense_split_id: str
