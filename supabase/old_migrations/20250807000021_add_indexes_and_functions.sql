-- Add Indexes and Helper Functions (2025-08-07)
-- This adds performance indexes and helper functions

-- ===========================================
-- ADD PERFORMANCE INDEXES
-- ===========================================

-- Indexes for customers
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
SELECT 'Indexes, functions, and sample data added successfully!' as status; 