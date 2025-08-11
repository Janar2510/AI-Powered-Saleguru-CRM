#!/bin/bash

# Fix CORS headers in all Edge Functions
echo "Fixing CORS headers in Edge Functions..."

# Find all index.ts files in functions directory and update CORS headers
find supabase/functions -name "index.ts" -type f | while read file; do
    echo "Processing: $file"
    
    # Update CORS headers to include x-client-info and apikey
    sed -i '' 's/"Access-Control-Allow-Headers": "Content-Type, Authorization"/"Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey"/g' "$file"
    
    echo "Updated: $file"
done

echo "CORS headers fixed in all Edge Functions!" 