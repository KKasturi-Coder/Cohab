"""Notification GraphQL type"""
import strawberry
from typing import Optional
from datetime import datetime
import json


@strawberry.type
class Notification:
    """Notification type for user alerts"""
    
    id: strawberry.ID
    user_id: str
    title: str
    message: str
    type: str
    is_read: bool
    metadata: Optional[str] = None
    created_at: datetime
    
    @strawberry.field
    def parsed_metadata(self) -> Optional[str]:
        """Parse metadata JSON if exists"""
        if self.metadata:
            try:
                return json.dumps(json.loads(self.metadata))
            except:
                return self.metadata
        return None
