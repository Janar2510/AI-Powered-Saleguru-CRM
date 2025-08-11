-- Create Single Table Test
-- This will create just the documents table to test

-- Drop if exists
DROP TABLE IF EXISTS documents CASCADE;

-- Create extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- Create documents table only
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('invoice', 'proforma', 'receipt', 'quote')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  format TEXT DEFAULT 'html' CHECK (format IN ('html', 'pdf', 'docx')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create one index
CREATE INDEX idx_documents_user_id ON documents(user_id);

-- Create one policy
CREATE POLICY "Users can view their own documents" ON documents
  FOR SELECT USING (user_id = (auth.uid()));

-- Test insert
INSERT INTO documents (user_id, type, title, content) VALUES 
  ('00000000-0000-0000-0000-000000000000', 'invoice', 'Test Invoice', '<h1>Test</h1>');

-- Check if it worked
SELECT COUNT(*) as document_count FROM documents;

-- Success message
SELECT 'Single table test completed successfully!' as status; 