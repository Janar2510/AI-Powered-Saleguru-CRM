#!/bin/bash

echo "🚀 Applying Quotes System Migration..."
echo "======================================"

# Check if supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Not in a Supabase project directory."
    echo "   Make sure you're in the project root and have run 'supabase init'"
    exit 1
fi

echo "📋 Migration file: supabase/migrations/20250121000000_quotes_system.sql"

# Check if migration file exists
if [ ! -f "supabase/migrations/20250121000000_quotes_system.sql" ]; then
    echo "❌ Migration file not found!"
    exit 1
fi

echo "🔄 Applying migration to local database..."

# Apply migration to local Supabase
supabase db reset

if [ $? -eq 0 ]; then
    echo "✅ Migration applied successfully!"
    echo ""
    echo "📊 Quotes system is now ready with:"
    echo "   • quotes table"
    echo "   • quote_line_items table" 
    echo "   • Row Level Security policies"
    echo "   • Sample data for testing"
    echo ""
    echo "🌐 Your quotes system should now work without errors!"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Restart your development server: npm run dev"
    echo "   2. Navigate to /quotes to test the system"
    echo "   3. For production, push migrations: supabase db push"
else
    echo "❌ Migration failed. Please check the error above."
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   1. Make sure Docker is running"
    echo "   2. Check if Supabase is started: supabase start"
    echo "   3. Check migration syntax in the SQL file"
    exit 1
fi

echo ""
echo "🎉 Quotes system setup complete!"
