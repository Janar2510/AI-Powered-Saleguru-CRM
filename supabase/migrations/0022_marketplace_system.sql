-- Marketplace System Migration
-- Migration 0022_marketplace_system.sql

-- Enable RLS
ALTER TABLE IF EXISTS public.marketplace_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.installed_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.app_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.app_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.app_payments ENABLE ROW LEVEL SECURITY;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.app_payments CASCADE;
DROP TABLE IF EXISTS public.app_reviews CASCADE;
DROP TABLE IF EXISTS public.installed_apps CASCADE;
DROP TABLE IF EXISTS public.marketplace_apps CASCADE;
DROP TABLE IF EXISTS public.app_categories CASCADE;

-- App Categories table
CREATE TABLE public.app_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    app_count INTEGER DEFAULT 0,
    featured_apps TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Marketplace Apps table
CREATE TABLE public.marketplace_apps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    short_description TEXT,
    developer TEXT NOT NULL,
    category_id UUID REFERENCES public.app_categories(id),
    category TEXT, -- For easier querying
    
    -- App assets
    icon_url TEXT,
    banner_url TEXT,
    screenshots TEXT[] DEFAULT '{}',
    
    -- Pricing
    pricing_model TEXT CHECK (pricing_model IN ('free', 'freemium', 'paid', 'subscription')) DEFAULT 'free',
    price_monthly INTEGER DEFAULT 0, -- in cents
    price_yearly INTEGER DEFAULT 0, -- in cents
    free_trial_days INTEGER DEFAULT 0,
    
    -- App details
    version TEXT DEFAULT '1.0.0',
    rating DECIMAL(2,1) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,
    install_count INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Features and integrations
    features TEXT[] DEFAULT '{}',
    integrations TEXT[] DEFAULT '{}',
    supported_languages TEXT[] DEFAULT '{}',
    
    -- Installation requirements
    api_key_required BOOLEAN DEFAULT false,
    oauth_enabled BOOLEAN DEFAULT false,
    webhook_url TEXT,
    
    -- Status and verification
    status TEXT CHECK (status IN ('active', 'inactive', 'pending', 'rejected')) DEFAULT 'pending',
    verified BOOLEAN DEFAULT false,
    
    -- External links
    website_url TEXT,
    support_url TEXT,
    privacy_url TEXT,
    terms_url TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Installed Apps table (per organization)
CREATE TABLE public.installed_apps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID REFERENCES public.marketplace_apps(id) ON DELETE CASCADE,
    org_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    
    -- Installation status
    status TEXT CHECK (status IN ('active', 'inactive', 'pending', 'error')) DEFAULT 'pending',
    config JSONB DEFAULT '{}',
    
    -- Authentication
    api_key TEXT,
    oauth_token TEXT,
    webhook_secret TEXT,
    
    -- Sync and tracking
    last_sync TIMESTAMP WITH TIME ZONE,
    sync_errors INTEGER DEFAULT 0,
    
    -- Subscription
    subscription_id TEXT,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    installation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- App Reviews table
