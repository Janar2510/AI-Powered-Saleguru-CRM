import React from 'react';
import clsx from 'clsx';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { SettingsSectionId, SettingsSectionConfig } from './settingsSections';

interface SettingsSidebarProps {
  activeSection: SettingsSectionId;
  onSectionChange: (section: SettingsSectionId) => void;
  userRole: string;
  availableSections: SettingsSectionConfig[];
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ 
  activeSection, 
  onSectionChange, 
  userRole,
  availableSections
}) => {
  return (
    <div className="sticky top-6">
      <div className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50 rounded-xl p-6 space-y-2">
        <h3 className="text-lg font-semibold text-white mb-4">Settings</h3>
        {availableSections.map((section) => (
          <Button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            variant={activeSection === section.id ? 'gradient' : 'secondary'}
            fullWidth
            className={clsx('justify-start mb-1', activeSection === section.id ? 'shadow-lg' : '')}
            size="md"
          >
            <div className="flex items-center space-x-3 w-full">
              <section.icon className={clsx(
                'w-5 h-5 transition-colors',
                activeSection === section.id ? 'text-white' : 'text-[#b0b0d0] group-hover:text-white'
              )} />
              <div className="flex-1 text-left">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{section.label}</span>
                  {section.badge && (
                    <Badge variant="success" size="sm">{section.badge}</Badge>
                  )}
                </div>
                <p className={clsx(
                  'text-xs mt-1',
                  activeSection === section.id ? 'text-purple-200' : 'text-[#b0b0d0]'
                )}>
                  {section.description}
                </p>
              </div>
            </div>
          </Button>
        ))}
        {/* Guru Tips (unchanged) */}
        <div className="mt-6 p-4 bg-gradient-to-r from-[#a259ff]/10 to-[#377dff]/10 border border-[#a259ff]/30 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <img 
              src="/saletoru-logo.png" 
              alt="SaleToru Logo" 
              className="w-8 h-8 rounded-lg"
            />
            <span className="text-sm font-medium text-primary-400">SaleToruGuru Tip</span>
          </div>
          <p className="text-xs text-[#b0b0d0]">
            {activeSection === 'account' && "Customize your timezone to get accurate activity timestamps!"}
            {activeSection === 'notifications' && "Set up smart alerts to never miss important deal updates."}
            {activeSection === 'pipeline' && "Optimize your pipeline stages based on your sales process."}
            {activeSection === 'automation' && "Automate repetitive tasks to focus on closing deals."}
            {activeSection === 'integrations' && "Connect your email to sync all communications automatically."}
            {activeSection === 'system' && "Regular backups ensure your data is always safe."}
            {activeSection === 'ai-usage' && "Monitor your AI usage to optimize your workflow and stay within your plan limits."}
            {activeSection === 'user-management' && "Invite your team and assign roles for better collaboration."}
            {activeSection === 'feature-toggles' && "Enable or disable modules to fit your workflow."}
            {activeSection === 'custom-fields' && "Add custom fields to capture the data you need."}
            {activeSection === 'billing' && "Keep your billing info up to date to avoid interruptions."}
            {activeSection === 'audit-logs' && "Review all changes for compliance and security."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsSidebar;