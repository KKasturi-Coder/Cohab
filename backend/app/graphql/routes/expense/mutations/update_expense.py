"""Update expense mutation resolver"""
import strawberry
from typing import Optional
from ....types import Expense
from ..inputs import UpdateExpenseInput
from app.graphql.info import Info
from app.graphql.utils.parsers import parse_datetime_fields, datetime_to_iso


@strawberry.mutation
async def update_expense(
    info: Info,
    expense_id: str,
    input: UpdateExpenseInput
) -> Optional[Expense]:
    """Update an expense"""
    context = info.context
    
    if not context.user_id:
        raise Exception("Not authenticated")
    
    # Verify user created the expense
    expense_result = await context.supabase.table("expenses").select("paid_by").eq("id", expense_id).execute()
    
    if not expense_result.data or expense_result.data[0]["paid_by"] != context.user_id:
        raise Exception("Not authorized to update this expense")
    
    # Build update dict
    update_data = {}
    if input.title is not None:
        update_data["title"] = input.title
    if input.description is not None:
        update_data["description"] = input.description
    if input.amount is not None:
        update_data["amount"] = input.amount
    if input.currency is not None:
        update_data["currency"] = input.currency
    if input.category is not None:
        update_data["category"] = input.category
    if input.due_date is not None:
        update_data["due_date"] = datetime_to_iso(input.due_date)
    
    if not update_data:
        raise Exception("No fields to update")
    
    # Update expense
    result = await context.supabase.table("expenses").update(update_data).eq("id", expense_id).execute()
    
    if result.data:
        expense_data = parse_datetime_fields(result.data[0], "created_at", "due_date")
        return Expense(**expense_data)
    return None
