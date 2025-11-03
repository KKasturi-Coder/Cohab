"""Household GraphQL type"""
import strawberry
from typing import Optional, List
from datetime import datetime
from .profile import Profile
from app.graphql.info import Info


@strawberry.type
class Household:
    """Household type"""
    
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
    
    @strawberry.field
    async def roommates(self, info:Info) -> List[Profile]:
        """Get all accepted roommates for this household"""
        context = info.context
        
        # Get roommates with status 'accepted'
        roommates_result = await context.supabase.table("roommates").select("user_id").eq("household_id", self.id).eq("status", "accepted").execute()
        
        if not roommates_result.data:
            return []
        
        user_ids = [r["user_id"] for r in roommates_result.data]
        
        # Get profiles for these users
        profiles_result = await context.supabase.table("profiles").select("*").in_("id", user_ids).execute()
        
        if not profiles_result.data:
            return []
        
        return [Profile(**profile) for profile in profiles_result.data]
