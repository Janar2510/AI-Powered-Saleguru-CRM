/*
  # Create automation_rules table

  1. New Tables
    - `automation_rules`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `description` (text)
      - `is_active` (boolean, default true)
      - `trigger_type` (text, required)
      - `trigger_config` (jsonb, required)
      - `condition_type` (text)
      - `condition_config` (jsonb)
      - `action_type` (text, required)
      - `action_config` (jsonb, required)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `created_by` (uuid, references auth.users)
      - `execution_count` (integer, default 0)
      - `last_executed` (timestamp)

  2. Security
    - Enable RLS on `automation_rules` table
    - Add policy for owner access and admin access
    - Create indexes for performance

  3. Functions
    - Create function to increment execution count
*/

-- Create automation_rules table
CREATE TABLE IF NOT EXISTS automation_rules (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  trigger_type text NOT NULL,
  trigger_config jsonb NOT NULL,
  condition_type text,
  condition_config jsonb NOT NULL DEFAULT '[]'::jsonb,
  action_type text NOT NULL,
  action_config jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  execution_count integer DEFAULT 0,
  last_executed timestamptz
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_automation_rules_trigger_type ON automation_rules(trigger_type);
CREATE INDEX IF NOT EXISTS idx_automation_rules_is_active ON automation_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_automation_rules_created_by ON automation_rules(created_by);

-- Add trigger for updated_at
CREATE TRIGGER update_automation_rules_updated_at
BEFORE UPDATE ON automation_rules
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;

-- Create policy for owner access and admin access
CREATE POLICY "owner_access_automation_rules" ON automation_rules
  FOR ALL USING (
    auth.uid() = created_by OR
    auth.uid() IS NULL OR
    is_developer_admin() OR
    has_admin_access()
  );

-- Create function to increment execution count
CREATE OR REPLACE FUNCTION increment_automation_rule_execution_count(rule_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE automation_rules
  SET 
    execution_count = execution_count + 1,
    last_executed = now()
  WHERE id = rule_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create automation_execution_logs table
CREATE TABLE IF NOT EXISTS automation_execution_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_id uuid NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,
  trigger_data jsonb NOT NULL,
  execution_result jsonb NOT NULL,
  execution_time integer NOT NULL, -- in milliseconds
  executed_at timestamptz DEFAULT now(),
  executed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_automation_execution_logs_rule_id ON automation_execution_logs(rule_id);
CREATE INDEX IF NOT EXISTS idx_automation_execution_logs_executed_at ON automation_execution_logs(executed_at);

-- Enable Row Level Security
ALTER TABLE automation_execution_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for owner access and admin access
CREATE POLICY "owner_access_automation_execution_logs" ON automation_execution_logs
  FOR ALL USING (
    auth.uid() = executed_by OR
    auth.uid() IS NULL OR
    is_developer_admin() OR
    has_admin_access() OR
    EXISTS (
      SELECT 1 FROM automation_rules
      WHERE automation_rules.id = automation_execution_logs.rule_id
      AND automation_rules.created_by = auth.uid()
    )
  );

-- Insert sample automation rules
INSERT INTO automation_rules (
  name,
  description,
  trigger_type,
  trigger_config,
  condition_type,
  condition_config,
  action_type,
  action_config
) VALUES
  (
    'Deal Won Notification',
    'Send notification and create follow-up task when a deal is marked as won',
    'deal_stage_changed',
    '{"id":"deal_stage_changed","name":"Deal Stage Changed","description":"Triggered when a deal moves to a different stage","category":"trigger","type":"deal_stage_changed","config":{"fromStage":"any","toStage":"closed-won"}}',
    NULL,
    '[]',
    'send_notification',
    '[{"id":"send_notification","name":"Send Notification","description":"Send an in-app notification","category":"action","type":"send_notification","config":{"message":"🎉 Deal {{deal.title}} with {{deal.company}} has been won! Value: ${{deal.value}}","recipientType":"user","recipientId":"current_user"}},{"id":"create_task","name":"Create Task","description":"Create a new task and assign it","category":"action","type":"create_task","config":{"title":"Send thank you email to {{deal.contact}}","description":"Follow up with a thank you email after winning the deal","dueDate":"in_1_day","priority":"high","assignTo":"current_user"}}]'
  ),
  (
    'Task Overdue Reminder',
    'Send notification when a task becomes overdue',
    'task_deadline_missed',
    '{"id":"task_deadline_missed","name":"Task Deadline Missed","description":"Triggered when a task becomes overdue","category":"trigger","type":"task_deadline_missed","config":{}}',
    NULL,
    '[]',
    'send_notification',
    '[{"id":"send_notification","name":"Send Notification","description":"Send an in-app notification","category":"action","type":"send_notification","config":{"message":"⚠️ Task \"{{task.title}}\" is now overdue! Due date was {{task.due_date}}","recipientType":"user","recipientId":"task.assigned_to"}},{"id":"send_email","name":"Send Email","description":"Send an email using a template","category":"action","type":"send_email","config":{"templateId":"task_overdue_reminder","to":"{{user.email}}","subject":"Task Overdue: {{task.title}}"}}]'
  ),
  (
    'New Contact Welcome',
    'Send welcome email when a new contact is created',
    'contact_created',
    '{"id":"contact_created","name":"New Contact Created","description":"Triggered when a new contact is added","category":"trigger","type":"contact_created","config":{}}',
    NULL,
    '[]',
    'send_email',
    '[{"id":"send_email","name":"Send Email","description":"Send an email using a template","category":"action","type":"send_email","config":{"templateId":"welcome_email","to":"{{contact.email}}","subject":"Welcome to {{company.name}}!"}},{"id":"create_task","name":"Create Task","description":"Create a new task and assign it","category":"action","type":"create_task","config":{"title":"Follow up with {{contact.name}}","description":"Initial outreach to new contact","dueDate":"in_3_days","priority":"medium","assignTo":"current_user"}}]'
  )
ON CONFLICT (id) DO NOTHING;