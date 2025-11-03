"""Send message mutation resolver"""
import strawberry
from typing import Optional
from ....types import Message
from ..inputs import CreateMessageInput
from ....info import Info


@strawberry.mutation
async def send_message(
    info: Info,
    input: CreateMessageInput
) -> Optional[Message]:
    """Send a message to a household"""
    context = info.context
    
    if not context.user_id:
        raise Exception("Not authenticated")
    
    # Verify user is in the household
    roommate_result = await context.supabase.table("roommates").select("*").eq("user_id", context.user_id).eq("household_id", input.household_id).eq("status", "active").execute()
    
    if not roommate_result.data:
        raise Exception("Not a member of this household")
    
    # Create message
    message_data = {
        "household_id": input.household_id,
        "sender_id": context.user_id,
        "content": input.content,
        "message_type": input.message_type,
        "metadata": input.metadata,
    }
    
    result = await context.supabase.table("messages").insert(message_data).execute()
    
    if result.data:
        return Message(**result.data[0])
    return None
