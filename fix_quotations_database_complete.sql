-- Complete quotations database setup - handles all scenarios
-- Run this in your Supabase SQL Editor

-- First, let's check what tables exist and clean up if needed
DO $$ 
BEGIN
    -- Drop existing tables if they exist (to start fresh)
    DROP TABLE IF EXISTS quotations CASCADE;
    DROP TABLE IF EXISTS generated_documents CASCADE;
    
    -- Drop existing views
    DROP VIEW IF EXISTS quotation_statistics CASCADE;
    
    -- Drop existing triggers
    DROP TRIGGER IF EXISTS update_quotations_updated_at ON quotations;
    
    -- Drop existing functions
    DROP FUNCTION IF EXISTS update_quotations_updated_at() CASCADE;
    
    RAISE NOTICE 'Cleaned up existing tables and objects';
END $$;

-- Create generated_documents table first (since quotations references it)
CREATE TABLE generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id VARCHAR(100) NOT NULL,
  document_data JSONB NOT NULL,
  html_content TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quotations table
CREATE TABLE quotations (
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

-- Create indexes for better performance
CREATE INDEX idx_quotations_number ON quotations(number);
CREATE INDEX idx_quotations_customer_name ON quotations(customer_name);
CREATE INDEX idx_quotations_status ON quotations(status);
CREATE INDEX idx_quotations_created_by ON quotations(created_by);
CREATE INDEX idx_quotations_created_at ON quotations(created_at);
CREATE INDEX idx_quotations_quotation_date ON quotations(quotation_date);

-- Enable RLS
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for quotations
CREATE POLICY "Users can view their own quotations" ON quotations
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can insert their own quotations" ON quotations
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own quotations" ON quotations
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own quotations" ON quotations
  FOR DELETE USING (created_by = auth.uid());

-- Create RLS policies for generated_documents
CREATE POLICY "Users can view their own generated documents" ON generated_documents
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can insert their own generated documents" ON generated_documents
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own generated documents" ON generated_documents
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own generated documents" ON generated_documents
  FOR DELETE USING (created_by = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_quotations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_quotations_updated_at
  BEFORE UPDATE ON quotations
  FOR EACH ROW
  EXECUTE FUNCTION update_quotations_updated_at();

-- Insert sample quotations data
INSERT INTO quotations (
  number,
  customer_name,
  customer_email,
  customer_address,
  customer_phone,
  company_name,
  company_address,
  company_phone,
  company_email,
  company_website,
  quotation_date,
  valid_until,
  status,
  items,
  subtotal,
  tax_amount,
  discount_amount,
  total_amount,
  notes,
  terms_conditions,
  template_id,
  payment_terms,
  payment_method,
  shipping_method,
  incoterms,
  signature_status
) VALUES 
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
  '[
    {
      "id": "item1",
      "product_name": "Enterprise CRM License",
      "description": "Annual subscription for 50 users",
      "quantity": 1,
      "unit_price": 5000.00,
      "discount_percent": 10,
      "tax_rate": 20,
      "total": 4500.00,
      "sku": "CRM-ENT-50",
      "category": "Software"
    },
    {
      "id": "item2", 
      "product_name": "Implementation Services",
      "description": "Professional setup and training",
      "quantity": 40,
      "unit_price": 150.00,
      "discount_percent": 0,
      "tax_rate": 20,
      "total": 6000.00,
      "sku": "SVC-IMP",
      "category": "Services"
    }
  ]',
  11000.00,
  2200.00,
  500.00,
  12700.00,
  'This quotation is valid for 30 days from the date of issue.',
  'Standard terms and conditions apply. Payment due within 14 days.',
  'quotation-modern',
  'Payment is required within 14 business days',
  'Bank Transfer',
  'Standard Shipping',
  'FOB',
  'pending'
),
(
  'QT-2024-002',
  'Tech Startup Inc',
  'ceo@techstartup.com',
  '456 Innovation Drive, San Francisco, CA 94105',
  '+1-555-0456',
  'SaleGuru CRM',
  '123 Business St, City, Country',
  '+1-234-567-8900',
  'hello@salesguru.com',
  'www.salesguru.com',
  '2024-01-20',
  '2024-02-20',
  'accepted',
  '[
    {
      "id": "item1",
      "product_name": "Startup CRM Package",
      "description": "Monthly subscription for 10 users",
      "quantity": 1,
      "unit_price": 299.00,
      "discount_percent": 20,
      "tax_rate": 20,
      "total": 239.20,
      "sku": "CRM-START-10",
      "category": "Software"
    }
  ]',
  299.00,
  59.80,
  59.80,
  299.00,
  'Special startup pricing available.',
  'Monthly billing with annual commitment.',
  'quotation-classic',
  'Payment is required within 14 business days',
  'Credit Card',
  'Digital Delivery',
  'FOB',
  'signed'
),
(
  'QT-2024-003',
  'Manufacturing Co',
  'purchasing@manufacturing.com',
  '789 Industrial Blvd, Detroit, MI 48201',
  '+1-555-0789',
  'SaleGuru CRM',
  '123 Business St, City, Country',
  '+1-234-567-8900',
  'hello@salesguru.com',
  'www.salesguru.com',
  '2024-01-25',
  '2024-02-25',
  'draft',
  '[
    {
      "id": "item1",
      "product_name": "Enterprise CRM License",
      "description": "Annual subscription for 200 users",
      "quantity": 1,
      "unit_price": 15000.00,
      "discount_percent": 15,
      "tax_rate": 20,
      "total": 12750.00,
      "sku": "CRM-ENT-200",
      "category": "Software"
    },
    {
      "id": "item2",
      "product_name": "Custom Integration",
      "description": "ERP system integration services",
      "quantity": 80,
      "unit_price": 200.00,
      "discount_percent": 0,
      "tax_rate": 20,
      "total": 16000.00,
      "sku": "SVC-INT",
      "category": "Services"
    },
    {
      "id": "item3",
      "product_name": "Training Sessions",
      "description": "On-site training for 50 users",
      "quantity": 5,
      "unit_price": 500.00,
      "discount_percent": 10,
      "tax_rate": 20,
      "total": 2250.00,
      "sku": "SVC-TRAIN",
      "category": "Services"
    }
  ]',
  31000.00,
  6200.00,
  4650.00,
  32550.00,
  'Volume discount applied for enterprise customers.',
  'Enterprise terms and conditions with SLA guarantees.',
  'quotation-modern',
  'Payment is required within 30 business days',
  'Bank Transfer',
  'Standard Shipping',
  'FOB',
  'pending'
);

