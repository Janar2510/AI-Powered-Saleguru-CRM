-- Add missing columns to existing tables
-- Run this in your Supabase SQL Editor

-- Step 1: Add created_by column to quotations table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotations' AND column_name = 'created_by'
    ) THEN
        ALTER TABLE quotations ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added created_by column to quotations table';
    ELSE
        RAISE NOTICE 'created_by column already exists in quotations table';
    END IF;
END $$;

-- Step 2: Add created_by column to generated_documents table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'generated_documents' AND column_name = 'created_by'
    ) THEN
        ALTER TABLE generated_documents ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added created_by column to generated_documents table';
    ELSE
        RAISE NOTICE 'created_by column already exists in generated_documents table';
    END IF;
END $$;

-- Step 3: Create generated_documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id VARCHAR(100) NOT NULL,
  document_data JSONB NOT NULL,
  html_content TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Add any other missing columns to quotations table
DO $$ 
BEGIN
    -- Add missing columns one by one
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotations' AND column_name = 'customer_phone'
    ) THEN
        ALTER TABLE quotations ADD COLUMN customer_phone VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotations' AND column_name = 'company_phone'
    ) THEN
        ALTER TABLE quotations ADD COLUMN company_phone VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotations' AND column_name = 'company_email'
    ) THEN
        ALTER TABLE quotations ADD COLUMN company_email VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotations' AND column_name = 'company_website'
    ) THEN
        ALTER TABLE quotations ADD COLUMN company_website VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotations' AND column_name = 'discount_amount'
    ) THEN
        ALTER TABLE quotations ADD COLUMN discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotations' AND column_name = 'payment_terms'
    ) THEN
        ALTER TABLE quotations ADD COLUMN payment_terms TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotations' AND column_name = 'payment_method'
    ) THEN
        ALTER TABLE quotations ADD COLUMN payment_method VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotations' AND column_name = 'shipping_method'
    ) THEN
        ALTER TABLE quotations ADD COLUMN shipping_method VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotations' AND column_name = 'incoterms'
    ) THEN
        ALTER TABLE quotations ADD COLUMN incoterms VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotations' AND column_name = 'signature_status'
    ) THEN
        ALTER TABLE quotations ADD COLUMN signature_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (signature_status IN ('pending', 'signed', 'not_required'));
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotations' AND column_name = 'proforma_invoice_id'
    ) THEN
        ALTER TABLE quotations ADD COLUMN proforma_invoice_id UUID REFERENCES generated_documents(id) ON DELETE SET NULL;
    END IF;
    
    RAISE NOTICE 'Added all missing columns to quotations table';
END $$;

-- Step 5: Enable RLS if not already enabled
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;

-- Step 6: Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own quotations" ON quotations;
DROP POLICY IF EXISTS "Users can insert their own quotations" ON quotations;
DROP POLICY IF EXISTS "Users can update their own quotations" ON quotations;
DROP POLICY IF EXISTS "Users can delete their own quotations" ON quotations;

DROP POLICY IF EXISTS "Users can view their own generated documents" ON generated_documents;
DROP POLICY IF EXISTS "Users can insert their own generated documents" ON generated_documents;
DROP POLICY IF EXISTS "Users can update their own generated documents" ON generated_documents;
DROP POLICY IF EXISTS "Users can delete their own generated documents" ON generated_documents;

-- Step 7: Create RLS policies
CREATE POLICY "Users can view their own quotations" ON quotations
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can insert their own quotations" ON quotations
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own quotations" ON quotations
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own quotations" ON quotations
  FOR DELETE USING (created_by = auth.uid());

CREATE POLICY "Users can view their own generated documents" ON generated_documents
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can insert their own generated documents" ON generated_documents
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own generated documents" ON generated_documents
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own generated documents" ON generated_documents
  FOR DELETE USING (created_by = auth.uid());

-- Step 8: Grant permissions
GRANT ALL ON quotations TO authenticated;
GRANT ALL ON generated_documents TO authenticated;

-- Step 9: Insert sample data if table is empty
INSERT INTO quotations (
  number, customer_name, customer_email, customer_address, customer_phone,
  company_name, company_address, company_phone, company_email, company_website,
  quotation_date, valid_until, status, items, subtotal, tax_amount,
  discount_amount, total_amount, notes, terms_conditions, template_id,
  payment_terms, payment_method, shipping_method, incoterms, signature_status
) 
SELECT * FROM (VALUES 
(
  'QT-2024-001',
  'ABC Corporation',
  'procurement@abccorp.com',
  '123 Business Ave, Suite 100, New York, NY 10001',
  '+1-555-0123',
  'SaleGuru CRM',
  '123 Business St, City, Country',
  '+1-234-567-8900',
  'hello@salesguru.com',
  'www.salesguru.com',
  '2024-01-15',
  '2024-02-15',
  'sent',
  '[{"id": "item1", "product_name": "Enterprise CRM License", "description": "Annual subscription for 50 users", "quantity": 1, "unit_price": 5000.00, "discount_percent": 10, "tax_rate": 20, "total": 4500.00, "sku": "CRM-ENT-50", "category": "Software"}]',
  5000.00,
  1000.00,
  500.00,
  5500.00,
  'This quotation is valid for 30 days from the date of issue.',
  'Standard terms and conditions apply. Payment due within 14 days.',
  'quotation-modern',
  'Payment is required within 14 business days',
  'Bank Transfer',
  'Standard Shipping',
  'FOB',
  'pending'
)) AS v(
  number, customer_name, customer_email, customer_address, customer_phone,
  company_name, company_address, company_phone, company_email, company_website,
  quotation_date, valid_until, status, items, subtotal, tax_amount,
  discount_amount, total_amount, notes, terms_conditions, template_id,
  payment_terms, payment_method, shipping_method, incoterms, signature_status
)
WHERE NOT EXISTS (SELECT 1 FROM quotations WHERE number = 'QT-2024-001');

-- Step 10: Verify the setup
SELECT 
  '✓ Database setup completed successfully!' as status,
  (SELECT COUNT(*) FROM quotations) as quotation_count,
  (SELECT COUNT(*) FROM generated_documents) as document_count; 