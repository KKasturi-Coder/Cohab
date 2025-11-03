
-- Create households/houses table
CREATE TABLE public.households (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  rent_amount DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  household_type TEXT CHECK (household_type IN ('private', 'shared', 'studio', 'apartment')),
  amenities TEXT[],
  images TEXT[],
  is_available BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create roommates table
CREATE TABLE public.roommates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  household_id UUID REFERENCES public.households(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'left')) DEFAULT 'pending',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, household_id)
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID REFERENCES public.households(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  category TEXT CHECK (category IN ('rent', 'utilities', 'groceries', 'cleaning', 'maintenance', 'other')),
  paid_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE
);

-- Create expense splits table
CREATE TABLE public.expense_splits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id UUID REFERENCES public.expenses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  is_paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(expense_id, user_id)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID REFERENCES public.households(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('text', 'image', 'file', 'expense')) DEFAULT 'text',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('expense', 'message', 'roommate', 'system')) NOT NULL,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_roommates_user_id ON public.roommates(user_id);
CREATE INDEX idx_roommates_household_id ON public.roommates(household_id);
CREATE INDEX idx_expenses_household_id ON public.expenses(household_id);
CREATE INDEX idx_expense_splits_expense_id ON public.expense_splits(expense_id);
CREATE INDEX idx_messages_household_id ON public.messages(household_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roommates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles: Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Households: Users can view households they're part of, create households
CREATE POLICY "Users can view households they're in" ON public.households
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.roommates 
      WHERE roommates.household_id = households.id 
      AND roommates.user_id = auth.uid()
      AND roommates.status = 'accepted'
    )
  );

CREATE POLICY "Users can create households" ON public.households
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Roommates: Users can view roommates in their households
CREATE POLICY "Users can view roommates in their households" ON public.roommates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.roommates rm2
      WHERE rm2.household_id = roommates.household_id 
      AND rm2.user_id = auth.uid()
      AND rm2.status = 'accepted'
    )
  );

-- Expenses: Users can view expenses in their households
CREATE POLICY "Users can view expenses in their households" ON public.expenses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.roommates 
      WHERE roommates.household_id = expenses.household_id 
      AND roommates.user_id = auth.uid()
      AND roommates.status = 'accepted'
    )
  );

-- Messages: Users can view messages in their households
CREATE POLICY "Users can view messages in their households" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.roommates 
      WHERE roommates.household_id = messages.household_id 
      AND roommates.user_id = auth.uid()
      AND roommates.status = 'accepted'
    )
  );

-- Notifications: Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_households_updated_at BEFORE UPDATE ON public.households
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
