-- Quick Database Verification Queries
-- Run these one by one in Supabase SQL Editor

-- 1. BASIC TABLE CHECK - Should return 7 tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('profiles', 'rooms', 'roommates', 'expenses', 'expense_splits', 'messages', 'notifications')
ORDER BY table_name;

-- 2. RLS CHECK - All should show 't' (true) for rls_enabled
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'rooms', 'roommates', 'expenses', 'expense_splits', 'messages', 'notifications')
ORDER BY tablename;

-- 3. POLICY COUNT - Should show policies for each table
SELECT 
    tablename,
    count(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'rooms', 'roommates', 'expenses', 'expense_splits', 'messages', 'notifications')
GROUP BY tablename
ORDER BY tablename;

-- 4. FOREIGN KEY CHECK - Should show relationships
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS references_table
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- 5. TRIGGER CHECK - Should show update triggers
SELECT 
    trigger_name,
    event_object_table
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
    AND trigger_name LIKE '%updated_at%'
ORDER BY event_object_table;
