-- Database Schema Verification Queries
-- Run these in your Supabase SQL Editor to verify everything was created correctly

-- 1. Check if all tables exist
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('profiles', 'households', 'roommates', 'expenses', 'expense_splits', 'messages', 'notifications')
ORDER BY table_name;

-- 2. Check table structures and columns
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('profiles', 'households', 'roommates', 'expenses', 'expense_splits', 'messages', 'notifications')
ORDER BY table_name, ordinal_position;

-- 3. Check if Row Level Security (RLS) is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'households', 'roommates', 'expenses', 'expense_splits', 'messages', 'notifications')
ORDER BY tablename;

-- 4. Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. Check foreign key constraints
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
    AND tc.table_name IN ('profiles', 'households', 'roommates', 'expenses', 'expense_splits', 'messages', 'notifications')
ORDER BY tc.table_name;

-- 6. Check indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'households', 'roommates', 'expenses', 'expense_splits', 'messages', 'notifications')
ORDER BY tablename, indexname;

-- 7. Check triggers
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
    AND event_object_table IN ('profiles', 'households', 'roommates', 'expenses', 'expense_splits', 'messages', 'notifications')
ORDER BY event_object_table, trigger_name;

-- 8. Check functions
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
    AND routine_name LIKE '%update%'
ORDER BY routine_name;

-- 9. Test basic table access (should work if RLS is properly configured)
-- Note: These will only work if you're authenticated
SELECT 'profiles' as table_name, count(*) as row_count FROM public.profiles
UNION ALL
SELECT 'households' as table_name, count(*) as row_count FROM public.households
UNION ALL
SELECT 'roommates' as table_name, count(*) as row_count FROM public.roommates
UNION ALL
SELECT 'expenses' as table_name, count(*) as row_count FROM public.expenses
UNION ALL
SELECT 'expense_splits' as table_name, count(*) as row_count FROM public.expense_splits
UNION ALL
SELECT 'messages' as table_name, count(*) as row_count FROM public.messages
UNION ALL
SELECT 'notifications' as table_name, count(*) as row_count FROM public.notifications;

-- 10. Check specific column constraints and checks
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public' 
    AND tc.table_name IN ('profiles', 'households', 'roommates', 'expenses', 'expense_splits', 'messages', 'notifications')
    AND tc.constraint_type IN ('CHECK', 'UNIQUE')
ORDER BY tc.table_name, tc.constraint_name;
