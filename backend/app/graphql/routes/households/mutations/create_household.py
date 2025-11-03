"""Create household mutation resolver"""
import strawberry
from typing import Optional
from ....types import Household
from ..inputs import CreateHouseholdInput
from app.graphql.info import Info
from app.graphql.utils.parsers import parse_datetime_fields
import random
import string

@strawberry.mutation
async def create_household(
    info: Info,
    input: CreateHouseholdInput
) -> Optional[Household]:
    context = info.context
    if not context.user_id:
        raise Exception("Not authenticated")

    alphabet = string.ascii_uppercase + string.digits
    code = "".join(random.choices(alphabet, k=8))

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
        "invite_code": code,
    }

    result = await context.supabase.table("households").insert(household_data).execute()
    if not result.data:
        return None

    roommate_data = {
        "user_id": context.user_id,
        "household_id": result.data[0]["id"],
        "status": "accepted",
    }
    await context.supabase.table("roommates").insert(roommate_data).execute()

    household = parse_datetime_fields(result.data[0], "created_at", "updated_at")
    return Household(**household)
