-- Test Database Tables
-- Run this to see what's actually in your database

-- Check if tables exist
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('documents', 'branding', 'ai_generations', 'document_templates')
ORDER BY tablename;

-- Check table structure if they exist
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('documents', 'branding', 'ai_generations', 'document_templates')
ORDER BY table_name, ordinal_position;

-- Check if extension exists
SELECT extname, extversion FROM pg_extension WHERE extname = 'uuid-ossp';

-- Check current user and schema
SELECT current_user, current_schema(); 