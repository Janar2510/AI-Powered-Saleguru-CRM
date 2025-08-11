-- Add Missing Foreign Key Columns (2025-08-07)
-- This adds missing foreign key columns to tables

-- ===========================================
-- ADD MISSING FOREIGN KEY COLUMNS
-- ===========================================

-- Add customer_id column to quotations table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'quotations' 
        AND column_name = 'customer_id'
    ) THEN
        ALTER TABLE quotations ADD COLUMN customer_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
    END IF;
END $$;

-- Add customer_id column to sales_orders table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sales_orders' 
        AND column_name = 'customer_id'
    ) THEN
        ALTER TABLE sales_orders ADD COLUMN customer_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
    END IF;
END $$;

-- Add customer_id column to invoices table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'invoices' 
        AND column_name = 'customer_id'
    ) THEN
        ALTER TABLE invoices ADD COLUMN customer_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
    END IF;
END $$;

-- Add customer_id column to documents table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'documents' 
        AND column_name = 'customer_id'
    ) THEN
        ALTER TABLE documents ADD COLUMN customer_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
    END IF;
END $$;

-- Add customer_id column to email_communications table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'email_communications' 
        AND column_name = 'customer_id'
    ) THEN
        ALTER TABLE email_communications ADD COLUMN customer_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
    END IF;
END $$;

-- Add customer_id column to customer_portal_access table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'customer_portal_access' 
        AND column_name = 'customer_id'
    ) THEN
        ALTER TABLE customer_portal_access ADD COLUMN customer_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
    END IF;
END $$;

-- Add document_id column to document_signatures table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'document_signatures' 
        AND column_name = 'document_id'
    ) THEN
        ALTER TABLE document_signatures ADD COLUMN document_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
    END IF;
END $$;

-- Add customer_id column to document_signatures table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'document_signatures' 
        AND column_name = 'customer_id'
    ) THEN
        ALTER TABLE document_signatures ADD COLUMN customer_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
    END IF;
END $$;

-- Add template_id column to email_communications table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'email_communications' 
        AND column_name = 'template_id'
    ) THEN
        ALTER TABLE email_communications ADD COLUMN template_id UUID;
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

-- Check customer_portal_access table structure
SELECT 
    'customer_portal_access' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'customer_portal_access'
ORDER BY ordinal_position;

-- Check document_signatures table structure
SELECT 
    'document_signatures' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'document_signatures'
ORDER BY ordinal_position;

-- Success message
SELECT 'Missing foreign key columns added successfully!' as status; 