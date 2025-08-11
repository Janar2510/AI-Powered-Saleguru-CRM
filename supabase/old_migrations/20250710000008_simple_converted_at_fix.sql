-- Simple fix: Add converted_at column to leads table
-- This avoids RLS policy issues that might cause type mismatches

BEGIN;

-- Add the converted_at column to the leads table
ALTER TABLE leads 
ADD COLUMN converted_at timestamp with time zone;

-- Add a comment to document the column
COMMENT ON COLUMN leads.converted_at IS 'Timestamp when the lead was converted to a deal';

COMMIT; 