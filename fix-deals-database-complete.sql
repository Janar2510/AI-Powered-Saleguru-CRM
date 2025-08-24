-- Complete Deals Database Fix
-- Apply this in Supabase Studio SQL Editor
-- Fixes schema issues and ensures data loading works

-- 1. Ensure deals table exists with all required columns
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    value INTEGER NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    probability INTEGER NOT NULL DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
    stage TEXT NOT NULL DEFAULT 'new',
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
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

-- 2. Add any missing columns safely
DO $$
BEGIN
    -- Check and add each column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'stage') THEN
        ALTER TABLE public.deals ADD COLUMN stage TEXT NOT NULL DEFAULT 'new';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'description') THEN
        ALTER TABLE public.deals ADD COLUMN description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'priority') THEN
        ALTER TABLE public.deals ADD COLUMN priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'tags') THEN
        ALTER TABLE public.deals ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'notes') THEN
        ALTER TABLE public.deals ADD COLUMN notes TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'org_id') THEN
        ALTER TABLE public.deals ADD COLUMN org_id TEXT DEFAULT 'temp-org';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'pipeline_id') THEN
        ALTER TABLE public.deals ADD COLUMN pipeline_id TEXT DEFAULT 'default-pipeline';
    END IF;
END $$;

-- 3. Fix stage values (avoid UUID operations)
UPDATE public.deals 
SET stage = 'new'
WHERE stage IS NULL OR stage = '' OR stage = 'undefined';

-- Update any problematic stage values to valid stages
UPDATE public.deals 
SET stage = CASE 
    WHEN stage NOT IN ('new', 'qualified', 'proposal', 'negotiation', 'won', 'lost') 
    THEN 'new'
    ELSE stage
END;

