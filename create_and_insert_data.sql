-- Step 1: Create warehouse_products table if it doesn't exist
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

-- Step 2: Create accounting_rules table if it doesn't exist
CREATE TABLE IF NOT EXISTS accounting_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('automation', 'alert', 'calculation')),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Enable RLS for new tables
ALTER TABLE warehouse_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_rules ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies for warehouse_products
CREATE POLICY "Users can view all products" ON warehouse_products
  FOR SELECT USING (true);

CREATE POLICY "Users can insert products" ON warehouse_products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update products" ON warehouse_products
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete products" ON warehouse_products
  FOR DELETE USING (auth.role() = 'authenticated');

-- Step 5: Create RLS policies for accounting_rules
CREATE POLICY "Users can view all rules" ON accounting_rules
  FOR SELECT USING (true);

CREATE POLICY "Users can insert rules" ON accounting_rules
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update rules" ON accounting_rules
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete rules" ON accounting_rules
  FOR DELETE USING (auth.role() = 'authenticated');

-- Step 6: Insert warehouse products
INSERT INTO warehouse_products (name, sku, description, category, unit_price, cost_price) VALUES
  ('Laptop Dell XPS 13', 'LAP-DELL-XPS13', 'High-performance laptop with 16GB RAM', 'electronics', 1299.99, 899.99),
  ('iPhone 15 Pro', 'PHONE-IPHONE15PRO', 'Latest iPhone with 256GB storage', 'electronics', 999.99, 699.99),
  ('Wireless Headphones', 'AUDIO-SONY-WH1000', 'Noise-cancelling wireless headphones', 'electronics', 349.99, 249.99),
  ('Cotton T-Shirt', 'CLOTH-TSHIRT-COTTON', 'Premium cotton t-shirt, various sizes', 'clothing', 29.99, 15.99),
  ('Denim Jeans', 'CLOTH-JEANS-DENIM', 'Classic denim jeans, multiple fits', 'clothing', 79.99, 45.99),
  ('Programming Book', 'BOOK-PROG-JS', 'JavaScript programming guide', 'books', 49.99, 25.99),
  ('Drill Set', 'TOOL-DRILL-DEWALT', 'Professional drill set with bits', 'tools', 199.99, 120.99)
ON CONFLICT (sku) DO NOTHING;

-- Step 7: Insert accounting rules
INSERT INTO accounting_rules (name, type, description, is_active) VALUES
  ('Auto Invoice Reminders', 'automation', 'Automatically send payment reminders for overdue invoices', true),
  ('Low Cash Flow Alert', 'alert', 'Send alerts when cash flow drops below threshold', true),
  ('Profit Margin Calculator', 'calculation', 'Calculate and track profit margins automatically', true),
  ('Expense Categorization', 'automation', 'Automatically categorize expenses based on keywords', true),
  ('Tax Calculation', 'calculation', 'Calculate taxes based on current rates and rules', true),
  ('Credit Limit Monitor', 'alert', 'Monitor customer credit limits and send alerts', true)
ON CONFLICT DO NOTHING;

-- Step 8: Insert stock items for the products
INSERT INTO warehouse_stock (product_id, location_id, quantity, reserved_quantity, available_quantity, min_stock_level, max_stock_level) 
SELECT 
  wp.id,
  wl.id,
  CASE 
    WHEN wp.category = 'electronics' THEN 25
    WHEN wp.category = 'clothing' THEN 200
    WHEN wp.category = 'books' THEN 75
    WHEN wp.category = 'tools' THEN 30
    ELSE 50
  END,
  CASE 
    WHEN wp.category = 'electronics' THEN 5
    WHEN wp.category = 'clothing' THEN 20
    WHEN wp.category = 'books' THEN 0
    WHEN wp.category = 'tools' THEN 8
    ELSE 10
  END,
  CASE 
    WHEN wp.category = 'electronics' THEN 20
    WHEN wp.category = 'clothing' THEN 180
    WHEN wp.category = 'books' THEN 75
    WHEN wp.category = 'tools' THEN 22
    ELSE 40
  END,
  CASE 
    WHEN wp.category = 'electronics' THEN 5
    WHEN wp.category = 'clothing' THEN 50
    WHEN wp.category = 'books' THEN 10
    WHEN wp.category = 'tools' THEN 5
    ELSE 10
  END,
  CASE 
    WHEN wp.category = 'electronics' THEN 50
    WHEN wp.category = 'clothing' THEN 500
    WHEN wp.category = 'books' THEN 200
    WHEN wp.category = 'tools' THEN 50
    ELSE 100
  END
FROM warehouse_products wp
CROSS JOIN warehouse_locations wl
WHERE wl.name = 'Main Storage Area'
ON CONFLICT DO NOTHING;

-- Step 9: Insert some sample movements
INSERT INTO warehouse_movements (type, product_id, from_location_id, to_location_id, quantity, reference, notes) 
SELECT 
  'in',
  wp.id,
  NULL,
  wl.id,
  CASE 
    WHEN wp.category = 'electronics' THEN 25
    WHEN wp.category = 'clothing' THEN 200
    WHEN wp.category = 'books' THEN 75
    WHEN wp.category = 'tools' THEN 30
    ELSE 50
  END,
  'PO-2024-001',
  'Initial stock received'
FROM warehouse_products wp
CROSS JOIN warehouse_locations wl
WHERE wl.name = 'Main Storage Area'
ON CONFLICT DO NOTHING;

-- Step 10: Update warehouse locations with proper data
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

UPDATE warehouse_locations SET 
  name = 'Zone A',
  code = 'ZA-001',
  type = 'storage',
  capacity = 300,
  current_usage = 80,
  status = 'active'
WHERE name = 'Zone A';

UPDATE warehouse_locations SET 
  name = 'Zone B',
  code = 'ZB-001',
  type = 'storage',
  capacity = 300,
  current_usage = 60,
  status = 'active'
WHERE name = 'Zone B'; 