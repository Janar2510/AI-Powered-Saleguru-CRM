#!/bin/bash

# Fix import statements in all Edge Functions
echo "Fixing import statements in Edge Functions..."

# Find all index.ts files in functions directory and fix imports
find supabase/functions -name "index.ts" -type f | while read file; do
    echo "Processing: $file"
    
    # Fix @supabase/supabase-js imports to use npm: prefix
    sed -i '' 's/import { createClient } from "@supabase\/supabase-js";/import { createClient } from "npm:@supabase\/supabase-js";/g' "$file"
    
    # Fix @supabase/functions-js imports to use npm: prefix
    sed -i '' 's/import { serve } from "@supabase\/functions-js";/import { serve } from "npm:@supabase\/functions-js";/g' "$file"
    
    echo "Updated: $file"
done

echo "Import statements fixed in all Edge Functions!" 