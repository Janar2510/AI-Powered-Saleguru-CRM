-- Step 1: Fix invoices table
-- First update existing data
UPDATE invoices SET status = 'draft' WHERE status = 'pending';
UPDATE invoices SET customer_name = partner_name WHERE customer_name IS NULL;

-- Then add columns
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS due_date DATE;

-- Make customer_name NOT NULL
ALTER TABLE invoices ALTER COLUMN customer_name SET NOT NULL;

-- Finally add constraint
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_status_check;
ALTER TABLE invoices ADD CONSTRAINT invoices_status_check 
CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled'));

-- Step 2: Fix warehouse_locations table
-- First update existing data
UPDATE warehouse_locations SET type = 'storage' WHERE type = 'warehouse';
UPDATE warehouse_locations SET type = 'storage' WHERE type = 'shelf';
UPDATE warehouse_locations SET type = 'shipping' WHERE type = 'bin';

-- Then add columns
ALTER TABLE warehouse_locations 
ADD COLUMN IF NOT EXISTS code VARCHAR(50),
ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_usage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- Finally add constraints
ALTER TABLE warehouse_locations DROP CONSTRAINT IF EXISTS warehouse_locations_type_check;
ALTER TABLE warehouse_locations ADD CONSTRAINT warehouse_locations_type_check 
CHECK (type IN ('storage', 'shipping', 'receiving', 'production'));

ALTER TABLE warehouse_locations DROP CONSTRAINT IF EXISTS warehouse_locations_status_check;
ALTER TABLE warehouse_locations ADD CONSTRAINT warehouse_locations_status_check 
CHECK (status IN ('active', 'inactive', 'maintenance'));

-- Step 3: Fix warehouse_stock table
-- Add new columns
ALTER TABLE warehouse_stock 
ADD COLUMN IF NOT EXISTS reserved_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS available_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS min_stock_level INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS max_stock_level INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Step 4: Fix warehouse_movements table
-- Add new columns
ALTER TABLE warehouse_movements 
ADD COLUMN IF NOT EXISTS product_id UUID,
ADD COLUMN IF NOT EXISTS from_location_id UUID REFERENCES warehouse_locations(id),
ADD COLUMN IF NOT EXISTS to_location_id UUID REFERENCES warehouse_locations(id),
ADD COLUMN IF NOT EXISTS reference VARCHAR(255),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update type constraint
ALTER TABLE warehouse_movements DROP CONSTRAINT IF EXISTS warehouse_movements_type_check;
ALTER TABLE warehouse_movements ADD CONSTRAINT warehouse_movements_type_check 
CHECK (type IN ('in', 'out', 'transfer', 'adjustment'));

-- Step 5: Update sample data
-- Update warehouse locations
UPDATE warehouse_locations SET 
  name = 'Main Storage Area',
  code = 'MSA-001',
  type = 'storage',
  capacity = 1000,
  current_usage = 450,
  status = 'active'
WHERE name = 'Main Warehouse';

UPDATE warehouse_locations SET 
  name = 'Shipping Dock',
  code = 'SD-001',
  type = 'shipping',
  capacity = 500,
  current_usage = 120,
  status = 'active'
WHERE name = 'Shipping Dock';

-- Add more warehouse locations
INSERT INTO warehouse_locations (name, code, type, capacity, current_usage, status) 
SELECT 'Receiving Bay', 'RB-001', 'receiving', 300, 80, 'active'
WHERE NOT EXISTS (SELECT 1 FROM warehouse_locations WHERE code = 'RB-001');

INSERT INTO warehouse_locations (name, code, type, capacity, current_usage, status) 
SELECT 'Production Floor', 'PF-001', 'production', 800, 200, 'active'
WHERE NOT EXISTS (SELECT 1 FROM warehouse_locations WHERE code = 'PF-001');

INSERT INTO warehouse_locations (name, code, type, capacity, current_usage, status) 
SELECT 'Cold Storage', 'CS-001', 'storage', 200, 50, 'active'
WHERE NOT EXISTS (SELECT 1 FROM warehouse_locations WHERE code = 'CS-001');

INSERT INTO warehouse_locations (name, code, type, capacity, current_usage, status) 
SELECT 'High-Value Storage', 'HVS-001', 'storage', 100, 30, 'active'
WHERE NOT EXISTS (SELECT 1 FROM warehouse_locations WHERE code = 'HVS-001');

-- Update invoices
UPDATE invoices SET 
  customer_name = 'TechCorp Solutions',
  amount = 2500.00,
  status = 'paid',
  due_date = '2024-01-15',
  created_at = '2024-01-01T10:00:00Z'
WHERE number = 'INV-2024-001';

UPDATE invoices SET 
  customer_name = 'Global Industries',
  amount = 1800.00,
  status = 'sent',
  due_date = '2024-01-30',
  created_at = '2024-01-05T14:30:00Z'
WHERE number = 'INV-2024-002';

-- Add more invoices
INSERT INTO invoices (number, customer_name, amount, status, due_date, created_at) 
SELECT 'INV-2024-003', 'Startup Ventures', 3200.00, 'overdue', '2024-01-10', '2024-01-08T09:15:00Z'
WHERE NOT EXISTS (SELECT 1 FROM invoices WHERE number = 'INV-2024-003');

INSERT INTO invoices (number, customer_name, amount, status, due_date, created_at) 
SELECT 'INV-2024-004', 'Enterprise Systems', 4500.00, 'draft', '2024-02-15', '2024-01-12T16:45:00Z'
WHERE NOT EXISTS (SELECT 1 FROM invoices WHERE number = 'INV-2024-004');

INSERT INTO invoices (number, customer_name, amount, status, due_date, created_at) 
SELECT 'INV-2024-005', 'Digital Marketing Co', 1200.00, 'paid', '2024-01-20', '2024-01-15T11:20:00Z'
WHERE NOT EXISTS (SELECT 1 FROM invoices WHERE number = 'INV-2024-005');

-- Step 6: Create new tables
-- Create warehouse_products table
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
  ('Drill Set', 'TOOL-DRILL-DEWALT', 'Professional drill set with bits', 'tools', 199.99, 120.99)
ON CONFLICT (sku) DO NOTHING;

-- Create accounting_rules table
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
  ('Credit Limit Monitor', 'alert', 'Monitor customer credit limits and send alerts', true)
ON CONFLICT DO NOTHING;

-- Step 7: Enable RLS and create policies
-- Enable RLS for new tables
ALTER TABLE warehouse_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for warehouse_products
CREATE POLICY "Users can view all products" ON warehouse_products
  FOR SELECT USING (true);

CREATE POLICY "Users can insert products" ON warehouse_products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update products" ON warehouse_products
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete products" ON warehouse_products
  FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for accounting_rules
CREATE POLICY "Users can view all rules" ON accounting_rules
  FOR SELECT USING (true);

CREATE POLICY "Users can insert rules" ON accounting_rules
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update rules" ON accounting_rules
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete rules" ON accounting_rules
  FOR DELETE USING (auth.role() = 'authenticated'); 