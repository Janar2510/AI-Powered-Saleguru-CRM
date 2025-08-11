-- Step 1: Create warehouse_movements table with correct structure if it doesn't exist
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

-- Step 2: Add missing columns if they don't exist
DO $$
BEGIN
    -- Add product_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_movements' AND column_name = 'product_id') THEN
        ALTER TABLE warehouse_movements ADD COLUMN product_id UUID;
    END IF;
    
    -- Add from_location_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_movements' AND column_name = 'from_location_id') THEN
        ALTER TABLE warehouse_movements ADD COLUMN from_location_id UUID REFERENCES warehouse_locations(id);
    END IF;
    
    -- Add to_location_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_movements' AND column_name = 'to_location_id') THEN
        ALTER TABLE warehouse_movements ADD COLUMN to_location_id UUID REFERENCES warehouse_locations(id);
    END IF;
    
    -- Add reference column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_movements' AND column_name = 'reference') THEN
        ALTER TABLE warehouse_movements ADD COLUMN reference VARCHAR(255) NOT NULL DEFAULT 'MOVEMENT';
    END IF;
    
    -- Add notes column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouse_movements' AND column_name = 'notes') THEN
        ALTER TABLE warehouse_movements ADD COLUMN notes TEXT;
    END IF;
END $$;

-- Step 3: Enable RLS for warehouse_movements
ALTER TABLE warehouse_movements ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies for warehouse_movements (only if they don't exist)
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

-- Step 5: Insert sample movements (only if they don't exist)
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