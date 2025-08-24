#!/bin/bash

# Docker-based Supabase Migration Script
# This script uses Docker to apply accounting migrations

set -e

echo "🚀 Starting Docker-based Supabase Migration Process..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Available Migration Options:${NC}"
echo "1. Apply migrations to LOCAL Supabase (Docker)"
echo "2. Apply migrations to REMOTE Supabase"
echo "3. Reset and apply ALL migrations (LOCAL)"
echo "4. Check migration status"

read -p "Choose an option (1-4): " choice

case $choice in
    1)
        echo -e "${YELLOW}🔄 Starting local Supabase with Docker...${NC}"
        
        # Stop any existing Supabase containers
        docker-compose -f docker-compose.supabase.yml down 2>/dev/null || true
        
        # Start Supabase locally using Docker
        echo -e "${BLUE}📦 Starting Supabase containers...${NC}"
        docker run --rm -d \
            --name supabase-db \
            -p 54322:5432 \
            -e POSTGRES_DB=postgres \
            -e POSTGRES_USER=postgres \
            -e POSTGRES_PASSWORD=postgres \
            supabase/postgres:15.1.0.117
        
        # Wait for PostgreSQL to be ready
        echo -e "${YELLOW}⏳ Waiting for PostgreSQL to be ready...${NC}"
        sleep 10
        
        # Apply migrations using Docker
        echo -e "${BLUE}📊 Applying accounting migrations...${NC}"
        docker run --rm \
            --network host \
            -v "$(pwd)/supabase/migrations:/migrations" \
            postgres:15 \
            bash -c "
                export PGPASSWORD=postgres
                echo '🔍 Checking existing tables...'
                psql -h localhost -p 54322 -U postgres -d postgres -c '\dt'
                
                echo '📋 Applying accounting migrations...'
                for migration in /migrations/20250120000000_accounting_core.sql \
                                /migrations/20250120000001_accounting_seed_coa.sql \
                                /migrations/20250120000002_accounting_posting.sql \
                                /migrations/20250120000003_accounting_triggers.sql \
                                /migrations/20250120000004_accounting_reports.sql; do
                    if [ -f \"\$migration\" ]; then
                        echo \"📄 Applying: \$(basename \$migration)\"
                        psql -h localhost -p 54322 -U postgres -d postgres -f \"\$migration\" || echo \"⚠️ Migration failed: \$(basename \$migration)\"
                    else
                        echo \"❌ Migration file not found: \$migration\"
                    fi
                done
                
                echo '✅ Verifying accounting tables...'
                psql -h localhost -p 54322 -U postgres -d postgres -c \"SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'acc_%';\"
            "
        
        echo -e "${GREEN}✅ Local migration completed!${NC}"
        echo -e "${BLUE}🔗 Database accessible at: postgresql://postgres:postgres@localhost:54322/postgres${NC}"
        ;;
        
    2)
        echo -e "${YELLOW}🌐 Applying migrations to REMOTE Supabase...${NC}"
        
        # Check for Supabase CLI in Docker
        if ! command -v supabase &> /dev/null; then
            echo -e "${BLUE}📦 Using Supabase CLI via Docker...${NC}"
            
            # Get Supabase credentials
            read -p "Enter your Supabase Project URL: " SUPABASE_URL
            read -s -p "Enter your Supabase Service Role Key: " SUPABASE_KEY
            echo
            
            # Apply migrations using Docker
            docker run --rm \
                -v "$(pwd):/workspace" \
                -w /workspace \
                -e SUPABASE_URL="$SUPABASE_URL" \
                -e SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_KEY" \
                postgres:15 \
                bash -c "
                    export PGPASSWORD=\$SUPABASE_SERVICE_ROLE_KEY
                    
                    echo '📋 Applying accounting migrations to remote Supabase...'
                    for migration in /workspace/supabase/migrations/20250120000000_accounting_core.sql \
                                    /workspace/supabase/migrations/20250120000001_accounting_seed_coa.sql \
                                    /workspace/supabase/migrations/20250120000002_accounting_posting.sql \
                                    /workspace/supabase/migrations/20250120000003_accounting_triggers.sql \
                                    /workspace/supabase/migrations/20250120000004_accounting_reports.sql; do
                        if [ -f \"\$migration\" ]; then
                            echo \"📄 Applying: \$(basename \$migration)\"
                            # Extract connection details from Supabase URL
                            HOST=\$(echo \$SUPABASE_URL | sed 's|.*://||' | sed 's|/.*||')
                            psql -h \$HOST -p 5432 -U postgres -d postgres -f \"\$migration\" || echo \"⚠️ Migration failed: \$(basename \$migration)\"
                        fi
                    done
                "
        else
            echo -e "${BLUE}📡 Using local Supabase CLI...${NC}"
            supabase db push
        fi
        
        echo -e "${GREEN}✅ Remote migration completed!${NC}"
        ;;
        
    3)
        echo -e "${YELLOW}🔄 Resetting and applying ALL migrations locally...${NC}"
        
        # Stop and remove existing containers
        docker stop supabase-db 2>/dev/null || true
        docker rm supabase-db 2>/dev/null || true
        
        # Start fresh PostgreSQL
        docker run --rm -d \
            --name supabase-db \
            -p 54322:5432 \
            -e POSTGRES_DB=postgres \
            -e POSTGRES_USER=postgres \
            -e POSTGRES_PASSWORD=postgres \
            supabase/postgres:15.1.0.117
        
        sleep 10
        
        # Apply ALL migrations in order
        echo -e "${BLUE}📊 Applying ALL migrations in order...${NC}"
        docker run --rm \
            --network host \
            -v "$(pwd)/supabase/migrations:/migrations" \
            postgres:15 \
            bash -c "
                export PGPASSWORD=postgres
                
                echo '📋 Applying migrations in chronological order...'
                find /migrations -name '*.sql' | sort | while read migration; do
                    echo \"📄 Applying: \$(basename \$migration)\"
                    psql -h localhost -p 54322 -U postgres -d postgres -f \"\$migration\" || echo \"⚠️ Migration failed: \$(basename \$migration)\"
                done
                
                echo '✅ Verifying final state...'
                psql -h localhost -p 54322 -U postgres -d postgres -c \"SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;\"
            "
        
        echo -e "${GREEN}✅ Full migration reset completed!${NC}"
        ;;
        
    4)
        echo -e "${YELLOW}🔍 Checking migration status...${NC}"
        
        if docker ps | grep -q supabase-db; then
            echo -e "${GREEN}✅ Local Supabase is running${NC}"
            
            docker run --rm \
                --network host \
                postgres:15 \
                bash -c "
                    export PGPASSWORD=postgres
                    echo '📊 Current database tables:'
                    psql -h localhost -p 54322 -U postgres -d postgres -c \"SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;\"
                    
                    echo '🧮 Accounting tables:'
                    psql -h localhost -p 54322 -U postgres -d postgres -c \"SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'acc_%';\"
                "
        else
            echo -e "${RED}❌ Local Supabase is not running${NC}"
        fi
        ;;
        
    *)
        echo -e "${RED}❌ Invalid option${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}🎉 Migration process completed!${NC}"

