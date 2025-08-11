-- Add Missing Triggers for Document Builder System

-- Check if the update_updated_at_column function exists, if not create it
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER SET search_path = '';

-- Add trigger for documents table
DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at 
    BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add trigger for branding table
DROP TRIGGER IF EXISTS update_branding_updated_at ON branding;
CREATE TRIGGER update_branding_updated_at 
    BEFORE UPDATE ON branding
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add trigger for document_templates table
DROP TRIGGER IF EXISTS update_document_templates_updated_at ON document_templates;
CREATE TRIGGER update_document_templates_updated_at 
    BEFORE UPDATE ON document_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Document Builder triggers added successfully!' as status; 