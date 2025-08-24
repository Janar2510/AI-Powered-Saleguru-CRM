-- Sales Orders System - Production Ready Setup
-- Advanced indexing, RLS policies, and automatic timestamp management

-- Create sales_orders table with proper structure
CREATE TABLE IF NOT EXISTS public.sales_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id TEXT NOT NULL,
    order_number TEXT UNIQUE NOT NULL,
    quote_id UUID,
    deal_id UUID,
    
    -- Customer information
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    customer_address TEXT,
    
    -- Billing information
    billing_name TEXT,
    billing_address TEXT,
    billing_city TEXT,
    billing_state TEXT,
    billing_postal_code TEXT,
    billing_country TEXT DEFAULT 'US',
    
    -- Shipping information
    shipping_name TEXT,
    shipping_address TEXT,
    shipping_city TEXT,
    shipping_state TEXT,
    shipping_postal_code TEXT,
    shipping_country TEXT DEFAULT 'US',
    same_as_billing BOOLEAN DEFAULT true,
    
    -- Financial information
    subtotal_cents INTEGER DEFAULT 0,
    discount_cents INTEGER DEFAULT 0,
    tax_cents INTEGER DEFAULT 0,
    shipping_cost_cents INTEGER DEFAULT 0,
    total_cents INTEGER DEFAULT 0,
    
    -- Order details
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Dates
    order_date DATE DEFAULT CURRENT_DATE,
    required_date DATE,
    shipped_date DATE,
    delivery_date DATE,
    
    -- Additional information
    notes TEXT,
    terms TEXT,
    internal_notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Create sales_order_line_items table
CREATE TABLE IF NOT EXISTS public.sales_order_line_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id TEXT NOT NULL,
    sales_order_id UUID NOT NULL REFERENCES public.sales_orders(id) ON DELETE CASCADE,
    
    -- Product information
    product_id UUID,
    product_name TEXT NOT NULL,
    product_sku TEXT,
    product_description TEXT,
    
    -- Pricing
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price_cents INTEGER NOT NULL DEFAULT 0,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    tax_percent DECIMAL(5,2) DEFAULT 0,
    line_total_cents INTEGER NOT NULL DEFAULT 0,
    
    -- Inventory tracking
    allocated_quantity INTEGER DEFAULT 0,
    shipped_quantity INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shipping_management table
CREATE TABLE IF NOT EXISTS public.shipping_management (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id TEXT NOT NULL,
    sales_order_id UUID NOT NULL REFERENCES public.sales_orders(id) ON DELETE CASCADE,
    
    -- Shipping provider
    carrier TEXT DEFAULT 'dhl' CHECK (carrier IN ('dhl', 'fedex', 'ups', 'usps', 'custom')),
    service_type TEXT,
    
    -- Tracking information
    tracking_number TEXT UNIQUE,
    label_url TEXT,
    
    -- DHL specific fields
    dhl_shipment_id TEXT,
    dhl_label_id TEXT,
    dhl_service_code TEXT,
    
    -- Package information
    weight_kg DECIMAL(10,2),
    length_cm DECIMAL(10,2),
    width_cm DECIMAL(10,2),
    height_cm DECIMAL(10,2),
    package_type TEXT DEFAULT 'box',
    
    -- Costs
    shipping_cost_cents INTEGER DEFAULT 0,
    insurance_cost_cents INTEGER DEFAULT 0,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'label_created', 'picked_up', 'in_transit', 'delivered', 'exception', 'returned')),
    
    -- Dates
    ship_date DATE,
    estimated_delivery_date DATE,
    actual_delivery_date DATE,
    
    -- Additional information
    special_instructions TEXT,
    signature_required BOOLEAN DEFAULT false,
    insurance_value_cents INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create optimized indexes
