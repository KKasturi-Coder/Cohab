"""Create expense mutation resolver"""
import strawberry
from typing import Optional
from ....types import Expense
from ..inputs import CreateExpenseInput
from app.graphql.info import Info


@strawberry.mutation
async def create_expense(
    info: Info,
    input: CreateExpenseInput
) -> Optional[Expense]:
    """Create a new expense and split it"""
    context = info.context
    
    if not context.user_id:
        raise Exception("Not authenticated")
    
    # Verify user is in the household
    roommate_result = await context.supabase.table("roommates").select("*").eq("user_id", context.user_id).eq("household_id", input.household_id).eq("status", "active").execute()
    
    if not roommate_result.data:
        raise Exception("Not a member of this household")
    
    # Create expense
    expense_data = {
        "household_id": input.household_id,
        "title": input.title,
        "description": input.description,
        "amount": input.amount,
        "currency": input.currency,
        "category": input.category,
        "paid_by": context.user_id,
        "due_date": input.due_date,
    }
    
    expense_result = await context.supabase.table("expenses").insert(expense_data).execute()
    
    if expense_result.data:
        expense_id = expense_result.data[0]["id"]
        
        # Create splits
        split_amount = input.amount / len(input.split_with)
        
        for user_id in input.split_with:
            split_data = {
                "expense_id": expense_id,
                "user_id": user_id,
                "amount": split_amount,
                "is_paid": user_id == context.user_id,  # Creator auto-pays
            }
            await context.supabase.table("expense_splits").insert(split_data).execute()
        
        return Expense(**expense_result.data[0])
    return None
