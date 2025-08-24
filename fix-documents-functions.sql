-- Fix PostgreSQL function parameter naming conflicts
-- Run this script in Supabase Studio SQL Editor to fix the ambiguous column reference errors

-- Check what functions currently exist (for debugging)
SELECT 'Current functions:' as info;
SELECT proname, proargtypes::regtype[] as arg_types 
FROM pg_proc 
WHERE proname IN ('generate_document_number', 'generate_warranty_claim_number');

-- Drop and recreate the functions with corrected parameter names
-- Remove all possible function signatures to avoid conflicts
DROP FUNCTION IF EXISTS generate_document_number(TEXT, TEXT);
DROP FUNCTION IF EXISTS generate_document_number(TEXT);
DROP FUNCTION IF EXISTS generate_document_number();
DROP FUNCTION IF EXISTS generate_warranty_claim_number(TEXT);
DROP FUNCTION IF EXISTS generate_warranty_claim_number();

-- Generate document numbers function (fixed parameter naming)
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
    
    -- Get next counter for this document type and org (using table alias to avoid ambiguity)
    SELECT COALESCE(MAX(CAST(SUBSTRING(d.document_number FROM LENGTH(prefix) + 2) AS INTEGER)), 0) + 1
    INTO counter
    FROM public.documents d
    WHERE d.document_type = doc_type 
    AND d.org_id = p_org_id
    AND d.document_number ~ ('^' || prefix || '-[0-9]+$');
    
    -- Format as PREFIX-000001
    result := prefix || '-' || LPAD(counter::TEXT, 6, '0');
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Generate warranty claim numbers function (fixed parameter naming)
CREATE OR REPLACE FUNCTION generate_warranty_claim_number(p_org_id TEXT DEFAULT 'temp-org')
RETURNS TEXT AS $$
DECLARE
    counter INTEGER;
    result TEXT;
BEGIN
    -- Get next counter for warranty claims (using table alias to avoid ambiguity)
    SELECT COALESCE(MAX(CAST(SUBSTRING(w.claim_number FROM 5) AS INTEGER)), 0) + 1
    INTO counter
    FROM public.warranty_claims w
    WHERE w.org_id = p_org_id
    AND w.claim_number ~ '^WAR-[0-9]+$';
    
    -- Format as WAR-000001
    result := 'WAR-' || LPAD(counter::TEXT, 6, '0');
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Test the functions
SELECT 'Functions updated successfully!' as status,
       generate_document_number('contract'::TEXT, 'temp-org'::TEXT) as sample_doc_number,
       generate_warranty_claim_number('temp-org'::TEXT) as sample_claim_number;
