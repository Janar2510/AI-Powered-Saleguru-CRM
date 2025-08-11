import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Plan {
  id: string;
  name: string;
  features: string[];
  limits: {
    deals: number;
    contacts: number;
    companies: number;
    automations: number;
    aiCredits: number;
  };
  price: number;
  billingCycle: 'monthly' | 'yearly';
}

interface PlanContextType {
  currentPlan: Plan | null;
  setCurrentPlan: (plan: Plan) => void;
  isFeatureAvailable: (feature: string) => boolean;
  getUsageLimit: (resource: keyof Plan['limits']) => number;
  getCurrentUsage: (resource: keyof Plan['limits']) => number;
  demoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

const defaultPlan: Plan = {
  id: 'free',
  name: 'Free Plan',
  features: ['Basic CRM', 'Up to 100 contacts', 'Basic analytics'],
  limits: {
    deals: 10,
    contacts: 100,
    companies: 50,
    automations: 2,
    aiCredits: 50,
  },
  price: 0,
  billingCycle: 'monthly',
};

export const PlanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentPlan, setCurrentPlan] = useState<Plan>(defaultPlan);
  const [usage, setUsage] = useState({
    deals: 0,
    contacts: 0,
    companies: 0,
    automations: 0,
    aiCredits: 0,
  });
  const [demoMode, setDemoMode] = useState<boolean>(true); // Default to demo mode for dev

  const isFeatureAvailable = (feature: string): boolean => {
    return currentPlan.features.includes(feature);
  };

  const getUsageLimit = (resource: keyof Plan['limits']): number => {
    return currentPlan.limits[resource];
  };

  const getCurrentUsage = (resource: keyof Plan['limits']): number => {
    return usage[resource];
  };

  const value: PlanContextType = {
    currentPlan,
    setCurrentPlan,
    isFeatureAvailable,
    getUsageLimit,
    getCurrentUsage,
    demoMode,
    setDemoMode,
  };

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
};

export const usePlan = (): PlanContextType => {
  const context = useContext(PlanContext);
  if (context === undefined) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
}; 