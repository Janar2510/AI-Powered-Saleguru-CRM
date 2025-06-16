-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE,
  phone text,
  company text,
  position text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own contacts"
  ON contacts
  FOR ALL
  TO authenticated
  USING (created_by = auth.uid() OR created_by IS NULL OR is_developer_admin() OR has_admin_access())
  WITH CHECK (created_by = auth.uid() OR created_by IS NULL OR is_developer_admin() OR has_admin_access());

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts USING btree (name);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts USING btree (email);
CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts USING btree (company);
CREATE INDEX IF NOT EXISTS idx_contacts_created_by ON contacts USING btree (created_by);

-- Add updated_at trigger
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add foreign key constraints to existing tables
DO $$
BEGIN
  -- Add foreign key constraint from tasks to contacts if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'tasks_contact_id_fkey'
  ) THEN
    ALTER TABLE tasks ADD CONSTRAINT tasks_contact_id_fkey 
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL;
  END IF;

  -- Add foreign key constraint from calendar_events to contacts if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'calendar_events_related_contact_id_fkey'
  ) THEN
    ALTER TABLE calendar_events ADD CONSTRAINT calendar_events_related_contact_id_fkey 
    FOREIGN KEY (related_contact_id) REFERENCES contacts(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Insert some sample contacts for testing
INSERT INTO contacts (name, email, phone, company, position, notes) VALUES
  ('John Smith', 'john.smith@acme.com', '+1-555-0101', 'Acme Corp', 'CEO', 'Key decision maker'),
  ('Sarah Johnson', 'sarah.j@techstart.io', '+1-555-0102', 'TechStart', 'CTO', 'Technical contact'),
  ('Mike Wilson', 'mike@innovate.com', '+1-555-0103', 'Innovate Inc', 'VP Sales', 'Sales lead'),
  ('Lisa Chen', 'lisa.chen@future.co', '+1-555-0104', 'Future Co', 'Product Manager', 'Product specialist')
ON CONFLICT (email) DO NOTHING;