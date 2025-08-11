import { useState, useCallback } from 'react';
import { FeatureLockModal } from "../components/ui/FeatureLockModal";
// TODO: Implement useDevMode or import from DevModeContext if available
const useDevMode = () => ({ isDevMode: false }); // Placeholder

// Define feature access by plan
const featureAccess = {
  basic_crm: ['starter', 'pro', 'team'],
  contact_management: ['starter', 'pro', 'team'],
  deal_tracking: ['starter', 'pro', 'team'],
  basic_analytics: ['starter', 'pro', 'team'],
  email_integration: ['pro', 'team'],
  calendar_integration: ['pro', 'team'],
  offers_management: ['pro', 'team'],
  basic_automation: ['pro', 'team'],
  api_access: ['pro', 'team'],
  ai_assistant: ['team'],
  advanced_automation: ['team'],
  custom_analytics: ['team'],
  priority_support: ['team'],
};

type FeatureKey = keyof typeof featureAccess;

const featureNames: Record<FeatureKey, string> = {
  email_integration: 'Email Integration',
  calendar_integration: 'Calendar Integration',
  offers_management: 'Offers Management',
  basic_automation: 'Automation',
  api_access: 'API Access',
  ai_assistant: 'AI Assistant',
  advanced_automation: 'Advanced Automation',
  custom_analytics: 'Custom Analytics',
  priority_support: 'Priority Support',
  basic_crm: 'Basic CRM',
  contact_management: 'Contact Management',
  deal_tracking: 'Deal Tracking',
  basic_analytics: 'Basic Analytics',
};

export const useFeatureLock = (currentPlan: 'starter' | 'pro' | 'team' = 'starter') => {
  const [lockedFeature, setLockedFeature] = useState<FeatureKey | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { isDevMode } = useDevMode();

  const checkAccess = useCallback((featureId: FeatureKey): boolean => {
    if (isDevMode) {
      return true;
    }
    const allowedPlans = featureAccess[featureId] || [];
    return allowedPlans.includes(currentPlan);
  }, [currentPlan, isDevMode]);

  const withFeatureAccess = useCallback((featureId: FeatureKey, callback: () => void) => {
    if (checkAccess(featureId)) {
      callback();
      return true;
    } else {
      setLockedFeature(featureId);
      setShowModal(true);
      return false;
    }
  }, [checkAccess]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setLockedFeature(null);
  }, []);

  const FeatureLockModalComponent = useCallback(() => {
    if (!showModal || !lockedFeature) return null;
    const featureName = featureNames[lockedFeature] || lockedFeature;
    const requiredPlan = featureAccess[lockedFeature]?.[0] as 'pro' | 'team' | 'starter' || 'pro';
    return (
      <FeatureLockModal
        featureName={featureName}
        requiredPlan={requiredPlan}
        onClose={closeModal}
      />
    );
  }, [showModal, lockedFeature, closeModal]);

  return {
    checkAccess,
    withFeatureAccess,
    FeatureLockModal: FeatureLockModalComponent,
  };
}; 