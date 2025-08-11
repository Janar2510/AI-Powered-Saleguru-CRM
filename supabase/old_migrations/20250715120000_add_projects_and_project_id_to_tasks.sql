-- Create projects table
CREATE TABLE projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    status text DEFAULT 'Active',
    start_date date,
    due_date date,
    owner_id uuid REFERENCES profiles (id) ON DELETE SET NULL,
    completion_percent numeric DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Add project_id to tasks table
ALTER TABLE tasks ADD COLUMN project_id uuid REFERENCES projects (id) ON DELETE SET NULL;

-- Index for fast lookup
CREATE INDEX idx_tasks_project_id ON tasks(project_id);

-- (Optional) Index for project owner
CREATE INDEX idx_projects_owner_id ON projects(owner_id);

-- RLS policy placeholders (customize as needed)
-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
-- Example policy: allow project owner to access
CREATE POLICY "Project owner can access" ON projects
  USING (auth.uid() = owner_id);

-- You may want to add more policies for team access, etc. 