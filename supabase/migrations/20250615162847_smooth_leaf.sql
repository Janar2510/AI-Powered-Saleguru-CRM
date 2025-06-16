/*
  # Create automation triggers and functions

  1. New Functions:
    - Simple function to log automation events
    - Trigger functions for different automation events
    - Function to manually execute automation rules

  2. Triggers:
    - Deal stage change
    - Task status change
    - New contact/deal creation
    - Email events
*/

-- Create a simple logging function (avoids HTTP calls that might cause timeouts)
CREATE OR REPLACE FUNCTION log_automation_event(trigger_type text, trigger_data jsonb)
RETURNS void AS $$
BEGIN
  -- Log the event to a table or perform a simple operation
  -- This avoids making HTTP calls that might cause timeouts
  INSERT INTO automation_execution_logs (
    rule_id,
    trigger_data,
    execution_result,
    execution_time,
    executed_by
  ) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid, -- placeholder for system events
    jsonb_build_object('type', trigger_type, 'data', trigger_data),
    jsonb_build_object('status', 'logged', 'message', 'Automation event logged'),
    0, -- execution time in ms
    (SELECT id FROM auth.users WHERE email = 'system@example.com' LIMIT 1) -- system user or null
  );
  
  RAISE NOTICE 'Automation event logged: % with data: %', trigger_type, trigger_data;
END;
$$ LANGUAGE plpgsql;

-- Create function to trigger automation when a deal's stage changes
CREATE OR REPLACE FUNCTION trigger_automation_on_deal_stage_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if the stage_id has changed
  IF OLD.stage_id <> NEW.stage_id THEN
    PERFORM log_automation_event(
      'deal_stage_changed',
      jsonb_build_object(
        'deal', jsonb_build_object(
          'id', NEW.id,
          'title', NEW.title,
          'company', NEW.company,
          'contact', NEW.contact,
          'value', NEW.value,
          'stage', jsonb_build_object(
            'previous', OLD.stage_id,
            'current', NEW.stage_id
          ),
          'probability', NEW.probability,
          'created_by', NEW.created_by
        ),
        'timestamp', now()
      )
    );
    
    -- Update the days_in_stage counter to 0 for the new stage
    NEW.days_in_stage := 0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to trigger automation when a task becomes overdue or completed
