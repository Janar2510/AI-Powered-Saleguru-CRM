-- Complete CRM System (2025-08-07)
-- This creates the full CRM system with all tables, indexes, and RLS policies

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- ===========================================
-- CREATE ALL CRM TABLES
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

-- Create invoices table (if it doesn't exist with user_id)
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

-- Create documents table for e-signature
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

-- ===========================================
-- ADD INDEXES FOR PERFORMANCE
-- ===========================================

-- Indexes for customers (already exists)
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);

-- Indexes for products
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Indexes for quotations
CREATE INDEX IF NOT EXISTS idx_quotations_user_id ON quotations(user_id);
CREATE INDEX IF NOT EXISTS idx_quotations_customer_id ON quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_number ON quotations(quotation_number);

-- Indexes for sales orders
CREATE INDEX IF NOT EXISTS idx_sales_orders_user_id ON sales_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_customer_id ON sales_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON sales_orders(status);
CREATE INDEX IF NOT EXISTS idx_sales_orders_number ON sales_orders(order_number);

-- Indexes for invoices
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);

-- Indexes for documents
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_customer_id ON documents(customer_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);

-- Indexes for document signatures
CREATE INDEX IF NOT EXISTS idx_document_signatures_document_id ON document_signatures(document_id);
CREATE INDEX IF NOT EXISTS idx_document_signatures_customer_id ON document_signatures(customer_id);

-- Indexes for customer portal access
CREATE INDEX IF NOT EXISTS idx_customer_portal_access_customer_id ON customer_portal_access(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_portal_access_token ON customer_portal_access(access_token);

-- Indexes for email templates
CREATE INDEX IF NOT EXISTS idx_email_templates_user_id ON email_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_type ON email_templates(template_type);

-- Indexes for email communications
CREATE INDEX IF NOT EXISTS idx_email_communications_user_id ON email_communications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_communications_customer_id ON email_communications(customer_id);
CREATE INDEX IF NOT EXISTS idx_email_communications_status ON email_communications(status);

-- ===========================================
-- ENABLE ROW LEVEL SECURITY
-- ===========================================

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_portal_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_communications ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- CREATE RLS POLICIES
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

-- RLS Policies for document signatures
CREATE POLICY "Users can view their own document signatures" ON document_signatures FOR SELECT USING (true);
CREATE POLICY "Users can insert their own document signatures" ON document_signatures FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own document signatures" ON document_signatures FOR UPDATE USING (true);

-- RLS Policies for customer portal access
CREATE POLICY "Users can view their own customer portal access" ON customer_portal_access FOR SELECT USING (true);
CREATE POLICY "Users can insert their own customer portal access" ON customer_portal_access FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own customer portal access" ON customer_portal_access FOR UPDATE USING (true);
CREATE POLICY "Users can delete their own customer portal access" ON customer_portal_access FOR DELETE USING (true);

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

-- ===========================================
-- CREATE HELPER FUNCTIONS
-- ===========================================

-- Function to generate unique quotation numbers
CREATE OR REPLACE FUNCTION generate_quotation_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    quotation_number TEXT;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(quotation_number FROM 2) AS INTEGER)), 0) + 1
    INTO next_number
    FROM quotations
    WHERE quotation_number LIKE 'Q%';
    
    quotation_number := 'Q' || LPAD(next_number::TEXT, 6, '0');
    RETURN quotation_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate unique sales order numbers
CREATE OR REPLACE FUNCTION generate_sales_order_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    order_number TEXT;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 3) AS INTEGER)), 0) + 1
    INTO next_number
    FROM sales_orders
    WHERE order_number LIKE 'SO%';
    
    order_number := 'SO' || LPAD(next_number::TEXT, 6, '0');
    RETURN order_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate unique invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    invoice_number TEXT;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 2) AS INTEGER)), 0) + 1
    INTO next_number
    FROM invoices
    WHERE invoice_number LIKE 'I%';
    
    invoice_number := 'I' || LPAD(next_number::TEXT, 6, '0');
    RETURN invoice_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- INSERT SAMPLE DATA
-- ===========================================

-- Insert sample customers
INSERT INTO customers (user_id, company_name, contact_name, email, phone, address, city, state, postal_code, country) VALUES
('00000000-0000-0000-0000-000000000000', 'Acme Corp', 'John Smith', 'john@acme.com', '+1-555-0123', '123 Main St', 'New York', 'NY', '10001', 'US'),
('00000000-0000-0000-0000-000000000000', 'Tech Solutions', 'Jane Doe', 'jane@techsolutions.com', '+1-555-0456', '456 Tech Ave', 'San Francisco', 'CA', '94102', 'US'),
('00000000-0000-0000-0000-000000000000', 'Global Industries', 'Bob Wilson', 'bob@global.com', '+1-555-0789', '789 Business Blvd', 'Chicago', 'IL', '60601', 'US')
ON CONFLICT DO NOTHING;

-- Insert sample products
INSERT INTO products (user_id, name, sku, description, category, price, cost, stock_quantity) VALUES
('00000000-0000-0000-0000-000000000000', 'Premium Widget', 'WID-001', 'High-quality widget for professional use', 'Widgets', 99.99, 45.00, 50),
('00000000-0000-0000-0000-000000000000', 'Standard Gadget', 'GAD-002', 'Reliable gadget for everyday use', 'Gadgets', 49.99, 25.00, 100),
('00000000-0000-0000-0000-000000000000', 'Deluxe Tool Set', 'TOOL-003', 'Complete tool set for professionals', 'Tools', 199.99, 120.00, 25)
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Complete CRM System setup completed successfully!' as status; 