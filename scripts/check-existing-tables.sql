-- Check what tables exist in the database
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check if we have any data in existing tables
SELECT 
  'deals' as table_name,
  COUNT(*) as row_count
FROM deals
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'deals')

UNION ALL

SELECT 
  'contacts' as table_name,
  COUNT(*) as row_count
FROM contacts
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contacts')

UNION ALL

SELECT 
  'companies' as table_name,
  COUNT(*) as row_count
FROM companies
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies')

UNION ALL

SELECT 
  'users' as table_name,
  COUNT(*) as row_count
FROM users
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users');

