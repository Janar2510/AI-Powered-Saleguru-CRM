-- Add advanced AI features tables
-- This migration adds tables for Live Sentiment Replay™, ChronoDeals™, and other advanced features

-- Create deal_emotions table for Live Sentiment Replay™
CREATE TABLE IF NOT EXISTS public.deal_emotions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  source text NOT NULL CHECK (source IN ('email', 'call', 'chat', 'meeting', 'note')),
  content text NOT NULL,
  sentiment text NOT NULL CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  emotion text NOT NULL,
  score numeric NOT NULL CHECK (score >= 0 AND score <= 100),
  timestamp timestamptz DEFAULT now()
);

-- Create chrono_lead_scores table for ChronoDeals™
CREATE TABLE IF NOT EXISTS public.chrono_lead_scores (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  base_score numeric NOT NULL DEFAULT 0,
  time_factors jsonb NOT NULL DEFAULT '{}',
  final_score numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create call_transcripts table for call analysis
CREATE TABLE IF NOT EXISTS public.call_transcripts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  call_type text DEFAULT 'sales_call' CHECK (call_type IN ('sales_call', 'discovery_call', 'demo_call', 'negotiation_call', 'follow_up')),
  duration integer DEFAULT 0,
  audio_url text,
  transcript text,
  summary text,
  key_points text[],
  action_items text[],
  sentiment text CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  deal_stage text CHECK (deal_stage IN ('qualification', 'discovery', 'proposal', 'negotiation', 'closing')),
  risk_level text CHECK (risk_level IN ('low', 'medium', 'high')),
  recommendations text[],
  confidence_score numeric(3,2) DEFAULT 0.0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create branding table for document templates
CREATE TABLE IF NOT EXISTS public.branding (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id uuid REFERENCES orgs(id) ON DELETE CASCADE,
  company_name text,
  logo_url text,
  primary_color text DEFAULT '#3B82F6',
  accent_color text DEFAULT '#111827',
  text_color text DEFAULT '#111827',
  bg_color text DEFAULT '#ffffff',
  font_family text DEFAULT 'Inter, Arial, sans-serif',
  default_template text DEFAULT 'modern',
  updated_at timestamptz DEFAULT now()
);

-- Create doc_templates table for document templates
CREATE TABLE IF NOT EXISTS public.doc_templates (
  id text PRIMARY KEY,
  org_id uuid REFERENCES orgs(id) ON DELETE CASCADE,
  kind text NOT NULL,
  html text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create documents table for generated documents
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid REFERENCES orgs(id) ON DELETE CASCADE,
  ref_type text,
  ref_id uuid,
  title text,
  template_id text REFERENCES doc_templates(id),
  html text,
  format text DEFAULT 'html',
  created_at timestamptz DEFAULT now()
);

-- Create esign_requests table for eSignature
CREATE TABLE IF NOT EXISTS public.esign_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid REFERENCES orgs(id) ON DELETE CASCADE,
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  signer_email text NOT NULL,
  signer_name text,
  status text DEFAULT 'requested' CHECK (status IN ('requested', 'viewed', 'signed', 'declined', 'expired')),
  token text UNIQUE,
  signed_at timestamptz
);

-- Create automation_rules table for automation
CREATE TABLE IF NOT EXISTS public.automation_rules (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid REFERENCES orgs(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  trigger_type text NOT NULL,
  trigger_config jsonb DEFAULT '{}',
  condition_config jsonb DEFAULT '{}',
  action_config jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  execution_count integer DEFAULT 0,
  last_executed timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create automation_execution_logs table
CREATE TABLE IF NOT EXISTS public.automation_execution_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_id uuid REFERENCES automation_rules(id) ON DELETE CASCADE,
  trigger_data jsonb DEFAULT '{}',
  execution_result jsonb DEFAULT '{}',
  execution_time integer,
  created_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_deal_emotions_deal_id ON public.deal_emotions(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_emotions_user_id ON public.deal_emotions(user_id);
CREATE INDEX IF NOT EXISTS idx_deal_emotions_timestamp ON public.deal_emotions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_deal_emotions_sentiment ON public.deal_emotions(sentiment);
CREATE INDEX IF NOT EXISTS idx_deal_emotions_score ON public.deal_emotions(score DESC);

CREATE INDEX IF NOT EXISTS idx_chrono_lead_scores_contact_id ON public.chrono_lead_scores(contact_id);
CREATE INDEX IF NOT EXISTS idx_chrono_lead_scores_final_score ON public.chrono_lead_scores(final_score DESC);
CREATE INDEX IF NOT EXISTS idx_chrono_lead_scores_updated_at ON public.chrono_lead_scores(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_call_transcripts_contact_id ON public.call_transcripts(contact_id);
CREATE INDEX IF NOT EXISTS idx_call_transcripts_deal_id ON public.call_transcripts(deal_id);
CREATE INDEX IF NOT EXISTS idx_call_transcripts_created_at ON public.call_transcripts(created_at);
CREATE INDEX IF NOT EXISTS idx_call_transcripts_status ON public.call_transcripts(status);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_chrono_lead_scores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chrono_lead_scores_updated_at
  BEFORE UPDATE ON public.chrono_lead_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_chrono_lead_scores_updated_at();

CREATE OR REPLACE FUNCTION update_call_transcripts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_call_transcripts_updated_at
  BEFORE UPDATE ON public.call_transcripts
  FOR EACH ROW
  EXECUTE FUNCTION update_call_transcripts_updated_at();

-- Insert sample data for testing
INSERT INTO public.doc_templates (id, org_id, kind, html) VALUES
  ('modern', '550e8400-e29b-41d4-a716-446655440000', 'invoice', '<div class="modern-invoice">...</div>'),
  ('minimal', '550e8400-e29b-41d4-a716-446655440000', 'invoice', '<div class="minimal-invoice">...</div>'),
  ('classic', '550e8400-e29b-41d4-a716-446655440000', 'invoice', '<div class="classic-invoice">...</div>')
ON CONFLICT (id) DO NOTHING;

-- Insert sample branding data (commented out for now - will be added when user is created)
-- INSERT INTO public.branding (user_id, org_id, company_name, primary_color, accent_color) VALUES
--   ('demo-user-id', '550e8400-e29b-41d4-a716-446655440000', 'SaleToru CRM', '#3B82F6', '#111827')
-- ON CONFLICT (user_id) DO NOTHING;