CREATE TABLE public.app_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID REFERENCES public.marketplace_apps(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    org_id TEXT NOT NULL,
    
    -- Review content
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    title TEXT,
    review TEXT,
    
    -- Engagement
    helpful_count INTEGER DEFAULT 0,
    
    -- User info (denormalized for display)
    user_name TEXT,
    user_avatar TEXT,
    verified_purchase BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- App Payments table
CREATE TABLE public.app_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID REFERENCES public.marketplace_apps(id) ON DELETE CASCADE,
    org_id TEXT NOT NULL,
    user_id TEXT,
    
    -- Payment details
    subscription_id TEXT,
    amount_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'EUR',
    billing_period TEXT CHECK (billing_period IN ('monthly', 'yearly', 'one_time')) DEFAULT 'monthly',
    payment_method TEXT,
    
    -- Payment status
    status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')) DEFAULT 'pending',
    
    -- External payment provider
    stripe_subscription_id TEXT,
    stripe_payment_intent_id TEXT,
    stripe_invoice_id TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_marketplace_apps_category ON public.marketplace_apps(category);
CREATE INDEX idx_marketplace_apps_status ON public.marketplace_apps(status);
CREATE INDEX idx_marketplace_apps_verified ON public.marketplace_apps(verified);
CREATE INDEX idx_marketplace_apps_rating ON public.marketplace_apps(rating DESC);
CREATE INDEX idx_marketplace_apps_install_count ON public.marketplace_apps(install_count DESC);

CREATE INDEX idx_installed_apps_org_id ON public.installed_apps(org_id);
CREATE INDEX idx_installed_apps_app_id ON public.installed_apps(app_id);
CREATE INDEX idx_installed_apps_status ON public.installed_apps(status);

CREATE INDEX idx_app_reviews_app_id ON public.app_reviews(app_id);
CREATE INDEX idx_app_reviews_rating ON public.app_reviews(rating);

CREATE INDEX idx_app_payments_org_id ON public.app_payments(org_id);
CREATE INDEX idx_app_payments_app_id ON public.app_payments(app_id);
CREATE INDEX idx_app_payments_status ON public.app_payments(status);
CREATE INDEX idx_app_payments_subscription_id ON public.app_payments(subscription_id);

-- Automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_marketplace_apps_updated_at BEFORE UPDATE ON public.marketplace_apps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_installed_apps_updated_at BEFORE UPDATE ON public.installed_apps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_app_reviews_updated_at BEFORE UPDATE ON public.app_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_app_payments_updated_at BEFORE UPDATE ON public.app_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_app_categories_updated_at BEFORE UPDATE ON public.app_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
CREATE POLICY "Public can read active marketplace apps" ON public.marketplace_apps
    FOR SELECT USING (status = 'active');

CREATE POLICY "Users can manage their installed apps" ON public.installed_apps
    FOR ALL USING (auth.jwt() ->> 'org_id' = org_id);

CREATE POLICY "Users can read app reviews" ON public.app_reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own reviews" ON public.app_reviews
    FOR ALL USING (auth.jwt() ->> 'user_id' = user_id);

CREATE POLICY "Users can read their payment history" ON public.app_payments
    FOR SELECT USING (auth.jwt() ->> 'org_id' = org_id);

CREATE POLICY "Public can read app categories" ON public.app_categories
    FOR SELECT USING (true);

-- Enable RLS
ALTER TABLE public.marketplace_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installed_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_payments ENABLE ROW LEVEL SECURITY;

-- Sample data
INSERT INTO public.app_categories (id, name, description, icon, app_count) VALUES
    ('automation-cat', 'Automation', 'Automate repetitive tasks and workflows', 'Zap', 12),
    ('communication-cat', 'Communication', 'Stay connected with your team and customers', 'MessageSquare', 8),
    ('marketing-cat', 'Marketing', 'Email marketing and campaign management', 'Mail', 15),
    ('finance-cat', 'Finance', 'Payment processing and financial tools', 'DollarSign', 6),
    ('sales-cat', 'Sales', 'Boost your sales performance', 'TrendingUp', 9),
    ('analytics-cat', 'Analytics', 'Data insights and reporting', 'BarChart3', 7);

INSERT INTO public.marketplace_apps (
    id, name, description, short_description, developer, category, 
    pricing_model, price_monthly, free_trial_days, version, rating, 
    review_count, install_count, features, integrations, supported_languages,
    api_key_required, oauth_enabled, status, verified, website_url, support_url
) VALUES
(
    'zapier-integration',
    'Zapier',
    'Connect SaleGuru CRM with 6,000+ apps to automate your workflows. Create powerful automation between your CRM and favorite tools like Gmail, Slack, Trello, and more.',
    'Connect with thousands of apps to automate workflows',
    'Zapier Inc.',
    'automation',
    'freemium',
    2000,
    14,
    '2.1.0',
    4.8,
    2847,
    50000,
    ARRAY['Connect with 6000+ apps', 'Automated data sync', 'Custom triggers and actions', 'Multi-step workflows', 'Real-time notifications'],
    ARRAY['Gmail', 'Slack', 'Trello', 'HubSpot', 'Salesforce'],
    ARRAY['English', 'Spanish', 'French', 'German'],
    true,
    true,
    'active',
    true,
    'https://zapier.com',
    'https://zapier.com/help'
),
(
    'slack-integration',
    'Slack',
    'Get real-time CRM notifications in Slack, search customer data, and update deals without leaving your chat. Perfect for sales teams who live in Slack.',
    'Real-time notifications and search CRM data in Slack',
    'Slack Technologies',
    'communication',
    'free',
    0,
    0,
    '1.5.2',
    4.6,
    1923,
    35000,
    ARRAY['Real-time deal notifications', 'Customer lookup in Slack', 'Quick deal updates', 'Team activity feeds', 'Custom slash commands'],
    ARRAY['Slack Workflow Builder', 'Slack Apps'],
    ARRAY['English', 'Spanish', 'French', 'German', 'Japanese'],
    false,
    true,
    'active',
    true,
    'https://slack.com',
    'https://slack.com/help'
);

-- Grant permissions
GRANT ALL ON public.marketplace_apps TO authenticated, anon;
GRANT ALL ON public.installed_apps TO authenticated, anon;
GRANT ALL ON public.app_categories TO authenticated, anon;
GRANT ALL ON public.app_reviews TO authenticated, anon;
GRANT ALL ON public.app_payments TO authenticated, anon;
