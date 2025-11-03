"""Chore input types"""
import strawberry
from typing import Optional
from datetime import datetime


@strawberry.input
class CreateChoreInput:
    """Input for creating a new chore template"""
    
    household_id: str
    title: str
    description: Optional[str] = None
    recurrence: str = "none"  # 'daily', 'weekly', 'monthly', 'none'
    points: int = 10
    requires_proof: bool = False


@strawberry.input
class UpdateChoreInput:
    """Input for updating a chore template"""
    
    title: Optional[str] = None
    description: Optional[str] = None
    recurrence: Optional[str] = None
    points: Optional[int] = None
    requires_proof: Optional[bool] = None


@strawberry.input
class CreateChoreAssignmentInput:
    """Input for creating a chore assignment"""
    
    chore_id: str
    user_id: str
    due_date: datetime


@strawberry.input
class CompleteChoreAssignmentInput:
    """Input for completing a chore assignment"""
    
    assignment_id: str
    proof_url: Optional[str] = None
