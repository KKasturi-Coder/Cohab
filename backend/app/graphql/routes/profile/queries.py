"""Profile query resolvers"""
import strawberry
from typing import Optional, List
from ...types import Profile
from ...context import CustomContext


@strawberry.type
class ProfileQueries:
    """Profile related queries"""
    
    @strawberry.field
    async def profile(self, info: strawberry.Info[CustomContext, None], user_id: str) -> Optional[Profile]:
        """Get a user profile by ID"""
        context = info.context
        
        result = context.supabase.table("profiles").select("*").eq("id", user_id).execute()
        
        if result.data:
            return Profile(**result.data[0])
        return None
    
    @strawberry.field
    async def me(self, info: strawberry.Info[CustomContext, None]) -> Optional[Profile]:
        """Get current user's profile"""
        context = info.context
        
        if not context.user_id:
            return None
        
        result = context.supabase.table("profiles").select("*").eq("id", context.user_id).execute()
        
        if result.data:
            return Profile(**result.data[0])
        return None
    
    @strawberry.field
    async def profiles(self, info: strawberry.Info[CustomContext, None], limit: int = 10) -> List[Profile]:
        """Get all profiles"""
        context = info.context
        
        result = context.supabase.table("profiles").select("*").limit(limit).execute()
        
        return [Profile(**profile) for profile in result.data]
