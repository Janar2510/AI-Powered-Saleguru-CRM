-- Fix invoices table structure
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS due_date DATE;

-- Update existing invoices to have customer_name
UPDATE invoices SET customer_name = partner_name WHERE customer_name IS NULL;

-- Update existing status values to match new constraint
UPDATE invoices SET status = 'draft' WHERE status = 'pending';

-- Make customer_name NOT NULL after updating
ALTER TABLE invoices ALTER COLUMN customer_name SET NOT NULL;

-- Update status constraint
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_status_check;
ALTER TABLE invoices ADD CONSTRAINT invoices_status_check 
CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled'));

-- Fix warehouse_locations table structure
ALTER TABLE warehouse_locations 
ADD COLUMN IF NOT EXISTS code VARCHAR(50),
ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_usage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- Add constraints for warehouse_locations
ALTER TABLE warehouse_locations DROP CONSTRAINT IF EXISTS warehouse_locations_type_check;
ALTER TABLE warehouse_locations ADD CONSTRAINT warehouse_locations_type_check 
CHECK (type IN ('storage', 'shipping', 'receiving', 'production'));

ALTER TABLE warehouse_locations DROP CONSTRAINT IF EXISTS warehouse_locations_status_check;
ALTER TABLE warehouse_locations ADD CONSTRAINT warehouse_locations_status_check 
CHECK (status IN ('active', 'inactive', 'maintenance'));

-- Fix warehouse_stock table structure
ALTER TABLE warehouse_stock 
ADD COLUMN IF NOT EXISTS reserved_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS available_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS min_stock_level INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS max_stock_level INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Rename columns for consistency
ALTER TABLE warehouse_stock RENAME COLUMN min_quantity TO min_stock_level;
ALTER TABLE warehouse_stock RENAME COLUMN max_quantity TO max_stock_level;

-- Fix warehouse_movements table structure
ALTER TABLE warehouse_movements 
ADD COLUMN IF NOT EXISTS product_id UUID,
ADD COLUMN IF NOT EXISTS from_location_id UUID REFERENCES warehouse_locations(id),
ADD COLUMN IF NOT EXISTS to_location_id UUID REFERENCES warehouse_locations(id),
ADD COLUMN IF NOT EXISTS reference VARCHAR(255),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update type constraint for warehouse_movements
ALTER TABLE warehouse_movements DROP CONSTRAINT IF EXISTS warehouse_movements_type_check;
ALTER TABLE warehouse_movements ADD CONSTRAINT warehouse_movements_type_check 
CHECK (type IN ('in', 'out', 'transfer', 'adjustment'));

-- Update sample data for warehouse_locations
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

-- Add more warehouse locations if they don't exist
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

-- Update sample invoices with proper data
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

-- Add more sample invoices if they don't exist
INSERT INTO invoices (number, customer_name, amount, status, due_date, created_at) 
SELECT 'INV-2024-003', 'Startup Ventures', 3200.00, 'overdue', '2024-01-10', '2024-01-08T09:15:00Z'
WHERE NOT EXISTS (SELECT 1 FROM invoices WHERE number = 'INV-2024-003');

INSERT INTO invoices (number, customer_name, amount, status, due_date, created_at) 
SELECT 'INV-2024-004', 'Enterprise Systems', 4500.00, 'draft', '2024-02-15', '2024-01-12T16:45:00Z'
WHERE NOT EXISTS (SELECT 1 FROM invoices WHERE number = 'INV-2024-004');

INSERT INTO invoices (number, customer_name, amount, status, due_date, created_at) 
SELECT 'INV-2024-005', 'Digital Marketing Co', 1200.00, 'paid', '2024-01-20', '2024-01-15T11:20:00Z'
WHERE NOT EXISTS (SELECT 1 FROM invoices WHERE number = 'INV-2024-005'); 