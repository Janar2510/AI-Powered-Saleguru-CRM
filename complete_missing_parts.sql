-- Complete Missing Parts Only
-- This script only adds what's missing without recreating existing items

-- Step 1: Create extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- Step 2: Create tables only if they don't exist
CREATE TABLE IF NOT EXISTS documents (
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

CREATE TABLE IF NOT EXISTS branding (
  user_id UUID PRIMARY KEY,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#a259ff',
  company_name TEXT NOT NULL DEFAULT 'SaleToru CRM',
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  template_style TEXT DEFAULT 'classic' CHECK (template_style IN ('classic', 'modern', 'minimal')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_generations (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID NOT NULL,
  document_type TEXT NOT NULL,
  context TEXT,
  generated_content TEXT,
  tokens_used INTEGER,
  model_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS document_templates (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('invoice', 'proforma', 'receipt', 'quote')),
  content TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Enable RLS if not already enabled
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;

-- Step 4: Create indexes only if they don't exist
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_type_status ON documents(type, status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_generations_user_id ON ai_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_document_type ON ai_generations(document_type);

CREATE INDEX IF NOT EXISTS idx_document_templates_user_id ON document_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_document_templates_type ON document_templates(type);

-- Step 5: Create RLS policies only if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own documents' AND tablename = 'documents') THEN
        CREATE POLICY "Users can view their own documents" ON documents
          FOR SELECT USING (user_id = (auth.uid()));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own documents' AND tablename = 'documents') THEN
        CREATE POLICY "Users can insert their own documents" ON documents
          FOR INSERT WITH CHECK (user_id = (auth.uid()));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own documents' AND tablename = 'documents') THEN
        CREATE POLICY "Users can update their own documents" ON documents
          FOR UPDATE USING (user_id = (auth.uid()));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own documents' AND tablename = 'documents') THEN
        CREATE POLICY "Users can delete their own documents" ON documents
          FOR DELETE USING (user_id = (auth.uid()));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own branding' AND tablename = 'branding') THEN
        CREATE POLICY "Users can view their own branding" ON branding
          FOR SELECT USING (user_id = (auth.uid()));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own branding' AND tablename = 'branding') THEN
        CREATE POLICY "Users can insert their own branding" ON branding
          FOR INSERT WITH CHECK (user_id = (auth.uid()));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own branding' AND tablename = 'branding') THEN
        CREATE POLICY "Users can update their own branding" ON branding
          FOR UPDATE USING (user_id = (auth.uid()));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own branding' AND tablename = 'branding') THEN
        CREATE POLICY "Users can delete their own branding" ON branding
          FOR DELETE USING (user_id = (auth.uid()));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own AI generations' AND tablename = 'ai_generations') THEN
        CREATE POLICY "Users can view their own AI generations" ON ai_generations
          FOR SELECT USING (user_id = (auth.uid()));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own AI generations' AND tablename = 'ai_generations') THEN
        CREATE POLICY "Users can insert their own AI generations" ON ai_generations
          FOR INSERT WITH CHECK (user_id = (auth.uid()));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own templates' AND tablename = 'document_templates') THEN
        CREATE POLICY "Users can view their own templates" ON document_templates
          FOR SELECT USING ((user_id = (auth.uid())) OR user_id IS NULL);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own templates' AND tablename = 'document_templates') THEN
        CREATE POLICY "Users can insert their own templates" ON document_templates
          FOR INSERT WITH CHECK (user_id = (auth.uid()));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own templates' AND tablename = 'document_templates') THEN
        CREATE POLICY "Users can update their own templates" ON document_templates
          FOR UPDATE USING (user_id = (auth.uid()));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own templates' AND tablename = 'document_templates') THEN
        CREATE POLICY "Users can delete their own templates" ON document_templates
          FOR DELETE USING (user_id = (auth.uid()));
    END IF;
END $$;

-- Step 6: Insert default templates only if they don't exist
INSERT INTO document_templates (user_id, name, type, content, is_default) VALUES
  (NULL, 'Classic Invoice', 'invoice', '<h1>INVOICE</h1><p>Professional invoice template</p>', TRUE),
  (NULL, 'Pro Forma Invoice', 'proforma', '<h1>PRO FORMA INVOICE</h1><p>Professional pro forma template</p>', TRUE),
  (NULL, 'Receipt', 'receipt', '<h1>RECEIPT</h1><p>Professional receipt template</p>', TRUE),
  (NULL, 'Quote', 'quote', '<h1>QUOTE</h1><p>Professional quote template</p>', TRUE)
ON CONFLICT DO NOTHING;

-- Step 7: Create storage bucket if not exists
INSERT INTO storage.buckets (id, name, public) VALUES ('branding', 'branding', true)
ON CONFLICT (id) DO NOTHING;

-- Step 8: Create storage policies only if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload their own logos' AND tablename = 'objects') THEN
        CREATE POLICY "Users can upload their own logos" ON storage.objects
          FOR INSERT TO authenticated
          WITH CHECK (
            bucket_id = 'branding' AND 
            path_tokens[1] = (auth.uid())::text
          );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own logos' AND tablename = 'objects') THEN
        CREATE POLICY "Users can view their own logos" ON storage.objects
          FOR SELECT TO authenticated
          USING (
            bucket_id = 'branding' AND 
            path_tokens[1] = (auth.uid())::text
          );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own logos' AND tablename = 'objects') THEN
        CREATE POLICY "Users can update their own logos" ON storage.objects
          FOR UPDATE TO authenticated
          USING (
            bucket_id = 'branding' AND 
            path_tokens[1] = (auth.uid())::text
          );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own logos' AND tablename = 'objects') THEN
        CREATE POLICY "Users can delete their own logos" ON storage.objects
          FOR DELETE TO authenticated
          USING (
            bucket_id = 'branding' AND 
            path_tokens[1] = (auth.uid())::text
          );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view logos in public bucket' AND tablename = 'objects') THEN
        CREATE POLICY "Public can view logos in public bucket" ON storage.objects
          FOR SELECT TO public
          USING (bucket_id = 'branding');
    END IF;
END $$;

-- Success message
SELECT 'Missing parts completed successfully!' as status; 