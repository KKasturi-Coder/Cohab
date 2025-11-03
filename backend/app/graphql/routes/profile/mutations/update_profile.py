"""Update profile mutation resolver"""
import strawberry
from typing import Optional
from ....types import Profile
from ..inputs import UpdateProfileInput
from app.graphql.info import Info


@strawberry.mutation
async def update_profile(
    info: Info,
    input: UpdateProfileInput
) -> Optional[Profile]:
    """Update current user's profile"""
    context = info.context
    
    if not context.user_id:
        raise Exception("Not authenticated")
    
    # Build update dict with only provided fields
    update_data = {}
    if input.full_name is not None:
        update_data["full_name"] = input.full_name
    if input.avatar_url is not None:
        update_data["avatar_url"] = input.avatar_url
    if input.bio is not None:
        update_data["bio"] = input.bio
    
    if not update_data:
        raise Exception("No fields to update")
    
    # Update profile
    result = await context.supabase.table("profiles").update(update_data).eq("id", context.user_id).execute()
    
    if result.data:
        return Profile(**result.data[0])
    return None
