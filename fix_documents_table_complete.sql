-- Fix Documents Table Complete (2025-08-07)
-- This script completely recreates the documents table with the correct structure

-- Drop the existing documents table if it exists
DROP TABLE IF EXISTS documents CASCADE;

-- Create the documents table with the correct structure
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  document_type TEXT DEFAULT 'general',
  status TEXT DEFAULT 'draft',
  content TEXT,
  file_url TEXT,
  partner_id UUID,
  signer_email TEXT,
  signer_name TEXT,
  signed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable all access for authenticated users" ON documents
  FOR ALL USING (auth.role() = 'authenticated');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_partner_id ON documents(partner_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_by ON documents(created_by);

-- Insert sample data
INSERT INTO documents (name, document_type, status, content, signer_email, signer_name) VALUES
  ('Sample Contract', 'contract', 'draft', 'This is a sample contract content...', 'signer@example.com', 'John Signer'),
  ('Service Agreement', 'agreement', 'sent', 'This is a service agreement content...', 'client@example.com', 'Jane Client'),
  ('NDA Template', 'nda', 'draft', 'This is an NDA template content...', 'partner@example.com', 'Bob Partner'),
  ('Invoice Template', 'invoice', 'draft', 'This is an invoice template content...', 'billing@example.com', 'Alice Billing');

-- Create a trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_documents_updated_at 
    BEFORE UPDATE ON documents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

SELECT 'Documents table created successfully!' as status; 