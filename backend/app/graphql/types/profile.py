"""Profile GraphQL type"""
import strawberry
from typing import Optional
from datetime import datetime


@strawberry.type
class Profile:
    """User profile type"""
    
    id: Optional[strawberry.ID] = None
    email: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    points: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    # Payment handles for sending/receiving money
    venmo_handle: Optional[str] = None
    paypal_email: Optional[str] = None
    cashapp_handle: Optional[str] = None
    zelle_email: Optional[str] = None
    preferred_payment_method: Optional[str] = None
