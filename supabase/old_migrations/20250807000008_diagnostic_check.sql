-- Diagnostic Check (2025-08-07)
-- This checks what tables exist and their structure

-- Check what tables exist
SELECT 
    table_name,
    'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('customers', 'products', 'quotations', 'sales_orders', 'invoices')
ORDER BY table_name;

-- Check columns in customers table
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'customers'
ORDER BY ordinal_position;

-- Check columns in products table
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'products'
ORDER BY ordinal_position;

-- Check columns in quotations table
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'quotations'
ORDER BY ordinal_position;

-- Check columns in sales_orders table
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'sales_orders'
ORDER BY ordinal_position;

-- Check columns in invoices table
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'invoices'
ORDER BY ordinal_position; 