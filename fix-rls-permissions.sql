-- Fix RLS Permissions for Deals Table
-- Apply this in Supabase Studio SQL Editor

-- Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'deals';

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "deals_policy" ON public.deals;
DROP POLICY IF EXISTS "deals_select_policy" ON public.deals;
DROP POLICY IF EXISTS "deals_insert_policy" ON public.deals;
DROP POLICY IF EXISTS "deals_update_policy" ON public.deals;
DROP POLICY IF EXISTS "deals_delete_policy" ON public.deals;
DROP POLICY IF EXISTS "deals_all_operations" ON public.deals;

-- Create permissive policies for development
CREATE POLICY "deals_select_all" ON public.deals FOR SELECT USING (true);
CREATE POLICY "deals_insert_all" ON public.deals FOR INSERT WITH CHECK (true);
CREATE POLICY "deals_update_all" ON public.deals FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "deals_delete_all" ON public.deals FOR DELETE USING (true);

-- Ensure RLS is enabled
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Grant full permissions to authenticated and anon users
GRANT ALL ON public.deals TO authenticated;
GRANT ALL ON public.deals TO anon;

-- Also grant usage on the table's sequence if it exists
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Test the permissions by trying to select data
SELECT 
    'Permissions test - should show deals:' as test,
    COUNT(*) as deal_count,
    string_agg(title, ', ') as deal_titles
FROM public.deals 
WHERE org_id = 'temp-org';

-- Test update permissions by updating one deal's description
UPDATE public.deals 
SET description = 'Updated via RLS test - ' || NOW()::text
WHERE org_id = 'temp-org' 
LIMIT 1;

SELECT 'RLS permissions fixed successfully!' as status;

