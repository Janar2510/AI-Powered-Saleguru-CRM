-- Fix documents table structure and insert sample data
-- This script safely adds missing columns to existing tables

-- Check and add missing columns to documents table
DO $$ BEGIN
  -- Add file_url column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'file_url') THEN
    ALTER TABLE documents ADD COLUMN file_url TEXT;
  END IF;
  
  -- Add type column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'type') THEN
    ALTER TABLE documents ADD COLUMN type VARCHAR(50);
  END IF;
  
  -- Add status column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'status') THEN
    ALTER TABLE documents ADD COLUMN status VARCHAR(50) DEFAULT 'draft';
  END IF;
  
  -- Add internal_signer column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'internal_signer') THEN
    ALTER TABLE documents ADD COLUMN internal_signer VARCHAR(255);
  END IF;
  
  -- Add customer_signer column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'customer_signer') THEN
    ALTER TABLE documents ADD COLUMN customer_signer VARCHAR(255);
  END IF;
  
  -- Add notes column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'notes') THEN
    ALTER TABLE documents ADD COLUMN notes TEXT;
  END IF;
  
END $$;

-- Create other tables if they don't exist
CREATE TABLE IF NOT EXISTS sales_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  number VARCHAR(100) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_address TEXT,
  company_name VARCHAR(255) NOT NULL DEFAULT 'SaleGuru CRM',
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  delivery_date DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'in_production', 'ready_for_delivery', 'delivered', 'cancelled')),
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  items JSONB NOT NULL DEFAULT '[]',
  notes TEXT,
  shipping_method VARCHAR(100),
  payment_terms VARCHAR(100),
  incoterms VARCHAR(50),
  related_quote_id UUID,
  related_deal_id UUID,
  signature_required BOOLEAN DEFAULT true,
  signature_status VARCHAR(50) DEFAULT 'pending' CHECK (signature_status IN ('pending', 'signed', 'not_required')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  number VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  contract_type VARCHAR(50) NOT NULL CHECK (contract_type IN ('service', 'product', 'subscription', 'maintenance')),
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'active', 'renewal', 'expired', 'cancelled')),
  start_date DATE NOT NULL,
  end_date DATE,
  total_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  recurring_amount DECIMAL(10,2),
  billing_frequency VARCHAR(50) CHECK (billing_frequency IN ('monthly', 'quarterly', 'annually')),
  signature_required BOOLEAN DEFAULT true,
  signature_status VARCHAR(50) DEFAULT 'pending' CHECK (signature_status IN ('pending', 'signed', 'not_required')),
  mrr_amount DECIMAL(10,2),
  renewal_date DATE,
  upsell_opportunity BOOLEAN DEFAULT false,
  related_deal_id UUID,
  related_order_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id),
  signed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'documents' AND policyname = 'Users can view documents') THEN
    CREATE POLICY "Users can view documents" ON documents FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'documents' AND policyname = 'Users can insert documents') THEN
    CREATE POLICY "Users can insert documents" ON documents FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sales_orders' AND policyname = 'Users can view sales orders') THEN
    CREATE POLICY "Users can view sales orders" ON sales_orders FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sales_orders' AND policyname = 'Users can insert sales orders') THEN
    CREATE POLICY "Users can insert sales orders" ON sales_orders FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contracts' AND policyname = 'Users can view contracts') THEN
    CREATE POLICY "Users can view contracts" ON contracts FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contracts' AND policyname = 'Users can insert contracts') THEN
    CREATE POLICY "Users can insert contracts" ON contracts FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Begin transaction for data consistency
BEGIN;

-- Insert sample data with auto-generated IDs
INSERT INTO documents (name, type, file_url, status, internal_signer, customer_signer, notes) 
VALUES
  ('Service Agreement - ABC Corp', 'contract', 'https://example.com/contract1.pdf', 'pending', 'John Manager', 'jane@abccorp.com', 'Standard service agreement'),
  ('NDA - Tech Startup', 'nda', 'https://example.com/nda1.pdf', 'signed', 'Sarah Legal', 'ceo@techstartup.com', 'Confidentiality agreement'),
  ('Quote - Manufacturing Co', 'quote', 'https://example.com/quote1.pdf', 'draft', 'Mike Sales', 'procurement@manufacturing.com', 'Equipment quote');

INSERT INTO sales_orders (number, customer_name, customer_email, status, total_amount, tax_amount, shipping_amount, signature_required, signature_status) 
VALUES
  ('SO-2024-001', 'ABC Corporation', 'orders@abccorp.com', 'confirmed', 15000.00, 3000.00, 500.00, true, 'signed'),
  ('SO-2024-002', 'Tech Startup Inc', 'procurement@techstartup.com', 'in_production', 8500.00, 1700.00, 200.00, true, 'pending'),
  ('SO-2024-003', 'Manufacturing Co', 'purchasing@manufacturing.com', 'ready_for_delivery', 25000.00, 5000.00, 800.00, true, 'signed');

INSERT INTO contracts (number, name, customer_name, customer_email, contract_type, status, start_date, end_date, total_value, recurring_amount, billing_frequency, signature_required, signature_status) 
VALUES
  ('CON-2024-001', 'IT Support Agreement', 'ABC Corporation', 'it@abccorp.com', 'service', 'active', '2024-01-01', '2024-12-31', 50000.00, 4166.67, 'monthly', true, 'signed'),
  ('CON-2024-002', 'Software License', 'Tech Startup Inc', 'licensing@techstartup.com', 'subscription', 'pending', '2024-02-01', '2025-01-31', 24000.00, 2000.00, 'monthly', true, 'pending'),
  ('CON-2024-003', 'Maintenance Contract', 'Manufacturing Co', 'maintenance@manufacturing.com', 'maintenance', 'active', '2024-01-15', '2024-12-15', 15000.00, 1250.00, 'monthly', true, 'signed');

COMMIT; 