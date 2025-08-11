-- Minimal Tables Only (2025-08-07)
-- This creates only tables without any RLS, indexes, or policies

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- ===========================================
-- CREATE ONLY TABLES - NO RLS, NO INDEXES, NO POLICIES
-- ===========================================

-- Create products table
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

-- Create quotations table
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

-- Create sales_orders table
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

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    customer_id UUID NOT NULL,
    invoice_number TEXT UNIQUE NOT NULL,
    invoice_type TEXT DEFAULT 'standard',
    status TEXT DEFAULT 'draft',
    invoice_date DATE DEFAULT CURRENT_DATE,
    subtotal DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) DEFAULT 0,
    currency TEXT DEFAULT 'EUR',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    customer_id UUID NOT NULL,
    document_type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    status TEXT DEFAULT 'draft',
    signed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create document_signatures table
CREATE TABLE IF NOT EXISTS document_signatures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL,
    customer_id UUID NOT NULL,
    signature_data TEXT,
    signed_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT
);

-- Create customer_portal_access table
CREATE TABLE IF NOT EXISTS customer_portal_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL,
    access_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    template_type TEXT DEFAULT 'general',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create email_communications table
CREATE TABLE IF NOT EXISTS email_communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    customer_id UUID NOT NULL,
    template_id UUID,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'sent',
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ
);

-- Success message
SELECT 'Minimal tables created successfully!' as status; 