import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, DollarSign, Users, CheckSquare, Calendar, BarChart3, Target, FileText, ChevronLeft, Settings, Mail, BookTemplate as FileTemplate, UserPlus, Zap, Building, Store, Package, PhoneCall, MessageSquare, KanbanSquare, Receipt, CreditCard, Heart, Calculator, Warehouse, FileType, UserCheck, PenTool, ShoppingCart, FileText as QuoteIcon, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navigationItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/deals', icon: DollarSign, label: 'Deals', badge: '8' },
  { path: '/leads', icon: UserPlus, label: 'Leads', badge: 'New' },
  { path: '/contacts', icon: Users, label: 'Contacts' },
  { path: '/companies', icon: Building, label: 'Companies' },
  { path: '/accounting', icon: Calculator, label: 'Accounting', badge: 'New' },
  { path: '/warehouse', icon: Warehouse, label: 'Warehouse', badge: 'New' },
  { path: '/payments', icon: CreditCard, label: 'Payments', badge: 'New' },
  { path: '/document-templates', icon: FileType, label: 'Document Templates', badge: 'New' },
  { path: '/customer-portal', icon: UserCheck, label: 'Customer Portal', badge: 'New' },
                { path: '/esignature', icon: PenTool, label: 'eSignature', badge: 'New' },
              { path: '/sales-orders', icon: ShoppingCart, label: 'Sales Orders', badge: 'New' },
              { path: '/quotation-builder', icon: QuoteIcon, label: 'Quotation Builder', badge: 'New' },
  { path: '/test', icon: AlertTriangle, label: 'Test Page', badge: 'Test' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks', badge: 'New' },
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
  { path: '/emails', icon: Mail, label: 'Emails', badge: '3' },
  { path: '/email-templates', icon: FileTemplate, label: 'Email Templates' },
  { path: '/calls', icon: PhoneCall, label: 'Calls', badge: 'New' },
  { path: '/social-mentions', icon: MessageSquare, label: 'Social Mentions', badge: 'New' },
  { path: '/automation', icon: Zap, label: 'Automation', badge: 'New' },
  // Pulse link below Automation
  { path: '/pulse', icon: Heart, label: 'Pulse', badge: 'New' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/lead-scoring', icon: Target, label: 'Lead Scoring', badge: 'New' },
  { path: '/marketplace', icon: Store, label: 'Marketplace', badge: 'New' },
  { path: '/projects', icon: KanbanSquare, label: 'Projects', badge: 'New' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  return (
    <div className={clsx(
      'bg-[#23233a]/40 backdrop-blur-sm border-r border-[#23233a]/50 transition-all duration-300 flex flex-col h-full shadow-xl overflow-hidden',
      isOpen ? 'w-72' : 'w-16'
    )}>
      {/* Header */}
      <div className="p-4 border-b border-[#23233a]/30">
        <div className="flex items-center justify-between">
          {isOpen && (
            <div className="flex items-center gap-3">
              <img 
                src="/saletoru-logo.png" 
                alt="SaleToru Logo" 
                className="w-8 h-8 rounded-lg"
              />
              <span className="text-xl font-bold text-white">SaleToru</span>
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
            className="p-1.5 rounded-lg hover:bg-[#23233a]/50 text-[#b0b0d0] hover:text-white transition-colors touch-target"
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <ChevronLeft className={clsx('w-5 h-5 transition-transform', !isOpen && 'rotate-180')} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'flex items-center space-x-3 px-2 py-2 rounded-lg transition-colors group touch-target',
                isActive
                  ? 'bg-[#a259ff] text-white'
                  : 'text-[#b0b0d0] hover:bg-[#23233a]/50 hover:text-white'
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
                      ? 'bg-[#43e7ad] text-white'
                      : 'bg-[#23233a]/50 text-[#b0b0d0]'
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
      <div className="p-2 border-t border-[#23233a]/30">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            clsx(
              'flex items-center space-x-3 px-2 py-2 rounded-lg transition-colors touch-target',
              isActive
                ? 'bg-[#a259ff] text-white'
                : 'text-[#b0b0d0] hover:bg-[#23233a]/50 hover:text-white'
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