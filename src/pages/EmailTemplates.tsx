import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Copy, 
  ThumbsUp, 
  ThumbsDown, 
  Bot, 
  FileText, 
  Tag, 
  Star, 
  Users, 
  TrendingUp,
  Sparkles,
  Lightbulb,
  Target,
  Clock,
  Eye,
  Download,
  Share2,
  Settings,
  Filter,
  Grid,
  List,
  BookOpen,
  MessageSquare,
  Mail,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Zap,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Award,
  Crown,
  Trophy,
  Medal,
  Badge as BadgeIcon,
  CheckSquare,
  Square,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  PhoneOff,
  Headphones,
  Speaker,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Server,
  Database,
  HardDrive,
  Cloud,
  Wifi,
  WifiOff,
  Signal,
  SignalHigh,
  SignalMedium,
  SignalLow,
  Battery,
  BatteryCharging,
  BatteryFull,
  BatteryMedium,
  BatteryLow,
  Power,
  PowerOff,
  Lock,
  Unlock,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Key,
  KeyRound,
  Fingerprint,
  UserCheck,
  UserX,
  UserPlus,
  UserMinus,
  UserCog,
  X
} from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Container from '../components/layout/Container';
import EmptyState from '../components/common/EmptyState';
import { useGuruContext } from '../contexts/GuruContext';
import { useToastContext } from '../contexts/ToastContext';
import Spline from '@splinetool/react-spline';
import { useEmailIntegration } from '../hooks/useEmailIntegration';
import Modal from '../components/ui/Modal';
import EnhancedEmailComposer from '../components/emails/EnhancedEmailComposer';
import { BRAND } from '../constants/theme';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  html_body?: string;
  tags: string[];
  isShared: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  rating?: 'up' | 'down';
  category: 'onboarding' | 'follow-up' | 'closing' | 'custom' | 'proposal' | 'demo' | 'support';
  variables: string[];
  ai_optimized?: boolean;
  performance_score?: number;
  conversion_rate?: number;
  response_rate?: number;
  last_used?: Date;
  is_favorite?: boolean;
  template_type: 'text' | 'html' | 'rich';
  language: string;
  industry?: string;
  target_audience?: string;
}

// AI Template Insights Component
interface AITemplateInsightsProps {
  onInsightClick: (insight: any) => void;
}