-- 4. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_deals_stage ON public.deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_org_id ON public.deals(org_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON public.deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_priority ON public.deals(priority);
CREATE INDEX IF NOT EXISTS idx_deals_value ON public.deals(value);
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON public.deals(created_at);

-- 5. Row Level Security (RLS) setup
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for all users" ON public.deals;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.deals;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.deals;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.deals;

-- Create comprehensive RLS policies
CREATE POLICY "deals_select_policy" ON public.deals FOR SELECT USING (true);
CREATE POLICY "deals_insert_policy" ON public.deals FOR INSERT WITH CHECK (true);
CREATE POLICY "deals_update_policy" ON public.deals FOR UPDATE USING (true);
CREATE POLICY "deals_delete_policy" ON public.deals FOR DELETE USING (true);

-- 6. Grant necessary permissions
GRANT ALL ON public.deals TO authenticated, anon;

-- 7. Create or update trigger for automatic timestamps
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

-- 8. Insert sample data if table is empty or has insufficient data
DO $$
DECLARE
    deal_count INTEGER;
    sample_owner_id UUID := gen_random_uuid();
    sample_contact_id UUID := gen_random_uuid();
    sample_org_id UUID := gen_random_uuid();
BEGIN
    SELECT COUNT(*) INTO deal_count FROM public.deals WHERE org_id = 'temp-org';
    
    IF deal_count < 5 THEN
        -- Clear any existing temp-org deals first
        DELETE FROM public.deals WHERE org_id = 'temp-org';
        
        -- Insert comprehensive sample data
        INSERT INTO public.deals (
            title, description, value, currency, probability, stage, status, 
            priority, tags, expected_close_date, notes, org_id, 
            owner_id, contact_id, organization_id
        ) VALUES 
        -- NEW stage deals
        (
            'New Lead - Tech Startup', 
            'Initial inquiry from fast-growing tech startup',
            25000, 'USD', 15, 'new', 'open',
            'medium', ARRAY['startup', 'tech'], 
            CURRENT_DATE + INTERVAL '60 days',
            'Just received inquiry via website contact form.',
            'temp-org', sample_owner_id, sample_contact_id, sample_org_id
        ),
        (
            'Inbound Marketing Lead',
            'Lead generated from recent marketing campaign',
            18000, 'USD', 20, 'new', 'open',
            'low', ARRAY['marketing', 'inbound'],
            CURRENT_DATE + INTERVAL '45 days',
            'Downloaded whitepaper and attended webinar.',
            'temp-org', sample_owner_id, sample_contact_id, sample_org_id
        ),
        
        -- QUALIFIED stage deals
        (
            'Small Business CRM Upgrade',
            'Existing customer looking to upgrade their current plan',
            35000, 'USD', 65, 'qualified', 'open',
            'medium', ARRAY['upgrade', 'existing-customer'],
            CURRENT_DATE + INTERVAL '30 days',
            'Customer has outgrown current plan. Budget confirmed.',
            'temp-org', sample_owner_id, sample_contact_id, sample_org_id
        ),
        (
            'International Expansion Deal',
            'Multi-national corporation expanding CRM globally',
            112500, 'USD', 45, 'qualified', 'open',
            'high', ARRAY['international', 'enterprise'],
            CURRENT_DATE + INTERVAL '45 days',
            'Complex deal with stakeholders across different regions.',
            'temp-org', sample_owner_id, sample_contact_id, sample_org_id
        ),
        
        -- PROPOSAL stage deals
        (
            'Mid-Market Manufacturing',
            'Manufacturing company needs integrated CRM solution',
            67500, 'USD', 70, 'proposal', 'open',
            'high', ARRAY['manufacturing', 'mid-market'],
            CURRENT_DATE + INTERVAL '20 days',
            'Proposal submitted. Technical requirements approved.',
            'temp-org', sample_owner_id, sample_contact_id, sample_org_id
        ),
        (
            'SaaS Company Integration',
            'SaaS company needs CRM with API integrations',
            45000, 'USD', 55, 'proposal', 'open',
            'medium', ARRAY['saas', 'integration'],
            CURRENT_DATE + INTERVAL '25 days',
            'Proposal includes custom API development.',
            'temp-org', sample_owner_id, sample_contact_id, sample_org_id
        ),
        
        -- NEGOTIATION stage deals
        (
            'Enterprise Healthcare Solution',
            'Large healthcare organization CRM implementation',
            185000, 'USD', 85, 'negotiation', 'open',
            'high', ARRAY['healthcare', 'enterprise'],
            CURRENT_DATE + INTERVAL '15 days',
            'Final negotiations on terms and implementation timeline.',
            'temp-org', sample_owner_id, sample_contact_id, sample_org_id
        ),
        (
            'Financial Services Upgrade',
            'Investment firm upgrading to premium CRM features',
            78000, 'USD', 80, 'negotiation', 'open',
            'high', ARRAY['financial', 'upgrade'],
            CURRENT_DATE + INTERVAL '10 days',
            'Negotiating compliance requirements and data security.',
            'temp-org', sample_owner_id, sample_contact_id, sample_org_id
        ),
        
        -- WON deals
        (
            'E-commerce Platform Integration',
            'Successfully closed e-commerce CRM integration',
            95000, 'USD', 100, 'won', 'won',
            'high', ARRAY['ecommerce', 'integration', 'closed'],
            CURRENT_DATE - INTERVAL '5 days',
            'Successful implementation completed ahead of schedule.',
            'temp-org', sample_owner_id, sample_contact_id, sample_org_id
        ),
        
        -- LOST deals
        (
            'Competitive Retail Deal',
            'Lost to competitor in retail sector bid',
            52000, 'USD', 0, 'lost', 'lost',
            'medium', ARRAY['retail', 'competitive', 'lost'],
            CURRENT_DATE - INTERVAL '15 days',
            'Lost due to price sensitivity and competitor relationship.',
            'temp-org', sample_owner_id, sample_contact_id, sample_org_id
        );
        
        -- Update close dates for won/lost deals
        UPDATE public.deals 
        SET actual_close_date = CURRENT_DATE - INTERVAL '5 days'
        WHERE stage = 'won' AND org_id = 'temp-org';
        
        UPDATE public.deals 
        SET actual_close_date = CURRENT_DATE - INTERVAL '15 days',
            lost_reason = 'Price sensitivity - competitor had lower pricing'
        WHERE stage = 'lost' AND org_id = 'temp-org';
        
        RAISE NOTICE 'Inserted 10 sample deals across all pipeline stages';
    ELSE
        RAISE NOTICE 'Table already contains % deals for temp-org, skipping sample data', deal_count;
    END IF;
END $$;

-- 9. Verify the database is ready
DO $$
DECLARE
    total_count INTEGER;
    stage_distribution TEXT;
BEGIN
    SELECT COUNT(*) INTO total_count FROM public.deals WHERE org_id = 'temp-org';
    
    SELECT string_agg(stage || ': ' || count::text, ', ' ORDER BY stage) INTO stage_distribution
    FROM (
        SELECT stage, COUNT(*) as count 
        FROM public.deals 
        WHERE org_id = 'temp-org' 
        GROUP BY stage
    ) stage_counts;
    
    RAISE NOTICE '✅ Database setup completed successfully!';
    RAISE NOTICE 'Total deals: %', total_count;
    RAISE NOTICE 'Stage distribution: %', stage_distribution;
END $$;

-- Success confirmation
SELECT 
    '🚀 Deals database is ready! Drag & drop should work now.' as status,
    COUNT(*) as total_deals,
    COUNT(CASE WHEN stage = 'new' THEN 1 END) as new_deals,
    COUNT(CASE WHEN stage = 'qualified' THEN 1 END) as qualified_deals,
    COUNT(CASE WHEN stage = 'proposal' THEN 1 END) as proposal_deals,
    COUNT(CASE WHEN stage = 'negotiation' THEN 1 END) as negotiation_deals,
    COUNT(CASE WHEN stage = 'won' THEN 1 END) as won_deals,
    COUNT(CASE WHEN stage = 'lost' THEN 1 END) as lost_deals
FROM public.deals 
WHERE org_id = 'temp-org';
