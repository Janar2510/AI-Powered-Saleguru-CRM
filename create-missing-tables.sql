-- Create Missing Tables for Sales Orders System
-- This will create any tables that don't exist yet

-- Check if sales_order_line_items table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'sales_order_line_items'
    ) THEN
        CREATE TABLE public.sales_order_line_items (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            sales_order_id UUID NOT NULL,
            product_id UUID,
            product_name TEXT NOT NULL,
            product_sku TEXT,
            product_description TEXT,
            quantity INTEGER NOT NULL DEFAULT 1,
            unit_price_cents INTEGER NOT NULL DEFAULT 0,
            discount_percent DECIMAL(5,2) DEFAULT 0,
            tax_percent DECIMAL(5,2) DEFAULT 0,
            line_total_cents INTEGER NOT NULL DEFAULT 0,
            allocated_quantity INTEGER DEFAULT 0,
            shipped_quantity INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created sales_order_line_items table';
    ELSE
        RAISE NOTICE 'sales_order_line_items table already exists';
    END IF;
END $$;

-- Check if shipping_management table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'shipping_management'
    ) THEN
        CREATE TABLE public.shipping_management (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            sales_order_id UUID NOT NULL,
            carrier TEXT DEFAULT 'dhl' CHECK (carrier IN ('dhl', 'fedex', 'ups', 'usps', 'custom')),
            service_type TEXT,
            tracking_number TEXT UNIQUE,
            label_url TEXT,
            dhl_shipment_id TEXT,
            dhl_label_id TEXT,
            dhl_service_code TEXT,
            weight_kg DECIMAL(10,2),
            length_cm DECIMAL(10,2),
            width_cm DECIMAL(10,2),
            height_cm DECIMAL(10,2),
            package_type TEXT DEFAULT 'box',
            shipping_cost_cents INTEGER DEFAULT 0,
            insurance_cost_cents INTEGER DEFAULT 0,
            status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'label_created', 'picked_up', 'in_transit', 'delivered', 'exception', 'returned')),
            ship_date DATE,
            estimated_delivery_date DATE,
            actual_delivery_date DATE,
            special_instructions TEXT,
            signature_required BOOLEAN DEFAULT false,
            insurance_value_cents INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created shipping_management table';
    ELSE
        RAISE NOTICE 'shipping_management table already exists';
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_sales_order_items_sales_order_id ON public.sales_order_line_items(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_sales_order_items_product_id ON public.sales_order_line_items(product_id);
CREATE INDEX IF NOT EXISTS idx_shipping_management_tracking ON public.shipping_management(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipping_management_status ON public.shipping_management(sales_order_id, status);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales_order_line_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales_order_line_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shipping_management TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shipping_management TO anon;

-- Show all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('sales_orders', 'sales_order_line_items', 'shipping_management')
ORDER BY table_name;

-- Success message
SELECT 'Missing tables created successfully!' as status;
