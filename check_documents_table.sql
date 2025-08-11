-- Check Documents Table Structure (2025-08-07)

-- Check if documents table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'documents'
) as table_exists;

-- If table exists, show its structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'documents'
ORDER BY ordinal_position;

-- Check if there are any documents in the table
SELECT COUNT(*) as document_count FROM documents; 