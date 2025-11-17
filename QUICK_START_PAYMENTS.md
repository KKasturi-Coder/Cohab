# 🚀 Quick Start: Real Payment Expensing

## 3-Step Setup

### Step 1: Database (30 seconds)
```bash
psql $DATABASE_URL -f database/migrations/add_payment_fields.sql
```

### Step 2: Add Payment Info (1 minute)
Use GraphQL playground to add your payment handles:

```graphql
mutation {
  profiles {
    updateProfile(input: {
      venmoHandle: "johndoe"
      preferredPaymentMethod: "venmo"
    }) {
      id
    }
  }
}
```

### Step 3: Create Test Expense (1 minute)
```graphql
mutation {
  expenses {
    createExpense(input: {
      householdId: "your-household-id"
      title: "Test Groceries"
      amount: 40.00
      splitWith: ["user1_id", "user2_id"]
    }) {
      id
    }
  }
}
```

## ✨ Try It Out

1. Open the **Expenses** tab in Cohab app
2. You'll see the expense you owe ($20.00)
3. Tap **"Pay with Venmo"**
4. Venmo opens with pre-filled payment
5. Complete payment in Venmo
6. Return to Cohab and confirm
7. Expense marked as paid! ✓

## 🎯 That's It!

You now have **fee-free payment splitting** working in your app.

## 📚 Learn More

- **Full Documentation**: [PAYMENT_INTEGRATION.md](PAYMENT_INTEGRATION.md)
- **User Guide**: [PAYMENT_SETUP.md](PAYMENT_SETUP.md)
- **Technical Details**: [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)

## 💬 Payment Methods Supported

| App | Fee | Setup |
|-----|-----|-------|
| 💜 Venmo | Free | Add username (no @) |
| 💙 PayPal | Free | Add email |
| 💚 Cash App | Free | Add $cashtag (no $) |
| ⚡ Zelle | Free | Add email/phone |

## 🆘 Common Issues

**"User has not set up any payment methods"**
→ Add payment handles using the GraphQL mutation above

**Payment app doesn't open**
→ Make sure app is installed, or use "Copy URL" option

**Can't see expenses**
→ Pull down to refresh the list

---

**Ready?** Run Step 1 and start splitting expenses! 🎉
