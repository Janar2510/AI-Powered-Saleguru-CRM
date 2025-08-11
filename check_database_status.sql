-- Check Database Status
-- Run this to see what's currently in your database

-- Check if tables exist
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('documents', 'branding', 'ai_generations', 'document_templates')
ORDER BY table_name;

-- Check table structure if they exist
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('documents', 'branding', 'ai_generations', 'document_templates')
ORDER BY table_name, ordinal_position;

-- Check if extension exists
SELECT extname FROM pg_extension WHERE extname = 'uuid-ossp';

-- Check current user
SELECT current_user, session_user; 