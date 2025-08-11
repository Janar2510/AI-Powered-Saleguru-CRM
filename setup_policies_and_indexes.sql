-- Setup Policies and Indexes - Step 2
-- Run this AFTER the tables are created

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_type_status ON documents(type, status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_generations_user_id ON ai_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_document_type ON ai_generations(document_type);

CREATE INDEX IF NOT EXISTS idx_document_templates_user_id ON document_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_document_templates_type ON document_templates(type);

-- Create RLS policies
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

-- Insert default templates
INSERT INTO document_templates (user_id, name, type, content, is_default) VALUES
  (NULL, 'Classic Invoice', 'invoice', '<h1>INVOICE</h1><p>Professional invoice template</p>', TRUE),
  (NULL, 'Pro Forma Invoice', 'proforma', '<h1>PRO FORMA INVOICE</h1><p>Professional pro forma template</p>', TRUE),
  (NULL, 'Receipt', 'receipt', '<h1>RECEIPT</h1><p>Professional receipt template</p>', TRUE),
  (NULL, 'Quote', 'quote', '<h1>QUOTE</h1><p>Professional quote template</p>', TRUE)
ON CONFLICT DO NOTHING;

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('branding', 'branding', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
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

CREATE POLICY "Public can view logos in public bucket" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'branding');

-- Success message
SELECT 'Policies and indexes setup completed successfully!' as status; 