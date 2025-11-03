"""Get my expenses query resolver"""
import strawberry
from typing import List
from ....types import Expense
from app.graphql.info import Info


@strawberry.field
async def my_expenses(info: Info) -> List[Expense]:
    """Get expenses for current user"""
    context = info.context
    
    if not context.user_id:
        return []
    
    # Get expense splits for the user
    splits_result = await context.supabase.table("expense_splits").select("expense_id").eq("user_id", context.user_id).execute()
    
    if not splits_result.data:
        return []
    
    expense_ids = [s["expense_id"] for s in splits_result.data]
    
    # Get the actual expenses
    result = await context.supabase.table("expenses").select("*").in_("id", expense_ids).order("created_at", desc=True).execute()
    
    return [Expense(**expense) for expense in result.data]
