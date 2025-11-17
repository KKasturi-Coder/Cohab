"""Profile input types"""
import strawberry
from typing import Optional


@strawberry.input
class UpdateProfileInput:
    """Input for updating a user profile"""
    
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    
    # Payment handles
    venmo_handle: Optional[str] = None
    paypal_email: Optional[str] = None
    cashapp_handle: Optional[str] = None
    zelle_email: Optional[str] = None
    preferred_payment_method: Optional[str] = None
