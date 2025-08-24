# Safe Migration Guide

Since Docker is having issues, here's how to run the migration safely in your remote Supabase instance:

## Step 1: Backup Your Data (IMPORTANT!)

Before running any migration, create a backup:

1. Go to your Supabase Dashboard
2. Navigate to Settings > Database
3. Click "Database Backups" 
4. Create a manual backup with name: "before-deal-detail-migration"

## Step 2: Validate Compatibility

Run the validation script first:

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `scripts/validate-migration.sql`
3. Click "Run" to check compatibility
4. Make sure all checks show ✅ (green checkmarks)

## Step 3: Run Migration in Stages

Instead of running the full migration at once, run it in smaller chunks:

### Stage 1: Create Tables Only
```sql
-- Copy just the CREATE TABLE statements from:
-- supabase/migrations/20240120000001_create_deal_detail_system_fixed.sql
-- Lines 7-117 (the table definitions)
```

### Stage 2: Create Indexes
```sql
-- Copy the CREATE INDEX statements
-- Lines 119-138
```

### Stage 3: Create Sequences and Functions
```sql
-- Copy the sequences and functions
-- Lines 140-276
```

### Stage 4: Create RPC Functions
```sql
-- Copy the RPC function definitions
-- Lines 278-396
```

### Stage 5: Enable RLS and Create Policies
```sql
-- Copy the RLS setup
-- Lines 445-500
```

## Step 4: Test After Each Stage

After each stage, run a simple test:

```sql
-- Test that you can insert a test record
INSERT INTO deal_activities (
  deal_id, 
  type, 
  title, 
  description, 
  created_by
) VALUES (
  (SELECT id FROM deals LIMIT 1),
  'note',
  'Test Activity',
  'This is a test',
  auth.uid()
);

-- Then delete it
DELETE FROM deal_activities WHERE title = 'Test Activity';
```

## Rollback Plan

If something goes wrong:

1. Go to Settings > Database > Database Backups
2. Restore the backup you created in Step 1
3. Your data will be restored to the state before the migration

## Alternative: Manual Table Creation

If the migration fails, you can create tables manually using the Supabase Dashboard:

1. Go to Table Editor
2. Click "Create a new table"
3. Use the table definitions from the migration file

This approach is safer but takes longer.

