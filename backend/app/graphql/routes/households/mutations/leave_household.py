"""Leave household mutation resolver"""
import strawberry
from typing import List
from app.graphql.info import Info
from ....types import Household
from app.graphql.utils.parsers import parse_datetime_fields


@strawberry.type
class LeaveHouseholdResult:
    """Result type for leave household mutation"""
    success: bool
    remaining_households: List[Household]


@strawberry.mutation
async def leave_household(
    info: Info,
    household_id: str
) -> LeaveHouseholdResult:
    """Leave a household"""
    context = info.context
    
    if not context.user_id:
        raise Exception("Not authenticated")
    
    # Update roommate status
    update_data = {"status": "left"}
    await context.supabase.table("roommates").update(update_data).eq("user_id", context.user_id).eq("household_id", household_id).execute()
    
    # Get remaining households
    result = await context.supabase.rpc(
        'get_user_households',
        {'user_id_param': context.user_id}
    ).execute()
    
    remaining_households = [
        Household(**parse_datetime_fields(h, 'created_at', 'updated_at'))
        for h in (result.data or [])
    ]
    
    return LeaveHouseholdResult(
        success=True,
        remaining_households=remaining_households
    )
