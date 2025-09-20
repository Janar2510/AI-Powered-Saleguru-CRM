-- Test Database State for Sales Orders
-- Run this to see what tables exist

-- Check if sales_orders table exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'sales_orders') 
        THEN '✅ sales_orders table EXISTS'
        ELSE '❌ sales_orders table MISSING'
    END as table_status;

-- Check if quote_reference column exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'sales_orders' AND column_name = 'quote_reference'
        ) 
        THEN '✅ quote_reference column EXISTS'
        ELSE '❌ quote_reference column MISSING'
    END as column_status;

-- List all tables in public schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- If sales_orders exists, show its structure
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'sales_orders') THEN
        RAISE NOTICE 'sales_orders table structure:';
        RAISE NOTICE '%', (SELECT string_agg(column_name || ' ' || data_type, ', ' ORDER BY ordinal_position) 
                          FROM information_schema.columns 
                          WHERE table_name = 'sales_orders');
    ELSE
        RAISE NOTICE 'sales_orders table does not exist - run the migration first!';
    END IF;
END $$;

