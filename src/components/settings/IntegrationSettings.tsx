import React, { useState } from 'react';
import { Link, Mail, Cloud, Calendar, Smartphone, CheckCircle, AlertCircle, Settings, Sparkles } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import IntegrationOnboardingWizard from './IntegrationOnboardingWizard';

// 1. Update Integration type
interface UserConnection {
  userId: string;
  userName: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: Date;
  errorMessage?: string;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  isConnected: boolean;
  lastSync?: Date;
  status: 'connected' | 'error' | 'disconnected';
  features: string[];
  userConnections?: UserConnection[];
}

interface IntegrationSettingsProps {
  onChanges: (hasChanges: boolean) => void;
}

const IntegrationSettings: React.FC<IntegrationSettingsProps> = ({ onChanges }) => {
  const [showOnboardingWizard, setShowOnboardingWizard] = useState(false);
  
  // 1. Expand integrations state
  // 2. Add mock userConnections for Messenger, Call Systems, More Cloud Storage
  const [integrations, setIntegrations] = useState<Integration[]>([
    // Email & Calendar
    {
      id: 'gmail', name: 'Gmail', description: 'Sync emails and calendar events', icon: Mail, isConnected: false, status: 'disconnected', features: ['Email sync', 'Calendar sync', 'Contact import']
    },
    {
      id: 'outlook', name: 'Microsoft Outlook', description: 'Connect your Outlook account', icon: Mail, isConnected: true, lastSync: new Date(Date.now() - 30 * 60 * 1000), status: 'connected', features: ['Email sync', 'Calendar sync', 'Teams integration']
    },
    {
      id: 'calendly', name: 'Calendly', description: 'Schedule meetings automatically', icon: Calendar, isConnected: true, lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000), status: 'error', features: ['Meeting scheduling', 'Availability sync', 'Booking links']
    },
    // Cloud Storage
    { id: 'google-drive', name: 'Google Drive', description: 'Store and share files', icon: Cloud, isConnected: false, status: 'disconnected', features: ['File storage', 'Document sharing', 'Backup'] },
    { id: 'onedrive', name: 'OneDrive', description: 'Microsoft cloud storage', icon: Cloud, isConnected: false, status: 'disconnected', features: ['File storage', 'Document sharing', 'Office integration'] },
    // More Cloud Storage
    { id: 'dropbox', name: 'Dropbox', description: 'Cloud file storage and sharing', icon: Cloud, isConnected: false, status: 'disconnected', features: ['File storage', 'Document sharing'] },
    { id: 'box', name: 'Box', description: 'Secure cloud file sharing', icon: Cloud, isConnected: false, status: 'disconnected', features: ['File storage', 'Collaboration'] },
    // Communication
    { id: 'slack', name: 'Slack', description: 'Team communication and notifications', icon: Smartphone, isConnected: false, status: 'disconnected', features: ['Notifications', 'Deal updates', 'Team alerts'] },
    // Messenger
    { id: 'whatsapp', name: 'WhatsApp', description: 'Business messaging', icon: Smartphone, isConnected: false, status: 'disconnected', features: ['Messaging', 'Notifications'], userConnections: [
      { userId: '1', userName: 'Alice', status: 'connected', lastSync: new Date(Date.now() - 60 * 60 * 1000) },
      { userId: '2', userName: 'Bob', status: 'disconnected' },
      { userId: '3', userName: 'Charlie', status: 'error', errorMessage: 'Token expired' }
    ] },
    { id: 'facebook-messenger', name: 'Facebook Messenger', description: 'Messenger for business', icon: Smartphone, isConnected: false, status: 'disconnected', features: ['Messaging', 'Notifications'] },
    { id: 'telegram', name: 'Telegram', description: 'Secure messaging', icon: Smartphone, isConnected: false, status: 'disconnected', features: ['Messaging', 'Notifications'] },
    // Call Systems
    { id: 'zoom', name: 'Zoom', description: 'Video meetings and calls', icon: Smartphone, isConnected: false, status: 'disconnected', features: ['Video calls', 'Webinars'] },
    { id: 'teams', name: 'Microsoft Teams', description: 'Team calls and chat', icon: Smartphone, isConnected: false, status: 'disconnected', features: ['Calls', 'Chat', 'Meetings'] },
    { id: 'twilio', name: 'Twilio', description: 'Programmable calls and SMS', icon: Smartphone, isConnected: false, status: 'disconnected', features: ['Calls', 'SMS', 'Programmable Voice'] },
    { id: 'aircall', name: 'Aircall', description: 'Cloud phone system', icon: Smartphone, isConnected: false, status: 'disconnected', features: ['Calls', 'Call analytics'] },
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

  // 2. Update IntegrationCard for per-user management
  const IntegrationCard = ({ integration }: { integration: Integration }) => {
    const [showDetails, setShowDetails] = useState(false);
    const supportsPerUser = Array.isArray(integration.userConnections);

    return (
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
                <Button variant="secondary" size="sm" onClick={() => setShowDetails(v => !v)}>
                  {showDetails ? 'Hide Details' : 'Details'}
                </Button>
              </div>
              <p className="text-sm text-secondary-400 mb-3">{integration.description}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {integration.features.map((feature, index) => (
                  <span key={index} className="px-2 py-1 bg-[#23233a]/50 text-xs text-[#b0b0d0] rounded">{feature}</span>
                ))}
              </div>
              {integration.lastSync && (
                <p className="text-xs text-secondary-500">Last sync: {integration.lastSync.toLocaleString()}</p>
              )}
              {/* Per-user management */}
              {supportsPerUser && (
                <div className="mt-3">
                  <h5 className="text-xs text-secondary-300 mb-1">User Connections</h5>
                  <div className="space-y-2">
                    {integration.userConnections!.map(user => (
                      <div key={user.userId} className="flex items-center justify-between bg-[#23233a]/30 rounded px-3 py-2">
                        <span className="text-sm text-white">{user.userName}</span>
                        <span className="text-xs">
                          {user.status === 'connected' && <Badge variant="success" size="sm">Connected</Badge>}
                          {user.status === 'disconnected' && <Badge variant="secondary" size="sm">Disconnected</Badge>}
                          {user.status === 'error' && <Badge variant="danger" size="sm">Error</Badge>}
                        </span>
                        <div className="flex items-center gap-2">
                          {user.status === 'connected' && (
                            <Button variant="secondary" size="sm">Disconnect</Button>
                          )}
                          {user.status === 'disconnected' && (
                            <Button variant="gradient" size="sm">Connect</Button>
                          )}
                          {user.status === 'error' && (
                            <Button variant="gradient" size="sm">Retry</Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Health/Status Details */}
              {showDetails && (
                <div className="mt-3 p-3 bg-[#23233a]/40 border border-[#23233a]/30 rounded">
                  <div className="text-xs text-secondary-400 mb-1">Health/Status Details</div>
                  <div className="text-xs text-white">Last Sync: {integration.lastSync ? integration.lastSync.toLocaleString() : '-'}</div>
                  {supportsPerUser && integration.userConnections!.some(u => u.errorMessage) && (
                    <div className="mt-2">
                      <div className="text-xs text-danger-400 font-semibold">Errors:</div>
                      {integration.userConnections!.filter(u => u.errorMessage).map(u => (
                        <div key={u.userId} className="text-xs text-danger-400">{u.userName}: {u.errorMessage}</div>
                      ))}
                    </div>
                  )}
                  {!supportsPerUser && integration.status === 'error' && (
                    <div className="mt-2 text-xs text-danger-400 font-semibold">Error: Connection failed or token expired.</div>
                  )}
                  {/* Mock connection history */}
                  <div className="mt-2 text-xs text-secondary-400">Connection History: (mock)</div>
                  <ul className="list-disc list-inside text-xs text-secondary-400">
                    <li>Connected: 2024-07-20 10:00</li>
                    <li>Disconnected: 2024-07-19 18:00</li>
                    <li>Error: 2024-07-19 12:00 (Token expired)</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(integration.status)}
            {!supportsPerUser && (integration.isConnected ? (
              <div className="flex space-x-2">
                <Button variant="secondary" size="sm" className="p-2">
                  <Settings className="w-4 h-4" />
                </Button>
                <Button onClick={() => handleDisconnect(integration.id)} variant="gradient" size="sm">Disconnect</Button>
              </div>
            ) : (
              <Button onClick={() => handleConnect(integration.id)} variant="gradient" size="sm">Connect</Button>
            ))}
          </div>
        </div>
      </Card>
    );
  };

  const connectedCount = integrations.filter(i => i.isConnected).length;
  const errorCount = integrations.filter(i => i.status === 'error').length;
  // 4. Health/Status Dashboard Card at the top
  const lastSync = integrations.reduce((latest, i) => i.lastSync && (!latest || i.lastSync > latest) ? i.lastSync : latest, undefined as Date | undefined);

  return (
    <div className="space-y-6">
      {/* Onboarding Welcome Card */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary-600/20 rounded-lg">
              <Sparkles className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Get Started with Integrations</h3>
              <p className="text-secondary-400">Connect your favorite tools and boost productivity</p>
            </div>
          </div>
          <Button
            variant="gradient"
            size="md"
            onClick={() => setShowOnboardingWizard(true)}
          >
            Setup Wizard
          </Button>
        </div>
      </Card>

      {/* Health/Status Dashboard */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Link className="w-6 h-6 text-primary-600" />
            <h3 className="text-xl font-semibold text-white">Integrations Dashboard</h3>
          </div>
          <div className="flex space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{integrations.length}</div>
              <div className="text-sm text-secondary-400">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{connectedCount}</div>
              <div className="text-sm text-secondary-400">Connected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{errorCount}</div>
              <div className="text-sm text-secondary-400">Errors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{lastSync ? lastSync.toLocaleString() : '-'}</div>
              <div className="text-sm text-secondary-400">Last Sync</div>
            </div>
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
      {/* More Cloud Storage */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-4">More Cloud Storage</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {integrations.filter(i => ['dropbox', 'box'].includes(i.id)).map((integration) => (
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
      {/* Messenger */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-4">Messenger</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {integrations.filter(i => ['whatsapp', 'facebook-messenger', 'telegram'].includes(i.id)).map((integration) => (
            <IntegrationCard key={integration.id} integration={integration} />
          ))}
        </div>
      </div>
      {/* Call Systems */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-4">Call Systems</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {integrations.filter(i => ['zoom', 'teams', 'twilio', 'aircall'].includes(i.id)).map((integration) => (
            <IntegrationCard key={integration.id} integration={integration} />
          ))}
        </div>
      </div>
      {/* Custom Integrations */}
      <Card>
        <div className="flex items-center space-x-3 mb-4">
          <Settings className="w-6 h-6 text-primary-600" />
          <h4 className="text-lg font-semibold text-white">Custom Integrations</h4>
        </div>
        <div className="text-secondary-400 mb-2">Add webhooks, API keys, or connect to Zapier and other automation tools.</div>
        <div className="flex flex-col gap-3">
          <Button variant="gradient" size="md">Add Webhook</Button>
          <Button variant="gradient" size="md">Generate API Key</Button>
          <Button variant="gradient" size="md">Connect Zapier</Button>
        </div>
      </Card>
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

      {/* Integration Onboarding Wizard */}
      <IntegrationOnboardingWizard
        isOpen={showOnboardingWizard}
        onClose={() => setShowOnboardingWizard(false)}
      />
    </div>
  );
};

export default IntegrationSettings;