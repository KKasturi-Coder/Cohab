"""Get expense splits query resolver"""
import strawberry
from typing import List
from ....types import ExpenseSplit
from app.graphql.info import Info


@strawberry.field
async def expense_splits(
    info: Info, 
    expense_id: str
) -> List[ExpenseSplit]:
    """Get all splits for an expense"""
    context = info.context
    
    result = await context.supabase.table("expense_splits").select("*").eq("expense_id", expense_id).execute()
    
    return [ExpenseSplit(**split) for split in result.data]
