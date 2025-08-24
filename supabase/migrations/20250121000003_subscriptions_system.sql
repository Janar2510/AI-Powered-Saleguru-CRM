-- Subscriptions System Migration
-- Creates subscriptions table with proper relationships and tracking

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subscription_number TEXT UNIQUE NOT NULL,
    contact_id UUID, -- Will add FK constraint later when contacts table exists
    organization_id UUID, -- Will add FK constraint later when organizations table exists
    product_id UUID, -- Will add FK constraint later when products table exists
    deal_id UUID, -- Will add FK constraint later when deals table exists
    
    -- Subscription details
    plan_name TEXT NOT NULL,
    plan_description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    trial_end_date DATE,
    
    -- Billing details
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    billing_cycle_day INTEGER DEFAULT 1 CHECK (billing_cycle_day BETWEEN 1 AND 31),
    next_billing_date DATE,
    last_billing_date DATE,
    
    -- Financial details
    amount_cents INTEGER NOT NULL,
    setup_fee_cents INTEGER DEFAULT 0,
    currency TEXT DEFAULT 'EUR',
    discount_percent DECIMAL(5,2) DEFAULT 0,
    tax_percent DECIMAL(5,2) DEFAULT 0,
    
    -- Status and lifecycle
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'trial', 'paused', 'cancelled', 'expired', 'past_due')),
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    
    -- Organization scoping
    org_id TEXT DEFAULT 'temp-org'
);

-- Create subscription_invoices tracking table
CREATE TABLE IF NOT EXISTS public.subscription_invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    
    -- Billing period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    billing_date DATE NOT NULL,
    
    -- Financial details
    amount_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'EUR',
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'invoiced', 'paid', 'failed')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Organization scoping
    org_id TEXT DEFAULT 'temp-org'
);

