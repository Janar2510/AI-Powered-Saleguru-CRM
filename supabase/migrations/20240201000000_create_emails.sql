-- Create emails table for email communications logging
CREATE TABLE IF NOT EXISTS emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('OUTGOING', 'INCOMING')),
  sent_by UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- user who sent (if outgoing)
  sent_to TEXT, -- recipient email (if outgoing)
  sent_from TEXT, -- sender email (if incoming)
  message_id TEXT, -- external email message ID for tracking
  thread_id TEXT, -- email thread ID for conversation grouping
  status TEXT DEFAULT 'SENT' CHECK (status IN ('DRAFT', 'SENT', 'DELIVERED', 'FAILED', 'OPENED')),
  external_service TEXT, -- 'GMAIL', 'OUTLOOK', 'MANUAL', etc.
  attachments JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT '{}',
  is_ai_generated BOOLEAN DEFAULT FALSE,
  ai_prompt TEXT, -- store AI prompt if email was AI-generated
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  date_sent TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS emails_by_contact ON emails(contact_id);
CREATE INDEX IF NOT EXISTS emails_by_deal ON emails(deal_id);
CREATE INDEX IF NOT EXISTS emails_by_org ON emails(org_id);
CREATE INDEX IF NOT EXISTS emails_by_direction ON emails(direction);
CREATE INDEX IF NOT EXISTS emails_by_date ON emails(date_sent DESC);
CREATE INDEX IF NOT EXISTS emails_by_thread ON emails(thread_id);

-- Enable RLS
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view emails from their organization" ON emails
  FOR SELECT USING (org_id IN (
    SELECT organization_id FROM user_organizations 
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert emails to their organization" ON emails
  FOR INSERT WITH CHECK (org_id IN (
    SELECT organization_id FROM user_organizations 
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update emails from their organization" ON emails
  FOR UPDATE USING (org_id IN (
    SELECT organization_id FROM user_organizations 
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete emails from their organization" ON emails
  FOR DELETE USING (org_id IN (
    SELECT organization_id FROM user_organizations 
    WHERE user_id = auth.uid()
  ));

-- Create email templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for email templates
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view email templates from their organization" ON email_templates
  FOR SELECT USING (org_id IN (
    SELECT organization_id FROM user_organizations 
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage email templates from their organization" ON email_templates
  FOR ALL USING (org_id IN (
    SELECT organization_id FROM user_organizations 
    WHERE user_id = auth.uid()
  ));

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_emails_updated_at BEFORE UPDATE ON emails
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
