-- Fix Document Templates Constraint (2025-08-07)

-- First, let's check what the current constraint is
DO $$
BEGIN
    -- Drop the existing constraint if it exists
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

-- Update existing templates to use valid types
UPDATE document_templates SET type = 'general' WHERE type NOT IN ('invoice', 'quotation', 'sales_order', 'contract', 'proposal', 'receipt', 'purchase_order', 'delivery_note', 'credit_note', 'debit_note', 'general');

-- Insert the templates again with correct types
INSERT INTO document_templates (name, type, content) 
VALUES 
  ('Invoice Template', 'invoice', 'Standard invoice template'),
  ('Quotation Template', 'quotation', 'Standard quotation template'),
  ('Sales Order Template', 'sales_order', 'Standard sales order template')
ON CONFLICT DO NOTHING;

SELECT 'Document templates constraint fixed successfully!' as status; 