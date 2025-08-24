-- Comprehensive Documents & E-Signature System
-- This migration creates a complete document management system with e-signatures and warranty support

-- Drop existing documents table if it exists and recreate with full schema
DROP TABLE IF EXISTS public.document_signatures CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;

-- Enhanced documents table with comprehensive fields
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id TEXT DEFAULT 'temp-org' NOT NULL,
    
    -- Document metadata
    document_number TEXT UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    document_type TEXT NOT NULL CHECK (document_type IN (
        'quote', 'sales_order', 'invoice', 'proforma', 'receipt', 
        'contract', 'nda', 'agreement', 'warranty', 'manual', 
        'certificate', 'report', 'other'
    )),
    
    -- File storage
    file_url TEXT,
    file_name TEXT,
    file_size BIGINT,
    file_type TEXT,
    content TEXT, -- For HTML content
    
    -- Status and workflow
    status TEXT DEFAULT 'draft' CHECK (status IN (
        'draft', 'pending_review', 'approved', 'sent', 'viewed', 
        'signed', 'completed', 'expired', 'cancelled', 'archived'
    )),
    
    -- E-signature fields
    signature_required BOOLEAN DEFAULT FALSE,
    signature_deadline TIMESTAMPTZ,
    signature_completed_at TIMESTAMPTZ,
    signature_data JSONB DEFAULT '{}',
    
    -- Relationships
    contact_id UUID,
    organization_id UUID,
    deal_id UUID,
    quote_id UUID,
    sales_order_id UUID,
    invoice_id UUID,
    
    -- Financial fields
    total_amount_cents BIGINT DEFAULT 0,
    currency TEXT DEFAULT 'EUR',
    
    -- Access control
    is_public BOOLEAN DEFAULT FALSE,
    password_protected BOOLEAN DEFAULT FALSE,
    access_password TEXT,
    
    -- Workflow tracking
    created_by UUID,
    updated_by UUID,
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    
    -- Metadata
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    
    -- Version control
    version INTEGER DEFAULT 1,
    parent_document_id UUID REFERENCES public.documents(id)
);

-- Document signatures table for e-signature tracking
CREATE TABLE IF NOT EXISTS public.document_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    org_id TEXT DEFAULT 'temp-org' NOT NULL,
    
    -- Signer information
    signer_name TEXT NOT NULL,
    signer_email TEXT NOT NULL,
    signer_role TEXT CHECK (signer_role IN ('internal', 'customer', 'vendor', 'partner')),
    signer_title TEXT,
    company_name TEXT,
    
    -- Signature data
    signature_type TEXT DEFAULT 'digital' CHECK (signature_type IN ('digital', 'drawn', 'typed', 'uploaded')),
    signature_data JSONB DEFAULT '{}', -- Contains signature image, coordinates, etc.
    signature_image_url TEXT,
    
    -- Security and audit
    ip_address INET,
    user_agent TEXT,
    location_data JSONB DEFAULT '{}',
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'signed', 'declined', 'expired')),
    signed_at TIMESTAMPTZ,
    declined_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Notifications
    invitation_sent_at TIMESTAMPTZ,
    reminder_sent_at TIMESTAMPTZ,
    reminder_count INTEGER DEFAULT 0
);

-- Document versions table for version control
CREATE TABLE IF NOT EXISTS public.document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    
    -- Version data
    title TEXT NOT NULL,
    content TEXT,
    file_url TEXT,
    changes_summary TEXT,
    
    -- Version metadata
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(document_id, version_number)
);

-- Document templates table
CREATE TABLE IF NOT EXISTS public.document_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id TEXT DEFAULT 'temp-org' NOT NULL,
    
    -- Template metadata
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    document_type TEXT NOT NULL,
    
    -- Template content
    html_template TEXT,
    css_styles TEXT,
    variables JSONB DEFAULT '{}', -- Available template variables
    
    -- Settings
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Warranty claims table for customer portal
CREATE TABLE IF NOT EXISTS public.warranty_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id TEXT DEFAULT 'temp-org' NOT NULL,
    
    -- Claim identification
    claim_number TEXT UNIQUE NOT NULL,
    warranty_type TEXT CHECK (warranty_type IN ('product', 'service', 'extended', 'manufacturer')),
    
    -- Product/Service information
    product_name TEXT NOT NULL,
    product_serial TEXT,
    product_model TEXT,
    purchase_date DATE,
    warranty_start_date DATE,
    warranty_end_date DATE,
    
    -- Customer information
    customer_contact_id UUID,
    customer_organization_id UUID,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    
    -- Claim details
    issue_description TEXT NOT NULL,
    issue_type TEXT,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    
    -- Status and resolution
    status TEXT DEFAULT 'submitted' CHECK (status IN (
        'submitted', 'under_review', 'approved', 'rejected', 
        'in_progress', 'parts_ordered', 'resolved', 'closed'
    )),
    resolution_description TEXT,
    resolution_cost_cents BIGINT DEFAULT 0,
    
    -- Attachments
    attachments JSONB DEFAULT '[]',
    
    -- Tracking
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    
    -- Relationships
    related_sales_order_id UUID,
    related_invoice_id UUID,
    assigned_to UUID
);

