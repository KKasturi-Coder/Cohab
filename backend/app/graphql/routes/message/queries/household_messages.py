"""Get household messages query resolver"""
import strawberry
from typing import List
from ....types import Message
from app.graphql.info import Info
from app.graphql.utils.field_selectors import get_requested_db_fields
from app.graphql.utils.parsers import parse_datetime_fields


@strawberry.field
async def household_messages(
    info: Info, 
    household_id: str,
    limit: int = 50
) -> List[Message]:
    """Get messages for a household"""
    context = info.context
    
    fields = get_requested_db_fields(Message, info)
    result = await context.supabase.table("messages").select(fields).eq("household_id", household_id).order("created_at", desc=True).limit(limit).execute()
    
    # Reverse to show oldest first
    messages = [Message(**parse_datetime_fields(message, "created_at")) for message in result.data]
    messages.reverse()
    
    return messages
