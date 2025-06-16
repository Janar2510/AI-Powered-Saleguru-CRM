/*
  # Create email tracking tables

  1. New Tables
    - `emails`
      - `id` (uuid, primary key)
      - `to` (text, required)
      - `cc` (text)
      - `bcc` (text)
      - `subject` (text, required)
      - `html_body` (text)
      - `text_body` (text)
      - `template_id` (text)
      - `deal_id` (uuid, references deals)
      - `contact_id` (uuid, references contacts)
      - `tracking_id` (uuid)
      - `sent_at` (timestamp)
      - `status` (text, with check constraint)
      - `opened_at` (timestamp)
      - `has_attachments` (boolean)
      - `created_by` (uuid, references auth.users)
    
    - `email_events`
      - `id` (uuid, primary key)
      - `email_id` (uuid, references emails)
      - `event_type` (text, with check constraint)
      - `timestamp` (timestamp)
      - `metadata` (jsonb)

  2. Security
    - Enable RLS on both tables
    - Add policies for access control
    - Create indexes for performance

  3. Functions
    - Create function to increment counter columns
*/

-- Create emails table
CREATE TABLE IF NOT EXISTS emails (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "to" text NOT NULL,
  cc text,
  bcc text,
  subject text NOT NULL,
  html_body text,
  text_body text,
  template_id text,
  deal_id uuid REFERENCES deals(id) ON DELETE SET NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  tracking_id uuid DEFAULT uuid_generate_v4(),
  sent_at timestamptz,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'opened', 'clicked', 'bounced', 'spam', 'unsubscribed')),
  opened_at timestamptz,
  has_attachments boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create email_events table
CREATE TABLE IF NOT EXISTS email_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email_id uuid NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('send', 'open', 'click', 'bounce', 'spam', 'unsubscribe')),
  timestamp timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_emails_to ON emails("to");
CREATE INDEX IF NOT EXISTS idx_emails_deal_id ON emails(deal_id);
CREATE INDEX IF NOT EXISTS idx_emails_contact_id ON emails(contact_id);
CREATE INDEX IF NOT EXISTS idx_emails_tracking_id ON emails(tracking_id);
CREATE INDEX IF NOT EXISTS idx_emails_sent_at ON emails(sent_at);
CREATE INDEX IF NOT EXISTS idx_emails_status ON emails(status);
CREATE INDEX IF NOT EXISTS idx_emails_created_by ON emails(created_by);

CREATE INDEX IF NOT EXISTS idx_email_events_email_id ON email_events(email_id);
CREATE INDEX IF NOT EXISTS idx_email_events_event_type ON email_events(event_type);
CREATE INDEX IF NOT EXISTS idx_email_events_timestamp ON email_events(timestamp);

-- Add trigger for updated_at
CREATE TRIGGER update_emails_updated_at
BEFORE UPDATE ON emails
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "owner_access_emails" ON emails
  FOR ALL USING (
    auth.uid() = created_by OR
    auth.uid() IS NULL OR
    is_developer_admin() OR
    has_admin_access()
  );

CREATE POLICY "owner_access_email_events" ON email_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM emails
      WHERE emails.id = email_events.email_id
      AND (
        emails.created_by = auth.uid() OR
        auth.uid() IS NULL OR
        is_developer_admin() OR
        has_admin_access()
      )
    )
  );

-- Create function to increment counter columns
CREATE OR REPLACE FUNCTION increment_counter(row_id uuid, table_name text, counter_column text)
RETURNS integer AS $$
DECLARE
  current_value integer;
BEGIN
  EXECUTE format('
    SELECT %I FROM %I WHERE id = $1
  ', counter_column, table_name) INTO current_value USING row_id;
  
  IF current_value IS NULL THEN
    current_value := 0;
  END IF;
  
  RETURN current_value + 1;
END;
$$ LANGUAGE plpgsql;