-- Create leads table for lead management
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT DEFAULT 'temp-org',  -- Simple text field instead of foreign key
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  source TEXT,         -- e.g. "Web form", "Expo", "Cold Call", "Referral", etc.
  status TEXT DEFAULT 'New',  -- New, Contacted, Qualified, Disqualified, Converted
  lead_score INT DEFAULT 0,      -- could be computed via AI or rules
  notes TEXT,
  assigned_to TEXT,              -- Simple text field instead of foreign key
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_leads_org_id ON leads(org_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (simplified for now)
CREATE POLICY "Users can view leads in their organization" ON leads
  FOR SELECT USING (org_id = 'temp-org');

CREATE POLICY "Users can insert leads in their organization" ON leads
  FOR INSERT WITH CHECK (org_id = 'temp-org');

CREATE POLICY "Users can update leads in their organization" ON leads
  FOR UPDATE USING (org_id = 'temp-org');

CREATE POLICY "Users can delete leads in their organization" ON leads
  FOR DELETE USING (org_id = 'temp-org');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_leads_updated_at();
