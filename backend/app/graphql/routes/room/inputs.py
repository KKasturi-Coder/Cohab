"""Room input types"""
import strawberry
from typing import Optional, List


@strawberry.input
class CreateRoomInput:
    """Input for creating a new room"""
    
    name: str
    description: Optional[str] = None
    address: Optional[str] = None
    rent_amount: Optional[float] = None
    currency: Optional[str] = "USD"
    room_type: Optional[str] = None
    amenities: Optional[List[str]] = None
    images: Optional[List[str]] = None


@strawberry.input
class UpdateRoomInput:
    """Input for updating a room"""
    
    name: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    rent_amount: Optional[float] = None
    currency: Optional[str] = None
    room_type: Optional[str] = None
    amenities: Optional[List[str]] = None
    images: Optional[List[str]] = None
    is_available: Optional[bool] = None
