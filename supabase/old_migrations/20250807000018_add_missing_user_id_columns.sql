-- Add Missing user_id Columns (2025-08-07)
-- This adds user_id columns to tables that don't have them

-- ===========================================
-- ADD USER_ID COLUMN TO TABLES THAT DON'T HAVE IT
-- ===========================================

-- Add user_id column to quotations table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'quotations' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE quotations ADD COLUMN user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
    END IF;
END $$;

-- Add user_id column to sales_orders table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sales_orders' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE sales_orders ADD COLUMN user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
    END IF;
END $$;

-- Add user_id column to invoices table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'invoices' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE invoices ADD COLUMN user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
    END IF;
END $$;

-- Add user_id column to documents table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'documents' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE documents ADD COLUMN user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
    END IF;
END $$;

-- Add user_id column to email_templates table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'email_templates' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE email_templates ADD COLUMN user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
    END IF;
END $$;

-- Add user_id column to email_communications table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'email_communications' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE email_communications ADD COLUMN user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
    END IF;
END $$;

-- ===========================================
-- VERIFY COLUMNS WERE ADDED
-- ===========================================

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

-- Check documents table structure
SELECT 
    'documents' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'documents'
ORDER BY ordinal_position;

-- Check email_templates table structure
SELECT 
    'email_templates' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'email_templates'
ORDER BY ordinal_position;

-- Check email_communications table structure
SELECT 
    'email_communications' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'email_communications'
ORDER BY ordinal_position;

-- Success message
SELECT 'Missing user_id columns added successfully!' as status; 