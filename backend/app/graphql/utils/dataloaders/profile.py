"""Profile dataloaders for efficient batch loading"""
from typing import List, Optional
from strawberry.dataloader import DataLoader
from supabase import AsyncClient


async def load_profiles_batch(keys: List[str], supabase: AsyncClient) -> List[Optional[dict]]:
    """Batch load profiles by user IDs"""
    result = await supabase.table("profiles").select("*").in_("id", keys).execute()
    
    # Create a mapping of id to profile
    profile_map = {profile["id"]: profile for profile in result.data}
    
    # Return profiles in the same order as the keys
    return [profile_map.get(key) for key in keys]


def create_profile_loader(supabase: AsyncClient) -> DataLoader:
    """Create a dataloader for profiles"""
    async def load_fn(keys: List[str]) -> List[Optional[dict]]:
        return await load_profiles_batch(keys, supabase)
    
    return DataLoader(load_fn=load_fn)
