"""Mark expense paid mutation resolver"""
import strawberry
from ..inputs import MarkExpensePaidInput
from app.graphql.info import Info


@strawberry.mutation
async def mark_expense_paid(
    info: Info,
    input: MarkExpensePaidInput
) -> bool:
    """Mark an expense split as paid"""
    context = info.context
    
    if not context.user_id:
        raise Exception("Not authenticated")
    
    # Verify user owns this split
    split_result = await context.supabase.table("expense_splits").select("user_id").eq("id", input.expense_split_id).execute()
    
    if not split_result.data or split_result.data[0]["user_id"] != context.user_id:
        raise Exception("Not authorized to mark this split as paid")
    
    # Update split
    update_data = {"is_paid": True}
    await context.supabase.table("expense_splits").update(update_data).eq("id", input.expense_split_id).execute()
    
    return True
