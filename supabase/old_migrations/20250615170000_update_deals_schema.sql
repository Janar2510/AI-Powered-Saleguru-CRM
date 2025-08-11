/*
  # Update deals table schema to match frontend expectations

  The frontend expects a different schema than what's currently in the database.
  This migration updates the deals table to match the frontend requirements.
*/

-- Drop the existing deals table and recreate it with the correct schema
DROP TABLE IF EXISTS deals CASCADE;

-- Create deals table with the correct schema
CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  value integer NOT NULL DEFAULT 0,
  currency text DEFAULT 'USD',
  probability integer NOT NULL DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
  status text DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost')),
  stage_id text NOT NULL,
  pipeline_id text NOT NULL,
  owner_id uuid NOT NULL REFERENCES auth.users(id),
  contact_id uuid,
  company_id uuid,
  tags text[] DEFAULT '{}',
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  expected_close_date date,
  actual_close_date date,
  lost_reason text,
  source text,
  activities_count integer DEFAULT 0,
  emails_count integer DEFAULT 0,
  tasks_count integer DEFAULT 0,
  notes_count integer DEFAULT 0,
  custom_fields jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Add trigger for updated_at
CREATE TRIGGER update_deals_updated_at
BEFORE UPDATE ON deals
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_deals_stage_id ON deals(stage_id);
CREATE INDEX IF NOT EXISTS idx_deals_pipeline_id ON deals(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_deals_owner_id ON deals(owner_id);
CREATE INDEX IF NOT EXISTS idx_deals_contact_id ON deals(contact_id);
CREATE INDEX IF NOT EXISTS idx_deals_company_id ON deals(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON deals(created_at);
CREATE INDEX IF NOT EXISTS idx_deals_value ON deals(value);

-- Enable Row Level Security
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- Create policy for owner access and admin access
CREATE POLICY "owner_access_deals" ON deals
  FOR ALL USING (
    auth.uid() = owner_id OR
    auth.uid() = created_by OR
    auth.uid() IS NULL OR
    is_developer_admin() OR
    has_admin_access()
  );

-- Create pipelines table if it doesn't exist
CREATE TABLE IF NOT EXISTS pipelines (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add trigger for updated_at on pipelines
CREATE TRIGGER update_pipelines_updated_at
BEFORE UPDATE ON pipelines
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security on pipelines
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;

-- Create policy for pipelines
CREATE POLICY "public_access_pipelines" ON pipelines
  FOR ALL USING (true);

-- Insert default pipeline
INSERT INTO pipelines (id, name, description, is_default)
VALUES ('default', 'Default Pipeline', 'Default sales pipeline', true)
ON CONFLICT (id) DO NOTHING;

-- Update pipeline_stages to reference the default pipeline
UPDATE pipeline_stages SET pipeline_id = 'default' WHERE pipeline_id = 'sales-pipeline';

-- Insert sample deals with the new schema
INSERT INTO deals (
  title, description, value, probability, stage_id, pipeline_id, owner_id, priority, source, tags
)
VALUES
  ('Enterprise Software Package', 'Enterprise software solution with 3-year support', 75000, 50, 'proposal', 'default', (SELECT id FROM auth.users LIMIT 1), 'high', 'website', ARRAY['enterprise', 'software']),
  ('Cloud Infrastructure Setup', 'Cloud infrastructure implementation and training', 25000, 25, 'qualified', 'default', (SELECT id FROM auth.users LIMIT 1), 'medium', 'referral', ARRAY['cloud', 'infrastructure']),
  ('Security Audit Package', 'Comprehensive security assessment and implementation', 45000, 75, 'negotiation', 'default', (SELECT id FROM auth.users LIMIT 1), 'high', 'cold_call', ARRAY['security', 'audit'])
ON CONFLICT (id) DO NOTHING; 