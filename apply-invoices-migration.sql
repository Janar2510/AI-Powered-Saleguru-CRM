-- Simple script to apply just the invoices migration
-- Run this in Supabase Studio SQL Editor

-- Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_number TEXT UNIQUE NOT NULL,
    contact_id UUID,
    organization_id UUID,
    deal_id UUID,
    quote_id UUID,
    
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
    product_id UUID,
    
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

-- Grant permissions
GRANT ALL ON public.invoices TO authenticated;
GRANT ALL ON public.invoice_items TO authenticated;
GRANT ALL ON public.invoice_payments TO authenticated;
GRANT ALL ON public.invoices TO anon;
GRANT ALL ON public.invoice_items TO anon;
GRANT ALL ON public.invoice_payments TO anon;

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

-- Insert sample data for testing
INSERT INTO public.invoices (
    id, invoice_number, invoice_date, due_date, 
    subtotal_cents, tax_cents, total_cents, currency, status, notes
) VALUES 
(
    'inv_001', 'INV-1001', 
    CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days',
    100000, 10000, 110000, 'EUR', 'sent',
    'First invoice for testing'
),
(
    'inv_002', 'INV-1002', 
    CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '20 days',
    250000, 25000, 275000, 'EUR', 'overdue',
    'Overdue invoice for testing'
),
(
    'inv_003', 'INV-1003', 
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
