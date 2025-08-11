-- Diagnostic Check (2025-08-07)
-- This checks what tables and columns actually exist

-- ===========================================
-- CHECK ALL TABLES IN PUBLIC SCHEMA
-- ===========================================

SELECT 
    table_name,
    'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- ===========================================
-- CHECK COLUMNS IN EACH TABLE
-- ===========================================

-- Check customers table structure
SELECT 
    'customers' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'customers'
ORDER BY ordinal_position;

-- Check products table structure
SELECT 
    'products' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'products'
ORDER BY ordinal_position;

-- Check quotations table structure
SELECT 
    'quotations' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'quotations'
ORDER BY ordinal_position;

-- Check sales_orders table structure
SELECT 
    'sales_orders' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'sales_orders'
ORDER BY ordinal_position;

-- Check invoices table structure
SELECT 
    'invoices' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'invoices'
ORDER BY ordinal_position;

-- ===========================================
-- CHECK EXISTING POLICIES
-- ===========================================

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
-- CHECK EXISTING INDEXES
-- ===========================================

SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Success message
SELECT 'Diagnostic check completed!' as status; 