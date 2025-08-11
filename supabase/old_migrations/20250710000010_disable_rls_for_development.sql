-- Disable RLS for development
ALTER TABLE deals DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE stages DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Drop any existing RLS policies
DROP POLICY IF EXISTS "Enable read access for all users" ON deals;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON deals;
DROP POLICY IF EXISTS "Enable update for users based on owner_id" ON deals;
DROP POLICY IF EXISTS "Enable delete for users based on owner_id" ON deals;

DROP POLICY IF EXISTS "Enable read access for all users" ON contacts;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON contacts;
DROP POLICY IF EXISTS "Enable update for users based on owner_id" ON contacts;
DROP POLICY IF EXISTS "Enable delete for users based on owner_id" ON contacts;

DROP POLICY IF EXISTS "Enable read access for all users" ON companies;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON companies;
DROP POLICY IF EXISTS "Enable update for users based on owner_id" ON companies;
DROP POLICY IF EXISTS "Enable delete for users based on owner_id" ON companies;

DROP POLICY IF EXISTS "Enable read access for all users" ON leads;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON leads;
DROP POLICY IF EXISTS "Enable update for users based on owner_id" ON leads;
DROP POLICY IF EXISTS "Enable delete for users based on owner_id" ON leads;

DROP POLICY IF EXISTS "Enable read access for all users" ON stages;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON stages;
DROP POLICY IF EXISTS "Enable update for users based on owner_id" ON stages;
DROP POLICY IF EXISTS "Enable delete for users based on owner_id" ON stages;

DROP POLICY IF EXISTS "Enable read access for all users" ON tasks;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON tasks;
DROP POLICY IF EXISTS "Enable update for users based on owner_id" ON tasks;
DROP POLICY IF EXISTS "Enable delete for users based on owner_id" ON tasks;

DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable update for users based on owner_id" ON users;
DROP POLICY IF EXISTS "Enable delete for users based on owner_id" ON users; 