-- Warranty claim updates table for tracking history
CREATE TABLE IF NOT EXISTS public.warranty_claim_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES public.warranty_claims(id) ON DELETE CASCADE,
    
    -- Update details
    update_type TEXT CHECK (update_type IN ('status_change', 'comment', 'attachment', 'assignment')),
    description TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    
    -- User tracking
    updated_by UUID,
    is_customer_visible BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generate document numbers function
CREATE OR REPLACE FUNCTION generate_document_number(doc_type TEXT, p_org_id TEXT DEFAULT 'temp-org')
RETURNS TEXT AS $$
DECLARE
    prefix TEXT;
    counter INTEGER;
    result TEXT;
BEGIN
    -- Set prefix based on document type
    prefix := CASE doc_type
        WHEN 'quote' THEN 'QUO'
        WHEN 'sales_order' THEN 'SO'
        WHEN 'invoice' THEN 'INV'
        WHEN 'proforma' THEN 'PRO'
        WHEN 'receipt' THEN 'REC'
        WHEN 'contract' THEN 'CON'
        WHEN 'nda' THEN 'NDA'
        WHEN 'agreement' THEN 'AGR'
        WHEN 'warranty' THEN 'WAR'
        WHEN 'manual' THEN 'MAN'
        WHEN 'certificate' THEN 'CER'
        WHEN 'report' THEN 'REP'
        ELSE 'DOC'
    END;
    
    -- Get next counter for this document type and org
    SELECT COALESCE(MAX(CAST(SUBSTRING(document_number FROM LENGTH(prefix) + 2) AS INTEGER)), 0) + 1
    INTO counter
    FROM public.documents 
    WHERE document_type = doc_type 
    AND documents.org_id = p_org_id
    AND document_number ~ ('^' || prefix || '-[0-9]+$');
    
    -- Format as PREFIX-000001
    result := prefix || '-' || LPAD(counter::TEXT, 6, '0');
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Generate warranty claim numbers function
CREATE OR REPLACE FUNCTION generate_warranty_claim_number(p_org_id TEXT DEFAULT 'temp-org')
RETURNS TEXT AS $$
DECLARE
    counter INTEGER;
    result TEXT;
BEGIN
    -- Get next counter for warranty claims
    SELECT COALESCE(MAX(CAST(SUBSTRING(claim_number FROM 5) AS INTEGER)), 0) + 1
    INTO counter
    FROM public.warranty_claims 
    WHERE warranty_claims.org_id = p_org_id
    AND claim_number ~ '^WAR-[0-9]+$';
    
    -- Format as WAR-000001
    result := 'WAR-' || LPAD(counter::TEXT, 6, '0');
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate document numbers
CREATE OR REPLACE FUNCTION auto_generate_document_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.document_number IS NULL THEN
        NEW.document_number := generate_document_number(NEW.document_type, NEW.org_id);
    END IF;
    
    NEW.updated_at := NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate warranty claim numbers
CREATE OR REPLACE FUNCTION auto_generate_warranty_claim_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.claim_number IS NULL THEN
        NEW.claim_number := generate_warranty_claim_number(NEW.org_id);
    END IF;
    
    NEW.updated_at := NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_auto_generate_document_number ON public.documents;
CREATE TRIGGER trigger_auto_generate_document_number
    BEFORE INSERT OR UPDATE ON public.documents
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_document_number();

