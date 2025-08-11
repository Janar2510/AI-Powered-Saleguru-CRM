-- Create Tables Only Migration (2025-08-07)
-- This migration creates only the tables without any INSERT statements

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- ===========================================
-- CORE CRM TABLES (NO FOREIGN KEYS TO AUTH.USERS)
-- ===========================================

-- Customers table
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
    website TEXT,
    industry TEXT,
    customer_type TEXT DEFAULT 'prospect' CHECK (customer_type IN ('prospect', 'customer', 'lead', 'partner')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    credit_limit DECIMAL(15,2) DEFAULT 0,
    payment_terms TEXT DEFAULT 'net30',
    tax_exempt BOOLEAN DEFAULT FALSE,
    notes TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    sku TEXT UNIQUE,
    description TEXT,
    category TEXT,
    price DECIMAL(15,2) NOT NULL,
    cost DECIMAL(15,2),
    tax_rate DECIMAL(5,2) DEFAULT 0,
    unit TEXT DEFAULT 'piece',
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    weight DECIMAL(10,3),
    dimensions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_virtual BOOLEAN DEFAULT FALSE,
    variants JSONB,
    attributes JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product variants table
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_name TEXT NOT NULL,
    sku TEXT,
    price_adjustment DECIMAL(15,2) DEFAULT 0,
    stock_quantity INTEGER DEFAULT 0,
    attributes JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quotations table
CREATE TABLE IF NOT EXISTS quotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    quotation_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
    valid_until DATE,
    subject TEXT,
    terms_conditions TEXT,
    notes TEXT,
    subtotal DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) DEFAULT 0,
    currency TEXT DEFAULT 'EUR',
    incoterms TEXT,
    delivery_address TEXT,
    billing_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quotation items table
CREATE TABLE IF NOT EXISTS quotation_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    product_name TEXT NOT NULL,
    description TEXT,
    quantity DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    line_total DECIMAL(15,2) NOT NULL,
    variant_id UUID REFERENCES product_variants(id),
    variant_attributes JSONB,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales orders table
CREATE TABLE IF NOT EXISTS sales_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    quotation_id UUID REFERENCES quotations(id),
    order_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    order_date DATE DEFAULT CURRENT_DATE,
    delivery_date DATE,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'overdue')),
    payment_method TEXT,
    subtotal DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    shipping_amount DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) DEFAULT 0,
    currency TEXT DEFAULT 'EUR',
    shipping_address TEXT,
    billing_address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales order items table
CREATE TABLE IF NOT EXISTS sales_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sales_order_id UUID NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    product_name TEXT NOT NULL,
    description TEXT,
    quantity DECIMAL(10,3) NOT NULL,
    delivered_quantity DECIMAL(10,3) DEFAULT 0,
    unit_price DECIMAL(15,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    line_total DECIMAL(15,2) NOT NULL,
    variant_id UUID REFERENCES product_variants(id),
    variant_attributes JSONB,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    sales_order_id UUID REFERENCES sales_orders(id),
    invoice_number TEXT UNIQUE NOT NULL,
    invoice_type TEXT DEFAULT 'standard' CHECK (invoice_type IN ('standard', 'proforma', 'credit_note')),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    invoice_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    payment_terms TEXT,
    subtotal DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    shipping_amount DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) DEFAULT 0,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    currency TEXT DEFAULT 'EUR',
    exchange_rate DECIMAL(10,6) DEFAULT 1,
    billing_address TEXT,
    shipping_address TEXT,
    notes TEXT,
    terms_conditions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice items table
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    product_name TEXT NOT NULL,
    description TEXT,
    quantity DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    line_total DECIMAL(15,2) NOT NULL,
    variant_id UUID REFERENCES product_variants(id),
    variant_attributes JSONB,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table for e-signature
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    customer_id UUID REFERENCES customers(id),
    document_type TEXT NOT NULL CHECK (document_type IN ('quotation', 'invoice', 'contract', 'agreement')),
    reference_id UUID,
    title TEXT NOT NULL,
    content TEXT,
    file_url TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'signed', 'expired', 'cancelled')),
    expires_at TIMESTAMPTZ,
    signature_required BOOLEAN DEFAULT FALSE,
    signature_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document signatures table
CREATE TABLE IF NOT EXISTS document_signatures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    signer_name TEXT NOT NULL,
    signer_email TEXT NOT NULL,
    signature_data JSONB,
    ip_address INET,
    user_agent TEXT,
    signed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer portal access
