-- Safe Deals Table Fix - Checks for existing columns
-- Apply this in Supabase Studio SQL Editor

-- First, let's see what columns already exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'deals' 
ORDER BY ordinal_position;

-- Only add columns that don't exist
DO $$
BEGIN
    -- Check and add each column individually
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'status') THEN
        ALTER TABLE public.deals ADD COLUMN status TEXT DEFAULT 'open';
        RAISE NOTICE '✅ Added status column';
    ELSE
        RAISE NOTICE 'ℹ️ Status column already exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'stage') THEN
        ALTER TABLE public.deals ADD COLUMN stage TEXT DEFAULT 'new';
        RAISE NOTICE '✅ Added stage column';
    ELSE
        RAISE NOTICE 'ℹ️ Stage column already exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'priority') THEN
        ALTER TABLE public.deals ADD COLUMN priority TEXT DEFAULT 'medium';
        RAISE NOTICE '✅ Added priority column';
    ELSE
        RAISE NOTICE 'ℹ️ Priority column already exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'tags') THEN
        ALTER TABLE public.deals ADD COLUMN tags TEXT[] DEFAULT '{}';
        RAISE NOTICE '✅ Added tags column';
    ELSE
        RAISE NOTICE 'ℹ️ Tags column already exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'notes') THEN
        ALTER TABLE public.deals ADD COLUMN notes TEXT;
        RAISE NOTICE '✅ Added notes column';
    ELSE
        RAISE NOTICE 'ℹ️ Notes column already exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'org_id') THEN
        ALTER TABLE public.deals ADD COLUMN org_id TEXT DEFAULT 'temp-org';
        RAISE NOTICE '✅ Added org_id column';
    ELSE
        RAISE NOTICE 'ℹ️ Org_id column already exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'pipeline_id') THEN
        ALTER TABLE public.deals ADD COLUMN pipeline_id TEXT DEFAULT 'default-pipeline';
        RAISE NOTICE '✅ Added pipeline_id column';
    ELSE
        RAISE NOTICE 'ℹ️ Pipeline_id column already exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'owner_id') THEN
        ALTER TABLE public.deals ADD COLUMN owner_id UUID;
        RAISE NOTICE '✅ Added owner_id column';
    ELSE
        RAISE NOTICE 'ℹ️ Owner_id column already exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'contact_id') THEN
        ALTER TABLE public.deals ADD COLUMN contact_id UUID;
        RAISE NOTICE '✅ Added contact_id column';
    ELSE
        RAISE NOTICE 'ℹ️ Contact_id column already exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'organization_id') THEN
        ALTER TABLE public.deals ADD COLUMN organization_id UUID;
        RAISE NOTICE '✅ Added organization_id column';
    ELSE
        RAISE NOTICE 'ℹ️ Organization_id column already exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'expected_close_date') THEN
        ALTER TABLE public.deals ADD COLUMN expected_close_date DATE;
        RAISE NOTICE '✅ Added expected_close_date column';
    ELSE
        RAISE NOTICE 'ℹ️ Expected_close_date column already exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'actual_close_date') THEN
        ALTER TABLE public.deals ADD COLUMN actual_close_date DATE;
        RAISE NOTICE '✅ Added actual_close_date column';
    ELSE
        RAISE NOTICE 'ℹ️ Actual_close_date column already exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'lost_reason') THEN
        ALTER TABLE public.deals ADD COLUMN lost_reason TEXT;
        RAISE NOTICE '✅ Added lost_reason column';
    ELSE
        RAISE NOTICE 'ℹ️ Lost_reason column already exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'source') THEN
        ALTER TABLE public.deals ADD COLUMN source TEXT;
        RAISE NOTICE '✅ Added source column';
    ELSE
        RAISE NOTICE 'ℹ️ Source column already exists';
    END IF;
    
    -- Add updated_at if missing (very important for tracking changes)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'updated_at') THEN
        ALTER TABLE public.deals ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE '✅ Added updated_at column';
    ELSE
        RAISE NOTICE 'ℹ️ Updated_at column already exists';
    END IF;
    
END $$;

-- Fix any NULL values with safe updates
UPDATE public.deals SET status = 'open' WHERE status IS NULL;
UPDATE public.deals SET stage = 'new' WHERE stage IS NULL OR stage = '';
UPDATE public.deals SET priority = 'medium' WHERE priority IS NULL;
UPDATE public.deals SET org_id = 'temp-org' WHERE org_id IS NULL;
UPDATE public.deals SET pipeline_id = 'default-pipeline' WHERE pipeline_id IS NULL;

-- Set up RLS and permissions
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Create or replace simple policy
DROP POLICY IF EXISTS "deals_policy" ON public.deals;
CREATE POLICY "deals_policy" ON public.deals FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON public.deals TO authenticated, anon;

-- Create trigger for automatic updated_at
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_deals ON public.deals;
CREATE TRIGGER set_updated_at_deals 
    BEFORE UPDATE ON public.deals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Add sample data if none exists for temp-org
DO $$
DECLARE
    deal_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO deal_count FROM public.deals WHERE org_id = 'temp-org';
    
    IF deal_count = 0 THEN
        -- Clear any existing temp-org deals first
        DELETE FROM public.deals WHERE org_id = 'temp-org';
        
        INSERT INTO public.deals (title, value, stage, status, priority, org_id) VALUES 
        ('New Lead Inquiry', 10000, 'new', 'open', 'medium', 'temp-org'),
        ('Qualified Enterprise Deal', 75000, 'qualified', 'open', 'high', 'temp-org'),
        ('Proposal Under Review', 35000, 'proposal', 'open', 'medium', 'temp-org'),
        ('Negotiating Terms', 50000, 'negotiation', 'open', 'high', 'temp-org'),
        ('Closed Won Deal', 40000, 'won', 'won', 'medium', 'temp-org'),
        ('Lost Competitive Deal', 25000, 'lost', 'lost', 'low', 'temp-org');
        
        RAISE NOTICE '✅ Inserted 6 sample deals across all stages';
    ELSE
        RAISE NOTICE 'ℹ️ Found % existing deals for temp-org', deal_count;
    END IF;
END $$;

-- Show final table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    COALESCE(column_default, 'No default') as column_default
FROM information_schema.columns 
WHERE table_name = 'deals' 
ORDER BY ordinal_position;

-- Show sample data
SELECT 
    'Database setup complete!' as status,
    COUNT(*) as total_deals,
    COUNT(CASE WHEN stage = 'new' THEN 1 END) as new_deals,
    COUNT(CASE WHEN stage = 'qualified' THEN 1 END) as qualified_deals,
    COUNT(CASE WHEN stage = 'proposal' THEN 1 END) as proposal_deals,
    COUNT(CASE WHEN stage = 'negotiation' THEN 1 END) as negotiation_deals,
    COUNT(CASE WHEN stage = 'won' THEN 1 END) as won_deals,
    COUNT(CASE WHEN stage = 'lost' THEN 1 END) as lost_deals
FROM public.deals 
WHERE org_id = 'temp-org';
