-- Final Safe Deals Migration Script
-- Apply this in Supabase Studio SQL Editor

-- Ensure deals table exists with basic structure
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    value INTEGER NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    probability INTEGER NOT NULL DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost')),
    owner_id UUID,
    contact_id UUID,
    organization_id UUID,
    expected_close_date DATE,
    actual_close_date DATE,
    lost_reason TEXT,
    source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns safely, including stage
DO $$
BEGIN
    -- Add stage column first (most important)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'stage') THEN
        ALTER TABLE public.deals ADD COLUMN stage TEXT NOT NULL DEFAULT 'new';
    END IF;
    
    -- Add description column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'description') THEN
        ALTER TABLE public.deals ADD COLUMN description TEXT;
    END IF;
    
    -- Add priority column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'priority') THEN
        ALTER TABLE public.deals ADD COLUMN priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high'));
    END IF;
    
    -- Add tags column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'tags') THEN
        ALTER TABLE public.deals ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
    
    -- Add notes column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'notes') THEN
        ALTER TABLE public.deals ADD COLUMN notes TEXT;
    END IF;
    
    -- Add org_id column for multi-tenancy
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'org_id') THEN
        ALTER TABLE public.deals ADD COLUMN org_id TEXT DEFAULT 'temp-org';
    END IF;
    
    -- Add pipeline_id for compatibility
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'pipeline_id') THEN
        ALTER TABLE public.deals ADD COLUMN pipeline_id TEXT DEFAULT 'default-pipeline';
    END IF;
    
    -- Add stage_id for backward compatibility (if it exists from old schema)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'stage_id') THEN
        ALTER TABLE public.deals ADD COLUMN stage_id TEXT;
    END IF;
END $$;

-- Now safely update stage values after ensuring the column exists
DO $$
BEGIN
    -- Check if stage column exists before updating
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'stage') THEN
        -- Update any NULL or empty stage values
        UPDATE public.deals 
        SET stage = 'new'
        WHERE stage IS NULL OR stage = '';
        
        -- If stage_id exists and contains non-UUID values, use them for stage
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'stage_id') THEN
            UPDATE public.deals 
            SET stage = stage_id
            WHERE stage_id IS NOT NULL 
              AND stage_id != '' 
              AND LENGTH(stage_id) < 50  -- Reasonable stage name length
              AND stage_id NOT LIKE '%-%-%-%-%';  -- Not a UUID pattern
        END IF;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_deals_stage ON public.deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_priority ON public.deals(priority);
CREATE INDEX IF NOT EXISTS idx_deals_tags ON public.deals USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_deals_org_id ON public.deals(org_id);
CREATE INDEX IF NOT EXISTS idx_deals_value ON public.deals(value);
CREATE INDEX IF NOT EXISTS idx_deals_status ON public.deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_owner_id ON public.deals(owner_id);
CREATE INDEX IF NOT EXISTS idx_deals_contact_id ON public.deals(contact_id);
CREATE INDEX IF NOT EXISTS idx_deals_organization_id ON public.deals(organization_id);
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON public.deals(created_at);

-- Grant permissions
GRANT ALL ON public.deals TO authenticated, anon;

-- Create trigger function for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS set_updated_at_deals ON public.deals;
CREATE TRIGGER set_updated_at_deals 
    BEFORE UPDATE ON public.deals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Insert sample data only if table is empty
DO $$
DECLARE
    deal_count INTEGER;
    sample_owner_id UUID := gen_random_uuid();
BEGIN
    SELECT COUNT(*) INTO deal_count FROM public.deals;
    
    IF deal_count = 0 THEN
        INSERT INTO public.deals (
            title, description, value, currency, probability, stage, status, 
            priority, tags, expected_close_date, notes, org_id, owner_id
        ) VALUES 
        (
            'Enterprise CRM Solution', 
            'Large enterprise deal for complete CRM implementation with advanced features',
            150000, 'USD', 75, 'negotiation', 'open',
            'high', ARRAY['enterprise', 'high-value'], 
            CURRENT_DATE + INTERVAL '15 days',
            'Key decision makers identified. Technical requirements approved.',
            'temp-org', sample_owner_id
        ),
        (
            'SaaS Subscription Renewal',
            'Annual subscription renewal for existing customer with upsell potential',
            50000, 'USD', 90, 'proposal', 'open',
            'medium', ARRAY['renewal', 'saas'],
            CURRENT_DATE + INTERVAL '7 days',
            'Existing customer very satisfied. Discussing additional modules.',
            'temp-org', sample_owner_id
        ),
        (
            'Small Business Package',
            'CRM package tailored for small business needs',
            15000, 'USD', 25, 'qualified', 'open',
            'low', ARRAY['small-business'],
            CURRENT_DATE + INTERVAL '30 days',
            'Initial interest shown. Demo scheduled for next week.',
            'temp-org', sample_owner_id
        ),
        (
            'Mid-Market Opportunity',
            'Growing company looking to upgrade from basic tools',
            75000, 'USD', 60, 'proposal', 'open',
            'medium', ARRAY['mid-market'],
            CURRENT_DATE + INTERVAL '20 days',
            'Proposal submitted. Competing with two other vendors.',
            'temp-org', sample_owner_id
        ),
        (
            'International Expansion',
            'Multi-national corporation expanding CRM globally',
            250000, 'USD', 45, 'qualified', 'open',
            'high', ARRAY['international', 'enterprise'],
            CURRENT_DATE + INTERVAL '45 days',
            'Complex deal with stakeholders across different regions.',
            'temp-org', sample_owner_id
        ),
        (
            'Startup Growth Package',
            'Fast-growing startup needs scalable solution',
            25000, 'USD', 80, 'negotiation', 'open',
            'medium', ARRAY['startup', 'growth'],
            CURRENT_DATE + INTERVAL '10 days',
            'Startup growing rapidly. Terms being finalized.',
            'temp-org', sample_owner_id
        ),
        (
            'Won Enterprise Deal',
            'Successfully closed large enterprise implementation',
            200000, 'USD', 100, 'won', 'won',
            'high', ARRAY['enterprise', 'closed'],
            CURRENT_DATE - INTERVAL '5 days',
            'Successfully closed after 6-month sales cycle.',
            'temp-org', sample_owner_id
        ),
        (
            'Lost Competitive Deal',
            'Lost to competitor due to pricing constraints',
            80000, 'USD', 0, 'lost', 'lost',
            'medium', ARRAY['competitive', 'lost'],
            CURRENT_DATE - INTERVAL '10 days',
            'Lost to competitor with significantly lower pricing.',
            'temp-org', sample_owner_id
        );
        
        -- Update close dates for won/lost deals
        UPDATE public.deals 
        SET actual_close_date = CURRENT_DATE - INTERVAL '5 days'
        WHERE stage = 'won';
        
        UPDATE public.deals 
        SET actual_close_date = CURRENT_DATE - INTERVAL '10 days',
            lost_reason = 'Price too high - lost to competitor'
        WHERE stage = 'lost';
    END IF;
END $$;

-- Verify the stage column exists and has proper values
DO $$
DECLARE
    stage_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO stage_count 
    FROM public.deals 
    WHERE stage IS NOT NULL AND stage != '';
    
    RAISE NOTICE 'Migration completed. % deals have stage values.', stage_count;
END $$;

-- Success message
SELECT 'Final deals migration completed successfully!' as status;
