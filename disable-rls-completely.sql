-- Completely Disable RLS for Development
-- Apply this in Supabase Studio SQL Editor

-- Disable Row Level Security entirely for the deals table
ALTER TABLE public.deals DISABLE ROW LEVEL SECURITY;

-- Remove ALL existing policies
DROP POLICY IF EXISTS "deals_all" ON public.deals;
DROP POLICY IF EXISTS "deals_select_all" ON public.deals;
DROP POLICY IF EXISTS "deals_insert_all" ON public.deals;
DROP POLICY IF EXISTS "deals_update_all" ON public.deals;
DROP POLICY IF EXISTS "deals_delete_all" ON public.deals;
DROP POLICY IF EXISTS "deals_policy" ON public.deals;

-- Grant full permissions
GRANT ALL PRIVILEGES ON public.deals TO authenticated;
GRANT ALL PRIVILEGES ON public.deals TO anon;
GRANT ALL PRIVILEGES ON public.deals TO postgres;
GRANT ALL PRIVILEGES ON public.deals TO public;

-- Test that we can update a deal
UPDATE public.deals 
SET stage = 'qualified' 
WHERE org_id = 'temp-org' 
AND stage = 'new';

-- Verify the update worked
SELECT 
    'RLS completely disabled - update test:' as test,
    COUNT(*) as total_deals,
    COUNT(CASE WHEN stage = 'qualified' THEN 1 END) as qualified_deals
FROM public.deals 
WHERE org_id = 'temp-org';

SELECT 'Success! RLS disabled and permissions granted.' as status;

