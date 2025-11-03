"""Household GraphQL type"""
import strawberry
from typing import Optional, List
from datetime import datetime
from .roommate import Roommate
from app.graphql.info import Info
from app.graphql.utils.field_selectors import get_requested_db_fields


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
    async def roommates(self, info:Info) -> List[Roommate]:
        """Get all accepted roommates for this household"""
        context = info.context
        
        # Get roommates with status 'accepted'
        fields = get_requested_db_fields(Roommate, info)
        roommates_result = await context.supabase.table("roommates").select(fields).eq("household_id", self.id).eq("status", "accepted").execute()
        
        if not roommates_result.data:
            return []
        
        return [Roommate(**roommate) for roommate in roommates_result.data]
