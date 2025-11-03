"""Get expense query resolver"""
import strawberry
from typing import Optional
from ....types import Expense
from app.graphql.info import Info
from app.graphql.utils.field_selectors import get_requested_db_fields


@strawberry.field
async def expense(info: Info, expense_id: str) -> Optional[Expense]:
    """Get an expense by ID"""
    context = info.context
    
    fields = get_requested_db_fields(Expense, info)
    result = await context.supabase.table("expenses").select(fields).eq("id", expense_id).execute()
    
    if result.data:
        return Expense(**result.data[0])
    return None
