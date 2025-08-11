-- Create invoices table for AI accounting module
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  number VARCHAR(50) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date DATE,
  date DATE DEFAULT CURRENT_DATE,
  partner_name VARCHAR(255),
  partner_id UUID,
  ai_analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create warehouse_locations table
CREATE TABLE IF NOT EXISTS warehouse_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(20) DEFAULT 'storage' CHECK (type IN ('storage', 'shipping', 'receiving', 'production')),
  capacity INTEGER DEFAULT 0,
  current_usage INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create warehouse_stock table
CREATE TABLE IF NOT EXISTS warehouse_stock (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID,
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

-- Create warehouse_movements table
CREATE TABLE IF NOT EXISTS warehouse_movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('in', 'out', 'transfer', 'adjustment')),
  product_id UUID,
  from_location_id UUID REFERENCES warehouse_locations(id),
  to_location_id UUID REFERENCES warehouse_locations(id),
  quantity INTEGER NOT NULL,
  reference VARCHAR(255) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create document_templates table
CREATE TABLE IF NOT EXISTS document_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  content TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reference VARCHAR(255) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  payment_method VARCHAR(50),
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documents table for portal
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  file_path VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create generated_documents table for document generation history
CREATE TABLE IF NOT EXISTS generated_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES document_templates(id),
  data JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  download_url VARCHAR(500),
  preview_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_gateways table for payment gateway configuration
