import React, { useState } from 'react';
import { Smartphone, Shield, Download, Wifi, Fingerprint, Lock, Settings, RefreshCw, AlertTriangle, Bell } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface MobileAppManagementProps {
  onChanges: (hasChanges: boolean) => void;
}

const MobileAppManagement: React.FC<MobileAppManagementProps> = ({ onChanges }) => {
  const [mobileSettings, setMobileSettings] = useState({
    devices: [
      { id: '1', name: 'iPhone 15 Pro', os: 'iOS 17.4', lastSync: new Date(), status: 'connected' },
      { id: '2', name: 'iPad Pro', os: 'iPadOS 17.4', lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000), status: 'disconnected' }
    ],
    pushNotifications: {
      enabled: true,
      dealUpdates: true,
      taskReminders: true,
      mentions: true,
      systemAlerts: false
    },
    offlineSync: {
      enabled: true,
      syncContacts: true,
      syncDeals: true,
      syncTasks: true,
      dataLimit: '100MB'
    },
    security: {
      biometricLogin: true,
      appLock: true,
      autoLock: '5min',
      dataEncryption: true
    },
    appInfo: {
      version: '2.1.0',
      buildNumber: '210',
      lastUpdate: '2024-07-15',
      updateAvailable: false
    }
  });

  const handleDeviceAction = (deviceId: string, action: 'disconnect' | 'sync') => {
    setMobileSettings(prev => ({
      ...prev,
      devices: prev.devices.map(device => 
        device.id === deviceId 
          ? { ...device, lastSync: new Date(), status: action === 'sync' ? 'connected' : 'disconnected' }
          : device
      )
    }));
    onChanges(true);
  };

  const handlePushToggle = (setting: string) => {
    setMobileSettings(prev => ({
      ...prev,
      pushNotifications: {
        ...prev.pushNotifications,
        [setting]: !prev.pushNotifications[setting as keyof typeof prev.pushNotifications]
      }
    }));
    onChanges(true);
  };

  const handleOfflineToggle = (setting: string) => {
    setMobileSettings(prev => ({
      ...prev,
      offlineSync: {
        ...prev.offlineSync,
        [setting]: !prev.offlineSync[setting as keyof typeof prev.offlineSync]
      }
    }));
    onChanges(true);
  };

  const handleSecurityToggle = (setting: string) => {
    setMobileSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [setting]: !prev.security[setting as keyof typeof prev.security]
      }
    }));
    onChanges(true);
  };

  const handleAutoLockChange = (value: string) => {
    setMobileSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        autoLock: value
      }
    }));
    onChanges(true);
  };

  const handleDataLimitChange = (value: string) => {
    setMobileSettings(prev => ({
      ...prev,
      offlineSync: {
        ...prev.offlineSync,
        dataLimit: value
      }
    }));
    onChanges(true);
  };

  return (
    <div className="space-y-6">
      {/* Connected Devices */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <Smartphone className="w-6 h-6 text-primary-600" />
          <h3 className="text-xl font-semibold text-white">Connected Devices</h3>
        </div>

        <div className="space-y-4">
          {mobileSettings.devices.map(device => (
            <div key={device.id} className="flex items-center justify-between p-4 bg-secondary-700/50 rounded-lg border border-secondary-600">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-secondary-600 rounded-lg">
                  <Smartphone className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <h4 className="font-medium text-white">{device.name}</h4>
                  <p className="text-sm text-secondary-400">{device.os}</p>
                  <p className="text-xs text-secondary-500">
                    Last sync: {device.lastSync.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge 
                  variant={device.status === 'connected' ? 'success' : 'secondary'} 
                  size="sm"
                >
                  {device.status === 'connected' ? 'Connected' : 'Disconnected'}
                </Badge>
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={RefreshCw}
                    onClick={() => handleDeviceAction(device.id, 'sync')}
                  >
                    Sync
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeviceAction(device.id, 'disconnect')}
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <Button variant="gradient" size="md" icon={Download}>
            Download Mobile App
          </Button>
        </div>
      </Card>

      {/* Push Notifications */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <Bell className="w-6 h-6 text-primary-600" />
          <h3 className="text-xl font-semibold text-white">Push Notifications</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Enable Push Notifications</h4>
              <p className="text-sm text-secondary-400">Receive notifications on your mobile device</p>
            </div>
            <button
              onClick={() => handlePushToggle('enabled')}
              className={`w-12 h-6 rounded-full transition-all ${
                mobileSettings.pushNotifications.enabled ? 'bg-primary-600' : 'bg-secondary-600'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-all ${
                mobileSettings.pushNotifications.enabled ? 'ml-6' : 'ml-1'
              }`} />
            </button>
          </div>

          {mobileSettings.pushNotifications.enabled && (
            <div className="space-y-3 pl-4 border-l-2 border-primary-600">
              {Object.entries(mobileSettings.pushNotifications).filter(([key]) => key !== 'enabled').map(([key, enabled]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-white capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <button
                    onClick={() => handlePushToggle(key)}
                    className={`w-10 h-5 rounded-full transition-all ${
                      enabled ? 'bg-primary-600' : 'bg-secondary-600'
                    }`}
                  >
                    <div className={`w-3 h-3 bg-white rounded-full transition-all ${
                      enabled ? 'ml-5' : 'ml-1'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Offline Sync */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <Wifi className="w-6 h-6 text-primary-600" />
          <h3 className="text-xl font-semibold text-white">Offline Sync</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Enable Offline Sync</h4>
              <p className="text-sm text-secondary-400">Access data when offline</p>
            </div>
            <button
              onClick={() => handleOfflineToggle('enabled')}
              className={`w-12 h-6 rounded-full transition-all ${
                mobileSettings.offlineSync.enabled ? 'bg-primary-600' : 'bg-secondary-600'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-all ${
                mobileSettings.offlineSync.enabled ? 'ml-6' : 'ml-1'
              }`} />
            </button>
          </div>

          {mobileSettings.offlineSync.enabled && (
            <div className="space-y-4 pl-4 border-l-2 border-primary-600">
              <div className="space-y-3">
                {Object.entries(mobileSettings.offlineSync).filter(([key]) => !['enabled', 'dataLimit'].includes(key)).map(([key, enabled]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-white capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <button
                      onClick={() => handleOfflineToggle(key)}
                      className={`w-10 h-5 rounded-full transition-all ${
                        enabled ? 'bg-primary-600' : 'bg-secondary-600'
                      }`}
                    >
                      <div className={`w-3 h-3 bg-white rounded-full transition-all ${
                        enabled ? 'ml-5' : 'ml-1'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-2">Data Limit</label>
                <select
                  value={mobileSettings.offlineSync.dataLimit}
                  onChange={(e) => handleDataLimitChange(e.target.value)}
                  className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                >
                  <option value="50MB">50 MB</option>
                  <option value="100MB">100 MB</option>
                  <option value="250MB">250 MB</option>
                  <option value="500MB">500 MB</option>
                  <option value="1GB">1 GB</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Security Settings */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="w-6 h-6 text-primary-600" />
          <h3 className="text-xl font-semibold text-white">Security Settings</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Fingerprint className="w-5 h-5 text-primary-400" />
              <div>
                <h4 className="font-medium text-white">Biometric Login</h4>
                <p className="text-sm text-secondary-400">Use fingerprint or face ID</p>
              </div>
            </div>
            <button
              onClick={() => handleSecurityToggle('biometricLogin')}
              className={`w-12 h-6 rounded-full transition-all ${
                mobileSettings.security.biometricLogin ? 'bg-primary-600' : 'bg-secondary-600'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-all ${
                mobileSettings.security.biometricLogin ? 'ml-6' : 'ml-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Lock className="w-5 h-5 text-primary-400" />
              <div>
                <h4 className="font-medium text-white">App Lock</h4>
                <p className="text-sm text-secondary-400">Require authentication to open app</p>
              </div>
            </div>
            <button
              onClick={() => handleSecurityToggle('appLock')}
              className={`w-12 h-6 rounded-full transition-all ${
                mobileSettings.security.appLock ? 'bg-primary-600' : 'bg-secondary-600'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-all ${
                mobileSettings.security.appLock ? 'ml-6' : 'ml-1'
              }`} />
            </button>
          </div>

          {mobileSettings.security.appLock && (
            <div className="pl-8">
              <label className="block text-sm font-medium text-secondary-300 mb-2">Auto Lock After</label>
              <select
                value={mobileSettings.security.autoLock}
                onChange={(e) => handleAutoLockChange(e.target.value)}
                className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
              >
                <option value="1min">1 minute</option>
                <option value="5min">5 minutes</option>
                <option value="15min">15 minutes</option>
                <option value="30min">30 minutes</option>
                <option value="1hour">1 hour</option>
              </select>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-primary-400" />
              <div>
                <h4 className="font-medium text-white">Data Encryption</h4>
                <p className="text-sm text-secondary-400">Encrypt local data storage</p>
              </div>
            </div>
            <button
              onClick={() => handleSecurityToggle('dataEncryption')}
              className={`w-12 h-6 rounded-full transition-all ${
                mobileSettings.security.dataEncryption ? 'bg-primary-600' : 'bg-secondary-600'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-all ${
                mobileSettings.security.dataEncryption ? 'ml-6' : 'ml-1'
              }`} />
            </button>
          </div>
        </div>
      </Card>

      {/* App Information */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <Settings className="w-6 h-6 text-primary-600" />
          <h3 className="text-xl font-semibold text-white">App Information</h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-1">Version</label>
              <p className="text-white font-mono">{mobileSettings.appInfo.version}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-1">Build</label>
              <p className="text-white font-mono">{mobileSettings.appInfo.buildNumber}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-1">Last Update</label>
              <p className="text-white">{mobileSettings.appInfo.lastUpdate}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-1">Status</label>
              <div className="flex items-center space-x-2">
                {mobileSettings.appInfo.updateAvailable ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-warning-500" />
                    <Badge variant="warning" size="sm">Update Available</Badge>
                  </>
                ) : (
                  <Badge variant="success" size="sm">Up to Date</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button variant="gradient" size="md" icon={RefreshCw}>
              Check for Updates
            </Button>
            <Button variant="secondary" size="md">
              View Release Notes
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MobileAppManagement; 