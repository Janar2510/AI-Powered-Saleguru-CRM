-- QUOTES SYSTEM SETUP
-- Run this in Supabase Studio SQL Editor to create the quotes system

-- Create quotes table
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quote_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id UUID,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_address TEXT,
    quote_date DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'declined', 'expired')),
    subtotal_cents INTEGER NOT NULL DEFAULT 0,
    discount_cents INTEGER NOT NULL DEFAULT 0,
    tax_cents INTEGER NOT NULL DEFAULT 0,
    total_cents INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    terms TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID NOT NULL,
    org_id UUID NOT NULL
);

-- Create quote line items table
CREATE TABLE IF NOT EXISTS public.quote_line_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
    product_id UUID,
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price_cents INTEGER NOT NULL DEFAULT 0 CHECK (unit_price_cents >= 0),
    discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
    tax_percent DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (tax_percent >= 0 AND tax_percent <= 100),
    line_total_cents INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    org_id UUID NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_line_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for quotes
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'quotes_org_isolation' AND tablename = 'quotes'
    ) THEN
        CREATE POLICY quotes_org_isolation ON public.quotes
            FOR ALL USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'quote_line_items_org_isolation' AND tablename = 'quote_line_items'
    ) THEN
        CREATE POLICY quote_line_items_org_isolation ON public.quote_line_items
            FOR ALL USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));
    END IF;
END $$;

-- Grant permissions
GRANT ALL ON public.quotes TO authenticated;
GRANT ALL ON public.quote_line_items TO authenticated;

-- Success message
SELECT 'Quotes system created successfully! 🎉' as message;
