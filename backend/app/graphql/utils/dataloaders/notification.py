"""Notification dataloaders for efficient batch loading"""
from typing import List
from strawberry.dataloader import DataLoader
from supabase import AsyncClient


async def load_notifications_by_user_batch(keys: List[str], supabase: AsyncClient) -> List[List[dict]]:
    """Batch load notifications by user IDs"""
    result = await supabase.table("notifications").select("*").in_("user_id", keys).execute()
    
    # Group notifications by user_id
    notifications_map = {}
    for notification in result.data:
        user_id = notification["user_id"]
        if user_id not in notifications_map:
            notifications_map[user_id] = []
        notifications_map[user_id].append(notification)
    
    # Return notification lists in the same order as the keys
    return [notifications_map.get(key, []) for key in keys]


def create_notifications_by_user_loader(supabase: AsyncClient) -> DataLoader:
    """Create a dataloader for notifications by user ID"""
    async def load_fn(keys: List[str]) -> List[List[dict]]:
        return await load_notifications_by_user_batch(keys, supabase)
    
    return DataLoader(load_fn=load_fn)
