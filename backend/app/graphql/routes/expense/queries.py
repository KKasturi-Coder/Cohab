"""Expense query resolvers"""
import strawberry
from typing import Optional, List
from ...types import Expense, ExpenseSplit
from ...context import CustomContext


@strawberry.type
class ExpenseQueries:
    """Expense related queries"""
    
    @strawberry.field
    async def expense(self, info: strawberry.Info[CustomContext, None], expense_id: str) -> Optional[Expense]:
        """Get an expense by ID"""
        context = info.context
        
        result = context.supabase.table("expenses").select("*").eq("id", expense_id).execute()
        
        if result.data:
            return Expense(**result.data[0])
        return None
    
    @strawberry.field
    async def room_expenses(
        self, 
        info: strawberry.Info[CustomContext, None], 
        room_id: str,
        limit: int = 20
    ) -> List[Expense]:
        """Get all expenses for a room"""
        context = info.context
        
        result = context.supabase.table("expenses").select("*").eq("room_id", room_id).order("created_at", desc=True).limit(limit).execute()
        
        return [Expense(**expense) for expense in result.data]
    
    @strawberry.field
    async def my_expenses(self, info: strawberry.Info[CustomContext, None]) -> List[Expense]:
        """Get expenses for current user"""
        context = info.context
        
        if not context.user_id:
            return []
        
        # Get expense splits for the user
        splits_result = context.supabase.table("expense_splits").select("expense_id").eq("user_id", context.user_id).execute()
        
        if not splits_result.data:
            return []
        
        expense_ids = [s["expense_id"] for s in splits_result.data]
        
        # Get the actual expenses
        result = context.supabase.table("expenses").select("*").in_("id", expense_ids).order("created_at", desc=True).execute()
        
        return [Expense(**expense) for expense in result.data]
    
    @strawberry.field
    async def expense_splits(
        self, 
        info: strawberry.Info[CustomContext, None], 
        expense_id: str
    ) -> List[ExpenseSplit]:
        """Get all splits for an expense"""
        context = info.context
        
        result = context.supabase.table("expense_splits").select("*").eq("expense_id", expense_id).execute()
        
        return [ExpenseSplit(**split) for split in result.data]
