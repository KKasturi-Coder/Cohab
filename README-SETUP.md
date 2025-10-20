# Cohab App - Supabase & Railway Setup Guide

## 🚀 Quick Setup

### 1. Supabase Setup

1. **Create a Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Sign up/Login and create a new project
   - Choose a name like "cohab-app"

2. **Get Your Credentials:**
   - Go to Settings → API
   - Copy your Project URL and anon/public key

3. **Update Environment Variables:**
   ```bash
   # Edit .env file with your actual credentials
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Set Up Database:**
   - Go to SQL Editor in Supabase dashboard
   - Copy and paste the contents of `database/schema.sql`
   - Run the SQL to create all tables and policies

### 2. Railway Setup (Optional)

If you want to deploy your app to Railway:

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Deploy:**
   ```bash
   railway up
   ```

### 3. Test Your Setup

Create a test file to verify everything works:

```typescript
// app/test-supabase.tsx
import { supabase } from '@/lib/supabase'
import { auth, profiles } from '@/lib/supabase-helpers'

export default function TestSupabase() {
  const testConnection = async () => {
    try {
      // Test connection
      const { data, error } = await supabase.from('profiles').select('*').limit(1)
      if (error) throw error
      console.log('✅ Supabase connection successful!')
    } catch (error) {
      console.error('❌ Supabase connection failed:', error)
    }
  }

  return (
    <View>
      <Button title="Test Supabase" onPress={testConnection} />
    </View>
  )
}
```

## 📁 Project Structure

```
cohab/
├── lib/
│   ├── supabase.ts              # Supabase client
│   ├── database.types.ts         # TypeScript types
│   └── supabase-helpers.ts      # Helper functions
├── database/
│   └── schema.sql               # Database schema
├── .env                         # Environment variables
├── railway.json                 # Railway deployment config
└── .railwayignore              # Files to ignore in Railway
```

## 🔧 Available Helper Functions

### Authentication
- `auth.signUp(email, password, fullName?)`
- `auth.signIn(email, password)`
- `auth.signOut()`
- `auth.getCurrentUser()`

### Profiles
- `profiles.getProfile(userId)`
- `profiles.updateProfile(userId, updates)`
- `profiles.createProfile(profile)`

### Rooms
- `rooms.getRooms()`
- `rooms.getRoom(roomId)`
- `rooms.createRoom(room)`
- `rooms.updateRoom(roomId, updates)`

### Roommates
- `roommates.joinRoom(roomId, userId)`
- `roommates.acceptRoommate(roommateId)`
- `roommates.getRoommates(roomId)`

### Expenses
- `expenses.getExpenses(roomId)`
- `expenses.createExpense(expense)`
- `expenses.createExpenseSplit(expenseId, userId, amount)`

### Messages
- `messages.getMessages(roomId)`
- `messages.sendMessage(message)`

### Real-time
- `subscribeToRoom(roomId, callback)`
- `subscribeToExpenses(roomId, callback)`

## 🛠️ Next Steps

1. **Update your .env file** with real Supabase credentials
2. **Run the database schema** in Supabase SQL Editor
3. **Test the connection** using the test file
4. **Start building your app** using the helper functions!

## 🐛 Troubleshooting

### Common Issues:

1. **"Missing Supabase environment variables"**
   - Make sure your .env file has the correct variable names
   - Restart your development server after adding .env

2. **Database connection errors**
   - Check your Supabase URL and key are correct
   - Ensure your database schema has been run

3. **Railway deployment issues**
   - Make sure Railway CLI is installed
   - Check your railway.json configuration

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Expo Documentation](https://docs.expo.dev/)
- [Railway Documentation](https://docs.railway.app/)
