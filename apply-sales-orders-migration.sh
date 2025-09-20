#!/bin/bash

# Apply Sales Orders Migration
# This script applies the sales orders database migration using Supabase CLI

echo "🚀 Applying Sales Orders System Migration..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Not in a Supabase project directory. Please run this from the project root."
    exit 1
fi

# Apply the migration
echo "📋 Applying migration: 20250121000001_sales_orders_system.sql"
supabase migration up --file 20250121000001_sales_orders_system.sql

if [ $? -eq 0 ]; then
    echo "✅ Sales Orders migration applied successfully!"
    echo ""
    echo "🎉 Your database now includes:"
    echo "   • sales_orders table"
    echo "   • sales_order_line_items table" 
    echo "   • shipping_management table"
    echo "   • DHL integration support"
    echo "   • Sample data for testing"
    echo ""
    echo "🔗 Sales Orders workflow:"
    echo "   Quote → Sales Order → Invoice → Receipt"
    echo ""
    echo "📦 Shipping features:"
    echo "   • DHL Express integration"
    echo "   • Package tracking"
    echo "   • Label generation"
    echo "   • Delivery management"
else
    echo "❌ Migration failed. Please check the error above."
    exit 1
fi

