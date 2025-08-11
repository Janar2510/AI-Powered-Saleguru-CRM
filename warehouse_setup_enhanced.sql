-- Enhanced Warehouse Setup Script
-- This script creates warehouse tables with detailed product fields

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

-- Step 2: Create enhanced warehouse_products table FIRST
CREATE TABLE IF NOT EXISTS warehouse_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NOT NULL,
  product_code VARCHAR(100),
  supplier VARCHAR(255),
  supplier_code VARCHAR(100),
  serial_number VARCHAR(100),
  description TEXT,
  category VARCHAR(100) DEFAULT 'general',
  subcategory VARCHAR(100),
  brand VARCHAR(100),
  model VARCHAR(100),
  unit_price DECIMAL(10,2) DEFAULT 0,
  purchase_price DECIMAL(10,2) DEFAULT 0,
  sale_price DECIMAL(10,2) DEFAULT 0,
  wholesale_price DECIMAL(10,2) DEFAULT 0,
  retail_price DECIMAL(10,2) DEFAULT 0,
  cost_price DECIMAL(10,2) DEFAULT 0,
  profit_margin DECIMAL(5,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  weight_kg DECIMAL(8,3) DEFAULT 0,
  length_cm DECIMAL(8,2) DEFAULT 0,
  width_cm DECIMAL(8,2) DEFAULT 0,
  height_cm DECIMAL(8,2) DEFAULT 0,
  volume_l DECIMAL(8,2) DEFAULT 0,
  area_m2 DECIMAL(8,2) DEFAULT 0,
  pieces_per_unit INTEGER DEFAULT 1,
  minimum_order_quantity INTEGER DEFAULT 1,
  reorder_point INTEGER DEFAULT 10,
  lead_time_days INTEGER DEFAULT 7,
  shelf_life_days INTEGER DEFAULT 365,
  is_active BOOLEAN DEFAULT true,
  is_tracked BOOLEAN DEFAULT true,
  barcode VARCHAR(100),
  qr_code VARCHAR(100),
  image_url VARCHAR(500),
  specifications JSONB,
  tags TEXT[],
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

-- Step 9: Fix existing warehouse_movements table structure
DO $$
BEGIN
    -- Drop the product_name column if it exists and is NOT NULL
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_movements' AND column_name = 'product_name') THEN
        ALTER TABLE warehouse_movements DROP COLUMN IF EXISTS product_name;
    END IF;
    
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_movements' AND column_name = 'product_id') THEN
        ALTER TABLE warehouse_movements ADD COLUMN product_id UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_movements' AND column_name = 'from_location_id') THEN
        ALTER TABLE warehouse_movements ADD COLUMN from_location_id UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_movements' AND column_name = 'to_location_id') THEN
        ALTER TABLE warehouse_movements ADD COLUMN to_location_id UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_movements' AND column_name = 'reference') THEN
        ALTER TABLE warehouse_movements ADD COLUMN reference VARCHAR(255) NOT NULL DEFAULT 'MOVEMENT';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_movements' AND column_name = 'notes') THEN
        ALTER TABLE warehouse_movements ADD COLUMN notes TEXT;
    END IF;
    
    -- Add missing columns to warehouse_stock if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_stock' AND column_name = 'product_id') THEN
        ALTER TABLE warehouse_stock ADD COLUMN product_id UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_stock' AND column_name = 'location_id') THEN
        ALTER TABLE warehouse_stock ADD COLUMN location_id UUID;
    END IF;
END $$;

-- Step 10: Enable RLS for all tables
ALTER TABLE warehouse_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_movements ENABLE ROW LEVEL SECURITY;

-- Step 11: Create RLS policies for warehouse_products
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

-- Step 12: Create RLS policies for warehouse_locations
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

-- Step 13: Create RLS policies for warehouse_stock
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

-- Step 14: Create RLS policies for warehouse_movements
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

-- Step 15: Insert enhanced warehouse products FIRST
INSERT INTO warehouse_products (
  name, sku, product_code, supplier, supplier_code, serial_number, description, category, subcategory, brand, model,
  unit_price, purchase_price, sale_price, wholesale_price, retail_price, cost_price, profit_margin, tax_rate,
  weight_kg, length_cm, width_cm, height_cm, volume_l, area_m2, pieces_per_unit, minimum_order_quantity,
  reorder_point, lead_time_days, shelf_life_days, barcode, specifications, tags
) VALUES
  (
    'Laptop Dell XPS 13', 'LAP-DELL-XPS13', 'DELL-XPS13-2024', 'Dell Technologies', 'DELL001',
    'SN-DELL-XPS13-2024-001', 'High-performance laptop with 16GB RAM, Intel i7, 512GB SSD', 'electronics', 'laptops', 'Dell', 'XPS 13',
    1299.99, 899.99, 1299.99, 1100.00, 1299.99, 899.99, 30.00, 20.00,
    1.2, 30.0, 20.0, 1.5, 0.9, 0.06, 1, 1,
    5, 14, 1095, '1234567890123', '{"cpu": "Intel i7-1165G7", "ram": "16GB", "storage": "512GB SSD", "display": "13.4" 4K"}', ARRAY['laptop', 'premium', 'business']
  ),
  (
    'iPhone 15 Pro', 'PHONE-IPHONE15PRO', 'APPLE-IPHONE15PRO-256', 'Apple Inc.', 'APPLE001',
    'SN-APPLE-IPHONE15PRO-2024-001', 'Latest iPhone with 256GB storage, A17 Pro chip', 'electronics', 'smartphones', 'Apple', 'iPhone 15 Pro',
    999.99, 699.99, 999.99, 850.00, 999.99, 699.99, 30.00, 20.00,
    0.187, 14.7, 7.1, 0.8, 0.083, 0.010, 1, 1,
    10, 21, 1095, '9876543210987', '{"storage": "256GB", "color": "Natural Titanium", "camera": "48MP", "chip": "A17 Pro"}', ARRAY['smartphone', 'premium', '5G']
  ),
  (
    'Wireless Headphones Sony WH-1000XM5', 'AUDIO-SONY-WH1000', 'SONY-WH1000XM5', 'Sony Corporation', 'SONY001',
    'SN-SONY-WH1000XM5-2024-001', 'Noise-cancelling wireless headphones with 30-hour battery', 'electronics', 'audio', 'Sony', 'WH-1000XM5',
    349.99, 249.99, 349.99, 300.00, 349.99, 249.99, 28.57, 20.00,
    0.25, 20.0, 15.0, 8.0, 2.4, 0.03, 1, 1,
    15, 10, 1095, '4567891234567', '{"battery": "30 hours", "noise_cancellation": "Yes", "bluetooth": "5.2", "weight": "250g"}', ARRAY['headphones', 'wireless', 'noise-cancelling']
  ),
  (
    'Cotton T-Shirt Premium', 'CLOTH-TSHIRT-COTTON', 'TSHIRT-COTTON-PREM', 'Fashion Supplier Co.', 'FASH001',
    'SN-TSHIRT-COTTON-2024-001', 'Premium cotton t-shirt, various sizes, 100% organic cotton', 'clothing', 't-shirts', 'Premium Brand', 'Cotton Classic',
    29.99, 15.99, 29.99, 20.00, 29.99, 15.99, 46.67, 20.00,
    0.15, 25.0, 20.0, 2.0, 1.0, 0.05, 1, 10,
    50, 7, 730, '7891234567890', '{"material": "100% Cotton", "sizes": ["S", "M", "L", "XL"], "colors": ["White", "Black", "Blue"]}', ARRAY['t-shirt', 'cotton', 'casual']
  ),
  (
    'Denim Jeans Classic Fit', 'CLOTH-JEANS-DENIM', 'JEANS-DENIM-CLASSIC', 'Denim World Ltd.', 'DENIM001',
    'SN-JEANS-DENIM-2024-001', 'Classic denim jeans, multiple fits, 100% cotton denim', 'clothing', 'jeans', 'Classic Denim', 'Classic Fit',
    79.99, 45.99, 79.99, 60.00, 79.99, 45.99, 42.50, 20.00,
    0.4, 30.0, 25.0, 3.0, 2.25, 0.075, 1, 5,
    25, 14, 1095, '3216549873210', '{"material": "100% Cotton Denim", "fits": ["Slim", "Regular", "Relaxed"], "colors": ["Blue", "Black", "Grey"]}', ARRAY['jeans', 'denim', 'casual']
  ),
  (
    'JavaScript Programming Book', 'BOOK-PROG-JS', 'BOOK-JS-PROG-2024', 'Tech Books Publishing', 'TECH001',
    'SN-BOOK-JS-2024-001', 'Complete JavaScript programming guide with examples and exercises', 'books', 'programming', 'Tech Books', 'JavaScript Complete',
    49.99, 25.99, 49.99, 35.00, 49.99, 25.99, 48.00, 20.00,
    0.8, 23.5, 18.5, 2.5, 1.09, 0.044, 1, 1,
    20, 7, 1825, '1472583691472', '{"pages": "450", "language": "English", "format": "Paperback", "isbn": "978-1234567890"}', ARRAY['book', 'programming', 'javascript']
  ),
  (
    'Drill Set Professional', 'TOOL-DRILL-DEWALT', 'DRILL-DEWALT-PRO', 'DeWalt Tools Inc.', 'DEWALT001',
    'SN-DRILL-DEWALT-2024-001', 'Professional drill set with bits, 20V MAX, brushless motor', 'tools', 'power-tools', 'DeWalt', '20V MAX XR',
    199.99, 120.99, 199.99, 170.00, 199.99, 120.99, 39.50, 20.00,
    2.1, 35.0, 25.0, 15.0, 13.125, 0.088, 1, 1,
    8, 21, 1825, '9638527419638', '{"voltage": "20V MAX", "battery": "5.0Ah", "chuck": "1/2 inch", "speed": "0-2000 RPM"}', ARRAY['drill', 'power-tool', 'professional']
  )
ON CONFLICT (sku) DO NOTHING;

-- Step 16: Insert warehouse locations SECOND
INSERT INTO warehouse_locations (name, code, type, capacity, current_usage, status) VALUES
  ('Main Storage Area', 'MSA-001', 'storage', 1000, 450, 'active'),
  ('Shipping Dock', 'SD-001', 'shipping', 500, 120, 'active'),
  ('Zone A', 'ZA-001', 'storage', 300, 80, 'active'),
  ('Zone B', 'ZB-001', 'storage', 300, 60, 'active'),
  ('Receiving Bay', 'RB-001', 'receiving', 300, 80, 'active'),
  ('Production Floor', 'PF-001', 'production', 800, 200, 'active')
ON CONFLICT (code) DO NOTHING;

-- Step 17: Add foreign key constraints AFTER data is inserted
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

-- Step 18: Add check constraint to warehouse_movements
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'warehouse_movements_type_check') THEN
        ALTER TABLE warehouse_movements ADD CONSTRAINT warehouse_movements_type_check CHECK (type IN ('in', 'out', 'transfer', 'adjustment'));
    END IF;
END $$;

-- Step 19: Insert stock items for the products THIRD
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

-- Step 20: Insert sample movements FOURTH
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