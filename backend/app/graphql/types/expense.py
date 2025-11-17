"""Expense GraphQL types"""
import strawberry
from typing import Optional
from datetime import datetime


@strawberry.type
class Expense:
    """Expense tracking type"""
    
    id: Optional[strawberry.ID] = None
    household_id: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    category: Optional[str] = None
    payment_url: Optional[str] = None
    payment_method: Optional[str] = None
    paid_by: Optional[str] = None
    created_at: Optional[datetime] = None
    due_date: Optional[datetime] = None


@strawberry.type
class ExpenseSplit:
    """Expense split between roommates"""
    
    id: Optional[strawberry.ID] = None
    expense_id: Optional[str] = None
    user_id: Optional[str] = None
    amount: Optional[float] = None
    is_paid: Optional[bool] = None
    paid_at: Optional[datetime] = None
    payment_url: Optional[str] = None
    payment_method: Optional[str] = None
