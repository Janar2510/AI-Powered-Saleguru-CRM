-- Branding settings per admin user
CREATE TABLE IF NOT EXISTS branding (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  company_name TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3B82F6',  -- Tailwind blue-500
  accent_color TEXT DEFAULT '#111827',   -- gray-900
  text_color TEXT DEFAULT '#111827',
  bg_color TEXT DEFAULT '#ffffff',
  font_family TEXT DEFAULT 'Inter, Arial, sans-serif',
  default_template TEXT DEFAULT 'modern',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add accent_color column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'branding' AND column_name = 'accent_color') THEN
        ALTER TABLE branding ADD COLUMN accent_color TEXT DEFAULT '#111827';
    END IF;
    
    -- Add text_color column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'branding' AND column_name = 'text_color') THEN
        ALTER TABLE branding ADD COLUMN text_color TEXT DEFAULT '#111827';
    END IF;
    
    -- Add bg_color column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'branding' AND column_name = 'bg_color') THEN
        ALTER TABLE branding ADD COLUMN bg_color TEXT DEFAULT '#ffffff';
    END IF;
    
    -- Add font_family column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'branding' AND column_name = 'font_family') THEN
        ALTER TABLE branding ADD COLUMN font_family TEXT DEFAULT 'Inter, Arial, sans-serif';
    END IF;
    
    -- Add default_template column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'branding' AND column_name = 'default_template') THEN
        ALTER TABLE branding ADD COLUMN default_template TEXT DEFAULT 'modern';
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'branding' AND column_name = 'updated_at') THEN
        ALTER TABLE branding ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Templates catalog
CREATE TABLE IF NOT EXISTS doc_templates (
  id TEXT PRIMARY KEY,  -- 'modern' | 'minimal' | 'classic'
  name TEXT NOT NULL,
  kind TEXT NOT NULL,   -- 'invoice' | 'proforma' | 'receipt' | 'any'
  html TEXT NOT NULL,   -- base HTML with {{placeholders}}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default templates
INSERT INTO doc_templates (id, name, kind, html) VALUES
('modern', 'Modern', 'any', '<!doctype html><html><head><meta charset="utf-8" /><style>{{BRAND_CSS}}</style></head><body><div class="watermark">{{company_name}}</div><div class="card"><div class="h-row"><div class="h1">{{doc_title}}</div><div class="badge">{{doc_tag}}</div></div><div class="h-row" style="margin-top:8px;"><img class="logo" src="{{logo_url}}" alt="logo" /><div class="small"><div><strong>{{company_name}}</strong></div><div>{{company_address}}</div><div>{{company_email}}</div></div></div><div class="brand-bar" style="margin:16px 0;"></div><div class="h-row"><div><div class="h2">Bill To</div><div><strong>{{customer.name}}</strong></div><div class="small">{{customer.address}}</div><div class="small">{{customer.email}}</div></div><div><div><strong>No:</strong> {{doc_number}}</div><div><strong>Date:</strong> {{doc_date}}</div><div><strong>Due:</strong> {{due_date}}</div></div></div><table class="table"><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Line Total</th></tr></thead><tbody>{{ITEM_ROWS}}</tbody></table><div class="hr"></div><div class="total">Subtotal: {{subtotal}}<br/>Tax ({{tax_rate}}%): {{tax_amount}}<br/>Grand Total: {{total}}</div><div class="hr"></div><div class="small">Notes: {{notes}}</div></div></body></html>'),
('minimal', 'Minimalist', 'any', '<!doctype html><html><head><meta charset="utf-8" /><style>{{BRAND_CSS}}</style></head><body><div style="padding:24px;"><div class="h-row"><div><div class="h1">{{doc_title}}</div><div class="small">No: {{doc_number}} • Date: {{doc_date}}</div></div><img class="logo" src="{{logo_url}}" /></div><div class="hr"></div><div class="h-row"><div><div class="h2">To</div><div><strong>{{customer.name}}</strong></div><div class="small">{{customer.address}}</div><div class="small">{{customer.email}}</div></div><div class="small"><div><strong>{{company_name}}</strong></div><div>{{company_email}}</div></div></div><table class="table"><thead><tr><th>Description</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead><tbody>{{ITEM_ROWS}}</tbody></table><div class="total">Total: {{total}}</div></div></body></html>'),
('classic', 'Classic', 'any', '<!doctype html><html><head><meta charset="utf-8" /><style>{{BRAND_CSS}}</style></head><body><div class="card"><div class="h-row"><img class="logo" src="{{logo_url}}" /><div class="h1">{{doc_title}}</div></div><div class="hr"></div><div class="h-row small"><div><strong>Number:</strong> {{doc_number}}</div><div><strong>Date:</strong> {{doc_date}}</div><div><strong>Due:</strong> {{due_date}}</div></div><div class="hr"></div><div class="h-row"><div><div class="h2">Customer</div><div><strong>{{customer.name}}</strong></div><div class="small">{{customer.address}}</div></div><div class="small"><div><strong>{{company_name}}</strong></div><div>{{company_address}}</div><div>{{company_email}}</div></div></div><table class="table"><thead><tr><th>Item</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead><tbody>{{ITEM_ROWS}}</tbody></table><div class="total">Subtotal: {{subtotal}} | Tax: {{tax_amount}} | Total: {{total}}</div><div class="small">Thank you for your business.</div></div></body></html>')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE doc_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies with conditional creation
DO $$ 
BEGIN
    -- Branding policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'branding' AND policyname = 'Users can view their own branding') THEN
        CREATE POLICY "Users can view their own branding" ON branding
          FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'branding' AND policyname = 'Users can insert their own branding') THEN
        CREATE POLICY "Users can insert their own branding" ON branding
          FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'branding' AND policyname = 'Users can update their own branding') THEN
        CREATE POLICY "Users can update their own branding" ON branding
          FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'branding' AND policyname = 'Users can delete their own branding') THEN
        CREATE POLICY "Users can delete their own branding" ON branding
          FOR DELETE USING (auth.uid() = user_id);
    END IF;

    -- Doc templates policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'doc_templates' AND policyname = 'Anyone can view templates') THEN
        CREATE POLICY "Anyone can view templates" ON doc_templates
          FOR SELECT USING (true);
    END IF;
END $$;

-- Create branding storage bucket
-- Note: This needs to be done in Supabase dashboard or via API
-- Bucket name: 'branding' (public)

-- Insert sample branding for testing
DO $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Get the current user ID from auth.users
    SELECT id INTO current_user_id FROM auth.users LIMIT 1;
    
    -- If no user exists, create a sample user
    IF current_user_id IS NULL THEN
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at) VALUES
          (gen_random_uuid(), 'sample@example.com', crypt('password', gen_salt('bf')), NOW(), NOW(), NOW())
        RETURNING id INTO current_user_id;
    END IF;
    
    -- Insert sample branding
    IF NOT EXISTS (SELECT 1 FROM branding WHERE user_id = current_user_id) THEN
        INSERT INTO branding (user_id, company_name, primary_color, accent_color, default_template) VALUES
          (current_user_id, 'SaleGuru CRM', '#3B82F6', '#111827', 'modern');
    END IF;
END $$;
