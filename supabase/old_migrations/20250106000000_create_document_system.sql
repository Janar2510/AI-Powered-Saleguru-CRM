-- Create documents table
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

-- Create branding table
CREATE TABLE IF NOT EXISTS branding (
  user_id UUID PRIMARY KEY,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#6366f1',
  company_name TEXT DEFAULT 'SaleToru CRM',
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  template_style TEXT DEFAULT 'classic' CHECK (template_style IN ('classic', 'modern', 'minimal')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create AI generations tracking table
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

-- Create document templates table
CREATE TABLE IF NOT EXISTS document_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('invoice', 'proforma', 'receipt', 'quote')),
  content TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;

-- Documents policies
CREATE POLICY "Users can view their own documents" ON documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents" ON documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" ON documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" ON documents
  FOR DELETE USING (auth.uid() = user_id);

-- Branding policies
CREATE POLICY "Users can view their own branding" ON branding
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own branding" ON branding
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own branding" ON branding
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own branding" ON branding
  FOR DELETE USING (auth.uid() = user_id);

-- AI generations policies
CREATE POLICY "Users can view their own AI generations" ON ai_generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI generations" ON ai_generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Document templates policies
CREATE POLICY "Users can view their own templates" ON document_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own templates" ON document_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" ON document_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" ON document_templates
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);

CREATE INDEX IF NOT EXISTS idx_ai_generations_user_id ON ai_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_document_type ON ai_generations(document_type);
CREATE INDEX IF NOT EXISTS idx_ai_generations_created_at ON ai_generations(created_at);

CREATE INDEX IF NOT EXISTS idx_document_templates_user_id ON document_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_document_templates_type ON document_templates(type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_branding_updated_at BEFORE UPDATE ON branding
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_templates_updated_at BEFORE UPDATE ON document_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default templates
INSERT INTO document_templates (user_id, name, type, content, is_default) VALUES
  (NULL, 'Classic Invoice', 'invoice', '<h1>INVOICE</h1><p>Professional invoice template</p>', TRUE),
  (NULL, 'Pro Forma Invoice', 'proforma', '<h1>PRO FORMA INVOICE</h1><p>Professional pro forma template</p>', TRUE),
  (NULL, 'Receipt', 'receipt', '<h1>RECEIPT</h1><p>Professional receipt template</p>', TRUE),
  (NULL, 'Quote', 'quote', '<h1>QUOTE</h1><p>Professional quote template</p>', TRUE)
ON CONFLICT DO NOTHING; 