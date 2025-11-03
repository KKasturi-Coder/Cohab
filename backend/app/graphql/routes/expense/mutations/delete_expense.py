"""Delete expense mutation resolver"""
import strawberry
from app.graphql.info import Info


@strawberry.mutation
async def delete_expense(
    info: Info,
    expense_id: str
) -> bool:
    """Delete an expense"""
    context = info.context
    
    if not context.user_id:
        raise Exception("Not authenticated")
    
    # Verify user created the expense
    expense_result = await context.supabase.table("expenses").select("paid_by").eq("id", expense_id).execute()
    
    if not expense_result.data or expense_result.data[0]["paid_by"] != context.user_id:
        raise Exception("Not authorized to delete this expense")
    
    # Delete expense (splits should cascade)
    await context.supabase.table("expenses").delete().eq("id", expense_id).execute()
    
    return True
