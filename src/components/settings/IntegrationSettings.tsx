import React, { useState } from 'react';
import { Link, Mail, Cloud, Calendar, Smartphone, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  isConnected: boolean;
  lastSync?: Date;
  status: 'connected' | 'error' | 'disconnected';
  features: string[];
}

interface IntegrationSettingsProps {
  onChanges: (hasChanges: boolean) => void;
}

const IntegrationSettings: React.FC<IntegrationSettingsProps> = ({ onChanges }) => {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Sync emails and calendar events',
      icon: Mail,
      isConnected: false,
      status: 'disconnected',
      features: ['Email sync', 'Calendar sync', 'Contact import']
    },
    {
      id: 'outlook',
      name: 'Microsoft Outlook',
      description: 'Connect your Outlook account',
      icon: Mail,
      isConnected: true,
      lastSync: new Date(Date.now() - 30 * 60 * 1000),
      status: 'connected',
      features: ['Email sync', 'Calendar sync', 'Teams integration']
    },
    {
      id: 'google-drive',
      name: 'Google Drive',
      description: 'Store and share files',
      icon: Cloud,
      isConnected: false,
      status: 'disconnected',
      features: ['File storage', 'Document sharing', 'Backup']
    },
    {
      id: 'onedrive',
      name: 'OneDrive',
      description: 'Microsoft cloud storage',
      icon: Cloud,
      isConnected: false,
      status: 'disconnected',
      features: ['File storage', 'Document sharing', 'Office integration']
    },
    {
      id: 'calendly',
      name: 'Calendly',
      description: 'Schedule meetings automatically',
      icon: Calendar,
      isConnected: true,
      lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'error',
      features: ['Meeting scheduling', 'Availability sync', 'Booking links']
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Team communication and notifications',
      icon: Smartphone,
      isConnected: false,
      status: 'disconnected',
      features: ['Notifications', 'Deal updates', 'Team alerts']
    }
  ]);

  const handleConnect = (integrationId: string) => {
    // Mock OAuth flow
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { 
            ...integration, 
            isConnected: true, 
            status: 'connected' as const,
            lastSync: new Date()
          }
        : integration
    ));
    onChanges(true);
  };

  const handleDisconnect = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { 
            ...integration, 
            isConnected: false, 
            status: 'disconnected' as const,
            lastSync: undefined
          }
        : integration
    ));
    onChanges(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-secondary-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="success" size="sm">Connected</Badge>;
      case 'error':
        return <Badge variant="danger" size="sm">Error</Badge>;
      default:
        return <Badge variant="secondary" size="sm">Not Connected</Badge>;
    }
  };

  const IntegrationCard = ({ integration }: { integration: Integration }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-secondary-700 rounded-lg">
            <integration.icon className="w-6 h-6 text-primary-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h4 className="font-semibold text-white">{integration.name}</h4>
              {getStatusBadge(integration.status)}
            </div>
            <p className="text-sm text-secondary-400 mb-3">{integration.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {integration.features.map((feature, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-secondary-600 text-xs text-secondary-300 rounded"
                >
                  {feature}
                </span>
              ))}
            </div>

            {integration.lastSync && (
              <p className="text-xs text-secondary-500">
                Last sync: {integration.lastSync.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {getStatusIcon(integration.status)}
          {integration.isConnected ? (
            <div className="flex space-x-2">
              <button className="p-2 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors">
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDisconnect(integration.id)}
                className="btn-secondary text-sm"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleConnect(integration.id)}
              className="btn-primary text-sm"
            >
              Connect
            </button>
          )}
        </div>
      </div>
    </Card>
  );

  const connectedCount = integrations.filter(i => i.isConnected).length;
  const errorCount = integrations.filter(i => i.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <Link className="w-6 h-6 text-primary-600" />
          <div>
            <h3 className="text-xl font-semibold text-white">Integrations</h3>
            <p className="text-secondary-400 text-sm">Connect external services to enhance your CRM</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-secondary-700 rounded-lg">
            <div className="text-2xl font-bold text-white">{integrations.length}</div>
            <div className="text-sm text-secondary-400">Available</div>
          </div>
          <div className="text-center p-4 bg-secondary-700 rounded-lg">
            <div className="text-2xl font-bold text-green-500">{connectedCount}</div>
            <div className="text-sm text-secondary-400">Connected</div>
          </div>
          <div className="text-center p-4 bg-secondary-700 rounded-lg">
            <div className="text-2xl font-bold text-red-500">{errorCount}</div>
            <div className="text-sm text-secondary-400">Errors</div>
          </div>
        </div>
      </Card>

      {/* Email & Calendar */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-4">Email & Calendar</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {integrations.filter(i => ['gmail', 'outlook', 'calendly'].includes(i.id)).map((integration) => (
            <IntegrationCard key={integration.id} integration={integration} />
          ))}
        </div>
      </div>

      {/* Cloud Storage */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-4">Cloud Storage</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {integrations.filter(i => ['google-drive', 'onedrive'].includes(i.id)).map((integration) => (
            <IntegrationCard key={integration.id} integration={integration} />
          ))}
        </div>
      </div>

      {/* Communication */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-4">Communication</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {integrations.filter(i => ['slack'].includes(i.id)).map((integration) => (
            <IntegrationCard key={integration.id} integration={integration} />
          ))}
        </div>
      </div>

      {/* OAuth Placeholder */}
      <Card>
        <div className="p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
          <h4 className="font-medium text-blue-200 mb-2">OAuth Integration</h4>
          <p className="text-sm text-blue-300">
            These integrations use OAuth for secure authentication. When you click "Connect", 
            you'll be redirected to the service's login page to authorize SaleToru CRM.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default IntegrationSettings;