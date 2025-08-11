import React, { useState } from 'react';
import { Bell, Mail, Smartphone, Clock, AlertTriangle, Zap, Settings, Globe } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Dropdown from '../ui/Dropdown';
import Toggle from '../ui/Toggle';

interface NotificationSettingsProps {
  onChanges: (hasChanges: boolean) => void;
}

interface NotificationSettingsState {
  email: {
    dealUpdates: boolean;
    taskReminders: boolean;
    weeklyDigest: boolean;
    systemAlerts: boolean;
    teamActivity: boolean;
  };
  inApp: {
    dealUpdates: boolean;
    taskReminders: boolean;
    mentions: boolean;
    systemAlerts: boolean;
    teamActivity: boolean;
  };
  mobile: {
    pushNotifications: boolean;
    smsAlerts: boolean;
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
  channelPreferences: {
    dealUpdates: string[];
    taskReminders: string[];
    mentions: string[];
    systemAlerts: string[];
    teamActivity: string[];
  };
  schedule: {
    workingHours: {
      start: string;
      end: string;
      days: number[];
    };
    timezone: string;
    weekendNotifications: boolean;
  };
  smartAlerts: {
    enabled: boolean;
    dealStuckDays: number;
    taskOverdueDays: number;
    followUpReminder: number;
    pipelineReview: number;
    priorityFiltering: boolean;
    frequencyControl: string;
  };
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onChanges }) => {
  const [settings, setSettings] = useState<NotificationSettingsState>({
    email: {
      dealUpdates: true,
      taskReminders: true,
      weeklyDigest: true,
      systemAlerts: false,
      teamActivity: true
    },
    inApp: {
      dealUpdates: true,
      taskReminders: true,
      mentions: true,
      systemAlerts: true,
      teamActivity: false
    },
    mobile: {
      pushNotifications: true,
      smsAlerts: false,
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00'
      }
    },
    channelPreferences: {
      dealUpdates: ['email', 'inApp'],
      taskReminders: ['inApp', 'mobile'],
      mentions: ['inApp', 'email'],
      systemAlerts: ['email', 'inApp'],
      teamActivity: ['inApp']
    },
    schedule: {
      workingHours: {
        start: '09:00',
        end: '17:00',
        days: [1, 2, 3, 4, 5]
      },
      timezone: 'UTC-5',
      weekendNotifications: false
    },
    smartAlerts: {
      enabled: true,
      dealStuckDays: 14,
      taskOverdueDays: 1,
      followUpReminder: 7,
      pipelineReview: 30,
      priorityFiltering: true,
      frequencyControl: 'medium'
    }
  });

  const handleToggle = (category: string, setting: string) => {
    setSettings(prev => {
      const categorySettings = prev[category as keyof typeof prev] as any;
      return {
        ...prev,
        [category]: {
          ...categorySettings,
          [setting]: !categorySettings[setting]
        }
      };
    });
    onChanges(true);
  };

  const handleSmartAlertChange = (setting: string, value: number) => {
    setSettings(prev => ({
      ...prev,
      smartAlerts: {
        ...prev.smartAlerts,
        [setting]: value
      }
    }));
    onChanges(true);
  };

  const handleChannelToggle = (notificationType: string, channel: string) => {
    setSettings(prev => {
      const currentChannels = prev.channelPreferences[notificationType as keyof typeof prev.channelPreferences] || [];
      const newChannels = currentChannels.includes(channel)
        ? currentChannels.filter(c => c !== channel)
        : [...currentChannels, channel];
      
      return {
        ...prev,
        channelPreferences: {
          ...prev.channelPreferences,
          [notificationType]: newChannels
        }
      };
    });
    onChanges(true);
  };

  const handleScheduleChange = (setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [setting]: value
      }
    }));
    onChanges(true);
  };

  const handleMobileToggle = (setting: string) => {
    setSettings(prev => ({
      ...prev,
      mobile: {
        ...prev.mobile,
        [setting]: !prev.mobile[setting as keyof typeof prev.mobile]
      }
    }));
    onChanges(true);
  };

  const handleQuietHoursToggle = () => {
    setSettings(prev => ({
      ...prev,
      mobile: {
        ...prev.mobile,
        quietHours: {
          ...prev.mobile.quietHours,
          enabled: !prev.mobile.quietHours.enabled
        }
      }
    }));
    onChanges(true);
  };

  const NotificationToggle = ({ 
    label, 
    description, 
    enabled, 
    onToggle,
    badge 
  }: {
    label: string;
    description: string;
    enabled: boolean;
    onToggle: () => void;
    badge?: string;
  }) => (
    <div className="flex items-center justify-between p-4 bg-[#23233a]/50 border border-[#23233a]/30 rounded-lg">
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <h4 className="font-medium text-white">{label}</h4>
          {badge && <Badge variant="success" size="sm">{badge}</Badge>}
        </div>
        <p className="text-sm text-[#b0b0d0] mt-1">{description}</p>
      </div>
      <Toggle
        checked={enabled}
        onChange={onToggle}
        variant="gradient"
        aria-label={label}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <Mail className="w-6 h-6 text-primary-600" />
          <h3 className="text-xl font-semibold text-white">Email Notifications</h3>
        </div>

        <div className="space-y-4">
          <NotificationToggle
            label="Deal Updates"
            description="Get notified when deals move between stages or are updated"
            enabled={settings.email.dealUpdates}
            onToggle={() => handleToggle('email', 'dealUpdates')}
          />
          
          <NotificationToggle
            label="Task Reminders"
            description="Receive email reminders for upcoming and overdue tasks"
            enabled={settings.email.taskReminders}
            onToggle={() => handleToggle('email', 'taskReminders')}
          />
          
          <NotificationToggle
            label="Weekly Digest"
            description="Summary of your week's activities and performance"
            enabled={settings.email.weeklyDigest}
            onToggle={() => handleToggle('email', 'weeklyDigest')}
          />
          
          <NotificationToggle
            label="System Alerts"
            description="Important system updates and maintenance notifications"
            enabled={settings.email.systemAlerts}
            onToggle={() => handleToggle('email', 'systemAlerts')}
          />
          
          <NotificationToggle
            label="Team Activity"
            description="Updates on team member activities and achievements"
            enabled={settings.email.teamActivity}
            onToggle={() => handleToggle('email', 'teamActivity')}
          />
        </div>
      </Card>

      {/* In-App Notifications */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <Smartphone className="w-6 h-6 text-primary-600" />
          <h3 className="text-xl font-semibold text-white">In-App Notifications</h3>
        </div>

        <div className="space-y-4">
          <NotificationToggle
            label="Deal Updates"
            description="Real-time notifications for deal changes"
            enabled={settings.inApp.dealUpdates}
            onToggle={() => handleToggle('inApp', 'dealUpdates')}
          />
          
          <NotificationToggle
            label="Task Reminders"
            description="Pop-up reminders for tasks and deadlines"
            enabled={settings.inApp.taskReminders}
            onToggle={() => handleToggle('inApp', 'taskReminders')}
          />
          
          <NotificationToggle
            label="Mentions"
            description="When someone mentions you in comments or notes"
            enabled={settings.inApp.mentions}
            onToggle={() => handleToggle('inApp', 'mentions')}
          />
          
          <NotificationToggle
            label="System Alerts"
            description="Critical system notifications and updates"
            enabled={settings.inApp.systemAlerts}
            onToggle={() => handleToggle('inApp', 'systemAlerts')}
          />
          
          <NotificationToggle
            label="Team Activity"
            description="Live updates from your team members"
            enabled={settings.inApp.teamActivity}
            onToggle={() => handleToggle('inApp', 'teamActivity')}
          />
        </div>
      </Card>

      {/* Smart Alerts */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <Zap className="w-6 h-6 text-primary-600" />
          <h3 className="text-xl font-semibold text-white">Smart Notifications</h3>
        </div>

        <div className="space-y-6">
          <NotificationToggle
            label="AI-Powered Prioritization"
            description="Automatically prioritize important notifications"
            enabled={settings.smartAlerts.priorityFiltering}
            onToggle={() => {
              setSettings(prev => ({
                ...prev,
                smartAlerts: {
                  ...prev.smartAlerts,
                  priorityFiltering: !prev.smartAlerts.priorityFiltering
                }
              }));
              onChanges(true);
            }}
          />

          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Notification Frequency
            </label>
            <Dropdown
              options={[
                { value: 'low', label: 'Low - Only critical notifications' },
                { value: 'medium', label: 'Medium - Balanced notifications' },
                { value: 'high', label: 'High - All notifications' }
              ]}
              value={settings.smartAlerts.frequencyControl}
              onChange={val => {
                setSettings(prev => ({
                  ...prev,
                  smartAlerts: {
                    ...prev.smartAlerts,
                    frequencyControl: val
                  }
                }));
                onChanges(true);
              }}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                Deal Stuck Alert (days)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.smartAlerts.dealStuckDays}
                onChange={(e) => handleSmartAlertChange('dealStuckDays', parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                Task Overdue Alert (days)
              </label>
              <input
                type="number"
                min="1"
                max="7"
                value={settings.smartAlerts.taskOverdueDays}
                onChange={(e) => handleSmartAlertChange('taskOverdueDays', parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Mobile Notifications */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <Smartphone className="w-6 h-6 text-primary-600" />
          <h3 className="text-xl font-semibold text-white">Mobile Notifications</h3>
        </div>

        <div className="space-y-4">
          <NotificationToggle
            label="Push Notifications"
            description="Receive notifications on your mobile device"
            enabled={settings.mobile.pushNotifications}
            onToggle={() => handleMobileToggle('pushNotifications')}
          />
          
          <NotificationToggle
            label="SMS Alerts"
            description="Get critical alerts via text message"
            enabled={settings.mobile.smsAlerts}
            onToggle={() => handleMobileToggle('smsAlerts')}
          />
          
          <div className="border-t border-secondary-700 pt-4">
            <NotificationToggle
              label="Quiet Hours"
              description="Pause notifications during specified hours"
              enabled={settings.mobile.quietHours.enabled}
              onToggle={handleQuietHoursToggle}
            />
            
            {settings.mobile.quietHours.enabled && (
              <div className="mt-4 ml-6 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">Start Time</label>
                  <input
                    type="time"
                    value={settings.mobile.quietHours.start}
                    onChange={(e) => {
                      setSettings(prev => ({
                        ...prev,
                        mobile: {
                          ...prev.mobile,
                          quietHours: {
                            ...prev.mobile.quietHours,
                            start: e.target.value
                          }
                        }
                      }));
                      onChanges(true);
                    }}
                    className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">End Time</label>
                  <input
                    type="time"
                    value={settings.mobile.quietHours.end}
                    onChange={(e) => {
                      setSettings(prev => ({
                        ...prev,
                        mobile: {
                          ...prev.mobile,
                          quietHours: {
                            ...prev.mobile.quietHours,
                            end: e.target.value
                          }
                        }
                      }));
                      onChanges(true);
                    }}
                    className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Channel Preferences */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <Settings className="w-6 h-6 text-primary-600" />
          <h3 className="text-xl font-semibold text-white">Channel Preferences</h3>
        </div>

        <div className="space-y-6">
          {Object.entries(settings.channelPreferences).map(([notificationType, channels]) => (
            <div key={notificationType} className="border-b border-secondary-700 pb-4 last:border-b-0">
              <h4 className="font-medium text-white mb-3 capitalize">{notificationType.replace(/([A-Z])/g, ' $1').trim()}</h4>
              <div className="flex flex-wrap gap-3">
                {['email', 'inApp', 'mobile', 'sms'].map(channel => (
                  <button
                    key={channel}
                    onClick={() => handleChannelToggle(notificationType, channel)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      channels.includes(channel)
                        ? 'bg-primary-600 text-white'
                        : 'bg-secondary-700 text-secondary-300 hover:bg-secondary-600'
                    }`}
                  >
                    {channel === 'inApp' ? 'In-App' : channel.charAt(0).toUpperCase() + channel.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Notification Schedule */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <Clock className="w-6 h-6 text-primary-600" />
          <h3 className="text-xl font-semibold text-white">Notification Schedule</h3>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">Working Hours Start</label>
              <input
                type="time"
                value={settings.schedule.workingHours.start}
                onChange={(e) => handleScheduleChange('workingHours', { ...settings.schedule.workingHours, start: e.target.value })}
                className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">Working Hours End</label>
              <input
                type="time"
                value={settings.schedule.workingHours.end}
                onChange={(e) => handleScheduleChange('workingHours', { ...settings.schedule.workingHours, end: e.target.value })}
                className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">Timezone</label>
            <Dropdown
              options={[
                { value: 'UTC-8', label: 'Pacific Time (UTC-8)' },
                { value: 'UTC-7', label: 'Mountain Time (UTC-7)' },
                { value: 'UTC-6', label: 'Central Time (UTC-6)' },
                { value: 'UTC-5', label: 'Eastern Time (UTC-5)' },
                { value: 'UTC+0', label: 'UTC' },
                { value: 'UTC+1', label: 'Central European Time (UTC+1)' },
                { value: 'UTC+5:30', label: 'India Standard Time (UTC+5:30)' },
                { value: 'UTC+8', label: 'China Standard Time (UTC+8)' }
              ]}
              value={settings.schedule.timezone}
              onChange={val => handleScheduleChange('timezone', val)}
              className="w-full"
            />
          </div>

          <NotificationToggle
            label="Weekend Notifications"
            description="Receive notifications on weekends"
            enabled={settings.schedule.weekendNotifications}
            onToggle={() => handleScheduleChange('weekendNotifications', !settings.schedule.weekendNotifications)}
          />
        </div>
      </Card>
    </div>
  );
};

export default NotificationSettings;