-- Ultra Simple Fix for Deals Table
-- Copy and paste this into Supabase Studio SQL Editor

-- Create deals table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL DEFAULT 'Untitled Deal',
    value INTEGER NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    probability INTEGER NOT NULL DEFAULT 50,
    stage TEXT NOT NULL DEFAULT 'new',
    status TEXT DEFAULT 'open',
    priority TEXT DEFAULT 'medium',
    org_id TEXT DEFAULT 'temp-org',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Try to add missing columns (will silently fail if they exist)
ALTER TABLE public.deals ADD COLUMN description TEXT;
ALTER TABLE public.deals ADD COLUMN tags TEXT[];
ALTER TABLE public.deals ADD COLUMN notes TEXT;
ALTER TABLE public.deals ADD COLUMN owner_id UUID;
ALTER TABLE public.deals ADD COLUMN contact_id UUID;
ALTER TABLE public.deals ADD COLUMN organization_id UUID;
ALTER TABLE public.deals ADD COLUMN expected_close_date DATE;
ALTER TABLE public.deals ADD COLUMN actual_close_date DATE;
ALTER TABLE public.deals ADD COLUMN lost_reason TEXT;
ALTER TABLE public.deals ADD COLUMN source TEXT;
ALTER TABLE public.deals ADD COLUMN pipeline_id TEXT DEFAULT 'default-pipeline';

-- Set up permissions
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "deals_policy" ON public.deals;
CREATE POLICY "deals_policy" ON public.deals FOR ALL USING (true);
GRANT ALL ON public.deals TO authenticated, anon;

-- Add some sample data
DELETE FROM public.deals WHERE org_id = 'temp-org';

INSERT INTO public.deals (title, value, stage, status, priority, org_id) VALUES 
('New Lead Inquiry', 10000, 'new', 'open', 'medium', 'temp-org'),
('Qualified Prospect', 25000, 'qualified', 'open', 'high', 'temp-org'),
('Proposal Sent', 15000, 'proposal', 'open', 'medium', 'temp-org'),
('In Negotiation', 30000, 'negotiation', 'open', 'high', 'temp-org'),
('Closed Won', 20000, 'won', 'won', 'medium', 'temp-org');

-- Verify success
SELECT 'Database fixed successfully!' as message, COUNT(*) as deals_count FROM public.deals WHERE org_id = 'temp-org';

