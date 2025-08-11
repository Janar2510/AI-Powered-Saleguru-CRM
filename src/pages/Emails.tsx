import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Mail, 
  Send, 
  Reply, 
  Forward, 
  Paperclip, 
  Star, 
  Archive, 
  Trash2, 
  Eye, 
  Edit, 
  MoreHorizontal, 
  Bot, 
  Check, 
  X,
  Clock,
  Users,
  Target,
  AlertTriangle,
  TrendingUp,
  Settings,
  RefreshCw,
  List,
  Grid,
  MessageSquare,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import Spline from '@splinetool/react-spline';
import Container from '../components/layout/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/common/EmptyState';
import { useGuruContext } from '../contexts/GuruContext';
import { useToastContext } from '../contexts/ToastContext';
import { useEmailIntegration } from '../hooks/useEmailIntegration';
import EnhancedEmailComposer from '../components/emails/EnhancedEmailComposer';
import { supabase } from '../services/supabase';
import { v4 as uuidv4 } from 'uuid';

interface Email {
  id: string;
  from: string;
  to: string[];
  subject: string;
  body: string;
  html_body?: string;
  timestamp: Date;
  isRead: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
  linkedDeal?: string;
  linkedContact?: string;
  priority: 'low' | 'medium' | 'high';
  thread?: string;
  tracking_id?: string;
  status?: string;
  category?: 'primary' | 'social' | 'promotions' | 'updates' | 'forums';
  ai_insights?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  action_required?: boolean;
  follow_up_date?: Date;
  tags?: string[];
}

// AI Email Insights Component
interface AIEmailInsightsProps {
  onInsightClick: (insight: any) => void;
}

