-- Fix Number Columns (2025-08-07)
-- This fixes the number columns issue by using a different approach

-- ===========================================
-- ADD NUMBER COLUMNS WITHOUT UNIQUE CONSTRAINT FIRST
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
        ALTER TABLE quotations ADD COLUMN quotation_number TEXT;
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
        ALTER TABLE sales_orders ADD COLUMN order_number TEXT;
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
        ALTER TABLE invoices ADD COLUMN invoice_number TEXT;
    END IF;
END $$;

-- ===========================================
-- UPDATE EXISTING RECORDS WITH UNIQUE NUMBERS
-- ===========================================

-- Update existing quotations with unique numbers
UPDATE quotations 
SET quotation_number = 'Q' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 6, '0')
WHERE quotation_number IS NULL OR quotation_number = '';

-- Update existing sales orders with unique numbers
UPDATE sales_orders 
SET order_number = 'SO' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 6, '0')
WHERE order_number IS NULL OR order_number = '';

-- Update existing invoices with unique numbers
UPDATE invoices 
SET invoice_number = 'I' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 6, '0')
WHERE invoice_number IS NULL OR invoice_number = '';

-- ===========================================
-- ADD UNIQUE CONSTRAINTS AFTER DATA IS FIXED
-- ===========================================

-- Add unique constraint to quotation_number
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'quotations_quotation_number_key'
    ) THEN
        ALTER TABLE quotations ADD CONSTRAINT quotations_quotation_number_key UNIQUE (quotation_number);
    END IF;
END $$;

-- Add unique constraint to order_number
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'sales_orders_order_number_key'
    ) THEN
        ALTER TABLE sales_orders ADD CONSTRAINT sales_orders_order_number_key UNIQUE (order_number);
    END IF;
END $$;

-- Add unique constraint to invoice_number
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'invoices_invoice_number_key'
    ) THEN
        ALTER TABLE invoices ADD CONSTRAINT invoices_invoice_number_key UNIQUE (invoice_number);
    END IF;
END $$;

-- ===========================================
-- ADD MISSING COLUMNS TO TABLES
-- ===========================================

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

-- Success message
SELECT 'Number columns fixed successfully!' as status; 