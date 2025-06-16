import React, { useState } from 'react';
import { User, Bell, Settings as SettingsIcon, Zap, Link, Shield, Save, Eye, EyeOff, Bot } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import SettingsSidebar from '../components/settings/SettingsSidebar';
import AccountPreferences from '../components/settings/AccountPreferences';
import NotificationSettings from '../components/settings/NotificationSettings';
import PipelineConfiguration from '../components/settings/PipelineConfiguration';
import AutomationRules from '../components/settings/AutomationRules';
import IntegrationSettings from '../components/settings/IntegrationSettings';
import SystemConfiguration from '../components/settings/SystemConfiguration';
import AIUsageStats from '../components/settings/AIUsageStats';

export type SettingsSection = 
  | 'account' 
  | 'notifications' 
  | 'pipeline' 
  | 'automation' 
  | 'integrations' 
  | 'system'
  | 'ai-usage';

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('account');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Mock user role - in real app this would come from auth context
  const userRole = 'admin'; // 'admin' | 'manager' | 'sales_rep'

  const renderContent = () => {
    switch (activeSection) {
      case 'account':
        return <AccountPreferences onChanges={setHasUnsavedChanges} />;
      case 'notifications':
        return <NotificationSettings onChanges={setHasUnsavedChanges} />;
      case 'pipeline':
        return <PipelineConfiguration onChanges={setHasUnsavedChanges} />;
      case 'automation':
        return <AutomationRules onChanges={setHasUnsavedChanges} />;
      case 'integrations':
        return <IntegrationSettings onChanges={setHasUnsavedChanges} />;
      case 'system':
        return userRole === 'admin' ? <SystemConfiguration onChanges={setHasUnsavedChanges} /> : null;
      case 'ai-usage':
        return <AIUsageStats />;
      default:
        return <AccountPreferences onChanges={setHasUnsavedChanges} />;
    }
  };

  return (
    <div className="w-full px-5 py-5 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-secondary-400 mt-1">Manage your CRM preferences and configuration</p>
        </div>
        {hasUnsavedChanges && (
          <div className="flex items-center space-x-3">
            <Badge variant="warning" size="md">Unsaved Changes</Badge>
            <button className="btn-primary flex items-center space-x-2">
              <Save className="w-4 h-4" />
              <span>Save All</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Settings Sidebar */}
        <div className="lg:col-span-1">
          <SettingsSidebar 
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            userRole={userRole}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;