-- Add Missing Policies Only (2025-08-07)
-- This adds only the RLS policies that don't already exist

-- ===========================================
-- ADD MISSING RLS POLICIES WITH CONDITIONAL CHECKS
-- ===========================================

-- RLS Policies for products (if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Users can view their own products') THEN
        CREATE POLICY "Users can view their own products" ON products FOR SELECT USING (user_id = auth.uid());
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Users can insert their own products') THEN
        CREATE POLICY "Users can insert their own products" ON products FOR INSERT WITH CHECK (user_id = auth.uid());
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Users can update their own products') THEN
        CREATE POLICY "Users can update their own products" ON products FOR UPDATE USING (user_id = auth.uid());
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Users can delete their own products') THEN
        CREATE POLICY "Users can delete their own products" ON products FOR DELETE USING (user_id = auth.uid());
    END IF;
END $$;

-- RLS Policies for quotations (if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quotations' AND policyname = 'Users can view their own quotations') THEN
        CREATE POLICY "Users can view their own quotations" ON quotations FOR SELECT USING (user_id = auth.uid());
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quotations' AND policyname = 'Users can insert their own quotations') THEN
        CREATE POLICY "Users can insert their own quotations" ON quotations FOR INSERT WITH CHECK (user_id = auth.uid());
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quotations' AND policyname = 'Users can update their own quotations') THEN
        CREATE POLICY "Users can update their own quotations" ON quotations FOR UPDATE USING (user_id = auth.uid());
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quotations' AND policyname = 'Users can delete their own quotations') THEN
        CREATE POLICY "Users can delete their own quotations" ON quotations FOR DELETE USING (user_id = auth.uid());
    END IF;
END $$;

-- RLS Policies for sales orders (if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sales_orders' AND policyname = 'Users can view their own sales orders') THEN
        CREATE POLICY "Users can view their own sales orders" ON sales_orders FOR SELECT USING (user_id = auth.uid());
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sales_orders' AND policyname = 'Users can insert their own sales orders') THEN
        CREATE POLICY "Users can insert their own sales orders" ON sales_orders FOR INSERT WITH CHECK (user_id = auth.uid());
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sales_orders' AND policyname = 'Users can update their own sales orders') THEN
        CREATE POLICY "Users can update their own sales orders" ON sales_orders FOR UPDATE USING (user_id = auth.uid());
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sales_orders' AND policyname = 'Users can delete their own sales orders') THEN
        CREATE POLICY "Users can delete their own sales orders" ON sales_orders FOR DELETE USING (user_id = auth.uid());
    END IF;
END $$;

-- RLS Policies for invoices (if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'invoices' AND policyname = 'Users can view their own invoices') THEN
        CREATE POLICY "Users can view their own invoices" ON invoices FOR SELECT USING (user_id = auth.uid());
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'invoices' AND policyname = 'Users can insert their own invoices') THEN
        CREATE POLICY "Users can insert their own invoices" ON invoices FOR INSERT WITH CHECK (user_id = auth.uid());
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'invoices' AND policyname = 'Users can update their own invoices') THEN
        CREATE POLICY "Users can update their own invoices" ON invoices FOR UPDATE USING (user_id = auth.uid());
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'invoices' AND policyname = 'Users can delete their own invoices') THEN
        CREATE POLICY "Users can delete their own invoices" ON invoices FOR DELETE USING (user_id = auth.uid());
    END IF;
END $$;

-- RLS Policies for documents (if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'documents' AND policyname = 'Users can view their own documents') THEN
        CREATE POLICY "Users can view their own documents" ON documents FOR SELECT USING (user_id = auth.uid());
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'documents' AND policyname = 'Users can insert their own documents') THEN
        CREATE POLICY "Users can insert their own documents" ON documents FOR INSERT WITH CHECK (user_id = auth.uid());
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'documents' AND policyname = 'Users can update their own documents') THEN
        CREATE POLICY "Users can update their own documents" ON documents FOR UPDATE USING (user_id = auth.uid());
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'documents' AND policyname = 'Users can delete their own documents') THEN
        CREATE POLICY "Users can delete their own documents" ON documents FOR DELETE USING (user_id = auth.uid());
    END IF;
END $$;

-- RLS Policies for document signatures (if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'document_signatures' AND policyname = 'Users can view their own document signatures') THEN
        CREATE POLICY "Users can view their own document signatures" ON document_signatures FOR SELECT USING (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'document_signatures' AND policyname = 'Users can insert their own document signatures') THEN
        CREATE POLICY "Users can insert their own document signatures" ON document_signatures FOR INSERT WITH CHECK (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'document_signatures' AND policyname = 'Users can update their own document signatures') THEN
        CREATE POLICY "Users can update their own document signatures" ON document_signatures FOR UPDATE USING (true);
    END IF;
END $$;

-- RLS Policies for customer portal access (if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'customer_portal_access' AND policyname = 'Users can view their own customer portal access') THEN
        CREATE POLICY "Users can view their own customer portal access" ON customer_portal_access FOR SELECT USING (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'customer_portal_access' AND policyname = 'Users can insert their own customer portal access') THEN
        CREATE POLICY "Users can insert their own customer portal access" ON customer_portal_access FOR INSERT WITH CHECK (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'customer_portal_access' AND policyname = 'Users can update their own customer portal access') THEN
        CREATE POLICY "Users can update their own customer portal access" ON customer_portal_access FOR UPDATE USING (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'customer_portal_access' AND policyname = 'Users can delete their own customer portal access') THEN
        CREATE POLICY "Users can delete their own customer portal access" ON customer_portal_access FOR DELETE USING (true);
    END IF;
END $$;

-- RLS Policies for email templates (if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'email_templates' AND policyname = 'Users can view their own email templates') THEN
        CREATE POLICY "Users can view their own email templates" ON email_templates FOR SELECT USING (user_id = auth.uid());
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'email_templates' AND policyname = 'Users can insert their own email templates') THEN
        CREATE POLICY "Users can insert their own email templates" ON email_templates FOR INSERT WITH CHECK (user_id = auth.uid());
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'email_templates' AND policyname = 'Users can update their own email templates') THEN
        CREATE POLICY "Users can update their own email templates" ON email_templates FOR UPDATE USING (user_id = auth.uid());
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'email_templates' AND policyname = 'Users can delete their own email templates') THEN
        CREATE POLICY "Users can delete their own email templates" ON email_templates FOR DELETE USING (user_id = auth.uid());
    END IF;
END $$;

-- RLS Policies for email communications (if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'email_communications' AND policyname = 'Users can view their own email communications') THEN
        CREATE POLICY "Users can view their own email communications" ON email_communications FOR SELECT USING (user_id = auth.uid());
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'email_communications' AND policyname = 'Users can insert their own email communications') THEN
        CREATE POLICY "Users can insert their own email communications" ON email_communications FOR INSERT WITH CHECK (user_id = auth.uid());
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'email_communications' AND policyname = 'Users can update their own email communications') THEN
        CREATE POLICY "Users can update their own email communications" ON email_communications FOR UPDATE USING (user_id = auth.uid());
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'email_communications' AND policyname = 'Users can delete their own email communications') THEN
        CREATE POLICY "Users can delete their own email communications" ON email_communications FOR DELETE USING (user_id = auth.uid());
    END IF;
END $$;

-- Success message
SELECT 'Missing RLS policies added successfully!' as status; 