DROP TRIGGER IF EXISTS trigger_auto_generate_warranty_claim_number ON public.warranty_claims;
CREATE TRIGGER trigger_auto_generate_warranty_claim_number
    BEFORE INSERT OR UPDATE ON public.warranty_claims
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_warranty_claim_number();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_org_id ON public.documents(org_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON public.documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_contact_id ON public.documents(contact_id);
CREATE INDEX IF NOT EXISTS idx_documents_organization_id ON public.documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_documents_deal_id ON public.documents(deal_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_document_signatures_document_id ON public.document_signatures(document_id);
CREATE INDEX IF NOT EXISTS idx_document_signatures_signer_email ON public.document_signatures(signer_email);
CREATE INDEX IF NOT EXISTS idx_document_signatures_status ON public.document_signatures(status);

CREATE INDEX IF NOT EXISTS idx_warranty_claims_org_id ON public.warranty_claims(org_id);
CREATE INDEX IF NOT EXISTS idx_warranty_claims_status ON public.warranty_claims(status);
CREATE INDEX IF NOT EXISTS idx_warranty_claims_customer_email ON public.warranty_claims(customer_email);
CREATE INDEX IF NOT EXISTS idx_warranty_claims_created_at ON public.warranty_claims(created_at DESC);

-- Create sample data
INSERT INTO public.documents (
    title, document_type, status, signature_required, total_amount_cents, 
    description, contact_id, deal_id, created_by
) VALUES 
    ('Service Agreement 2024', 'contract', 'pending_review', true, 150000, 'Annual service contract for software maintenance', gen_random_uuid(), gen_random_uuid(), gen_random_uuid()),
    ('Product Warranty Certificate', 'warranty', 'completed', false, 0, 'Warranty certificate for purchased equipment', gen_random_uuid(), gen_random_uuid(), gen_random_uuid()),
    ('Sales Contract Q1', 'agreement', 'signed', true, 250000, 'Quarterly sales agreement with new client', gen_random_uuid(), gen_random_uuid(), gen_random_uuid()),
    ('Software License Agreement', 'contract', 'draft', true, 100000, 'Software licensing agreement for enterprise solution', gen_random_uuid(), gen_random_uuid(), gen_random_uuid()),
    ('Non-Disclosure Agreement', 'nda', 'sent', true, 0, 'Confidentiality agreement for partnership discussions', gen_random_uuid(), gen_random_uuid(), gen_random_uuid());

INSERT INTO public.document_templates (
    name, description, category, document_type, html_template, variables
) VALUES 
    ('Standard Service Contract', 'Template for service agreements', 'Contracts', 'contract', 
     '<h1>Service Agreement</h1><p>This agreement is between {{company_name}} and {{client_name}}</p>', 
     '{"company_name": "string", "client_name": "string", "service_description": "text", "amount": "number"}'),
    ('Warranty Certificate', 'Standard warranty certificate template', 'Warranties', 'warranty',
     '<h1>Warranty Certificate</h1><p>Product: {{product_name}}</p><p>Valid until: {{warranty_end_date}}</p>',
     '{"product_name": "string", "warranty_end_date": "date", "customer_name": "string"}'),
    ('Basic NDA Template', 'Non-disclosure agreement template', 'Legal', 'nda',
     '<h1>Non-Disclosure Agreement</h1><p>Parties: {{party1}} and {{party2}}</p>',
     '{"party1": "string", "party2": "string", "effective_date": "date"}');

INSERT INTO public.warranty_claims (
    warranty_type, product_name, product_serial, customer_name, customer_email, 
    issue_description, issue_type, severity, status, purchase_date, warranty_start_date, warranty_end_date
) VALUES 
    ('product', 'Industrial Printer X200', 'IP200-2024-001', 'TechCorp Solutions', 'support@techcorp.com', 
     'Printer stops working after 500 pages, showing error code E-42', 'hardware_failure', 'high', 'under_review',
     '2024-01-15', '2024-01-15', '2026-01-15'),
    ('service', 'Annual Maintenance Package', 'SRV-2024-MT-005', 'Global Manufacturing Ltd', 'maintenance@global.com',
     'Scheduled maintenance not performed within agreed timeframe', 'service_delay', 'medium', 'in_progress',
     '2024-03-01', '2024-03-01', '2025-03-01'),
    ('extended', 'Server Hardware Suite', 'SVR-ENT-2024-012', 'DataFlow Systems', 'admin@dataflow.com',
     'Memory module failure causing system crashes', 'hardware_failure', 'critical', 'parts_ordered',
     '2023-12-01', '2024-01-01', '2026-12-31');

-- Enable RLS (Row Level Security)
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warranty_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warranty_claim_updates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (permissive for development)
CREATE POLICY "Enable all access for documents" ON public.documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for document_signatures" ON public.document_signatures FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for document_versions" ON public.document_versions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for document_templates" ON public.document_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for warranty_claims" ON public.warranty_claims FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for warranty_claim_updates" ON public.warranty_claim_updates FOR ALL USING (true) WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.documents TO anon, authenticated;
GRANT ALL ON public.document_signatures TO anon, authenticated;
GRANT ALL ON public.document_versions TO anon, authenticated;
GRANT ALL ON public.document_templates TO anon, authenticated;
GRANT ALL ON public.warranty_claims TO anon, authenticated;
GRANT ALL ON public.warranty_claim_updates TO anon, authenticated;

-- Comments for documentation
COMMENT ON TABLE public.documents IS 'Comprehensive document management with e-signature support';
COMMENT ON TABLE public.document_signatures IS 'Track e-signature events and signer information';
COMMENT ON TABLE public.warranty_claims IS 'Customer warranty claims and support tickets';
COMMENT ON COLUMN public.documents.signature_required IS 'Whether this document requires electronic signature';
COMMENT ON COLUMN public.documents.metadata IS 'Flexible JSON field for additional document properties';
