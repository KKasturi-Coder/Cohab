"""Profile input types"""
import strawberry
from typing import Optional


@strawberry.input
class UpdateProfileInput:
    """Input for updating a user profile"""
    
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
