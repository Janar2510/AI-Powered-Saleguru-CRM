-- Create All CRM Tables (Run this in Supabase SQL Editor)

-- 1. Accounting Tables
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'draft',
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to invoices if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'currency') THEN
        ALTER TABLE invoices ADD COLUMN currency TEXT DEFAULT 'EUR';
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_method TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Warehouse Tables
CREATE TABLE IF NOT EXISTS warehouse_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  unit_price DECIMAL(10,2) DEFAULT 0,
  cost_price DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS warehouse_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to warehouse_locations if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_locations' AND column_name = 'address') THEN
        ALTER TABLE warehouse_locations ADD COLUMN address TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_locations' AND column_name = 'type') THEN
        ALTER TABLE warehouse_locations ADD COLUMN type TEXT DEFAULT 'warehouse';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_locations' AND column_name = 'capacity') THEN
        ALTER TABLE warehouse_locations ADD COLUMN capacity INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_locations' AND column_name = 'used_capacity') THEN
        ALTER TABLE warehouse_locations ADD COLUMN used_capacity INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_locations' AND column_name = 'status') THEN
        ALTER TABLE warehouse_locations ADD COLUMN status TEXT DEFAULT 'active';
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS warehouse_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES warehouse_products(id),
  location_id UUID REFERENCES warehouse_locations(id),
  quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS warehouse_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES warehouse_products(id),
  location_id UUID REFERENCES warehouse_locations(id),
  movement_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Document Templates Table
CREATE TABLE IF NOT EXISTS document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. eSignature Tables
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  file_path TEXT,
  status TEXT DEFAULT 'draft',
  signature_fields JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Sales Orders Tables
CREATE TABLE IF NOT EXISTS sales_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  order_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'draft',
  payment_status TEXT DEFAULT 'pending',
  subtotal DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES sales_orders(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Quotations Tables
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID REFERENCES quotations(id),
  product_name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Payment Methods and Gateways
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_gateways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Customer Portal Tables
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT NOT NULL,
  website TEXT,
  industry TEXT,
  customer_type TEXT DEFAULT 'customer',
  status TEXT DEFAULT 'active',
  credit_limit DECIMAL(10,2) DEFAULT 0,
  payment_terms TEXT DEFAULT 'Net 30',
  tax_exempt BOOLEAN DEFAULT FALSE,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'medium',
  assigned_to TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data (only if not exists) - Try different type values
INSERT INTO warehouse_locations (name, address, type, capacity, used_capacity, status) VALUES
  ('Main Warehouse', '123 Warehouse St, City, State 12345', 'storage', 10000, 0, 'active'),
  ('Secondary Warehouse', '456 Storage Ave, City, State 12345', 'storage', 5000, 0, 'active')
ON CONFLICT DO NOTHING;

-- If the above fails, try with 'distribution' type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM warehouse_locations WHERE name = 'Main Warehouse') THEN
        INSERT INTO warehouse_locations (name, address, type, capacity, used_capacity, status) VALUES
          ('Main Warehouse', '123 Warehouse St, City, State 12345', 'distribution', 10000, 0, 'active'),
          ('Secondary Warehouse', '456 Storage Ave, City, State 12345', 'distribution', 5000, 0, 'active');
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- If all else fails, just insert with name only
        INSERT INTO warehouse_locations (name) VALUES
          ('Main Warehouse'),
          ('Secondary Warehouse')
        ON CONFLICT DO NOTHING;
END $$;

INSERT INTO document_templates (name, type, content) VALUES
  ('Invoice Template', 'invoice', 'Standard invoice template'),
  ('Quotation Template', 'quotation', 'Standard quotation template'),
  ('Sales Order Template', 'sales_order', 'Standard sales order template')
ON CONFLICT DO NOTHING;

INSERT INTO payment_methods (name, type, config) VALUES
  ('Credit Card', 'card', '{"processor": "stripe"}'),
  ('PayPal', 'paypal', '{"processor": "paypal"}'),
  ('Bank Transfer', 'bank_transfer', '{"processor": "manual"}')
ON CONFLICT DO NOTHING;

