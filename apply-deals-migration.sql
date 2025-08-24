-- Manual Improved Deals System Migration
-- Apply this in Supabase Studio SQL Editor

-- Ensure deals table exists with basic structure
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    value INTEGER NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    probability INTEGER NOT NULL DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost')),
    stage TEXT NOT NULL DEFAULT 'new',
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

-- Add missing columns if they don't exist
DO $$
BEGIN
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
    
    -- Add pipeline_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'pipeline_id') THEN
        ALTER TABLE public.deals ADD COLUMN pipeline_id TEXT DEFAULT 'default-pipeline';
    END IF;
    
    -- Add stage_id column if it doesn't exist (for backward compatibility)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'stage_id') THEN
        ALTER TABLE public.deals ADD COLUMN stage_id TEXT;
    END IF;
END $$;

-- Update existing deals to have proper stage values
UPDATE public.deals 
SET stage = CASE 
    WHEN stage_id IS NOT NULL AND stage_id != '' AND stage_id !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN stage_id
    WHEN stage IS NULL OR stage = '' THEN 'new'
    ELSE COALESCE(stage, 'new')
END
WHERE stage IS NULL OR stage = '' OR (stage_id IS NOT NULL AND stage_id !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$');

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

-- Insert sample deals for testing (only if table is empty)
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
            'Large enterprise deal for complete CRM implementation with advanced features and custom integrations',
            150000, 'USD', 75, 'negotiation', 'open',
            'high', ARRAY['enterprise', 'high-value', 'priority'], 
            CURRENT_DATE + INTERVAL '15 days',
            'Key decision makers identified. Technical requirements approved. Waiting for final budget approval.',
            'temp-org', sample_owner_id
        ),
        (
            'SaaS Subscription Renewal',
            'Annual subscription renewal for existing customer with potential upsell opportunities',
            50000, 'USD', 90, 'proposal', 'open',
            'medium', ARRAY['renewal', 'saas', 'upsell'],
            CURRENT_DATE + INTERVAL '7 days',
            'Existing customer very satisfied. Discussing additional modules and user licenses.',
            'temp-org', sample_owner_id
        ),
        (
            'Small Business Package',
            'CRM package tailored for small business needs with basic automation',
            15000, 'USD', 25, 'qualified', 'open',
            'low', ARRAY['small-business', 'starter'],
            CURRENT_DATE + INTERVAL '30 days',
            'Initial interest shown. Need to schedule product demo and discuss pricing options.',
            'temp-org', sample_owner_id
        ),
        (
            'Mid-Market Opportunity',
            'Growing company looking to upgrade from basic tools to comprehensive CRM solution',
            75000, 'USD', 60, 'proposal', 'open',
            'medium', ARRAY['mid-market', 'upgrade'],
            CURRENT_DATE + INTERVAL '20 days',
            'Proposal submitted. Competing with two other vendors. Price is competitive.',
            'temp-org', sample_owner_id
        ),
        (
            'International Expansion Deal',
            'Multi-national corporation expanding CRM to international offices',
            250000, 'USD', 45, 'qualified', 'open',
            'high', ARRAY['international', 'enterprise', 'expansion'],
            CURRENT_DATE + INTERVAL '45 days',
            'Complex deal with multiple stakeholders across different regions. Legal review in progress.',
            'temp-org', sample_owner_id
        ),
        (
            'Startup Growth Package',
            'Fast-growing startup needs scalable CRM solution',
            25000, 'USD', 80, 'negotiation', 'open',
            'medium', ARRAY['startup', 'growth', 'scalable'],
            CURRENT_DATE + INTERVAL '10 days',
            'Startup is growing rapidly. They need solution that can scale with them. Terms being finalized.',
            'temp-org', sample_owner_id
        ),
        (
            'Healthcare Compliance Solution',
            'Healthcare organization needs HIPAA-compliant CRM solution',
            120000, 'USD', 40, 'new', 'open',
            'high', ARRAY['healthcare', 'compliance', 'hipaa'],
            CURRENT_DATE + INTERVAL '60 days',
            'Initial requirements gathering. Complex compliance requirements need detailed analysis.',
            'temp-org', sample_owner_id
        ),
        (
            'Won Enterprise Deal',
            'Successfully closed large enterprise implementation',
            200000, 'USD', 100, 'won', 'won',
            'high', ARRAY['enterprise', 'closed', 'success'],
            CURRENT_DATE - INTERVAL '5 days',
            'Successfully closed after 6-month sales cycle. Implementation starting next month.',
            'temp-org', sample_owner_id
        ),
        (
            'Lost Competitive Deal',
            'Lost to competitor due to pricing',
            80000, 'USD', 0, 'lost', 'lost',
            'medium', ARRAY['competitive', 'lost', 'pricing'],
            CURRENT_DATE - INTERVAL '10 days',
            'Lost to competitor with significantly lower pricing. Customer prioritized cost over features.',
            'temp-org', sample_owner_id
        )
        ON CONFLICT DO NOTHING;
        
        -- Update actual close dates for won/lost deals
        UPDATE public.deals 
        SET actual_close_date = CURRENT_DATE - INTERVAL '5 days',
            lost_reason = NULL
        WHERE stage = 'won';
        
        UPDATE public.deals 
        SET actual_close_date = CURRENT_DATE - INTERVAL '10 days',
            lost_reason = 'Price too high - lost to competitor'
        WHERE stage = 'lost';
    END IF;
END $$;

-- Success message
SELECT 'Improved deals system migration completed successfully!' as status;
