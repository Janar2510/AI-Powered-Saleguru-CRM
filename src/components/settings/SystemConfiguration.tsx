import React, { useState } from 'react';
import { Shield, Users, Database, Download, Upload, AlertTriangle, Server } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

interface SystemConfigurationProps {
  onChanges: (hasChanges: boolean) => void;
}

const SystemConfiguration: React.FC<SystemConfigurationProps> = ({ onChanges }) => {
  const [systemSettings, setSystemSettings] = useState({
    userRegistration: true,
    emailVerification: true,
    twoFactorAuth: false,
    sessionTimeout: 480, // minutes
    maxFileSize: 10, // MB
    backupFrequency: 'daily',
    dataRetention: 365, // days
    auditLogging: true
  });

  const [users] = useState([
    { id: '1', name: 'Janar Kuusk', email: 'janar@example.com', role: 'admin', status: 'active', lastLogin: new Date() },
    { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', role: 'manager', status: 'active', lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { id: '3', name: 'Mike Wilson', email: 'mike@example.com', role: 'sales_rep', status: 'inactive', lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000) }
  ]);

  // Mock data for API keys and webhooks
  const mockApiKeys = [
    { key: 'sk-1234-5678', created: '2024-07-18', lastUsed: '2024-07-20', status: 'active' }
  ];
  const mockWebhooks = [
    { id: 1, url: 'https://example.com/webhook', status: 'active', lastDelivery: '2024-07-20 10:00' },
    { id: 2, url: 'https://zapier.com/hooks/abc', status: 'error', lastDelivery: '2024-07-19 18:00' }
  ];
  const [branding, setBranding] = useState({
    logo: '',
    primary: '#a259ff',
    secondary: '#23233a'
  });
  const [lastExport, setLastExport] = useState('2024-07-19 15:00');
  const [lastImport, setLastImport] = useState('2024-07-18 12:00');

  const handleSettingChange = (setting: string, value: any) => {
    setSystemSettings(prev => ({ ...prev, [setting]: value }));
    onChanges(true);
  };

  const handleBackup = () => {
    // Mock backup process
    alert('Backup initiated. You will receive an email when complete.');
  };

  const handleRestore = () => {
    // Mock restore process
    if (confirm('Are you sure you want to restore from backup? This will overwrite current data.')) {
      alert('Restore process initiated.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Settings */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="w-6 h-6 text-primary-600" />
          <h3 className="text-xl font-semibold text-white">Security Settings</h3>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-secondary-700 rounded-lg">
              <div>
                <h4 className="font-medium text-white">User Registration</h4>
                <p className="text-sm text-secondary-400">Allow new users to register</p>
              </div>
              <button
                onClick={() => handleSettingChange('userRegistration', !systemSettings.userRegistration)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  systemSettings.userRegistration ? 'bg-primary-600' : 'bg-secondary-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    systemSettings.userRegistration ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary-700 rounded-lg">
              <div>
                <h4 className="font-medium text-white">Email Verification</h4>
                <p className="text-sm text-secondary-400">Require email verification for new accounts</p>
              </div>
              <button
                onClick={() => handleSettingChange('emailVerification', !systemSettings.emailVerification)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  systemSettings.emailVerification ? 'bg-primary-600' : 'bg-secondary-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    systemSettings.emailVerification ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary-700 rounded-lg">
              <div>
                <h4 className="font-medium text-white">Two-Factor Authentication</h4>
                <p className="text-sm text-secondary-400">Require 2FA for all users</p>
              </div>
              <button
                onClick={() => handleSettingChange('twoFactorAuth', !systemSettings.twoFactorAuth)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  systemSettings.twoFactorAuth ? 'bg-primary-600' : 'bg-secondary-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    systemSettings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary-700 rounded-lg">
              <div>
                <h4 className="font-medium text-white">Audit Logging</h4>
                <p className="text-sm text-secondary-400">Log all user actions</p>
              </div>
              <button
                onClick={() => handleSettingChange('auditLogging', !systemSettings.auditLogging)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  systemSettings.auditLogging ? 'bg-primary-600' : 'bg-secondary-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    systemSettings.auditLogging ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                min="30"
                max="1440"
                value={systemSettings.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                Max File Upload Size (MB)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={systemSettings.maxFileSize}
                onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* User Management */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-primary-600" />
            <h3 className="text-xl font-semibold text-white">User Management</h3>
          </div>
          <button className="btn-primary">Add User</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-700">
                <th className="text-left py-3 px-4 font-medium text-secondary-300">User</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-300">Role</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-300">Status</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-300">Last Login</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-secondary-700">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-white">{user.name}</div>
                      <div className="text-sm text-secondary-400">{user.email}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary" size="sm">
                      {user.role.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge 
                      variant={user.status === 'active' ? 'success' : 'secondary'} 
                      size="sm"
                    >
                      {user.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-secondary-300">
                    {user.lastLogin.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button className="btn-secondary text-xs px-2 py-1">Edit</button>
                      {user.role !== 'admin' && (
                        <button className="text-red-400 hover:text-red-300 text-xs px-2 py-1">
                          Deactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Data Management (expanded) */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <Database className="w-6 h-6 text-primary-600" />
          <h3 className="text-xl font-semibold text-white">Data Management</h3>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                Backup Frequency
              </label>
              <select
                value={systemSettings.backupFrequency}
                onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                Data Retention (days)
              </label>
              <input
                type="number"
                min="30"
                max="2555"
                value={systemSettings.dataRetention}
                onChange={(e) => handleSettingChange('dataRetention', parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="gradient" size="md" onClick={() => setLastExport('2024-07-20 12:00')}>Export Data</Button>
            <Button variant="secondary" size="md" onClick={() => setLastImport('2024-07-20 12:30')}>Import Data</Button>
          </div>
          <div className="flex gap-6 text-secondary-400 text-sm">
            <span>Last Export: {lastExport}</span>
            <span>Last Import: {lastImport}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Button onClick={handleBackup} variant="success" size="md" icon={Download}>Create Backup</Button>
            <Button onClick={handleRestore} variant="warning" size="md" icon={Upload}>Restore from Backup</Button>
          </div>
        </div>
      </Card>
      {/* API Access & Documentation */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="w-6 h-6 text-primary-600" />
          <h3 className="text-xl font-semibold text-white">API Access</h3>
        </div>
        <div className="mb-4 text-secondary-300">Base URL: <span className="font-mono text-primary-400">https://api.saletoru.com/v1/</span></div>
        <div className="mb-4 text-secondary-300">Example Endpoint: <span className="font-mono text-primary-400">GET /deals</span></div>
        <div className="mb-4">
          <Button variant="gradient" size="sm" className="mr-2">Generate API Key</Button>
          <a href="#" className="text-primary-400 underline ml-2">API Documentation</a>
        </div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-secondary-400">
              <th className="p-2 text-left">Key</th>
              <th className="p-2 text-left">Created</th>
              <th className="p-2 text-left">Last Used</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockApiKeys.map((key, idx) => (
              <tr key={idx} className="border-b border-secondary-700">
                <td className="p-2 font-mono text-primary-400">{key.key}</td>
                <td className="p-2">{key.created}</td>
                <td className="p-2">{key.lastUsed}</td>
                <td className="p-2">
                  <Badge variant="success" size="sm">{key.status}</Badge>
                </td>
                <td className="p-2">
                  <Button variant="secondary" size="sm">Revoke</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {/* Webhook Management */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="w-6 h-6 text-primary-600" />
          <h3 className="text-xl font-semibold text-white">Webhook Management</h3>
        </div>
        <div className="mb-4">
          <Button variant="gradient" size="sm">Add Webhook</Button>
        </div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-secondary-400">
              <th className="p-2 text-left">URL</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Last Delivery</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockWebhooks.map((wh) => (
              <tr key={wh.id} className="border-b border-secondary-700">
                <td className="p-2 font-mono text-primary-400">{wh.url}</td>
                <td className="p-2">
                  <Badge variant={wh.status === 'active' ? 'success' : 'danger'} size="sm">{wh.status}</Badge>
                </td>
                <td className="p-2">{wh.lastDelivery}</td>
                <td className="p-2 flex gap-2">
                  <Button variant="secondary" size="sm">Edit</Button>
                  <Button variant="danger" size="sm">Remove</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {/* Branding/Customization */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="w-6 h-6 text-primary-600" />
          <h3 className="text-xl font-semibold text-white">Branding & Customization</h3>
        </div>
        <div className="mb-4 flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">Logo</label>
            <input type="file" accept="image/*" className="block w-full text-secondary-300" onChange={e => {
              const file = e.target.files?.[0];
              if (file) setBranding(prev => ({ ...prev, logo: URL.createObjectURL(file) }));
            }} />
          </div>
          {branding.logo && (
            <img src={branding.logo} alt="Logo Preview" className="h-16 w-16 rounded bg-secondary-700 border border-secondary-600 object-contain" />
          )}
        </div>
        <div className="mb-4 flex gap-6">
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">Primary Color</label>
            <input type="color" value={branding.primary} onChange={e => setBranding(prev => ({ ...prev, primary: e.target.value }))} className="w-10 h-10 rounded border-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">Secondary Color</label>
            <input type="color" value={branding.secondary} onChange={e => setBranding(prev => ({ ...prev, secondary: e.target.value }))} className="w-10 h-10 rounded border-none" />
          </div>
        </div>
        <div className="mt-6 p-4 rounded-lg border border-secondary-600 bg-secondary-800/60">
          <h4 className="text-sm font-semibold text-white mb-2">Live Preview</h4>
          <div className="flex items-center gap-4">
            {branding.logo && <img src={branding.logo} alt="Logo Preview" className="h-10 w-10 rounded bg-secondary-700 border border-secondary-600 object-contain" />}
            <span className="text-lg font-bold" style={{ color: branding.primary }}>Saleguru CRM</span>
            <span className="px-3 py-1 rounded" style={{ background: branding.secondary, color: branding.primary }}>Button</span>
          </div>
        </div>
      </Card>
      {/* System Status */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <Server className="w-6 h-6 text-primary-600" />
          <h3 className="text-xl font-semibold text-white">System Status</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-secondary-700 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-medium text-white">Database</span>
            </div>
            <p className="text-sm text-secondary-400">Operational</p>
          </div>

          <div className="p-4 bg-secondary-700 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-medium text-white">Email Service</span>
            </div>
            <p className="text-sm text-secondary-400">Operational</p>
          </div>

          <div className="p-4 bg-secondary-700 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="font-medium text-white">File Storage</span>
            </div>
            <p className="text-sm text-secondary-400">85% capacity</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-200">System Maintenance</h4>
              <p className="text-yellow-300 text-sm mt-1">
                Scheduled maintenance window: Sunday 2:00 AM - 4:00 AM UTC
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SystemConfiguration;