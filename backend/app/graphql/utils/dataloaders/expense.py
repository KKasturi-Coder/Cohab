"""Expense dataloaders for efficient batch loading"""
from typing import List, Optional
from strawberry.dataloader import DataLoader
from supabase import AsyncClient


async def load_expenses_batch(keys: List[str], supabase: AsyncClient) -> List[Optional[dict]]:
    """Batch load expenses by expense IDs"""
    result = await supabase.table("expenses").select("*").in_("id", keys).execute()
    
    # Create a mapping of id to expense
    expense_map = {expense["id"]: expense for expense in result.data}
    
    # Return expenses in the same order as the keys
    return [expense_map.get(key) for key in keys]


async def load_expenses_by_household_batch(keys: List[str], supabase: AsyncClient) -> List[List[dict]]:
    """Batch load expenses by household IDs"""
    result = await supabase.table("expenses").select("*").in_("household_id", keys).execute()
    
    # Group expenses by household_id
    expenses_map = {}
    for expense in result.data:
        household_id = expense["household_id"]
        if household_id not in expenses_map:
            expenses_map[household_id] = []
        expenses_map[household_id].append(expense)
    
    # Return expense lists in the same order as the keys
    return [expenses_map.get(key, []) for key in keys]


async def load_expense_splits_batch(keys: List[str], supabase: AsyncClient) -> List[List[dict]]:
    """Batch load expense splits by expense IDs"""
    result = await supabase.table("expense_splits").select("*").in_("expense_id", keys).execute()
    
    # Group splits by expense_id
    splits_map = {}
    for split in result.data:
        expense_id = split["expense_id"]
        if expense_id not in splits_map:
            splits_map[expense_id] = []
        splits_map[expense_id].append(split)
    
    # Return split lists in the same order as the keys
    return [splits_map.get(key, []) for key in keys]


async def load_expense_splits_by_user_batch(keys: List[str], supabase: AsyncClient) -> List[List[dict]]:
    """Batch load expense splits by user IDs"""
    result = await supabase.table("expense_splits").select("*").in_("user_id", keys).execute()
    
    # Group splits by user_id
    splits_map = {}
    for split in result.data:
        user_id = split["user_id"]
        if user_id not in splits_map:
            splits_map[user_id] = []
        splits_map[user_id].append(split)
    
    # Return split lists in the same order as the keys
    return [splits_map.get(key, []) for key in keys]


def create_expense_loader(supabase: AsyncClient) -> DataLoader:
    """Create a dataloader for expenses"""
    async def load_fn(keys: List[str]) -> List[Optional[dict]]:
        return await load_expenses_batch(keys, supabase)
    
    return DataLoader(load_fn=load_fn)


def create_expenses_by_household_loader(supabase: AsyncClient) -> DataLoader:
    """Create a dataloader for expenses by household ID"""
    async def load_fn(keys: List[str]) -> List[List[dict]]:
        return await load_expenses_by_household_batch(keys, supabase)
    
    return DataLoader(load_fn=load_fn)


def create_expense_splits_loader(supabase: AsyncClient) -> DataLoader:
    """Create a dataloader for expense splits by expense ID"""
    async def load_fn(keys: List[str]) -> List[List[dict]]:
        return await load_expense_splits_batch(keys, supabase)
    
    return DataLoader(load_fn=load_fn)


def create_expense_splits_by_user_loader(supabase: AsyncClient) -> DataLoader:
    """Create a dataloader for expense splits by user ID"""
    async def load_fn(keys: List[str]) -> List[List[dict]]:
        return await load_expense_splits_by_user_batch(keys, supabase)
    
    return DataLoader(load_fn=load_fn)
