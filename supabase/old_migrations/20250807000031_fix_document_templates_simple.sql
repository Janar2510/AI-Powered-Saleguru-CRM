-- Simple Fix for Document Templates Constraint (2025-08-07)

-- Step 1: Drop the existing constraint
ALTER TABLE document_templates DROP CONSTRAINT IF EXISTS document_templates_type_check;

-- Step 2: Update all existing data to use valid types
UPDATE document_templates SET type = 'general' WHERE type IS NULL OR type = '' OR type NOT IN ('invoice', 'quotation', 'sales_order', 'contract', 'proposal', 'receipt', 'purchase_order', 'delivery_note', 'credit_note', 'debit_note', 'general');

-- Step 3: Add the constraint back
ALTER TABLE document_templates ADD CONSTRAINT document_templates_type_check 
CHECK (type IN ('invoice', 'quotation', 'sales_order', 'contract', 'proposal', 'receipt', 'purchase_order', 'delivery_note', 'credit_note', 'debit_note', 'general'));

SELECT 'Document templates constraint fixed successfully!' as status; 