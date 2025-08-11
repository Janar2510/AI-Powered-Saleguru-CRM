-- Fix Document Templates Data (2025-08-07)

-- First, let's see what data exists
SELECT 'Current document_templates data:' as info;
SELECT id, name, type, content FROM document_templates;

-- Update any existing templates to use valid types
UPDATE document_templates SET type = 'general' WHERE type IS NULL OR type = '';

-- Update specific templates to use correct types
UPDATE document_templates SET type = 'invoice' WHERE name LIKE '%Invoice%';
UPDATE document_templates SET type = 'quotation' WHERE name LIKE '%Quotation%';
UPDATE document_templates SET type = 'sales_order' WHERE name LIKE '%Sales Order%';

-- Drop the existing constraint if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'document_templates_type_check'
    ) THEN
        ALTER TABLE document_templates DROP CONSTRAINT document_templates_type_check;
    END IF;
END $$;

-- Add a new constraint that allows all the template types we need
ALTER TABLE document_templates ADD CONSTRAINT document_templates_type_check 
CHECK (type IN ('invoice', 'quotation', 'sales_order', 'contract', 'proposal', 'receipt', 'purchase_order', 'delivery_note', 'credit_note', 'debit_note', 'general'));

-- Show the final data
SELECT 'Final document_templates data:' as info;
SELECT id, name, type, content FROM document_templates;

SELECT 'Document templates data fixed successfully!' as status; 