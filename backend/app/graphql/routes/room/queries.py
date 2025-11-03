"""Room query resolvers"""
import strawberry
from typing import Optional, List
from ...types import Room
from ...context import CustomContext


@strawberry.type
class RoomQueries:
    """Room related queries"""
    
    @strawberry.field
    async def room(self, info: strawberry.Info[CustomContext, None], room_id: str) -> Optional[Room]:
        """Get a room by ID"""
        context = info.context
        
        result = context.supabase.table("rooms").select("*").eq("id", room_id).execute()
        
        if result.data:
            return Room(**result.data[0])
        return None
    
    @strawberry.field
    async def rooms(
        self, 
        info: strawberry.Info[CustomContext, None], 
        available_only: bool = False,
        limit: int = 10
    ) -> List[Room]:
        """Get all rooms"""
        context = info.context
        
        query = context.supabase.table("rooms").select("*")
        
        if available_only:
            query = query.eq("is_available", True)
        
        result = query.limit(limit).execute()
        
        return [Room(**room) for room in result.data]
    
    @strawberry.field
    async def my_rooms(self, info: strawberry.Info[CustomContext, None]) -> List[Room]:
        """Get rooms created by or joined by current user"""
        context = info.context
        
        if not context.user_id:
            return []
        
        # Get rooms where user is a roommate
        roommate_result = context.supabase.table("roommates").select("room_id").eq("user_id", context.user_id).eq("status", "active").execute()
        
        if not roommate_result.data:
            return []
        
        room_ids = [r["room_id"] for r in roommate_result.data]
        
        # Get the actual room data
        result = context.supabase.table("rooms").select("*").in_("id", room_ids).execute()
        
        return [Room(**room) for room in result.data]
