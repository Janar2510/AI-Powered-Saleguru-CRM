-- Comprehensive Warehouse Management System
-- This migration creates a world-class warehouse management system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Core warehouse tables (enhanced)
CREATE TABLE IF NOT EXISTS warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  phone VARCHAR(50),
  email VARCHAR(255),
  manager_name VARCHAR(255),
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  timezone VARCHAR(50) DEFAULT 'UTC',
  working_hours JSONB DEFAULT '{"monday": {"start": "09:00", "end": "17:00"}, "tuesday": {"start": "09:00", "end": "17:00"}, "wednesday": {"start": "09:00", "end": "17:00"}, "thursday": {"start": "09:00", "end": "17:00"}, "friday": {"start": "09:00", "end": "17:00"}, "saturday": {"start": "09:00", "end": "17:00"}, "sunday": {"start": "09:00", "end": "17:00"}}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(org_id, code)
);

-- Enhanced locations with zones and automation
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  zone VARCHAR(100), -- e.g., 'A', 'B', 'Receiving', 'Shipping'
  aisle VARCHAR(10),
  rack VARCHAR(10),
  shelf VARCHAR(10),
  bin VARCHAR(10),
  location_type VARCHAR(50) DEFAULT 'storage', -- storage, receiving, shipping, picking, quarantine
  capacity_volume DECIMAL(10,2), -- in cubic meters
  capacity_weight DECIMAL(10,2), -- in kg
  temperature_controlled BOOLEAN DEFAULT false,
  hazmat_approved BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  barcode VARCHAR(255),
  qr_code VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(org_id, warehouse_id, code)
);

-- Enhanced stock items with lot tracking
CREATE TABLE IF NOT EXISTS stock_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  product_id UUID NOT NULL, -- References products table
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  lot_number VARCHAR(100),
  serial_number VARCHAR(100),
  expiry_date DATE,
  qty INTEGER DEFAULT 0,
  reserved_qty INTEGER DEFAULT 0,
  available_qty INTEGER GENERATED ALWAYS AS (qty - reserved_qty) STORED,
  cost_per_unit DECIMAL(10,2),
  last_movement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_count_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_qty_positive CHECK (qty >= 0),
  CONSTRAINT check_reserved_qty_positive CHECK (reserved_qty >= 0),
  CONSTRAINT check_reserved_not_exceed_qty CHECK (reserved_qty <= qty)
);

-- Stock movements with enhanced tracking
CREATE TABLE IF NOT EXISTS stock_moves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  product_id UUID NOT NULL,
  from_location_id UUID REFERENCES locations(id),
  to_location_id UUID REFERENCES locations(id),
  lot_number VARCHAR(100),
  qty INTEGER NOT NULL,
  unit_cost DECIMAL(10,2),
  reason VARCHAR(50) NOT NULL, -- purchase, sale_reservation, shipment, adjustment, return, transfer, cycle_count
  ref_table VARCHAR(50), -- purchase_orders, sales_orders, adjustments, etc.
  ref_id UUID,
  notes TEXT,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  CONSTRAINT check_movement_locations CHECK (
    (from_location_id IS NOT NULL OR to_location_id IS NOT NULL) AND
    (from_location_id IS NULL OR to_location_id IS NULL OR from_location_id != to_location_id)
  )
);

-- Purchase Orders System
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  po_number VARCHAR(100) NOT NULL,
  supplier_id UUID, -- References suppliers table
  supplier_name VARCHAR(255) NOT NULL,
  supplier_contact JSONB, -- {email, phone, address}
  status VARCHAR(50) DEFAULT 'draft', -- draft, sent, confirmed, partially_received, received, cancelled
  order_date DATE NOT NULL,
  expected_delivery_date DATE,
  received_date DATE,
  warehouse_id UUID REFERENCES warehouses(id),
  subtotal DECIMAL(12,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  shipping_cost DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_terms VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(org_id, po_number)
);

-- Purchase Order Lines
CREATE TABLE IF NOT EXISTS purchase_order_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_sku VARCHAR(100),
  qty_ordered INTEGER NOT NULL,
  qty_received INTEGER DEFAULT 0,
  unit_cost DECIMAL(10,2) NOT NULL,
  line_total DECIMAL(12,2) GENERATED ALWAYS AS (qty_ordered * unit_cost) STORED,
  location_id UUID REFERENCES locations(id),
  lot_number VARCHAR(100),
  expiry_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_po_qty_positive CHECK (qty_ordered > 0),
  CONSTRAINT check_po_qty_received_positive CHECK (qty_received >= 0),
  CONSTRAINT check_po_qty_received_not_exceed_ordered CHECK (qty_received <= qty_ordered)
);

