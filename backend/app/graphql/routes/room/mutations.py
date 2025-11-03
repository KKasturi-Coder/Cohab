"""Room mutation resolvers"""
import strawberry
from typing import Optional
from ...types import Room
from .inputs import CreateRoomInput, UpdateRoomInput
from ...context import CustomContext


@strawberry.type
class RoomMutations:
    """Room related mutations"""
    
    @strawberry.mutation
    async def create_room(
        self, 
        info: strawberry.Info[CustomContext, None],
        input: CreateRoomInput
    ) -> Optional[Room]:
        """Create a new room"""
        context = info.context
        
        if not context.user_id:
            raise Exception("Not authenticated")
        
        # Create room
        room_data = {
            "name": input.name,
            "description": input.description,
            "address": input.address,
            "rent_amount": input.rent_amount,
            "currency": input.currency,
            "room_type": input.room_type,
            "amenities": input.amenities,
            "images": input.images,
            "is_available": True,
            "created_by": context.user_id,
        }
        
        result = context.supabase.table("rooms").insert(room_data).execute()
        
        if result.data:
            # Add creator as a roommate
            roommate_data = {
                "user_id": context.user_id,
                "room_id": result.data[0]["id"],
                "status": "active",
            }
            context.supabase.table("roommates").insert(roommate_data).execute()
            
            return Room(**result.data[0])
        return None
    
    @strawberry.mutation
    async def update_room(
        self, 
        info: strawberry.Info[CustomContext, None],
        room_id: str,
        input: UpdateRoomInput
    ) -> Optional[Room]:
        """Update a room"""
        context = info.context
        
        if not context.user_id:
            raise Exception("Not authenticated")
        
        # Verify user is the creator
        room_result = context.supabase.table("rooms").select("created_by").eq("id", room_id).execute()
        
        if not room_result.data or room_result.data[0]["created_by"] != context.user_id:
            raise Exception("Not authorized to update this room")
        
        # Build update dict
        update_data = {}
        if input.name is not None:
            update_data["name"] = input.name
        if input.description is not None:
            update_data["description"] = input.description
        if input.address is not None:
            update_data["address"] = input.address
        if input.rent_amount is not None:
            update_data["rent_amount"] = input.rent_amount
        if input.currency is not None:
            update_data["currency"] = input.currency
        if input.room_type is not None:
            update_data["room_type"] = input.room_type
        if input.amenities is not None:
            update_data["amenities"] = input.amenities
        if input.images is not None:
            update_data["images"] = input.images
        if input.is_available is not None:
            update_data["is_available"] = input.is_available
        
        if not update_data:
            raise Exception("No fields to update")
        
        # Update room
        result = context.supabase.table("rooms").update(update_data).eq("id", room_id).execute()
        
        if result.data:
            return Room(**result.data[0])
        return None
    
    @strawberry.mutation
    async def delete_room(
        self, 
        info: strawberry.Info[CustomContext, None],
        room_id: str
    ) -> bool:
        """Delete a room"""
        context = info.context
        
        if not context.user_id:
            raise Exception("Not authenticated")
        
        # Verify user is the creator
        room_result = context.supabase.table("rooms").select("created_by").eq("id", room_id).execute()
        
        if not room_result.data or room_result.data[0]["created_by"] != context.user_id:
            raise Exception("Not authorized to delete this room")
        
        # Delete room
        context.supabase.table("rooms").delete().eq("id", room_id).execute()
        
        return True
    
    @strawberry.mutation
    async def join_room(
        self, 
        info: strawberry.Info[CustomContext, None],
        room_id: str
    ) -> bool:
        """Join a room as a roommate"""
        context = info.context
        
        if not context.user_id:
            raise Exception("Not authenticated")
        
        # Check if room exists and is available
        room_result = context.supabase.table("rooms").select("is_available").eq("id", room_id).execute()
        
        if not room_result.data:
            raise Exception("Room not found")
        
        if not room_result.data[0]["is_available"]:
            raise Exception("Room is not available")
        
        # Check if already a roommate
        existing = context.supabase.table("roommates").select("*").eq("user_id", context.user_id).eq("room_id", room_id).execute()
        
        if existing.data:
            raise Exception("Already a member of this room")
        
        # Add as roommate
        roommate_data = {
            "user_id": context.user_id,
            "room_id": room_id,
            "status": "active",
        }
        context.supabase.table("roommates").insert(roommate_data).execute()
        
        return True
    
    @strawberry.mutation
    async def leave_room(
        self, 
        info: strawberry.Info[CustomContext, None],
        room_id: str
    ) -> bool:
        """Leave a room"""
        context = info.context
        
        if not context.user_id:
            raise Exception("Not authenticated")
        
        # Update roommate status
        update_data = {"status": "left"}
        context.supabase.table("roommates").update(update_data).eq("user_id", context.user_id).eq("room_id", room_id).execute()
        
        return True
