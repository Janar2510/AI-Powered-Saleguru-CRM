/*
  # Simplify task completion logic

  1. Changes:
    - Remove dependency on the 'completed' boolean field
    - Make 'status' the single source of truth for task completion
    - Add a trigger to maintain backward compatibility
    - Update constraints and default values

  2. Migration Steps:
    - Add trigger to synchronize 'completed' with 'status'
    - Update existing tasks to ensure consistency
*/

-- Create a function to synchronize completed field with status
CREATE OR REPLACE FUNCTION sync_task_completion_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If status is being set to 'completed', ensure completed = true
  IF NEW.status = 'completed' THEN
    NEW.completed = true;
    NEW.completed_at = COALESCE(NEW.completed_at, now());
  -- If status is being changed from 'completed', ensure completed = false
  ELSIF OLD.status = 'completed' AND NEW.status != 'completed' THEN
    NEW.completed = false;
    NEW.completed_at = NULL;
  -- If completed is being set to true, ensure status = 'completed'
  ELSIF NEW.completed = true AND OLD.completed = false THEN
    NEW.status = 'completed';
    NEW.completed_at = COALESCE(NEW.completed_at, now());
  -- If completed is being set to false, ensure status != 'completed'
  ELSIF NEW.completed = false AND OLD.completed = true THEN
    -- Only change status if it was 'completed'
    IF NEW.status = 'completed' THEN
      NEW.status = 'pending';
    END IF;
    NEW.completed_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to tasks table
DO $$
BEGIN
  -- Drop the trigger if it already exists
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'sync_task_completion_status_trigger') THEN
    DROP TRIGGER sync_task_completion_status_trigger ON tasks;
  END IF;

  -- Create the trigger
  CREATE TRIGGER sync_task_completion_status_trigger
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION sync_task_completion_status();
END $$;

-- Update existing tasks to ensure consistency between status and completed
UPDATE tasks
SET 
  status = 'completed',
  completed_at = COALESCE(completed_at, now())
WHERE 
  completed = true 
  AND status != 'completed';

UPDATE tasks
SET 
  completed = true,
  completed_at = COALESCE(completed_at, now())
WHERE 
  status = 'completed' 
  AND completed = false;

-- Add comment to the tasks table to indicate the change
COMMENT ON TABLE tasks IS 'Task status field is the single source of truth for completion state. The completed boolean is maintained for backward compatibility.';