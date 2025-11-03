"""Create household mutation resolver"""
import strawberry
from typing import Optional
from ....types import Room
from ..inputs import CreateRoomInput
from app.graphql.info import Info


@strawberry.mutation
async def create_household(
    info: Info,
    input: CreateRoomInput
) -> Optional[Room]:
    """Create a new household"""
    context = info.context
    
    if not context.user_id:
        raise Exception("Not authenticated")
    
    # Create household
    household_data = {
        "name": input.name,
        "description": input.description,
        "address": input.address,
        "rent_amount": input.rent_amount,
        "currency": input.currency,
        "household_type": input.household_type,
        "amenities": input.amenities,
        "images": input.images,
        "is_available": True,
        "created_by": context.user_id,
    }
    
    result = await context.supabase.table("households").insert(household_data).execute()
    
    if result.data:
        # Add creator as a roommate
        roommate_data = {
            "user_id": context.user_id,
            "household_id": result.data[0]["id"],
            "status": "active",
        }
        await context.supabase.table("roommates").insert(roommate_data).execute()
        
        return Room(**result.data[0])
    return None
