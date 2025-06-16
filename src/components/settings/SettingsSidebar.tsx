import React from 'react';
import { User, Bell, Settings, Zap, Link, Shield, Bot, BarChart } from 'lucide-react';
import clsx from 'clsx';
import { SettingsSection } from '../../pages/Settings';
import Badge from '../ui/Badge';

interface SettingsSidebarProps {
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
  userRole: string;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ 
  activeSection, 
  onSectionChange, 
  userRole 
}) => {
  const sections = [
    {
      id: 'account' as SettingsSection,
      label: 'Account & Preferences',
      icon: User,
      description: 'Personal settings and preferences',
      roles: ['admin', 'manager', 'sales_rep']
    },
    {
      id: 'notifications' as SettingsSection,
      label: 'Notifications',
      icon: Bell,
      description: 'Email and in-app notifications',
      roles: ['admin', 'manager', 'sales_rep']
    },
    {
      id: 'pipeline' as SettingsSection,
      label: 'Pipeline Configuration',
      icon: Settings,
      description: 'Customize your sales pipeline',
      roles: ['admin', 'manager']
    },
    {
      id: 'automation' as SettingsSection,
      label: 'Automation Rules',
      icon: Zap,
      description: 'Set up automated workflows',
      badge: 'New',
      roles: ['admin', 'manager']
    },
    {
      id: 'integrations' as SettingsSection,
      label: 'Integrations',
      icon: Link,
      description: 'Connect external services',
      roles: ['admin', 'manager', 'sales_rep']
    },
    {
      id: 'ai-usage' as SettingsSection,
      label: 'AI Usage & Analytics',
      icon: Bot,
      description: 'Monitor AI usage and performance',
      badge: 'New',
      roles: ['admin', 'manager']
    },
    {
      id: 'system' as SettingsSection,
      label: 'System Configuration',
      icon: Shield,
      description: 'Admin-only system settings',
      roles: ['admin']
    }
  ];

  const availableSections = sections.filter(section => 
    section.roles.includes(userRole)
  );

  return (
    <div className="sticky top-6">
      <div className="bg-secondary-800 rounded-card p-6 space-y-2">
        <h3 className="text-lg font-semibold text-white mb-4">Settings</h3>
        
        {availableSections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={clsx(
              'w-full text-left p-3 rounded-lg transition-all duration-200 group',
              activeSection === section.id
                ? 'bg-primary-600 text-white shadow-lg'
                : 'text-secondary-300 hover:bg-secondary-700 hover:text-white'
            )}
          >
            <div className="flex items-center space-x-3">
              <section.icon className={clsx(
                'w-5 h-5 transition-colors',
                activeSection === section.id ? 'text-white' : 'text-secondary-400 group-hover:text-white'
              )} />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{section.label}</span>
                  {section.badge && (
                    <Badge variant="success" size="sm">{section.badge}</Badge>
                  )}
                </div>
                <p className={clsx(
                  'text-xs mt-1',
                  activeSection === section.id ? 'text-purple-200' : 'text-secondary-500'
                )}>
                  {section.description}
                </p>
              </div>
            </div>
          </button>
        ))}

        {/* Guru Tips */}
        <div className="mt-6 p-4 bg-gradient-to-r from-primary-600/10 to-purple-600/10 border border-primary-600/30 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <img 
              src="https://i.imgur.com/Zylpdjy.png" 
              alt="SaleToruGuru" 
              className="w-4 h-4 object-contain"
            />
            <span className="text-sm font-medium text-primary-400">SaleToruGuru Tip</span>
          </div>
          <p className="text-xs text-secondary-300">
            {activeSection === 'account' && "Customize your timezone to get accurate activity timestamps!"}
            {activeSection === 'notifications' && "Set up smart alerts to never miss important deal updates."}
            {activeSection === 'pipeline' && "Optimize your pipeline stages based on your sales process."}
            {activeSection === 'automation' && "Automate repetitive tasks to focus on closing deals."}
            {activeSection === 'integrations' && "Connect your email to sync all communications automatically."}
            {activeSection === 'system' && "Regular backups ensure your data is always safe."}
            {activeSection === 'ai-usage' && "Monitor your AI usage to optimize your workflow and stay within your plan limits."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsSidebar;