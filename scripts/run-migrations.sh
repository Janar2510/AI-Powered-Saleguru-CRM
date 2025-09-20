#!/bin/bash

# Migration runner script for Docker Compose
set -e

echo "🚀 Starting migration process..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until pg_isready -h postgres -p 5432 -U postgres; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "✅ PostgreSQL is ready!"

# Apply migrations in order
echo "📊 Applying migrations..."

# Function to apply a migration with error handling
apply_migration() {
    local migration_file=$1
    local migration_name=$(basename "$migration_file")
    
    if [ -f "$migration_file" ]; then
        echo "📄 Applying: $migration_name"
        if psql -h postgres -p 5432 -U postgres -d postgres -f "$migration_file"; then
            echo "✅ Successfully applied: $migration_name"
        else
            echo "⚠️ Failed to apply: $migration_name"
            return 1
        fi
    else
        echo "❌ Migration file not found: $migration_file"
        return 1
    fi
}

# Apply migrations in chronological order
echo "📋 Applying all migrations in order..."

# Find and sort all migration files
find /migrations -name "*.sql" | sort | while read migration; do
    apply_migration "$migration"
done

# Verify accounting tables were created
echo "🔍 Verifying accounting tables..."
psql -h postgres -p 5432 -U postgres -d postgres -c "
    SELECT 
        table_name, 
        table_type 
    FROM information_schema.tables 
    WHERE table_name LIKE 'acc_%' 
    ORDER BY table_name;
"

echo "🎉 Migration process completed successfully!"


