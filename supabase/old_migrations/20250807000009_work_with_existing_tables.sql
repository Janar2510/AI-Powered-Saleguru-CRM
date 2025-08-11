-- Work with Existing Tables (2025-08-07)
-- This works with the existing table structure

-- ===========================================
-- CHECK EXISTING TABLES
-- ===========================================

-- Check what tables exist
SELECT 
    table_name,
    'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('customers', 'products', 'quotations', 'sales_orders', 'invoices')
ORDER BY table_name;

-- ===========================================
-- ADD USER_ID COLUMN TO EXISTING TABLES
-- ===========================================

-- Add user_id column to invoices table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'invoices' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE invoices ADD COLUMN user_id UUID;
    END IF;
END $$;

-- ===========================================
-- CREATE MISSING TABLES
-- ===========================================

-- Create customers table if it doesn't exist
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    company_name TEXT,
    contact_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'US',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create products table if it doesn't exist
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    sku TEXT UNIQUE,
    description TEXT,
    category TEXT,
    price DECIMAL(15,2) NOT NULL,
    cost DECIMAL(15,2),
    stock_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create quotations table if it doesn't exist
CREATE TABLE IF NOT EXISTS quotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    customer_id UUID NOT NULL,
    quotation_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'draft',
    subject TEXT,
    subtotal DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) DEFAULT 0,
    currency TEXT DEFAULT 'EUR',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sales_orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS sales_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    customer_id UUID NOT NULL,
    order_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'draft',
    order_date DATE DEFAULT CURRENT_DATE,
    payment_status TEXT DEFAULT 'pending',
    subtotal DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) DEFAULT 0,
    currency TEXT DEFAULT 'EUR',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- ADD BASIC INDEXES
-- ===========================================

-- Add indexes only for columns that exist
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);

CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

CREATE INDEX IF NOT EXISTS idx_quotations_user_id ON quotations(user_id);
CREATE INDEX IF NOT EXISTS idx_quotations_customer_id ON quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_number ON quotations(quotation_number);

CREATE INDEX IF NOT EXISTS idx_sales_orders_user_id ON sales_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_customer_id ON sales_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON sales_orders(status);
CREATE INDEX IF NOT EXISTS idx_sales_orders_number ON sales_orders(order_number);

-- Add index for invoices user_id if the column exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'invoices' 
        AND column_name = 'user_id'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
    END IF;
END $$;

-- ===========================================
-- ENABLE RLS
-- ===========================================

-- Enable RLS on tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- ADD RLS POLICIES
-- ===========================================

-- RLS Policies for customers
CREATE POLICY "Users can view their own customers" ON customers FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own customers" ON customers FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own customers" ON customers FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own customers" ON customers FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for products
CREATE POLICY "Users can view their own products" ON products FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own products" ON products FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own products" ON products FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own products" ON products FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for quotations
CREATE POLICY "Users can view their own quotations" ON quotations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own quotations" ON quotations FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own quotations" ON quotations FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own quotations" ON quotations FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for sales orders
CREATE POLICY "Users can view their own sales orders" ON sales_orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own sales orders" ON sales_orders FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own sales orders" ON sales_orders FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own sales orders" ON sales_orders FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for invoices (only if user_id column exists)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'invoices' 
        AND column_name = 'user_id'
    ) THEN
        CREATE POLICY "Users can view their own invoices" ON invoices FOR SELECT USING (user_id = auth.uid());
        CREATE POLICY "Users can insert their own invoices" ON invoices FOR INSERT WITH CHECK (user_id = auth.uid());
        CREATE POLICY "Users can update their own invoices" ON invoices FOR UPDATE USING (user_id = auth.uid());
        CREATE POLICY "Users can delete their own invoices" ON invoices FOR DELETE USING (user_id = auth.uid());
    END IF;
END $$;

-- Success message
SELECT 'CRM Setup completed with existing tables!' as status; 