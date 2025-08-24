-- Event bus: append-only log of domain events
CREATE TABLE IF NOT EXISTS event_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  subject_type TEXT NOT NULL,    -- 'deal' | 'lead' | 'invoice' | ...
  subject_id UUID NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed BOOLEAN NOT NULL DEFAULT FALSE
);

-- High-level workflow container
CREATE TABLE IF NOT EXISTS automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- active | paused | draft
  trigger JSONB NOT NULL,                -- { kind: 'event'|'schedule', ... }
  graph JSONB NOT NULL,                  -- { nodes:[], edges:[] } ReactFlow-compatible
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Instance runs
CREATE TABLE IF NOT EXISTS automation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL,
  automation_id UUID NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'running', -- running | success | failed | cancelled
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  last_error TEXT,
  context JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Node-level execution journal
CREATE TABLE IF NOT EXISTS automation_run_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES automation_runs(id) ON DELETE CASCADE,
  node_id TEXT NOT NULL,
  node_type TEXT NOT NULL, -- action | condition | delay
  status TEXT NOT NULL DEFAULT 'pending', -- pending|success|failed|skipped
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  input JSONB,
  output JSONB,
  error TEXT
);

-- Delayed jobs queue (for Delay nodes & time-based triggers)
CREATE TABLE IF NOT EXISTS delayed_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL,
  automation_id UUID NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
  run_id UUID REFERENCES automation_runs(id) ON DELETE CASCADE,
  node_id TEXT NOT NULL,
  execute_at TIMESTAMPTZ NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 5
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_event_log_processed ON event_log(processed) WHERE processed = FALSE;
CREATE INDEX IF NOT EXISTS idx_delayed_jobs_execute_at ON delayed_jobs(execute_at);
CREATE INDEX IF NOT EXISTS idx_automations_org ON automations(org_id);
CREATE INDEX IF NOT EXISTS idx_runs_automation ON automation_runs(automation_id);

-- RLS
ALTER TABLE event_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_run_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE delayed_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for organization-based access
CREATE POLICY ev_org ON event_log FOR ALL USING (org_id = (SELECT org_id FROM profiles WHERE id = auth.uid() LIMIT 1));
CREATE POLICY au_org ON automations FOR ALL USING (org_id = (SELECT org_id FROM profiles WHERE id = auth.uid() LIMIT 1));
CREATE POLICY ar_org ON automation_runs FOR ALL USING (org_id = (SELECT org_id FROM profiles WHERE id = auth.uid() LIMIT 1));
CREATE POLICY ars_org ON automation_run_steps FOR SELECT USING (
  run_id IN (SELECT id FROM automation_runs r WHERE r.org_id = (SELECT org_id FROM profiles WHERE id = auth.uid() LIMIT 1))
);
CREATE POLICY dj_org ON delayed_jobs FOR ALL USING (org_id = (SELECT org_id FROM profiles WHERE id = auth.uid() LIMIT 1));

-- Helper: emit events from critical tables (deals, leads, invoices)
-- Example for deals:
CREATE OR REPLACE FUNCTION emit_deal_event() RETURNS TRIGGER AS $$
DECLARE 
  evt TEXT;
  org_id_val TEXT;
BEGIN
  -- Get org_id from the record
  org_id_val := COALESCE(NEW.org_id, OLD.org_id, 'temp-org');
  
  IF (TG_OP = 'INSERT') THEN 
    evt := 'deal.created';
  ELSIF (TG_OP = 'UPDATE') THEN
    IF (NEW.stage IS DISTINCT FROM OLD.stage) THEN
      evt := 'deal.stage_changed';
    ELSE
      evt := 'deal.updated';
    END IF;
  ELSIF (TG_OP = 'DELETE') THEN 
    evt := 'deal.deleted';
  END IF;

  INSERT INTO event_log(org_id, event_type, subject_type, subject_id, payload)
  VALUES (org_id_val, evt, 'deal', COALESCE(NEW.id, OLD.id),
          jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW)));

  RETURN COALESCE(NEW, OLD);
END; 
$$ LANGUAGE plpgsql;

-- Create trigger for deals table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'deals') THEN
    DROP TRIGGER IF EXISTS trg_emit_deal_event ON deals;
    CREATE TRIGGER trg_emit_deal_event
    AFTER INSERT OR UPDATE OR DELETE ON deals
    FOR EACH ROW EXECUTE FUNCTION emit_deal_event();
  END IF;
END $$;

-- Similar function for leads
CREATE OR REPLACE FUNCTION emit_lead_event() RETURNS TRIGGER AS $$
DECLARE 
  evt TEXT;
  org_id_val TEXT;
BEGIN
  -- Get org_id from the record (assuming leads have org_id)
  org_id_val := COALESCE(NEW.org_id, OLD.org_id, 'temp-org');
  
  IF (TG_OP = 'INSERT') THEN 
    evt := 'lead.created';
  ELSIF (TG_OP = 'UPDATE') THEN
    IF (NEW.status IS DISTINCT FROM OLD.status) THEN
      evt := 'lead.status_changed';
    ELSE
      evt := 'lead.updated';
    END IF;
  ELSIF (TG_OP = 'DELETE') THEN 
    evt := 'lead.deleted';
  END IF;

  INSERT INTO event_log(org_id, event_type, subject_type, subject_id, payload)
  VALUES (org_id_val, evt, 'lead', COALESCE(NEW.id, OLD.id),
          jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW)));

  RETURN COALESCE(NEW, OLD);
END; 
$$ LANGUAGE plpgsql;

-- Create trigger for leads table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leads') THEN
    DROP TRIGGER IF EXISTS trg_emit_lead_event ON leads;
    CREATE TRIGGER trg_emit_lead_event
    AFTER INSERT OR UPDATE OR DELETE ON leads
    FOR EACH ROW EXECUTE FUNCTION emit_lead_event();
  END IF;
END $$;

-- Similar function for tasks
CREATE OR REPLACE FUNCTION emit_task_event() RETURNS TRIGGER AS $$
DECLARE 
  evt TEXT;
  org_id_val TEXT;
BEGIN
  -- Get org_id from the record
  org_id_val := COALESCE(NEW.org_id, OLD.org_id, 'temp-org');
  
  IF (TG_OP = 'INSERT') THEN 
    evt := 'task.created';
  ELSIF (TG_OP = 'UPDATE') THEN
    IF (NEW.status IS DISTINCT FROM OLD.status) THEN
      evt := 'task.status_changed';
    ELSE
      evt := 'task.updated';
    END IF;
  ELSIF (TG_OP = 'DELETE') THEN 
    evt := 'task.deleted';
  END IF;

  INSERT INTO event_log(org_id, event_type, subject_type, subject_id, payload)
  VALUES (org_id_val, evt, 'task', COALESCE(NEW.id, OLD.id),
          jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW)));

  RETURN COALESCE(NEW, OLD);
END; 
$$ LANGUAGE plpgsql;

-- Create trigger for tasks table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks') THEN
    DROP TRIGGER IF EXISTS trg_emit_task_event ON tasks;
    CREATE TRIGGER trg_emit_task_event
    AFTER INSERT OR UPDATE OR DELETE ON tasks
    FOR EACH ROW EXECUTE FUNCTION emit_task_event();
  END IF;
END $$;
