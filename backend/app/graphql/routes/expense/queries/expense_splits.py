"""Get expense splits query resolver"""
import strawberry
from typing import List
from ....types import ExpenseSplit
from app.graphql.info import Info
from app.graphql.utils.field_selectors import get_requested_db_fields


@strawberry.field
async def expense_splits(
    info: Info, 
    expense_id: str
) -> List[ExpenseSplit]:
    """Get all splits for an expense"""
    context = info.context
    
    fields = get_requested_db_fields(ExpenseSplit, info)
    result = await context.supabase.table("expense_splits").select(fields).eq("expense_id", expense_id).execute()
    
    return [ExpenseSplit(**split) for split in result.data]
