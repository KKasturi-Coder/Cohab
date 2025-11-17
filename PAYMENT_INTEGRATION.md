# Payment Integration Guide

## Overview

Cohab now supports **real expensing** with fee-free payment integrations using popular payment platforms:

- **Venmo** - Free for friends/family
- **PayPal** - Free for friends/family (PayPal.me)
- **Cash App** - Free for standard transfers
- **Zelle** - Always free (bank-to-bank)

## How It Works

### 1. User Setup (One-Time)

Users need to add their payment handles in their profile settings:

```graphql
mutation UpdateProfile {
  profiles {
    updateProfile(input: {
      venmoHandle: "johndoe"        # Without @
      paypalEmail: "john@example.com"
      cashappHandle: "johndoe"      # Without $
      zelleEmail: "john@example.com"
      preferredPaymentMethod: "venmo"
    }) {
      id
      venmoHandle
      preferredPaymentMethod
    }
  }
}
```

### 2. Creating Expenses

When an expense is created, it's automatically split among roommates:

```graphql
mutation CreateExpense {
  expenses {
    createExpense(input: {
      householdId: "uuid"
      title: "Groceries"
      description: "Weekly grocery shopping"
      amount: 100.00
      currency: "USD"
      category: "groceries"
      splitWith: ["user_id_1", "user_id_2", "user_id_3"]
    }) {
      id
      amount
    }
  }
}
```

The amount is evenly split among all users in `splitWith`. The creator is automatically marked as paid.

### 3. Generating Payment URLs

When a user owes money, they can generate a payment URL:

```graphql
mutation GeneratePaymentURL {
  expenses {
    generatePaymentUrl(input: {
      expenseSplitId: "uuid"
      paymentMethod: "venmo"  # Optional, uses preferred if not specified
    }) {
      paymentUrl
      paymentMethod
      availableMethods
    }
  }
}
```

This returns a deep link URL that opens the payment app pre-filled with:
- Recipient information
- Amount to pay
- Payment note with expense details

### 4. Payment Flow

1. User taps "Pay" button in the Expenses screen
2. System generates payment URL based on payee's preferred payment method
3. Payment app opens with pre-filled payment details
4. User completes payment in the app
5. User confirms payment completion
6. System marks the expense split as paid

## Payment URL Formats

### Venmo
```
venmo://paycharge?recipients=username&txn=pay&amount=25.00&note=Groceries
```

### PayPal
```
https://www.paypal.me/username/25.00USD
```

### Cash App
```
https://cash.app/$username/25.00
```

### Zelle
```
https://www.zellepay.com/send?to=email@example.com&amount=25.00
```

## Database Schema

### New Fields in `profiles` Table

```sql
ALTER TABLE public.profiles 
ADD COLUMN venmo_handle TEXT,
ADD COLUMN paypal_email TEXT,
ADD COLUMN cashapp_handle TEXT,
ADD COLUMN zelle_email TEXT,
ADD COLUMN preferred_payment_method TEXT;
```

### New Fields in `expense_splits` Table

```sql
ALTER TABLE public.expense_splits 
ADD COLUMN payment_url TEXT,
ADD COLUMN payment_method TEXT;
```

## Backend Implementation

### Payment URL Generator

The `PaymentURLGenerator` class in `backend/app/utils/payment_urls.py` handles generating platform-specific deep links:

```python
from app.utils.payment_urls import PaymentURLGenerator

# Generate Venmo URL
url = PaymentURLGenerator.generate_venmo_url(
    username="johndoe",
    amount=25.00,
    note="Groceries - Weekly shopping"
)

# Generate for any method
url = PaymentURLGenerator.generate_payment_url(
    payment_method="venmo",
    payment_info={"venmo_handle": "johndoe"},
    amount=25.00,
    note="Groceries"
)
```

### GraphQL Mutations

- `generatePaymentUrl` - Generates payment URL for an expense split
- `markExpensePaid` - Marks an expense split as paid
- `createExpense` - Creates expense with automatic splits
- `updateProfile` - Updates user payment handles

## Frontend Implementation

### Expenses Screen

The expenses screen (`frontend/app/(tabs)/expenses.tsx`) displays:

- List of expenses the user owes
- Amount owed per expense
- Payment status (paid/unpaid)
- "Pay" button that opens payment app
- "Mark as Paid" button for manual confirmation

### Key Features

- **Pull to refresh** - Refresh expense list
- **Auto payment method selection** - Uses payee's preferred method
- **Fallback handling** - If payment app not installed, shows URL to copy
- **Payment confirmation** - After opening payment app, asks user to confirm completion

## Testing the Integration

### 1. Apply Database Migration

```bash
psql $DATABASE_URL -f database/migrations/add_payment_fields.sql
```

### 2. Set Up User Payment Info

Use GraphQL playground or app to add payment handles:

```graphql
mutation {
  profiles {
    updateProfile(input: {
      venmoHandle: "testuser"
      preferredPaymentMethod: "venmo"
    }) {
      id
    }
  }
}
```

### 3. Create Test Expense

```graphql
mutation {
  expenses {
    createExpense(input: {
      householdId: "your-household-id"
      title: "Test Expense"
      amount: 50.00
      splitWith: ["user1", "user2"]
    }) {
      id
    }
  }
}
```

### 4. Test Payment Flow

1. Open Expenses screen in app
2. Tap "Pay" on an unpaid expense
3. Should open Venmo (or selected app) with pre-filled details
4. Confirm payment in app
5. Confirm completion in Cohab app

## Fee Structure

| Platform | Friends/Family | Goods/Services | Notes |
|----------|---------------|----------------|-------|
| Venmo | **Free** | 3% | Use friends/family payment |
| PayPal | **Free** | 2.9% + $0.30 | Use PayPal.me for P2P |
| Cash App | **Free** | 2.75% | Standard transfers are free |
| Zelle | **Always Free** | N/A | Bank-to-bank, instant |

**Recommendation**: Use Zelle for guaranteed no fees, or Venmo/Cash App for convenience with free P2P transfers.

## Security Considerations

1. **No sensitive data stored** - Only usernames/handles are stored, not account numbers
2. **User-initiated payments** - System generates URLs but users complete payments in their apps
3. **Manual confirmation** - Users must confirm payment completion
4. **No payment processing** - We don't handle any payment processing ourselves

## Future Enhancements

- [ ] Split verification - Payee can verify receipt
- [ ] Payment reminders - Send notifications for overdue payments
- [ ] Recurring expenses - Automatically create recurring bills
- [ ] Receipt uploads - Attach receipt images to expenses
- [ ] Settlement suggestions - Suggest optimal payment flows
- [ ] Multi-currency support - Handle different currencies
- [ ] Split customization - Non-equal splits, percentages

## Troubleshoptions

### Payment app doesn't open

- Ensure payment app is installed
- Check app supports deep links
- Use "Copy URL" option and paste in browser

### "User has not set up payment methods"

- User needs to add at least one payment handle in profile settings

### Payment URL is invalid

- Verify payment handle is correct (no @ for Venmo, no $ for Cash App)
- Check preferred payment method is one the payee has configured

## Support

For issues or questions:
1. Check this documentation
2. Review backend logs for payment URL generation errors
3. Verify database fields were added correctly
4. Test with known working payment handles