-- Index the most frequently queried and joined fields
CREATE INDEX IF NOT EXISTS idx_sales_orders_org_id ON public.sales_orders(org_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON public.sales_orders(status);
CREATE INDEX IF NOT EXISTS idx_sales_orders_order_date ON public.sales_orders(order_date);
-- Conditional index for advanced filtering scenarios
CREATE INDEX IF NOT EXISTS idx_sales_orders_customer_email ON public.sales_orders(customer_email) 
    WHERE status != 'cancelled';
-- Only create foreign key indexes if the referenced tables exist
CREATE INDEX IF NOT EXISTS idx_sales_orders_quote_id ON public.sales_orders(quote_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_deal_id ON public.sales_orders(deal_id);

-- Composite index for related items lookups (much more efficient)
CREATE INDEX IF NOT EXISTS idx_sales_order_items_order_lookup 
    ON public.sales_order_line_items(sales_order_id, org_id);
-- Index for inventory management queries
CREATE INDEX IF NOT EXISTS idx_sales_order_items_product_id 
    ON public.sales_order_line_items(product_id) 
    WHERE allocated_quantity > 0;

-- Optimize shipping tracking lookups
CREATE INDEX IF NOT EXISTS idx_shipping_management_tracking ON public.shipping_management(tracking_number) 
    WHERE tracking_number IS NOT NULL;
-- Composite index for shipping status queries
CREATE INDEX IF NOT EXISTS idx_shipping_management_status 
    ON public.shipping_management(sales_order_id, status);

-- Enable Row Level Security
ALTER TABLE public.sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_order_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_management ENABLE ROW LEVEL SECURITY;

-- Create proper RLS policies for each table based on org_id
CREATE POLICY sales_orders_org_policy ON public.sales_orders
    FOR ALL TO authenticated
    USING (org_id = auth.jwt() ->> 'org_id');

CREATE POLICY sales_order_line_items_org_policy ON public.sales_order_line_items
    FOR ALL TO authenticated
    USING (org_id = auth.jwt() ->> 'org_id');

CREATE POLICY shipping_management_org_policy ON public.shipping_management
    FOR ALL TO authenticated
    USING (org_id = auth.jwt() ->> 'org_id');

-- Grant appropriate permissions (once is sufficient)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales_orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales_order_line_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shipping_management TO authenticated;

-- For development only - should be removed in production
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales_orders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales_order_line_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shipping_management TO anon;

-- Create functions for timestamp management
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for automatic timestamp updating
CREATE TRIGGER set_updated_at_sales_orders
BEFORE UPDATE ON public.sales_orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_sales_order_line_items
BEFORE UPDATE ON public.sales_order_line_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_shipping_management
BEFORE UPDATE ON public.shipping_management
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Insert sample data for testing
INSERT INTO public.sales_orders (
    id, org_id, order_number, customer_name, customer_email, 
    billing_address, shipping_address, subtotal_cents, tax_cents, 
    total_cents, status, order_date, notes
) VALUES 
(
    'so_001', 'temp-org', 'SO-2025-001', 
    'Acme Corporation', 'orders@acme.com',
    '123 Business St, New York, NY 10001',
    '123 Business St, New York, NY 10001',
    125000, 12500, 140000, 'confirmed', CURRENT_DATE,
    'Expedited processing requested'
),
(
    'so_002', 'temp-org', 'SO-2025-002',
    'TechStart Inc', 'purchasing@techstart.com',
    '456 Innovation Dr, San Francisco, CA 94105',
    '456 Innovation Dr, San Francisco, CA 94105',
    85000, 8500, 95000, 'processing', CURRENT_DATE,
    'Standard delivery'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.sales_order_line_items (
    org_id, sales_order_id, product_name, product_sku, quantity, 
    unit_price_cents, tax_percent, line_total_cents
) VALUES 
('temp-org', 'so_001', 'Premium CRM License', 'CRM-PREM-001', 5, 25000, 10.0, 137500),
('temp-org', 'so_002', 'Standard CRM License', 'CRM-STD-001', 10, 8500, 10.0, 93500)
ON CONFLICT DO NOTHING;

INSERT INTO public.shipping_management (
    org_id, sales_order_id, carrier, service_type, tracking_number,
    weight_kg, shipping_cost_cents, status, ship_date
) VALUES 
('temp-org', 'so_001', 'dhl', 'EXPRESS', 'DHL123456789', 2.5, 2500, 'in_transit', CURRENT_DATE),
('temp-org', 'so_002', 'dhl', 'STANDARD', 'DHL987654321', 1.8, 1500, 'label_created', CURRENT_DATE + INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Sales Orders system setup completed successfully with production-ready features!' as status;
