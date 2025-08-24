import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Bell, AlertTriangle, User, Bot, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';

const mockNotifications = [
  {
    id: 1,
    type: 'guru',
    priority: 'very_high',
    title: 'AI Lead Scoring Alert',
    message: 'Contact John Smith is now a top priority lead!',
    sender: 'SaleToruGuru',
    time: '2m ago',
    read: false
  },
  {
    id: 2,
    type: 'team',
    priority: 'high',
    title: 'Deal Won!',
    message: 'Sarah Wilson closed a $45,000 deal with StartupXYZ.',
    sender: 'Sarah Wilson',
    time: '10m ago',
    read: false
  },
  {
    id: 3,
    type: 'team',
    priority: 'normal',
    title: 'Task Reminder',
    message: 'Follow up with TechCorp Inc. today.',
    sender: 'TaskBot',
    time: '1h ago',
    read: true
  },
  {
    id: 4,
    type: 'guru',
    priority: 'high',
    title: 'Pipeline Review',
    message: '3 deals have been stuck in Proposal stage for 10+ days.',
    sender: 'SaleToruGuru',
    time: '30m ago',
    read: false
  }
];

const priorityTabs = [
  { label: 'All', value: 'all' },
  { label: 'Very High', value: 'very_high' },
  { label: 'High', value: 'high' },
  { label: 'Normal', value: 'normal' }
];

interface NotificationCardProps {
  loading?: boolean;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ loading }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState(mockNotifications);
  const navigate = useNavigate();

  const filtered = activeTab === 'all'
    ? notifications
    : notifications.filter(n => n.priority === activeTab);

  const handleMarkRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-[#23233a]/50 rounded w-1/3"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-[#23233a]/50 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-[#a259ff]" />
          <h3 className="text-lg font-semibold text-white">Notifications</h3>
        </div>
        <div className="flex space-x-1">
          {priorityTabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${activeTab === tab.value ? 'bg-[#a259ff] text-white' : 'bg-[#23233a]/50 text-[#b0b0d0]'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3 max-h-64 overflow-y-auto flex-1">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-[#b0b0d0]">
            <AlertTriangle className="w-8 h-8 mb-2" />
            <span>No notifications in this category.</span>
          </div>
        )}
        {filtered.map(n => (
          <div key={n.id} className={`flex items-start space-x-3 p-3 rounded-lg ${n.read ? 'bg-[#23233a]/30' : 'bg-[#a259ff]/20 border-l-4 border-[#a259ff] animate-pulse'}`}>
            <div className="pt-1">
              {n.type === 'guru' ? <Bot className="w-5 h-5 text-[#a259ff]" /> : <User className="w-5 h-5 text-[#b0b0d0]" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-white text-sm">{n.title}</span>
                <Badge variant={n.priority === 'very_high' ? 'danger' : n.priority === 'high' ? 'warning' : 'secondary'} size="sm">
                  {n.priority.replace('_', ' ').toUpperCase()}
                </Badge>
                {n.type === 'guru' && <Badge variant="success" size="sm">Guru</Badge>}
              </div>
              <div className="text-[#b0b0d0] text-xs mt-1">{n.message}</div>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-[#b0b0d0] text-xs">{n.sender}</span>
                <span className="text-[#b0b0d0] text-xs">• {n.time}</span>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-1">
              {!n.read && (
                <Button
                  onClick={() => handleMarkRead(n.id)}
                  variant="secondary"
                  size="sm"
                  icon={CheckCircle}
                  className="text-xs"
                >
                  Read
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                icon={ArrowRight}
                className="text-xs"
                onClick={() => {
                  if (n.type === 'guru') navigate('/lead-scoring');
                  else if (n.title.toLowerCase().includes('deal')) navigate('/deals');
                  else if (n.title.toLowerCase().includes('task')) navigate('/tasks');
                  else navigate('/dashboard');
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-4">
        <Button
          onClick={() => navigate('/notifications')}
          variant="gradient"
          size="sm"
        >
          View All
        </Button>
      </div>
    </div>
  );
};

export default NotificationCard; 