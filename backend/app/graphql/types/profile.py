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
