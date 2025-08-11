-- Insert missing warehouse products
INSERT INTO warehouse_products (name, sku, description, category, unit_price, cost_price) VALUES
  ('Laptop Dell XPS 13', 'LAP-DELL-XPS13', 'High-performance laptop with 16GB RAM', 'electronics', 1299.99, 899.99),
  ('iPhone 15 Pro', 'PHONE-IPHONE15PRO', 'Latest iPhone with 256GB storage', 'electronics', 999.99, 699.99),
  ('Wireless Headphones', 'AUDIO-SONY-WH1000', 'Noise-cancelling wireless headphones', 'electronics', 349.99, 249.99),
  ('Cotton T-Shirt', 'CLOTH-TSHIRT-COTTON', 'Premium cotton t-shirt, various sizes', 'clothing', 29.99, 15.99),
  ('Denim Jeans', 'CLOTH-JEANS-DENIM', 'Classic denim jeans, multiple fits', 'clothing', 79.99, 45.99),
  ('Programming Book', 'BOOK-PROG-JS', 'JavaScript programming guide', 'books', 49.99, 25.99),
  ('Drill Set', 'TOOL-DRILL-DEWALT', 'Professional drill set with bits', 'tools', 199.99, 120.99)
ON CONFLICT (sku) DO NOTHING;

-- Insert stock items for the products
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

-- Insert some sample movements
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

-- Update warehouse locations with proper data
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