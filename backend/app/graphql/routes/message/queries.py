"""Message query resolvers"""
import strawberry
from typing import List
from ...types import Message
from ...context import CustomContext


@strawberry.type
class MessageQueries:
    """Message related queries"""
    
    @strawberry.field
    async def room_messages(
        self, 
        info: strawberry.Info[CustomContext, None], 
        room_id: str,
        limit: int = 50
    ) -> List[Message]:
        """Get messages for a room"""
        context = info.context
        
        result = context.supabase.table("messages").select("*").eq("room_id", room_id).order("created_at", desc=True).limit(limit).execute()
        
        # Reverse to show oldest first
        messages = [Message(**message) for message in result.data]
        messages.reverse()
        
        return messages
