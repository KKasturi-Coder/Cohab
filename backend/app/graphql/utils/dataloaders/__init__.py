"""Dataloader utilities for efficient batch loading in GraphQL"""
from dataclasses import dataclass
from supabase import AsyncClient
from strawberry.dataloader import DataLoader

from .profile import create_profile_loader
from .household import (
    create_household_loader,
    create_roommates_by_household_loader,
    create_roommates_by_user_loader,
)
from .expense import (
    create_expense_loader,
    create_expenses_by_household_loader,
    create_expense_splits_loader,
    create_expense_splits_by_user_loader,
)
from .message import (
    create_messages_by_household_loader,
    create_messages_by_sender_loader,
)
from .notification import create_notifications_by_user_loader


@dataclass
class Dataloaders:
    """Container for all dataloaders"""
    
    # Profile loaders
    profile_loader: DataLoader
    
    # Room loaders
    household_loader: DataLoader
    roommates_by_household_loader: DataLoader
    roommates_by_user_loader: DataLoader
    
    # Expense loaders
    expense_loader: DataLoader
    expenses_by_household_loader: DataLoader
    expense_splits_loader: DataLoader
    expense_splits_by_user_loader: DataLoader
    
    # Message loaders
    messages_by_household_loader: DataLoader
    messages_by_sender_loader: DataLoader
    
    # Notification loaders
    notifications_by_user_loader: DataLoader


def create_dataloaders(supabase: AsyncClient) -> Dataloaders:
    """Create all dataloaders for a request"""
    return Dataloaders(
        # Profile loaders
        profile_loader=create_profile_loader(supabase),
        
        # Room loaders
        household_loader=create_household_loader(supabase),
        roommates_by_household_loader=create_roommates_by_household_loader(supabase),
        roommates_by_user_loader=create_roommates_by_user_loader(supabase),
        
        # Expense loaders
        expense_loader=create_expense_loader(supabase),
        expenses_by_household_loader=create_expenses_by_household_loader(supabase),
        expense_splits_loader=create_expense_splits_loader(supabase),
        expense_splits_by_user_loader=create_expense_splits_by_user_loader(supabase),
        
        # Message loaders
        messages_by_household_loader=create_messages_by_household_loader(supabase),
        messages_by_sender_loader=create_messages_by_sender_loader(supabase),
        
        # Notification loaders
        notifications_by_user_loader=create_notifications_by_user_loader(supabase),
    )


__all__ = [
    "Dataloaders",
    "create_dataloaders",
]
