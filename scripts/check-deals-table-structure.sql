-- Check the actual structure of the deals table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'deals' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Also check if the table exists and has any data
SELECT 
  'deals table info' as info,
  COUNT(*) as existing_rows
FROM deals;

