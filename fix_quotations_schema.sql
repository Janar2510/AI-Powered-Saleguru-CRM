-- Fix Quotations Schema (2025-08-07)
-- This script ensures the quotations table has all required columns

-- Drop and recreate the quotations table to ensure correct schema
DROP TABLE IF EXISTS quotation_items CASCADE;
DROP TABLE IF EXISTS quotations CASCADE;

-- Recreate quotations table with correct schema
CREATE TABLE IF NOT EXISTS quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  quotation_date DATE DEFAULT CURRENT_DATE,
  valid_until DATE,
  status TEXT DEFAULT 'draft',
  subject TEXT,
  subtotal DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate quotation_items table
CREATE TABLE IF NOT EXISTS quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable all access for authenticated users" ON quotations
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON quotation_items
  FOR ALL USING (auth.role() = 'authenticated');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quotations_quotation_date ON quotations(quotation_date);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation_id ON quotation_items(quotation_id);

-- Insert sample data
INSERT INTO quotations (quotation_number, customer_name, quotation_date, valid_until, status, subject, subtotal, tax_amount, total_amount, currency) VALUES
  ('Q000001', 'Sample Customer', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'draft', 'Sample Quotation', 1000.00, 200.00, 1200.00, 'EUR'),
  ('Q000002', 'Another Customer', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'sent', 'Service Quote', 2500.00, 500.00, 3000.00, 'EUR')
ON CONFLICT (quotation_number) DO NOTHING;

-- Insert sample items
INSERT INTO quotation_items (quotation_id, product_name, description, quantity, unit_price, total_price) 
SELECT 
  q.id,
  'Sample Product',
  'This is a sample product description',
  2,
  500.00,
  1000.00
FROM quotations q 
WHERE q.quotation_number = 'Q000001'
ON CONFLICT DO NOTHING;

SELECT 'Quotations schema fixed successfully!' as status; 