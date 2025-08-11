-- Document Builder System Setup for SaleToru CRM - FINAL PRODUCTION VERSION

-- Issue 1: Extension creation should specify schema explicitly
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- Create documents table with improved structure
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Create branding table with improved structure
CREATE TABLE IF NOT EXISTS branding (
  user_id UUID PRIMARY KEY,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#6366f1',
  company_name TEXT NOT NULL DEFAULT 'SaleToru CRM',
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  template_style TEXT DEFAULT 'classic' CHECK (template_style IN ('classic', 'modern', 'minimal')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create AI generations tracking table with improved structure
CREATE TABLE IF NOT EXISTS ai_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  document_type TEXT NOT NULL,
  context TEXT,
  generated_content TEXT,
  tokens_used INTEGER,
  model_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create document templates table with improved structure
CREATE TABLE IF NOT EXISTS document_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('invoice', 'proforma', 'receipt', 'quote')),
  content TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique constraint for document templates
ALTER TABLE document_templates 
ADD CONSTRAINT unique_template_per_user 
UNIQUE (user_id, name, type);

-- Add foreign key constraints to ensure referential integrity
ALTER TABLE documents ADD CONSTRAINT fk_documents_user
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE branding ADD CONSTRAINT fk_branding_user
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE ai_generations ADD CONSTRAINT fk_ai_generations_user
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE document_templates ADD CONSTRAINT fk_document_templates_user
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Missing validation for color format in branding
ALTER TABLE branding ADD CONSTRAINT check_color_format
  CHECK (primary_color ~ '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$');

-- Enable RLS on all tables
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger function with security definer and search path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER SET search_path = '';

-- Create triggers for updated_at
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_branding_updated_at BEFORE UPDATE ON branding
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_templates_updated_at BEFORE UPDATE ON document_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Issue 2: Missing index for foreign key in documents table
-- Create comprehensive indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_type_status ON documents(type, status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_user_type ON documents(user_id, type);

CREATE INDEX IF NOT EXISTS idx_ai_generations_user_id ON ai_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_document_type ON ai_generations(document_type);
CREATE INDEX IF NOT EXISTS idx_ai_generations_created_at ON ai_generations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_document_templates_user_id ON document_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_document_templates_type ON document_templates(type);
CREATE INDEX IF NOT EXISTS idx_document_templates_is_default ON document_templates(is_default) WHERE is_default = TRUE;

-- RLS Policy Syntax: Use (auth.uid()) for consistency and clarity
CREATE POLICY "Users can view their own documents" ON documents
  FOR SELECT USING (user_id = (auth.uid()));

CREATE POLICY "Users can insert their own documents" ON documents
  FOR INSERT WITH CHECK (user_id = (auth.uid()));

CREATE POLICY "Users can update their own documents" ON documents
  FOR UPDATE USING (user_id = (auth.uid()));

CREATE POLICY "Users can delete their own documents" ON documents
  FOR DELETE USING (user_id = (auth.uid()));

-- Create RLS policies for branding with proper auth.uid() usage
CREATE POLICY "Users can view their own branding" ON branding
  FOR SELECT USING (user_id = (auth.uid()));

CREATE POLICY "Users can insert their own branding" ON branding
  FOR INSERT WITH CHECK (user_id = (auth.uid()));

CREATE POLICY "Users can update their own branding" ON branding
  FOR UPDATE USING (user_id = (auth.uid()));

CREATE POLICY "Users can delete their own branding" ON branding
  FOR DELETE USING (user_id = (auth.uid()));

-- Create RLS policies for AI generations with proper auth.uid() usage
CREATE POLICY "Users can view their own AI generations" ON ai_generations
  FOR SELECT USING (user_id = (auth.uid()));

CREATE POLICY "Users can insert their own AI generations" ON ai_generations
  FOR INSERT WITH CHECK (user_id = (auth.uid()));

-- Create RLS policies for document templates with proper auth.uid() usage
CREATE POLICY "Users can view their own templates" ON document_templates
  FOR SELECT USING ((user_id = (auth.uid())) OR user_id IS NULL);

CREATE POLICY "Users can insert their own templates" ON document_templates
  FOR INSERT WITH CHECK (user_id = (auth.uid()));

CREATE POLICY "Users can update their own templates" ON document_templates
  FOR UPDATE USING (user_id = (auth.uid()));

CREATE POLICY "Users can delete their own templates" ON document_templates
  FOR DELETE USING (user_id = (auth.uid()));

-- Issue 3: Alternative approach for user branding creation
-- Instead of a trigger on auth.users, create a function that can be called during user registration
CREATE OR REPLACE FUNCTION create_user_branding(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO branding (user_id, company_name)
    VALUES (user_uuid, 'SaleToru CRM')
    ON CONFLICT (user_id) DO NOTHING;
END;
$$ language 'plpgsql' SECURITY DEFINER SET search_path = '';

-- Insert default templates (with NULL user_id for system defaults)
INSERT INTO document_templates (user_id, name, type, content, is_default) VALUES
  (NULL, 'Classic Invoice', 'invoice', '<h1>INVOICE</h1><p>Professional invoice template</p>', TRUE),
  (NULL, 'Pro Forma Invoice', 'proforma', '<h1>PRO FORMA INVOICE</h1><p>Professional pro forma template</p>', TRUE),
  (NULL, 'Receipt', 'receipt', '<h1>RECEIPT</h1><p>Professional receipt template</p>', TRUE),
  (NULL, 'Quote', 'quote', '<h1>QUOTE</h1><p>Professional quote template</p>', TRUE)
ON CONFLICT (user_id, name, type) DO NOTHING;

-- Create storage bucket for branding (logos)
INSERT INTO storage.buckets (id, name, public) VALUES ('branding', 'branding', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own logos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view logos in public bucket" ON storage.objects;

-- Issue 4: Storage policies should specify roles explicitly and use proper auth.uid() syntax
CREATE POLICY "Users can upload their own logos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'branding' AND 
    path_tokens[1] = (auth.uid())::text
  );

CREATE POLICY "Users can view their own logos" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'branding' AND 
    path_tokens[1] = (auth.uid())::text
  );

CREATE POLICY "Users can update their own logos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'branding' AND 
    path_tokens[1] = (auth.uid())::text
  );

CREATE POLICY "Users can delete their own logos" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'branding' AND 
    path_tokens[1] = (auth.uid())::text
  );

-- Add policy for public access to logos if bucket is public
CREATE POLICY "Public can view logos in public bucket" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'branding' AND auth.role() = 'anon');

-- Success message
SELECT 'Document Builder System setup completed successfully!' as status; 