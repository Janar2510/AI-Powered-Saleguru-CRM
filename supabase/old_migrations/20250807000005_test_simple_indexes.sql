-- Test Simple Indexes (2025-08-07)
-- This tests if we can create indexes on the existing tables

-- Test creating a simple index first
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);

-- Success message
SELECT 'Simple index test completed!' as status; 