"""Get expense query resolver"""
import strawberry
from typing import Optional
from ....types import Expense
from app.graphql.info import Info


@strawberry.field
async def expense(info: Info, expense_id: str) -> Optional[Expense]:
    """Get an expense by ID"""
    context = info.context
    
    result = await context.supabase.table("expenses").select("*").eq("id", expense_id).execute()
    
    if result.data:
        return Expense(**result.data[0])
    return None
