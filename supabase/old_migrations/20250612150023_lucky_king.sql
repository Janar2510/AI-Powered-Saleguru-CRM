-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  due_date date NOT NULL,
  due_time time,
  type text NOT NULL CHECK (type IN ('call', 'meeting', 'email', 'follow-up', 'task', 'reminder')),
  status text NOT NULL CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled', 'overdue')),
  priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to uuid,
  contact_id uuid,
  deal_id uuid,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  completed_by uuid,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid
);

-- Add foreign key constraints if tables exist
DO $$
BEGIN
  -- Add foreign key to deals if it exists
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'deals') THEN
    ALTER TABLE tasks ADD CONSTRAINT tasks_deal_id_fkey 
    FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE SET NULL;
  END IF;

  -- Add foreign key to auth.users if it exists
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'users' AND schemaname = 'auth') THEN
    ALTER TABLE tasks ADD CONSTRAINT tasks_assigned_to_fkey 
    FOREIGN KEY (assigned_to) REFERENCES auth.users(id) ON DELETE SET NULL;
    
    ALTER TABLE tasks ADD CONSTRAINT tasks_completed_by_fkey 
    FOREIGN KEY (completed_by) REFERENCES auth.users(id) ON DELETE SET NULL;
    
    ALTER TABLE tasks ADD CONSTRAINT tasks_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for tasks
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_deal_id ON tasks(deal_id);
CREATE INDEX IF NOT EXISTS idx_tasks_contact_id ON tasks(contact_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

-- Add trigger for updated_at
CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policy for tasks
CREATE POLICY "owner_access_tasks" ON tasks
  FOR ALL USING (
    (auth.uid() = created_by) OR
    (auth.uid() = assigned_to) OR
    (auth.uid() IS NULL) OR
    is_developer_admin() OR
    has_admin_access()
  );

-- Create calendar_events table
CREATE TABLE IF NOT EXISTS calendar_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  location text,
  event_type text NOT NULL CHECK (event_type IN ('meeting', 'call', 'demo', 'task', 'follow-up', 'internal', 'other')),
  related_task_id uuid,
  related_contact_id uuid,
  related_deal_id uuid,
  attendees jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid
);

