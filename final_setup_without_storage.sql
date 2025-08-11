-- Final Setup Without Storage Policies
-- This creates everything except storage policies (which already exist)

-- Step 1: Create extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- Step 2: Create documents table
DROP TABLE IF EXISTS documents CASCADE;
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
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_type_status ON documents(type, status);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);

-- Step 3: Create branding table
DROP TABLE IF EXISTS branding CASCADE;
CREATE TABLE branding (
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
ALTER TABLE branding ENABLE ROW LEVEL SECURITY;

-- Step 4: Create AI generations table
DROP TABLE IF EXISTS ai_generations CASCADE;
CREATE TABLE ai_generations (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID NOT NULL,
  document_type TEXT NOT NULL,
  context TEXT,
  generated_content TEXT,
  tokens_used INTEGER,
  model_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_ai_generations_user_id ON ai_generations(user_id);
CREATE INDEX idx_ai_generations_document_type ON ai_generations(document_type);

-- Step 5: Create document templates table
DROP TABLE IF EXISTS document_templates CASCADE;
CREATE TABLE document_templates (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('invoice', 'proforma', 'receipt', 'quote')),
  content TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_document_templates_user_id ON document_templates(user_id);
CREATE INDEX idx_document_templates_type ON document_templates(type);

-- Step 6: Create RLS policies
CREATE POLICY "Users can view their own documents" ON documents
  FOR SELECT USING (user_id = (auth.uid()));

CREATE POLICY "Users can insert their own documents" ON documents
  FOR INSERT WITH CHECK (user_id = (auth.uid()));

CREATE POLICY "Users can update their own documents" ON documents
  FOR UPDATE USING (user_id = (auth.uid()));

CREATE POLICY "Users can delete their own documents" ON documents
  FOR DELETE USING (user_id = (auth.uid()));

CREATE POLICY "Users can view their own branding" ON branding
  FOR SELECT USING (user_id = (auth.uid()));

CREATE POLICY "Users can insert their own branding" ON branding
  FOR INSERT WITH CHECK (user_id = (auth.uid()));

CREATE POLICY "Users can update their own branding" ON branding
  FOR UPDATE USING (user_id = (auth.uid()));

CREATE POLICY "Users can delete their own branding" ON branding
  FOR DELETE USING (user_id = (auth.uid()));

CREATE POLICY "Users can view their own AI generations" ON ai_generations
  FOR SELECT USING (user_id = (auth.uid()));

CREATE POLICY "Users can insert their own AI generations" ON ai_generations
  FOR INSERT WITH CHECK (user_id = (auth.uid()));

CREATE POLICY "Users can view their own templates" ON document_templates
  FOR SELECT USING ((user_id = (auth.uid())) OR user_id IS NULL);

CREATE POLICY "Users can insert their own templates" ON document_templates
  FOR INSERT WITH CHECK (user_id = (auth.uid()));

CREATE POLICY "Users can update their own templates" ON document_templates
  FOR UPDATE USING (user_id = (auth.uid()));

CREATE POLICY "Users can delete their own templates" ON document_templates
  FOR DELETE USING (user_id = (auth.uid()));

-- Step 7: Insert default templates
INSERT INTO document_templates (user_id, name, type, content, is_default) VALUES
  (NULL, 'Classic Invoice', 'invoice', '<h1>INVOICE</h1><p>Professional invoice template</p>', TRUE),
  (NULL, 'Pro Forma Invoice', 'proforma', '<h1>PRO FORMA INVOICE</h1><p>Professional pro forma template</p>', TRUE),
  (NULL, 'Receipt', 'receipt', '<h1>RECEIPT</h1><p>Professional receipt template</p>', TRUE),
  (NULL, 'Quote', 'quote', '<h1>QUOTE</h1><p>Professional quote template</p>', TRUE);

-- Step 8: Create storage bucket (if not exists)
INSERT INTO storage.buckets (id, name, public) VALUES ('branding', 'branding', true)
ON CONFLICT (id) DO NOTHING;

-- Success message
SELECT 'Document system setup completed successfully! All tables, indexes, and policies created.' as final_status; 