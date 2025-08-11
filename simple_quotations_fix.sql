-- Simple Quotations Database Fix
-- Run this in your Supabase SQL Editor step by step

-- Step 1: Check what exists
SELECT 'Checking existing tables...' as status;

-- Step 2: Create generated_documents table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id VARCHAR(100) NOT NULL,
  document_data JSONB NOT NULL,
  html_content TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create quotations table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number VARCHAR(50) NOT NULL UNIQUE,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_address TEXT,
  customer_phone VARCHAR(50),
  company_name VARCHAR(255) NOT NULL DEFAULT 'SaleGuru CRM',
  company_address TEXT,
  company_phone VARCHAR(50),
  company_email VARCHAR(255),
  company_website VARCHAR(255),
  quotation_date DATE NOT NULL,
  valid_until DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired', 'converted')),
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  notes TEXT,
  terms_conditions TEXT,
  template_id VARCHAR(100),
  payment_terms TEXT,
  payment_method VARCHAR(100),
  shipping_method VARCHAR(100),
  incoterms VARCHAR(20),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  signature_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (signature_status IN ('pending', 'signed', 'not_required')),
  proforma_invoice_id UUID REFERENCES generated_documents(id) ON DELETE SET NULL
);

-- Step 4: Enable RLS
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies (drop existing first)
DROP POLICY IF EXISTS "Users can view their own quotations" ON quotations;
DROP POLICY IF EXISTS "Users can insert their own quotations" ON quotations;
DROP POLICY IF EXISTS "Users can update their own quotations" ON quotations;
DROP POLICY IF EXISTS "Users can delete their own quotations" ON quotations;

DROP POLICY IF EXISTS "Users can view their own generated documents" ON generated_documents;
DROP POLICY IF EXISTS "Users can insert their own generated documents" ON generated_documents;
DROP POLICY IF EXISTS "Users can update their own generated documents" ON generated_documents;
DROP POLICY IF EXISTS "Users can delete their own generated documents" ON generated_documents;

-- Create new policies
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

-- Step 6: Grant permissions
GRANT ALL ON quotations TO authenticated;
GRANT ALL ON generated_documents TO authenticated;

-- Step 7: Insert sample data (only if table is empty)
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

-- Step 8: Verify setup
SELECT 
  '✓ Tables created successfully' as status,
  (SELECT COUNT(*) FROM quotations) as quotation_count,
  (SELECT COUNT(*) FROM generated_documents) as document_count; 