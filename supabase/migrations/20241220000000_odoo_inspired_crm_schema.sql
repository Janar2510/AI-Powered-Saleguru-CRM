-- Odoo-Inspired CRM Schema Migration - Part 1
-- Core CRM entities and multi-org support

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS/TEAMS
CREATE TABLE IF NOT EXISTS orgs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS org_members (
  org_id uuid REFERENCES orgs(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text CHECK (role IN ('owner','admin','member')) DEFAULT 'member',
  PRIMARY KEY (org_id, user_id)
);

-- CRM ENTITIES
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid REFERENCES orgs(id) ON DELETE CASCADE,
  name text NOT NULL,
  domain text,
  billing_address jsonb,
  shipping_address jsonb,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid REFERENCES orgs(id) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  first_name text,
  last_name text,
  email text,
  phone text,
  title text,
  address jsonb,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- LEADS & DEALS
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid REFERENCES orgs(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  source text,
  status text CHECK (status IN ('new','working','qualified','lost','converted')) DEFAULT 'new',
  score int DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pipelines (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid REFERENCES orgs(id) ON DELETE CASCADE,
  name text NOT NULL
);

CREATE TABLE IF NOT EXISTS pipeline_stages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  pipeline_id uuid REFERENCES pipelines(id) ON DELETE CASCADE,
  name text NOT NULL,
  probability int CHECK (probability BETWEEN 0 AND 100) DEFAULT 10,
  position int DEFAULT 0
);

CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid REFERENCES orgs(id) ON DELETE CASCADE,
  title text NOT NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  pipeline_id uuid REFERENCES pipelines(id) ON DELETE SET NULL,
  stage_id uuid REFERENCES pipeline_stages(id) ON DELETE SET NULL,
  value numeric(12,2) DEFAULT 0,
  currency text DEFAULT 'EUR',
  status text CHECK (status IN ('open','won','lost')) DEFAULT 'open',
  expected_close_date date,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_org_id ON companies(org_id);
CREATE INDEX IF NOT EXISTS idx_contacts_org_id ON contacts(org_id);
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_leads_org_id ON leads(org_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_deals_org_id ON deals(org_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_pipelines_org_id ON pipelines(org_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_pipeline_id ON pipeline_stages(pipeline_id);
