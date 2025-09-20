-- Warehouse & Inventory Management System
-- Migration: stock & fulfillment operations

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Check if organizations table exists, create basic one if not
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations') THEN
    CREATE TABLE organizations (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Insert a default organization for existing data
    INSERT INTO organizations (id, name) VALUES (uuid_generate_v4(), 'Default Organization');
  END IF;
END $$;

-- Warehouses
CREATE TABLE IF NOT EXISTS warehouses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  country TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (org_id, code)
);

-- Warehouse Locations within warehouses
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  aisle TEXT,
  rack TEXT,
  shelf TEXT,
  bin TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (org_id, warehouse_id, code)
);

-- Add SKU column to products if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sku') THEN
    ALTER TABLE products ADD COLUMN sku TEXT;
    CREATE INDEX IF NOT EXISTS products_sku_idx ON products(sku);
  END IF;
END $$;

-- On-hand stock per (product, location)
CREATE TABLE IF NOT EXISTS stock_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL,
  product_id UUID NOT NULL,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  qty NUMERIC(14,3) NOT NULL DEFAULT 0,
  reserved_qty NUMERIC(14,3) NOT NULL DEFAULT 0,
  available_qty NUMERIC(14,3) GENERATED ALWAYS AS (qty - reserved_qty) STORED,
  cost_per_unit NUMERIC(12,2),
  last_movement_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (org_id, product_id, location_id)
);

-- Stock moves (immutable ledger)
CREATE TABLE IF NOT EXISTS stock_moves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL,
  product_id UUID NOT NULL,
  from_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  to_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  qty NUMERIC(14,3) NOT NULL,
  unit_cost NUMERIC(12,2),
  reason TEXT CHECK (reason IN ('purchase','sale_reservation','shipment','adjustment','return','transfer','initial_stock')),
  ref_table TEXT,           -- e.g. 'sales_orders' | 'invoices' | 'purchase_orders'
  ref_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

