-- Test RLS Policies (2025-08-07)
-- This tests RLS policies one by one to identify the issue

-- ===========================================
-- ENABLE RLS ON TABLES
-- ===========================================

-- Enable RLS on customers table first
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Test a single RLS policy
CREATE POLICY "Users can view their own customers" ON customers FOR SELECT USING (user_id = auth.uid());

-- Success message
SELECT 'RLS test completed!' as status; 