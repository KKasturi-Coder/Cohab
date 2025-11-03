"""Expense GraphQL types"""
import strawberry
from typing import Optional
from datetime import datetime


@strawberry.type
class Expense:
    """Expense tracking type"""
    
    id: strawberry.ID
    household_id: str
    title: str
    description: Optional[str] = None
    amount: float
    currency: Optional[str] = None
    category: Optional[str] = None
    paid_by: str
    created_at: datetime
    due_date: Optional[datetime] = None


@strawberry.type
class ExpenseSplit:
    """Expense split between roommates"""
    
    id: strawberry.ID
    expense_id: str
    user_id: str
    amount: float
    is_paid: bool
    paid_at: Optional[datetime] = None
