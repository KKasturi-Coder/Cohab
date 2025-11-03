"""Roommate GraphQL type"""
import strawberry
from typing import Optional
from datetime import datetime


@strawberry.type
class Roommate:
    """Roommate association type"""
    
    id: Optional[strawberry.ID] = None
    user_id: Optional[str] = None
    household_id: Optional[str] = None
    status: Optional[str] = None  # pending, active, left
    joined_at: Optional[datetime] = None
    left_at: Optional[datetime] = None
