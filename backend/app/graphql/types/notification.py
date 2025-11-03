"""Notification GraphQL type"""
import strawberry
from typing import Optional
from datetime import datetime
import json


@strawberry.type
class Notification:
    """Notification type for user alerts"""
    
    id: Optional[strawberry.ID] = None
    user_id: Optional[str] = None
    title: Optional[str] = None
    message: Optional[str] = None
    type: Optional[str] = None
    is_read: Optional[bool] = None
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
