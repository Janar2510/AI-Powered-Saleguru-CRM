-- Simple Deals Table Fix
-- Apply this in Supabase Studio SQL Editor

-- Create the deals table with all required columns
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL DEFAULT 'Untitled Deal',
    description TEXT,
    value INTEGER NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    probability INTEGER NOT NULL DEFAULT 50,
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

-- Add status column if it doesn't exist
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open';

-- Add stage column if it doesn't exist  
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'new';

-- Add description column if it doesn't exist
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS description TEXT;

-- Add priority column if it doesn't exist
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';

-- Add tags column if it doesn't exist
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add notes column if it doesn't exist
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add org_id column if it doesn't exist
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS org_id TEXT DEFAULT 'temp-org';

-- Add pipeline_id column if it doesn't exist
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS pipeline_id TEXT DEFAULT 'default-pipeline';

-- Fix any NULL values
UPDATE public.deals SET status = 'open' WHERE status IS NULL;
UPDATE public.deals SET stage = 'new' WHERE stage IS NULL;
UPDATE public.deals SET priority = 'medium' WHERE priority IS NULL;
UPDATE public.deals SET org_id = 'temp-org' WHERE org_id IS NULL;

-- Enable RLS
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Simple RLS policy
DROP POLICY IF EXISTS "deals_all_operations" ON public.deals;
CREATE POLICY "deals_all_operations" ON public.deals FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON public.deals TO authenticated, anon;

-- Insert sample data if empty
INSERT INTO public.deals (title, description, value, stage, status, priority, org_id) 
SELECT 'Sample Deal 1', 'First sample deal', 10000, 'new', 'open', 'medium', 'temp-org'
WHERE NOT EXISTS (SELECT 1 FROM public.deals WHERE org_id = 'temp-org' LIMIT 1);

INSERT INTO public.deals (title, description, value, stage, status, priority, org_id) 
SELECT 'Sample Deal 2', 'Second sample deal', 25000, 'qualified', 'open', 'high', 'temp-org'
WHERE NOT EXISTS (SELECT 1 FROM public.deals WHERE title = 'Sample Deal 2');

INSERT INTO public.deals (title, description, value, stage, status, priority, org_id) 
SELECT 'Sample Deal 3', 'Third sample deal', 15000, 'proposal', 'open', 'medium', 'temp-org'
WHERE NOT EXISTS (SELECT 1 FROM public.deals WHERE title = 'Sample Deal 3');

INSERT INTO public.deals (title, description, value, stage, status, priority, org_id) 
SELECT 'Sample Deal 4', 'Fourth sample deal', 30000, 'negotiation', 'open', 'high', 'temp-org'
WHERE NOT EXISTS (SELECT 1 FROM public.deals WHERE title = 'Sample Deal 4');

INSERT INTO public.deals (title, description, value, stage, status, priority, org_id) 
SELECT 'Sample Deal 5', 'Won deal example', 20000, 'won', 'won', 'medium', 'temp-org'
WHERE NOT EXISTS (SELECT 1 FROM public.deals WHERE title = 'Sample Deal 5');

-- Show success
SELECT 'Success! Deals table is ready' as status, COUNT(*) as total_deals FROM public.deals WHERE org_id = 'temp-org';
