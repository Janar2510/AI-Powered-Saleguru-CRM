-- Fix documents table schema
-- Drop existing documents table if it exists
DROP TABLE IF EXISTS documents CASCADE;

-- Create proper documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  type TEXT NOT NULL DEFAULT 'document',
  format TEXT DEFAULT 'html',
  template_id TEXT REFERENCES doc_templates(id),
  branding_id UUID REFERENCES branding(user_id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'documents' AND policyname = 'Users can view their own documents') THEN
        CREATE POLICY "Users can view their own documents" ON documents
          FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'documents' AND policyname = 'Users can insert their own documents') THEN
        CREATE POLICY "Users can insert their own documents" ON documents
          FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'documents' AND policyname = 'Users can update their own documents') THEN
        CREATE POLICY "Users can update their own documents" ON documents
          FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'documents' AND policyname = 'Users can delete their own documents') THEN
        CREATE POLICY "Users can delete their own documents" ON documents
          FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);

-- Insert sample documents for testing
DO $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Get the current user ID from auth.users
    SELECT id INTO current_user_id FROM auth.users LIMIT 1;
    
    -- If no user exists, create a sample user
    IF current_user_id IS NULL THEN
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at) VALUES
          (gen_random_uuid(), 'sample@example.com', crypt('password', gen_salt('bf')), NOW(), NOW(), NOW())
        RETURNING id INTO current_user_id;
    END IF;
    
    -- Insert sample documents
    IF NOT EXISTS (SELECT 1 FROM documents WHERE user_id = current_user_id) THEN
        INSERT INTO documents (user_id, title, content, type, format) VALUES
          (current_user_id, 'Sample Invoice', '<h1>Sample Invoice</h1><p>This is a sample invoice document.</p>', 'invoice', 'html'),
          (current_user_id, 'Sample Quotation', '<h1>Sample Quotation</h1><p>This is a sample quotation document.</p>', 'quotation', 'html'),
          (current_user_id, 'Sample Receipt', '<h1>Sample Receipt</h1><p>This is a sample receipt document.</p>', 'receipt', 'html');
    END IF;
END $$;
