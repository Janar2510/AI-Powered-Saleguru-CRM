-- Migration Validation Script
-- Run this BEFORE running the actual migration to check compatibility

-- Check if required tables exist
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'deals') 
    THEN '✅ deals table exists'
    ELSE '❌ deals table missing'
  END as deals_check,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contacts') 
    THEN '✅ contacts table exists'
    ELSE '❌ contacts table missing'
  END as contacts_check,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies') 
    THEN '✅ companies table exists'
    ELSE '❌ companies table missing'
  END as companies_check,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') 
    THEN '✅ users table exists'
    ELSE '❌ users table missing'
  END as users_check;

-- Check deals table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'deals' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if UUID extension is available
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') 
    THEN '✅ uuid-ossp extension enabled'
    ELSE '❌ uuid-ossp extension missing'
  END as uuid_extension_check;

-- Check auth functions
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'uid' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth')) 
    THEN '✅ auth.uid() function exists'
    ELSE '❌ auth.uid() function missing'
  END as auth_uid_check;

-- List any existing deal_* tables that might conflict
SELECT 
  table_name,
  'Already exists - will be skipped' as status
FROM information_schema.tables 
WHERE table_name LIKE 'deal_%' 
  AND table_schema = 'public';

