-- Add Missing Tables for Services (2025-08-07)

-- Create warehouse_products table if it doesn't exist
CREATE TABLE IF NOT EXISTS warehouse_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(100) DEFAULT 'general',
  unit_price DECIMAL(10,2) DEFAULT 0,
  cost_price DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create warehouse_locations table if it doesn't exist
CREATE TABLE IF NOT EXISTS warehouse_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('storage', 'shipping', 'receiving', 'production')),
  capacity INTEGER DEFAULT 0,
  current_usage INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create warehouse_stock table if it doesn't exist
CREATE TABLE IF NOT EXISTS warehouse_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES warehouse_products(id),
  location_id UUID REFERENCES warehouse_locations(id),
  quantity INTEGER DEFAULT 0,
  reserved_quantity INTEGER DEFAULT 0,
  available_quantity INTEGER DEFAULT 0,
  min_stock_level INTEGER DEFAULT 10,
  max_stock_level INTEGER DEFAULT 100,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create warehouse_movements table if it doesn't exist
CREATE TABLE IF NOT EXISTS warehouse_movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('in', 'out', 'transfer', 'adjustment')),
  product_id UUID REFERENCES warehouse_products(id),
  from_location_id UUID REFERENCES warehouse_locations(id),
  to_location_id UUID REFERENCES warehouse_locations(id),
  quantity INTEGER NOT NULL,
  reference VARCHAR(255) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create document_templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create generated_documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES document_templates(id),
  data JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  download_url VARCHAR(500),
  preview_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_methods table if it doesn't exist
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('card', 'bank_transfer', 'paypal', 'stripe', 'other')),
  config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_gateways table if it doesn't exist
CREATE TABLE IF NOT EXISTS payment_gateways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create support_tickets table if it doesn't exist
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID,
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quotation_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID REFERENCES quotations(id),
  product_id UUID,
  product_name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(15,2) NOT NULL,
  total_price DECIMAL(15,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sales_order_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS sales_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES sales_orders(id),
  product_id UUID,
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(15,2) NOT NULL,
  total_price DECIMAL(15,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for all tables
ALTER TABLE warehouse_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_gateways ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_order_items ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (allow all for now)
DO $$
BEGIN
    -- Warehouse tables
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'warehouse_products' AND policyname = 'Allow all warehouse operations') THEN
        CREATE POLICY "Allow all warehouse operations" ON warehouse_products FOR ALL USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'warehouse_locations' AND policyname = 'Allow all location operations') THEN
        CREATE POLICY "Allow all location operations" ON warehouse_locations FOR ALL USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'warehouse_stock' AND policyname = 'Allow all stock operations') THEN
        CREATE POLICY "Allow all stock operations" ON warehouse_stock FOR ALL USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'warehouse_movements' AND policyname = 'Allow all movement operations') THEN
        CREATE POLICY "Allow all movement operations" ON warehouse_movements FOR ALL USING (true);
    END IF;
    
    -- Document tables
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'document_templates' AND policyname = 'Allow all template operations') THEN
        CREATE POLICY "Allow all template operations" ON document_templates FOR ALL USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'generated_documents' AND policyname = 'Allow all document operations') THEN
        CREATE POLICY "Allow all document operations" ON generated_documents FOR ALL USING (true);
    END IF;
    
    -- Payment tables
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_methods' AND policyname = 'Allow all payment method operations') THEN
        CREATE POLICY "Allow all payment method operations" ON payment_methods FOR ALL USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_gateways' AND policyname = 'Allow all gateway operations') THEN
        CREATE POLICY "Allow all gateway operations" ON payment_gateways FOR ALL USING (true);
    END IF;
    
    -- Support tickets
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'support_tickets' AND policyname = 'Allow all ticket operations') THEN
        CREATE POLICY "Allow all ticket operations" ON support_tickets FOR ALL USING (true);
    END IF;
    
    -- Order items
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quotation_items' AND policyname = 'Allow all quotation item operations') THEN
        CREATE POLICY "Allow all quotation item operations" ON quotation_items FOR ALL USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sales_order_items' AND policyname = 'Allow all order item operations') THEN
        CREATE POLICY "Allow all order item operations" ON sales_order_items FOR ALL USING (true);
    END IF;
END $$;

-- Insert sample data
INSERT INTO warehouse_locations (name, code, type, capacity, current_usage, status) 
VALUES 
  ('Main Storage', 'MS-001', 'storage', 1000, 450, 'active'),
  ('Shipping Dock', 'SD-001', 'shipping', 500, 120, 'active'),
  ('Receiving Bay', 'RB-001', 'receiving', 300, 80, 'active')
ON CONFLICT (code) DO NOTHING;

INSERT INTO warehouse_products (name, sku, description, category, unit_price, cost_price) 
VALUES 
  ('Sample Product 1', 'SKU001', 'First sample product', 'electronics', 99.99, 50.00),
  ('Sample Product 2', 'SKU002', 'Second sample product', 'clothing', 29.99, 15.00),
  ('Sample Product 3', 'SKU003', 'Third sample product', 'books', 19.99, 10.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO document_templates (name, type, content) 
VALUES 
  ('Invoice Template', 'invoice', 'Standard invoice template'),
  ('Quotation Template', 'quotation', 'Standard quotation template'),
  ('Sales Order Template', 'sales_order', 'Standard sales order template')
ON CONFLICT DO NOTHING;

INSERT INTO payment_methods (name, type) 
VALUES 
  ('Credit Card', 'card'),
  ('Bank Transfer', 'bank_transfer'),
  ('PayPal', 'paypal')
ON CONFLICT DO NOTHING;

SELECT 'Migration completed successfully!' as status; 