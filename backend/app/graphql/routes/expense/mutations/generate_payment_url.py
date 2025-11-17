"""Generate payment URL mutation resolver"""
import strawberry
from typing import Optional
from app.graphql.info import Info
from app.utils.payment_urls import PaymentURLGenerator


@strawberry.input
class GeneratePaymentURLInput:
    """Input for generating payment URL"""
    
    expense_split_id: str
    payment_method: Optional[str] = None  # Optional, uses preferred if not specified


@strawberry.type
class PaymentURLResult:
    """Result of payment URL generation"""
    
    payment_url: str
    payment_method: str
    available_methods: list[str]


@strawberry.mutation
async def generate_payment_url(
    info: Info,
    input: GeneratePaymentURLInput
) -> Optional[PaymentURLResult]:
    """Generate a payment URL for an expense split"""
    context = info.context
    
    if not context.user_id:
        raise Exception("Not authenticated")
    
    # Get the expense split
    split_result = await context.supabase.table("expense_splits")\
        .select("*, expenses!inner(title, description, paid_by, currency)")\
        .eq("id", input.expense_split_id)\
        .execute()
    
    if not split_result.data:
        raise Exception("Expense split not found")
    
    split = split_result.data[0]
    
    # Verify user owns this split (they owe money)
    if split["user_id"] != context.user_id:
        raise Exception("Not authorized to generate payment URL for this split")
    
    # Get the payee's (person who paid) payment info
    payee_id = split["expenses"]["paid_by"]
    payee_result = await context.supabase.table("profiles")\
        .select("venmo_handle, paypal_email, cashapp_handle, zelle_email, preferred_payment_method")\
        .eq("id", payee_id)\
        .execute()
    
    if not payee_result.data:
        raise Exception("Payee profile not found")
    
    payee_info = payee_result.data[0]
    
    # Get available payment methods
    available_methods = PaymentURLGenerator.get_available_payment_methods(payee_info)
    
    if not available_methods:
        raise Exception("Payee has not set up any payment methods")
    
    # Determine which payment method to use
    payment_method = input.payment_method
    if not payment_method:
        # Use payee's preferred method or first available
        payment_method = payee_info.get("preferred_payment_method")
        if payment_method not in available_methods:
            payment_method = available_methods[0]
    
    # Verify the selected method is available
    if payment_method not in available_methods:
        raise Exception(f"Payment method '{payment_method}' not available for this user. Available: {', '.join(available_methods)}")
    
    # Generate payment note
    expense_title = split["expenses"]["title"]
    expense_description = split["expenses"].get("description", "")
    note = f"{expense_title}"
    if expense_description:
        note += f" - {expense_description}"
    
    # Generate payment URL
    amount = float(split["amount"])
    currency = split["expenses"].get("currency", "USD")
    
    payment_url = PaymentURLGenerator.generate_payment_url(
        payment_method,
        payee_info,
        amount,
        note,
        currency
    )
    
    if not payment_url:
        raise Exception("Failed to generate payment URL")
    
    # Update the split with payment URL and method
    await context.supabase.table("expense_splits")\
        .update({
            "payment_url": payment_url,
            "payment_method": payment_method
        })\
        .eq("id", input.expense_split_id)\
        .execute()
    
    return PaymentURLResult(
        payment_url=payment_url,
        payment_method=payment_method,
        available_methods=available_methods
    )
