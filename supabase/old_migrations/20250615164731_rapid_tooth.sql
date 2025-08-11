/*
  # Tighten Row Level Security policies

  1. Changes:
    - Remove all auth.uid() IS NULL clauses from RLS policies
    - Restrict access to authenticated users only
    - Maintain role-based access for admins and developer admins
    - Ensure consistent policy structure across all tables
*/

-- Update leads access policy
DROP POLICY IF EXISTS "leads_access_policy" ON leads;
CREATE POLICY "leads_access_policy" ON leads
  FOR ALL
  TO authenticated
  USING (
    -- Allow access if user is the creator
    (auth.uid() = created_by) 
    OR 
    -- Allow access for developer admins
    is_developer_admin() 
    OR 
    -- Allow access for admins
    has_admin_access()
  )
  WITH CHECK (
    -- Same conditions for insert/update
    (auth.uid() = created_by) 
    OR 
    is_developer_admin() 
    OR 
    has_admin_access()
  );

-- Update deals access policy
DROP POLICY IF EXISTS "owner_access_deals" ON deals;
CREATE POLICY "owner_access_deals" ON deals
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = created_by OR
    is_developer_admin() OR
    has_admin_access()
  )
  WITH CHECK (
    auth.uid() = created_by OR
    is_developer_admin() OR
    has_admin_access()
  );

-- Update tasks access policy
DROP POLICY IF EXISTS "owner_access_tasks" ON tasks;
CREATE POLICY "owner_access_tasks" ON tasks
  FOR ALL
  TO authenticated
  USING (
    (auth.uid() = created_by) OR
    (auth.uid() = assigned_to) OR
    is_developer_admin() OR
    has_admin_access()
  )
  WITH CHECK (
    (auth.uid() = created_by) OR
    (auth.uid() = assigned_to) OR
    is_developer_admin() OR
    has_admin_access()
  );

-- Update calendar_events access policy
DROP POLICY IF EXISTS "calendar_events_access_policy" ON calendar_events;
CREATE POLICY "calendar_events_access_policy" ON calendar_events
  FOR ALL
  TO authenticated
  USING (
    -- Owner can access their own events
    (auth.uid() = created_by) 
    OR 
    -- Developer admin access
    is_developer_admin() 
    OR 
    -- Admin access
    has_admin_access()
    OR
    -- Check if user is in attendees list
    (
      attendees IS NOT NULL 
      AND 
      attendees ? 'attendee_ids' 
      AND 
      (auth.uid())::text = ANY(
        ARRAY(
          SELECT jsonb_array_elements_text(attendees->'attendee_ids')
        )
      )
    )
  )
  WITH CHECK (
    -- Same conditions for INSERT/UPDATE
    (auth.uid() = created_by) 
    OR 
    is_developer_admin() 
    OR 
    has_admin_access()
  );

-- Update contacts access policy
DROP POLICY IF EXISTS "Users can manage their own contacts" ON contacts;
CREATE POLICY "Users can manage their own contacts"
  ON contacts
  FOR ALL
  TO authenticated
  USING (
    created_by = auth.uid() OR 
    is_developer_admin() OR 
    has_admin_access()
  )
  WITH CHECK (
    created_by = auth.uid() OR 
    is_developer_admin() OR 
    has_admin_access()
  );

-- Update companies access policy
DROP POLICY IF EXISTS "owner_access_companies" ON companies;
CREATE POLICY "owner_access_companies" ON companies
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = created_by OR
    auth.uid() = assigned_to OR
    is_developer_admin() OR
    has_admin_access()
  )
  WITH CHECK (
    auth.uid() = created_by OR
    auth.uid() = assigned_to OR
    is_developer_admin() OR
    has_admin_access()
  );

-- Update emails access policy
DROP POLICY IF EXISTS "owner_access_emails" ON emails;
CREATE POLICY "owner_access_emails" ON emails
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = created_by OR
    is_developer_admin() OR
    has_admin_access()
  )
  WITH CHECK (
    auth.uid() = created_by OR
    is_developer_admin() OR
    has_admin_access()
  );

-- Update email_events access policy
DROP POLICY IF EXISTS "owner_access_email_events" ON email_events;
CREATE POLICY "owner_access_email_events" ON email_events
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM emails
      WHERE emails.id = email_events.email_id
      AND (
        emails.created_by = auth.uid() OR
        is_developer_admin() OR
        has_admin_access()
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM emails
      WHERE emails.id = email_events.email_id
      AND (
        emails.created_by = auth.uid() OR
        is_developer_admin() OR
        has_admin_access()
      )
    )
  );

-- Update automation_rules access policy
DROP POLICY IF EXISTS "owner_access_automation_rules" ON automation_rules;
CREATE POLICY "owner_access_automation_rules" ON automation_rules
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = created_by OR
    is_developer_admin() OR
    has_admin_access()
  )
  WITH CHECK (
    auth.uid() = created_by OR
    is_developer_admin() OR
    has_admin_access()
  );

-- Update automation_execution_logs access policy
DROP POLICY IF EXISTS "owner_access_automation_execution_logs" ON automation_execution_logs;
CREATE POLICY "owner_access_automation_execution_logs" ON automation_execution_logs
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = executed_by OR
    is_developer_admin() OR
    has_admin_access() OR
    EXISTS (
      SELECT 1 FROM automation_rules
      WHERE automation_rules.id = automation_execution_logs.rule_id
      AND automation_rules.created_by = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = executed_by OR
    is_developer_admin() OR
    has_admin_access() OR
    EXISTS (
      SELECT 1 FROM automation_rules
      WHERE automation_rules.id = automation_execution_logs.rule_id
      AND automation_rules.created_by = auth.uid()
    )
  );

-- Update developer_tools access policies
DROP POLICY IF EXISTS "developer_admin_access" ON developer_tools;
DROP POLICY IF EXISTS "admin_read_access" ON developer_tools;

CREATE POLICY "developer_admin_access" ON developer_tools
  FOR ALL
  TO authenticated
  USING (is_developer_admin())
  WITH CHECK (is_developer_admin());

CREATE POLICY "admin_read_access" ON developer_tools
  FOR SELECT
  TO authenticated
  USING (has_admin_access());

-- Update ai_logs access policies
DROP POLICY IF EXISTS "users_can_view_own_ai_logs" ON ai_logs;
DROP POLICY IF EXISTS "admins_can_view_all_ai_logs" ON ai_logs;

CREATE POLICY "users_can_view_own_ai_logs" ON ai_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "admins_can_view_all_ai_logs" ON ai_logs
  FOR SELECT
  TO authenticated
  USING (has_admin_access());

-- Update user_profiles access policies
DROP POLICY IF EXISTS "users_can_read_own_profiles" ON user_profiles;
DROP POLICY IF EXISTS "users_can_update_own_profiles" ON user_profiles;
DROP POLICY IF EXISTS "admins_can_read_all_profiles" ON user_profiles;
DROP POLICY IF EXISTS "admins_can_update_all_profiles" ON user_profiles;

CREATE POLICY "users_can_read_own_profiles" ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "users_can_update_own_profiles" ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "admins_can_read_all_profiles" ON user_profiles
  FOR SELECT
  TO authenticated
  USING (has_admin_access());

CREATE POLICY "admins_can_update_all_profiles" ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (has_admin_access())
  WITH CHECK (has_admin_access());

-- Update stages access policy
DROP POLICY IF EXISTS "public_access_stages" ON stages;
CREATE POLICY "authenticated_access_stages" ON stages
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (is_developer_admin() OR has_admin_access());