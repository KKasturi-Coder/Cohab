"""Get household expenses query resolver"""
import strawberry
from typing import List
from ....types import Expense
from app.graphql.info import Info


@strawberry.field
async def household_expenses(
    info: Info, 
    household_id: str,
    limit: int = 20
) -> List[Expense]:
    """Get all expenses for a household"""
    context = info.context
    
    result = await context.supabase.table("expenses").select("*").eq("household_id", household_id).order("created_at", desc=True).limit(limit).execute()
    
    return [Expense(**expense) for expense in result.data]
