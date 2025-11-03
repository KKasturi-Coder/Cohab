"""Profile GraphQL type"""
import strawberry
from typing import Optional
from datetime import datetime


@strawberry.type
class Profile:
    """User profile type"""
    
    id: strawberry.ID
    email: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    created_at: datetime
    updated_at: datetime
