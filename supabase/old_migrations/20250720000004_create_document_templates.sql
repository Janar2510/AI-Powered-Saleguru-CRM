-- Create Document Templates and Generated Documents Tables
-- This migration sets up the document generation system

-- Create document_templates table
CREATE TABLE IF NOT EXISTS document_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('invoice', 'receipt', 'quotation', 'purchase_order', 'delivery_note')),
  style VARCHAR(50) NOT NULL CHECK (style IN ('modern', 'classic', 'minimal', 'professional', 'creative')),
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  preview_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create generated_documents table
CREATE TABLE IF NOT EXISTS generated_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id VARCHAR(255) NOT NULL,
  document_type VARCHAR(50) NOT NULL,
  document_data JSONB NOT NULL,
  html_content TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id),
  filename VARCHAR(255),
  file_size INTEGER,
  download_count INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'document_templates' AND policyname = 'Users can view active templates') THEN
    CREATE POLICY "Users can view active templates" ON document_templates FOR SELECT USING (is_active = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'document_templates' AND policyname = 'Admins can manage templates') THEN
    CREATE POLICY "Admins can manage templates" ON document_templates FOR ALL USING (
      EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
      )
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'generated_documents' AND policyname = 'Users can view their own documents') THEN
    CREATE POLICY "Users can view their own documents" ON generated_documents FOR SELECT USING (created_by = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'generated_documents' AND policyname = 'Users can insert documents') THEN
    CREATE POLICY "Users can insert documents" ON generated_documents FOR INSERT WITH CHECK (created_by = auth.uid());
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_document_templates_type ON document_templates(type);
CREATE INDEX IF NOT EXISTS idx_document_templates_style ON document_templates(style);
CREATE INDEX IF NOT EXISTS idx_document_templates_active ON document_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_generated_documents_template_id ON generated_documents(template_id);
CREATE INDEX IF NOT EXISTS idx_generated_documents_type ON generated_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_generated_documents_created_by ON generated_documents(created_by);
CREATE INDEX IF NOT EXISTS idx_generated_documents_generated_at ON generated_documents(generated_at);

-- Insert sample templates
INSERT INTO document_templates (id, name, type, style, content, is_active) VALUES
('invoice-modern', 'Modern Invoice', 'invoice', 'modern', 'modern-invoice-template', true),
('invoice-classic', 'Classic Invoice', 'invoice', 'classic', 'classic-invoice-template', true),
('invoice-minimal', 'Minimal Invoice', 'invoice', 'minimal', 'minimal-invoice-template', true),
('quotation-modern', 'Modern Quotation', 'quotation', 'modern', 'modern-quotation-template', true),
('quotation-classic', 'Classic Quotation', 'quotation', 'classic', 'classic-quotation-template', true),
('receipt-modern', 'Modern Receipt', 'receipt', 'modern', 'modern-receipt-template', true),
('receipt-classic', 'Classic Receipt', 'receipt', 'classic', 'classic-receipt-template', true)
ON CONFLICT (id) DO NOTHING; 