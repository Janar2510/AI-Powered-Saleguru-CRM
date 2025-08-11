import React, { useState } from 'react';
import { Save } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import SettingsSidebar from '../components/settings/SettingsSidebar';
import { settingsSections, SettingsSectionId } from '../components/settings/settingsSections';
import { useSubscription } from '../contexts/SubscriptionContext';
import Spline from '@splinetool/react-spline';
import Button from '../components/ui/Button';

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SettingsSectionId>('account');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Get user role and feature access from context (replace with real context in production)
  const userRole = 'admin'; // Replace with real user role from context
  
  // Use subscription context with fallback
  let hasFeatureAccess = (feature: string) => true; // Default to true for demo
  try {
    const subscription = useSubscription();
    hasFeatureAccess = subscription.hasFeatureAccess;
  } catch (error) {
    console.warn('Subscription context not available, using default feature access');
  }

  // Filter sections by role and feature flag
  const availableSections = settingsSections.filter(section => {
    if (!section.roles.includes(userRole)) return false;
    if (section.featureFlag && !hasFeatureAccess(section.featureFlag)) return false;
    return true;
  });

  // Find the active section config
  const activeSectionConfig = availableSections.find(s => s.id === activeSection) || availableSections[0];
  const SectionComponent = activeSectionConfig?.component;

  const handleSaveAll = () => {
    console.log('Save All clicked');
    // Implement actual save logic here
    setHasUnsavedChanges(false);
  };

  return (
    <div className="relative w-full min-h-screen animate-fade-in">
      {/* 3D Spline Background */}
      <div className="fixed inset-0 -z-10">
        <Spline scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode" />
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-[#b0b0d0] mt-1">Manage your CRM preferences and configuration</p>
        </div>
        {hasUnsavedChanges && (
          <div className="flex items-center space-x-3">
            <Badge variant="warning" size="md">Unsaved Changes</Badge>
            <Button onClick={handleSaveAll} variant="gradient" size="lg" icon={Save} className="h-12 min-w-[140px]">
              Save All
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Sidebar */}
        <div className="lg:col-span-1">
          <SettingsSidebar 
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            userRole={userRole}
            availableSections={availableSections}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {SectionComponent ? (
            <SectionComponent onChanges={setHasUnsavedChanges} />
          ) : (
            <Card variant="glass" className="p-8">
              <div className="text-center text-[#b0b0d0]">
                You do not have access to this settings section.
              </div>
            </Card>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default Settings;