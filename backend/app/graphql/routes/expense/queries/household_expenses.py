"""Get household expenses query resolver"""
import strawberry
from typing import List
from ....types import Expense
from app.graphql.info import Info
from app.graphql.utils.field_selectors import get_requested_db_fields


@strawberry.field
async def household_expenses(
    info: Info, 
    household_id: str,
    limit: int = 20
) -> List[Expense]:
    """Get all expenses for a household"""
    context = info.context
    
    fields = get_requested_db_fields(Expense, info)
    result = await context.supabase.table("expenses").select(fields).eq("household_id", household_id).order("created_at", desc=True).limit(limit).execute()
    
    return [Expense(**expense) for expense in result.data]
