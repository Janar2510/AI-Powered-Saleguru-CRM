import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { 
  MarketplaceApp, 
  InstalledApp, 
  AppCategory, 
  AppReview, 
  AppInstallRequest,
  MarketplaceStats,
  AppSearchFilters 
} from '../types/Marketplace';

export const useMarketplace = () => {
  const [apps, setApps] = useState<MarketplaceApp[]>([]);
  const [installedApps, setInstalledApps] = useState<InstalledApp[]>([]);
  const [categories, setCategories] = useState<AppCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sample marketplace data
  const getSampleApps = (): MarketplaceApp[] => [
    {
      id: 'zapier-integration',
      name: 'Zapier',
      description: 'Connect SaleGuru CRM with 6,000+ apps to automate your workflows. Create powerful automation between your CRM and favorite tools like Gmail, Slack, Trello, and more.',
      short_description: 'Connect with thousands of apps to automate workflows',
      developer: 'Zapier Inc.',
      category: 'automation',
      icon_url: 'https://cdn.zapier.com/storage/developer/c1adbe9e3bb39a64d7c614b8866fd1f1.png',
      screenshots: [
        'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600',
        'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600'
      ],
      pricing_model: 'freemium',
      price_monthly: 2000, // $20
      free_trial_days: 14,
      version: '2.1.0',
      rating: 4.8,
      review_count: 2847,
      install_count: 50000,
      last_updated: '2024-01-15T00:00:00Z',
      features: [
        'Connect with 6000+ apps',
        'Automated data sync',
        'Custom triggers and actions',
        'Multi-step workflows',
        'Real-time notifications'
      ],
      integrations: ['Gmail', 'Slack', 'Trello', 'HubSpot', 'Salesforce'],
      supported_languages: ['English', 'Spanish', 'French', 'German'],
      is_installed: false,
      api_key_required: true,
      oauth_enabled: true,
      status: 'active',
      verified: true,
      website_url: 'https://zapier.com',
      support_url: 'https://zapier.com/help',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    },
    {
      id: 'slack-integration',
      name: 'Slack',
      description: 'Get real-time CRM notifications in Slack, search customer data, and update deals without leaving your chat. Perfect for sales teams who live in Slack.',
      short_description: 'Real-time notifications and search CRM data in Slack',
      developer: 'Slack Technologies',
      category: 'communication',
      icon_url: 'https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png',
      screenshots: [
        'https://images.unsplash.com/photo-1611095973362-ee64fc8f2476?w=800&h=600',
        'https://images.unsplash.com/photo-1611095973362-ee64fc8f2476?w=800&h=600'
      ],
      pricing_model: 'free',
      version: '1.5.2',
      rating: 4.6,
      review_count: 1923,
      install_count: 35000,
      last_updated: '2024-01-10T00:00:00Z',
      features: [
        'Real-time deal notifications',
        'Customer lookup in Slack',
        'Quick deal updates',
        'Team activity feeds',
        'Custom slash commands'
      ],
      integrations: ['Slack Workflow Builder', 'Slack Apps'],
      supported_languages: ['English', 'Spanish', 'French', 'German', 'Japanese'],
      is_installed: true,
      installation_date: '2024-01-05T00:00:00Z',
      api_key_required: false,
      oauth_enabled: true,
      status: 'active',
      verified: true,
      website_url: 'https://slack.com',
      support_url: 'https://slack.com/help',
      created_at: '2023-02-01T00:00:00Z',
      updated_at: '2024-01-10T00:00:00Z'
    },
    {
      id: 'zoom-integration',
      name: 'Zoom',
      description: 'Schedule and start Zoom meetings directly from your CRM. Automatically log meeting details, recordings, and follow-up tasks. Perfect for sales calls and demos.',
      short_description: 'Schedule and start meetings directly from CRM',
      developer: 'Zoom Video Communications',
      category: 'communication',
      icon_url: 'https://d24cgw3uvb9a9h.cloudfront.net/static/93516/image/new-zoom-logo.png',
      screenshots: [
        'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&h=600'
      ],
      pricing_model: 'freemium',
      price_monthly: 1500, // $15
      free_trial_days: 30,
      version: '3.2.1',
      rating: 4.4,
      review_count: 856,
      install_count: 28000,
      last_updated: '2024-01-12T00:00:00Z',
      features: [
        'One-click meeting scheduling',
        'Automatic recording logging',
        'Calendar integration',
        'Meeting analytics',
        'Custom meeting templates'
      ],
      integrations: ['Google Calendar', 'Outlook', 'Calendly'],
      supported_languages: ['English', 'Spanish', 'French', 'Chinese'],
      is_installed: false,
      api_key_required: true,
      oauth_enabled: true,
      status: 'active',
      verified: true,
      website_url: 'https://zoom.us',
      support_url: 'https://support.zoom.us',
      created_at: '2023-03-01T00:00:00Z',
      updated_at: '2024-01-12T00:00:00Z'
    },
    {
      id: 'mailchimp-integration',
      name: 'MailChimp',
      description: 'Sync your CRM contacts with MailChimp to create targeted email campaigns. Automatically segment audiences based on deal stages and customer behavior.',
      short_description: 'Sync contacts and automate email campaigns',
      developer: 'Intuit Mailchimp',
      category: 'marketing',
      icon_url: 'https://eep.io/images/yzco4xsimv0y/4MieVLrLSoAVOjjVg0k1v/57cb1e9d96efa1c2ea8cbf1dffdbef7b/mailchimp_brandmark_text-black.svg',
      screenshots: [
        'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600'
      ],
      pricing_model: 'freemium',
      price_monthly: 1000, // $10
      free_trial_days: 30,
      version: '2.8.0',
      rating: 4.3,
      review_count: 1654,
      install_count: 42000,
      last_updated: '2024-01-08T00:00:00Z',
      features: [
        'Bi-directional contact sync',
        'Automated segmentation',
        'Campaign performance tracking',
        'Lead scoring integration',
        'Custom field mapping'
      ],
      integrations: ['Google Analytics', 'Facebook Ads', 'Instagram'],
      supported_languages: ['English', 'Spanish', 'French', 'Portuguese'],
      is_installed: false,
      api_key_required: true,
      oauth_enabled: true,
      status: 'active',
      verified: true,
      website_url: 'https://mailchimp.com',
      support_url: 'https://mailchimp.com/help',
      created_at: '2023-04-01T00:00:00Z',
      updated_at: '2024-01-08T00:00:00Z'
    },
    {
      id: 'stripe-payments',
      name: 'Stripe Payments',
      description: 'Accept payments directly through your CRM. Automatically create invoices, process payments, and track revenue. Supports subscriptions and one-time payments.',
      short_description: 'Accept payments and manage subscriptions',
      developer: 'Stripe Inc.',
      category: 'finance',
      icon_url: 'https://images.ctfassets.net/fzn2n1nzq965/3AGidihOJl4nH9D1vDjM84/9540155d584be52fc54c443b6efa4ae6/favicon.png',
      screenshots: [
        'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600'
      ],
      pricing_model: 'paid',
      price_monthly: 2900, // $29
      version: '4.1.0',
      rating: 4.7,
      review_count: 987,
      install_count: 15000,
      last_updated: '2024-01-14T00:00:00Z',
      features: [
        'Payment processing',
        'Subscription management',
        'Automatic invoicing',
        'Revenue analytics',
        'Multi-currency support'
      ],
      integrations: ['QuickBooks', 'Xero', 'PayPal'],
      supported_languages: ['English', 'Spanish', 'French', 'German', 'Japanese'],
      is_installed: false,
      api_key_required: true,
      oauth_enabled: false,
      status: 'active',
      verified: true,
      website_url: 'https://stripe.com',
      support_url: 'https://support.stripe.com',
      created_at: '2023-05-01T00:00:00Z',
      updated_at: '2024-01-14T00:00:00Z'
    },
    {
      id: 'hubspot-sync',
      name: 'HubSpot Sync',
      description: 'Two-way sync between SaleGuru and HubSpot. Keep your data consistent across both platforms with real-time synchronization.',
      short_description: 'Two-way sync with HubSpot CRM',
      developer: 'HubSpot Inc.',
      category: 'sales',
      icon_url: 'https://www.hubspot.com/hubfs/assets/hubspot.com/style-guide/brand-guidelines/sprocket-current-1.svg',
      screenshots: [
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600'
      ],
      pricing_model: 'paid',
      price_monthly: 4900, // $49
      version: '1.3.5',
      rating: 4.2,
      review_count: 432,
      install_count: 8500,
      last_updated: '2024-01-11T00:00:00Z',
      features: [
        'Real-time data sync',
        'Contact deduplication',
        'Deal stage mapping',
        'Custom field sync',
        'Activity logging'
      ],
      integrations: ['HubSpot Marketing Hub', 'HubSpot Service Hub'],
      supported_languages: ['English', 'Spanish', 'French'],
      is_installed: false,
      api_key_required: true,
      oauth_enabled: true,
      status: 'active',
      verified: true,
      website_url: 'https://hubspot.com',
      support_url: 'https://help.hubspot.com',
      created_at: '2023-06-01T00:00:00Z',
      updated_at: '2024-01-11T00:00:00Z'
    }
  ];

  const getSampleCategories = (): AppCategory[] => [
    {
      id: 'automation',
      name: 'Automation',
      description: 'Automate repetitive tasks and workflows',
      icon: 'Zap',
      app_count: 12,
      featured_apps: ['zapier-integration']
    },
    {
      id: 'communication',
      name: 'Communication',
      description: 'Stay connected with your team and customers',
      icon: 'MessageSquare',
      app_count: 8,
      featured_apps: ['slack-integration', 'zoom-integration']
    },
    {
      id: 'marketing',
      name: 'Marketing',
      description: 'Email marketing and campaign management',
      icon: 'Mail',
      app_count: 15,
      featured_apps: ['mailchimp-integration']
    },
    {
      id: 'finance',
      name: 'Finance',
      description: 'Payment processing and financial tools',
      icon: 'DollarSign',
      app_count: 6,
      featured_apps: ['stripe-payments']
    },
    {
      id: 'sales',
      name: 'Sales',
      description: 'Boost your sales performance',
      icon: 'TrendingUp',
      app_count: 9,
      featured_apps: ['hubspot-sync']
    },
    {
      id: 'analytics',
      name: 'Analytics',
      description: 'Data insights and reporting',
      icon: 'BarChart3',
      app_count: 7,
      featured_apps: []
    }
  ];

  // Fetch all marketplace apps
  const fetchApps = useCallback(async (filters?: AppSearchFilters) => {
    setLoading(true);
    setError(null);

    try {
      // In real implementation, fetch from Supabase
      let apps = getSampleApps();
      
      // Apply filters
      if (filters) {
        if (filters.category) {
          apps = apps.filter(app => app.category === filters.category);
        }
        if (filters.pricing) {
          apps = apps.filter(app => app.pricing_model === filters.pricing);
        }
        if (filters.rating) {
          apps = apps.filter(app => app.rating >= filters.rating);
        }
        if (filters.verified_only) {
          apps = apps.filter(app => app.verified);
        }
        if (filters.search_term) {
          const term = filters.search_term.toLowerCase();
          apps = apps.filter(app => 
            app.name.toLowerCase().includes(term) ||
            app.description.toLowerCase().includes(term) ||
            app.developer.toLowerCase().includes(term)
          );
        }
        
        // Sort apps
        if (filters.sort_by) {
          switch (filters.sort_by) {
            case 'popular':
              apps.sort((a, b) => b.install_count - a.install_count);
              break;
            case 'newest':
              apps.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
              break;
            case 'rating':
              apps.sort((a, b) => b.rating - a.rating);
              break;
            case 'name':
              apps.sort((a, b) => a.name.localeCompare(b.name));
              break;
            case 'price_low':
              apps.sort((a, b) => (a.price_monthly || 0) - (b.price_monthly || 0));
              break;
            case 'price_high':
              apps.sort((a, b) => (b.price_monthly || 0) - (a.price_monthly || 0));
              break;
          }
        }
      }

      setApps(apps);
      return apps;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch installed apps
  const fetchInstalledApps = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get installed apps (sample data shows Slack as installed)
      const sampleApps = getSampleApps();
      const installed = sampleApps
        .filter(app => app.is_installed)
        .map(app => ({
          id: `installed-${app.id}`,
          app_id: app.id,
          org_id: 'temp-org',
          user_id: 'current-user',
          status: 'active' as const,
          config: {},
          installation_date: app.installation_date || new Date().toISOString(),
          app
        }));

      setInstalledApps(installed);
      return installed;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const categories = getSampleCategories();
      setCategories(categories);
      return categories;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Install an app
  const installApp = useCallback(async (request: AppInstallRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // In real implementation, send to backend
      console.log('Installing app:', request);
      
      // Update local state
      setApps(prev => prev.map(app => 
        app.id === request.app_id 
          ? { ...app, is_installed: true, installation_date: new Date().toISOString() }
          : app
      ));

      // Add to installed apps
      const app = apps.find(a => a.id === request.app_id);
      if (app) {
        const newInstall: InstalledApp = {
          id: `installed-${app.id}`,
          app_id: app.id,
          org_id: 'temp-org',
          user_id: 'current-user',
          status: 'active',
          config: request.config || {},
          api_key: request.api_key,
          installation_date: new Date().toISOString(),
          trial_ends_at: request.trial_mode && app.free_trial_days 
            ? new Date(Date.now() + app.free_trial_days * 24 * 60 * 60 * 1000).toISOString()
            : undefined,
          app
        };
        setInstalledApps(prev => [...prev, newInstall]);
      }

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [apps]);

  // Uninstall an app
  const uninstallApp = useCallback(async (appId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // Update local state
      setApps(prev => prev.map(app => 
        app.id === appId 
          ? { ...app, is_installed: false, installation_date: undefined }
          : app
      ));

      setInstalledApps(prev => prev.filter(install => install.app_id !== appId));
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get marketplace statistics
  const getStats = useCallback((): MarketplaceStats => {
    return {
      total_apps: apps.length,
      installed_apps: installedApps.length,
      popular_categories: categories.slice(0, 3),
      trending_apps: apps.filter(app => app.install_count > 30000).slice(0, 5),
      recent_installs: installedApps.slice(-5),
      total_spent: installedApps.reduce((sum, app) => sum + (app.app.price_monthly || 0), 0),
      active_subscriptions: installedApps.filter(app => app.app.pricing_model === 'subscription').length
    };
  }, [apps, installedApps, categories]);

  // Initialize data on mount
  useEffect(() => {
    fetchApps();
    fetchInstalledApps();
    fetchCategories();
  }, [fetchApps, fetchInstalledApps, fetchCategories]);

  return {
    apps,
    installedApps,
    categories,
    loading,
    error,
    fetchApps,
    fetchInstalledApps,
    fetchCategories,
    installApp,
    uninstallApp,
    getStats,
    clearError: () => setError(null)
  };
};

