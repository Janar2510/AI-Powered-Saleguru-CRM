-- Clean Warehouse Setup Script - Final Version
-- This script cleans up existing data and sets up the warehouse properly

-- Step 1: Clean up existing data first (only if tables exist)
DO $$
BEGIN
    -- Check if warehouse_movements exists and delete data
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'warehouse_movements') THEN
        DELETE FROM warehouse_movements;
    END IF;
    
    -- Check if warehouse_stock exists and delete data
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'warehouse_stock') THEN
        DELETE FROM warehouse_stock;
    END IF;
    
    -- Check if warehouse_locations exists and delete data
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'warehouse_locations') THEN
        DELETE FROM warehouse_locations;
    END IF;
    
    -- Check if warehouse_products exists and delete data
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'warehouse_products') THEN
        DELETE FROM warehouse_products;
    END IF;
END $$;

-- Step 2: Create warehouse_products table FIRST
CREATE TABLE IF NOT EXISTS warehouse_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(100) DEFAULT 'general',
  unit_price DECIMAL(10,2) DEFAULT 0,
  cost_price DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Add unique constraint to warehouse_products if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'warehouse_products_sku_key') THEN
        ALTER TABLE warehouse_products ADD CONSTRAINT warehouse_products_sku_key UNIQUE (sku);
    END IF;
END $$;

-- Step 4: Create warehouse_locations table SECOND
CREATE TABLE IF NOT EXISTS warehouse_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL,
  capacity INTEGER DEFAULT 0,
  current_usage INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Add unique constraint to warehouse_locations if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'warehouse_locations_code_key') THEN
        ALTER TABLE warehouse_locations ADD CONSTRAINT warehouse_locations_code_key UNIQUE (code);
    END IF;
END $$;

-- Step 6: Add check constraints if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'warehouse_locations_type_check') THEN
        ALTER TABLE warehouse_locations ADD CONSTRAINT warehouse_locations_type_check CHECK (type IN ('storage', 'shipping', 'receiving', 'production'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'warehouse_locations_status_check') THEN
        ALTER TABLE warehouse_locations ADD CONSTRAINT warehouse_locations_status_check CHECK (status IN ('active', 'inactive', 'maintenance'));
    END IF;
END $$;

-- Step 7: Create warehouse_stock table THIRD
CREATE TABLE IF NOT EXISTS warehouse_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID,
  location_id UUID,
  quantity INTEGER DEFAULT 0,
  reserved_quantity INTEGER DEFAULT 0,
  available_quantity INTEGER DEFAULT 0,
  min_stock_level INTEGER DEFAULT 10,
  max_stock_level INTEGER DEFAULT 100,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 8: Create warehouse_movements table FOURTH
CREATE TABLE IF NOT EXISTS warehouse_movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(20) NOT NULL,
  product_id UUID,
  from_location_id UUID,
  to_location_id UUID,
  quantity INTEGER NOT NULL,
  reference VARCHAR(255) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 9: Enable RLS for all tables
ALTER TABLE warehouse_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_movements ENABLE ROW LEVEL SECURITY;

-- Step 10: Create RLS policies for warehouse_products
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'warehouse_products' AND policyname = 'Users can view all products') THEN
        CREATE POLICY "Users can view all products" ON warehouse_products FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'warehouse_products' AND policyname = 'Users can insert products') THEN
        CREATE POLICY "Users can insert products" ON warehouse_products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'warehouse_products' AND policyname = 'Users can update products') THEN
        CREATE POLICY "Users can update products" ON warehouse_products FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'warehouse_products' AND policyname = 'Users can delete products') THEN
        CREATE POLICY "Users can delete products" ON warehouse_products FOR DELETE USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Step 11: Create RLS policies for warehouse_locations
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'warehouse_locations' AND policyname = 'Users can view all locations') THEN
        CREATE POLICY "Users can view all locations" ON warehouse_locations FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'warehouse_locations' AND policyname = 'Users can insert locations') THEN
        CREATE POLICY "Users can insert locations" ON warehouse_locations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'warehouse_locations' AND policyname = 'Users can update locations') THEN
        CREATE POLICY "Users can update locations" ON warehouse_locations FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'warehouse_locations' AND policyname = 'Users can delete locations') THEN
        CREATE POLICY "Users can delete locations" ON warehouse_locations FOR DELETE USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Step 12: Create RLS policies for warehouse_stock
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'warehouse_stock' AND policyname = 'Users can view all stock') THEN
        CREATE POLICY "Users can view all stock" ON warehouse_stock FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'warehouse_stock' AND policyname = 'Users can insert stock') THEN
        CREATE POLICY "Users can insert stock" ON warehouse_stock FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'warehouse_stock' AND policyname = 'Users can update stock') THEN
        CREATE POLICY "Users can update stock" ON warehouse_stock FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'warehouse_stock' AND policyname = 'Users can delete stock') THEN
        CREATE POLICY "Users can delete stock" ON warehouse_stock FOR DELETE USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Step 13: Create RLS policies for warehouse_movements
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'warehouse_movements' AND policyname = 'Users can view all movements') THEN
        CREATE POLICY "Users can view all movements" ON warehouse_movements FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'warehouse_movements' AND policyname = 'Users can insert movements') THEN
        CREATE POLICY "Users can insert movements" ON warehouse_movements FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'warehouse_movements' AND policyname = 'Users can update movements') THEN
        CREATE POLICY "Users can update movements" ON warehouse_movements FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'warehouse_movements' AND policyname = 'Users can delete movements') THEN
        CREATE POLICY "Users can delete movements" ON warehouse_movements FOR DELETE USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Step 14: Insert warehouse products FIRST
