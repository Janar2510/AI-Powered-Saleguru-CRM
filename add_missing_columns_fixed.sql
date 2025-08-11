-- Add Missing Columns to Existing Warehouse Products Table (FIXED)
-- This script adds all the enhanced fields to the existing warehouse_products table

-- Step 1: Add all missing columns to warehouse_products table
DO $$
BEGIN
    -- Add product_code column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_products' AND column_name = 'product_code') THEN
        ALTER TABLE warehouse_products ADD COLUMN product_code VARCHAR(100);
    END IF;
    
    -- Add supplier column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_products' AND column_name = 'supplier') THEN
        ALTER TABLE warehouse_products ADD COLUMN supplier VARCHAR(255);
    END IF;
    
    -- Add supplier_code column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_products' AND column_name = 'supplier_code') THEN
        ALTER TABLE warehouse_products ADD COLUMN supplier_code VARCHAR(100);
    END IF;
    
    -- Add serial_number column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_products' AND column_name = 'serial_number') THEN
        ALTER TABLE warehouse_products ADD COLUMN serial_number VARCHAR(100);
    END IF;
    
    -- Add subcategory column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_products' AND column_name = 'subcategory') THEN
        ALTER TABLE warehouse_products ADD COLUMN subcategory VARCHAR(100);
    END IF;
    
    -- Add brand column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_products' AND column_name = 'brand') THEN
        ALTER TABLE warehouse_products ADD COLUMN brand VARCHAR(100);
    END IF;
    
    -- Add model column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_products' AND column_name = 'model') THEN
        ALTER TABLE warehouse_products ADD COLUMN model VARCHAR(100);
    END IF;
    
    -- Add purchase_price column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_products' AND column_name = 'purchase_price') THEN
        ALTER TABLE warehouse_products ADD COLUMN purchase_price DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- Add sale_price column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_products' AND column_name = 'sale_price') THEN
        ALTER TABLE warehouse_products ADD COLUMN sale_price DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- Add wholesale_price column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_products' AND column_name = 'wholesale_price') THEN
        ALTER TABLE warehouse_products ADD COLUMN wholesale_price DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- Add retail_price column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_products' AND column_name = 'retail_price') THEN
        ALTER TABLE warehouse_products ADD COLUMN retail_price DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- Add profit_margin column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_products' AND column_name = 'profit_margin') THEN
        ALTER TABLE warehouse_products ADD COLUMN profit_margin DECIMAL(5,2) DEFAULT 0;
    END IF;
    
    -- Add tax_rate column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_products' AND column_name = 'tax_rate') THEN
        ALTER TABLE warehouse_products ADD COLUMN tax_rate DECIMAL(5,2) DEFAULT 20;
    END IF;
    
    -- Add weight_kg column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_products' AND column_name = 'weight_kg') THEN
        ALTER TABLE warehouse_products ADD COLUMN weight_kg DECIMAL(8,3) DEFAULT 0;
    END IF;
    
    -- Add length_cm column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_products' AND column_name = 'length_cm') THEN
        ALTER TABLE warehouse_products ADD COLUMN length_cm DECIMAL(8,2) DEFAULT 0;
    END IF;
    
    -- Add width_cm column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_products' AND column_name = 'width_cm') THEN
        ALTER TABLE warehouse_products ADD COLUMN width_cm DECIMAL(8,2) DEFAULT 0;
    END IF;
    
    -- Add height_cm column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_products' AND column_name = 'height_cm') THEN
        ALTER TABLE warehouse_products ADD COLUMN height_cm DECIMAL(8,2) DEFAULT 0;
    END IF;
    
    -- Add volume_l column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_products' AND column_name = 'volume_l') THEN
        ALTER TABLE warehouse_products ADD COLUMN volume_l DECIMAL(8,2) DEFAULT 0;
    END IF;
    
    -- Add area_m2 column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_products' AND column_name = 'area_m2') THEN
        ALTER TABLE warehouse_products ADD COLUMN area_m2 DECIMAL(8,2) DEFAULT 0;
    END IF;
    
    -- Add pieces_per_unit column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_products' AND column_name = 'pieces_per_unit') THEN
        ALTER TABLE warehouse_products ADD COLUMN pieces_per_unit INTEGER DEFAULT 1;
    END IF;
    
    -- Add minimum_order_quantity column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_products' AND column_name = 'minimum_order_quantity') THEN
        ALTER TABLE warehouse_products ADD COLUMN minimum_order_quantity INTEGER DEFAULT 1;
    END IF;
    
    -- Add reorder_point column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_products' AND column_name = 'reorder_point') THEN
        ALTER TABLE warehouse_products ADD COLUMN reorder_point INTEGER DEFAULT 10;
    END IF;
    
    -- Add lead_time_days column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_products' AND column_name = 'lead_time_days') THEN
        ALTER TABLE warehouse_products ADD COLUMN lead_time_days INTEGER DEFAULT 7;
    END IF;
    
    -- Add shelf_life_days column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_products' AND column_name = 'shelf_life_days') THEN
        ALTER TABLE warehouse_products ADD COLUMN shelf_life_days INTEGER DEFAULT 365;
    END IF;
    
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_products' AND column_name = 'is_active') THEN
        ALTER TABLE warehouse_products ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    -- Add is_tracked column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_products' AND column_name = 'is_tracked') THEN
        ALTER TABLE warehouse_products ADD COLUMN is_tracked BOOLEAN DEFAULT true;
    END IF;
    
    -- Add barcode column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_products' AND column_name = 'barcode') THEN
        ALTER TABLE warehouse_products ADD COLUMN barcode VARCHAR(100);
    END IF;
    
    -- Add qr_code column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_products' AND column_name = 'qr_code') THEN
        ALTER TABLE warehouse_products ADD COLUMN qr_code VARCHAR(100);
    END IF;
    
    -- Add image_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_products' AND column_name = 'image_url') THEN
        ALTER TABLE warehouse_products ADD COLUMN image_url VARCHAR(500);
    END IF;
    
    -- Add specifications column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_products' AND column_name = 'specifications') THEN
        ALTER TABLE warehouse_products ADD COLUMN specifications JSONB;
    END IF;
    
    -- Add tags column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_products' AND column_name = 'tags') THEN
        ALTER TABLE warehouse_products ADD COLUMN tags TEXT[];
    END IF;
