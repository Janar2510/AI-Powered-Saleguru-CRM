import React, { useState, useEffect } from 'react';
import {
  Zap,
  Play,
  Pause,
  Settings,
  Plus,
  X,
  Clock,
  MessageSquare,
  Target,
  Users,
  Calendar,
  Mail,
  Bot,
  Sparkles,
  ArrowRight,
  Check,
  AlertTriangle,
  Info,
  Edit,
  Trash2,
  Copy,
  Eye,
  BarChart3,
  TrendingUp,
  Activity,
  Timer,
  Repeat,
  Send,
  Flag,
  Star,
  Tag,
  Filter,
  Search,
  RefreshCw,
  Download,
  Upload,
  Building,
  User,
  Phone,
  CheckCircle,
  XCircle,
  Circle
} from 'lucide-react';
import {
  BrandCard,
  BrandButton,
  BrandBadge,
  BrandInput
} from '../../contexts/BrandDesignContext';

interface EmailAutomation {
  id: string;
  name: string;
  description: string;
  type: 'sequence' | 'trigger' | 'scheduled' | 'follow_up' | 'nurture' | 'reminder';
  status: 'active' | 'paused' | 'draft' | 'completed';
  trigger: {
    type: 'email_sent' | 'email_opened' | 'link_clicked' | 'form_submitted' | 'deal_stage_change' | 'date_based' | 'manual';
    conditions: Record<string, any>;
  };
  actions: Array<{
    type: 'send_email' | 'update_deal' | 'create_task' | 'notify_team' | 'wait' | 'conditional';
    delay?: string;
    template?: string;
    conditions?: Record<string, any>;
  }>;
  settings: {
    timezone: string;
    businessHoursOnly: boolean;
    maxEmails: number;
    unsubscribeLink: boolean;
    trackOpens: boolean;
    trackClicks: boolean;
  };
  analytics: {
    totalSent: number;
    opened: number;
    clicked: number;
    replied: number;
    converted: number;
    unsubscribed: number;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastRun?: string;
  nextRun?: string;
}

interface EmailAutomationSystemProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateAutomation: (automation: Partial<EmailAutomation>) => void;
  selectedDealId?: string;
  selectedContactId?: string;
}