CREATE TABLE IF NOT EXISTS payment_gateways (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL CHECK (name IN ('stripe', 'paypal')),
  is_active BOOLEAN DEFAULT true,
  api_key VARCHAR(255),
  secret_key VARCHAR(255),
  webhook_url VARCHAR(500),
  supported_currencies TEXT[] DEFAULT ARRAY['USD'],
  transaction_fee_percentage DECIMAL(5,2) DEFAULT 2.90,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_methods table for customer payment methods
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  type VARCHAR(20) NOT NULL CHECK (type IN ('card', 'bank_account', 'paypal')),
  last4 VARCHAR(4),
  brand VARCHAR(20),
  is_default BOOLEAN DEFAULT false,
  gateway_token VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data for warehouse_locations
INSERT INTO warehouse_locations (name, code, type, capacity, current_usage, status) VALUES
  ('Main Storage Area', 'MSA-001', 'storage', 1000, 450, 'active'),
  ('Shipping Dock', 'SD-001', 'shipping', 500, 120, 'active'),
  ('Receiving Bay', 'RB-001', 'receiving', 300, 80, 'active'),
  ('Production Floor', 'PF-001', 'production', 800, 200, 'active'),
  ('Cold Storage', 'CS-001', 'storage', 200, 50, 'active'),
  ('High-Value Storage', 'HVS-001', 'storage', 100, 30, 'active');

-- Insert sample data for warehouse_stock
INSERT INTO warehouse_stock (product_id, location_id, quantity, reserved_quantity, available_quantity, min_stock_level, max_stock_level) VALUES
  (gen_random_uuid(), (SELECT id FROM warehouse_locations WHERE name = 'Zone A' LIMIT 1), 50, 10, 100, 10, 100),
  (gen_random_uuid(), (SELECT id FROM warehouse_locations WHERE name = 'Zone B' LIMIT 1), 25, 10, 100, 10, 100),
  (gen_random_uuid(), (SELECT id FROM warehouse_locations WHERE name = 'Shipping Dock' LIMIT 1), 15, 5, 50, 5, 50);

-- Insert sample data for warehouse_movements
INSERT INTO warehouse_movements (product_name, quantity, type, from_location, to_location, user_name) VALUES
  ('Premium Widget Pro', 100, 'in', NULL, 'Main Warehouse - Zone A', 'John Doe'),
  ('Standard Widget', 50, 'out', 'Main Warehouse - Zone B', NULL, 'Jane Smith'),
  ('Deluxe Widget', 25, 'transfer', 'Main Warehouse', 'Secondary', 'Mike Johnson');

-- Insert sample data for invoices
INSERT INTO invoices (number, customer_name, amount, status, due_date, created_at) VALUES
  ('INV-2024-001', 'TechCorp Solutions', 2500.00, 'paid', '2024-01-15', '2024-01-01T10:00:00Z'),
  ('INV-2024-002', 'Global Industries', 1800.00, 'sent', '2024-01-30', '2024-01-05T14:30:00Z'),
  ('INV-2024-003', 'Startup Ventures', 3200.00, 'overdue', '2024-01-10', '2024-01-08T09:15:00Z'),
  ('INV-2024-004', 'Enterprise Systems', 4500.00, 'draft', '2024-02-15', '2024-01-12T16:45:00Z'),
  ('INV-2024-005', 'Digital Marketing Co', 1200.00, 'paid', '2024-01-20', '2024-01-15T11:20:00Z'),
  ('INV-2024-006', 'Consulting Partners', 2800.00, 'sent', '2024-02-05', '2024-01-18T13:10:00Z'),
  ('INV-2024-007', 'Innovation Labs', 1900.00, 'overdue', '2024-01-25', '2024-01-20T15:30:00Z'),
  ('INV-2024-008', 'Cloud Services Inc', 3600.00, 'draft', '2024-02-20', '2024-01-22T10:45:00Z');

-- Insert sample data for document_templates
INSERT INTO document_templates (name, type, content, style) VALUES
  ('Modern Invoice', 'invoice', '{"template": "modern", "style": "professional", "layout": "clean"}', 'modern'),
  ('Classic Invoice', 'invoice', '{"template": "classic", "style": "traditional", "layout": "formal"}', 'classic'),
  ('Minimal Invoice', 'invoice', '{"template": "minimal", "style": "simple", "layout": "clean"}', 'minimal'),
  ('Professional Invoice', 'invoice', '{"template": "professional", "style": "corporate", "layout": "structured"}', 'professional'),
  ('Creative Invoice', 'invoice', '{"template": "creative", "style": "artistic", "layout": "dynamic"}', 'creative'),
  ('Modern Receipt', 'receipt', '{"template": "modern", "style": "clean", "layout": "compact"}', 'modern'),
  ('Classic Receipt', 'receipt', '{"template": "classic", "style": "traditional", "layout": "formal"}', 'classic'),
  ('Minimal Receipt', 'receipt', '{"template": "minimal", "style": "simple", "layout": "basic"}', 'minimal'),
  ('Professional Quotation', 'quotation', '{"template": "professional", "style": "corporate", "layout": "detailed"}', 'professional'),
  ('Modern Quotation', 'quotation', '{"template": "modern", "style": "clean", "layout": "structured"}', 'modern'),
  ('Creative Quotation', 'quotation', '{"template": "creative", "style": "artistic", "layout": "dynamic"}', 'creative'),
  ('Professional Purchase Order', 'purchase_order', '{"template": "professional", "style": "corporate", "layout": "detailed"}', 'professional'),
  ('Modern Purchase Order', 'purchase_order', '{"template": "modern", "style": "clean", "layout": "structured"}', 'modern'),
  ('Classic Purchase Order', 'purchase_order', '{"template": "classic", "style": "traditional", "layout": "formal"}', 'classic'),
  ('Minimal Delivery Note', 'delivery_note', '{"template": "minimal", "style": "simple", "layout": "basic"}', 'minimal'),
  ('Modern Delivery Note', 'delivery_note', '{"template": "modern", "style": "clean", "layout": "compact"}', 'modern');

-- Insert sample data for payment gateways
INSERT INTO payment_gateways (name, is_active, api_key, secret_key, webhook_url, supported_currencies, transaction_fee_percentage) VALUES
  ('stripe', true, 'pk_test_51ABC123...', 'sk_test_51ABC123...', 'https://your-domain.com/webhooks/stripe', ARRAY['USD', 'EUR', 'GBP'], 2.90),
  ('paypal', true, 'client_id_ABC123...', 'client_secret_ABC123...', 'https://your-domain.com/webhooks/paypal', ARRAY['USD', 'EUR', 'GBP', 'CAD'], 3.50);

-- Insert sample data for payment methods
INSERT INTO payment_methods (user_id, type, last4, brand, is_default, gateway_token) VALUES
  (gen_random_uuid(), 'card', '4242', 'visa', true, 'pm_1234567890'),
  (gen_random_uuid(), 'paypal', NULL, NULL, false, 'paypal_token_123');

-- Enable Row Level Security (RLS)
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for invoices (allow all authenticated users for now)
CREATE POLICY "Authenticated users can view invoices" ON invoices
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert invoices" ON invoices
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update invoices" ON invoices
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create RLS policies for warehouse tables (allow all authenticated users)
CREATE POLICY "Authenticated users can view warehouse data" ON warehouse_locations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view warehouse stock" ON warehouse_stock
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view warehouse movements" ON warehouse_movements
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create RLS policies for document templates (allow all authenticated users)
CREATE POLICY "Authenticated users can view document templates" ON document_templates
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create RLS policies for payments (allow all authenticated users for now)
CREATE POLICY "Authenticated users can view payments" ON payments
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create RLS policies for documents (allow all authenticated users for now)
CREATE POLICY "Authenticated users can view documents" ON documents
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create RLS policies for generated_documents (allow all authenticated users for now)
CREATE POLICY "Authenticated users can view generated documents" ON generated_documents
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert generated documents" ON generated_documents
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create RLS policies for payment_gateways (allow all authenticated users for now)
CREATE POLICY "Authenticated users can view payment gateways" ON payment_gateways
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update payment gateways" ON payment_gateways
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create RLS policies for payment_methods (allow users to manage their own payment methods)
CREATE POLICY "Users can view their own payment methods" ON payment_methods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment methods" ON payment_methods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment methods" ON payment_methods
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment methods" ON payment_methods
  FOR DELETE USING (auth.uid() = user_id); 

-- Customer Portal Tables
CREATE TABLE IF NOT EXISTS customer_portal_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES contacts(id),
  portal_access_enabled BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES contacts(id),
  status VARCHAR(20) DEFAULT 'draft',
  total_amount DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  order_date DATE DEFAULT CURRENT_DATE,
  delivery_date DATE,
  items_count INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES customer_orders(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) DEFAULT 0,
  total_price DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sample data for customer portal
INSERT INTO customer_portal_users (user_id, customer_id, portal_access_enabled) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', true),
  ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', true);

INSERT INTO customer_orders (reference, customer_id, status, total_amount, currency, order_date, delivery_date, items_count) VALUES
  ('ORD-2024-001', '550e8400-e29b-41d4-a716-446655440001', 'delivered', 2500.00, 'USD', '2024-01-10', '2024-01-25', 3),
  ('ORD-2024-002', '550e8400-e29b-41d4-a716-446655440001', 'shipped', 1800.00, 'USD', '2024-01-18', '2024-01-30', 2);

INSERT INTO customer_order_items (order_id, product_name, description, quantity, unit_price, total_price) VALUES
  ('550e8400-e29b-41d4-a716-446655440010', 'Web Development Services', 'Custom website development', 1, 2000.00, 2000.00),
  ('550e8400-e29b-41d4-a716-446655440010', 'SEO Optimization', 'Search engine optimization', 1, 500.00, 500.00),
  ('550e8400-e29b-41d4-a716-446655440011', 'Mobile App Development', 'iOS and Android app', 1, 1500.00, 1500.00),
  ('550e8400-e29b-41d4-a716-446655440011', 'UI/UX Design', 'User interface design', 1, 300.00, 300.00);

-- Enable RLS for customer portal tables
ALTER TABLE customer_portal_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customer portal
CREATE POLICY "Users can view their own portal access" ON customer_portal_users
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own orders" ON customer_orders
  FOR SELECT USING (
    customer_id IN (
      SELECT customer_id FROM customer_portal_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own order items" ON customer_order_items
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM customer_orders WHERE customer_id IN (
        SELECT customer_id FROM customer_portal_users WHERE user_id = auth.uid()
      )
    )
  ); 

-- Warehouse Products Table
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

-- Sample warehouse products
INSERT INTO warehouse_products (name, sku, description, category, unit_price, cost_price) VALUES
  ('Laptop Dell XPS 13', 'LAP-DELL-XPS13', 'High-performance laptop with 16GB RAM', 'electronics', 1299.99, 899.99),
  ('iPhone 15 Pro', 'PHONE-IPHONE15PRO', 'Latest iPhone with 256GB storage', 'electronics', 999.99, 699.99),
  ('Wireless Headphones', 'AUDIO-SONY-WH1000', 'Noise-cancelling wireless headphones', 'electronics', 349.99, 249.99),
  ('Cotton T-Shirt', 'CLOTH-TSHIRT-COTTON', 'Premium cotton t-shirt, various sizes', 'clothing', 29.99, 15.99),
  ('Denim Jeans', 'CLOTH-JEANS-DENIM', 'Classic denim jeans, multiple fits', 'clothing', 79.99, 45.99),
  ('Programming Book', 'BOOK-PROG-JS', 'JavaScript programming guide', 'books', 49.99, 25.99),
  ('Drill Set', 'TOOL-DRILL-DEWALT', 'Professional drill set with bits', 'tools', 199.99, 120.99);

-- Update warehouse_locations with more realistic data
UPDATE warehouse_locations SET 
  name = 'Main Storage Area',
  code = 'MSA-001',
  type = 'storage',
  capacity = 1000,
  current_usage = 450,
  status = 'active'
WHERE id = '550e8400-e29b-41d4-a716-446655440010';

UPDATE warehouse_locations SET 
  name = 'Shipping Dock',
  code = 'SD-001',
  type = 'shipping',
  capacity = 500,
  current_usage = 120,
  status = 'active'
WHERE id = '550e8400-e29b-41d4-a716-446655440011';

-- Add more warehouse locations
INSERT INTO warehouse_locations (name, code, type, capacity, current_usage, status) VALUES
  ('Receiving Bay', 'RB-001', 'receiving', 300, 80, 'active'),
  ('Production Floor', 'PF-001', 'production', 800, 200, 'active'),
  ('Cold Storage', 'CS-001', 'storage', 200, 50, 'active'),
  ('High-Value Storage', 'HVS-001', 'storage', 100, 30, 'active');

-- Update warehouse_stock with product references
UPDATE warehouse_stock SET 
  product_id = (SELECT id FROM warehouse_products WHERE sku = 'LAP-DELL-XPS13' LIMIT 1),
  location_id = (SELECT id FROM warehouse_locations WHERE code = 'MSA-001' LIMIT 1),
  quantity = 25,
  reserved_quantity = 5,
  available_quantity = 20,
  min_stock_level = 5,
  max_stock_level = 50
WHERE id = '550e8400-e29b-41d4-a716-446655440020';

UPDATE warehouse_stock SET 
  product_id = (SELECT id FROM warehouse_products WHERE sku = 'PHONE-IPHONE15PRO' LIMIT 1),
  location_id = (SELECT id FROM warehouse_locations WHERE code = 'HVS-001' LIMIT 1),
  quantity = 15,
  reserved_quantity = 3,
  available_quantity = 12,
  min_stock_level = 3,
  max_stock_level = 30
WHERE id = '550e8400-e29b-41d4-a716-446655440021';

-- Add more stock items
INSERT INTO warehouse_stock (product_id, location_id, quantity, reserved_quantity, available_quantity, min_stock_level, max_stock_level) VALUES
  ((SELECT id FROM warehouse_products WHERE sku = 'AUDIO-SONY-WH1000' LIMIT 1), 
   (SELECT id FROM warehouse_locations WHERE code = 'MSA-001' LIMIT 1), 40, 5, 35, 10, 100),
  ((SELECT id FROM warehouse_products WHERE sku = 'CLOTH-TSHIRT-COTTON' LIMIT 1), 
   (SELECT id FROM warehouse_locations WHERE code = 'MSA-001' LIMIT 1), 200, 20, 180, 50, 500),
  ((SELECT id FROM warehouse_products WHERE sku = 'CLOTH-JEANS-DENIM' LIMIT 1), 
   (SELECT id FROM warehouse_locations WHERE code = 'MSA-001' LIMIT 1), 150, 10, 140, 30, 300),
  ((SELECT id FROM warehouse_products WHERE sku = 'BOOK-PROG-JS' LIMIT 1), 
   (SELECT id FROM warehouse_locations WHERE code = 'MSA-001' LIMIT 1), 75, 0, 75, 10, 200),
  ((SELECT id FROM warehouse_products WHERE sku = 'TOOL-DRILL-DEWALT' LIMIT 1), 
   (SELECT id FROM warehouse_locations WHERE code = 'PF-001' LIMIT 1), 30, 8, 22, 5, 50);

-- Update warehouse_movements with product references
UPDATE warehouse_movements SET 
  product_id = (SELECT id FROM warehouse_products WHERE sku = 'LAP-DELL-XPS13' LIMIT 1),
  from_location_id = NULL,
  to_location_id = (SELECT id FROM warehouse_locations WHERE code = 'MSA-001' LIMIT 1),
  reference = 'PO-2024-001',
  notes = 'Initial stock received'
WHERE id = '550e8400-e29b-41d4-a716-446655440030';

UPDATE warehouse_movements SET 
  product_id = (SELECT id FROM warehouse_products WHERE sku = 'PHONE-IPHONE15PRO' LIMIT 1),
  from_location_id = (SELECT id FROM warehouse_locations WHERE code = 'MSA-001' LIMIT 1),
  to_location_id = (SELECT id FROM warehouse_locations WHERE code = 'HVS-001' LIMIT 1),
  reference = 'TRANSFER-2024-001',
  notes = 'Moved to high-value storage'
WHERE id = '550e8400-e29b-41d4-a716-446655440031';

-- Add more movements
INSERT INTO warehouse_movements (type, product_id, from_location_id, to_location_id, quantity, reference, notes) VALUES
  ('in', (SELECT id FROM warehouse_products WHERE sku = 'AUDIO-SONY-WH1000' LIMIT 1), 
   NULL, (SELECT id FROM warehouse_locations WHERE code = 'MSA-001' LIMIT 1), 40, 'PO-2024-002', 'Audio equipment received'),
  ('in', (SELECT id FROM warehouse_products WHERE sku = 'CLOTH-TSHIRT-COTTON' LIMIT 1), 
   NULL, (SELECT id FROM warehouse_locations WHERE code = 'MSA-001' LIMIT 1), 200, 'PO-2024-003', 'Clothing inventory received'),
  ('out', (SELECT id FROM warehouse_products WHERE sku = 'LAP-DELL-XPS13' LIMIT 1), 
   (SELECT id FROM warehouse_locations WHERE code = 'MSA-001' LIMIT 1), NULL, 5, 'SO-2024-001', 'Customer order fulfilled'),
  ('transfer', (SELECT id FROM warehouse_products WHERE sku = 'TOOL-DRILL-DEWALT' LIMIT 1), 
   (SELECT id FROM warehouse_locations WHERE code = 'MSA-001' LIMIT 1), (SELECT id FROM warehouse_locations WHERE code = 'PF-001' LIMIT 1), 30, 'TRANSFER-2024-002', 'Moved to production floor');

-- Enable RLS for warehouse_products
ALTER TABLE warehouse_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for warehouse_products
CREATE POLICY "Users can view all products" ON warehouse_products
  FOR SELECT USING (true);

CREATE POLICY "Users can insert products" ON warehouse_products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update products" ON warehouse_products
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete products" ON warehouse_products
  FOR DELETE USING (auth.role() = 'authenticated'); 

-- Accounting Rules Table
CREATE TABLE IF NOT EXISTS accounting_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('automation', 'alert', 'calculation')),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sample accounting rules
INSERT INTO accounting_rules (name, type, description, is_active) VALUES
  ('Auto Invoice Reminders', 'automation', 'Automatically send payment reminders for overdue invoices', true),
  ('Low Cash Flow Alert', 'alert', 'Send alerts when cash flow drops below threshold', true),
  ('Profit Margin Calculator', 'calculation', 'Calculate and track profit margins automatically', true),
  ('Expense Categorization', 'automation', 'Automatically categorize expenses based on keywords', true),
  ('Tax Calculation', 'calculation', 'Calculate taxes based on current rates and rules', true),
  ('Credit Limit Monitor', 'alert', 'Monitor customer credit limits and send alerts', true);

-- Enable RLS for accounting_rules
ALTER TABLE accounting_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for accounting_rules
CREATE POLICY "Users can view all rules" ON accounting_rules
  FOR SELECT USING (true);

CREATE POLICY "Users can insert rules" ON accounting_rules
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update rules" ON accounting_rules
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete rules" ON accounting_rules
  FOR DELETE USING (auth.role() = 'authenticated'); 