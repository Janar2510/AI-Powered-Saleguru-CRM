import React, { useState } from 'react';
import { Bell, Mail, Smartphone, Clock, AlertTriangle } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

interface NotificationSettingsProps {
  onChanges: (hasChanges: boolean) => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onChanges }) => {
  const [settings, setSettings] = useState({
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
    smartAlerts: {
      enabled: true,
      dealStuckDays: 14,
      taskOverdueDays: 1,
      followUpReminder: 7,
      pipelineReview: 30
    }
  });

  const handleToggle = (category: string, setting: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: !prev[category as keyof typeof prev][setting as keyof typeof prev[typeof category]]
      }
    }));
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
    <div className="flex items-center justify-between p-4 bg-secondary-700 rounded-lg">
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <h4 className="font-medium text-white">{label}</h4>
          {badge && <Badge variant="success" size="sm">{badge}</Badge>}
        </div>
        <p className="text-sm text-secondary-400 mt-1">{description}</p>
      </div>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-primary-600' : 'bg-secondary-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
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
          <AlertTriangle className="w-6 h-6 text-primary-600" />
          <h3 className="text-xl font-semibold text-white">Smart Alerts</h3>
          <Badge variant="success" size="sm">AI-Powered</Badge>
        </div>

        <div className="space-y-6">
          <NotificationToggle
            label="Enable Smart Alerts"
            description="AI-powered notifications based on your activity patterns"
            enabled={settings.smartAlerts.enabled}
            onToggle={() => handleToggle('smartAlerts', 'enabled')}
            badge="New"
          />

          {settings.smartAlerts.enabled && (
            <div className="space-y-4 pl-4 border-l-2 border-primary-600">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Deal Stuck Alert (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={settings.smartAlerts.dealStuckDays}
                    onChange={(e) => handleSmartAlertChange('dealStuckDays', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                  <p className="text-xs text-secondary-500 mt-1">
                    Alert when deals haven't been updated for this many days
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Task Overdue Alert (days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={settings.smartAlerts.taskOverdueDays}
                    onChange={(e) => handleSmartAlertChange('taskOverdueDays', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                  <p className="text-xs text-secondary-500 mt-1">
                    Alert when tasks are overdue by this many days
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Follow-up Reminder (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={settings.smartAlerts.followUpReminder}
                    onChange={(e) => handleSmartAlertChange('followUpReminder', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                  <p className="text-xs text-secondary-500 mt-1">
                    Remind to follow up after this many days of no contact
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Pipeline Review (days)
                  </label>
                  <input
                    type="number"
                    min="7"
                    max="90"
                    value={settings.smartAlerts.pipelineReview}
                    onChange={(e) => handleSmartAlertChange('pipelineReview', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                  <p className="text-xs text-secondary-500 mt-1">
                    Suggest pipeline review every this many days
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Notification Schedule */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <Clock className="w-6 h-6 text-primary-600" />
          <h3 className="text-xl font-semibold text-white">Notification Schedule</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Quiet Hours Start
            </label>
            <input
              type="time"
              defaultValue="22:00"
              className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Quiet Hours End
            </label>
            <input
              type="time"
              defaultValue="08:00"
              className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
        </div>

        <div className="mt-4 p-4 bg-secondary-700 rounded-lg">
          <p className="text-sm text-secondary-300">
            During quiet hours, you'll only receive critical notifications. All other notifications will be delivered when quiet hours end.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default NotificationSettings;