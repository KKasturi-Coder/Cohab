# Quick Payment Setup Guide

## 🚀 Getting Started with Real Payments

### Step 1: Apply Database Migration

Run the migration to add payment fields to your database:

```bash
# Connect to your Supabase database
psql $DATABASE_URL -f database/migrations/add_payment_fields.sql
```

Or execute in Supabase SQL Editor:
```sql
-- See database/migrations/add_payment_fields.sql
```

### Step 2: Add Your Payment Information

Users need to add their payment handles through the app or GraphQL:

#### Option A: Via GraphQL (for testing)

```graphql
mutation {
  profiles {
    updateProfile(input: {
      venmoHandle: "your_venmo_username"
      paypalEmail: "your_paypal@email.com"
      cashappHandle: "your_cashtag"
      zelleEmail: "your_zelle@email.com"
      preferredPaymentMethod: "venmo"
    }) {
      id
      venmoHandle
      preferredPaymentMethod
    }
  }
}
```

#### Option B: Via Profile Settings (Coming Soon)
- Navigate to Profile Settings
- Add payment handles
- Select preferred payment method

### Step 3: Create an Expense

```graphql
mutation {
  expenses {
    createExpense(input: {
      householdId: "your-household-id"
      title: "Groceries"
      description: "Weekly shopping at Trader Joe's"
      amount: 120.00
      currency: "USD"
      category: "groceries"
      dueDate: "2024-12-31"
      splitWith: ["user_id_1", "user_id_2", "user_id_3"]
    }) {
      id
      title
      amount
    }
  }
}
```

The expense is automatically split evenly among all users in `splitWith`.

### Step 4: Pay Your Share

1. **Open the Expenses screen** in the Cohab app
2. **Find your unpaid expenses** - they'll show who paid and how much you owe
3. **Tap "Pay with [App]"** - automatically opens Venmo, PayPal, Cash App, or Zelle
4. **Complete the payment** in the payment app
5. **Confirm completion** when prompted back in Cohab

### Step 5: Mark as Paid

After paying, the app will ask if you completed the payment:
- Select **"Yes, Mark as Paid"** if payment was successful
- Select **"Not Yet"** if you want to pay later

You can also manually mark expenses as paid using the "Mark as Paid" button.

## 💡 Tips for Best Experience

### For Payees (Who Paid the Bill)
1. **Set up multiple payment methods** - Gives payers more options
2. **Set a preferred method** - This will be suggested first
3. **Keep your payment info updated** - Old handles won't work

### For Payers (Who Owe Money)
1. **Have payment apps installed** - Venmo, Cash App, Zelle, or PayPal
2. **Pay promptly** - Respect due dates
3. **Confirm after paying** - Keeps everyone's records accurate

## 📱 Payment Methods Guide

### Venmo
- **Setup**: Add your Venmo username (without the @)
- **Fee**: Free for personal payments
- **Best for**: Quick payments between friends

### PayPal
- **Setup**: Add your PayPal email address
- **Fee**: Free for friends/family (PayPal.me)
- **Best for**: When others don't have Venmo/Cash App

### Cash App
- **Setup**: Add your $cashtag (without the $)
- **Fee**: Free for standard transfers
- **Best for**: Instant transfers

### Zelle
- **Setup**: Add your Zelle email or phone number
- **Fee**: Always free
- **Best for**: Bank-to-bank transfers, no fees ever

## ⚠️ Troubleshooting

### "User has not set up any payment methods"
**Solution**: The person who paid needs to add their payment information in profile settings.

### Payment app doesn't open
**Solutions**:
1. Make sure the app is installed on your device
2. Try the "Copy URL" option and paste in your browser
3. Use the "Mark as Paid" option if you paid through another method

### Wrong payment amount showing
**Solution**: Contact the person who created the expense to update it.

### Can't find my expenses
**Solutions**:
1. Pull down to refresh the expenses list
2. Make sure you're logged in
3. Check that you're a member of the household

## 🔒 Security & Privacy

- **No payment processing**: We don't handle any actual money transfers
- **No sensitive data**: Only usernames/handles are stored
- **User control**: You initiate all payments in your payment app
- **Manual confirmation**: You confirm when payments are complete

## 📞 Need Help?

If you encounter issues:
1. Check this guide first
2. Review the detailed [Payment Integration documentation](PAYMENT_INTEGRATION.md)
3. Contact your household admin
4. File an issue on GitHub (if applicable)

## 🎯 Quick Reference

| Action | Where | How |
|--------|-------|-----|
| Add payment info | Profile Settings | Update profile with payment handles |
| Create expense | Expenses Screen | Use "Create Expense" button |
| Pay expense | Expenses Screen | Tap "Pay with App" button |
| Mark as paid | Expenses Screen | Tap "Mark as Paid" button |
| View history | Expenses Screen | See all your expense history |

---

**Ready to get started?** Apply the database migration and add your payment information!