-- Sales Orders System
CREATE TABLE IF NOT EXISTS sales_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  so_number VARCHAR(100) NOT NULL,
  customer_id UUID, -- References contacts table
  customer_name VARCHAR(255) NOT NULL,
  customer_contact JSONB, -- {email, phone, shipping_address, billing_address}
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, processing, picked, packed, shipped, delivered, cancelled
  order_date DATE NOT NULL,
  required_date DATE,
  shipped_date DATE,
  warehouse_id UUID REFERENCES warehouses(id),
  subtotal DECIMAL(12,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  shipping_cost DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_method VARCHAR(100),
  tracking_number VARCHAR(255),
  carrier VARCHAR(100),
  shipping_service VARCHAR(100),
  notes TEXT,
  channel VARCHAR(50) DEFAULT 'direct', -- direct, amazon, ebay, shopify, etc.
  channel_order_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  UNIQUE(org_id, so_number)
);

-- Sales Order Lines
CREATE TABLE IF NOT EXISTS sales_order_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  so_id UUID REFERENCES sales_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_sku VARCHAR(100),
  qty_ordered INTEGER NOT NULL,
  qty_picked INTEGER DEFAULT 0,
  qty_shipped INTEGER DEFAULT 0,
  unit_price DECIMAL(10,2) NOT NULL,
  line_total DECIMAL(12,2) GENERATED ALWAYS AS (qty_ordered * unit_price) STORED,
  location_id UUID REFERENCES locations(id),
  lot_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_so_qty_positive CHECK (qty_ordered > 0),
  CONSTRAINT check_so_qty_picked_positive CHECK (qty_picked >= 0),
  CONSTRAINT check_so_qty_shipped_positive CHECK (qty_shipped >= 0),
  CONSTRAINT check_so_qty_picked_not_exceed_ordered CHECK (qty_picked <= qty_ordered),
  CONSTRAINT check_so_qty_shipped_not_exceed_picked CHECK (qty_shipped <= qty_picked)
);

-- Stock Reservations
CREATE TABLE IF NOT EXISTS so_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  sales_order_line_id UUID REFERENCES sales_order_lines(id) ON DELETE CASCADE,
  stock_item_id UUID REFERENCES stock_items(id) ON DELETE CASCADE,
  qty_reserved INTEGER NOT NULL,
  reserved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  CONSTRAINT check_reservation_qty_positive CHECK (qty_reserved > 0)
);

-- Shipments
CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  shipment_number VARCHAR(100) NOT NULL,
  sales_order_id UUID REFERENCES sales_orders(id),
  warehouse_id UUID REFERENCES warehouses(id),
  carrier VARCHAR(100),
  service VARCHAR(100),
  tracking_number VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- pending, in_transit, delivered, exception, returned
  ship_date DATE,
  estimated_delivery_date DATE,
  actual_delivery_date DATE,
  shipping_cost DECIMAL(10,2),
  weight_kg DECIMAL(8,2),
  dimensions JSONB, -- {length, width, height, unit}
  package_count INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(org_id, shipment_number)
);

-- Shipment Lines
CREATE TABLE IF NOT EXISTS shipment_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  sales_order_line_id UUID REFERENCES sales_order_lines(id),
  product_id UUID NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  qty_shipped INTEGER NOT NULL,
  lot_number VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_shipment_qty_positive CHECK (qty_shipped > 0)
);

-- Inventory Adjustments
CREATE TABLE IF NOT EXISTS inventory_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  adjustment_number VARCHAR(100) NOT NULL,
  warehouse_id UUID REFERENCES warehouses(id),
  reason VARCHAR(100) NOT NULL, -- damage, theft, count_correction, expired, other
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
  adjustment_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(org_id, adjustment_number)
);

-- Inventory Adjustment Lines
CREATE TABLE IF NOT EXISTS inventory_adjustment_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adjustment_id UUID REFERENCES inventory_adjustments(id) ON DELETE CASCADE,
  stock_item_id UUID REFERENCES stock_items(id),
  product_id UUID NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  location_id UUID REFERENCES locations(id),
  lot_number VARCHAR(100),
  qty_before INTEGER NOT NULL,
  qty_after INTEGER NOT NULL,
  qty_adjustment INTEGER GENERATED ALWAYS AS (qty_after - qty_before) STORED,
  unit_cost DECIMAL(10,2),
  cost_adjustment DECIMAL(12,2) GENERATED ALWAYS AS (qty_adjustment * unit_cost) STORED,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Multichannel Listings
CREATE TABLE IF NOT EXISTS multichannel_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  product_id UUID NOT NULL,
  channel VARCHAR(50) NOT NULL, -- amazon, ebay, shopify, walmart, etc.
  channel_product_id VARCHAR(255),
  listing_title VARCHAR(500),
  listing_description TEXT,
  price DECIMAL(10,2),
  quantity INTEGER,
  status VARCHAR(50) DEFAULT 'active', -- active, inactive, out_of_stock, suspended
  sync_inventory BOOLEAN DEFAULT true,
  sync_price BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  channel_data JSONB, -- channel-specific data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(org_id, product_id, channel)
);

