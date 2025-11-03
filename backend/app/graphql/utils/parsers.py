"""Utility functions for parsing database responses"""
from datetime import datetime
from typing import Any, Dict, Optional


def parse_datetime_fields(data: Dict[str, Any], *fields: str) -> Dict[str, Any]:
    """
    Parse datetime string fields from database response to datetime objects.
    
    Args:
        data: Dictionary containing the data from database
        fields: Field names to parse as datetime
        
    Returns:
        Dictionary with parsed datetime fields
    """
    parsed_data = data.copy()
    
    for field in fields:
        if field in parsed_data and parsed_data[field] is not None:
            if isinstance(parsed_data[field], str):
                # Parse ISO format datetime string
                parsed_data[field] = datetime.fromisoformat(parsed_data[field].replace('Z', '+00:00'))
    
    return parsed_data


def datetime_to_iso(dt: Optional[datetime]) -> Optional[str]:
    """
    Convert datetime object to ISO format string for database operations.
    
    Args:
        dt: Datetime object to convert
        
    Returns:
        ISO format string or None
    """
    return dt.isoformat() if dt else None
