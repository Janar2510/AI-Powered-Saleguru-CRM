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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quotes_org_id ON public.quotes(org_id);
CREATE INDEX IF NOT EXISTS idx_quotes_customer_id ON public.quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_quote_date ON public.quotes(quote_date);
CREATE INDEX IF NOT EXISTS idx_quotes_quote_number ON public.quotes(quote_number);

CREATE INDEX IF NOT EXISTS idx_quote_line_items_quote_id ON public.quote_line_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_line_items_product_id ON public.quote_line_items(product_id);
CREATE INDEX IF NOT EXISTS idx_quote_line_items_org_id ON public.quote_line_items(org_id);

-- Add updated_at trigger for quotes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_quotes_updated_at ON public.quotes;
CREATE TRIGGER update_quotes_updated_at
    BEFORE UPDATE ON public.quotes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_quote_line_items_updated_at ON public.quote_line_items;
CREATE TRIGGER update_quote_line_items_updated_at
    BEFORE UPDATE ON public.quote_line_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_line_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for quotes
DO $$ 
BEGIN 
    -- Check if policies exist before creating them
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

-- Create a function to generate quote numbers
CREATE OR REPLACE FUNCTION generate_quote_number(org_uuid UUID)
RETURNS VARCHAR(50) AS $$
DECLARE
    year_str VARCHAR(4);
    next_num INTEGER;
    quote_num VARCHAR(50);
BEGIN
    year_str := EXTRACT(year FROM NOW())::VARCHAR;
    
    -- Get the next sequential number for this year and org
    SELECT COALESCE(MAX(
        CASE 
            WHEN quote_number ~ ('^QUO-' || year_str || '-[0-9]+$') 
            THEN substring(quote_number FROM '^QUO-' || year_str || '-([0-9]+)$')::INTEGER
            ELSE 0
        END
    ), 0) + 1 INTO next_num
    FROM public.quotes 
    WHERE org_id = org_uuid;
    
    quote_num := 'QUO-' || year_str || '-' || LPAD(next_num::VARCHAR, 4, '0');
    
    RETURN quote_num;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT ALL ON public.quotes TO authenticated;
GRANT ALL ON public.quote_line_items TO authenticated;
GRANT EXECUTE ON FUNCTION generate_quote_number(UUID) TO authenticated;

-- Insert sample data for testing (optional)
DO $$ 
DECLARE
    sample_org_id UUID;
    sample_user_id UUID;
    sample_quote_id UUID;
BEGIN
    -- Only insert if no quotes exist
    IF NOT EXISTS (SELECT 1 FROM public.quotes LIMIT 1) THEN
        -- Try to get existing org and user IDs
        SELECT id INTO sample_user_id FROM public.users LIMIT 1;
        
        IF sample_user_id IS NOT NULL THEN
            SELECT org_id INTO sample_org_id FROM public.users WHERE id = sample_user_id;
            
            IF sample_org_id IS NOT NULL THEN
                -- Create a sample quote
                INSERT INTO public.quotes (
                    quote_number,
                    customer_name,
                    customer_email,
                    customer_address,
                    quote_date,
                    valid_until,
                    status,
                    subtotal_cents,
                    discount_cents,
                    tax_cents,
                    total_cents,
                    notes,
                    terms,
                    created_by,
                    org_id
                ) VALUES (
                    generate_quote_number(sample_org_id),
                    'Sample Customer Ltd.',
                    'customer@example.com',
                    '123 Business Street, City, Country',
                    CURRENT_DATE,
                    CURRENT_DATE + INTERVAL '30 days',
                    'draft',
                    10000,
                    500,
                    1900,
                    11400,
                    'This is a sample quote for testing purposes.',
                    'Payment due within 30 days of acceptance. All prices are in EUR.',
                    sample_user_id,
                    sample_org_id
                ) RETURNING id INTO sample_quote_id;
                
                -- Create sample line items
                INSERT INTO public.quote_line_items (
                    quote_id,
                    product_name,
                    product_sku,
                    quantity,
                    unit_price_cents,
                    discount_percent,
                    tax_percent,
                    line_total_cents,
                    org_id
                ) VALUES 
                (
                    sample_quote_id,
                    'CRM Software License',
                    'CRM-LIC-001',
                    1,
                    9900,
                    0,
                    20,
                    11880,
                    sample_org_id
                ),
                (
                    sample_quote_id,
                    'Setup & Training',
                    'SERV-001',
                    2,
                    2500,
                    10,
                    20,
                    5400,
                    sample_org_id
                );
            END IF;
        END IF;
    END IF;
END $$;

-- Add comment
COMMENT ON TABLE public.quotes IS 'Customer quotes with line items and automated calculations';
COMMENT ON TABLE public.quote_line_items IS 'Individual line items for quotes with pricing and tax calculations';