const AITemplateInsights: React.FC<AITemplateInsightsProps> = ({ onInsightClick }) => {
  const insights = [
    {
      id: 1,
      type: 'performance',
      title: 'High-Performing Template',
      description: 'Welcome template has 85% open rate - consider using more',
      icon: TrendingUp,
      priority: 'high',
      action: 'Optimize',
      color: '#43e7ad'
    },
    {
      id: 2,
      type: 'optimization',
      title: 'AI Optimization Available',
      description: '3 templates can be improved with AI for better engagement',
      icon: Sparkles,
      priority: 'medium',
      action: 'Optimize',
      color: '#a259ff'
    },
    {
      id: 3,
      type: 'suggestion',
      title: 'New Template Suggestion',
      description: 'Create proposal follow-up template based on your data',
      icon: Lightbulb,
      priority: 'medium',
      action: 'Create',
      color: '#f59e0b'
    }
  ];

  return (
    <Card className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-[#a259ff]" />
          <h3 className="text-lg font-semibold text-white">AI Template Insights</h3>
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
                onClick={() => onInsightClick(insight)}
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

// Template Statistics Component
const TemplateStats: React.FC = () => {
  const stats = [
    {
      label: 'Total Templates',
      value: '24',
      icon: FileText,
      color: 'text-[#a259ff]',
      bgColor: 'bg-[#a259ff]/20'
    },
    {
      label: 'AI Optimized',
      value: '8',
      icon: Sparkles,
      color: 'text-[#43e7ad]',
      bgColor: 'bg-[#43e7ad]/20'
    },
    {
      label: 'High Performers',
      value: '12',
      icon: TrendingUp,
      color: 'text-[#f59e0b]',
      bgColor: 'bg-[#f59e0b]/20'
    },
    {
      label: 'Shared Templates',
      value: '16',
      icon: Share2,
      color: 'text-[#377dff]',
      bgColor: 'bg-[#377dff]/20'
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

// Template Categories Component
interface TemplateCategoriesProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const TemplateCategories: React.FC<TemplateCategoriesProps> = ({ activeCategory, onCategoryChange }) => {
  const categories = [
    { id: 'all', label: 'All Templates', icon: FileText, count: 24, color: '#a259ff' },
    { id: 'onboarding', label: 'Onboarding', icon: UserPlus, count: 6, color: '#43e7ad' },
    { id: 'follow-up', label: 'Follow-up', icon: MessageSquare, count: 8, color: '#377dff' },
    { id: 'closing', label: 'Closing', icon: CheckCircle, count: 4, color: '#f59e0b' },
    { id: 'proposal', label: 'Proposals', icon: FileText, count: 3, color: '#ef4444' },
    { id: 'demo', label: 'Demo', icon: Play, count: 2, color: '#8b5cf6' },
    { id: 'support', label: 'Support', icon: Headphones, count: 1, color: '#6b7280' }
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

const EmailTemplates: React.FC = () => {
  const { openGuru } = useGuruContext();
  const { showToast } = useToastContext();
  const { 
    isComposerOpen, 
    composerData, 
    openEmailComposer, 
    closeEmailComposer 
  } = useEmailIntegration();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'usage' | 'name' | 'date' | 'rating'>('usage');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);

  const templates: EmailTemplate[] = [
    {
      id: '1',
      name: 'Welcome New Lead',
      subject: 'Welcome to SaleToru - Let\'s Get Started!',
      body: 'Hi {{contact_name}},\n\nThank you for your interest in SaleToru! We\'re excited to help you streamline your sales process.\n\nI\'d love to schedule a quick 15-minute call to understand your needs better and show you how SaleToru can help your team close more deals.\n\nBest regards,\n{{user_name}}',
      html_body: '<p>Hi {{contact_name}},</p><p>Thank you for your interest in SaleToru! We\'re excited to help you streamline your sales process.</p><p>I\'d love to schedule a quick 15-minute call to understand your needs better and show you how SaleToru can help your team close more deals.</p><p>Best regards,<br>{{user_name}}</p>',
      tags: ['welcome', 'new-lead', 'intro'],
      isShared: true,
      createdBy: 'Admin',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      usageCount: 24,
      rating: 'up',
      category: 'onboarding',
      variables: ['contact_name', 'user_name'],
      ai_optimized: true,
      performance_score: 85,
      conversion_rate: 12.5,
      response_rate: 78,
      last_used: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      is_favorite: true,
      template_type: 'html',
      language: 'en',
      industry: 'SaaS',
      target_audience: 'Sales Teams'
    },
    {
      id: '2',
      name: 'Follow-up After Demo',
      subject: 'Thanks for the demo - Next steps',
      body: 'Hi {{contact_name}},\n\nThank you for taking the time to see our demo yesterday. I hope you found it valuable and can see how {{product_name}} would benefit {{company_name}}.\n\nAs discussed, here are the next steps:\n1. {{next_step_1}}\n2. {{next_step_2}}\n\nI\'ll follow up with you early next week to answer any questions.\n\nBest,\n{{user_name}}',
      html_body: '<p>Hi {{contact_name}},</p><p>Thank you for taking the time to see our demo yesterday. I hope you found it valuable and can see how {{product_name}} would benefit {{company_name}}.</p><p>As discussed, here are the next steps:</p><ol><li>{{next_step_1}}</li><li>{{next_step_2}}</li></ol><p>I\'ll follow up with you early next week to answer any questions.</p><p>Best,<br>{{user_name}}</p>',
      tags: ['demo', 'follow-up', 'next-steps'],
      isShared: true,
      createdBy: 'Janar Kuusk',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      usageCount: 18,
      category: 'follow-up',
      variables: ['contact_name', 'product_name', 'company_name', 'next_step_1', 'next_step_2', 'user_name'],
      ai_optimized: false,
      performance_score: 72,
      conversion_rate: 8.3,
      response_rate: 65,
      last_used: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      is_favorite: false,
      template_type: 'html',
      language: 'en',
      industry: 'SaaS',
      target_audience: 'Prospects'
    },
    {
      id: '3',
      name: 'Proposal Sent',
      subject: 'Your SaleToru Proposal - {{deal_name}}',
      body: 'Hi {{contact_name}},\n\nI\'ve attached your customized proposal for {{deal_name}}. This includes everything we discussed:\n\n• {{feature_1}}\n• {{feature_2}}\n• {{feature_3}}\n\nThe proposal is valid for 30 days. I\'m confident this solution will help {{company_name}} achieve {{goal}}.\n\nLet\'s schedule a call to discuss any questions you might have.\n\nBest regards,\n{{user_name}}',
      html_body: '<p>Hi {{contact_name}},</p><p>I\'ve attached your customized proposal for {{deal_name}}. This includes everything we discussed:</p><ul><li>{{feature_1}}</li><li>{{feature_2}}</li><li>{{feature_3}}</li></ul><p>The proposal is valid for 30 days. I\'m confident this solution will help {{company_name}} achieve {{goal}}.</p><p>Let\'s schedule a call to discuss any questions you might have.</p><p>Best regards,<br>{{user_name}}</p>',
      tags: ['proposal', 'pricing', 'features'],
      isShared: false,
      createdBy: 'Janar Kuusk',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      usageCount: 5,
      category: 'closing',
      variables: ['contact_name', 'deal_name', 'feature_1', 'feature_2', 'feature_3', 'company_name', 'goal', 'user_name'],
      ai_optimized: false,
      performance_score: 68,
      conversion_rate: 15.2,
      response_rate: 82,
      last_used: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      is_favorite: true,
      template_type: 'html',
      language: 'en',
      industry: 'SaaS',
      target_audience: 'Decision Makers'
    },
    {
      id: '4',
      name: 'Contract Signed - Thank You',
      subject: 'Welcome to the SaleToru family! 🎉',
      body: 'Hi {{contact_name}},\n\nCongratulations! We\'re thrilled to welcome {{company_name}} to the SaleToru family.\n\nYour implementation specialist {{specialist_name}} will reach out within 24 hours to begin your onboarding process.\n\nIn the meantime, here are some helpful resources:\n• Getting Started Guide: {{guide_link}}\n• Video Tutorials: {{video_link}}\n• Support Portal: {{support_link}}\n\nThank you for choosing SaleToru. We\'re excited to help you grow your business!\n\nBest,\n{{user_name}}',
      html_body: '<p>Hi {{contact_name}},</p><p>Congratulations! We\'re thrilled to welcome {{company_name}} to the SaleToru family.</p><p>Your implementation specialist {{specialist_name}} will reach out within 24 hours to begin your onboarding process.</p><p>In the meantime, here are some helpful resources:</p><ul><li>Getting Started Guide: <a href="{{guide_link}}">{{guide_link}}</a></li><li>Video Tutorials: <a href="{{video_link}}">{{video_link}}</a></li><li>Support Portal: <a href="{{support_link}}">{{support_link}}</a></li></ul><p>Thank you for choosing SaleToru. We\'re excited to help you grow your business!</p><p>Best,<br>{{user_name}}</p>',
      tags: ['welcome', 'onboarding', 'success'],
      isShared: true,
      createdBy: 'Admin',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      usageCount: 12,
      rating: 'up',
      category: 'onboarding',
      variables: ['contact_name', 'company_name', 'specialist_name', 'guide_link', 'video_link', 'support_link', 'user_name'],
      ai_optimized: true,
      performance_score: 92,
      conversion_rate: 18.7,
      response_rate: 91,
      last_used: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      is_favorite: true,
      template_type: 'html',
      language: 'en',
      industry: 'SaaS',
      target_audience: 'New Customers'
    }
  ];

  const categories = [
    { key: 'all', label: 'All Templates', count: templates.length },
    { key: 'onboarding', label: 'Onboarding', count: templates.filter(t => t.category === 'onboarding').length },
    { key: 'follow-up', label: 'Follow-up', count: templates.filter(t => t.category === 'follow-up').length },
    { key: 'closing', label: 'Closing', count: templates.filter(t => t.category === 'closing').length },
    { key: 'custom', label: 'Custom', count: templates.filter(t => t.category === 'custom').length }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      case 'usage':
        return sortOrder === 'asc'
          ? a.usageCount - b.usageCount
          : b.usageCount - a.usageCount;
      case 'date':
        return sortOrder === 'asc'
          ? a.createdAt.getTime() - b.createdAt.getTime()
          : b.createdAt.getTime() - a.createdAt.getTime();
      case 'rating':
        const aScore = a.performance_score || 0;
        const bScore = b.performance_score || 0;
        return sortOrder === 'asc'
          ? aScore - bScore
          : bScore - aScore;
      default:
        return 0;
    }
  });

  const handleRating = (templateId: string, rating: 'up' | 'down') => {
    showToast({
      type: 'success',
      title: 'Rating Updated',
      description: `Template rated as ${rating === 'up' ? 'helpful' : 'not helpful'}`
    });
  };

  const handleDuplicate = (template: EmailTemplate) => {
    showToast({
      type: 'success',
      title: 'Template Duplicated',
      description: `${template.name} has been duplicated successfully`
    });
  };

  const handleAIInsight = (insight: any) => {
    showToast({
      type: 'info',
      title: 'AI Insight',
      description: `Processing: ${insight.title}`
    });
  };

  const handleSendEmail = async (emailData: any) => {
    try {
      // Handle email sending logic here
      console.log('Sending email:', emailData);
      
      showToast({
        title: 'Email Sent',
        description: 'Your email has been sent successfully',
        type: 'success'
      });
      
      closeEmailComposer();
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

  const TemplateCard = ({ template }: { template: EmailTemplate }) => (
    <Card className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50 hover:border-[#a259ff]/30 transition-all duration-200 cursor-pointer group">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-white">{template.name}</h3>
              {template.isShared && <Badge variant="success" size="sm">Shared</Badge>}
              {template.ai_optimized && <Badge variant="success" size="sm"><Sparkles className="w-3 h-3 mr-1" />AI</Badge>}
              {template.is_favorite && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
            </div>
            <p className="text-sm text-[#b0b0d0] mb-2 font-medium">{template.subject}</p>
            <p className="text-sm text-[#b0b0d0] line-clamp-3">{template.body.substring(0, 150)}...</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {template.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="secondary" size="sm">
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </Badge>
          ))}
          {template.tags.length > 3 && (
            <Badge variant="secondary" size="sm">
              +{template.tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4 text-[#b0b0d0]">
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-4 h-4" />
              <span>{template.usageCount} uses</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{template.createdBy}</span>
            </div>
            {template.performance_score && (
              <div className="flex items-center space-x-1">
                <BarChart3 className="w-4 h-4" />
                <span>{template.performance_score}%</span>
              </div>
            )}
          </div>
          <Badge variant="secondary" size="sm">
            {template.category}
          </Badge>
        </div>

        <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRating(template.id, 'up');
              }}
              className={`p-1 rounded transition-colors ${
                template.rating === 'up' ? 'text-green-500' : 'text-[#b0b0d0] hover:text-green-500'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRating(template.id, 'down');
              }}
              className={`p-1 rounded transition-colors ${
                template.rating === 'down' ? 'text-red-500' : 'text-[#b0b0d0] hover:text-red-500'
              }`}
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDuplicate(template);
              }}
              className="p-1 text-[#b0b0d0] hover:text-white transition-colors"
              title="Duplicate"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingTemplate(template);
                setShowCreateModal(true);
              }}
              className="p-1 text-[#b0b0d0] hover:text-white transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Handle delete
              }}
              className="p-1 text-[#b0b0d0] hover:text-red-500 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Card>
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
            <h1 className="text-3xl font-bold text-white">Email Templates</h1>
            <p className="text-[#b0b0d0] mt-1">AI-powered email template management and optimization</p>
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
              onClick={() => setShowCreateModal(true)}
            >
              Create Template
            </Button>
            <Button 
              variant="gradient"
              icon={Mail}
              onClick={openEmailComposer}
            >
              Compose
            </Button>
          </div>
        </div>

        {/* Template Statistics */}
        <TemplateStats />

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* AI Template Insights */}
            <AITemplateInsights onInsightClick={handleAIInsight} />

            {/* Template Categories */}
            <TemplateCategories 
              activeCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>

          {/* Main Template Area */}
          <div className="xl:col-span-3">
            {/* Template Controls */}
            <Card className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#b0b0d0]" />
                    <input
                      type="text"
                      placeholder="Search templates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-[#23233a]/50 border border-[#23233a]/30 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff] transition-all duration-200"
                    />
                  </div>

                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 bg-[#23233a]/50 border border-[#23233a]/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff] transition-all duration-200"
                  >
                    <option value="usage">Most Used</option>
                    <option value="name">Name</option>
                    <option value="date">Date Created</option>
                    <option value="rating">Performance</option>
                  </select>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={sortOrder === 'asc' ? ChevronUp : ChevronDown}
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    <span className="sr-only">Sort</span>
                  </Button>
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* View Mode */}
                  <div className="flex items-center space-x-1 bg-[#23233a]/50 rounded-lg p-1">
                    <Button 
                      variant={viewMode === 'grid' ? 'primary' : 'secondary'} 
                      size="sm"
                      icon={Grid}
                      onClick={() => setViewMode('grid')}
                    >
                      <span className="sr-only">Grid view</span>
                    </Button>
                    <Button 
                      variant={viewMode === 'list' ? 'primary' : 'secondary'} 
                      size="sm"
                      icon={List}
                      onClick={() => setViewMode('list')}
                    >
                      <span className="sr-only">List view</span>
                    </Button>
                  </div>

                  <Button variant="secondary" size="sm" icon={RefreshCw}>
                    Refresh
                  </Button>
                </div>
              </div>
            </Card>

            {/* Template Grid/List */}
            {sortedTemplates.length === 0 ? (
              <Card className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50">
                <EmptyState
                  icon={FileText}
                  title="No templates found"
                  description="Try adjusting your search or filters"
                  actionLabel="Create Template"
                  onAction={() => setShowCreateModal(true)}
                />
              </Card>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
                {sortedTemplates.map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-[#23233a]/90 backdrop-blur-sm border border-[#23233a]/50 p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                {editingTemplate ? 'Edit Template' : 'Create New Template'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingTemplate(null);
                }}
                className="text-[#b0b0d0] hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              // Handle form submission
              console.log('Template form submitted');
            }} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter template name"
                    className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                    defaultValue={editingTemplate?.name || ''}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Category *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                    defaultValue={editingTemplate?.category || 'custom'}
                  >
                    <option value="onboarding">Onboarding</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="closing">Closing</option>
                    <option value="custom">Custom</option>
                    <option value="proposal">Proposal</option>
                    <option value="demo">Demo</option>
                    <option value="support">Support</option>
                  </select>
                </div>
              </div>

              {/* Subject Line */}
              <div>
                <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                  Subject Line *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter email subject"
                  className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                  defaultValue={editingTemplate?.subject || ''}
                />
                <p className="text-xs text-[#b0b0d0] mt-1">
                  Use variables like {'{{first_name}}'}, {'{{company_name}}'} for personalization
                </p>
              </div>

              {/* Template Type and Language */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Template Type
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                    defaultValue={editingTemplate?.template_type || 'rich'}
                  >
                    <option value="text">Plain Text</option>
                    <option value="html">HTML</option>
                    <option value="rich">Rich Text</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Language
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                    defaultValue={editingTemplate?.language || 'en'}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                    <option value="pt">Portuguese</option>
                  </select>
                </div>
              </div>

              {/* Email Body */}
              <div>
                <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                  Email Body *
                </label>
                <textarea
                  required
                  rows={12}
                  placeholder="Write your email content here. Use variables like {{first_name}}, {{company_name}} for personalization."
                  className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff] resize-y"
                  defaultValue={editingTemplate?.body || ''}
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-[#b0b0d0]">
                    Available variables: {'{{first_name}}'}, {'{{last_name}}'}, {'{{company_name}}'}, {'{{deal_title}}'}, {'{{deal_value}}'}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      icon={Bot}
                      onClick={() => console.log('AI assistance clicked')}
                    >
                      AI Assist
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      icon={Eye}
                      onClick={() => console.log('Preview clicked')}
                    >
                      Preview
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  placeholder="Enter tags separated by commas (e.g., follow-up, sales, proposal)"
                  className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                  defaultValue={editingTemplate?.tags?.join(', ') || ''}
                />
              </div>

              {/* Advanced Options */}
              <div className="border-t border-[#23233a]/30 pt-6">
                <h3 className="text-lg font-medium text-white mb-4">Advanced Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                      Industry
                    </label>
                    <select
                      className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                      defaultValue={editingTemplate?.industry || ''}
                    >
                      <option value="">Select Industry</option>
                      <option value="technology">Technology</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="finance">Finance</option>
                      <option value="education">Education</option>
                      <option value="retail">Retail</option>
                      <option value="manufacturing">Manufacturing</option>
                      <option value="consulting">Consulting</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                      Target Audience
                    </label>
                    <select
                      className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                      defaultValue={editingTemplate?.target_audience || ''}
                    >
                      <option value="">Select Audience</option>
                      <option value="prospects">Prospects</option>
                      <option value="leads">Leads</option>
                      <option value="customers">Customers</option>
                      <option value="partners">Partners</option>
                      <option value="vendors">Vendors</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-[#a259ff] bg-[#23233a]/50 border-2 border-white/20 rounded focus:ring-2 focus:ring-[#a259ff] focus:ring-offset-0"
                      defaultChecked={editingTemplate?.isShared || false}
                    />
                    <span className="text-sm text-[#b0b0d0]">Share with team</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-[#a259ff] bg-[#23233a]/50 border-2 border-white/20 rounded focus:ring-2 focus:ring-[#a259ff] focus:ring-offset-0"
                      defaultChecked={editingTemplate?.ai_optimized || false}
                    />
                    <span className="text-sm text-[#b0b0d0]">AI-optimized for better performance</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-[#a259ff] bg-[#23233a]/50 border-2 border-white/20 rounded focus:ring-2 focus:ring-[#a259ff] focus:ring-offset-0"
                      defaultChecked={editingTemplate?.is_favorite || false}
                    />
                    <span className="text-sm text-[#b0b0d0]">Mark as favorite</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-[#23233a]/30">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingTemplate(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gradient"
                  icon={editingTemplate ? undefined : Plus}
                >
                  {editingTemplate ? 'Update Template' : 'Create Template'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Enhanced Email Composer Modal */}
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

export default EmailTemplates;