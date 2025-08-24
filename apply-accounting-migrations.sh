#!/bin/bash

# Quick Docker-based Accounting Migration Script
set -e

echo "🧮 Applying Accounting System Migrations with Docker"
echo "=================================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Choose your deployment target:${NC}"
echo "1. 🏠 LOCAL Supabase (Docker container)"
echo "2. 🌐 REMOTE Supabase (your hosted instance)"

read -p "Enter choice (1 or 2): " target

if [ "$target" = "1" ]; then
    echo -e "${YELLOW}🏠 Setting up LOCAL Supabase with Docker...${NC}"
    
    # Start local PostgreSQL with Supabase image
    echo -e "${BLUE}📦 Starting PostgreSQL container...${NC}"
    docker run --rm -d \
        --name supabase-local \
        -p 54322:5432 \
        -e POSTGRES_DB=postgres \
        -e POSTGRES_USER=postgres \
        -e POSTGRES_PASSWORD=postgres \
        supabase/postgres:15.1.0.117

    # Wait for database to be ready
    echo -e "${YELLOW}⏳ Waiting for database to be ready...${NC}"
    sleep 10
    
    # Check if database is responding
    until docker exec supabase-local pg_isready -U postgres; do
        echo "Waiting for PostgreSQL..."
        sleep 2
    done

    echo -e "${GREEN}✅ Database is ready!${NC}"

    # Apply accounting migrations
    echo -e "${BLUE}📊 Applying accounting migrations...${NC}"
    
    MIGRATIONS=(
        "20250120000000_accounting_core.sql"
        "20250120000001_accounting_seed_coa.sql"
        "20250120000002_accounting_posting.sql"
        "20250120000003_accounting_triggers.sql"
        "20250120000004_accounting_reports.sql"
    )

    for migration in "${MIGRATIONS[@]}"; do
        migration_path="supabase/migrations/$migration"
        if [ -f "$migration_path" ]; then
            echo -e "${BLUE}📄 Applying: $migration${NC}"
            docker exec -i supabase-local psql -U postgres -d postgres < "$migration_path"
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ Successfully applied: $migration${NC}"
            else
                echo -e "${RED}❌ Failed to apply: $migration${NC}"
                exit 1
            fi
        else
            echo -e "${RED}❌ Migration file not found: $migration_path${NC}"
            exit 1
        fi
    done

    # Verify installation
    echo -e "${BLUE}🔍 Verifying accounting tables...${NC}"
    docker exec supabase-local psql -U postgres -d postgres -c "
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name LIKE 'acc_%' 
        ORDER BY table_name;
    "

    echo -e "${GREEN}🎉 Accounting system successfully installed locally!${NC}"
    echo -e "${BLUE}🔗 Database URL: postgresql://postgres:postgres@localhost:54322/postgres${NC}"
    echo -e "${YELLOW}💡 To stop the database: docker stop supabase-local${NC}"

elif [ "$target" = "2" ]; then
    echo -e "${YELLOW}🌐 Applying to REMOTE Supabase...${NC}"
    
    # Get Supabase connection details
    read -p "Enter your Supabase Project URL (e.g., https://xxx.supabase.co): " SUPABASE_URL
    read -s -p "Enter your Supabase Service Role Key: " SERVICE_KEY
    echo

    # Extract database connection details
    if [[ $SUPABASE_URL =~ https://([^.]+)\.supabase\.co ]]; then
        PROJECT_ID="${BASH_REMATCH[1]}"
        DB_HOST="db.${PROJECT_ID}.supabase.co"
    else
        echo -e "${RED}❌ Invalid Supabase URL format${NC}"
        exit 1
    fi

    echo -e "${BLUE}📊 Connecting to: $DB_HOST${NC}"

    # Apply migrations using Docker
    MIGRATIONS=(
        "20250120000000_accounting_core.sql"
        "20250120000001_accounting_seed_coa.sql"
        "20250120000002_accounting_posting.sql"
        "20250120000003_accounting_triggers.sql"
        "20250120000004_accounting_reports.sql"
    )

    for migration in "${MIGRATIONS[@]}"; do
        migration_path="supabase/migrations/$migration"
        if [ -f "$migration_path" ]; then
            echo -e "${BLUE}📄 Applying: $migration${NC}"
            
            docker run --rm -i \
                -v "$(pwd):/workspace" \
                postgres:15 \
                psql "postgresql://postgres:$SERVICE_KEY@$DB_HOST:5432/postgres" \
                -f "/workspace/$migration_path"
            
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ Successfully applied: $migration${NC}"
            else
                echo -e "${RED}❌ Failed to apply: $migration${NC}"
                echo -e "${YELLOW}💡 This might be normal if the migration was already applied${NC}"
            fi
        else
            echo -e "${RED}❌ Migration file not found: $migration_path${NC}"
            exit 1
        fi
    done

    echo -e "${GREEN}🎉 Accounting system migrations applied to remote Supabase!${NC}"

else
    echo -e "${RED}❌ Invalid choice${NC}"
    exit 1
fi

echo -e "${GREEN}✨ Migration process completed!${NC}"
echo -e "${BLUE}🧮 Your accounting system is now ready to use!${NC}"

