-- Drop the existing problematic policy
DROP POLICY IF EXISTS "owner_access_calendar_events" ON calendar_events;

-- Create a new simplified policy that avoids infinite recursion
CREATE POLICY "calendar_events_access_policy"
  ON calendar_events
  FOR ALL
  TO public
  USING (
    -- Owner can access their own events
    (auth.uid() = created_by) 
    OR 
    -- Allow access when auth.uid is null (for system operations)
    (auth.uid() IS NULL) 
    OR 
    -- Developer admin access
    is_developer_admin() 
    OR 
    -- Admin access
    has_admin_access()
    OR
    -- Check if user is in attendees list (without self-referencing)
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
    (auth.uid() IS NULL) 
    OR 
    is_developer_admin() 
    OR 
    has_admin_access()
  );