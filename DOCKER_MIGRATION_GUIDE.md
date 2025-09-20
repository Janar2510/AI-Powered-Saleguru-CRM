# 🐳 Docker-Based Migration Guide

## 🚀 **Quick Start - Apply Accounting Migrations**

### **Option 1: Simple Script (Recommended)**
```bash
# Make sure Docker is running, then:
./apply-accounting-migrations.sh
```

This script will:
- ✅ Check if Docker is running
- ✅ Let you choose Local or Remote Supabase
- ✅ Apply all 5 accounting migrations in order
- ✅ Verify the installation

### **Option 2: Full Docker Compose Stack**
```bash
# Start complete Supabase stack locally
docker-compose -f docker-compose.supabase.yml up -d

# Migrations will run automatically
# Access your local Supabase at:
# - Database: postgresql://postgres:postgres@localhost:54322/postgres
# - API: http://localhost:3000
# - Auth: http://localhost:9999
```

---

## 📋 **Migration Files Applied**

The Docker scripts will apply these migrations in order:

1. **`20250120000000_accounting_core.sql`**
   - Core accounting tables (periods, accounts, journals)
   - RLS policies and security
   - Views for trial balance and general ledger

2. **`20250120000001_accounting_seed_coa.sql`**
   - Chart of Accounts with standard accounts
   - Account defaults configuration
   - Current period setup

3. **`20250120000002_accounting_posting.sql`**
   - Posting functions for AR, AP, COGS
   - Journal creation and validation
   - Period closing functionality

4. **`20250120000003_accounting_triggers.sql`**
   - Auto-posting triggers for invoices
   - Payment settlement triggers
   - Stock movement COGS triggers

5. **`20250120000004_accounting_reports.sql`**
   - Financial statement views
   - Aging analysis reports
   - VAT summary reporting

---

## 🎯 **Usage Examples**

### **Local Development**
```bash
# Start local Supabase
./apply-accounting-migrations.sh
# Choose option 1 (Local)

# Your accounting system is now available at:
# postgresql://postgres:postgres@localhost:54322/postgres
```

### **Remote Deployment**
```bash
# Deploy to your hosted Supabase
./apply-accounting-migrations.sh
# Choose option 2 (Remote)
# Enter your Supabase URL and Service Role Key
```

### **Full Stack Development**
```bash
# Start complete Supabase ecosystem
docker-compose -f docker-compose.supabase.yml up -d

# Services available:
# - PostgreSQL: localhost:54322
# - PostgREST API: localhost:3000
# - Auth (GoTrue): localhost:9999
# - Storage: localhost:5000
```

---

## 🛠️ **Advanced Options**

### **Manual Migration with Docker**
```bash
# Start PostgreSQL only
docker run -d --name supabase-db \
  -p 54322:5432 \
  -e POSTGRES_DB=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  supabase/postgres:15.1.0.117

# Apply specific migration
docker exec -i supabase-db psql -U postgres -d postgres < \
  supabase/migrations/20250120000000_accounting_core.sql
```

### **Check Migration Status**
```bash
# Connect to database and check tables
docker exec -it supabase-db psql -U postgres -d postgres

# In PostgreSQL shell:
\dt acc_*              # List accounting tables
SELECT * FROM acc_accounts LIMIT 5;  # Check sample data
```

### **Reset and Rebuild**
```bash
# Stop and remove containers
docker stop supabase-db
docker rm supabase-db

# Start fresh and reapply
./apply-accounting-migrations.sh
```

---

## 🔧 **Troubleshooting**

### **Docker Not Running**
```bash
# Start Docker Desktop or Docker service
# On macOS: Open Docker Desktop app
# On Linux: sudo systemctl start docker
```

### **Permission Denied**
```bash
# Make scripts executable
chmod +x apply-accounting-migrations.sh
chmod +x docker-migrate.sh
```

### **Migration Already Applied**
- The scripts handle this gracefully
- Duplicate migrations will show warnings but won't fail
- Use `IF NOT EXISTS` clauses in migrations for safety

### **Connection Issues**
```bash
# Check if container is running
docker ps | grep supabase

# Check logs
docker logs supabase-db

# Test connection
docker exec supabase-db pg_isready -U postgres
```

---

## 📊 **What You Get**

After running the Docker migrations, you'll have:

### **Database Tables**
- ✅ `acc_periods` - Accounting periods
- ✅ `acc_accounts` - Chart of accounts
- ✅ `acc_journals` - Journal headers
- ✅ `acc_journal_lines` - Journal line items
- ✅ `acc_account_defaults` - Default account mappings

### **Functions & Views**
- ✅ Posting functions for automated entries
- ✅ Trial balance view
- ✅ Financial reporting views
- ✅ Period closing procedures

### **Security**
- ✅ Row-Level Security (RLS) enabled
- ✅ Organization-scoped data access
- ✅ Proper foreign key constraints

### **Sample Data**
- ✅ Standard chart of accounts
- ✅ Current accounting period
- ✅ Account defaults configured

---

## 🌐 **Environment Variables**

For Docker Compose, you can customize:

```bash
# .env file
POSTGRES_PASSWORD=your_secure_password
SUPABASE_JWT_SECRET=your-jwt-secret-min-32-chars
SUPABASE_URL=http://localhost:54322
```

---

## 🎉 **Next Steps**

1. **✅ Run migrations**: `./apply-accounting-migrations.sh`
2. **✅ Deploy Edge Functions**: Deploy `accounting-report` and `accounting-close-period`
3. **✅ Start your app**: Navigate to `/accounting` in your React app
4. **✅ Test functionality**: Create accounts, view trial balance, etc.

Your complete double-entry accounting system is now ready! 🧮


