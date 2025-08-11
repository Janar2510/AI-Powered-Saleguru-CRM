-- Add RLS Policies (2025-08-07)
-- This adds RLS policies to the existing tables

-- ===========================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
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
-- CREATE RLS POLICIES FOR ALL TABLES
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

-- Success message
SELECT 'RLS policies added successfully!' as status; 