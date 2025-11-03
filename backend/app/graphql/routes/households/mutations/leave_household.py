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
    
    # Get remaining households where user is still a member
    result = await context.supabase.table('roommates') \
        .select('households(*)') \
        .eq('user_id', context.user_id) \
        .eq('status', 'accepted') \
        .execute()
    
    remaining_households = []
    for row in (result.data or []):
        if row.get('households'):
            remaining_households.append(
                Household(**parse_datetime_fields(row['households'], 'created_at', 'updated_at'))
            )
    
    return LeaveHouseholdResult(
        success=True,
        remaining_households=remaining_households
    )
