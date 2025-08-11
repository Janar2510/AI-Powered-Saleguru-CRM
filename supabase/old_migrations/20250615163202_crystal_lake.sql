-- Check if emails table already exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'emails') THEN
    -- Create emails table
    CREATE TABLE emails (
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
      status text DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'opened', 'clicked', 'bounced', 'spam', 'unsubscribed', 'archived', 'read')),
      opened_at timestamptz,
      has_attachments boolean DEFAULT false,
      created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );

    -- Add trigger for updated_at
    CREATE TRIGGER update_emails_updated_at
    BEFORE UPDATE ON emails
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    -- Enable Row Level Security
    ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

    -- Create policy for emails
    CREATE POLICY "owner_access_emails" ON emails
      FOR ALL USING (
        auth.uid() = created_by OR
        auth.uid() IS NULL OR
        is_developer_admin() OR
        has_admin_access()
      );

    -- Create indexes for emails
    CREATE INDEX idx_emails_to ON emails("to");
    CREATE INDEX idx_emails_deal_id ON emails(deal_id);
    CREATE INDEX idx_emails_contact_id ON emails(contact_id);
    CREATE INDEX idx_emails_tracking_id ON emails(tracking_id);
    CREATE INDEX idx_emails_sent_at ON emails(sent_at);
    CREATE INDEX idx_emails_status ON emails(status);
    CREATE INDEX idx_emails_created_by ON emails(created_by);
  END IF;

  -- Check if email_events table already exists
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'email_events') THEN
    -- Create email_events table
    CREATE TABLE email_events (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      email_id uuid NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
      event_type text NOT NULL CHECK (event_type IN ('send', 'open', 'click', 'bounce', 'spam', 'unsubscribe')),
      timestamp timestamptz DEFAULT now(),
      metadata jsonb DEFAULT '{}'::jsonb
    );

    -- Enable Row Level Security
    ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;

    -- Create policy for email_events
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

    -- Create indexes for email_events
    CREATE INDEX idx_email_events_email_id ON email_events(email_id);
    CREATE INDEX idx_email_events_event_type ON email_events(event_type);
    CREATE INDEX idx_email_events_timestamp ON email_events(timestamp);
  END IF;
END $$;

-- Create function to increment counter columns if it doesn't exist
-- Fix: Move the function definition outside the DO block
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

-- Create trigger for email events to update deal status
CREATE OR REPLACE FUNCTION trigger_automation_on_email_clicked()
RETURNS TRIGGER AS $$
DECLARE
  email_record record;
  deal_id uuid;
BEGIN
  -- Get the email details
  SELECT * INTO email_record FROM emails WHERE id = NEW.email_id;
  
  IF FOUND AND email_record.deal_id IS NOT NULL THEN
    -- Update the deal's last_email_status
    UPDATE deals
    SET 
      last_email_status = 'clicked',
      emails_count = COALESCE(emails_count, 0) + 1
    WHERE id = email_record.deal_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for email status changes to update deal status
CREATE OR REPLACE FUNCTION trigger_automation_on_email_opened()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if the status has changed to 'opened'
  IF NEW.status = 'opened' AND (OLD.status IS NULL OR OLD.status <> 'opened') THEN
    -- Update the deal if associated
    IF NEW.deal_id IS NOT NULL THEN
      UPDATE deals
      SET 
        last_email_status = 'opened',
        emails_count = COALESCE(emails_count, 0) + 1
      WHERE id = NEW.deal_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to email tables
DO $$
BEGIN
  -- Only create triggers if they don't exist
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'automation_email_opened') THEN
    CREATE TRIGGER automation_email_opened
      AFTER UPDATE OF status ON emails
      FOR EACH ROW
      EXECUTE FUNCTION trigger_automation_on_email_opened();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'automation_email_clicked') THEN
    CREATE TRIGGER automation_email_clicked
      AFTER INSERT ON email_events
      FOR EACH ROW
      EXECUTE FUNCTION trigger_automation_on_email_clicked();
  END IF;
END $$;