-- Create view for quotation statistics
CREATE OR REPLACE VIEW quotation_statistics AS
SELECT 
  COUNT(*) as total_quotations,
  COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_quotations,
  COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_quotations,
  COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_quotations,
  COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_quotations,
  COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_quotations,
  COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted_quotations,
  SUM(total_amount) as total_value,
  AVG(total_amount) as average_value,
  COUNT(CASE WHEN signature_status = 'signed' THEN 1 END) as signed_quotations
FROM quotations
WHERE created_by = auth.uid();

-- Grant permissions
GRANT ALL ON quotations TO authenticated;
GRANT ALL ON generated_documents TO authenticated;
GRANT ALL ON quotation_statistics TO authenticated;

-- Verify the setup
DO $$
BEGIN
    -- Check if tables were created successfully
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quotations') THEN
        RAISE NOTICE '✓ quotations table created successfully';
    ELSE
        RAISE EXCEPTION '✗ quotations table creation failed';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'generated_documents') THEN
        RAISE NOTICE '✓ generated_documents table created successfully';
    ELSE
        RAISE EXCEPTION '✗ generated_documents table creation failed';
    END IF;
    
    -- Check if sample data was inserted
    IF (SELECT COUNT(*) FROM quotations) >= 3 THEN
        RAISE NOTICE '✓ Sample data inserted successfully';
    ELSE
        RAISE EXCEPTION '✗ Sample data insertion failed';
    END IF;
    
    RAISE NOTICE '🎉 Quotations database setup completed successfully!';
END $$; 