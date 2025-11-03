"""Update household mutation resolver"""
import strawberry
from typing import Optional
from ....types import Household
from ..inputs import UpdateHouseholdInput
from app.graphql.info import Info


@strawberry.mutation
async def update_household(
    info: Info,
    household_id: str,
    input: UpdateHouseholdInput
) -> Optional[Household]:
    """Update a household"""
    context = info.context
    
    if not context.user_id:
        raise Exception("Not authenticated")
    
    # Verify user is the creator
    household_result = await context.supabase.table("households").select("created_by").eq("id", household_id).execute()
    
    if not household_result.data or household_result.data[0]["created_by"] != context.user_id:
        raise Exception("Not authorized to update this household")
    
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
    if input.household_type is not None:
        update_data["household_type"] = input.household_type
    if input.amenities is not None:
        update_data["amenities"] = input.amenities
    if input.images is not None:
        update_data["images"] = input.images
    if input.is_available is not None:
        update_data["is_available"] = input.is_available
    
    if not update_data:
        raise Exception("No fields to update")
    
    # Update household
    result = await context.supabase.table("households").update(update_data).eq("id", household_id).execute()
    
    if result.data:
        return Household(**result.data[0])
    return None