-- Add foreign key constraints if tables exist
DO $$
BEGIN
  -- Add foreign key to tasks
  ALTER TABLE calendar_events ADD CONSTRAINT calendar_events_related_task_id_fkey 
  FOREIGN KEY (related_task_id) REFERENCES tasks(id) ON DELETE SET NULL;

  -- Add foreign key to deals if it exists
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'deals') THEN
    ALTER TABLE calendar_events ADD CONSTRAINT calendar_events_related_deal_id_fkey 
    FOREIGN KEY (related_deal_id) REFERENCES deals(id) ON DELETE SET NULL;
  END IF;

  -- Add foreign key to auth.users if it exists
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'users' AND schemaname = 'auth') THEN
    ALTER TABLE calendar_events ADD CONSTRAINT calendar_events_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for calendar_events
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_end_time ON calendar_events(end_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_event_type ON calendar_events(event_type);
CREATE INDEX IF NOT EXISTS idx_calendar_events_related_task_id ON calendar_events(related_task_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_related_deal_id ON calendar_events(related_deal_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_related_contact_id ON calendar_events(related_contact_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_created_by ON calendar_events(created_by);

-- Add trigger for updated_at
CREATE TRIGGER update_calendar_events_updated_at
BEFORE UPDATE ON calendar_events
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Create policy for calendar_events - Fixed the UUID comparison issue
CREATE POLICY "owner_access_calendar_events" ON calendar_events
  FOR ALL USING (
    (auth.uid() = created_by) OR
    (auth.uid() IS NULL) OR
    is_developer_admin() OR
    has_admin_access() OR
    (auth.uid()::text IN (
      SELECT jsonb_array_elements_text(attendees->'attendee_ids')
      FROM calendar_events
    ))
  );

-- Insert sample tasks
INSERT INTO tasks (
  title, description, due_date, due_time, type, status, priority, 
  tags, completed
)
VALUES
  ('Follow up with TechCorp Inc.', 'Send proposal follow-up email', '2025-06-15', '14:00:00', 'follow-up', 'pending', 'high', 
   ARRAY['sales', 'follow-up'], false),
  ('Prepare demo for StartupXYZ', 'Customize demo for cloud infrastructure needs', '2025-06-16', '10:00:00', 'meeting', 'in-progress', 'medium', 
   ARRAY['demo', 'preparation'], false),
  ('Review contract terms', 'Legal review for Enterprise Software Package', '2025-06-14', '16:30:00', 'task', 'pending', 'high', 
   ARRAY['legal', 'contract'], false),
  ('Send welcome email', 'Welcome new client to our platform', '2025-06-13', '09:00:00', 'email', 'completed', 'medium', 
   ARRAY['onboarding', 'email'], true),
  ('Quarterly review meeting', 'Prepare slides for quarterly review', '2025-06-20', '13:00:00', 'meeting', 'pending', 'medium', 
   ARRAY['internal', 'presentation'], false),
  ('Call with Mike Wilson', 'Discuss security audit requirements', '2025-06-17', '11:30:00', 'call', 'pending', 'medium', 
   ARRAY['sales', 'security'], false),
  ('Update CRM contacts', 'Clean up and update contact database', '2025-06-18', NULL, 'task', 'pending', 'low', 
   ARRAY['admin', 'crm'], false),
  ('Send proposal to GlobalTech', 'Finalize and send the proposal document', '2025-06-12', '15:00:00', 'email', 'overdue', 'high', 
   ARRAY['proposal', 'sales'], false)
ON CONFLICT (id) DO NOTHING;

-- Insert sample calendar events
INSERT INTO calendar_events (
  title, description, start_time, end_time, location, event_type, 
  attendees
)
VALUES
  ('TechCorp Demo Meeting', 'Product demonstration for the enterprise package', '2025-06-15 10:00:00', '2025-06-15 11:30:00', 'Conference Room A', 'demo',
   '{"attendee_ids": ["user1", "external1"], "details": [{"id": "user1", "name": "Janar Kuusk", "email": "janar@example.com", "status": "accepted"}, {"id": "external1", "name": "John Smith", "email": "john@techcorp.com", "status": "accepted"}]}'::jsonb),
  ('Weekly Team Sync', 'Regular team status update', '2025-06-16 09:00:00', '2025-06-16 10:00:00', 'Virtual Meeting', 'internal',
   '{"attendee_ids": ["user1", "user2"], "details": [{"id": "user1", "name": "Janar Kuusk", "email": "janar@example.com", "status": "accepted"}, {"id": "user2", "name": "Sarah Wilson", "email": "sarah@example.com", "status": "accepted"}]}'::jsonb),
  ('FinanceCore Contract Call', 'Discuss contract terms and conditions', '2025-06-17 14:00:00', '2025-06-17 15:00:00', 'Phone Call', 'call',
   '{"attendee_ids": ["user1", "external2"], "details": [{"id": "user1", "name": "Janar Kuusk", "email": "janar@example.com", "status": "accepted"}, {"id": "external2", "name": "Mike Wilson", "email": "mike@financecore.com", "status": "pending"}]}'::jsonb),
  ('StartupXYZ Follow-up', 'Follow up on cloud infrastructure proposal', '2025-06-18 11:00:00', '2025-06-18 11:30:00', 'Virtual Meeting', 'follow-up',
   '{"attendee_ids": ["user1", "external3"], "details": [{"id": "user1", "name": "Janar Kuusk", "email": "janar@example.com", "status": "accepted"}, {"id": "external3", "name": "Sarah Johnson", "email": "sarah@startupxyz.com", "status": "accepted"}]}'::jsonb),
  ('Quarterly Business Review', 'Review Q2 performance and plan for Q3', '2025-06-20 13:00:00', '2025-06-20 15:00:00', 'Main Conference Room', 'meeting',
   '{"attendee_ids": ["user1", "user2", "user3"], "details": [{"id": "user1", "name": "Janar Kuusk", "email": "janar@example.com", "status": "accepted"}, {"id": "user2", "name": "Sarah Wilson", "email": "sarah@example.com", "status": "accepted"}, {"id": "user3", "name": "Mike Chen", "email": "mike@example.com", "status": "pending"}]}'::jsonb)
ON CONFLICT (id) DO NOTHING;