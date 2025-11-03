"""Message mutation resolvers"""
import strawberry
from typing import Optional
from ...types import Message
from .inputs import CreateMessageInput
from ...context import CustomContext
from strawberry.types import Info

@strawberry.type
class MessageMutations:
    """Message related mutations"""
    
    @strawberry.mutation
    async def send_message(
        self, 
        info: Info,
        input: CreateMessageInput
    ) -> Optional[Message]:
        """Send a message to a room"""
        context = info.context
        
        if not context.user_id:
            raise Exception("Not authenticated")
        
        # Verify user is in the room
        roommate_result = context.supabase.table("roommates").select("*").eq("user_id", context.user_id).eq("room_id", input.room_id).eq("status", "active").execute()
        
        if not roommate_result.data:
            raise Exception("Not a member of this room")
        
        # Create message
        message_data = {
            "room_id": input.room_id,
            "sender_id": context.user_id,
            "content": input.content,
            "message_type": input.message_type,
            "metadata": input.metadata,
        }
        
        result = context.supabase.table("messages").insert(message_data).execute()
        
        if result.data:
            return Message(**result.data[0])
        return None
