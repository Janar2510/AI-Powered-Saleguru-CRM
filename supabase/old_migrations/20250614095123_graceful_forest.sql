/*
  # Create companies table

  1. New Tables
    - `companies`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `website` (text)
      - `industry` (text)
      - `size` (text)
      - `description` (text)
      - `logo_url` (text)
      - `address` (text)
      - `city` (text)
      - `state` (text)
      - `country` (text)
      - `postal_code` (text)
      - `phone` (text)
      - `email` (text)
      - `linkedin_url` (text)
      - `twitter_url` (text)
      - `facebook_url` (text)
      - `tags` (text array)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `created_by` (uuid, references auth.users)
      - `assigned_to` (uuid, references auth.users)
      - `last_contacted_at` (timestamp)
      - `status` (text, with check constraint)

  2. Security
    - Enable RLS on `companies` table
    - Add policy for owner access and admin access
    - Create indexes for performance

  3. Relationships
    - Add foreign key from contacts to companies
*/

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  website text,
  industry text,
  size text,
  description text,
  logo_url text,
  address text,
  city text,
  state text,
  country text,
  postal_code text,
  phone text,
  email text,
  linkedin_url text,
  twitter_url text,
  facebook_url text,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  last_contacted_at timestamptz,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'lead', 'customer'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_website ON companies(website);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_created_by ON companies(created_by);
CREATE INDEX IF NOT EXISTS idx_companies_assigned_to ON companies(assigned_to);
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);

-- Add trigger for updated_at
CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON companies
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Create policy for owner access and admin access
CREATE POLICY "owner_access_companies" ON companies
  FOR ALL USING (
    auth.uid() = created_by OR
    auth.uid() = assigned_to OR
    auth.uid() IS NULL OR
    is_developer_admin() OR
    has_admin_access()
  );

-- Add company_id to contacts table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'contacts') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'contacts' AND column_name = 'company_id'
    ) THEN
      ALTER TABLE contacts ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE SET NULL;
      CREATE INDEX idx_contacts_company_id ON contacts(company_id);
    END IF;
  END IF;
END $$;

-- Insert sample companies
INSERT INTO companies (
  name, website, industry, size, description, logo_url, phone, email, 
  linkedin_url, tags, status
)
VALUES
  (
    'TechCorp Inc.', 
    'https://techcorp.com', 
    'Technology', 
    'Enterprise (1000+)', 
    'Leading enterprise software solutions provider', 
    'https://via.placeholder.com/150', 
    '+1 (555) 123-4567', 
    'info@techcorp.com', 
    'https://linkedin.com/company/techcorp', 
    ARRAY['Enterprise', 'Software', 'B2B'], 
    'customer'
  ),
  (
    'StartupXYZ', 
    'https://startupxyz.io', 
    'SaaS', 
    'Small (11-50)', 
    'Innovative cloud solutions for startups', 
    'https://via.placeholder.com/150', 
    '+1 (555) 987-6543', 
    'hello@startupxyz.io', 
    'https://linkedin.com/company/startupxyz', 
    ARRAY['Startup', 'Cloud', 'SaaS'], 
    'lead'
  ),
  (
    'FinanceCore', 
    'https://financecore.com', 
    'Financial Services', 
    'Medium (51-200)', 
    'Financial technology solutions for enterprise', 
    'https://via.placeholder.com/150', 
    '+1 (555) 456-7890', 
    'contact@financecore.com', 
    'https://linkedin.com/company/financecore', 
    ARRAY['Finance', 'Enterprise', 'Security'], 
    'customer'
  )
ON CONFLICT (id) DO NOTHING;