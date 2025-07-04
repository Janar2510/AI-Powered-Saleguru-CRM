import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getSupabaseClient } from '../lib/supabase';

// Define types
export interface PricingPlan {
  id: string;
  name: string;
  price_monthly: number;
  features: {
    ai_limit: number;
    contacts_limit: number;
    deals_limit: number;
    email_templates: number;
    automation: boolean;
    analytics: boolean;
    lead_scoring: boolean;
    email_integration: boolean;
    calendar_integration: boolean;
    dedicated_support?: boolean;
    custom_integrations?: boolean;
    team_management?: boolean;
  };
}

export interface UserSubscription {
  plan_id: string;
  plan_name: string;
  price_monthly: number;
  features: PricingPlan['features'];
  billing_status: string;
  current_period_end?: Date;
}

export interface FeatureFlags {
  ai_guru_enabled: boolean;
  email_integration_enabled: boolean;
  automation_enabled: boolean;
  lead_scoring_enabled: boolean;
  calendar_integration_enabled: boolean;
  analytics_enabled: boolean;
}

interface SubscriptionContextType {
  currentPlan: UserSubscription | null;
  featureFlags: FeatureFlags;
  isLoading: boolean;
  hasFeatureAccess: (feature: string) => boolean;
  getFeatureLimit: (feature: string) => number;
  refreshSubscription: () => Promise<void>;
}

// Create context
const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Provider component
export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { session, userProfile } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<UserSubscription | null>(null);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>({
    ai_guru_enabled: true,
    email_integration_enabled: true,
    automation_enabled: true,
    lead_scoring_enabled: true,
    calendar_integration_enabled: true,
    analytics_enabled: true
  });
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Supabase client
  const supabase = getSupabaseClient();

  // Fetch user's subscription and feature flags
  const fetchSubscriptionData = async () => {
    if (!session?.user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Fetch user's plan using the RPC function
      const { data: planData, error: planError } = await supabase.rpc(
        'get_user_plan',
        { p_user_id: session.user.id }
      );

      if (planError) {
        console.error('Error fetching user plan:', planError);
        // Fallback to free plan
        setCurrentPlan({
          plan_id: 'free',
          plan_name: 'Free',
          price_monthly: 0,
          features: {
            ai_limit: 5,
            contacts_limit: 100,
            deals_limit: 10,
            email_templates: 3,
            automation: false,
            analytics: false,
            lead_scoring: false,
            email_integration: false,
            calendar_integration: false
          },
          billing_status: 'free'
        });
      } else if (planData) {
        setCurrentPlan({
          plan_id: planData.plan_id,
          plan_name: planData.plan_name,
          price_monthly: planData.price_monthly,
          features: planData.features,
          billing_status: planData.billing_status,
          current_period_end: planData.current_period_end ? new Date(planData.current_period_end) : undefined
        });
      }

      // Fetch feature flags - use maybeSingle() to handle cases where no rows exist
      const { data: featureFlagsData, error: featureFlagsError } = await supabase
        .from('developer_tools')
        .select('value')
        .eq('name', 'feature_flags')
        .maybeSingle();

      if (featureFlagsError) {
        console.error('Error fetching feature flags:', featureFlagsError);
      } else if (featureFlagsData && featureFlagsData.value) {
        setFeatureFlags(featureFlagsData.value as FeatureFlags);
      }
      // If no feature flags data is found, keep the default values set in useState
    } catch (error) {
      console.error('Error in fetchSubscriptionData:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch subscription data on mount and when session changes
  useEffect(() => {
    fetchSubscriptionData();
  }, [session]);

  // Check if user has access to a feature
  const hasFeatureAccess = (feature: string): boolean => {
    if (!currentPlan) return false;

    // Check if feature exists in the plan
    const featureValue = currentPlan.features[feature as keyof typeof currentPlan.features];
    
    // For numeric limits (like ai_limit), return true if the value is -1 (unlimited) or > 0
    if (typeof featureValue === 'number') {
      return featureValue === -1 || featureValue > 0;
    }
    
    // For boolean features
    if (typeof featureValue === 'boolean') {
      return featureValue;
    }
    
    // Feature not found in plan
    return false;
  };

  // Get feature limit
  const getFeatureLimit = (feature: string): number => {
    if (!currentPlan) return 0;

    const featureValue = currentPlan.features[feature as keyof typeof currentPlan.features];
    
    if (typeof featureValue === 'number') {
      return featureValue;
    }
    
    return 0;
  };

  // Refresh subscription data
  const refreshSubscription = async () => {
    await fetchSubscriptionData();
  };

  const value = {
    currentPlan,
    featureFlags,
    isLoading,
    hasFeatureAccess,
    getFeatureLimit,
    refreshSubscription
  };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
};

// Hook for using subscription context
export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}; 