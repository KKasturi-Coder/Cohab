"""Expense mutation resolvers"""
import strawberry
from typing import Optional
from ...types import Expense
from .inputs import CreateExpenseInput, UpdateExpenseInput, MarkExpensePaidInput
from ...context import CustomContext


@strawberry.type
class ExpenseMutations:
    """Expense related mutations"""
    
    @strawberry.mutation
    async def create_expense(
        self, 
        info: strawberry.Info[CustomContext, None],
        input: CreateExpenseInput
    ) -> Optional[Expense]:
        """Create a new expense and split it"""
        context = info.context
        
        if not context.user_id:
            raise Exception("Not authenticated")
        
        # Verify user is in the room
        roommate_result = context.supabase.table("roommates").select("*").eq("user_id", context.user_id).eq("room_id", input.room_id).eq("status", "active").execute()
        
        if not roommate_result.data:
            raise Exception("Not a member of this room")
        
        # Create expense
        expense_data = {
            "room_id": input.room_id,
            "title": input.title,
            "description": input.description,
            "amount": input.amount,
            "currency": input.currency,
            "category": input.category,
            "paid_by": context.user_id,
            "due_date": input.due_date,
        }
        
        expense_result = context.supabase.table("expenses").insert(expense_data).execute()
        
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
                context.supabase.table("expense_splits").insert(split_data).execute()
            
            return Expense(**expense_result.data[0])
        return None
    
    @strawberry.mutation
    async def update_expense(
        self, 
        info: strawberry.Info[CustomContext, None],
        expense_id: str,
        input: UpdateExpenseInput
    ) -> Optional[Expense]:
        """Update an expense"""
        context = info.context
        
        if not context.user_id:
            raise Exception("Not authenticated")
        
        # Verify user created the expense
        expense_result = context.supabase.table("expenses").select("paid_by").eq("id", expense_id).execute()
        
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
            update_data["due_date"] = input.due_date
        
        if not update_data:
            raise Exception("No fields to update")
        
        # Update expense
        result = context.supabase.table("expenses").update(update_data).eq("id", expense_id).execute()
        
        if result.data:
            return Expense(**result.data[0])
        return None
    
    @strawberry.mutation
    async def mark_expense_paid(
        self, 
        info: strawberry.Info[CustomContext, None],
        input: MarkExpensePaidInput
    ) -> bool:
        """Mark an expense split as paid"""
        context = info.context
        
        if not context.user_id:
            raise Exception("Not authenticated")
        
        # Verify user owns this split
        split_result = context.supabase.table("expense_splits").select("user_id").eq("id", input.expense_split_id).execute()
        
        if not split_result.data or split_result.data[0]["user_id"] != context.user_id:
            raise Exception("Not authorized to mark this split as paid")
        
        # Update split
        update_data = {"is_paid": True}
        context.supabase.table("expense_splits").update(update_data).eq("id", input.expense_split_id).execute()
        
        return True
    
    @strawberry.mutation
    async def delete_expense(
        self, 
        info: strawberry.Info[CustomContext, None],
        expense_id: str
    ) -> bool:
        """Delete an expense"""
        context = info.context
        
        if not context.user_id:
            raise Exception("Not authenticated")
        
        # Verify user created the expense
        expense_result = context.supabase.table("expenses").select("paid_by").eq("id", expense_id).execute()
        
        if not expense_result.data or expense_result.data[0]["paid_by"] != context.user_id:
            raise Exception("Not authorized to delete this expense")
        
        # Delete expense (splits should cascade)
        context.supabase.table("expenses").delete().eq("id", expense_id).execute()
        
        return True
