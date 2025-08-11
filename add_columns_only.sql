-- Add missing columns to quotations table only
-- Run this in your Supabase SQL Editor

-- Step 1: Show current table structure
SELECT 'Current quotations table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'quotations' 
ORDER BY ordinal_position;

-- Step 2: Add missing columns one by one
DO $$ 
BEGIN
    -- Add created_by column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotations' AND column_name = 'created_by'
    ) THEN
        ALTER TABLE quotations ADD COLUMN created_by UUID;
        RAISE NOTICE 'Added created_by column';
    END IF;
    
    -- Add customer_email column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotations' AND column_name = 'customer_email'
    ) THEN
        ALTER TABLE quotations ADD COLUMN customer_email VARCHAR(255);
        RAISE NOTICE 'Added customer_email column';
    END IF;
    
    -- Add customer_address column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotations' AND column_name = 'customer_address'
    ) THEN
        ALTER TABLE quotations ADD COLUMN customer_address TEXT;
        RAISE NOTICE 'Added customer_address column';
    END IF;
    
    -- Add customer_phone column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotations' AND column_name = 'customer_phone'
    ) THEN
        ALTER TABLE quotations ADD COLUMN customer_phone VARCHAR(50);
        RAISE NOTICE 'Added customer_phone column';
    END IF;
    
    -- Add company_address column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotations' AND column_name = 'company_address'
    ) THEN
        ALTER TABLE quotations ADD COLUMN company_address TEXT;
        RAISE NOTICE 'Added company_address column';
    END IF;
    
    -- Add company_phone column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotations' AND column_name = 'company_phone'
    ) THEN
        ALTER TABLE quotations ADD COLUMN company_phone VARCHAR(50);
        RAISE NOTICE 'Added company_phone column';
    END IF;
    
    -- Add company_email column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotations' AND column_name = 'company_email'
    ) THEN
        ALTER TABLE quotations ADD COLUMN company_email VARCHAR(255);
        RAISE NOTICE 'Added company_email column';
    END IF;
    
    -- Add company_website column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotations' AND column_name = 'company_website'
    ) THEN
        ALTER TABLE quotations ADD COLUMN company_website VARCHAR(255);
        RAISE NOTICE 'Added company_website column';
    END IF;
    
    -- Add valid_until column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotations' AND column_name = 'valid_until'
    ) THEN
        ALTER TABLE quotations ADD COLUMN valid_until DATE;
        RAISE NOTICE 'Added valid_until column';
    END IF;
    
    -- Add items column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotations' AND column_name = 'items'
    ) THEN
        ALTER TABLE quotations ADD COLUMN items JSONB DEFAULT '[]';
        RAISE NOTICE 'Added items column';
    END IF;
    
    -- Add subtotal column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotations' AND column_name = 'subtotal'
    ) THEN
        ALTER TABLE quotations ADD COLUMN subtotal DECIMAL(15,2) DEFAULT 0;
        RAISE NOTICE 'Added subtotal column';
    END IF;
    
    -- Add tax_amount column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotations' AND column_name = 'tax_amount'
    ) THEN
        ALTER TABLE quotations ADD COLUMN tax_amount DECIMAL(15,2) DEFAULT 0;
        RAISE NOTICE 'Added tax_amount column';
    END IF;
    
    -- Add discount_amount column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotations' AND column_name = 'discount_amount'
    ) THEN
        ALTER TABLE quotations ADD COLUMN discount_amount DECIMAL(15,2) DEFAULT 0;
        RAISE NOTICE 'Added discount_amount column';
    END IF;
    
    -- Add total_amount column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotations' AND column_name = 'total_amount'
    ) THEN
        ALTER TABLE quotations ADD COLUMN total_amount DECIMAL(15,2) DEFAULT 0;
        RAISE NOTICE 'Added total_amount column';
    END IF;
    
    -- Add notes column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotations' AND column_name = 'notes'
    ) THEN
        ALTER TABLE quotations ADD COLUMN notes TEXT;
        RAISE NOTICE 'Added notes column';
    END IF;
    
    -- Add terms_conditions column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotations' AND column_name = 'terms_conditions'
    ) THEN
        ALTER TABLE quotations ADD COLUMN terms_conditions TEXT;
        RAISE NOTICE 'Added terms_conditions column';
    END IF;
    
    -- Add template_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotations' AND column_name = 'template_id'
    ) THEN
        ALTER TABLE quotations ADD COLUMN template_id VARCHAR(100);
        RAISE NOTICE 'Added template_id column';
    END IF;
    
    -- Add payment_terms column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotations' AND column_name = 'payment_terms'
    ) THEN
        ALTER TABLE quotations ADD COLUMN payment_terms TEXT;
        RAISE NOTICE 'Added payment_terms column';
    END IF;
    
    -- Add payment_method column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotations' AND column_name = 'payment_method'
    ) THEN
        ALTER TABLE quotations ADD COLUMN payment_method VARCHAR(100);
        RAISE NOTICE 'Added payment_method column';
    END IF;
    
    -- Add shipping_method column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotations' AND column_name = 'shipping_method'
    ) THEN
        ALTER TABLE quotations ADD COLUMN shipping_method VARCHAR(100);
        RAISE NOTICE 'Added shipping_method column';
    END IF;
    
    -- Add incoterms column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotations' AND column_name = 'incoterms'
    ) THEN
        ALTER TABLE quotations ADD COLUMN incoterms VARCHAR(20);
        RAISE NOTICE 'Added incoterms column';
    END IF;
    
    -- Add signature_status column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotations' AND column_name = 'signature_status'
    ) THEN
        ALTER TABLE quotations ADD COLUMN signature_status VARCHAR(20) DEFAULT 'pending';
        RAISE NOTICE 'Added signature_status column';
    END IF;
    
    -- Add proforma_invoice_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotations' AND column_name = 'proforma_invoice_id'
    ) THEN
        ALTER TABLE quotations ADD COLUMN proforma_invoice_id UUID;
        RAISE NOTICE 'Added proforma_invoice_id column';
    END IF;
    
    RAISE NOTICE 'All missing columns have been added to quotations table';
END $$;

-- Step 3: Create generated_documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id VARCHAR(100) NOT NULL,
  document_data JSONB NOT NULL,
  html_content TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Show final table structure
SELECT 'Final quotations table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'quotations' 
ORDER BY ordinal_position;

-- Step 5: Success message
SELECT '✓ All columns added successfully! You can now use the Quotation Builder.' as status; 