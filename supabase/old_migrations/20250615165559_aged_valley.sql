/*
  # Create pipeline_stages table for frontend compatibility

  The frontend code expects a pipeline_stages table, but the database currently has a stages table.
  This migration creates the pipeline_stages table with the correct schema to match what the frontend expects.
*/

-- Create pipeline_stages table
CREATE TABLE IF NOT EXISTS pipeline_stages (
  id text PRIMARY KEY,
  name text NOT NULL,
  order integer NOT NULL,
  probability integer DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
  color text NOT NULL,
  pipeline_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add trigger for updated_at on pipeline_stages
CREATE TRIGGER update_pipeline_stages_updated_at
BEFORE UPDATE ON pipeline_stages
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security on pipeline_stages
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;

-- Create policy for pipeline_stages
CREATE POLICY "public_access_pipeline_stages" ON pipeline_stages
  FOR ALL USING (true);

-- Insert default pipeline stages for the 'default' pipeline
INSERT INTO pipeline_stages (id, name, order, probability, color, pipeline_id)
VALUES
  ('lead', 'Lead', 1, 10, '#3B82F6', 'default'),
  ('qualified', 'Qualified', 2, 25, '#10B981', 'default'),
  ('proposal', 'Proposal', 3, 50, '#F59E0B', 'default'),
  ('negotiation', 'Negotiation', 4, 75, '#EF4444', 'default'),
  ('closed', 'Closed Won', 5, 100, '#8B5CF6', 'default')
ON CONFLICT (id) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_pipeline_id ON pipeline_stages(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_order ON pipeline_stages(order);

