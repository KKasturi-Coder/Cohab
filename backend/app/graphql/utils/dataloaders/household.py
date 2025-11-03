"""Room dataloaders for efficient batch loading"""
from typing import List, Optional
from strawberry.dataloader import DataLoader
from supabase import AsyncClient


async def load_households_batch(keys: List[str], supabase: AsyncClient) -> List[Optional[dict]]:
    """Batch load households by household IDs"""
    result = await supabase.table("households").select("*").in_("id", keys).execute()
    
    # Create a mapping of id to household
    household_map = {household["id"]: household for household in result.data}
    
    # Return households in the same order as the keys
    return [household_map.get(key) for key in keys]


async def load_roommates_by_household_batch(keys: List[str], supabase: AsyncClient) -> List[List[dict]]:
    """Batch load roommates by household IDs"""
    result = await supabase.table("roommates").select("*").in_("household_id", keys).execute()
    
    # Group roommates by household_id
    roommates_map = {}
    for roommate in result.data:
        household_id = roommate["household_id"]
        if household_id not in roommates_map:
            roommates_map[household_id] = []
        roommates_map[household_id].append(roommate)
    
    # Return roommates lists in the same order as the keys
    return [roommates_map.get(key, []) for key in keys]


async def load_roommates_by_user_batch(keys: List[str], supabase: AsyncClient) -> List[List[dict]]:
    """Batch load roommates by user IDs"""
    result = await supabase.table("roommates").select("*").in_("user_id", keys).execute()
    
    # Group roommates by user_id
    roommates_map = {}
    for roommate in result.data:
        user_id = roommate["user_id"]
        if user_id not in roommates_map:
            roommates_map[user_id] = []
        roommates_map[user_id].append(roommate)
    
    # Return roommates lists in the same order as the keys
    return [roommates_map.get(key, []) for key in keys]


def create_household_loader(supabase: AsyncClient) -> DataLoader:
    """Create a dataloader for households"""
    async def load_fn(keys: List[str]) -> List[Optional[dict]]:
        return await load_households_batch(keys, supabase)
    
    return DataLoader(load_fn=load_fn)


def create_roommates_by_household_loader(supabase: AsyncClient) -> DataLoader:
    """Create a dataloader for roommates by household ID"""
    async def load_fn(keys: List[str]) -> List[List[dict]]:
        return await load_roommates_by_household_batch(keys, supabase)
    
    return DataLoader(load_fn=load_fn)


def create_roommates_by_user_loader(supabase: AsyncClient) -> DataLoader:
    """Create a dataloader for roommates by user ID"""
    async def load_fn(keys: List[str]) -> List[List[dict]]:
        return await load_roommates_by_user_batch(keys, supabase)
    
    return DataLoader(load_fn=load_fn)
