-- Invoices System Migration
-- Creates invoices and invoice_items tables with proper relationships

-- Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_number TEXT UNIQUE NOT NULL,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
    quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
    
    -- Invoice details
    invoice_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled', 'partially_paid')),
    
    -- Financial details
    subtotal_cents INTEGER DEFAULT 0,
    tax_cents INTEGER DEFAULT 0,
    discount_cents INTEGER DEFAULT 0,
    total_cents INTEGER DEFAULT 0,
    paid_cents INTEGER DEFAULT 0,
    currency TEXT DEFAULT 'EUR',
    
    -- Additional info
    notes TEXT,
    terms_conditions TEXT,
    payment_terms TEXT,
    
    -- Addresses
    billing_address TEXT,
    shipping_address TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    
    -- Organization scoping
    org_id TEXT DEFAULT 'temp-org'
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    
    -- Item details
    product_name TEXT NOT NULL,
    product_sku TEXT,
    description TEXT,
    quantity DECIMAL(10,2) DEFAULT 1,
    unit_price_cents INTEGER NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    tax_percent DECIMAL(5,2) DEFAULT 0,
    line_total_cents INTEGER GENERATED ALWAYS AS (
        ROUND(quantity * unit_price_cents * (1 - discount_percent / 100))::INTEGER
    ) STORED,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table for tracking payments
CREATE TABLE IF NOT EXISTS public.invoice_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    
    -- Payment details
    payment_date DATE DEFAULT CURRENT_DATE,
    amount_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'EUR',
    payment_method TEXT DEFAULT 'bank_transfer' CHECK (payment_method IN ('bank_transfer', 'credit_card', 'cash', 'check', 'other')),
    reference_number TEXT,
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    
    -- Organization scoping
    org_id TEXT DEFAULT 'temp-org'
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoices_contact_id ON public.invoices(contact_id);
CREATE INDEX IF NOT EXISTS idx_invoices_organization_id ON public.invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoices_deal_id ON public.invoices(deal_id);
CREATE INDEX IF NOT EXISTS idx_invoices_quote_id ON public.invoices(quote_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON public.invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_org_id ON public.invoices(org_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON public.invoices(invoice_number);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_product_id ON public.invoice_items(product_id);

CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice_id ON public.invoice_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_payment_date ON public.invoice_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_org_id ON public.invoice_payments(org_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_payments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_payments TO anon;

-- Create function for automatic timestamp updating
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for automatic timestamp updating
CREATE TRIGGER set_updated_at_invoices 
    BEFORE UPDATE ON public.invoices 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_invoice_items 
    BEFORE UPDATE ON public.invoice_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number() RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    invoice_number TEXT;
BEGIN
    -- Get the next invoice number (starting from 1000)
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '[0-9]+$') AS INTEGER)), 999) + 1 
    INTO next_number
    FROM public.invoices 
    WHERE invoice_number ~ '^INV-[0-9]+$';
    
    -- Format as INV-XXXX
    invoice_number := 'INV-' || next_number;
    
    RETURN invoice_number;
END;
$$ LANGUAGE plpgsql;

-- Function to convert quote to invoice
CREATE OR REPLACE FUNCTION convert_quote_to_invoice(quote_id_param UUID) RETURNS UUID AS $$
DECLARE
    invoice_id UUID;
    quote_record RECORD;
    line_item RECORD;
BEGIN
    -- Get quote details
    SELECT * INTO quote_record 
    FROM public.quotes 
    WHERE id = quote_id_param;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Quote not found';
    END IF;
    
    -- Create invoice
    INSERT INTO public.invoices (
        invoice_number,
        contact_id,
        organization_id,
        deal_id,
        quote_id,
        subtotal_cents,
        tax_cents,
        total_cents,
        currency,
        notes,
        billing_address,
        shipping_address,
        org_id
    ) VALUES (
        generate_invoice_number(),
        quote_record.contact_id,
        quote_record.organization_id,
        quote_record.deal_id,
        quote_record.id,
        quote_record.subtotal_cents,
        quote_record.tax_cents,
        quote_record.total_cents,
        quote_record.currency,
        'Converted from quote: ' || quote_record.quote_number,
        quote_record.billing_address,
        quote_record.shipping_address,
        quote_record.org_id
    ) RETURNING id INTO invoice_id;
    
    -- Copy quote line items to invoice items
    FOR line_item IN 
        SELECT * FROM public.quote_line_items WHERE quote_id = quote_id_param
    LOOP
        INSERT INTO public.invoice_items (
            invoice_id,
            product_id,
            product_name,
            product_sku,
            description,
            quantity,
            unit_price_cents,
            discount_percent,
            tax_percent
        ) VALUES (
            invoice_id,
            line_item.product_id,
            line_item.product_name,
            line_item.product_sku,
            line_item.description,
            line_item.quantity,
            line_item.unit_price_cents,
            line_item.discount_percent,
            line_item.tax_percent
        );
    END LOOP;
    
    -- Update quote status to confirmed
    UPDATE public.quotes 
    SET status = 'confirmed' 
    WHERE id = quote_id_param;
    
    RETURN invoice_id;
END;
$$ LANGUAGE plpgsql;

-- Insert sample data for testing
INSERT INTO public.invoices (
    id, invoice_number, contact_id, invoice_date, due_date, 
    subtotal_cents, tax_cents, total_cents, currency, status, notes
) VALUES 
(
    'inv_001', 'INV-1001', 
    (SELECT id FROM public.contacts LIMIT 1),
    CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days',
    100000, 10000, 110000, 'EUR', 'sent',
    'First invoice for testing'
),
(
    'inv_002', 'INV-1002', 
    (SELECT id FROM public.contacts LIMIT 1 OFFSET 1),
    CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '20 days',
    250000, 25000, 275000, 'EUR', 'overdue',
    'Overdue invoice for testing'
),
(
    'inv_003', 'INV-1003', 
    (SELECT id FROM public.contacts LIMIT 1),
    CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '25 days',
    75000, 7500, 82500, 'EUR', 'paid',
    'Paid invoice for testing'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.invoice_items (
    invoice_id, product_name, product_sku, quantity, unit_price_cents, tax_percent
) VALUES 
('inv_001', 'CRM Premium License', 'CRM-PREM-001', 1, 100000, 10.0),
('inv_002', 'CRM Enterprise License', 'CRM-ENT-001', 1, 250000, 10.0),
('inv_003', 'CRM Standard License', 'CRM-STD-001', 1, 75000, 10.0)
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Invoices system setup completed successfully!' as status;