INSERT INTO warehouse_products (name, sku, description, category, unit_price, cost_price) VALUES
  ('Laptop Dell XPS 13', 'LAP-DELL-XPS13', 'High-performance laptop with 16GB RAM', 'electronics', 1299.99, 899.99),
  ('iPhone 15 Pro', 'PHONE-IPHONE15PRO', 'Latest iPhone with 256GB storage', 'electronics', 999.99, 699.99),
  ('Wireless Headphones', 'AUDIO-SONY-WH1000', 'Noise-cancelling wireless headphones', 'electronics', 349.99, 249.99),
  ('Cotton T-Shirt', 'CLOTH-TSHIRT-COTTON', 'Premium cotton t-shirt, various sizes', 'clothing', 29.99, 15.99),
  ('Denim Jeans', 'CLOTH-JEANS-DENIM', 'Classic denim jeans, multiple fits', 'clothing', 79.99, 45.99),
  ('Programming Book', 'BOOK-PROG-JS', 'JavaScript programming guide', 'books', 49.99, 25.99),
  ('Drill Set', 'TOOL-DRILL-DEWALT', 'Professional drill set with bits', 'tools', 199.99, 120.99)
ON CONFLICT (sku) DO NOTHING;

-- Step 15: Insert warehouse locations SECOND
INSERT INTO warehouse_locations (name, code, type, capacity, current_usage, status) VALUES
  ('Main Storage Area', 'MSA-001', 'storage', 1000, 450, 'active'),
  ('Shipping Dock', 'SD-001', 'shipping', 500, 120, 'active'),
  ('Zone A', 'ZA-001', 'storage', 300, 80, 'active'),
  ('Zone B', 'ZB-001', 'storage', 300, 60, 'active'),
  ('Receiving Bay', 'RB-001', 'receiving', 300, 80, 'active'),
  ('Production Floor', 'PF-001', 'production', 800, 200, 'active')
ON CONFLICT (code) DO NOTHING;

-- Step 16: Add foreign key constraints AFTER data is inserted
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'warehouse_stock_product_id_fkey') THEN
        ALTER TABLE warehouse_stock ADD CONSTRAINT warehouse_stock_product_id_fkey FOREIGN KEY (product_id) REFERENCES warehouse_products(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'warehouse_stock_location_id_fkey') THEN
        ALTER TABLE warehouse_stock ADD CONSTRAINT warehouse_stock_location_id_fkey FOREIGN KEY (location_id) REFERENCES warehouse_locations(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'warehouse_movements_product_id_fkey') THEN
        ALTER TABLE warehouse_movements ADD CONSTRAINT warehouse_movements_product_id_fkey FOREIGN KEY (product_id) REFERENCES warehouse_products(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'warehouse_movements_from_location_id_fkey') THEN
        ALTER TABLE warehouse_movements ADD CONSTRAINT warehouse_movements_from_location_id_fkey FOREIGN KEY (from_location_id) REFERENCES warehouse_locations(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'warehouse_movements_to_location_id_fkey') THEN
        ALTER TABLE warehouse_movements ADD CONSTRAINT warehouse_movements_to_location_id_fkey FOREIGN KEY (to_location_id) REFERENCES warehouse_locations(id);
    END IF;
END $$;

-- Step 17: Add check constraint to warehouse_movements
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'warehouse_movements_type_check') THEN
        ALTER TABLE warehouse_movements ADD CONSTRAINT warehouse_movements_type_check CHECK (type IN ('in', 'out', 'transfer', 'adjustment'));
    END IF;
END $$;

-- Step 18: Insert stock items for the products THIRD
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
WHERE wl.name = 'Main Storage Area';

-- Step 19: Insert sample movements FOURTH
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
WHERE wl.name = 'Main Storage Area'; 