-- Purchase Orders (if not exists)
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL,
  po_number TEXT UNIQUE NOT NULL,
  supplier_id UUID,
  supplier_name TEXT NOT NULL,
  status TEXT CHECK (status IN ('draft','sent','confirmed','partially_received','received','cancelled')) DEFAULT 'draft',
  order_date DATE DEFAULT CURRENT_DATE,
  expected_delivery_date DATE,
  received_date DATE,
  subtotal NUMERIC(12,2) DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  total_amount NUMERIC(12,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

-- Purchase Order Lines
CREATE TABLE IF NOT EXISTS purchase_order_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  qty_ordered NUMERIC(14,3) NOT NULL,
  qty_received NUMERIC(14,3) DEFAULT 0,
  unit_cost NUMERIC(12,2) NOT NULL,
  line_total NUMERIC(12,2) NOT NULL,
  location_id UUID REFERENCES locations(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales Order Reservations
CREATE TABLE IF NOT EXISTS so_reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL,
  sales_order_id UUID NOT NULL,
  product_id UUID NOT NULL,
  qty NUMERIC(14,3) NOT NULL,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
  reserved_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shipments header + lines
CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL,
  sales_order_id UUID,
  shipment_number TEXT UNIQUE NOT NULL,
  status TEXT CHECK (status IN ('draft','packed','shipped','delivered','cancelled')) DEFAULT 'draft',
  carrier TEXT,
  tracking_number TEXT,
  shipping_address TEXT,
  shipping_cost NUMERIC(12,2),
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

CREATE TABLE IF NOT EXISTS shipment_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  qty NUMERIC(14,3) NOT NULL,
  location_id UUID REFERENCES locations(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory Adjustments
CREATE TABLE IF NOT EXISTS inventory_adjustments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL,
  adjustment_number TEXT UNIQUE NOT NULL,
  reason TEXT NOT NULL,
  status TEXT CHECK (status IN ('draft','approved','posted')) DEFAULT 'draft',
  adjustment_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

CREATE TABLE IF NOT EXISTS inventory_adjustment_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  adjustment_id UUID NOT NULL REFERENCES inventory_adjustments(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  location_id UUID NOT NULL REFERENCES locations(id),
  current_qty NUMERIC(14,3) NOT NULL,
  adjusted_qty NUMERIC(14,3) NOT NULL,
  difference_qty NUMERIC(14,3) GENERATED ALWAYS AS (adjusted_qty - current_qty) STORED,
  unit_cost NUMERIC(12,2),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-numbering sequences
CREATE SEQUENCE IF NOT EXISTS po_number_seq START 1000;
CREATE SEQUENCE IF NOT EXISTS shipment_number_seq START 2000;
CREATE SEQUENCE IF NOT EXISTS adjustment_number_seq START 3000;

-- Auto-numbering functions
CREATE OR REPLACE FUNCTION generate_po_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'PO-' || LPAD(nextval('po_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_shipment_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'SH-' || LPAD(nextval('shipment_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_adjustment_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ADJ-' || LPAD(nextval('adjustment_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Auto-numbering triggers
CREATE OR REPLACE FUNCTION set_po_number() 
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.po_number IS NULL THEN 
    NEW.po_number := generate_po_number(); 
  END IF;
  RETURN NEW;
END; 
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_shipment_number() 
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.shipment_number IS NULL THEN 
    NEW.shipment_number := generate_shipment_number(); 
  END IF;
  RETURN NEW;
END; 
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_adjustment_number() 
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.adjustment_number IS NULL THEN 
    NEW.adjustment_number := generate_adjustment_number(); 
  END IF;
  RETURN NEW;
END; 
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trg_po_number ON purchase_orders;
CREATE TRIGGER trg_po_number BEFORE INSERT ON purchase_orders FOR EACH ROW EXECUTE FUNCTION set_po_number();

DROP TRIGGER IF EXISTS trg_shipment_number ON shipments;
CREATE TRIGGER trg_shipment_number BEFORE INSERT ON shipments FOR EACH ROW EXECUTE FUNCTION set_shipment_number();

DROP TRIGGER IF EXISTS trg_adjustment_number ON inventory_adjustments;
CREATE TRIGGER trg_adjustment_number BEFORE INSERT ON inventory_adjustments FOR EACH ROW EXECUTE FUNCTION set_adjustment_number();

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON warehouses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stock_items_updated_at BEFORE UPDATE ON stock_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_adjustments_updated_at BEFORE UPDATE ON inventory_adjustments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Stock management functions
CREATE OR REPLACE FUNCTION reserve_stock(
  p_org UUID,
  p_product UUID,
  p_location UUID,
  p_qty NUMERIC,
  p_ref_table TEXT DEFAULT NULL,
  p_ref_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  available_qty NUMERIC;
BEGIN
  -- Check available quantity
  SELECT (qty - reserved_qty) INTO available_qty
  FROM stock_items 
  WHERE org_id = p_org AND product_id = p_product AND location_id = p_location;
  
  IF available_qty IS NULL OR available_qty < p_qty THEN
    RETURN FALSE;
  END IF;
  
  -- Update reserved quantity
  UPDATE stock_items 
  SET reserved_qty = reserved_qty + p_qty,
      updated_at = NOW()
  WHERE org_id = p_org AND product_id = p_product AND location_id = p_location;
  
  -- Create stock move
  INSERT INTO stock_moves (
    org_id, product_id, from_location_id, qty, reason, ref_table, ref_id
  ) VALUES (
    p_org, p_product, p_location, -p_qty, 'sale_reservation', p_ref_table, p_ref_id
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION ship_stock(
  p_org UUID,
  p_product UUID,
  p_location UUID,
  p_qty NUMERIC,
  p_ref_table TEXT DEFAULT NULL,
  p_ref_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  reserved_qty NUMERIC;
BEGIN
  -- Check reserved quantity
  SELECT reserved_qty INTO reserved_qty
  FROM stock_items 
  WHERE org_id = p_org AND product_id = p_product AND location_id = p_location;
  
  IF reserved_qty IS NULL OR reserved_qty < p_qty THEN
    RETURN FALSE;
  END IF;
  
  -- Update quantities
  UPDATE stock_items 
  SET qty = qty - p_qty,
      reserved_qty = reserved_qty - p_qty,
      last_movement_date = NOW(),
      updated_at = NOW()
  WHERE org_id = p_org AND product_id = p_product AND location_id = p_location;
  
  -- Create stock move
  INSERT INTO stock_moves (
    org_id, product_id, from_location_id, qty, reason, ref_table, ref_id
  ) VALUES (
    p_org, p_product, p_location, -p_qty, 'shipment', p_ref_table, p_ref_id
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION adjust_stock(
  p_org UUID,
  p_product UUID,
  p_location UUID,
  p_new_qty NUMERIC,
  p_unit_cost NUMERIC DEFAULT NULL,
  p_reason TEXT DEFAULT 'adjustment',
  p_ref_table TEXT DEFAULT NULL,
  p_ref_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  current_qty NUMERIC;
  difference NUMERIC;
BEGIN
  -- Get current quantity
  SELECT qty INTO current_qty
  FROM stock_items 
  WHERE org_id = p_org AND product_id = p_product AND location_id = p_location;
  
  IF current_qty IS NULL THEN
    -- Create new stock item
    INSERT INTO stock_items (org_id, product_id, location_id, qty, cost_per_unit)
    VALUES (p_org, p_product, p_location, p_new_qty, p_unit_cost);
    difference := p_new_qty;
  ELSE
    -- Update existing stock item
    difference := p_new_qty - current_qty;
    UPDATE stock_items 
    SET qty = p_new_qty,
        cost_per_unit = COALESCE(p_unit_cost, cost_per_unit),
        last_movement_date = NOW(),
        updated_at = NOW()
    WHERE org_id = p_org AND product_id = p_product AND location_id = p_location;
  END IF;
  
  -- Create stock move for the difference
  IF difference != 0 THEN
    INSERT INTO stock_moves (
      org_id, product_id, to_location_id, qty, unit_cost, reason, ref_table, ref_id
    ) VALUES (
      p_org, p_product, p_location, difference, p_unit_cost, p_reason, p_ref_table, p_ref_id
    );
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- VIEWs for convenient querying
CREATE OR REPLACE VIEW stock_available_v AS
SELECT 
  si.org_id,
  si.product_id,
  si.location_id,
  l.warehouse_id,
  w.name as warehouse_name,
  l.name as location_name,
  l.code as location_code,
  SUM(si.qty) as on_hand,
  SUM(si.reserved_qty) as reserved,
  SUM(si.available_qty) as available,
  AVG(si.cost_per_unit) as avg_cost,
  MAX(si.last_movement_date) as last_movement
FROM stock_items si
JOIN locations l ON l.id = si.location_id
JOIN warehouses w ON w.id = l.warehouse_id
GROUP BY si.org_id, si.product_id, si.location_id, l.warehouse_id, w.name, l.name, l.code;

CREATE OR REPLACE VIEW product_stock_summary_v AS
SELECT 
  si.org_id,
  si.product_id,
  SUM(si.qty) as total_on_hand,
  SUM(si.reserved_qty) as total_reserved,
  SUM(si.available_qty) as total_available,
  COUNT(DISTINCT si.location_id) as locations_count,
  AVG(si.cost_per_unit) as avg_cost,
  SUM(si.qty * si.cost_per_unit) as total_value
FROM stock_items si
GROUP BY si.org_id, si.product_id;

-- Sample data for testing
DO $$
DECLARE
  default_org_id UUID;
  main_warehouse_id UUID;
  main_location_id UUID;
BEGIN
  -- Get or create default organization
  SELECT id INTO default_org_id FROM organizations LIMIT 1;
  
  IF default_org_id IS NULL THEN
    INSERT INTO organizations (name) VALUES ('Default Organization') RETURNING id INTO default_org_id;
  END IF;
  
  -- Create default warehouse
  INSERT INTO warehouses (org_id, code, name, is_default, is_active)
  VALUES (default_org_id, 'MAIN', 'Main Warehouse', TRUE, TRUE)
  RETURNING id INTO main_warehouse_id;
  
  -- Create default locations
  INSERT INTO locations (org_id, warehouse_id, code, name)
  VALUES 
    (default_org_id, main_warehouse_id, 'A1', 'Aisle A - Shelf 1'),
    (default_org_id, main_warehouse_id, 'A2', 'Aisle A - Shelf 2'),
    (default_org_id, main_warehouse_id, 'B1', 'Aisle B - Shelf 1'),
    (default_org_id, main_warehouse_id, 'B2', 'Aisle B - Shelf 2'),
    (default_org_id, main_warehouse_id, 'RECV', 'Receiving Dock'),
    (default_org_id, main_warehouse_id, 'SHIP', 'Shipping Dock');
  
  RAISE NOTICE 'Sample warehouse and locations created successfully!';
END $$;

-- Enable Row Level Security (RLS)
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE so_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_adjustment_lines ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies would typically reference user organizations
-- For now, we'll keep them simple for development
CREATE POLICY "Allow all operations for authenticated users" ON warehouses FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON locations FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON stock_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON stock_moves FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON purchase_orders FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON purchase_order_lines FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON so_reservations FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON shipments FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON shipment_lines FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON inventory_adjustments FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON inventory_adjustment_lines FOR ALL TO authenticated USING (true);

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Success message
SELECT 'Warehouse & Inventory Management System created successfully!' as message;