INSERT INTO payment_gateways (name, type, config) VALUES
  ('Stripe', 'stripe', '{"api_key": "test_key"}'),
  ('PayPal', 'paypal', '{"client_id": "test_id"}')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (only if not already enabled)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'invoices' AND rowsecurity = true) THEN
        ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'payments' AND rowsecurity = true) THEN
        ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'warehouse_products' AND rowsecurity = true) THEN
        ALTER TABLE warehouse_products ENABLE ROW LEVEL SECURITY;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'warehouse_locations' AND rowsecurity = true) THEN
        ALTER TABLE warehouse_locations ENABLE ROW LEVEL SECURITY;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'warehouse_stock' AND rowsecurity = true) THEN
        ALTER TABLE warehouse_stock ENABLE ROW LEVEL SECURITY;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'warehouse_movements' AND rowsecurity = true) THEN
        ALTER TABLE warehouse_movements ENABLE ROW LEVEL SECURITY;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'document_templates' AND rowsecurity = true) THEN
        ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'documents' AND rowsecurity = true) THEN
        ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'sales_orders' AND rowsecurity = true) THEN
        ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'sales_order_items' AND rowsecurity = true) THEN
        ALTER TABLE sales_order_items ENABLE ROW LEVEL SECURITY;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'quotations' AND rowsecurity = true) THEN
        ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'quotation_items' AND rowsecurity = true) THEN
        ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'payment_methods' AND rowsecurity = true) THEN
        ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'payment_gateways' AND rowsecurity = true) THEN
        ALTER TABLE payment_gateways ENABLE ROW LEVEL SECURITY;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'customers' AND rowsecurity = true) THEN
        ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'support_tickets' AND rowsecurity = true) THEN
        ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create basic policies (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'invoices' AND policyname = 'Allow all on invoices') THEN
        CREATE POLICY "Allow all on invoices" ON invoices FOR ALL USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'Allow all on payments') THEN
        CREATE POLICY "Allow all on payments" ON payments FOR ALL USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'warehouse_products' AND policyname = 'Allow all on warehouse_products') THEN
        CREATE POLICY "Allow all on warehouse_products" ON warehouse_products FOR ALL USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'warehouse_locations' AND policyname = 'Allow all on warehouse_locations') THEN
        CREATE POLICY "Allow all on warehouse_locations" ON warehouse_locations FOR ALL USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'warehouse_stock' AND policyname = 'Allow all on warehouse_stock') THEN
        CREATE POLICY "Allow all on warehouse_stock" ON warehouse_stock FOR ALL USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'warehouse_movements' AND policyname = 'Allow all on warehouse_movements') THEN
        CREATE POLICY "Allow all on warehouse_movements" ON warehouse_movements FOR ALL USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'document_templates' AND policyname = 'Allow all on document_templates') THEN
        CREATE POLICY "Allow all on document_templates" ON document_templates FOR ALL USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'documents' AND policyname = 'Allow all on documents') THEN
        CREATE POLICY "Allow all on documents" ON documents FOR ALL USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sales_orders' AND policyname = 'Allow all on sales_orders') THEN
        CREATE POLICY "Allow all on sales_orders" ON sales_orders FOR ALL USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sales_order_items' AND policyname = 'Allow all on sales_order_items') THEN
        CREATE POLICY "Allow all on sales_order_items" ON sales_order_items FOR ALL USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quotations' AND policyname = 'Allow all on quotations') THEN
        CREATE POLICY "Allow all on quotations" ON quotations FOR ALL USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quotation_items' AND policyname = 'Allow all on quotation_items') THEN
        CREATE POLICY "Allow all on quotation_items" ON quotation_items FOR ALL USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_methods' AND policyname = 'Allow all on payment_methods') THEN
        CREATE POLICY "Allow all on payment_methods" ON payment_methods FOR ALL USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_gateways' AND policyname = 'Allow all on payment_gateways') THEN
        CREATE POLICY "Allow all on payment_gateways" ON payment_gateways FOR ALL USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'customers' AND policyname = 'Allow all on customers') THEN
        CREATE POLICY "Allow all on customers" ON customers FOR ALL USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'support_tickets' AND policyname = 'Allow all on support_tickets') THEN
        CREATE POLICY "Allow all on support_tickets" ON support_tickets FOR ALL USING (true);
    END IF;
END $$;

SELECT 'All tables and columns created/updated successfully!' as status; 