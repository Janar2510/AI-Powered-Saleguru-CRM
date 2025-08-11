-- Fix documents table by adding missing columns
-- This migration adds the missing created_by column to the documents table

-- Add created_by column if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'created_by') THEN
    ALTER TABLE documents ADD COLUMN created_by UUID REFERENCES user_profiles(id);
  END IF;
END $$;

-- Add signed_at column if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'signed_at') THEN
    ALTER TABLE documents ADD COLUMN signed_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Add signature_data column if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'signature_data') THEN
    ALTER TABLE documents ADD COLUMN signature_data JSONB;
  END IF;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own documents" ON documents;
DROP POLICY IF EXISTS "Users can insert documents" ON documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON documents;

-- Recreate RLS policies for documents
CREATE POLICY "Users can view their own documents" ON documents FOR SELECT USING (created_by = auth.uid());
CREATE POLICY "Users can insert documents" ON documents FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update their own documents" ON documents FOR UPDATE USING (created_by = auth.uid()); 