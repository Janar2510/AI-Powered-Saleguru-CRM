import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Handshake, Users, CheckSquare, Calendar, BarChart3, Target, FileText, ChevronLeft, Settings, Mail, BookTemplate as FileTemplate, UserPlus, Zap, Building } from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navigationItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/deals', icon: Handshake, label: 'Deals', badge: '8' },
  { path: '/leads', icon: UserPlus, label: 'Leads', badge: 'New' },
  { path: '/contacts', icon: Users, label: 'Contacts' },
  { path: '/companies', icon: Building, label: 'Companies' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks', badge: 'New' },
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
  { path: '/emails', icon: Mail, label: 'Emails', badge: '3' },
  { path: '/email-templates', icon: FileTemplate, label: 'Email Templates' },
  { path: '/automation', icon: Zap, label: 'Automation', badge: 'New' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/lead-scoring', icon: Target, label: 'Lead Scoring', badge: 'New' },
  { path: '/offers', icon: FileText, label: 'Offers' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  return (
    <div className={clsx(
      'bg-secondary-800/80 backdrop-blur-xl border-r border-secondary-700/30 transition-all duration-300 flex flex-col h-full shadow-xl',
      isOpen ? 'w-64' : 'w-16'
    )}>
      {/* Header */}
      <div className="p-4 border-b border-secondary-700/30">
        <div className="flex items-center justify-between">
          {isOpen && (
            <div className="flex items-center space-x-3">
              <img 
                src="https://i.imgur.com/Zylpdjy.png" 
                alt="SaleToru Logo" 
                className="w-8 h-8 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-white">SaleToru</h1>
                <p className="text-xs text-secondary-400">CRM</p>
              </div>
            </div>
          )}
          {!isOpen && (
            <div className="flex justify-center w-full">
              <img 
                src="https://i.imgur.com/Zylpdjy.png" 
                alt="SaleToru Logo" 
                className="w-6 h-6 object-contain"
              />
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-secondary-700 text-secondary-400 hover:text-white transition-colors touch-target"
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <ChevronLeft className={clsx('w-5 h-5 transition-transform', !isOpen && 'rotate-180')} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors group touch-target',
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-secondary-300 hover:bg-secondary-700/70 hover:text-white'
              )
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {isOpen && (
              <>
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <span className={clsx(
                    'ml-auto px-2 py-0.5 text-xs rounded-full',
                    item.badge === 'New' 
                      ? 'bg-accent-500 text-white'
                      : 'bg-secondary-600 text-secondary-300'
                  )}>
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-secondary-700/30">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            clsx(
              'flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors touch-target',
              isActive
                ? 'bg-primary-600 text-white'
                : 'text-secondary-300 hover:bg-secondary-700/70 hover:text-white'
            )
          }
        >
          <Settings className="w-5 h-5" />
          {isOpen && <span className="font-medium">Settings</span>}
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;