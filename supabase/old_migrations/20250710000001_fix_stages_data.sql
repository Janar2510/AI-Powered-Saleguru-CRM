-- Fix stages table data and ensure proper pipeline relationship
BEGIN;

-- First, let's check if we have a default pipeline
INSERT INTO pipelines (id, name, is_default, created_at, updated_at)
VALUES (
  DEFAULT,
  'Default Sales Pipeline',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Get the pipeline ID that was just inserted
DO $$
DECLARE
    pipeline_id BIGINT;
BEGIN
    SELECT id INTO pipeline_id FROM pipelines WHERE name = 'Default Sales Pipeline' AND is_default = true LIMIT 1;
    
    -- Now insert the default stages if they don't exist
    INSERT INTO stages (id, name, sort_order, color, pipeline_id, created_at, updated_at)
    VALUES 
      (DEFAULT, 'Lead', 1, '#3B82F6', pipeline_id, NOW(), NOW()),
      (DEFAULT, 'Qualified', 2, '#10B981', pipeline_id, NOW(), NOW()),
      (DEFAULT, 'Proposal', 3, '#F59E0B', pipeline_id, NOW(), NOW()),
      (DEFAULT, 'Negotiation', 4, '#EF4444', pipeline_id, NOW(), NOW()),
      (DEFAULT, 'Closed', 5, '#8B5CF6', pipeline_id, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
END
$$;

-- Update any existing deals to use valid stage IDs (deals table doesn't have pipeline_id)
UPDATE deals 
SET stage_id = (SELECT id FROM stages WHERE name = 'Lead' LIMIT 1)
WHERE stage_id IS NULL;

COMMIT; 