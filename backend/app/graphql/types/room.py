"""Room GraphQL type"""
import strawberry
from typing import Optional, List
from datetime import datetime


@strawberry.type
class Room:
    """Room/living space type"""
    
    id: strawberry.ID
    name: str
    description: Optional[str] = None
    address: Optional[str] = None
    rent_amount: Optional[float] = None
    currency: Optional[str] = None
    room_type: Optional[str] = None
    amenities: Optional[List[str]] = None
    images: Optional[List[str]] = None
    is_available: bool
    created_by: str
    created_at: datetime
    updated_at: datetime
