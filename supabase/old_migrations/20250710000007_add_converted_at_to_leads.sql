-- Add converted_at column to leads table
-- This fixes the error when converting leads to deals

BEGIN;

-- Add the converted_at column to the leads table
ALTER TABLE leads 
ADD COLUMN converted_at timestamp with time zone;

-- Add a comment to document the column
COMMENT ON COLUMN leads.converted_at IS 'Timestamp when the lead was converted to a deal';

-- Update RLS policies to include the new column
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own leads" ON leads;
DROP POLICY IF EXISTS "Users can insert their own leads" ON leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON leads;

-- Recreate policies with the new column
CREATE POLICY "Users can view their own leads" ON leads
    FOR SELECT USING (owner_id = auth.uid() OR auth.role() = 'admin');

CREATE POLICY "Users can insert their own leads" ON leads
    FOR INSERT WITH CHECK (owner_id = auth.uid() OR auth.role() = 'admin');

CREATE POLICY "Users can update their own leads" ON leads
    FOR UPDATE USING (owner_id = auth.uid() OR auth.role() = 'admin');

CREATE POLICY "Users can delete their own leads" ON leads
    FOR DELETE USING (owner_id = auth.uid() OR auth.role() = 'admin');

COMMIT; 