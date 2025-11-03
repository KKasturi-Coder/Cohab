"""Message GraphQL type"""
import strawberry
from typing import Optional
from datetime import datetime
import json


@strawberry.type
class Message:
    """Message type for household chat"""
    
    id: Optional[strawberry.ID] = None
    household_id: Optional[str] = None
    sender_id: Optional[str] = None
    content: Optional[str] = None
    message_type: Optional[str] = None
    metadata: Optional[str] = None
    created_at: Optional[datetime] = None
    
    @strawberry.field
    def parsed_metadata(self) -> Optional[str]:
        """Parse metadata JSON if exists"""
        if self.metadata:
            try:
                return json.dumps(json.loads(self.metadata))
            except:
                return self.metadata
        return None
