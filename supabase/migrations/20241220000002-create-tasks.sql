-- Create Tasks Table Migration
-- Date: 2024-12-20
-- Description: Create tasks table for task and activity management

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  status TEXT DEFAULT 'Open',  -- Open, Completed, Overdue, In Progress, Cancelled
  priority TEXT DEFAULT 'Medium',  -- Low, Medium, High, Critical
  category TEXT DEFAULT 'General',  -- General, Call, Email, Meeting, Follow-up
  related_deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  related_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  related_organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  assigned_to TEXT,  -- User ID or email
  org_id TEXT,  -- For multi-tenant support
  tags TEXT[],  -- Array of tags
  notes TEXT,  -- Additional notes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ  -- When task was completed
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS tasks_by_status_due ON tasks(status, due_date);
CREATE INDEX IF NOT EXISTS tasks_by_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS tasks_by_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS tasks_by_org_id ON tasks(org_id);
CREATE INDEX IF NOT EXISTS tasks_by_related_deal ON tasks(related_deal_id);
CREATE INDEX IF NOT EXISTS tasks_by_related_contact ON tasks(related_contact_id);
CREATE INDEX IF NOT EXISTS tasks_by_related_organization ON tasks(related_organization_id);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view tasks in their organization" ON tasks
  FOR SELECT USING (org_id = current_setting('app.current_org_id', true));

CREATE POLICY "Users can insert tasks in their organization" ON tasks
  FOR INSERT WITH CHECK (org_id = current_setting('app.current_org_id', true));

CREATE POLICY "Users can update tasks in their organization" ON tasks
  FOR UPDATE USING (org_id = current_setting('app.current_org_id', true));

CREATE POLICY "Users can delete tasks in their organization" ON tasks
  FOR DELETE USING (org_id = current_setting('app.current_org_id', true));

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  -- Set completed_at when status changes to Completed
  IF NEW.status = 'Completed' AND OLD.status != 'Completed' THEN
    NEW.completed_at = NOW();
  ELSIF NEW.status != 'Completed' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_tasks_updated_at_trigger
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_tasks_updated_at();

-- Insert sample tasks for development
INSERT INTO tasks (
  title, 
  description, 
  due_date, 
  status, 
  priority, 
  category,
  assigned_to,
  org_id,
  tags,
  notes
) VALUES 
(
  'Follow up with TechCorp on CRM proposal',
  'Call Sarah Johnson to discuss the CRM implementation proposal and address any concerns',
  CURRENT_DATE + INTERVAL '2 days',
  'Open',
  'High',
  'Call',
  'current_user',
  'temp-org',
  ARRAY['Follow-up', 'CRM', 'Proposal'],
  'Remember to mention the discount offer expires end of month'
),
(
  'Prepare demo for HealthFirst Medical',
  'Set up demo environment and prepare presentation materials for the healthcare CRM demo',
  CURRENT_DATE + INTERVAL '5 days',
  'Open',
  'Medium',
  'Meeting',
  'current_user',
  'temp-org',
  ARRAY['Demo', 'Healthcare', 'Presentation'],
  'Focus on HIPAA compliance features'
),
(
  'Send contract to GreenEnergy Solutions',
  'Email the finalized contract documents to Maria at GreenEnergy for signature',
  CURRENT_DATE + INTERVAL '1 day',
  'Open',
  'High',
  'Email',
  'current_user',
  'temp-org',
  ARRAY['Contract', 'Legal', 'Signature'],
  'Include payment terms and project timeline'
),
(
  'Complete onboarding for RetailMax',
  'Finalize the onboarding process and ensure all systems are properly configured',
  CURRENT_DATE - INTERVAL '2 days',
  'Open',
  'Critical',
  'General',
  'current_user',
  'temp-org',
  ARRAY['Onboarding', 'Setup', 'Configuration'],
  'Customer is waiting for go-live'
),
(
  'Update CRM documentation',
  'Review and update the user manual with new features from latest release',
  CURRENT_DATE + INTERVAL '10 days',
  'Open',
  'Low',
  'General',
  'current_user',
  'temp-org',
  ARRAY['Documentation', 'Manual', 'Update'],
  'Include screenshots of new dashboard'
),
(
  'Quarterly business review with TechCorp',
  'Conducted successful quarterly review meeting with key stakeholders',
  CURRENT_DATE - INTERVAL '5 days',
  'Completed',
  'Medium',
  'Meeting',
  'current_user',
  'temp-org',
  ARRAY['QBR', 'Review', 'Stakeholders'],
  'Great feedback on new features, planning expansion'
);

COMMENT ON TABLE tasks IS 'Task and activity management table for CRM';
COMMENT ON COLUMN tasks.status IS 'Task status: Open, Completed, Overdue, In Progress, Cancelled';
COMMENT ON COLUMN tasks.priority IS 'Task priority: Low, Medium, High, Critical';
COMMENT ON COLUMN tasks.category IS 'Task category: General, Call, Email, Meeting, Follow-up';
COMMENT ON COLUMN tasks.completed_at IS 'Timestamp when task was marked as completed';
