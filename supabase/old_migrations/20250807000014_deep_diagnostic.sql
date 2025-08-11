-- Deep Diagnostic (2025-08-07)
-- This checks what's causing the user_id error

-- ===========================================
-- CHECK ALL TABLES AND THEIR COLUMNS
-- ===========================================

-- List all tables in public schema
SELECT 
    table_name,
    'TABLE' as object_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- ===========================================
-- CHECK SPECIFIC TABLES FOR USER_ID COLUMN
-- ===========================================

-- Check if invoices table exists and what columns it has
SELECT 
    'invoices' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'invoices'
ORDER BY ordinal_position;

-- Check if customers table exists and what columns it has
SELECT 
    'customers' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'customers'
ORDER BY ordinal_position;

-- Check if products table exists and what columns it has
SELECT 
    'products' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'products'
ORDER BY ordinal_position;

-- Check if quotations table exists and what columns it has
SELECT 
    'quotations' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'quotations'
ORDER BY ordinal_position;

-- Check if sales_orders table exists and what columns it has
SELECT 
    'sales_orders' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'sales_orders'
ORDER BY ordinal_position;

-- ===========================================
-- CHECK EXISTING POLICIES THAT MIGHT REFERENCE USER_ID
-- ===========================================

-- List all RLS policies
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

-- ===========================================
-- CHECK EXISTING INDEXES THAT MIGHT REFERENCE USER_ID
-- ===========================================

-- List all indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ===========================================
-- CHECK FOR ANY REFERENCES TO USER_ID IN INDEXES
-- ===========================================

-- Check if any indexes reference user_id
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
AND indexdef LIKE '%user_id%'
ORDER BY tablename, indexname;

-- ===========================================
-- CHECK FOR ANY REFERENCES TO USER_ID IN POLICIES
-- ===========================================

-- Check if any policies reference user_id
SELECT 
    tablename,
    policyname,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND (qual LIKE '%user_id%' OR with_check LIKE '%user_id%')
ORDER BY tablename, policyname;

-- Success message
SELECT 'Deep diagnostic completed!' as status; 