const EmailAutomationSystem: React.FC<EmailAutomationSystemProps> = ({
  isOpen,
  onClose,
  onCreateAutomation,
  selectedDealId,
  selectedContactId
}) => {
  const [automations, setAutomations] = useState<EmailAutomation[]>([]);
  const [selectedAutomation, setSelectedAutomation] = useState<EmailAutomation | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock automation data
  const mockAutomations: EmailAutomation[] = [
    {
      id: '1',
      name: 'Welcome Email Series',
      description: 'Send a series of welcome emails to new customers over 7 days',
      type: 'sequence',
      status: 'active',
      trigger: {
        type: 'deal_stage_change',
        conditions: { stage: 'closed_won' }
      },
      actions: [
        { type: 'send_email', template: 'welcome_1', delay: '0' },
        { type: 'wait', delay: '2d' },
        { type: 'send_email', template: 'welcome_2', delay: '0' },
        { type: 'wait', delay: '3d' },
        { type: 'send_email', template: 'welcome_3', delay: '0' },
        { type: 'create_task', delay: '7d' }
      ],
      settings: {
        timezone: 'UTC',
        businessHoursOnly: true,
        maxEmails: 5,
        unsubscribeLink: true,
        trackOpens: true,
        trackClicks: true
      },
      analytics: {
        totalSent: 156,
        opened: 124,
        clicked: 89,
        replied: 23,
        converted: 12,
        unsubscribed: 3
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
      createdBy: 'John Doe',
      lastRun: '2024-01-20T08:00:00Z',
      nextRun: '2024-01-21T09:00:00Z'
    },
    {
      id: '2',
      name: 'Demo Follow-up Sequence',
      description: 'Automated follow-up sequence after product demos',
      type: 'follow_up',
      status: 'active',
      trigger: {
        type: 'email_sent',
        conditions: { template: 'demo_scheduled' }
      },
      actions: [
        { type: 'wait', delay: '1d' },
        { type: 'send_email', template: 'demo_reminder', delay: '0' },
        { type: 'wait', delay: '1h' },
        { type: 'send_email', template: 'demo_followup', delay: '0' },
        { type: 'wait', delay: '3d' },
        { type: 'conditional', conditions: { no_response: true } },
        { type: 'send_email', template: 'demo_check_in', delay: '0' }
      ],
      settings: {
        timezone: 'UTC',
        businessHoursOnly: true,
        maxEmails: 3,
        unsubscribeLink: true,
        trackOpens: true,
        trackClicks: true
      },
      analytics: {
        totalSent: 89,
        opened: 67,
        clicked: 34,
        replied: 15,
        converted: 8,
        unsubscribed: 1
      },
      createdAt: '2023-12-15T00:00:00Z',
      updatedAt: '2024-01-10T00:00:00Z',
      createdBy: 'Sarah Johnson',
      lastRun: '2024-01-19T10:30:00Z',
      nextRun: '2024-01-21T14:00:00Z'
    },
    {
      id: '3',
      name: 'Lead Nurturing Campaign',
      description: 'Weekly nurturing emails for qualified leads',
      type: 'nurture',
      status: 'active',
      trigger: {
        type: 'form_submitted',
        conditions: { form: 'lead_qualification' }
      },
      actions: [
        { type: 'send_email', template: 'nurture_week_1', delay: '0' },
        { type: 'wait', delay: '7d' },
        { type: 'send_email', template: 'nurture_week_2', delay: '0' },
        { type: 'wait', delay: '7d' },
        { type: 'send_email', template: 'nurture_week_3', delay: '0' },
        { type: 'wait', delay: '7d' },
        { type: 'send_email', template: 'nurture_check_in', delay: '0' }
      ],
      settings: {
        timezone: 'UTC',
        businessHoursOnly: true,
        maxEmails: 10,
        unsubscribeLink: true,
        trackOpens: true,
        trackClicks: true
      },
      analytics: {
        totalSent: 234,
        opened: 187,
        clicked: 123,
        replied: 45,
        converted: 18,
        unsubscribed: 7
      },
      createdAt: '2023-11-01T00:00:00Z',
      updatedAt: '2024-01-12T00:00:00Z',
      createdBy: 'Mike Wilson',
      lastRun: '2024-01-20T09:15:00Z',
      nextRun: '2024-01-22T09:15:00Z'
    },
    {
      id: '4',
      name: 'Meeting Reminder System',
      description: 'Automatic reminders for upcoming meetings',
      type: 'reminder',
      status: 'active',
      trigger: {
        type: 'date_based',
        conditions: { event_type: 'meeting', reminder_time: '24h_before' }
      },
      actions: [
        { type: 'send_email', template: 'meeting_reminder_24h', delay: '0' },
        { type: 'wait', delay: '23h' },
        { type: 'send_email', template: 'meeting_reminder_1h', delay: '0' }
      ],
      settings: {
        timezone: 'UTC',
        businessHoursOnly: false,
        maxEmails: 2,
        unsubscribeLink: false,
        trackOpens: true,
        trackClicks: false
      },
      analytics: {
        totalSent: 145,
        opened: 134,
        clicked: 89,
        replied: 12,
        converted: 0,
        unsubscribed: 0
      },
      createdAt: '2024-01-05T00:00:00Z',
      updatedAt: '2024-01-18T00:00:00Z',
      createdBy: 'Lisa Chen',
      lastRun: '2024-01-20T10:00:00Z',
      nextRun: '2024-01-21T10:00:00Z'
    },
    {
      id: '5',
      name: 'Abandoned Cart Recovery',
      description: 'Re-engage prospects who viewed pricing but didn\'t purchase',
      type: 'trigger',
      status: 'paused',
      trigger: {
        type: 'link_clicked',
        conditions: { url_contains: 'pricing', no_purchase: '48h' }
      },
      actions: [
        { type: 'wait', delay: '2d' },
        { type: 'send_email', template: 'pricing_followup', delay: '0' },
        { type: 'wait', delay: '3d' },
        { type: 'send_email', template: 'limited_offer', delay: '0' },
        { type: 'wait', delay: '7d' },
        { type: 'send_email', template: 'final_reminder', delay: '0' }
      ],
      settings: {
        timezone: 'UTC',
        businessHoursOnly: true,
        maxEmails: 3,
        unsubscribeLink: true,
        trackOpens: true,
        trackClicks: true
      },
      analytics: {
        totalSent: 67,
        opened: 45,
        clicked: 23,
        replied: 8,
        converted: 5,
        unsubscribed: 2
      },
      createdAt: '2024-01-08T00:00:00Z',
      updatedAt: '2024-01-16T00:00:00Z',
      createdBy: 'David Rodriguez',
      lastRun: '2024-01-18T15:30:00Z'
    }
  ];

  useEffect(() => {
    if (isOpen) {
      setAutomations(mockAutomations);
    }
  }, [isOpen]);

  const filteredAutomations = automations.filter(automation => {
    if (searchTerm && !automation.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !automation.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (filterType !== 'all' && automation.type !== filterType) {
      return false;
    }
    if (filterStatus !== 'all' && automation.status !== filterStatus) {
      return false;
    }
    return true;
  });

  const getAutomationTypeColor = (type: EmailAutomation['type']) => {
    switch (type) {
      case 'sequence': return 'purple';
      case 'trigger': return 'blue';
      case 'scheduled': return 'green';
      case 'follow_up': return 'orange';
      case 'nurture': return 'yellow';
      case 'reminder': return 'red';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: EmailAutomation['status']) => {
    switch (status) {
      case 'active': return 'green';
      case 'paused': return 'yellow';
      case 'draft': return 'secondary';
      case 'completed': return 'blue';
      default: return 'secondary';
    }
  };

  const toggleAutomationStatus = (automationId: string) => {
    setAutomations(prev => prev.map(automation =>
      automation.id === automationId
        ? { ...automation, status: automation.status === 'active' ? 'paused' : 'active' }
        : automation
    ));
  };

  const deleteAutomation = (automationId: string) => {
    setAutomations(prev => prev.filter(automation => automation.id !== automationId));
  };

  const AutomationCard = ({ automation }: { automation: EmailAutomation }) => (
    <BrandCard className="p-4 sm:p-6" borderGradient={getAutomationTypeColor(automation.type) as any}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between space-y-3 sm:space-y-0">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="text-base sm:text-lg font-semibold text-white">{automation.name}</h3>
              <BrandBadge variant={getStatusColor(automation.status) as any} size="sm">
                {automation.status}
              </BrandBadge>
              <BrandBadge variant={getAutomationTypeColor(automation.type) as any} size="sm">
                {automation.type}
              </BrandBadge>
            </div>
            <p className="text-white/70 text-xs sm:text-sm mb-3 line-clamp-2">{automation.description}</p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
              <div className="bg-white/5 rounded-lg p-2">
                <p className="text-lg sm:text-2xl font-bold text-white">{automation.analytics.totalSent}</p>
                <p className="text-white/60 text-xs">Sent</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <p className="text-lg sm:text-2xl font-bold text-green-400">
                  {Math.round((automation.analytics.opened / automation.analytics.totalSent) * 100)}%
                </p>
                <p className="text-white/60 text-xs">Open Rate</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <p className="text-lg sm:text-2xl font-bold text-blue-400">
                  {Math.round((automation.analytics.converted / automation.analytics.totalSent) * 100)}%
                </p>
                <p className="text-white/60 text-xs">Convert Rate</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 self-end sm:self-start">
            <BrandButton
              variant={automation.status === 'active' ? 'yellow' : 'green'}
              size="sm"
              onClick={() => toggleAutomationStatus(automation.id)}
            >
              {automation.status === 'active' ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span className="hidden sm:inline ml-2">Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span className="hidden sm:inline ml-2">Start</span>
                </>
              )}
            </BrandButton>
            
            <BrandButton
              variant="secondary"
              size="sm"
              onClick={() => setSelectedAutomation(automation)}
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">View</span>
            </BrandButton>
          </div>
        </div>

        {/* Timeline Preview */}
        <div className="bg-white/5 rounded-lg p-4">
          <h4 className="text-white/80 font-medium mb-3">Automation Flow</h4>
          <div className="flex items-center space-x-2 overflow-x-auto">
            {automation.actions.slice(0, 4).map((action, index) => (
              <React.Fragment key={index}>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <div className={`p-2 rounded-lg bg-${getAutomationTypeColor(automation.type)}-500/20`}>
                    {action.type === 'send_email' && <Mail className="w-4 h-4 text-white/80" />}
                    {action.type === 'wait' && <Clock className="w-4 h-4 text-white/80" />}
                    {action.type === 'create_task' && <CheckCircle className="w-4 h-4 text-white/80" />}
                    {action.type === 'conditional' && <Target className="w-4 h-4 text-white/80" />}
                  </div>
                  <span className="text-white/70 text-xs">
                    {action.type === 'send_email' && 'Email'}
                    {action.type === 'wait' && `Wait ${action.delay}`}
                    {action.type === 'create_task' && 'Task'}
                    {action.type === 'conditional' && 'Check'}
                  </span>
                </div>
                {index < automation.actions.slice(0, 4).length - 1 && (
                  <ArrowRight className="w-3 h-3 text-white/40 flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
            {automation.actions.length > 4 && (
              <span className="text-white/60 text-xs flex-shrink-0">+{automation.actions.length - 4} more</span>
            )}
          </div>
        </div>

        {/* Timing Info */}
        <div className="flex items-center justify-between text-sm text-white/60">
          <div className="flex items-center space-x-4">
            {automation.lastRun && (
              <span>Last run: {new Date(automation.lastRun).toLocaleDateString()}</span>
            )}
            {automation.nextRun && (
              <span>Next run: {new Date(automation.nextRun).toLocaleDateString()}</span>
            )}
          </div>
          <span>By {automation.createdBy}</span>
        </div>
      </div>
    </BrandCard>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <BrandCard className="w-full max-w-7xl h-[95vh] flex flex-col" borderGradient="orange">
        {/* Header */}
        <div className="flex-shrink-0 p-4 sm:p-6 border-b border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500/20 to-yellow-500/20">
                <Zap className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Email Automation System</h2>
                <p className="text-sm sm:text-base text-white/70">Create and manage automated email workflows</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <BrandButton variant="orange" onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Create Automation</span>
                <span className="sm:hidden">Create</span>
              </BrandButton>
              <BrandButton variant="secondary" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </BrandButton>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="flex-shrink-0 p-4 sm:p-6 border-b border-white/10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="bg-white/5 rounded-xl p-3 sm:p-4 text-center">
              <p className="text-xl sm:text-2xl font-bold text-white">{automations.length}</p>
              <p className="text-white/60 text-xs sm:text-sm">Total Automations</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 sm:p-4 text-center">
              <p className="text-xl sm:text-2xl font-bold text-green-400">
                {automations.filter(a => a.status === 'active').length}
              </p>
              <p className="text-white/60 text-xs sm:text-sm">Active</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 sm:p-4 text-center">
              <p className="text-xl sm:text-2xl font-bold text-blue-400">
                {automations.reduce((sum, a) => sum + a.analytics.totalSent, 0)}
              </p>
              <p className="text-white/60 text-xs sm:text-sm">Emails Sent</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 sm:p-4 text-center">
              <p className="text-xl sm:text-2xl font-bold text-purple-400">
                {Math.round(
                  (automations.reduce((sum, a) => sum + a.analytics.opened, 0) /
                   automations.reduce((sum, a) => sum + a.analytics.totalSent, 1)) * 100
                )}%
              </p>
              <p className="text-white/60 text-xs sm:text-sm">Avg Open Rate</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 sm:p-4 text-center col-span-2 sm:col-span-1">
              <p className="text-xl sm:text-2xl font-bold text-yellow-400">
                {automations.reduce((sum, a) => sum + a.analytics.converted, 0)}
              </p>
              <p className="text-white/60 text-xs sm:text-sm">Conversions</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex-shrink-0 p-4 sm:p-6 border-b border-white/10">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <BrandInput
                  placeholder="Search automations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12"
                />
              </div>
            </div>
            
            <div className="flex space-x-2 sm:space-x-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-3 bg-black/20 backdrop-blur-xl border-2 border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 hover:border-white/30 hover:bg-black/30"
              >
                <option value="all">All Types</option>
                <option value="sequence">Sequence</option>
                <option value="trigger">Trigger</option>
                <option value="scheduled">Scheduled</option>
                <option value="follow_up">Follow-up</option>
                <option value="nurture">Nurture</option>
                <option value="reminder">Reminder</option>
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-3 bg-black/20 backdrop-blur-xl border-2 border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 hover:border-white/30 hover:bg-black/30"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="draft">Draft</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Automations List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            {filteredAutomations.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Zap className="w-12 h-12 sm:w-16 sm:h-16 text-white/40 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No automations found</h3>
                <p className="text-sm sm:text-base text-white/70 mb-6">
                  {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Create your first email automation to get started'
                  }
                </p>
                <BrandButton variant="orange" onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Automation
                </BrandButton>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                {filteredAutomations.map((automation) => (
                  <AutomationCard key={automation.id} automation={automation} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Automation Modal */}
        {showCreateModal && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10 p-4">
            <BrandCard className="w-full max-w-2xl max-h-[90vh] overflow-hidden" borderGradient="green">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Create New Automation</h3>
                  <BrandButton variant="secondary" size="sm" onClick={() => setShowCreateModal(false)}>
                    <X className="w-4 h-4" />
                  </BrandButton>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
                <div>
                  <label className="block text-white/80 font-medium mb-2">Automation Name</label>
                  <BrandInput
                    placeholder="Enter automation name..."
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-white/80 font-medium mb-2">Description</label>
                  <textarea
                    placeholder="Describe what this automation does..."
                    rows={3}
                    className="w-full px-4 py-3 bg-black/20 backdrop-blur-xl border-2 border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-white/80 font-medium mb-2">Automation Type</label>
                  <select className="w-full px-4 py-3 bg-black/20 backdrop-blur-xl border-2 border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <option value="sequence">Email Sequence</option>
                    <option value="trigger">Event Trigger</option>
                    <option value="scheduled">Scheduled Email</option>
                    <option value="follow_up">Follow-up</option>
                    <option value="nurture">Lead Nurture</option>
                    <option value="reminder">Reminder</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 font-medium mb-2">Trigger Condition</label>
                  <select className="w-full px-4 py-3 bg-black/20 backdrop-blur-xl border-2 border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <option value="email_sent">Email Sent</option>
                    <option value="email_opened">Email Opened</option>
                    <option value="link_clicked">Link Clicked</option>
                    <option value="form_submitted">Form Submitted</option>
                    <option value="deal_stage_change">Deal Stage Change</option>
                    <option value="date_based">Date Based</option>
                    <option value="manual">Manual Trigger</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 font-medium mb-2">Target Audience</label>
                    <select className="w-full px-4 py-3 bg-black/20 backdrop-blur-xl border-2 border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                      <option value="all">All Contacts</option>
                      <option value="leads">Leads Only</option>
                      <option value="customers">Customers Only</option>
                      <option value="specific">Specific List</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/80 font-medium mb-2">Max Emails</label>
                    <BrandInput
                      type="number"
                      placeholder="5"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-white/80 font-medium">Settings</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded border-white/20 bg-black/20 text-green-500" />
                      <span className="text-white/80">Business hours only</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded border-white/20 bg-black/20 text-green-500" defaultChecked />
                      <span className="text-white/80">Track email opens</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded border-white/20 bg-black/20 text-green-500" defaultChecked />
                      <span className="text-white/80">Track link clicks</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded border-white/20 bg-black/20 text-green-500" defaultChecked />
                      <span className="text-white/80">Include unsubscribe link</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/10">
                <div className="flex items-center justify-end space-x-3">
                  <BrandButton variant="secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </BrandButton>
                  <BrandButton variant="green" onClick={() => {
                    setShowCreateModal(false);
                    // Would normally create the automation here
                    onCreateAutomation({
                      name: 'New Automation',
                      type: 'sequence',
                      status: 'draft'
                    });
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Automation
                  </BrandButton>
                </div>
              </div>
            </BrandCard>
          </div>
        )}

        {/* Automation Details Modal */}
        {selectedAutomation && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10 p-2 sm:p-4">
            <BrandCard className="w-full max-w-4xl max-h-[90vh] flex flex-col" borderGradient="purple">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedAutomation.name}</h3>
                    <p className="text-white/70">{selectedAutomation.description}</p>
                  </div>
                  <BrandButton variant="secondary" size="sm" onClick={() => setSelectedAutomation(null)}>
                    <X className="w-4 h-4" />
                  </BrandButton>
                </div>
              </div>
              
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
                {/* Analytics */}
                <div>
                  <h4 className="text-white/80 font-medium mb-4">Performance Analytics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-white">{selectedAutomation.analytics.totalSent}</p>
                      <p className="text-white/60 text-sm">Total Sent</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-green-400">{selectedAutomation.analytics.opened}</p>
                      <p className="text-white/60 text-sm">Opened</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-blue-400">{selectedAutomation.analytics.clicked}</p>
                      <p className="text-white/60 text-sm">Clicked</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-purple-400">{selectedAutomation.analytics.replied}</p>
                      <p className="text-white/60 text-sm">Replied</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-yellow-400">{selectedAutomation.analytics.converted}</p>
                      <p className="text-white/60 text-sm">Converted</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-red-400">{selectedAutomation.analytics.unsubscribed}</p>
                      <p className="text-white/60 text-sm">Unsubscribed</p>
                    </div>
                  </div>
                </div>

                {/* Workflow Steps */}
                <div>
                  <h4 className="text-white/80 font-medium mb-4">Automation Workflow</h4>
                  <div className="space-y-3">
                    {selectedAutomation.actions.map((action, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-white/5 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-orange-400 text-sm font-bold">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">
                            {action.type === 'send_email' && `Send Email: ${action.template}`}
                            {action.type === 'wait' && `Wait ${action.delay}`}
                            {action.type === 'create_task' && 'Create Follow-up Task'}
                            {action.type === 'conditional' && 'Check Conditions'}
                          </p>
                          {action.delay && action.type !== 'wait' && (
                            <p className="text-white/60 text-sm">Delay: {action.delay}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/10">
                <div className="flex items-center justify-end space-x-3">
                  <BrandButton variant="blue">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Automation
                  </BrandButton>
                  <BrandButton variant="green">
                    <Play className="w-4 h-4 mr-2" />
                    Run Now
                  </BrandButton>
                </div>
              </div>
            </BrandCard>
          </div>
        )}
      </BrandCard>
    </div>
  );
};

export default EmailAutomationSystem;