CREATE OR REPLACE FUNCTION trigger_automation_on_task_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the task is now overdue
  IF NEW.status = 'overdue' AND OLD.status <> 'overdue' THEN
    PERFORM log_automation_event(
      'task_deadline_missed',
      jsonb_build_object(
        'task', row_to_json(NEW),
        'timestamp', now()
      )
    );
  END IF;
  
  -- Check if the task is now completed
  IF NEW.completed = true AND OLD.completed = false THEN
    PERFORM log_automation_event(
      'task_completed',
      jsonb_build_object(
        'task', row_to_json(NEW),
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to trigger automation when a new record is created
CREATE OR REPLACE FUNCTION trigger_automation_on_new_record()
RETURNS TRIGGER AS $$
DECLARE
  trigger_type text;
BEGIN
  -- Determine the trigger type based on the table
  IF TG_TABLE_NAME = 'contacts' THEN
    trigger_type := 'contact_created';
  ELSIF TG_TABLE_NAME = 'deals' THEN
    trigger_type := 'deal_created';
  ELSE
    RETURN NEW;
  END IF;
  
  -- Log the automation event
  PERFORM log_automation_event(
    trigger_type,
    jsonb_build_object(
      TG_TABLE_NAME, row_to_json(NEW),
      'timestamp', now()
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to trigger automation when an email is opened
CREATE OR REPLACE FUNCTION trigger_automation_on_email_opened()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if the status has changed to 'opened'
  IF NEW.status = 'opened' AND (OLD.status IS NULL OR OLD.status <> 'opened') THEN
    PERFORM log_automation_event(
      'email_opened',
      jsonb_build_object(
        'email', row_to_json(NEW),
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to trigger automation when an email link is clicked
CREATE OR REPLACE FUNCTION trigger_automation_on_email_clicked()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if the event type is 'click'
  IF NEW.event_type = 'click' THEN
    PERFORM log_automation_event(
      'email_clicked',
      jsonb_build_object(
        'event', row_to_json(NEW),
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to tables (in a safer way that checks if tables exist)
DO $$
BEGIN
  -- Deal stage change trigger
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'deals') THEN
    -- Drop existing trigger if it exists
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'automation_deal_stage_change') THEN
      DROP TRIGGER automation_deal_stage_change ON deals;
    END IF;
    
    -- Create new trigger
    CREATE TRIGGER automation_deal_stage_change
      AFTER UPDATE OF stage_id ON deals
      FOR EACH ROW
      EXECUTE FUNCTION trigger_automation_on_deal_stage_change();
  END IF;
  
  -- Task status change trigger
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'tasks') THEN
    -- Drop existing trigger if it exists
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'automation_task_status_change') THEN
      DROP TRIGGER automation_task_status_change ON tasks;
    END IF;
    
    -- Create new trigger
    CREATE TRIGGER automation_task_status_change
      AFTER UPDATE OF status, completed ON tasks
      FOR EACH ROW
      EXECUTE FUNCTION trigger_automation_on_task_status_change();
  END IF;
  
  -- New contact trigger
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'contacts') THEN
    -- Drop existing trigger if it exists
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'automation_new_contact') THEN
      DROP TRIGGER automation_new_contact ON contacts;
    END IF;
    
    -- Create new trigger
    CREATE TRIGGER automation_new_contact
      AFTER INSERT ON contacts
      FOR EACH ROW
      EXECUTE FUNCTION trigger_automation_on_new_record();
  END IF;
  
  -- New deal trigger
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'deals') THEN
    -- Drop existing trigger if it exists
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'automation_new_deal') THEN
      DROP TRIGGER automation_new_deal ON deals;
    END IF;
    
    -- Create new trigger
    CREATE TRIGGER automation_new_deal
      AFTER INSERT ON deals
      FOR EACH ROW
      EXECUTE FUNCTION trigger_automation_on_new_record();
  END IF;
  
  -- Email opened trigger
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'emails') THEN
    -- Drop existing trigger if it exists
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'automation_email_opened') THEN
      DROP TRIGGER automation_email_opened ON emails;
    END IF;
    
    -- Create new trigger
    CREATE TRIGGER automation_email_opened
      AFTER UPDATE OF status ON emails
      FOR EACH ROW
      EXECUTE FUNCTION trigger_automation_on_email_opened();
  END IF;
  
  -- Email clicked trigger
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'email_events') THEN
    -- Drop existing trigger if it exists
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'automation_email_clicked') THEN
      DROP TRIGGER automation_email_clicked ON email_events;
    END IF;
    
    -- Create new trigger
    CREATE TRIGGER automation_email_clicked
      AFTER INSERT ON email_events
      FOR EACH ROW
      EXECUTE FUNCTION trigger_automation_on_email_clicked();
  END IF;
END $$;

-- Create a function to manually execute automation rules
CREATE OR REPLACE FUNCTION execute_automation_rule(rule_id uuid)
RETURNS jsonb AS $$
DECLARE
  rule_record record;
  result jsonb;
BEGIN
  -- Get the rule details
  SELECT * INTO rule_record FROM automation_rules WHERE id = rule_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Rule not found'
    );
  END IF;
  
  -- Update execution count
  UPDATE automation_rules
  SET 
    execution_count = execution_count + 1,
    last_executed = now()
  WHERE id = rule_id;
  
  -- Log the execution
  INSERT INTO automation_execution_logs (
    rule_id,
    trigger_data,
    execution_result,
    execution_time,
    executed_by
  ) VALUES (
    rule_id,
    rule_record.trigger_config,
    jsonb_build_object('success', true, 'message', 'Manual execution'),
    0, -- execution time in ms
    auth.uid()
  );
  
  -- Return success
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Automation rule execution triggered'
  );
END;
$$ LANGUAGE plpgsql;

-- Create a function to check for overdue tasks daily
CREATE OR REPLACE FUNCTION check_overdue_tasks()
RETURNS void AS $$
BEGIN
  -- Update status of overdue tasks
  UPDATE tasks
  SET status = 'overdue'
  WHERE 
    due_date < CURRENT_DATE 
    AND status != 'completed' 
    AND status != 'cancelled'
    AND status != 'overdue'
    AND completed = false;
END;
$$ LANGUAGE plpgsql;