-- Create subscription_changes for audit trail
CREATE TABLE IF NOT EXISTS public.subscription_changes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    
    -- Change details
    change_type TEXT NOT NULL CHECK (change_type IN ('created', 'updated', 'paused', 'resumed', 'cancelled', 'renewed')),
    old_values JSONB,
    new_values JSONB,
    reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    
    -- Organization scoping
    org_id TEXT DEFAULT 'temp-org'
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_contact_id ON public.subscriptions(contact_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_organization_id ON public.subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_product_id ON public.subscriptions(product_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing_date ON public.subscriptions(next_billing_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_org_id ON public.subscriptions(org_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_subscription_number ON public.subscriptions(subscription_number);

CREATE INDEX IF NOT EXISTS idx_subscription_invoices_subscription_id ON public.subscription_invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_invoices_billing_date ON public.subscription_invoices(billing_date);
CREATE INDEX IF NOT EXISTS idx_subscription_invoices_status ON public.subscription_invoices(status);

CREATE INDEX IF NOT EXISTS idx_subscription_changes_subscription_id ON public.subscription_changes(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_changes_created_at ON public.subscription_changes(created_at);

-- Grant permissions
GRANT ALL ON public.subscriptions TO authenticated, anon;
GRANT ALL ON public.subscription_invoices TO authenticated, anon;
GRANT ALL ON public.subscription_changes TO authenticated, anon;

-- Create function for automatic timestamp updating
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for automatic timestamp updating
CREATE TRIGGER set_updated_at_subscriptions 
    BEFORE UPDATE ON public.subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_subscription_invoices 
    BEFORE UPDATE ON public.subscription_invoices 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to generate subscription numbers
CREATE OR REPLACE FUNCTION generate_subscription_number() RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    subscription_number TEXT;
BEGIN
    -- Get the next subscription number (starting from 1000)
    SELECT COALESCE(MAX(CAST(SUBSTRING(subscription_number FROM '[0-9]+$') AS INTEGER)), 999) + 1 
    INTO next_number
    FROM public.subscriptions 
    WHERE subscription_number ~ '^SUB-[0-9]+$';
    
    -- Format as SUB-XXXX
    subscription_number := 'SUB-' || next_number;
    
    RETURN subscription_number;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate next billing date
CREATE OR REPLACE FUNCTION calculate_next_billing_date(
    start_date DATE,
    frequency TEXT,
    billing_cycle_day INTEGER DEFAULT 1
) RETURNS DATE AS $$
DECLARE
    next_date DATE;
BEGIN
    CASE frequency
        WHEN 'daily' THEN
            next_date := start_date + INTERVAL '1 day';
        WHEN 'weekly' THEN
            next_date := start_date + INTERVAL '1 week';
        WHEN 'monthly' THEN
            -- Set to the billing cycle day of next month
            next_date := DATE_TRUNC('month', start_date) + INTERVAL '1 month' + INTERVAL '1 day' * (billing_cycle_day - 1);
        WHEN 'quarterly' THEN
            next_date := start_date + INTERVAL '3 months';
        WHEN 'yearly' THEN
            next_date := start_date + INTERVAL '1 year';
        ELSE
            next_date := start_date + INTERVAL '1 month'; -- Default to monthly
    END CASE;
    
    RETURN next_date;
END;
$$ LANGUAGE plpgsql;

-- Function to pause subscription
CREATE OR REPLACE FUNCTION pause_subscription(subscription_id_param UUID, reason TEXT DEFAULT NULL) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.subscriptions 
    SET status = 'paused',
        updated_at = NOW()
    WHERE id = subscription_id_param;
    
    -- Log the change
    INSERT INTO public.subscription_changes (subscription_id, change_type, reason, new_values)
    VALUES (subscription_id_param, 'paused', reason, jsonb_build_object('status', 'paused'));
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to cancel subscription
CREATE OR REPLACE FUNCTION cancel_subscription(
    subscription_id_param UUID, 
    reason TEXT DEFAULT NULL,
    cancel_immediately BOOLEAN DEFAULT FALSE
) RETURNS BOOLEAN AS $$
DECLARE
    sub_record RECORD;
BEGIN
    -- Get current subscription
    SELECT * INTO sub_record FROM public.subscriptions WHERE id = subscription_id_param;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Update subscription
    UPDATE public.subscriptions 
    SET status = 'cancelled',
        cancellation_reason = reason,
        cancelled_at = NOW(),
        end_date = CASE 
            WHEN cancel_immediately THEN CURRENT_DATE
            ELSE COALESCE(end_date, next_billing_date, CURRENT_DATE)
        END,
        updated_at = NOW()
    WHERE id = subscription_id_param;
    
    -- Log the change
    INSERT INTO public.subscription_changes (subscription_id, change_type, reason, new_values)
    VALUES (subscription_id_param, 'cancelled', reason, 
            jsonb_build_object('status', 'cancelled', 'cancelled_at', NOW()));
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Insert sample data for testing with proper UUIDs
DO $$
DECLARE
    sub_id_1 UUID := gen_random_uuid();
    sub_id_2 UUID := gen_random_uuid();
    sub_id_3 UUID := gen_random_uuid();
BEGIN
    -- Insert sample subscriptions
    INSERT INTO public.subscriptions (
        id, subscription_number, plan_name, start_date, frequency, 
        amount_cents, currency, status, next_billing_date, notes
    ) VALUES 
    (
        sub_id_1, 'SUB-1001', 'CRM Premium Plan',
        CURRENT_DATE - INTERVAL '30 days', 'monthly',
        2999, 'EUR', 'active', CURRENT_DATE + INTERVAL '30 days',
        'Premium CRM subscription with full features'
    ),
    (
        sub_id_2, 'SUB-1002', 'CRM Enterprise Plan',
        CURRENT_DATE - INTERVAL '60 days', 'yearly',
        29999, 'EUR', 'active', CURRENT_DATE + INTERVAL '305 days',
        'Enterprise CRM subscription with unlimited users'
    ),
    (
        sub_id_3, 'SUB-1003', 'CRM Basic Plan',
        CURRENT_DATE - INTERVAL '15 days', 'monthly',
        999, 'EUR', 'trial', CURRENT_DATE + INTERVAL '15 days',
        'Basic CRM plan on trial period'
    ) ON CONFLICT (subscription_number) DO NOTHING;

    -- Insert sample subscription invoices
    INSERT INTO public.subscription_invoices (
        subscription_id, period_start, period_end, billing_date, amount_cents, status
    ) VALUES 
    (sub_id_1, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE, CURRENT_DATE - INTERVAL '30 days', 2999, 'paid'),
    (sub_id_2, CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE + INTERVAL '305 days', CURRENT_DATE - INTERVAL '60 days', 29999, 'paid'),
    (sub_id_3, CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE - INTERVAL '15 days', 0, 'paid')
    ON CONFLICT DO NOTHING;
END $$;

-- Success message
SELECT 'Subscriptions system setup completed successfully!' as status;
