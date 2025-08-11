-- Add Missing Number Columns (2025-08-07)
-- This adds missing number columns that the helper functions need

-- ===========================================
-- ADD MISSING NUMBER COLUMNS
-- ===========================================

-- Add quotation_number column to quotations table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'quotations' 
        AND column_name = 'quotation_number'
    ) THEN
        ALTER TABLE quotations ADD COLUMN quotation_number TEXT UNIQUE NOT NULL DEFAULT 'Q000001';
    END IF;
END $$;

-- Add order_number column to sales_orders table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sales_orders' 
        AND column_name = 'order_number'
    ) THEN
        ALTER TABLE sales_orders ADD COLUMN order_number TEXT UNIQUE NOT NULL DEFAULT 'SO000001';
    END IF;
END $$;

-- Add invoice_number column to invoices table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'invoices' 
        AND column_name = 'invoice_number'
    ) THEN
        ALTER TABLE invoices ADD COLUMN invoice_number TEXT UNIQUE NOT NULL DEFAULT 'I000001';
    END IF;
END $$;

-- Add missing columns to quotations table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'quotations' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE quotations ADD COLUMN status TEXT DEFAULT 'draft';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'quotations' 
        AND column_name = 'subject'
    ) THEN
        ALTER TABLE quotations ADD COLUMN subject TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'quotations' 
        AND column_name = 'subtotal'
    ) THEN
        ALTER TABLE quotations ADD COLUMN subtotal DECIMAL(15,2) DEFAULT 0;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'quotations' 
        AND column_name = 'tax_amount'
    ) THEN
        ALTER TABLE quotations ADD COLUMN tax_amount DECIMAL(15,2) DEFAULT 0;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'quotations' 
        AND column_name = 'total_amount'
    ) THEN
        ALTER TABLE quotations ADD COLUMN total_amount DECIMAL(15,2) DEFAULT 0;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'quotations' 
        AND column_name = 'currency'
    ) THEN
        ALTER TABLE quotations ADD COLUMN currency TEXT DEFAULT 'EUR';
    END IF;
END $$;

-- Add missing columns to sales_orders table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sales_orders' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE sales_orders ADD COLUMN status TEXT DEFAULT 'draft';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sales_orders' 
        AND column_name = 'order_date'
    ) THEN
        ALTER TABLE sales_orders ADD COLUMN order_date DATE DEFAULT CURRENT_DATE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sales_orders' 
        AND column_name = 'payment_status'
    ) THEN
        ALTER TABLE sales_orders ADD COLUMN payment_status TEXT DEFAULT 'pending';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sales_orders' 
        AND column_name = 'subtotal'
    ) THEN
        ALTER TABLE sales_orders ADD COLUMN subtotal DECIMAL(15,2) DEFAULT 0;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sales_orders' 
        AND column_name = 'tax_amount'
    ) THEN
        ALTER TABLE sales_orders ADD COLUMN tax_amount DECIMAL(15,2) DEFAULT 0;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sales_orders' 
        AND column_name = 'total_amount'
    ) THEN
        ALTER TABLE sales_orders ADD COLUMN total_amount DECIMAL(15,2) DEFAULT 0;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sales_orders' 
        AND column_name = 'currency'
    ) THEN
        ALTER TABLE sales_orders ADD COLUMN currency TEXT DEFAULT 'EUR';
    END IF;
END $$;

-- Add missing columns to invoices table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'invoices' 
        AND column_name = 'invoice_type'
    ) THEN
        ALTER TABLE invoices ADD COLUMN invoice_type TEXT DEFAULT 'standard';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'invoices' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE invoices ADD COLUMN status TEXT DEFAULT 'draft';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'invoices' 
        AND column_name = 'invoice_date'
    ) THEN
        ALTER TABLE invoices ADD COLUMN invoice_date DATE DEFAULT CURRENT_DATE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'invoices' 
        AND column_name = 'subtotal'
    ) THEN
        ALTER TABLE invoices ADD COLUMN subtotal DECIMAL(15,2) DEFAULT 0;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'invoices' 
        AND column_name = 'tax_amount'
    ) THEN
        ALTER TABLE invoices ADD COLUMN tax_amount DECIMAL(15,2) DEFAULT 0;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'invoices' 
        AND column_name = 'total_amount'
    ) THEN
        ALTER TABLE invoices ADD COLUMN total_amount DECIMAL(15,2) DEFAULT 0;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'invoices' 
        AND column_name = 'currency'
    ) THEN
        ALTER TABLE invoices ADD COLUMN currency TEXT DEFAULT 'EUR';
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

-- Success message
SELECT 'Missing number columns added successfully!' as status; 