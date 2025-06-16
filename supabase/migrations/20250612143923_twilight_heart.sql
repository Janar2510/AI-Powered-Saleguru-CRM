/*
  # Create stages and deals tables

  1. New Tables
    - `stages`
      - `id` (text, primary key)
      - `name` (text, required)
      - `color` (text, required)
      - `pipeline_id` (text, required)
      - `sort_order` (integer, required) - renamed from "order" to avoid reserved keyword
      - `probability` (integer, 0-100)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `deals`
      - `id` (uuid, primary key)
      - `deal_id` (text, unique)
      - `title` (text, required)
      - `company` (text, required)
      - `contact` (text, required)
      - `value` (integer, required)
      - `stage_id` (text, references stages)
      - Various other fields for deal tracking
      - `created_by` (uuid, references auth.users)

  2. Security
    - Enable RLS on both tables
    - Add policies for access control
    - Create indexes for performance

  3. Sample Data
    - Insert default pipeline stages
    - Insert sample deals
*/

-- Create stages table first
CREATE TABLE IF NOT EXISTS stages (
  id text PRIMARY KEY,
  name text NOT NULL,
  color text NOT NULL,
  pipeline_id text NOT NULL,
  sort_order integer NOT NULL, -- Changed from "order" to "sort_order" to avoid reserved keyword
  probability integer DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add trigger for updated_at on stages
CREATE TRIGGER update_stages_updated_at
BEFORE UPDATE ON stages
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security on stages
ALTER TABLE stages ENABLE ROW LEVEL SECURITY;

-- Create policy for stages
CREATE POLICY "public_access_stages" ON stages
  FOR ALL USING (true);

-- Insert default stages
INSERT INTO stages (id, name, color, pipeline_id, sort_order, probability)
VALUES
  ('lead', 'Lead', 'bg-gray-500', 'sales-pipeline', 1, 10),
  ('qualified', 'Qualified', 'bg-blue-500', 'sales-pipeline', 2, 25),
  ('proposal', 'Proposal', 'bg-yellow-500', 'sales-pipeline', 3, 50),
  ('negotiation', 'Negotiation', 'bg-orange-500', 'sales-pipeline', 4, 75),
  ('closed-won', 'Closed Won', 'bg-green-500', 'sales-pipeline', 5, 100),
  ('closed-lost', 'Closed Lost', 'bg-red-500', 'sales-pipeline', 6, 0)
ON CONFLICT (id) DO NOTHING;

-- Now create deals table that references stages
CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id text UNIQUE,
  title text NOT NULL,
  company text NOT NULL,
  contact text NOT NULL,
  value integer NOT NULL,
  stage_id text NOT NULL REFERENCES stages(id),
  probability integer NOT NULL CHECK (probability >= 0 AND probability <= 100),
  priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  description text,
  expected_close_date date,
  team_members text[] DEFAULT '{}',
  drive_url text,
  position integer DEFAULT 0,
  days_in_stage integer DEFAULT 0,
  notes_count integer DEFAULT 0,
  emails_count integer DEFAULT 0,
  lastActivity text DEFAULT 'Just created',
  next_action text,
  next_action_date date,
  has_pdf boolean DEFAULT false,
  last_email_status text CHECK (last_email_status IS NULL OR last_email_status IN ('opened', 'unopened', 'replied')),
  ai_insight_available boolean DEFAULT false,
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
CREATE INDEX IF NOT EXISTS idx_deals_position ON deals(position);
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON deals(created_at);
CREATE INDEX IF NOT EXISTS idx_deals_value ON deals(value);
CREATE INDEX IF NOT EXISTS idx_deals_company ON deals(company);

-- Enable Row Level Security
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- Create policy for owner access and admin access
CREATE POLICY "owner_access_deals" ON deals
  FOR ALL USING (
    auth.uid() = created_by OR
    auth.uid() IS NULL OR
    is_developer_admin() OR
    has_admin_access()
  );

-- Function to generate deal_id if not provided
CREATE OR REPLACE FUNCTION generate_deal_id()
RETURNS TRIGGER AS $$
DECLARE
  year text;
  random_num text;
BEGIN
  IF NEW.deal_id IS NULL THEN
    year := to_char(CURRENT_DATE, 'YYYY');
    random_num := lpad(floor(random() * 1000)::text, 3, '0');
    NEW.deal_id := 'ST-' || year || '-' || random_num;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate deal_id
CREATE TRIGGER set_deal_id
BEFORE INSERT ON deals
FOR EACH ROW EXECUTE FUNCTION generate_deal_id();

-- Insert sample deals data
INSERT INTO deals (
  title, company, contact, value, stage_id, probability, priority, description, team_members
)
VALUES
  ('Enterprise Software Package', 'TechCorp Inc.', 'John Smith', 75000, 'proposal', 50, 'high', 'Enterprise software solution with 3-year support', ARRAY['Janar Kuusk', 'Sarah Wilson']),
  ('Cloud Infrastructure Setup', 'StartupXYZ', 'Sarah Johnson', 25000, 'qualified', 25, 'medium', 'Cloud infrastructure implementation and training', ARRAY['Janar Kuusk']),
  ('Security Audit Package', 'FinanceCore', 'Mike Wilson', 45000, 'negotiation', 75, 'high', 'Comprehensive security assessment and implementation', ARRAY['Janar Kuusk', 'Mike Chen', 'Lisa Park'])
ON CONFLICT (id) DO NOTHING;