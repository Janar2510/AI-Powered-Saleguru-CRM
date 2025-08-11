-- Create Accounting Document Flow Tables
-- This migration sets up the complete sales flow: Quotation → Order → Proforma → Invoice

-- Quotations Table
CREATE TABLE IF NOT EXISTS quotations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  valid_until DATE NOT NULL,
  notes TEXT,
  terms_conditions TEXT,
  items JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  number VARCHAR(50) UNIQUE NOT NULL,
  quotation_id UUID REFERENCES quotations(id) ON DELETE SET NULL,
  quotation_number VARCHAR(50),
  customer_name VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'in_production', 'ready_for_delivery', 'delivered', 'cancelled')),
  delivery_date DATE NOT NULL,
  notes TEXT,
  delivery_address TEXT,
  items JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Proforma Invoices Table
CREATE TABLE IF NOT EXISTS proforma_invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  number VARCHAR(50) UNIQUE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  order_number VARCHAR(50),
  quotation_id UUID REFERENCES quotations(id) ON DELETE SET NULL,
  quotation_number VARCHAR(50),
  customer_name VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'converted_to_invoice', 'cancelled')),
  valid_until DATE NOT NULL,
  notes TEXT,
  payment_terms TEXT,
  items JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update Invoices Table to include references
ALTER TABLE IF EXISTS invoices ADD COLUMN IF NOT EXISTS proforma_id UUID REFERENCES proforma_invoices(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS invoices ADD COLUMN IF NOT EXISTS proforma_number VARCHAR(50);
ALTER TABLE IF EXISTS invoices ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS invoices ADD COLUMN IF NOT EXISTS order_number VARCHAR(50);
ALTER TABLE IF EXISTS invoices ADD COLUMN IF NOT EXISTS quotation_id UUID REFERENCES quotations(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS invoices ADD COLUMN IF NOT EXISTS quotation_number VARCHAR(50);

-- Enable Row Level Security
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE proforma_invoices ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quotations' AND policyname = 'Users can view all quotations') THEN
    CREATE POLICY "Users can view all quotations" ON quotations FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Users can view all orders') THEN
    CREATE POLICY "Users can view all orders" ON orders FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'proforma_invoices' AND policyname = 'Users can view all proforma invoices') THEN
    CREATE POLICY "Users can view all proforma invoices" ON proforma_invoices FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- Insert Sample Data
INSERT INTO quotations (number, customer_name, amount, status, valid_until, notes, terms_conditions, items) VALUES
('QT-2024-001', 'Tech Solutions Inc.', 2500.00, 'sent', '2024-02-15', 'Software development services', 'Payment terms: 30 days', '[{"description": "Custom Software Development", "quantity": 1, "unit_price": 2500.00, "total": 2500.00}]'),
('QT-2024-002', 'Global Manufacturing', 15000.00, 'accepted', '2024-02-20', 'Equipment supply and installation', 'Payment terms: 50% upfront, 50% on delivery', '[{"description": "Industrial Equipment", "quantity": 2, "unit_price": 7500.00, "total": 15000.00}]'),
('QT-2024-003', 'Digital Marketing Agency', 5000.00, 'draft', '2024-02-25', 'Marketing campaign services', 'Payment terms: Net 30', '[{"description": "Digital Marketing Campaign", "quantity": 1, "unit_price": 5000.00, "total": 5000.00}]')
ON CONFLICT (number) DO NOTHING;

INSERT INTO orders (number, quotation_id, quotation_number, customer_name, amount, status, delivery_date, notes, delivery_address, items) VALUES
('ORD-2024-001', (SELECT id FROM quotations WHERE number = 'QT-2024-002'), 'QT-2024-002', 'Global Manufacturing', 15000.00, 'confirmed', '2024-03-15', 'Equipment order confirmed', '123 Industrial Blvd, Manufacturing City, MC 12345', '[{"description": "Industrial Equipment", "quantity": 2, "unit_price": 7500.00, "total": 15000.00}]'),
('ORD-2024-002', (SELECT id FROM quotations WHERE number = 'QT-2024-001'), 'QT-2024-001', 'Tech Solutions Inc.', 2500.00, 'in_production', '2024-02-28', 'Software development in progress', '456 Tech Street, Innovation City, IC 67890', '[{"description": "Custom Software Development", "quantity": 1, "unit_price": 2500.00, "total": 2500.00}]')
ON CONFLICT (number) DO NOTHING;

INSERT INTO proforma_invoices (number, order_id, order_number, quotation_id, quotation_number, customer_name, amount, status, valid_until, notes, payment_terms, items) VALUES
('PRO-2024-001', (SELECT id FROM orders WHERE number = 'ORD-2024-001'), 'ORD-2024-001', (SELECT id FROM quotations WHERE number = 'QT-2024-002'), 'QT-2024-002', 'Global Manufacturing', 15000.00, 'sent', '2024-03-10', 'Proforma for equipment order', 'Payment: 50% upfront, 50% on delivery', '[{"description": "Industrial Equipment", "quantity": 2, "unit_price": 7500.00, "total": 15000.00}]'),
('PRO-2024-002', (SELECT id FROM orders WHERE number = 'ORD-2024-002'), 'ORD-2024-002', (SELECT id FROM quotations WHERE number = 'QT-2024-001'), 'QT-2024-001', 'Tech Solutions Inc.', 2500.00, 'accepted', '2024-02-25', 'Proforma for software development', 'Payment: Net 30', '[{"description": "Custom Software Development", "quantity": 1, "unit_price": 2500.00, "total": 2500.00}]')
ON CONFLICT (number) DO NOTHING;

-- Update existing invoices to include references
UPDATE invoices SET 
  proforma_number = 'PRO-2024-001',
  order_number = 'ORD-2024-001',
  quotation_number = 'QT-2024-002'
WHERE number = 'INV-2024-001';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quotations_number ON quotations(number);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_customer ON quotations(customer_name);

CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_name);
CREATE INDEX IF NOT EXISTS idx_orders_quotation_id ON orders(quotation_id);

CREATE INDEX IF NOT EXISTS idx_proforma_number ON proforma_invoices(number);
CREATE INDEX IF NOT EXISTS idx_proforma_status ON proforma_invoices(status);
CREATE INDEX IF NOT EXISTS idx_proforma_customer ON proforma_invoices(customer_name);
CREATE INDEX IF NOT EXISTS idx_proforma_order_id ON proforma_invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_proforma_quotation_id ON proforma_invoices(quotation_id);

CREATE INDEX IF NOT EXISTS idx_invoices_proforma_id ON invoices(proforma_id);
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_quotation_id ON invoices(quotation_id); 