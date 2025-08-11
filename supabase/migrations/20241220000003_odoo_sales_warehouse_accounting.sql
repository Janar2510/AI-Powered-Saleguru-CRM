-- Odoo-Inspired CRM Schema Migration - Part 2
-- Sales, Warehouse, and Accounting tables

-- QUOTES / SALES / FULFILLMENT
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid,
  sku text UNIQUE,
  name text NOT NULL,
  price numeric(12,2) NOT NULL,
  tax_rate numeric(5,2) DEFAULT 0,
  uom text DEFAULT 'pcs',
  metadata jsonb DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid,
  deal_id uuid,
  contact_id uuid,
  company_id uuid,
  quote_number text UNIQUE,
  status text DEFAULT 'draft',
  notes text,
  currency text DEFAULT 'EUR',
  valid_until date,
  totals jsonb DEFAULT '{}', -- subtotal, tax, total
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quote_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id uuid,
  product_id uuid,
  name text,
  qty numeric(12,2) NOT NULL DEFAULT 1,
  price numeric(12,2) NOT NULL,
  tax_rate numeric(5,2) DEFAULT 0,
  total numeric(12,2) GENERATED ALWAYS AS ((qty * price) * (1 + tax_rate/100)) STORED
);

CREATE TABLE IF NOT EXISTS sales_orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid,
  quote_id uuid,
  so_number text UNIQUE,
  status text DEFAULT 'draft',
  contact_id uuid,
  company_id uuid,
  totals jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sales_order_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  so_id uuid,
  product_id uuid,
  name text,
  qty numeric(12,2) NOT NULL,
  price numeric(12,2) NOT NULL,
  tax_rate numeric(5,2) DEFAULT 0
);

-- WAREHOUSE
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid,
  name text NOT NULL,
  type text DEFAULT 'stock'
);

CREATE TABLE IF NOT EXISTS stock_quants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid,
  product_id uuid,
  location_id uuid,
  qty numeric(14,3) NOT NULL DEFAULT 0,
  CONSTRAINT uq_quant UNIQUE (product_id, location_id)
);

CREATE TABLE IF NOT EXISTS stock_moves (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid,
  so_id uuid,
  product_id uuid,
  from_location uuid,
  to_location uuid,
  qty numeric(14,3) NOT NULL,
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now()
);

-- ACCOUNTING
CREATE TABLE IF NOT EXISTS journals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid,
  code text UNIQUE,
  name text NOT NULL,
  type text DEFAULT 'sales'
);

CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid,
  code text NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  UNIQUE (org_id, code)
);

CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid,
  so_id uuid,
  contact_id uuid,
  company_id uuid,
  invoice_number text UNIQUE,
  status text DEFAULT 'draft',
  currency text DEFAULT 'EUR',
  totals jsonb DEFAULT '{}',
  due_date date,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id uuid,
  product_id uuid,
  name text,
  qty numeric(12,2) NOT NULL,
  price numeric(12,2) NOT NULL,
  tax_rate numeric(5,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid,
  invoice_id uuid,
  amount numeric(12,2) NOT NULL,
  currency text DEFAULT 'EUR',
  method text, -- stripe, paypal, bank_transfer
  provider_ref text, -- gateway txn id
  status text DEFAULT 'pending',
  received_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ledger_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid,
  journal_id uuid,
  account_id uuid,
  ref_type text,   -- invoice|payment|so|manual
  ref_id uuid,     -- id of that ref
  debit numeric(14,2) DEFAULT 0,
  credit numeric(14,2) DEFAULT 0,
  memo text,
  posted_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_quants ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
