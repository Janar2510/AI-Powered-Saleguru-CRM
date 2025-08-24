import React, { useState } from 'react';
import { User, Mail, Globe, Palette, Eye, EyeOff, Save } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface AccountPreferencesProps {
  onChanges: (hasChanges: boolean) => void;
}

const AccountPreferences: React.FC<AccountPreferencesProps> = ({ onChanges }) => {
  const [formData, setFormData] = useState({
    firstName: 'Janar',
    lastName: 'Kuusk',
    email: 'janar@example.com',
    company: 'SaleToru Inc.',
    position: 'Sales Manager',
    timezone: 'Europe/Tallinn',
    theme: 'dark',
    language: 'en',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
    { value: 'Europe/Berlin', label: 'Central European Time (CET)' },
    { value: 'Europe/Tallinn', label: 'Eastern European Time (EET)' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' }
  ];

  const themes = [
    { value: 'dark', label: 'Dark Theme', description: 'Easy on the eyes' },
    { value: 'light', label: 'Light Theme', description: 'Classic bright interface' },
    { value: 'auto', label: 'Auto', description: 'Follow system preference' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    onChanges(true);
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = () => {
    // Save logic here
    onChanges(false);
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <User className="w-6 h-6 text-primary-600" />
          <h3 className="text-xl font-semibold text-white">Profile Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Company
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Position
            </label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => handleInputChange('position', e.target.value)}
              className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
        </div>
      </Card>

      {/* Preferences */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <Globe className="w-6 h-6 text-primary-600" />
          <h3 className="text-xl font-semibold text-white">Preferences</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Timezone
            </label>
            <select
              value={formData.timezone}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
              className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
            >
              {timezones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Language
            </label>
            <select
              value={formData.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
              className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="et">Eesti</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Theme Selection */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <Palette className="w-6 h-6 text-primary-600" />
          <h3 className="text-xl font-semibold text-white">Theme</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themes.map((theme) => (
            <Button
              key={theme.value}
              onClick={() => handleInputChange('theme', theme.value)}
              variant={formData.theme === theme.value ? 'gradient' : 'secondary'}
              className="p-4 h-full w-full text-left"
            >
              <div className="text-left">
                <div className="font-medium text-white">{theme.label}</div>
                <div className="text-sm text-[#b0b0d0] mt-1">{theme.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </Card>

      {/* Password Update */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Mail className="w-6 h-6 text-primary-600" />
            <h3 className="text-xl font-semibold text-white">Security</h3>
          </div>
          <Badge variant="secondary" size="sm">Optional</Badge>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                placeholder="Enter current password"
                className="w-full px-4 py-3 pr-12 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-white"
              >
                {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 pr-12 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-white"
                >
                  {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 pr-12 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-white"
                >
                  {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-secondary-700 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-white mb-2">Password Requirements:</h4>
            <ul className="text-xs text-secondary-400 space-y-1">
              <li>• At least 8 characters long</li>
              <li>• Contains uppercase and lowercase letters</li>
              <li>• Contains at least one number</li>
              <li>• Contains at least one special character</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} variant="gradient" className="flex items-center space-x-2">
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </Button>
      </div>
    </div>
  );
};

export default AccountPreferences;