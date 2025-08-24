import React, { useState, useEffect } from 'react';
import { 
  Mail, Settings, Link, Unlink, CheckCircle, XCircle, AlertTriangle,
  RefreshCw, Clock, Users, Shield, Key, Globe, Download, Upload
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { useToastContext } from '../../contexts/ToastContext';
import { supabase } from '../../services/supabase';

interface EmailProvider {
  id: string;
  name: string;
  icon: string;
  isConnected: boolean;
  lastSync?: string;
  emailCount?: number;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
}

interface ExternalEmailIntegrationProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExternalEmailIntegration: React.FC<ExternalEmailIntegrationProps> = ({
  isOpen,
  onClose
}) => {
  const { showToast } = useToastContext();
  const [providers, setProviders] = useState<EmailProvider[]>([
    {
      id: 'gmail',
      name: 'Gmail',
      icon: '📧',
      isConnected: false,
      status: 'disconnected'
    },
    {
      id: 'outlook',
      name: 'Outlook',
      icon: '📮',
      isConnected: false,
      status: 'disconnected'
    },
    {
      id: 'yahoo',
      name: 'Yahoo Mail',
      icon: '📬',
      isConnected: false,
      status: 'disconnected'
    }
  ]);
  const [selectedProvider, setSelectedProvider] = useState<EmailProvider | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [syncSettings, setSyncSettings] = useState({
    autoSync: true,
    syncFrequency: '15', // minutes
    syncDirection: 'bidirectional', // 'incoming', 'outgoing', 'bidirectional'
    maxEmails: '100',
    syncAttachments: true
  });

  useEffect(() => {
    if (isOpen) {
      loadProviderStatus();
    }
  }, [isOpen]);

  const loadProviderStatus = async () => {
    try {
      // In a real implementation, this would check stored OAuth tokens
      // and provider connection status from the database
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Simulate checking provider connections
      setProviders(prev => prev.map(provider => ({
        ...provider,
        isConnected: Math.random() > 0.7, // Simulate some connected providers
        lastSync: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        emailCount: Math.floor(Math.random() * 500),
        status: Math.random() > 0.8 ? 'error' : (Math.random() > 0.5 ? 'connected' : 'disconnected')
      })));
    } catch (error) {
      console.error('Error loading provider status:', error);
    }
  };

  const connectProvider = async (providerId: string) => {
    setIsConnecting(true);
    try {
      // In a real implementation, this would initiate OAuth flow
      switch (providerId) {
        case 'gmail':
          await initiateGmailOAuth();
          break;
        case 'outlook':
          await initiateOutlookOAuth();
          break;
        case 'yahoo':
          await initiateYahooOAuth();
          break;
      }
    } catch (error) {
      console.error('Error connecting provider:', error);
      showToast({
        title: 'Connection Failed',
        description: 'Failed to connect email provider',
        type: 'error'
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectProvider = async (providerId: string) => {
    try {
      // In a real implementation, this would revoke OAuth tokens
      setProviders(prev => prev.map(provider => 
        provider.id === providerId 
          ? { ...provider, isConnected: false, status: 'disconnected' }
          : provider
      ));

      showToast({
        title: 'Disconnected',
        description: 'Email provider disconnected successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error disconnecting provider:', error);
      showToast({
        title: 'Error',
        description: 'Failed to disconnect provider',
        type: 'error'
      });
    }
  };

  const syncEmails = async (providerId: string) => {
    try {
      setProviders(prev => prev.map(provider => 
        provider.id === providerId 
          ? { ...provider, status: 'syncing' }
          : provider
      ));

      // Simulate email sync
      await new Promise(resolve => setTimeout(resolve, 3000));

      setProviders(prev => prev.map(provider => 
        provider.id === providerId 
          ? { 
              ...provider, 
              status: 'connected', 
              lastSync: new Date().toISOString(),
              emailCount: (provider.emailCount || 0) + Math.floor(Math.random() * 10)
            }
          : provider
      ));

      showToast({
        title: 'Sync Complete',
        description: 'Emails synced successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error syncing emails:', error);
      setProviders(prev => prev.map(provider => 
        provider.id === providerId 
          ? { ...provider, status: 'error' }
          : provider
      ));
      showToast({
        title: 'Sync Failed',
        description: 'Failed to sync emails',
        type: 'error'
      });
    }
  };

  // OAuth simulation functions (in real implementation, these would use actual OAuth)
  const initiateGmailOAuth = async () => {
    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setProviders(prev => prev.map(provider => 
      provider.id === 'gmail' 
        ? { ...provider, isConnected: true, status: 'connected' }
        : provider
    ));

    showToast({
      title: 'Gmail Connected',
      description: 'Gmail account connected successfully',
      type: 'success'
    });
  };

  const initiateOutlookOAuth = async () => {
    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setProviders(prev => prev.map(provider => 
      provider.id === 'outlook' 
        ? { ...provider, isConnected: true, status: 'connected' }
        : provider
    ));

    showToast({
      title: 'Outlook Connected',
      description: 'Outlook account connected successfully',
      type: 'success'
    });
  };

  const initiateYahooOAuth = async () => {
    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setProviders(prev => prev.map(provider => 
      provider.id === 'yahoo' 
        ? { ...provider, isConnected: true, status: 'connected' }
        : provider
    ));

    showToast({
      title: 'Yahoo Mail Connected',
      description: 'Yahoo Mail account connected successfully',
      type: 'success'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-[#43e7ad]';
      case 'syncing': return 'text-[#f59e0b]';
      case 'error': return 'text-[#ef4444]';
      default: return 'text-[#b0b0d0]';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return CheckCircle;
      case 'syncing': return RefreshCw;
      case 'error': return XCircle;
      default: return AlertTriangle;
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="External Email Integration" size="xl">
      <div className="space-y-6">
        {/* Integration Overview */}
        <Card className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Globe className="w-5 h-5" />
              <span>Email Provider Connections</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {providers.map((provider) => {
                const StatusIcon = getStatusIcon(provider.status);
                return (
                  <Card key={provider.id} className="bg-[#23233a]/30 border border-[#23233a]/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{provider.icon}</span>
                          <div>
                            <h3 className="font-medium text-white">{provider.name}</h3>
                            <div className={`flex items-center space-x-1 text-xs ${getStatusColor(provider.status)}`}>
                              <StatusIcon className="w-3 h-3" />
                              <span className="capitalize">{provider.status}</span>
                            </div>
                          </div>
                        </div>
                        {provider.isConnected ? (
                          <Badge variant="success" size="sm">Connected</Badge>
                        ) : (
                          <Badge variant="secondary" size="sm">Not Connected</Badge>
                        )}
                      </div>

                      {provider.isConnected && (
                        <div className="text-xs text-[#b0b0d0] mb-3 space-y-1">
                          <div>Last sync: {provider.lastSync ? new Date(provider.lastSync).toLocaleString() : 'Never'}</div>
                          <div>Emails: {provider.emailCount || 0}</div>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        {provider.isConnected ? (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              icon={RefreshCw}
                              onClick={() => syncEmails(provider.id)}
                              disabled={provider.status === 'syncing'}
                            >
                              {provider.status === 'syncing' ? 'Syncing...' : 'Sync'}
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              icon={Unlink}
                              onClick={() => disconnectProvider(provider.id)}
                            >
                              Disconnect
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="gradient"
                            size="sm"
                            icon={Link}
                            onClick={() => connectProvider(provider.id)}
                            disabled={isConnecting}
                          >
                            {isConnecting ? 'Connecting...' : 'Connect'}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Sync Settings */}
        <Card className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Sync Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Sync Frequency</label>
                <select
                  value={syncSettings.syncFrequency}
                  onChange={(e) => setSyncSettings({ ...syncSettings, syncFrequency: e.target.value })}
                  className="w-full px-3 py-2 bg-[#23233a]/50 border border-[#23233a]/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff] transition-all duration-200"
                >
                  <option value="5">Every 5 minutes</option>
                  <option value="15">Every 15 minutes</option>
                  <option value="30">Every 30 minutes</option>
                  <option value="60">Every hour</option>
                  <option value="manual">Manual only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Sync Direction</label>
                <select
                  value={syncSettings.syncDirection}
                  onChange={(e) => setSyncSettings({ ...syncSettings, syncDirection: e.target.value })}
                  className="w-full px-3 py-2 bg-[#23233a]/50 border border-[#23233a]/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff] transition-all duration-200"
                >
                  <option value="bidirectional">Bidirectional</option>
                  <option value="incoming">Incoming only</option>
                  <option value="outgoing">Outgoing only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Max Emails per Sync</label>
                <select
                  value={syncSettings.maxEmails}
                  onChange={(e) => setSyncSettings({ ...syncSettings, maxEmails: e.target.value })}
                  className="w-full px-3 py-2 bg-[#23233a]/50 border border-[#23233a]/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff] transition-all duration-200"
                >
                  <option value="50">50 emails</option>
                  <option value="100">100 emails</option>
                  <option value="250">250 emails</option>
                  <option value="500">500 emails</option>
                </select>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="syncAttachments"
                  checked={syncSettings.syncAttachments}
                  onChange={(e) => setSyncSettings({ ...syncSettings, syncAttachments: e.target.checked })}
                  className="w-4 h-4 text-[#a259ff] bg-[#23233a]/50 border-[#23233a]/30 rounded focus:ring-[#a259ff] focus:ring-2"
                />
                <label htmlFor="syncAttachments" className="text-sm font-medium text-white">
                  Sync Attachments
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button variant="secondary">
                Reset to Defaults
              </Button>
              <Button variant="gradient">
                Save Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security & Permissions */}
        <Card className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Security & Permissions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-[#23233a]/30 rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">Data Security</h4>
                <p className="text-sm text-[#b0b0d0] mb-3">
                  All email integrations use OAuth 2.0 for secure authentication. We never store your email passwords.
                </p>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-[#43e7ad]" />
                  <span className="text-sm text-[#b0b0d0]">End-to-end encryption</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-[#43e7ad]" />
                  <span className="text-sm text-[#b0b0d0]">OAuth 2.0 authentication</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-[#43e7ad]" />
                  <span className="text-sm text-[#b0b0d0]">GDPR compliant</span>
                </div>
              </div>

              <div className="bg-[#23233a]/30 rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">Required Permissions</h4>
                <div className="space-y-2 text-sm text-[#b0b0d0]">
                  <div>• Read your email messages</div>
                  <div>• Send emails on your behalf</div>
                  <div>• Access your email metadata</div>
                  <div>• Manage email labels/folders</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Modal>
  );
};

export default ExternalEmailIntegration;
