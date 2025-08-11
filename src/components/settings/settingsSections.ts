import { User, Bell, Settings as SettingsIcon, Zap, Link, Shield, Bot, BarChart, Tag, List, CreditCard, Building, UserPlus, Smartphone } from 'lucide-react';
import AccountPreferences from './AccountPreferences';
import NotificationSettings from './NotificationSettings';
import PipelineConfiguration from './PipelineConfiguration';
import AutomationRules from './AutomationRules';
import IntegrationSettings from './IntegrationSettings';
import SystemConfiguration from './SystemConfiguration';
import AIUsageStats from './AIUsageStats';
import UserManagement from './UserManagement';
import FeatureToggles from './FeatureToggles';
import CustomFields from './CustomFields';
import Billing from './Billing';
import AuditLogs from './AuditLogs';
import MobileAppManagement from './MobileAppManagement';

export type SettingsSectionId =
  | 'account'
  | 'notifications'
  | 'pipeline'
  | 'automation'
  | 'integrations'
  | 'system'
  | 'ai-usage'
  | 'user-management'
  | 'feature-toggles'
  | 'custom-fields'
  | 'billing'
  | 'audit-logs'
  | 'mobile-app';

export interface SettingsSectionConfig {
  id: SettingsSectionId;
  label: string;
  icon: any;
  description: string;
  roles: string[];
  featureFlag?: string;
  badge?: string;
  component: React.ComponentType<any>;
}

export const settingsSections: SettingsSectionConfig[] = [
  {
    id: 'account',
    label: 'Account & Preferences',
    icon: User,
    description: 'Personal settings and preferences',
    roles: ['admin', 'manager', 'sales_rep'],
    component: AccountPreferences,
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    description: 'Email and in-app notifications',
    roles: ['admin', 'manager', 'sales_rep'],
    component: NotificationSettings,
  },
  {
    id: 'pipeline',
    label: 'Pipeline Configuration',
    icon: SettingsIcon,
    description: 'Customize your sales pipeline',
    roles: ['admin', 'manager'],
    component: PipelineConfiguration,
  },
  {
    id: 'automation',
    label: 'Automation Rules',
    icon: Zap,
    description: 'Set up automated workflows',
    badge: 'New',
    roles: ['admin', 'manager'],
    featureFlag: 'automation_enabled',
    component: AutomationRules,
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: Link,
    description: 'Connect external services',
    roles: ['admin', 'manager', 'sales_rep'],
    component: IntegrationSettings,
  },
  {
    id: 'ai-usage',
    label: 'AI Usage & Analytics',
    icon: Bot,
    description: 'Monitor AI usage and performance',
    badge: 'New',
    roles: ['admin', 'manager'],
    featureFlag: 'ai_guru_enabled',
    component: AIUsageStats,
  },
  {
    id: 'system',
    label: 'System Configuration',
    icon: Shield,
    description: 'Admin-only system settings',
    roles: ['admin'],
    component: SystemConfiguration,
  },
  // Modular/advanced sections below
  {
    id: 'user-management',
    label: 'User Management',
    icon: UserPlus,
    description: 'Manage users, roles, and invitations',
    roles: ['admin'],
    component: UserManagement,
  },
  {
    id: 'feature-toggles',
    label: 'Feature Toggles',
    icon: Zap,
    description: 'Enable or disable CRM modules by role',
    roles: ['admin'],
    component: FeatureToggles,
  },
  {
    id: 'custom-fields',
    label: 'Custom Fields',
    icon: Tag,
    description: 'Add custom fields to deals, contacts, companies',
    roles: ['admin', 'manager'],
    component: CustomFields,
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: CreditCard,
    description: 'Manage your subscription and invoices',
    roles: ['admin'],
    component: Billing,
  },
  {
    id: 'audit-logs',
    label: 'Audit Logs',
    icon: List,
    description: 'View all user actions and changes',
    roles: ['admin', 'manager'],
    component: AuditLogs,
  },
  {
    id: 'mobile-app',
    label: 'Mobile App Management',
    icon: Smartphone,
    description: 'Manage mobile app connections and settings',
    roles: ['admin', 'manager', 'sales_rep'],
    component: MobileAppManagement,
  },
]; 