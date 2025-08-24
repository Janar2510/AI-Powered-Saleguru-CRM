-- Update Existing Sales Orders Table
-- This will modify the existing table to match the new structure

-- First, let's see the current structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'sales_orders' 
ORDER BY ordinal_position;

-- Add new columns if they don't exist
DO $$
BEGIN
    -- Add quote_reference column if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'sales_orders' AND column_name = 'quote_reference'
    ) THEN
        ALTER TABLE public.sales_orders ADD COLUMN quote_reference TEXT;
        RAISE NOTICE 'Added quote_reference column';
    ELSE
        RAISE NOTICE 'quote_reference column already exists';
    END IF;

    -- Add deal_reference column if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'sales_orders' AND column_name = 'deal_reference'
    ) THEN
        ALTER TABLE public.sales_orders ADD COLUMN deal_reference TEXT;
        RAISE NOTICE 'Added deal_reference column';
    ELSE
        RAISE NOTICE 'deal_reference column already exists';
    END IF;
END $$;

-- Rename old columns if they exist (optional - only if you want to keep old data)
DO $$
BEGIN
    -- Rename quote_id to quote_reference if it exists
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'sales_orders' AND column_name = 'quote_id'
    ) THEN
        ALTER TABLE public.sales_orders RENAME COLUMN quote_id TO quote_id_old;
        RAISE NOTICE 'Renamed quote_id to quote_id_old (keeping old data)';
    END IF;

    -- Rename deal_id to deal_reference if it exists
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'sales_orders' AND column_name = 'deal_id'
    ) THEN
        ALTER TABLE public.sales_orders RENAME COLUMN deal_id TO deal_id_old;
        RAISE NOTICE 'Renamed deal_id to deal_id_old (keeping old data)';
    END IF;
END $$;

-- Show final structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'sales_orders' 
ORDER BY ordinal_position;

-- Success message
SELECT 'Sales Orders table updated successfully!' as status;