const AIEmailInsights: React.FC<AIEmailInsightsProps> = ({ onInsightClick }) => {
  const insights = [
    {
      id: 1,
      type: 'sentiment',
      title: 'Positive Customer Feedback',
      description: 'Email from John Smith shows high satisfaction with our proposal',
      icon: TrendingUp,
      priority: 'high',
      action: 'Follow Up',
      color: '#43e7ad'
    },
    {
      id: 2,
      type: 'action',
      title: 'Action Required',
      description: 'Sarah Johnson needs contract terms discussion - schedule call',
      icon: AlertTriangle,
      priority: 'urgent',
      action: 'Schedule Call',
      color: '#ef4444'
    },
    {
      id: 3,
      type: 'opportunity',
      title: 'Deal Opportunity',
      description: 'Mike Wilson shows interest in expanding services',
      icon: Target,
      priority: 'medium',
      action: 'Create Deal',
      color: '#a259ff'
    }
  ];

  return (
    <Card className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-[#a259ff]" />
          <h3 className="text-lg font-semibold text-white">AI Email Insights</h3>
          <Badge variant="success" size="sm">Active</Badge>
        </div>
        <Button variant="secondary" size="sm" icon={Settings}>
          Settings
        </Button>
      </div>
      
      <div className="space-y-3">
        {insights.map((insight) => (
          <div 
            key={insight.id}
            className="bg-[#23233a]/30 rounded-lg p-3 border border-[#23233a]/30 hover:border-[#a259ff]/30 transition-colors cursor-pointer"
            onClick={() => onInsightClick(insight)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${insight.color}20` }}
                >
                  <insight.icon className="w-4 h-4" style={{ color: insight.color }} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-white text-sm">{insight.title}</h4>
                  <p className="text-[#b0b0d0] text-xs mt-1">{insight.description}</p>
                </div>
              </div>
              <Button 
                variant="gradient" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onInsightClick(insight);
                }}
              >
                {insight.action}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// Email Statistics Component
const EmailStats: React.FC = () => {
  const stats = [
    {
      label: 'Total Emails',
      value: '1,247',
      icon: Mail,
      color: 'text-[#a259ff]',
      bgColor: 'bg-[#a259ff]/20'
    },
    {
      label: 'Unread',
      value: '23',
      icon: Mail, // Changed from UnreadIcon to Mail as UnreadIcon is no longer imported
      color: 'text-[#ef4444]',
      bgColor: 'bg-[#ef4444]/20'
    },
    {
      label: 'Starred',
      value: '12',
      icon: Star,
      color: 'text-[#f59e0b]',
      bgColor: 'bg-[#f59e0b]/20'
    },
    {
      label: 'Drafts',
      value: '5',
      icon: Mail, // Changed from Draft to Mail as Draft is no longer imported
      color: 'text-[#6b7280]',
      bgColor: 'bg-[#6b7280]/20'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stat.bgColor}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-[#b0b0d0] text-xs">{stat.label}</p>
              <p className="text-white font-semibold text-lg">{stat.value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

// Email Categories Component
interface EmailCategoriesProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const EmailCategories: React.FC<EmailCategoriesProps> = ({ activeCategory, onCategoryChange }) => {
  const categories = [
    { id: 'all', label: 'All Mail', icon: List, count: 1247, color: '#a259ff' }, // Changed from Inbox to List
    { id: 'primary', label: 'Primary', icon: Mail, count: 892, color: '#43e7ad' },
    { id: 'social', label: 'Social', icon: Users, count: 156, color: '#377dff' },
    { id: 'promotions', label: 'Promotions', icon: TrendingUp, count: 89, color: '#f59e0b' },
    { id: 'updates', label: 'Updates', icon: Mail, count: 67, color: '#6b7280' }, // Changed from Bell to Mail
    { id: 'forums', label: 'Forums', icon: MessageSquare, count: 43, color: '#ef4444' }
  ];

  return (
    <Card className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Categories</h3>
        <Button variant="secondary" size="sm" icon={Settings}>
          Manage
        </Button>
      </div>
      
      <div className="space-y-2">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-[#a259ff]/20 border border-[#a259ff]/30' 
                  : 'bg-[#23233a]/30 border border-[#23233a]/30 hover:border-[#a259ff]/30'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <Icon className="w-3 h-3" style={{ color: category.color }} />
                </div>
                <span className={`text-sm font-medium ${
                  isActive ? 'text-white' : 'text-[#b0b0d0]'
                }`}>
                  {category.label}
                </span>
              </div>
              <Badge variant="secondary" size="sm">{category.count}</Badge>
            </button>
          );
        })}
      </div>
    </Card>
  );
};

const Emails: React.FC = () => {
  const { openGuru } = useGuruContext();
  const { showToast } = useToastContext();
  const { 
    isComposerOpen, 
    composerData, 
    openEmailComposer, 
    closeEmailComposer 
  } = useEmailIntegration();
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [replyData, setReplyData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [emails, setEmails] = useState<Email[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'sender'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch emails from Supabase
  useEffect(() => {
    const fetchEmails = async () => {
      setIsLoading(true);
      try {
        // Fetch emails from Supabase
        const { data, error } = await supabase
          .from('emails')
          .select('*')
          .order('sent_at', { ascending: false });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          const formattedEmails = data.map(email => ({
            id: email.id,
            from: email.created_by ? 'janar@example.com' : email.to,
            to: [email.to],
            subject: email.subject,
            body: email.text_body || '',
            html_body: email.html_body,
            timestamp: new Date(email.sent_at || email.created_at),
            isRead: email.status !== 'sent',
            isStarred: false,
            hasAttachments: email.has_attachments,
            linkedDeal: email.deal_id,
            linkedContact: email.contact_id,
            priority: 'medium' as 'low' | 'medium' | 'high',
            thread: email.id,
            tracking_id: email.tracking_id,
            status: email.status,
            category: 'primary' as 'primary' | 'social' | 'promotions' | 'updates' | 'forums',
            ai_insights: 'Positive sentiment detected',
            sentiment: 'positive' as 'positive' | 'negative' | 'neutral',
            action_required: false,
            tags: ['proposal', 'follow-up']
          }));
          
          setEmails(formattedEmails);
        } else {
          // Fallback to mock data
          setEmails([
            {
              id: '1',
              from: 'john.smith@techcorp.com',
              to: ['janar@example.com'],
              subject: 'Re: Enterprise Software Package Proposal',
              body: 'Hi Janar,\n\nThank you for the detailed proposal. We\'ve reviewed it with our team and have a few questions about the implementation timeline...',
              html_body: '<p>Hi Janar,</p><p>Thank you for the detailed proposal. We\'ve reviewed it with our team and have a few questions about the implementation timeline...</p>',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
              isRead: false,
              isStarred: true,
              hasAttachments: true,
              linkedDeal: 'Enterprise Software Package',
              linkedContact: 'John Smith',
              priority: 'high',
              thread: 'thread-1',
              tracking_id: uuidv4(),
              category: 'primary',
              ai_insights: 'High priority - requires immediate response',
              sentiment: 'positive',
              action_required: true,
              tags: ['proposal', 'enterprise', 'urgent']
            },
            {
              id: '2',
              from: 'sarah.johnson@startupxyz.com',
              to: ['janar@example.com'],
              subject: 'Demo Follow-up - Cloud Infrastructure',
              body: 'Hi Janar,\n\nGreat demo yesterday! Our team was impressed with the cloud infrastructure solution. When can we schedule the next steps?',
              html_body: '<p>Hi Janar,</p><p>Great demo yesterday! Our team was impressed with the cloud infrastructure solution. When can we schedule the next steps?</p>',
              timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
              isRead: true,
              isStarred: false,
              hasAttachments: false,
              linkedDeal: 'Cloud Infrastructure',
              linkedContact: 'Sarah Johnson',
              priority: 'medium',
              thread: 'thread-2',
              tracking_id: uuidv4(),
              category: 'primary',
              ai_insights: 'Positive feedback - opportunity for follow-up',
              sentiment: 'positive',
              action_required: true,
              tags: ['demo', 'follow-up', 'cloud']
            },
            {
              id: '3',
              from: 'mike.wilson@financecore.com',
              to: ['janar@example.com'],
              subject: 'Contract Terms Discussion',
              body: 'Hello,\n\nI wanted to follow up on our conversation about the contract terms. Could we schedule a call this week?',
              html_body: '<p>Hello,</p><p>I wanted to follow up on our conversation about the contract terms. Could we schedule a call this week?</p>',
              timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
              isRead: true,
              isStarred: false,
              hasAttachments: false,
              linkedDeal: 'Financial Services',
              linkedContact: 'Mike Wilson',
              priority: 'low',
              tracking_id: uuidv4(),
              category: 'primary',
              ai_insights: 'Neutral tone - standard follow-up',
              sentiment: 'neutral',
              action_required: false,
              tags: ['contract', 'discussion']
            }
          ]);
        }
      } catch (err) {
        console.error('Error fetching emails:', err);
        
        // Fallback to mock data
        setEmails([
          {
            id: '1',
            from: 'john.smith@techcorp.com',
            to: ['janar@example.com'],
            subject: 'Re: Enterprise Software Package Proposal',
            body: 'Hi Janar,\n\nThank you for the detailed proposal. We\'ve reviewed it with our team and have a few questions about the implementation timeline...',
            html_body: '<p>Hi Janar,</p><p>Thank you for the detailed proposal. We\'ve reviewed it with our team and have a few questions about the implementation timeline...</p>',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            isRead: false,
            isStarred: true,
            hasAttachments: true,
            linkedDeal: 'Enterprise Software Package',
            linkedContact: 'John Smith',
            priority: 'high',
            thread: 'thread-1',
            tracking_id: uuidv4(),
            category: 'primary',
            ai_insights: 'High priority - requires immediate response',
            sentiment: 'positive',
            action_required: true,
            tags: ['proposal', 'enterprise', 'urgent']
          },
          {
            id: '2',
            from: 'sarah.johnson@startupxyz.com',
            to: ['janar@example.com'],
            subject: 'Demo Follow-up - Cloud Infrastructure',
            body: 'Hi Janar,\n\nGreat demo yesterday! Our team was impressed with the cloud infrastructure solution. When can we schedule the next steps?',
            html_body: '<p>Hi Janar,</p><p>Great demo yesterday! Our team was impressed with the cloud infrastructure solution. When can we schedule the next steps?</p>',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
            isRead: true,
            isStarred: false,
            hasAttachments: false,
            linkedDeal: 'Cloud Infrastructure',
            linkedContact: 'Sarah Johnson',
            priority: 'medium',
            thread: 'thread-2',
            tracking_id: uuidv4(),
            category: 'primary',
            ai_insights: 'Positive feedback - opportunity for follow-up',
            sentiment: 'positive',
            action_required: true,
            tags: ['demo', 'follow-up', 'cloud']
          },
          {
            id: '3',
            from: 'mike.wilson@financecore.com',
            to: ['janar@example.com'],
            subject: 'Contract Terms Discussion',
            body: 'Hello,\n\nI wanted to follow up on our conversation about the contract terms. Could we schedule a call this week?',
            html_body: '<p>Hello,</p><p>I wanted to follow up on our conversation about the contract terms. Could we schedule a call this week?</p>',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
            isRead: true,
            isStarred: false,
            hasAttachments: false,
            linkedDeal: 'Financial Services',
            linkedContact: 'Mike Wilson',
            priority: 'low',
            tracking_id: uuidv4(),
            category: 'primary',
            ai_insights: 'Neutral tone - standard follow-up',
            sentiment: 'neutral',
            action_required: false,
            tags: ['contract', 'discussion']
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEmails();
  }, []);

  const filteredEmails = emails.filter(email => {
    const matchesSearch = (email.subject?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (email.from?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (email.body?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeCategory === 'all' || email.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const sortedEmails = [...filteredEmails].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return sortOrder === 'asc' 
          ? a.timestamp.getTime() - b.timestamp.getTime()
          : b.timestamp.getTime() - a.timestamp.getTime();
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return sortOrder === 'asc'
          ? priorityOrder[a.priority] - priorityOrder[b.priority]
          : priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'sender':
        return sortOrder === 'asc'
          ? a.from.localeCompare(b.from)
          : b.from.localeCompare(a.from);
      default:
        return 0;
    }
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-[#ef4444]';
      case 'medium': return 'text-[#f59e0b]';
      case 'low': return 'text-[#43e7ad]';
      default: return 'text-[#b0b0d0]';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-[#43e7ad]';
      case 'negative': return 'text-[#ef4444]';
      case 'neutral': return 'text-[#6b7280]';
      default: return 'text-[#b0b0d0]';
    }
  };

  const handleSendEmail = async (emailData: any) => {
    try {
      console.log('Sending email:', emailData);
      
      // Here you would typically send the email via your email service
      // For now, we'll just show a success message
      showToast({
        title: 'Email Sent',
        description: 'Email has been sent successfully',
        type: 'success'
      });
      
      // Refresh emails
      // await fetchEmails();
      
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      showToast({
        title: 'Send Failed',
        description: 'Failed to send email. Please try again.',
        type: 'error'
      });
      return false;
    }
  };

  const handleReply = (email: Email) => {
    setReplyData({
      to: email.from,
      subject: `Re: ${email.subject}`,
      body: `\n\n--- Original Message ---\nFrom: ${email.from}\nDate: ${email.timestamp.toLocaleString()}\n\n${email.body}`
    });
    openEmailComposer({
      to: email.from,
      subject: `Re: ${email.subject}`,
      body: `\n\n--- Original Message ---\nFrom: ${email.from}\nDate: ${email.timestamp.toLocaleString()}\n\n${email.body}`
    });
  };

  const handleForward = (email: Email) => {
    setReplyData({
      to: '',
      subject: `Fwd: ${email.subject}`,
      body: `\n\n--- Forwarded Message ---\nFrom: ${email.from}\nDate: ${email.timestamp.toLocaleString()}\n\n${email.body}`
    });
    openEmailComposer({
      to: '',
      subject: `Fwd: ${email.subject}`,
      body: `\n\n--- Forwarded Message ---\nFrom: ${email.from}\nDate: ${email.timestamp.toLocaleString()}\n\n${email.body}`
    });
  };

  const handleArchive = async (email: Email) => {
    try {
      // In a real app, this would archive the email
      setEmails(prev => prev.filter(e => e.id !== email.id));
      showToast({
        type: 'success',
        title: 'Email Archived',
        description: 'Email has been archived'
      });
    } catch (error) {
      console.error('Error archiving email:', error);
      showToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to archive email'
      });
    }
  };

  const handleDelete = async (email: Email) => {
    try {
      // In a real app, this would delete the email
      setEmails(prev => prev.filter(e => e.id !== email.id));
      setDeleteConfirm(null);
      showToast({
        type: 'success',
        title: 'Email Deleted',
        description: 'Email has been deleted'
      });
    } catch (error) {
      console.error('Error deleting email:', error);
      showToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to delete email'
      });
    }
  };

  const toggleStar = async (emailId: string) => {
    try {
      setEmails(prev => prev.map(email => 
        email.id === emailId 
          ? { ...email, isStarred: !email.isStarred }
          : email
      ));
      
      showToast({
        type: 'success',
        title: 'Email Updated',
        description: 'Email star status updated'
      });
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  };

  const markAsRead = async (emailId: string) => {
    try {
      setEmails(prev => prev.map(email => 
        email.id === emailId 
          ? { ...email, isRead: !email.isRead }
          : email
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleAIInsight = (insight: any) => {
    showToast({
      type: 'info',
      title: 'AI Insight',
      description: `Processing: ${insight.title}`
    });
  };

  const EmailListItem = ({ email }: { email: Email }) => (
    <div 
      className={`p-4 border-b border-[#23233a]/30 hover:bg-[#23233a]/20 transition-all duration-200 cursor-pointer ${
        !email.isRead ? 'bg-[#a259ff]/10 border-l-4 border-l-[#a259ff]' : ''
      }`}
      onClick={() => {
        setSelectedEmail(email);
        if (!email.isRead) markAsRead(email.id);
      }}
    >
      <div className="flex items-start space-x-4">
        {/* Email Status Icons */}
        <div className="flex flex-col items-center space-y-1 pt-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleStar(email.id);
            }}
            className={`p-1 rounded-full transition-colors ${
              email.isStarred ? 'text-[#f59e0b]' : 'text-[#b0b0d0] hover:text-[#f59e0b]'
            }`}
          >
            <Star className="w-4 h-4" fill={email.isStarred ? 'currentColor' : 'none'} />
          </button>
          {!email.isRead && (
            <div className="w-2 h-2 bg-[#a259ff] rounded-full"></div>
          )}
        </div>

        {/* Email Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <span className={`font-medium text-sm ${
                !email.isRead ? 'text-white' : 'text-[#b0b0d0]'
              }`}>
                {email.from}
              </span>
              {email.priority === 'high' && (
                <Badge variant="danger" size="sm">High</Badge>
              )}
              {email.action_required && (
                <Badge variant="warning" size="sm">Action Required</Badge>
              )}
            </div>
            <div className="flex items-center space-x-2 text-xs text-[#b0b0d0]">
              <span>{email.timestamp.toLocaleTimeString()}</span>
              {email.hasAttachments && (
                <Paperclip className="w-3 h-3" />
              )}
            </div>
          </div>
          
          <h3 className={`font-medium text-sm mb-1 ${
            !email.isRead ? 'text-white' : 'text-[#b0b0d0]'
          }`}>
            {email.subject}
          </h3>
          
          <p className="text-xs text-[#b0b0d0] line-clamp-2 mb-2">
            {email.body.substring(0, 150)}...
          </p>

          {/* AI Insights and Tags */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {email.ai_insights && (
                <div className="flex items-center space-x-1">
                  <Bot className="w-3 h-3 text-[#a259ff]" />
                  <span className="text-xs text-[#a259ff]">AI: {email.ai_insights}</span>
                </div>
              )}
              {email.sentiment && (
                <div className={`flex items-center space-x-1 ${getSentimentColor(email.sentiment)}`}>
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-xs capitalize">{email.sentiment}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              {email.tags?.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="secondary" size="sm">
                  {tag}
                </Badge>
              ))}
              {email.tags && email.tags.length > 2 && (
                <Badge variant="secondary" size="sm">
                  +{email.tags.length - 2}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-1">
          <Button
            variant="secondary"
            size="sm"
            icon={Reply}
            onClick={(e) => {
              e.stopPropagation();
              handleReply(email);
            }}
          />
          <Button
            variant="secondary"
            size="sm"
            icon={Forward}
            onClick={(e) => {
              e.stopPropagation();
              handleForward(email);
            }}
          />
          <Button
            variant="secondary"
            size="sm"
            icon={Archive}
            onClick={(e) => {
              e.stopPropagation();
              handleArchive(email);
            }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <Container>
      {/* 3D Background */}
      <div className="fixed inset-0 -z-10">
        <Spline scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode" />
      </div>

      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Smart Email</h1>
            <p className="text-[#b0b0d0] mt-1">AI-powered email management with smart insights</p>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="secondary"
              icon={Bot}
              onClick={openGuru}
            >
              Ask Guru
            </Button>
            <Button 
              variant="gradient"
              icon={Plus}
              onClick={() => openEmailComposer({})}
            >
              Compose
            </Button>
          </div>
        </div>

        {/* Email Statistics */}
        <EmailStats />

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* AI Email Insights */}
            <AIEmailInsights onInsightClick={handleAIInsight} />

            {/* Email Categories */}
            <EmailCategories 
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </div>

          {/* Main Email Area */}
          <div className="xl:col-span-3">
            {/* Email Controls */}
            <Card className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#b0b0d0]" />
                    <input
                      type="text"
                      placeholder="Search emails..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-[#23233a]/50 border border-[#23233a]/30 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff] transition-all duration-200"
                    />
                  </div>

                  {/* Filter */}
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-3 py-2 bg-[#23233a]/50 border border-[#23233a]/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff] transition-all duration-200"
                  >
                    <option value="all">All Emails</option>
                    <option value="unread">Unread</option>
                    <option value="starred">Starred</option>
                    <option value="high-priority">High Priority</option>
                    <option value="with-attachments">With Attachments</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* Sort */}
                  <div className="flex items-center space-x-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-3 py-2 bg-[#23233a]/50 border border-[#23233a]/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff] transition-all duration-200"
                    >
                      <option value="date">Date</option>
                      <option value="priority">Priority</option>
                      <option value="sender">Sender</option>
                    </select>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </div>

                  {/* View Mode */}
                  <div className="flex items-center space-x-1 bg-[#23233a]/50 rounded-lg p-1">
                    <Button 
                      variant={viewMode === 'list' ? 'gradient' : 'secondary'} 
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant={viewMode === 'grid' ? 'gradient' : 'secondary'} 
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                  </div>

                  <Button variant="secondary" size="sm">
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </Button>
                </div>
              </div>
            </Card>

            {/* Email List */}
            {isLoading ? (
              <Card className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50">
                <div className="flex items-center justify-center h-64">
                  <div className="w-10 h-10 border-4 border-[#a259ff] border-t-transparent rounded-full animate-spin"></div>
                </div>
              </Card>
            ) : sortedEmails.length === 0 ? (
              <Card className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50">
                <EmptyState
                  icon={Mail}
                  title="No emails found"
                  description="Try adjusting your search or filters"
                  actionLabel="Compose Email"
                  onAction={() => openEmailComposer({})}
                />
              </Card>
            ) : (
              <Card className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50">
                <div className="divide-y divide-[#23233a]/30">
                  {sortedEmails.map((email) => (
                    <EmailListItem key={email.id} email={email} />
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Email Composer Modal */}
      {isComposerOpen && (
        <EnhancedEmailComposer
          isOpen={isComposerOpen}
          onClose={closeEmailComposer}
          onSend={handleSendEmail}
          initialData={composerData}
        />
      )}
    </Container>
  );
};

export default Emails;