-- AI Stock Forecasting
CREATE TABLE IF NOT EXISTS stock_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  product_id UUID NOT NULL,
  warehouse_id UUID REFERENCES warehouses(id),
  forecast_date DATE NOT NULL,
  forecast_period_days INTEGER NOT NULL, -- 7, 14, 30, 90, etc.
  current_stock INTEGER NOT NULL,
  predicted_demand INTEGER NOT NULL,
  recommended_order_qty INTEGER,
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  algorithm_version VARCHAR(50),
  factors JSONB, -- seasonality, trends, events, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(org_id, product_id, warehouse_id, forecast_date, forecast_period_days)
);

-- Low Stock Alerts
CREATE TABLE IF NOT EXISTS stock_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  product_id UUID NOT NULL,
  warehouse_id UUID REFERENCES warehouses(id),
  location_id UUID REFERENCES locations(id),
  alert_type VARCHAR(50) NOT NULL, -- low_stock, zero_stock, overstock, expiring_soon
  current_qty INTEGER,
  threshold_qty INTEGER,
  alert_level VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
  status VARCHAR(20) DEFAULT 'active', -- active, acknowledged, resolved
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Cycle Counts
CREATE TABLE IF NOT EXISTS cycle_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  count_number VARCHAR(100) NOT NULL,
  warehouse_id UUID REFERENCES warehouses(id),
  location_id UUID REFERENCES locations(id),
  count_type VARCHAR(50) DEFAULT 'cycle', -- cycle, full, spot
  status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, cancelled
  scheduled_date DATE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  counted_by UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(org_id, count_number)
);

-- Cycle Count Lines
CREATE TABLE IF NOT EXISTS cycle_count_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_count_id UUID REFERENCES cycle_counts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  location_id UUID REFERENCES locations(id),
  lot_number VARCHAR(100),
  system_qty INTEGER NOT NULL,
  counted_qty INTEGER,
  variance INTEGER GENERATED ALWAYS AS (counted_qty - system_qty) STORED,
  unit_cost DECIMAL(10,2),
  variance_cost DECIMAL(12,2) GENERATED ALWAYS AS (variance * unit_cost) STORED,
  notes TEXT,
  counted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_warehouses_org_id ON warehouses(org_id);
