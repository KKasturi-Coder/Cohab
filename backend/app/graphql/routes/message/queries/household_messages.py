"""Get household messages query resolver"""
import strawberry
from typing import List
from ....types import Message
from app.graphql.info import Info


@strawberry.field
async def household_messages(
    info: Info, 
    household_id: str,
    limit: int = 50
) -> List[Message]:
    """Get messages for a household"""
    context = info.context
    
    result = await context.supabase.table("messages").select("*").eq("household_id", household_id).order("created_at", desc=True).limit(limit).execute()
    
    # Reverse to show oldest first
    messages = [Message(**message) for message in result.data]
    messages.reverse()
    
    return messages
