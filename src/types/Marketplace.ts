// Marketplace Types and Interfaces
export interface MarketplaceApp {
  id: string;
  name: string;
  description: string;
  short_description: string;
  developer: string;
  category: 'productivity' | 'communication' | 'marketing' | 'analytics' | 'finance' | 'sales' | 'support' | 'automation';
  icon_url: string;
  banner_url?: string;
  screenshots: string[];
  
  // Pricing
  pricing_model: 'free' | 'freemium' | 'paid' | 'subscription';
  price_monthly?: number; // in cents
  price_yearly?: number; // in cents
  free_trial_days?: number;
  
  // App details
  version: string;
  rating: number; // 0-5
  review_count: number;
  install_count: number;
  last_updated: string;
  
  // Features
  features: string[];
  integrations: string[];
  supported_languages: string[];
  
  // Installation
  is_installed: boolean;
  installation_date?: string;
  webhook_url?: string;
  api_key_required: boolean;
  oauth_enabled: boolean;
  
  // Status
  status: 'active' | 'inactive' | 'pending' | 'rejected';
  verified: boolean;
  
  // Meta
  website_url?: string;
  support_url?: string;
  privacy_url?: string;
  terms_url?: string;
  created_at: string;
  updated_at: string;
}

export interface InstalledApp {
  id: string;
  app_id: string;
  org_id: string;
  user_id: string;
  status: 'active' | 'inactive' | 'pending' | 'error';
  config: Record<string, any>;
  api_key?: string;
  webhook_secret?: string;
  last_sync?: string;
  installation_date: string;
  subscription_id?: string;
  trial_ends_at?: string;
  
  // Relationship
  app: MarketplaceApp;
}

export interface AppCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  app_count: number;
  featured_apps: string[];
}

export interface AppReview {
  id: string;
  app_id: string;
  user_id: string;
  org_id: string;
  rating: number;
  title: string;
  review: string;
  helpful_count: number;
  created_at: string;
  
  // User info
  user_name: string;
  user_avatar?: string;
  verified_purchase: boolean;
}

export interface AppInstallRequest {
  app_id: string;
  config?: Record<string, any>;
  api_key?: string;
  trial_mode?: boolean;
}

export interface AppPayment {
  id: string;
  app_id: string;
  org_id: string;
  subscription_id?: string;
  amount_cents: number;
  currency: string;
  billing_period: 'monthly' | 'yearly' | 'one_time';
  payment_method: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  
  // Stripe/Payment provider
  stripe_subscription_id?: string;
  stripe_payment_intent_id?: string;
}

export interface MarketplaceStats {
  total_apps: number;
  installed_apps: number;
  popular_categories: AppCategory[];
  trending_apps: MarketplaceApp[];
  recent_installs: InstalledApp[];
  total_spent: number;
  active_subscriptions: number;
}

export interface AppSearchFilters {
  category?: string;
  pricing?: 'free' | 'paid' | 'freemium';
  rating?: number;
  verified_only?: boolean;
  search_term?: string;
  sort_by?: 'popular' | 'newest' | 'rating' | 'name' | 'price_low' | 'price_high';
}
