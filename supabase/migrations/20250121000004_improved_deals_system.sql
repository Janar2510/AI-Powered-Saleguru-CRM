-- Improved Deals System Migration
-- Updates deals table for better functionality and adds missing columns

-- Update deals table structure
DO $$
BEGIN
    -- Add missing columns if they don't exist
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
    
    -- Ensure stage column exists and is properly typed
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'stage') THEN
        ALTER TABLE public.deals ADD COLUMN stage TEXT DEFAULT 'new';
    END IF;
END $$;

-- Update existing deals to have proper stage values if they don't
UPDATE public.deals 
SET stage = CASE 
    WHEN stage_id IS NOT NULL THEN stage_id
    ELSE 'new'
END
WHERE stage IS NULL OR stage = '';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_deals_stage ON public.deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_priority ON public.deals(priority);
CREATE INDEX IF NOT EXISTS idx_deals_tags ON public.deals USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_deals_org_id ON public.deals(org_id);
CREATE INDEX IF NOT EXISTS idx_deals_value ON public.deals(value);

-- Grant permissions
GRANT ALL ON public.deals TO authenticated, anon;

-- Insert sample deals for testing if table is empty
DO $$
DECLARE
    deal_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO deal_count FROM public.deals;
    
    IF deal_count = 0 THEN
        INSERT INTO public.deals (
            id, title, description, value, currency, probability, stage, status, 
            priority, tags, expected_close_date, notes, org_id, owner_id, created_at, updated_at
        ) VALUES 
        (
            gen_random_uuid(), 'Enterprise CRM Solution', 
            'Large enterprise deal for complete CRM implementation with advanced features and custom integrations',
            150000, 'USD', 75, 'negotiation', 'open',
            'high', ARRAY['enterprise', 'high-value', 'priority'], 
            CURRENT_DATE + INTERVAL '15 days',
            'Key decision makers identified. Technical requirements approved. Waiting for final budget approval.',
            'temp-org', gen_random_uuid(),
            CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP
        ),
        (
            gen_random_uuid(), 'SaaS Subscription Renewal',
            'Annual subscription renewal for existing customer with potential upsell opportunities',
            50000, 'USD', 90, 'proposal', 'open',
            'medium', ARRAY['renewal', 'saas', 'upsell'],
            CURRENT_DATE + INTERVAL '7 days',
            'Existing customer very satisfied. Discussing additional modules and user licenses.',
            'temp-org', gen_random_uuid(),
            CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP
        ),
        (
            gen_random_uuid(), 'Small Business Package',
            'CRM package tailored for small business needs with basic automation',
            15000, 'USD', 25, 'qualified', 'open',
            'low', ARRAY['small-business', 'starter'],
            CURRENT_DATE + INTERVAL '30 days',
            'Initial interest shown. Need to schedule product demo and discuss pricing options.',
            'temp-org', gen_random_uuid(),
            CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP
        ),
        (
            gen_random_uuid(), 'Mid-Market Opportunity',
            'Growing company looking to upgrade from basic tools to comprehensive CRM solution',
            75000, 'USD', 60, 'proposal', 'open',
            'medium', ARRAY['mid-market', 'upgrade'],
            CURRENT_DATE + INTERVAL '20 days',
            'Proposal submitted. Competing with two other vendors. Price is competitive.',
            'temp-org', gen_random_uuid(),
            CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP
        ),
        (
            gen_random_uuid(), 'International Expansion Deal',
            'Multi-national corporation expanding CRM to international offices',
            250000, 'USD', 45, 'qualified', 'open',
            'high', ARRAY['international', 'enterprise', 'expansion'],
            CURRENT_DATE + INTERVAL '45 days',
            'Complex deal with multiple stakeholders across different regions. Legal review in progress.',
            'temp-org', gen_random_uuid(),
            CURRENT_TIMESTAMP - INTERVAL '15 days', CURRENT_TIMESTAMP
        ),
        (
            gen_random_uuid(), 'Startup Growth Package',
            'Fast-growing startup needs scalable CRM solution',
            25000, 'USD', 80, 'negotiation', 'open',
            'medium', ARRAY['startup', 'growth', 'scalable'],
            CURRENT_DATE + INTERVAL '10 days',
            'Startup is growing rapidly. They need solution that can scale with them. Terms being finalized.',
            'temp-org', gen_random_uuid(),
            CURRENT_TIMESTAMP - INTERVAL '6 days', CURRENT_TIMESTAMP
        )
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;

-- Create trigger for automatic timestamp updates if it doesn't exist
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

-- Success message
SELECT 'Improved deals system setup completed successfully!' as status;
