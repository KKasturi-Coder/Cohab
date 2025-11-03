"""GraphQL context for dependency injection"""
from typing import Optional
from supabase import AsyncClient
from strawberry.fastapi import BaseContext
from .utils.dataloaders import Dataloaders, create_dataloaders


class CustomContext(BaseContext):
    """Context class that holds request-scoped dependencies"""
    
    def __init__(
        self,
        supabase: AsyncClient,
        user_id: Optional[str] = None,
    ):
        self.supabase = supabase
        self.user_id = user_id
        self.dataloaders = create_dataloaders(supabase)
