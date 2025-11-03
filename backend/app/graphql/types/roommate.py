"""Roommate GraphQL type"""
import strawberry
from typing import Optional
from datetime import datetime
from .profile import Profile
from app.graphql.info import Info


@strawberry.type
class Roommate:
    """Roommate association type"""
    
    id: Optional[strawberry.ID] = None
    user_id: Optional[strawberry.ID] = None
    household_id: Optional[strawberry.ID] = None
    status: Optional[str] = None  # pending, accepted, rejected, left
    joined_at: Optional[datetime] = None
    left_at: Optional[datetime] = None
    points: Optional[int] = None
    
    @strawberry.field
    async def profile(self, info: Info) -> Optional[Profile]:
        context = info.context
        result = await context.dataloaders.profile_loader.load(self.user_id)
        if result:
            return Profile(**result)
        return None