CREATE INDEX IF NOT EXISTS idx_locations_warehouse_id ON locations(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_items_product_location ON stock_items(product_id, location_id);
CREATE INDEX IF NOT EXISTS idx_stock_items_org_id ON stock_items(org_id);
CREATE INDEX IF NOT EXISTS idx_stock_moves_product_id ON stock_moves(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_moves_created_at ON stock_moves(created_at);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_org_id ON purchase_orders(org_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_sales_orders_org_id ON sales_orders(org_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON sales_orders(status);
CREATE INDEX IF NOT EXISTS idx_sales_orders_channel ON sales_orders(channel);
CREATE INDEX IF NOT EXISTS idx_multichannel_listings_product_id ON multichannel_listings(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_forecasts_product_warehouse ON stock_forecasts(product_id, warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_org_id_status ON stock_alerts(org_id, status);

-- Create functions for automated stock management
CREATE OR REPLACE FUNCTION update_stock_from_movement()
RETURNS TRIGGER AS $$
BEGIN
  -- Update stock when movement is created
  IF NEW.to_location_id IS NOT NULL THEN
    INSERT INTO stock_items (org_id, product_id, location_id, qty, cost_per_unit, last_movement_date)
    VALUES (NEW.org_id, NEW.product_id, NEW.to_location_id, NEW.qty, NEW.unit_cost, NEW.processed_at)
    ON CONFLICT (org_id, product_id, location_id, COALESCE(lot_number, ''))
    DO UPDATE SET 
      qty = stock_items.qty + NEW.qty,
      cost_per_unit = CASE 
        WHEN stock_items.qty + NEW.qty > 0 
        THEN ((stock_items.qty * COALESCE(stock_items.cost_per_unit, 0)) + (NEW.qty * COALESCE(NEW.unit_cost, 0))) / (stock_items.qty + NEW.qty)
        ELSE COALESCE(NEW.unit_cost, stock_items.cost_per_unit)
      END,
      last_movement_date = NEW.processed_at,
      updated_at = NOW();
  END IF;

  IF NEW.from_location_id IS NOT NULL THEN
    UPDATE stock_items 
    SET 
      qty = qty - NEW.qty,
      last_movement_date = NEW.processed_at,
      updated_at = NOW()
    WHERE org_id = NEW.org_id 
      AND product_id = NEW.product_id 
      AND location_id = NEW.from_location_id
      AND COALESCE(lot_number, '') = COALESCE(NEW.lot_number, '');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for stock movements
DROP TRIGGER IF EXISTS trigger_update_stock_from_movement ON stock_moves;
CREATE TRIGGER trigger_update_stock_from_movement
  AFTER INSERT ON stock_moves
  FOR EACH ROW
  EXECUTE FUNCTION update_stock_from_movement();

-- Function to check and create stock alerts
CREATE OR REPLACE FUNCTION check_stock_alerts()
RETURNS void AS $$
BEGIN
  -- Low stock alerts
  INSERT INTO stock_alerts (org_id, product_id, warehouse_id, location_id, alert_type, current_qty, threshold_qty, alert_level, message)
  SELECT DISTINCT
    si.org_id,
    si.product_id,
    l.warehouse_id,
    si.location_id,
    'low_stock',
    si.available_qty,
    10, -- Default threshold, should be configurable per product
    CASE 
      WHEN si.available_qty = 0 THEN 'critical'
      WHEN si.available_qty <= 5 THEN 'high'
      ELSE 'medium'
    END,
    'Stock level is below minimum threshold'
  FROM stock_items si
  JOIN locations l ON si.location_id = l.id
  WHERE si.available_qty <= 10 -- Default threshold
    AND NOT EXISTS (
      SELECT 1 FROM stock_alerts sa 
      WHERE sa.org_id = si.org_id 
        AND sa.product_id = si.product_id 
        AND sa.location_id = si.location_id 
        AND sa.alert_type = 'low_stock' 
        AND sa.status = 'active'
    );
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_order_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE so_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_adjustment_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE multichannel_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycle_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycle_count_lines ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (assuming org_id-based security)
CREATE POLICY "Users can access their org's warehouse data" ON warehouses FOR ALL USING (org_id = auth.jwt() ->> 'org_id');
CREATE POLICY "Users can access their org's location data" ON locations FOR ALL USING (org_id = auth.jwt() ->> 'org_id');
CREATE POLICY "Users can access their org's stock data" ON stock_items FOR ALL USING (org_id = auth.jwt() ->> 'org_id');
CREATE POLICY "Users can access their org's stock moves" ON stock_moves FOR ALL USING (org_id = auth.jwt() ->> 'org_id');
CREATE POLICY "Users can access their org's purchase orders" ON purchase_orders FOR ALL USING (org_id = auth.jwt() ->> 'org_id');
CREATE POLICY "Users can access their org's purchase order lines" ON purchase_order_lines FOR ALL USING (EXISTS (SELECT 1 FROM purchase_orders WHERE id = po_id AND org_id = auth.jwt() ->> 'org_id'));
CREATE POLICY "Users can access their org's sales orders" ON sales_orders FOR ALL USING (org_id = auth.jwt() ->> 'org_id');
CREATE POLICY "Users can access their org's sales order lines" ON sales_order_lines FOR ALL USING (EXISTS (SELECT 1 FROM sales_orders WHERE id = so_id AND org_id = auth.jwt() ->> 'org_id'));
CREATE POLICY "Users can access their org's reservations" ON so_reservations FOR ALL USING (org_id = auth.jwt() ->> 'org_id');
CREATE POLICY "Users can access their org's shipments" ON shipments FOR ALL USING (org_id = auth.jwt() ->> 'org_id');
CREATE POLICY "Users can access their org's shipment lines" ON shipment_lines FOR ALL USING (EXISTS (SELECT 1 FROM shipments WHERE id = shipment_id AND org_id = auth.jwt() ->> 'org_id'));
CREATE POLICY "Users can access their org's adjustments" ON inventory_adjustments FOR ALL USING (org_id = auth.jwt() ->> 'org_id');
CREATE POLICY "Users can access their org's adjustment lines" ON inventory_adjustment_lines FOR ALL USING (EXISTS (SELECT 1 FROM inventory_adjustments WHERE id = adjustment_id AND org_id = auth.jwt() ->> 'org_id'));
CREATE POLICY "Users can access their org's listings" ON multichannel_listings FOR ALL USING (org_id = auth.jwt() ->> 'org_id');
CREATE POLICY "Users can access their org's forecasts" ON stock_forecasts FOR ALL USING (org_id = auth.jwt() ->> 'org_id');
CREATE POLICY "Users can access their org's alerts" ON stock_alerts FOR ALL USING (org_id = auth.jwt() ->> 'org_id');
CREATE POLICY "Users can access their org's cycle counts" ON cycle_counts FOR ALL USING (org_id = auth.jwt() ->> 'org_id');
CREATE POLICY "Users can access their org's cycle count lines" ON cycle_count_lines FOR ALL USING (EXISTS (SELECT 1 FROM cycle_counts WHERE id = cycle_count_id AND org_id = auth.jwt() ->> 'org_id'));

