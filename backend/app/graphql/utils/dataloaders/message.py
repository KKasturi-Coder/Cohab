"""Message dataloaders for efficient batch loading"""
from typing import List
from strawberry.dataloader import DataLoader
from supabase import AsyncClient


async def load_messages_by_household_batch(keys: List[str], supabase: AsyncClient) -> List[List[dict]]:
    """Batch load messages by household IDs"""
    result = await supabase.table("messages").select("*").in_("household_id", keys).execute()
    
    # Group messages by household_id
    messages_map = {}
    for message in result.data:
        household_id = message["household_id"]
        if household_id not in messages_map:
            messages_map[household_id] = []
        messages_map[household_id].append(message)
    
    # Return message lists in the same order as the keys
    return [messages_map.get(key, []) for key in keys]


async def load_messages_by_sender_batch(keys: List[str], supabase: AsyncClient) -> List[List[dict]]:
    """Batch load messages by sender IDs"""
    result = await supabase.table("messages").select("*").in_("sender_id", keys).execute()
    
    # Group messages by sender_id
    messages_map = {}
    for message in result.data:
        sender_id = message["sender_id"]
        if sender_id not in messages_map:
            messages_map[sender_id] = []
        messages_map[sender_id].append(message)
    
    # Return message lists in the same order as the keys
    return [messages_map.get(key, []) for key in keys]


def create_messages_by_household_loader(supabase: AsyncClient) -> DataLoader:
    """Create a dataloader for messages by household ID"""
    async def load_fn(keys: List[str]) -> List[List[dict]]:
        return await load_messages_by_household_batch(keys, supabase)
    
    return DataLoader(load_fn=load_fn)


def create_messages_by_sender_loader(supabase: AsyncClient) -> DataLoader:
    """Create a dataloader for messages by sender ID"""
    async def load_fn(keys: List[str]) -> List[List[dict]]:
        return await load_messages_by_sender_batch(keys, supabase)
    
    return DataLoader(load_fn=load_fn)
