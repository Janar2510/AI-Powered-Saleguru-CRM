-- Fix missing status column in deals table
-- Apply this in Supabase Studio SQL Editor

-- Check if deals table exists, if not create it with all required columns
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL DEFAULT 'Untitled Deal',
    description TEXT,
    value INTEGER NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    probability INTEGER NOT NULL DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
    stage TEXT NOT NULL DEFAULT 'new',
    status TEXT DEFAULT 'open',
    priority TEXT DEFAULT 'medium',
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    owner_id UUID,
    contact_id UUID,
    organization_id UUID,
    expected_close_date DATE,
    actual_close_date DATE,
    lost_reason TEXT,
    source TEXT,
    org_id TEXT DEFAULT 'temp-org',
    pipeline_id TEXT DEFAULT 'default-pipeline',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns one by one with proper error handling
DO $$
BEGIN
    -- Add status column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'status') THEN
        ALTER TABLE public.deals ADD COLUMN status TEXT DEFAULT 'open';
        RAISE NOTICE '✅ Added status column';
    ELSE
        RAISE NOTICE 'ℹ️ Status column already exists';
    END IF;
    
    -- Add stage column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'stage') THEN
        ALTER TABLE public.deals ADD COLUMN stage TEXT DEFAULT 'new';
        RAISE NOTICE '✅ Added stage column';
    ELSE
        RAISE NOTICE 'ℹ️ Stage column already exists';
    END IF;
    
    -- Add description column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'description') THEN
        ALTER TABLE public.deals ADD COLUMN description TEXT;
        RAISE NOTICE '✅ Added description column';
    ELSE
        RAISE NOTICE 'ℹ️ Description column already exists';
    END IF;
    
    -- Add priority column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'priority') THEN
        ALTER TABLE public.deals ADD COLUMN priority TEXT DEFAULT 'medium';
        RAISE NOTICE '✅ Added priority column';
    ELSE
        RAISE NOTICE 'ℹ️ Priority column already exists';
    END IF;
    
    -- Add tags column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'tags') THEN
        ALTER TABLE public.deals ADD COLUMN tags TEXT[] DEFAULT '{}';
        RAISE NOTICE '✅ Added tags column';
    ELSE
        RAISE NOTICE 'ℹ️ Tags column already exists';
    END IF;
    
    -- Add notes column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'notes') THEN
        ALTER TABLE public.deals ADD COLUMN notes TEXT;
        RAISE NOTICE '✅ Added notes column';
    ELSE
        RAISE NOTICE 'ℹ️ Notes column already exists';
    END IF;
    
    -- Add org_id column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'org_id') THEN
        ALTER TABLE public.deals ADD COLUMN org_id TEXT DEFAULT 'temp-org';
        RAISE NOTICE '✅ Added org_id column';
    ELSE
        RAISE NOTICE 'ℹ️ Org_id column already exists';
    END IF;
    
    -- Add pipeline_id column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'pipeline_id') THEN
        ALTER TABLE public.deals ADD COLUMN pipeline_id TEXT DEFAULT 'default-pipeline';
        RAISE NOTICE '✅ Added pipeline_id column';
    ELSE
        RAISE NOTICE 'ℹ️ Pipeline_id column already exists';
    END IF;
END $$;

-- Update any NULL values to defaults
UPDATE public.deals SET 
    status = 'open' WHERE status IS NULL,
    stage = 'new' WHERE stage IS NULL OR stage = '',
    priority = 'medium' WHERE priority IS NULL,
    org_id = 'temp-org' WHERE org_id IS NULL,
    pipeline_id = 'default-pipeline' WHERE pipeline_id IS NULL;

-- Add constraints after fixing data
DO $$
BEGIN
    -- Add status constraint if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'deals_status_check') THEN
        ALTER TABLE public.deals ADD CONSTRAINT deals_status_check CHECK (status IN ('open', 'won', 'lost'));
        RAISE NOTICE '✅ Added status constraint';
    END IF;
    
    -- Add priority constraint if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'deals_priority_check') THEN
        ALTER TABLE public.deals ADD CONSTRAINT deals_priority_check CHECK (priority IN ('low', 'medium', 'high'));
        RAISE NOTICE '✅ Added priority constraint';
    END IF;
    
    -- Add probability constraint if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'deals_probability_check') THEN
        ALTER TABLE public.deals ADD CONSTRAINT deals_probability_check CHECK (probability >= 0 AND probability <= 100);
        RAISE NOTICE '✅ Added probability constraint';
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_deals_stage ON public.deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_status ON public.deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_org_id ON public.deals(org_id);
CREATE INDEX IF NOT EXISTS idx_deals_priority ON public.deals(priority);
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON public.deals(created_at);

-- Enable RLS
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policies (allowing all operations for now)
DROP POLICY IF EXISTS "deals_all_operations" ON public.deals;
CREATE POLICY "deals_all_operations" ON public.deals FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON public.deals TO authenticated, anon;

-- Create trigger for updated_at
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

-- Insert minimal sample data if table is empty
DO $$
DECLARE
    deal_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO deal_count FROM public.deals WHERE org_id = 'temp-org';
    
    IF deal_count = 0 THEN
        INSERT INTO public.deals (title, description, value, stage, status, priority, org_id) VALUES 
        ('Sample Deal 1', 'First sample deal', 10000, 'new', 'open', 'medium', 'temp-org'),
        ('Sample Deal 2', 'Second sample deal', 25000, 'qualified', 'open', 'high', 'temp-org'),
        ('Sample Deal 3', 'Third sample deal', 15000, 'proposal', 'open', 'medium', 'temp-org'),
        ('Sample Deal 4', 'Fourth sample deal', 30000, 'negotiation', 'open', 'high', 'temp-org'),
        ('Sample Deal 5', 'Won deal example', 20000, 'won', 'won', 'medium', 'temp-org');
        
        RAISE NOTICE '✅ Inserted 5 sample deals';
    ELSE
        RAISE NOTICE 'ℹ️ Table already contains % deals, skipping sample data', deal_count;
    END IF;
END $$;

-- Verify columns exist
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'deals' 
ORDER BY ordinal_position;

-- Final success message
SELECT 
    '🎉 Deals table is now ready with status column!' as message,
    COUNT(*) as total_deals,
    COUNT(CASE WHEN stage = 'new' THEN 1 END) as new_deals,
    COUNT(CASE WHEN stage = 'qualified' THEN 1 END) as qualified_deals,
    COUNT(CASE WHEN stage = 'proposal' THEN 1 END) as proposal_deals,
    COUNT(CASE WHEN stage = 'negotiation' THEN 1 END) as negotiation_deals,
    COUNT(CASE WHEN stage = 'won' THEN 1 END) as won_deals
FROM public.deals 
WHERE org_id = 'temp-org';

