import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { ScrollArea } from '../ui/ScrollArea';
import { Badge } from '../ui/Badge';
import {
  LayoutDashboard,
  KanbanSquare,
  UserRound,
  Building2,
  ListTodo,
  CalendarDays,
  Zap,
  Mail,
  FileText,
  LineChart,
  Store,
  Settings,
  Sparkles,
  Boxes,
  Quote,
  Receipt,
  Package,
  Mic,
  Trophy,
  MessageCircle,
  Calculator,
  ShoppingCart,
  ExternalLink,
  Home,
} from 'lucide-react';

// Simple persisted collapse hook
function usePersistedBoolean(key: string, initial = false) {
  const [val, setVal] = React.useState<boolean>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? raw === '1' : initial;
    } catch (error) {
      console.error('🔄 usePersistedBoolean localStorage error:', error);
      return initial;
    }
  });
  
  React.useEffect(() => {
    try {
      localStorage.setItem(key, val ? '1' : '0');
    } catch (error) {
      console.error('🔄 usePersistedBoolean localStorage save error:', error);
    }
  }, [key, val]);
  
  return [val, setVal] as const;
}

type SectionItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeKey?: string;
};

type Section = {
  title: string;
  key: string;
  items: SectionItem[];
};

const sections: Section[] = [
  {
    title: 'Core',
    key: 'core',
    items: [
      { to: '/home', label: 'Home', icon: Home },
      { to: '/', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/deals', label: 'Deals', icon: KanbanSquare },
      { to: '/leads', label: 'Leads', icon: Sparkles },
      { to: '/contacts', label: 'Contacts', icon: UserRound },
      { to: '/organizations', label: 'Organizations', icon: Building2 },
    ],
  },
  {
    title: 'Work',
    key: 'work',
    items: [
      { to: '/tasks', label: 'Tasks', icon: ListTodo, badgeKey: 'overdueTasks' },
      { to: '/calendar', label: 'Calendar', icon: CalendarDays },
      { to: '/automations', label: 'Automation', icon: Zap },
      { to: '/emails', label: 'Emails', icon: Mail },
      { to: '/email-templates', label: 'Email Templates', icon: FileText },
    ],
  },
  {
    title: 'Intelligence',
    key: 'intel',
    items: [
      { to: '/guru', label: 'Guru', icon: Sparkles },
      { to: '/lead-scoring', label: 'Lead Scoring', icon: LineChart },
      { to: '/intelligence', label: 'Call Intelligence', icon: Mic },
      { to: '/gamification', label: 'Gamification', icon: Trophy },
                { to: '/social-crm', label: 'AI Social Mentions', icon: MessageCircle },
      { to: '/analytics', label: 'Analytics', icon: LineChart },
    ],
  },
  {
    title: 'Commerce',
    key: 'commerce',
    items: [
      { to: '/products', label: 'Products', icon: Package },
      { to: '/accounting', label: 'Accounting', icon: Calculator },
      { to: '/quotes', label: 'Quotes', icon: Quote },
      { to: '/sales-orders', label: 'Sales Orders', icon: ShoppingCart },
      { to: '/portal', label: 'Customer Portal', icon: ExternalLink },
      { to: '/invoices', label: 'Invoices', icon: Receipt },
      { to: '/subscriptions', label: 'Subscriptions', icon: Boxes },
    ],
  },
  {
    title: 'Assets',
    key: 'assets',
    items: [
      { to: '/documents', label: 'Documents', icon: FileText },
    ],
  },
  {
    title: 'System',
    key: 'system',
    items: [
      { to: '/marketplace', label: 'Marketplace', icon: Store },
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export default function Sidebar() {
  console.log('🔄 Redesigned Collapsible Sidebar rendering...');
  
  try {
    const location = useLocation();
    const [collapsed, setCollapsed] = usePersistedBoolean('sidebar:collapsed', false);
    const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>(() => {
      try {
        const saved = localStorage.getItem('sidebar:groups');
        return saved ? JSON.parse(saved) : {};
      } catch (error) {
        console.error('🔄 Sidebar openGroups localStorage error:', error);
        return {};
      }
    });

    React.useEffect(() => {
      try {
        localStorage.setItem('sidebar:groups', JSON.stringify(openGroups));
      } catch (error) {
        console.error('🔄 Sidebar openGroups localStorage save error:', error);
      }
    }, [openGroups]);

    const toggleGroup = (k: string) =>
      setOpenGroups((s) => ({ ...s, [k]: !s[k] }));

    return (
      <aside 
        className={cn(
          'h-screen border-r border-[#374151] bg-gradient-to-b from-[#0f0f23]/95 to-[#1a1a2e]/95 backdrop-blur-md min-w-0 z-50 relative shadow-2xl transition-all duration-300 ease-in-out',
          collapsed ? 'w-20' : 'w-64'
        )}
        style={{ position: 'sticky', top: 0, zIndex: 9999 }}
      >
        {/* Transparent Header with SaleToru Logo */}
        <div className="relative p-4 bg-transparent">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              className="text-xl font-bold text-white hover:bg-white/10 transition-all duration-300 transform hover:scale-105 p-2" 
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <div className="w-8 h-8 bg-gradient-to-r from-[#6366f1] to-[#06b6d4] rounded-lg flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#6366f1] to-[#06b6d4] rounded-xl flex items-center justify-center">
                    <img 
                      src="/saletoru-logo.png" 
                      alt="SaleToru" 
                      className="h-8 w-auto"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <span className="text-white font-bold text-lg">SaleToru</span>
                </div>
              )}
            </Button>
          </div>
        </div>

        {/* Navigation Content with Sticky Scrolling */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(100vh-5rem)] px-3 py-2">
            <div className="space-y-2">
              {sections.map((section) => {
                const isOpen = openGroups[section.key] ?? true;
                return (
                  <div key={section.key} className="mb-3">
                    <button
                      onClick={() => toggleGroup(section.key)}
                      className={cn(
                        'w-full text-left text-xs uppercase tracking-wide px-3 py-2 text-gray-300 hover:text-white transition-all duration-300 font-semibold',
                        'hover:bg-[#6366f1]/20 rounded-lg hover:shadow-lg'
                      )}
                    >
                      {section.title}
                    </button>
                    {isOpen && (
                      <nav className="mt-2 space-y-1">
                        {section.items.map((item) => (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                              cn(
                                'flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all duration-300 text-gray-300 hover:text-white group',
                                'hover:bg-gradient-to-r hover:from-[#6366f1]/20 hover:to-[#06b6d4]/20',
                                'hover:shadow-lg hover:shadow-[#6366f1]/20',
                                'transform hover:scale-105 hover:translate-x-1',
                                isActive || location.pathname === item.to 
                                  ? 'bg-gradient-to-r from-[#6366f1]/30 to-[#06b6d4]/30 text-white shadow-lg shadow-[#6366f1]/30' 
                                  : ''
                              )
                            }
                          >
                            <div className={cn(
                              'p-2 rounded-lg transition-all duration-300',
                              'group-hover:bg-white/20 group-hover:scale-110',
                              location.pathname === item.to ? 'bg-white/30 scale-110' : 'bg-gray-700/50'
                            )}>
                              <item.icon className="h-4 w-4 min-w-4" />
                            </div>
                            {!collapsed && (
                              <span className="flex-1 truncate font-medium">
                                {item.label}
                              </span>
                            )}
                            {/* Badge with brand colors */}
                            {!collapsed && item.badgeKey && (
                              <Badge 
                                variant="secondary" 
                                className="bg-gradient-to-r from-[#6366f1] to-[#06b6d4] text-white text-xs px-2 py-1"
                              >
                                •
                              </Badge>
                            )}
                          </NavLink>
                        ))}
                      </nav>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Bottom Brand Section */}
        {!collapsed && (
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="bg-gradient-to-r from-[#6366f1]/20 to-[#06b6d4]/20 rounded-xl p-3 border border-[#6366f1]/30 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-[#6366f1] to-[#06b6d4] rounded-lg flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="text-xs">
                  <p className="text-white font-semibold">SaleToru CRM</p>
                  <p className="text-gray-400">Powered by AI</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    );
  } catch (error) {
    console.error('🔄 Redesigned Sidebar error:', error);
    return (
      <div style={{ 
        width: '256px', 
        backgroundColor: '#ef4444', 
        color: 'white', 
        padding: '20px',
        height: '100vh',
        border: '2px solid #ef4444'
      }}>
        <h3>Redesigned Sidebar Error</h3>
        <p>Error: {String(error)}</p>
      </div>
    );
  }
}