CREATE TABLE IF NOT EXISTS customer_portal_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    password_hash TEXT,
    access_token TEXT,
    token_expires_at TIMESTAMPTZ,
    last_login TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer portal sessions
CREATE TABLE IF NOT EXISTS customer_portal_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email templates
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    template_type TEXT CHECK (template_type IN ('quotation', 'invoice', 'order_confirmation', 'onboarding')),
    is_active BOOLEAN DEFAULT TRUE,
    variables JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email communications
CREATE TABLE IF NOT EXISTS email_communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    customer_id UUID REFERENCES customers(id),
    reference_type TEXT,
    reference_id UUID,
    from_email TEXT NOT NULL,
    to_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'failed')),
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    opened_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inter-company rules
CREATE TABLE IF NOT EXISTS inter_company_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    source_company_id UUID NOT NULL,
    target_company_id UUID NOT NULL,
    rule_type TEXT NOT NULL CHECK (rule_type IN ('sales_to_purchase', 'purchase_to_sales')),
    is_active BOOLEAN DEFAULT TRUE,
    auto_create BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

-- Customers indexes
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Quotations indexes
CREATE INDEX IF NOT EXISTS idx_quotations_user_id ON quotations(user_id);
CREATE INDEX IF NOT EXISTS idx_quotations_customer_id ON quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_number ON quotations(quotation_number);

-- Sales orders indexes
CREATE INDEX IF NOT EXISTS idx_sales_orders_user_id ON sales_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_customer_id ON sales_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON sales_orders(status);
CREATE INDEX IF NOT EXISTS idx_sales_orders_number ON sales_orders(order_number);

-- Invoices indexes
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);

-- Documents indexes
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);

-- ===========================================
-- ROW LEVEL SECURITY (RLS)
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_portal_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_portal_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE inter_company_rules ENABLE ROW LEVEL SECURITY;

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

-- RLS Policies for invoices
CREATE POLICY "Users can view their own invoices" ON invoices FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own invoices" ON invoices FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own invoices" ON invoices FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own invoices" ON invoices FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for documents
CREATE POLICY "Users can view their own documents" ON documents FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own documents" ON documents FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own documents" ON documents FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own documents" ON documents FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for email templates
CREATE POLICY "Users can view their own email templates" ON email_templates FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own email templates" ON email_templates FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own email templates" ON email_templates FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own email templates" ON email_templates FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for email communications
CREATE POLICY "Users can view their own email communications" ON email_communications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own email communications" ON email_communications FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own email communications" ON email_communications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own email communications" ON email_communications FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for inter company rules
CREATE POLICY "Users can view their own inter company rules" ON inter_company_rules FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own inter company rules" ON inter_company_rules FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own inter company rules" ON inter_company_rules FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own inter company rules" ON inter_company_rules FOR DELETE USING (user_id = auth.uid());

-- ===========================================
-- TRIGGERS FOR UPDATED_AT
-- ===========================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON quotations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_orders_updated_at BEFORE UPDATE ON sales_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_portal_access_updated_at BEFORE UPDATE ON customer_portal_access FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inter_company_rules_updated_at BEFORE UPDATE ON inter_company_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- HELPER FUNCTIONS
-- ===========================================

-- Function to generate quotation number
CREATE OR REPLACE FUNCTION generate_quotation_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    quotation_number TEXT;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(quotation_number FROM 4) AS INTEGER)), 0) + 1
    INTO next_number
    FROM quotations;
    
    quotation_number := 'QT-' || LPAD(next_number::TEXT, 6, '0');
    RETURN quotation_number;
END;
$$ LANGUAGE plpgsql;

-- Function to generate sales order number
CREATE OR REPLACE FUNCTION generate_sales_order_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    order_number TEXT;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 4) AS INTEGER)), 0) + 1
    INTO next_number
    FROM sales_orders;
    
    order_number := 'SO-' || LPAD(next_number::TEXT, 6, '0');
    RETURN order_number;
END;
$$ LANGUAGE plpgsql;

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    invoice_number TEXT;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 4) AS INTEGER)), 0) + 1
    INTO next_number
    FROM invoices;
    
    invoice_number := 'INV-' || LPAD(next_number::TEXT, 6, '0');
    RETURN invoice_number;
END;
$$ LANGUAGE plpgsql;

-- Success message
SELECT 'CRM Tables created successfully!' as status; 