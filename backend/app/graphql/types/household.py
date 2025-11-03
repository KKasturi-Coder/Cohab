"""Room GraphQL type"""
import strawberry
from typing import Optional, List
from datetime import datetime


@strawberry.type
class Room:
    """Room/living space type"""
    
    id: Optional[strawberry.ID] = None
    name: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    rent_amount: Optional[float] = None
    currency: Optional[str] = None
    household_type: Optional[str] = None
    amenities: Optional[List[str]] = None
    images: Optional[List[str]] = None
    is_available: Optional[bool] = None
    created_by: Optional[str] = None
    created_at:  Optional[datetime] = None
    updated_at: Optional[datetime] = None
    invite_code: Optional[str] = None
