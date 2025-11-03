"""Roommate GraphQL type"""
import strawberry
from typing import Optional
from datetime import datetime


@strawberry.type
class Roommate:
    """Roommate association type"""
    
    id: strawberry.ID
    user_id: str
    household_id: str
    status: str  # pending, active, left
    joined_at: Optional[datetime] = None
    left_at: Optional[datetime] = None