END $$;

-- Step 2: Update existing products with enhanced data
UPDATE warehouse_products SET
  product_code = CASE 
    WHEN sku = 'LAP-DELL-XPS13' THEN 'DELL-XPS13-2024'
    WHEN sku = 'PHONE-IPHONE15PRO' THEN 'APPLE-IPHONE15PRO-256'
    WHEN sku = 'AUDIO-SONY-WH1000' THEN 'SONY-WH1000XM5'
    WHEN sku = 'CLOTH-TSHIRT-COTTON' THEN 'TSHIRT-COTTON-PREM'
    WHEN sku = 'CLOTH-JEANS-DENIM' THEN 'JEANS-DENIM-CLASSIC'
    WHEN sku = 'BOOK-PROG-JS' THEN 'BOOK-JS-PROG-2024'
    WHEN sku = 'TOOL-DRILL-DEWALT' THEN 'DRILL-DEWALT-PRO'
    ELSE 'PROD-' || sku
  END,
  supplier = CASE 
    WHEN sku = 'LAP-DELL-XPS13' THEN 'Dell Technologies'
    WHEN sku = 'PHONE-IPHONE15PRO' THEN 'Apple Inc.'
    WHEN sku = 'AUDIO-SONY-WH1000' THEN 'Sony Corporation'
    WHEN sku = 'CLOTH-TSHIRT-COTTON' THEN 'Fashion Supplier Co.'
    WHEN sku = 'CLOTH-JEANS-DENIM' THEN 'Denim World Ltd.'
    WHEN sku = 'BOOK-PROG-JS' THEN 'Tech Books Publishing'
    WHEN sku = 'TOOL-DRILL-DEWALT' THEN 'DeWalt Tools Inc.'
    ELSE 'Default Supplier'
  END,
  supplier_code = CASE 
    WHEN sku = 'LAP-DELL-XPS13' THEN 'DELL001'
    WHEN sku = 'PHONE-IPHONE15PRO' THEN 'APPLE001'
    WHEN sku = 'AUDIO-SONY-WH1000' THEN 'SONY001'
    WHEN sku = 'CLOTH-TSHIRT-COTTON' THEN 'FASH001'
    WHEN sku = 'CLOTH-JEANS-DENIM' THEN 'DENIM001'
    WHEN sku = 'BOOK-PROG-JS' THEN 'TECH001'
    WHEN sku = 'TOOL-DRILL-DEWALT' THEN 'DEWALT001'
    ELSE 'SUPP001'
  END,
  serial_number = CASE 
    WHEN sku = 'LAP-DELL-XPS13' THEN 'SN-DELL-XPS13-2024-001'
    WHEN sku = 'PHONE-IPHONE15PRO' THEN 'SN-APPLE-IPHONE15PRO-2024-001'
    WHEN sku = 'AUDIO-SONY-WH1000' THEN 'SN-SONY-WH1000XM5-2024-001'
    WHEN sku = 'CLOTH-TSHIRT-COTTON' THEN 'SN-TSHIRT-COTTON-2024-001'
    WHEN sku = 'CLOTH-JEANS-DENIM' THEN 'SN-JEANS-DENIM-2024-001'
    WHEN sku = 'BOOK-PROG-JS' THEN 'SN-BOOK-JS-2024-001'
    WHEN sku = 'TOOL-DRILL-DEWALT' THEN 'SN-DRILL-DEWALT-2024-001'
    ELSE 'SN-' || sku || '-001'
  END,
  subcategory = CASE 
    WHEN category = 'electronics' THEN 'laptops'
    WHEN category = 'clothing' THEN 't-shirts'
    WHEN category = 'books' THEN 'programming'
    WHEN category = 'tools' THEN 'power-tools'
    ELSE 'general'
  END,
  brand = CASE 
    WHEN sku = 'LAP-DELL-XPS13' THEN 'Dell'
    WHEN sku = 'PHONE-IPHONE15PRO' THEN 'Apple'
    WHEN sku = 'AUDIO-SONY-WH1000' THEN 'Sony'
    WHEN sku = 'CLOTH-TSHIRT-COTTON' THEN 'Premium Brand'
    WHEN sku = 'CLOTH-JEANS-DENIM' THEN 'Classic Denim'
    WHEN sku = 'BOOK-PROG-JS' THEN 'Tech Books'
    WHEN sku = 'TOOL-DRILL-DEWALT' THEN 'DeWalt'
    ELSE 'Generic'
  END,
  model = CASE 
    WHEN sku = 'LAP-DELL-XPS13' THEN 'XPS 13'
    WHEN sku = 'PHONE-IPHONE15PRO' THEN 'iPhone 15 Pro'
    WHEN sku = 'AUDIO-SONY-WH1000' THEN 'WH-1000XM5'
    WHEN sku = 'CLOTH-TSHIRT-COTTON' THEN 'Cotton Classic'
    WHEN sku = 'CLOTH-JEANS-DENIM' THEN 'Classic Fit'
    WHEN sku = 'BOOK-PROG-JS' THEN 'JavaScript Complete'
    WHEN sku = 'TOOL-DRILL-DEWALT' THEN '20V MAX XR'
    ELSE 'Standard'
  END,
  purchase_price = cost_price,
  sale_price = unit_price,
  wholesale_price = CASE 
    WHEN unit_price > 0 THEN unit_price * 0.85
    ELSE 0
  END,
  retail_price = unit_price,
  profit_margin = CASE 
    WHEN unit_price > 0 AND cost_price > 0 THEN ((unit_price - cost_price) / unit_price) * 100
    ELSE 30
  END,
  tax_rate = 20,
  weight_kg = CASE 
    WHEN category = 'electronics' THEN 1.2
    WHEN category = 'clothing' THEN 0.15
    WHEN category = 'books' THEN 0.8
    WHEN category = 'tools' THEN 2.1
    ELSE 0.5
  END,
  length_cm = CASE 
    WHEN category = 'electronics' THEN 30.0
    WHEN category = 'clothing' THEN 25.0
    WHEN category = 'books' THEN 23.5
    WHEN category = 'tools' THEN 35.0
    ELSE 20.0
  END,
  width_cm = CASE 
    WHEN category = 'electronics' THEN 20.0
    WHEN category = 'clothing' THEN 20.0
    WHEN category = 'books' THEN 18.5
    WHEN category = 'tools' THEN 25.0
    ELSE 15.0
  END,
  height_cm = CASE 
    WHEN category = 'electronics' THEN 1.5
    WHEN category = 'clothing' THEN 2.0
    WHEN category = 'books' THEN 2.5
    WHEN category = 'tools' THEN 15.0
    ELSE 5.0
  END,
  volume_l = CASE 
    WHEN category = 'electronics' THEN 0.9
    WHEN category = 'clothing' THEN 1.0
    WHEN category = 'books' THEN 1.09
    WHEN category = 'tools' THEN 13.125
    ELSE 1.5
  END,
  area_m2 = CASE 
    WHEN category = 'electronics' THEN 0.06
    WHEN category = 'clothing' THEN 0.05
    WHEN category = 'books' THEN 0.044
    WHEN category = 'tools' THEN 0.088
    ELSE 0.03
  END,
  pieces_per_unit = 1,
  minimum_order_quantity = CASE 
    WHEN category = 'clothing' THEN 10
    WHEN category = 'books' THEN 1
    WHEN category = 'tools' THEN 1
    ELSE 1
  END,
  reorder_point = CASE 
    WHEN category = 'electronics' THEN 5
    WHEN category = 'clothing' THEN 50
    WHEN category = 'books' THEN 10
    WHEN category = 'tools' THEN 5
    ELSE 10
  END,
  lead_time_days = CASE 
    WHEN category = 'electronics' THEN 14
    WHEN category = 'clothing' THEN 7
    WHEN category = 'books' THEN 7
    WHEN category = 'tools' THEN 21
    ELSE 7
  END,
  shelf_life_days = CASE 
    WHEN category = 'electronics' THEN 1095
    WHEN category = 'clothing' THEN 730
    WHEN category = 'books' THEN 1825
    WHEN category = 'tools' THEN 1825
    ELSE 365
  END,
  barcode = CASE 
    WHEN sku = 'LAP-DELL-XPS13' THEN '1234567890123'
    WHEN sku = 'PHONE-IPHONE15PRO' THEN '9876543210987'
    WHEN sku = 'AUDIO-SONY-WH1000' THEN '4567891234567'
    WHEN sku = 'CLOTH-TSHIRT-COTTON' THEN '7891234567890'
    WHEN sku = 'CLOTH-JEANS-DENIM' THEN '3216549873210'
    WHEN sku = 'BOOK-PROG-JS' THEN '1472583691472'
    WHEN sku = 'TOOL-DRILL-DEWALT' THEN '9638527419638'
    ELSE '0000000000000'
  END,
  specifications = CASE 
    WHEN sku = 'LAP-DELL-XPS13' THEN '{"cpu": "Intel i7-1165G7", "ram": "16GB", "storage": "512GB SSD", "display": "13.4 inch 4K"}'::jsonb
    WHEN sku = 'PHONE-IPHONE15PRO' THEN '{"storage": "256GB", "color": "Natural Titanium", "camera": "48MP", "chip": "A17 Pro"}'::jsonb
    WHEN sku = 'AUDIO-SONY-WH1000' THEN '{"battery": "30 hours", "noise_cancellation": "Yes", "bluetooth": "5.2", "weight": "250g"}'::jsonb
    WHEN sku = 'CLOTH-TSHIRT-COTTON' THEN '{"material": "100% Cotton", "sizes": ["S", "M", "L", "XL"], "colors": ["White", "Black", "Blue"]}'::jsonb
    WHEN sku = 'CLOTH-JEANS-DENIM' THEN '{"material": "100% Cotton Denim", "fits": ["Slim", "Regular", "Relaxed"], "colors": ["Blue", "Black", "Grey"]}'::jsonb
    WHEN sku = 'BOOK-PROG-JS' THEN '{"pages": "450", "language": "English", "format": "Paperback", "isbn": "978-1234567890"}'::jsonb
    WHEN sku = 'TOOL-DRILL-DEWALT' THEN '{"voltage": "20V MAX", "battery": "5.0Ah", "chuck": "1/2 inch", "speed": "0-2000 RPM"}'::jsonb
    ELSE '{}'::jsonb
  END,
  tags = CASE 
    WHEN sku = 'LAP-DELL-XPS13' THEN ARRAY['laptop', 'premium', 'business']
    WHEN sku = 'PHONE-IPHONE15PRO' THEN ARRAY['smartphone', 'premium', '5G']
    WHEN sku = 'AUDIO-SONY-WH1000' THEN ARRAY['headphones', 'wireless', 'noise-cancelling']
    WHEN sku = 'CLOTH-TSHIRT-COTTON' THEN ARRAY['t-shirt', 'cotton', 'casual']
    WHEN sku = 'CLOTH-JEANS-DENIM' THEN ARRAY['jeans', 'denim', 'casual']
    WHEN sku = 'BOOK-PROG-JS' THEN ARRAY['book', 'programming', 'javascript']
    WHEN sku = 'TOOL-DRILL-DEWALT' THEN ARRAY['drill', 'power-tool', 'professional']
    ELSE ARRAY['general']
  END
WHERE id IS NOT NULL;

-- Step 3: Insert new enhanced products if they don't exist
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
    5, 14, 1095, '1234567890123', '{"cpu": "Intel i7-1165G7", "ram": "16GB", "storage": "512GB SSD", "display": "13.4 inch 4K"}', ARRAY['laptop', 'premium', 'business']
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