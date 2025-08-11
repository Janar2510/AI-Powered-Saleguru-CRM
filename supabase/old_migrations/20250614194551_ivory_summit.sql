/*
  # Add enrichment fields to contacts and companies tables

  1. New Columns
    - Add to contacts table:
      - `enrichment_status` (text with check constraint)
      - `enriched_at` (timestamp)
      - `enrichment_data` (jsonb)
    
    - Add to companies table:
      - `enrichment_status` (text with check constraint)
      - `enriched_at` (timestamp)
      - `enrichment_data` (jsonb)

  2. Indexes
    - Create indexes for enrichment_status fields
*/

-- Add enrichment fields to contacts table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contacts' AND column_name = 'enrichment_status'
  ) THEN
    ALTER TABLE contacts 
    ADD COLUMN enrichment_status text DEFAULT 'none' CHECK (enrichment_status IN ('pending', 'completed', 'failed', 'none')),
    ADD COLUMN enriched_at timestamptz,
    ADD COLUMN enrichment_data jsonb DEFAULT '{}'::jsonb;
    
    CREATE INDEX IF NOT EXISTS idx_contacts_enrichment_status ON contacts(enrichment_status);
  END IF;
END $$;

-- Add enrichment fields to companies table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'companies' AND column_name = 'enrichment_status'
  ) THEN
    ALTER TABLE companies 
    ADD COLUMN enrichment_status text DEFAULT 'none' CHECK (enrichment_status IN ('pending', 'completed', 'failed', 'none')),
    ADD COLUMN enriched_at timestamptz,
    ADD COLUMN enrichment_data jsonb DEFAULT '{}'::jsonb;
    
    CREATE INDEX IF NOT EXISTS idx_companies_enrichment_status ON companies(enrichment_status);
  END IF;
END $$;