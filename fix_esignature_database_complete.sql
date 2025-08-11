-- Complete eSignature Database Schema Fix
-- Run this in the Supabase SQL Editor to create the complete eSignature system

-- Drop existing tables if they exist (to start fresh)
DROP TABLE IF EXISTS invoice_aging CASCADE;
DROP TABLE IF EXISTS contracts CASCADE;
DROP TABLE IF EXISTS deliveries CASCADE;
DROP TABLE IF EXISTS sales_order_items CASCADE;
DROP TABLE IF EXISTS sales_orders CASCADE;
DROP TABLE IF EXISTS signatures CASCADE;
DROP TABLE IF EXISTS documents CASCADE;

-- Create documents table
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('contract', 'nda', 'quote', 'invoice', 'sales_order')),
  file_url TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'signed', 'expired', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  internal_signer VARCHAR(255),
  customer_signer VARCHAR(255),
  signature_fields JSONB DEFAULT '[]',
  notes TEXT,
  related_order_id UUID,
  related_deal_id UUID,
  related_contract_id UUID,
  created_by UUID REFERENCES user_profiles(id),
  signed_at TIMESTAMP WITH TIME ZONE,
  signature_data JSONB
);

-- Create signatures table
CREATE TABLE signatures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL,
  signed_by VARCHAR(255) NOT NULL,
  signer_email VARCHAR(255) NOT NULL,
  signer_role VARCHAR(50) NOT NULL CHECK (signer_role IN ('internal', 'customer')),
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'signed', 'declined', 'expired')),
  file_url TEXT,
  signature_image TEXT,
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sales_orders table
CREATE TABLE sales_orders (
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

-- Create sales_order_items table
CREATE TABLE sales_order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES sales_orders(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  delivered_quantity INTEGER DEFAULT 0,
  shipping_method VARCHAR(50) DEFAULT 'standard' CHECK (shipping_method IN ('dropship', 'replenish', 'standard')),
  supplier VARCHAR(255),
  estimated_delivery DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create deliveries table
CREATE TABLE deliveries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES sales_orders(id) ON DELETE CASCADE,
  tracking_number VARCHAR(255),
  carrier VARCHAR(100),
  shipping_method VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'shipped', 'in_transit', 'delivered', 'failed')),
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  delivery_address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contracts table
CREATE TABLE contracts (
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

-- Create invoice_aging table
CREATE TABLE invoice_aging (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID,
  customer_name VARCHAR(255) NOT NULL,
  invoice_number VARCHAR(100) NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  outstanding_amount DECIMAL(10,2) NOT NULL,
  days_overdue INTEGER DEFAULT 0,
  aging_bucket VARCHAR(50) CHECK (aging_bucket IN ('current', '1-30', '31-60', '61-90', '90+')),
  payment_terms VARCHAR(100),
  last_payment_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_aging ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for documents
CREATE POLICY "Users can view their own documents" ON documents FOR SELECT USING (created_by = auth.uid());
CREATE POLICY "Users can insert documents" ON documents FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update their own documents" ON documents FOR UPDATE USING (created_by = auth.uid());

-- Create RLS policies for signatures
CREATE POLICY "Users can view signatures" ON signatures FOR SELECT USING (true);
CREATE POLICY "Users can insert signatures" ON signatures FOR INSERT WITH CHECK (true);

-- Create RLS policies for sales_orders
CREATE POLICY "Users can view sales orders" ON sales_orders FOR SELECT USING (true);
CREATE POLICY "Users can insert sales orders" ON sales_orders FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update sales orders" ON sales_orders FOR UPDATE USING (created_by = auth.uid());

-- Create RLS policies for contracts
CREATE POLICY "Users can view contracts" ON contracts FOR SELECT USING (true);
CREATE POLICY "Users can insert contracts" ON contracts FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update contracts" ON contracts FOR UPDATE USING (created_by = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_created_by ON documents(created_by);
CREATE INDEX idx_signatures_document_id ON signatures(document_id);
CREATE INDEX idx_signatures_status ON signatures(status);
CREATE INDEX idx_sales_orders_number ON sales_orders(number);
CREATE INDEX idx_sales_orders_status ON sales_orders(status);
CREATE INDEX idx_sales_orders_customer_name ON sales_orders(customer_name);
CREATE INDEX idx_sales_orders_created_by ON sales_orders(created_by);
CREATE INDEX idx_sales_order_items_order_id ON sales_order_items(order_id);
CREATE INDEX idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_contracts_number ON contracts(number);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_customer_name ON contracts(customer_name);
CREATE INDEX idx_invoice_aging_customer_name ON invoice_aging(customer_name);
CREATE INDEX idx_invoice_aging_aging_bucket ON invoice_aging(aging_bucket);

-- Insert sample data
INSERT INTO documents (name, type, file_url, status, internal_signer, customer_signer, notes) VALUES
('Service Agreement - ABC Corp', 'contract', 'https://example.com/contract1.pdf', 'pending', 'John Manager', 'jane@abccorp.com', 'Standard service agreement'),
('NDA - Tech Startup', 'nda', 'https://example.com/nda1.pdf', 'signed', 'Sarah Legal', 'ceo@techstartup.com', 'Confidentiality agreement'),
('Quote - Manufacturing Co', 'quote', 'https://example.com/quote1.pdf', 'draft', 'Mike Sales', 'procurement@manufacturing.com', 'Equipment quote');

INSERT INTO sales_orders (number, customer_name, customer_email, status, total_amount, tax_amount, shipping_amount, signature_required, signature_status) VALUES
('SO-2024-001', 'ABC Corporation', 'orders@abccorp.com', 'confirmed', 15000.00, 3000.00, 500.00, true, 'signed'),
('SO-2024-002', 'Tech Startup Inc', 'procurement@techstartup.com', 'in_production', 8500.00, 1700.00, 200.00, true, 'pending'),
('SO-2024-003', 'Manufacturing Co', 'purchasing@manufacturing.com', 'ready_for_delivery', 25000.00, 5000.00, 800.00, true, 'signed');

INSERT INTO contracts (number, name, customer_name, customer_email, contract_type, status, start_date, end_date, total_value, recurring_amount, billing_frequency, signature_required, signature_status) VALUES
('CON-2024-001', 'IT Support Agreement', 'ABC Corporation', 'it@abccorp.com', 'service', 'active', '2024-01-01', '2024-12-31', 50000.00, 4166.67, 'monthly', true, 'signed'),
('CON-2024-002', 'Software License', 'Tech Startup Inc', 'licensing@techstartup.com', 'subscription', 'pending', '2024-02-01', '2025-01-31', 24000.00, 2000.00, 'monthly', true, 'pending'),
('CON-2024-003', 'Maintenance Contract', 'Manufacturing Co', 'maintenance@manufacturing.com', 'maintenance', 'active', '2024-01-15', '2024-12-15', 15000.00, 1250.00, 'monthly', true, 'signed'); 