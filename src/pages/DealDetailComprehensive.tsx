import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  Calendar,
  Users,
  FileText,
  Download,
  Upload,
  MessageSquare,
  AtSign,
  Building2,
  User,
  DollarSign,
  Target,
  Clock,
  AlertTriangle,
  TrendingUp,
  Settings,
  Play,
  Pause,
  ExternalLink,
  CheckCircle,
  XCircle,
  RotateCcw,
  FileText as FileContract,
  Receipt,
  ShoppingCart,
  MessageSquare as Quote,
  BarChart3,
  Activity,
  Send,
  UserPlus,
  Bell,
  Star,
  Paperclip,
  Eye,
  Trash2,
  Plus,
  Copy,
  Share,
  Archive,
  Flag,
  Zap,
  Globe,
  CreditCard,
  Package,
  Truck,
  ClipboardList,
  History,
  Workflow
} from 'lucide-react';

import {
  BrandCard,
  BrandButton,
  BrandInput,
  BrandBadge,
  BrandTextarea
} from '../contexts/BrandDesignContext';

import { Deal, PIPELINE_STAGES } from '../hooks/useDeals';

// Extended interfaces for comprehensive data
interface EmailThread {
  id: string;
  subject: string;
  from: string;
  to: string;
  date: Date;
  body: string;
  attachments: string[];
  read: boolean;
}

interface Task {
  id: string;
  title: string;
  description: string;
  due_date: Date;
  status: 'pending' | 'in_progress' | 'completed';
  assigned_to: string;
  priority: 'low' | 'medium' | 'high';
}

interface RelatedDocument {
  id: string;
  type: 'quote' | 'order' | 'invoice' | 'contract' | 'proposal' | 'attachment';
  name: string;
  url: string;
  size: string;
  date: Date;
  status: string;
  amount?: number;
}

interface Automation {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'disabled';
  triggerCount: number;
  lastTriggered?: Date;
  nextRun?: Date;
}

const DealDetailComprehensive: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'emails' | 'tasks' | 'documents' | 'automations' | 'timeline' | 'notes'>('overview');
  const [newNote, setNewNote] = useState('');
  const [newTask, setNewTask] = useState('');
  const [showComposeEmail, setShowComposeEmail] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Mock data
  const [emails] = useState<EmailThread[]>([
    {
      id: '1',
      subject: 'RE: CRM Implementation Proposal',
      from: 'sarah.johnson@techcorp.com',
      to: 'sales@saletoru.com',
      date: new Date(Date.now() - 86400000 * 1),
      body: 'Thank you for the detailed proposal. We have a few questions about the implementation timeline and training schedule...',
      attachments: ['requirements.pdf', 'timeline.xlsx'],
      read: true
    },
    {
      id: '2',
      subject: 'Budget Approval Update',
      from: 'cfo@techcorp.com',
      to: 'sarah.johnson@techcorp.com',
      date: new Date(Date.now() - 86400000 * 3),
      body: 'The budget has been approved for Q1. We can proceed with the CRM implementation as discussed.',
      attachments: [],
      read: false
    }
  ]);

  const [tasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Send technical requirements document',
      description: 'Prepare and send detailed technical requirements for CRM integration',
      due_date: new Date(Date.now() + 86400000 * 2),
      status: 'in_progress',
      assigned_to: 'John Smith',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Schedule implementation kickoff meeting',
      description: 'Coordinate with client team to schedule project kickoff',
      due_date: new Date(Date.now() + 86400000 * 5),
      status: 'pending',
      assigned_to: 'Sarah Wilson',
      priority: 'medium'
    }
  ]);

  const [documents] = useState<RelatedDocument[]>([
    {
      id: '1',
      type: 'quote',
      name: 'Enterprise CRM Quote - QUO-2025-001',
      url: '/quotes/1',
      size: '2.4 MB',
      date: new Date(Date.now() - 86400000 * 10),
      status: 'Sent',
      amount: 150000
    },
    {
      id: '2',
      type: 'contract',
      name: 'Service Agreement Draft',
      url: '/contracts/1',
      size: '1.8 MB',
      date: new Date(Date.now() - 86400000 * 5),
      status: 'Draft',
      amount: 150000
    },
    {
      id: '3',
      type: 'attachment',
      name: 'Technical Requirements.pdf',
      url: '/documents/tech-req.pdf',
      size: '856 KB',
      date: new Date(Date.now() - 86400000 * 3),
      status: 'Uploaded'
    }
  ]);

  const [automations] = useState<Automation[]>([
    {
      id: '1',
      name: 'Follow-up Email Sequence',
      description: 'Automated email sequence for proposal follow-ups',
      status: 'active',
      triggerCount: 3,
      lastTriggered: new Date(Date.now() - 86400000 * 1),
      nextRun: new Date(Date.now() + 86400000 * 2)
    },
    {
      id: '2',
      name: 'Stage Alert Reminder',
      description: 'Alert when deal stays in stage for more than 14 days',
      status: 'active',
      triggerCount: 1,
      lastTriggered: new Date(Date.now() - 86400000 * 2)
    }
  ]);

  // Mock deal data
  useEffect(() => {
    const mockDeal: Deal = {
      id: id || '1',
      title: 'Enterprise CRM Solution',
      description: 'Large enterprise deal for complete CRM implementation with advanced features including custom integrations, training, and ongoing support.',
      value: 150000,
      currency: 'USD',
      probability: 75,
      stage: 'negotiation',
      status: 'open',
      priority: 'high',
      tags: ['enterprise', 'high-value', 'q1-target'],
      expected_close_date: new Date(Date.now() + 86400000 * 15),
      contact: {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@techcorp.com',
        phone: '+1 (555) 123-4567'
      },
      organization: {
        id: '1',
        name: 'TechCorp Enterprise',
        industry: 'Technology'
      },
      notes: 'Key decision makers identified. Technical requirements approved. Waiting for final budget approval from CFO.',
      owner_id: '1',
      created_at: new Date(Date.now() - 86400000 * 30),
      updated_at: new Date(Date.now() - 86400000 * 1)
    };
    
    setDeal(mockDeal);
    setLoading(false);
  }, [id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStageConfig = (stageId: string) => {
    return PIPELINE_STAGES.find(stage => stage.id === stageId);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'medium':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'low':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'quote':
        return <Quote className="w-5 h-5 text-blue-400" />;
      case 'order':
        return <ShoppingCart className="w-5 h-5 text-green-400" />;
      case 'invoice':
        return <Receipt className="w-5 h-5 text-purple-400" />;
      case 'contract':
        return <FileContract className="w-5 h-5 text-yellow-400" />;
      case 'proposal':
        return <FileText className="w-5 h-5 text-orange-400" />;
      case 'attachment':
        return <Paperclip className="w-5 h-5 text-gray-400" />;
      default:
        return <FileText className="w-5 h-5 text-white/60" />;
    }
  };

  const getCurrentStageIndex = () => {
    return PIPELINE_STAGES.findIndex(stage => stage.id === deal?.stage) || 0;
  };

  const getProgressPercentage = () => {
    const currentIndex = getCurrentStageIndex();
    return ((currentIndex + 1) / PIPELINE_STAGES.length) * 100;
  };

  const handleSendEmail = () => {
    console.log('Sending email:', { subject: emailSubject, body: emailBody });
    setShowComposeEmail(false);
    setEmailSubject('');
    setEmailBody('');
  };

  const handleAddTask = () => {
    if (newTask.trim()) {
      console.log('Adding task:', newTask);
      setNewTask('');
    }
  };

  const handleUploadDocument = () => {
    console.log('Upload document clicked');
    // Implementation would handle file upload
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    console.log('Exporting deal data in format:', format);
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="ml-3 text-white/70">Loading deal details...</span>
        </div>
    );
  }

  if (!deal) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Deal Not Found</h2>
            <p className="text-white/70 mb-4">The deal you're looking for doesn't exist.</p>
            <BrandButton onClick={() => navigate('/deals')}>
              Back to Deals
            </BrandButton>
          </div>
        </div>
    );
  }

  const stageConfig = getStageConfig(deal.stage);

  return (
      <div className="min-h-screen">
        {/* Header - Matching Leads Management Design */}
        <div className="px-8 py-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BrandButton
                variant="ghost"
                onClick={() => navigate('/deals')}
                className="p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </BrandButton>
              
              <div className="flex items-center space-x-3">
                {getPriorityIcon(deal.priority)}
                <div>
                  <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#ff6b6b] via-[#ffd93d] to-[#6bcf7f] bg-clip-text text-transparent">{deal.title}</h1>
                  <div className="flex items-center space-x-3">
                    <BrandBadge variant="secondary" size="sm">
                      {stageConfig?.label}
                    </BrandBadge>
                    <BrandBadge variant={deal.probability > 75 ? "success" : "warning"} size="sm">
                      {deal.probability}%
                    </BrandBadge>
                    <span className="text-lg font-bold text-green-400">
                      {formatCurrency(deal.value)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center space-x-2">
              <BrandButton
                variant="secondary"
                size="sm"
                onClick={() => setShowComposeEmail(true)}
                className="flex items-center space-x-2"
              >
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </BrandButton>
              <BrandButton
                variant="secondary"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Phone className="w-4 h-4" />
                <span>Call</span>
              </BrandButton>
              <BrandButton
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/portal/organizations/${deal.organization?.id}`)}
                className="flex items-center space-x-2"
              >
                <Globe className="w-4 h-4" />
                <span>Portal</span>
              </BrandButton>
              <BrandButton
                variant="secondary"
                size="sm"
                onClick={() => handleExport('pdf')}
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </BrandButton>
              <BrandButton
                variant="primary"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </BrandButton>
            </div>
          </div>
        </div>

        {/* Quick Links - Close to Header */}
        <div className="px-8 py-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Quick Links</h3>
            <div className="flex items-center space-x-3">
              <BrandButton
                variant="secondary"
                size="sm"
                onClick={() => navigate('/quotes/create')}
                className="flex items-center space-x-2"
              >
                <Quote className="w-4 h-4" />
                <span>Create Quote</span>
              </BrandButton>
              <BrandButton
                variant="secondary"
                size="sm"
                onClick={() => navigate('/orders/create')}
                className="flex items-center space-x-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Create Order</span>
              </BrandButton>
              <BrandButton
                variant="secondary"
                size="sm"
                onClick={() => navigate('/invoices/create')}
                className="flex items-center space-x-2"
              >
                <Receipt className="w-4 h-4" />
                <span>Create Invoice</span>
              </BrandButton>
              <BrandButton
                variant="secondary"
                size="sm"
                onClick={() => navigate('/contracts/create')}
                className="flex items-center space-x-2"
              >
                <FileContract className="w-4 h-4" />
                <span>Create Contract</span>
              </BrandButton>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content - 3 columns */}
            <div className="lg:col-span-3 space-y-6">
              {/* Stage Progress Bar */}
              <BrandCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Deal Progress</h3>
                  <span className="text-white/60 text-sm">{getProgressPercentage().toFixed(0)}% Complete</span>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="relative">
                    <div className="w-full bg-white/10 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${getProgressPercentage()}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-3">
                      {PIPELINE_STAGES.map((stage, index) => {
                        const isActive = stage.id === deal.stage;
                        const isPassed = getCurrentStageIndex() > index;
                        
                        return (
                          <div key={stage.id} className="flex flex-col items-center space-y-1">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isActive 
                                ? 'bg-blue-500 text-white' 
                                : isPassed 
                                ? 'bg-green-500 text-white'
                                : 'bg-white/20 text-white/60'
                            }`}>
                              {isPassed ? <CheckCircle className="w-4 h-4" /> : index + 1}
                            </div>
                            <span className={`text-xs font-medium ${
                              isActive ? 'text-white' : isPassed ? 'text-green-400' : 'text-white/60'
                            }`}>
                              {stage.label}
                            </span>
                            {isActive && (
                              <span className="text-xs text-white/50">16 days</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </BrandCard>

              {/* Navigation Tabs */}
              <div className="flex space-x-1 bg-white/5 rounded-lg p-1 overflow-x-auto">
                {[
                  { id: 'overview', label: 'Overview', icon: BarChart3 },
                  { id: 'emails', label: 'Emails', icon: Mail, count: emails.filter(e => !e.read).length },
                  { id: 'tasks', label: 'Tasks', icon: ClipboardList, count: tasks.filter(t => t.status !== 'completed').length },
                  { id: 'documents', label: 'Documents', icon: FileText, count: documents.length },
                  { id: 'automations', label: 'Automations', icon: Workflow, count: automations.filter(a => a.status === 'active').length },
                  { id: 'timeline', label: 'Timeline', icon: Activity },
                  { id: 'notes', label: 'Notes', icon: MessageSquare }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all flex-shrink-0 ${
                      activeTab === tab.id
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && tab.count > 0 && (
                      <BrandBadge variant="error" size="sm">
                        {tab.count}
                      </BrandBadge>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Deal Information - Enhanced */}
                  <BrandCard className="p-6">
                    <h3 className="text-xl font-bold text-white mb-6">Deal Information</h3>
                    
                    {/* Description */}
                    <div className="mb-6">
                      <label className="text-white/60 text-sm font-medium">Description</label>
                      <p className="text-white/80 mt-2 leading-relaxed">{deal.description}</p>
                    </div>
                    
                    {/* Main Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="text-white/60 text-sm font-medium">Expected Close</label>
                        <div className="flex items-center space-x-2 mt-2">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          <span className="text-white font-medium">
                            {deal.expected_close_date?.toLocaleDateString() || '04/09/2025'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-white/60 text-sm font-medium">Expected Value</label>
                        <div className="flex items-center space-x-2 mt-2">
                          <DollarSign className="w-4 h-4 text-green-400" />
                          <span className="text-white font-bold text-lg">
                            {formatCurrency(deal.value)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-white/60 text-sm font-medium">Deal Owner</label>
                        <div className="flex items-center space-x-2 mt-2">
                          <User className="w-4 h-4 text-purple-400" />
                          <span className="text-white font-medium">John Smith</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-white/60 text-sm font-medium">Probability</label>
                        <div className="flex items-center space-x-2 mt-2">
                          <Target className="w-4 h-4 text-yellow-400" />
                          <span className="text-white font-medium">{deal.probability}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    {deal.tags && deal.tags.length > 0 && (
                      <div className="mb-4">
                        <label className="text-white/60 text-sm font-medium">Tags</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {deal.tags.map((tag, index) => (
                            <BrandBadge key={index} variant="secondary" size="sm">
                              {tag}
                            </BrandBadge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Additional Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
                      <div>
                        <label className="text-white/60 text-sm font-medium">Created</label>
                        <p className="text-white/80 mt-1">{new Date(deal.created_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <label className="text-white/60 text-sm font-medium">Last Updated</label>
                        <p className="text-white/80 mt-1">{new Date(deal.updated_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </BrandCard>

                  {/* Related CRM Items */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <BrandCard className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-semibold">Quotes</h4>
                        <BrandButton
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate('/quotes')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </BrandButton>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-white/70 text-sm">QUO-2025-001</span>
                          <span className="text-green-400 text-sm">$150,000</span>
                        </div>
                        <BrandBadge variant="success" size="sm">Sent</BrandBadge>
                      </div>
                    </BrandCard>

                    <BrandCard className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-semibold">Orders</h4>
                        <BrandButton
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate('/orders')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </BrandButton>
                      </div>
                      <div className="space-y-2">
                        <span className="text-white/60 text-sm">No orders yet</span>
                      </div>
                    </BrandCard>

                    <BrandCard className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-semibold">Invoices</h4>
                        <BrandButton
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate('/invoices')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </BrandButton>
                      </div>
                      <div className="space-y-2">
                        <span className="text-white/60 text-sm">No invoices yet</span>
                      </div>
                    </BrandCard>
                  </div>
                </motion.div>
              )}

              {activeTab === 'emails' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Email Communications</h3>
                    <BrandButton
                      variant="primary"
                      onClick={() => setShowComposeEmail(true)}
                      className="flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Compose</span>
                    </BrandButton>
                  </div>

                  {emails.map((email) => (
                    <BrandCard key={email.id} className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${email.read ? 'bg-white/30' : 'bg-blue-500'}`}></div>
                          <h4 className="text-white font-semibold">{email.subject}</h4>
                        </div>
                        <span className="text-white/60 text-sm">{email.date.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-white/70 text-sm">From: {email.from}</span>
                        <span className="text-white/70 text-sm">To: {email.to}</span>
                      </div>
                      <p className="text-white/80 mb-3">{email.body}</p>
                      {email.attachments.length > 0 && (
                        <div className="flex items-center space-x-2 mb-3">
                          <Paperclip className="w-4 h-4 text-white/60" />
                          <span className="text-white/60 text-sm">{email.attachments.join(', ')}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <BrandButton variant="secondary" size="sm">Reply</BrandButton>
                        <BrandButton variant="ghost" size="sm">Forward</BrandButton>
                        <BrandButton variant="ghost" size="sm">Archive</BrandButton>
                      </div>
                    </BrandCard>
                  ))}
                </motion.div>
              )}

              {activeTab === 'tasks' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Tasks & Activities</h3>
                    <div className="flex items-center space-x-2">
                      <BrandInput
                        placeholder="Add new task..."
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        className="w-64"
                      />
                      <BrandButton
                        variant="primary"
                        onClick={handleAddTask}
                        disabled={!newTask.trim()}
                      >
                        <Plus className="w-4 h-4" />
                      </BrandButton>
                    </div>
                  </div>

                  {tasks.map((task) => (
                    <BrandCard key={task.id} className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded border-2 ${
                            task.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-white/30'
                          }`}>
                            {task.status === 'completed' && <CheckCircle className="w-3 h-3 text-white" />}
                          </div>
                          <h4 className="text-white font-semibold">{task.title}</h4>
                          <BrandBadge 
                            variant={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'secondary'}
                            size="sm"
                          >
                            {task.priority}
                          </BrandBadge>
                        </div>
                        <span className="text-white/60 text-sm">{task.due_date.toLocaleDateString()}</span>
                      </div>
                      <p className="text-white/80 mb-3">{task.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-sm">Assigned to: {task.assigned_to}</span>
                        <div className="flex items-center space-x-2">
                          <BrandButton variant="secondary" size="sm">Edit</BrandButton>
                          <BrandButton variant="ghost" size="sm">Complete</BrandButton>
                        </div>
                      </div>
                    </BrandCard>
                  ))}
                </motion.div>
              )}

              {activeTab === 'documents' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Documents & Files</h3>
                    <BrandButton
                      variant="primary"
                      onClick={handleUploadDocument}
                      className="flex items-center space-x-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload</span>
                    </BrandButton>
                  </div>

                  {documents.map((doc) => (
                    <BrandCard key={doc.id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getDocumentIcon(doc.type)}
                          <div>
                            <h4 className="text-white font-semibold">{doc.name}</h4>
                            <div className="flex items-center space-x-2 text-sm text-white/60">
                              <span>{doc.size}</span>
                              <span>•</span>
                              <span>{doc.date.toLocaleDateString()}</span>
                              {doc.amount && (
                                <>
                                  <span>•</span>
                                  <span className="text-green-400">{formatCurrency(doc.amount)}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <BrandBadge variant="secondary" size="sm">{doc.status}</BrandBadge>
                          <BrandButton
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(doc.url, '_blank')}
                          >
                            <Eye className="w-4 h-4" />
                          </BrandButton>
                          <BrandButton
                            variant="ghost"
                            size="sm"
                          >
                            <Download className="w-4 h-4" />
                          </BrandButton>
                        </div>
                      </div>
                    </BrandCard>
                  ))}
                </motion.div>
              )}

              {activeTab === 'automations' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-xl font-bold text-white">Active Automations</h3>
                  {automations.map((automation) => (
                    <BrandCard key={automation.id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-white font-medium">{automation.name}</h4>
                            <BrandBadge 
                              variant={automation.status === 'active' ? 'success' : 'secondary'}
                            >
                              {automation.status}
                            </BrandBadge>
                          </div>
                          <p className="text-white/60 text-sm mb-2">{automation.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-white/50">
                            <span>Triggered {automation.triggerCount} times</span>
                            {automation.lastTriggered && (
                              <span>Last: {automation.lastTriggered.toLocaleDateString()}</span>
                            )}
                            {automation.nextRun && (
                              <span>Next: {automation.nextRun.toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <BrandButton
                            variant="ghost"
                            size="sm"
                            className="flex items-center space-x-1"
                          >
                            {automation.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </BrandButton>
                          <BrandButton
                            variant="ghost"
                            size="sm"
                          >
                            <Settings className="w-4 h-4" />
                          </BrandButton>
                        </div>
                      </div>
                    </BrandCard>
                  ))}
                </motion.div>
              )}

              {activeTab === 'notes' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <BrandCard className="p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Add Note</h3>
                    <div className="space-y-4">
                      <BrandTextarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add a note... Use @username to mention team members"
                        rows={4}
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <AtSign className="w-4 h-4 text-white/60" />
                            <span className="text-white/60 text-sm">Mention users with @</span>
                          </div>
                          <BrandButton
                            variant="secondary"
                            size="sm"
                            className="flex items-center space-x-2"
                          >
                            <UserPlus className="w-4 h-4" />
                            <span>Add Follower</span>
                          </BrandButton>
                        </div>
                        <BrandButton
                          disabled={!newNote.trim()}
                          className="flex items-center space-x-2"
                        >
                          <Send className="w-4 h-4" />
                          <span>Add Note</span>
                        </BrandButton>
                      </div>
                    </div>
                  </BrandCard>
                </motion.div>
              )}
            </div>

            {/* Sidebar - 1 column */}
            <div className="space-y-6">
              {/* Contact Information */}
              <BrandCard className="p-6">
                <h3 className="text-lg font-bold text-white mb-4">Contact Information</h3>
                <div className="space-y-4">
                  {deal.contact && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/60 text-sm">Primary Contact</span>
                        <BrandButton
                          variant="ghost"
                          size="sm"
                          className="p-1"
                          onClick={() => navigate(`/contacts/${deal.contact?.id}`)}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </BrandButton>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-white/60" />
                          <span className="text-white font-medium">{deal.contact.name}</span>
                        </div>
                        {deal.contact.email && (
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-white/60" />
                            <span className="text-white/80 text-sm">{deal.contact.email}</span>
                          </div>
                        )}
                        {deal.contact.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-white/60" />
                            <span className="text-white/80 text-sm">{deal.contact.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {deal.organization && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/60 text-sm">Organization</span>
                        <div className="flex items-center space-x-1">
                          <BrandButton
                            variant="ghost"
                            size="sm"
                            className="p-1"
                            onClick={() => navigate(`/organizations/${deal.organization?.id}`)}
                            title="View Organization"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </BrandButton>
                          <BrandButton
                            variant="ghost"
                            size="sm"
                            className="p-1"
                            onClick={() => navigate(`/portal/organizations/${deal.organization?.id}`)}
                            title="Open Customer Portal"
                          >
                            <Globe className="w-3 h-3" />
                          </BrandButton>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-white/60" />
                        <span className="text-white font-medium">{deal.organization.name}</span>
                      </div>
                    </div>
                  )}
                </div>
              </BrandCard>

              {/* Deal Statistics */}
              <BrandCard className="p-6">
                <h3 className="text-lg font-bold text-white mb-4">Statistics</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">Expected Value</span>
                    <span className="text-white font-bold">
                      {formatCurrency(deal.value * (deal.probability / 100))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">Days in Pipeline</span>
                    <span className="text-white">30 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">Current Stage Duration</span>
                    <span className="text-white">16 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">Next Follow-up</span>
                    <span className="text-white">Tomorrow</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">Deal Score</span>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-white">8.5/10</span>
                    </div>
                  </div>
                </div>
              </BrandCard>

              {/* Routing Alert */}
              <BrandCard className="p-6 border border-red-500/30">
                <div className="flex items-center space-x-2 mb-3">
                  <Bell className="w-5 h-5 text-red-400" />
                  <h3 className="text-lg font-bold text-red-400">Alert</h3>
                </div>
                <p className="text-white/80 text-sm mb-4">
                  Deal in Negotiation stage for 16 days (exceeds 14-day threshold).
                </p>
                <div className="flex space-x-2">
                  <BrandButton
                    variant="secondary"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Escalate</span>
                  </BrandButton>
                  <BrandButton
                    variant="ghost"
                    size="sm"
                  >
                    Dismiss
                  </BrandButton>
                </div>
              </BrandCard>


            </div>
          </div>
        </div>

        {/* Email Compose Modal */}
        {showComposeEmail && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl w-full mx-4"
            >
              <BrandCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Compose Email</h3>
                  <BrandButton
                    variant="ghost"
                    onClick={() => setShowComposeEmail(false)}
                  >
                    <XCircle className="w-5 h-5" />
                  </BrandButton>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-white/70 text-sm">To:</label>
                    <BrandInput
                      value={deal.contact?.email || ''}
                      readOnly
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-white/70 text-sm">Subject:</label>
                    <BrandInput
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Email subject..."
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-white/70 text-sm">Message:</label>
                    <BrandTextarea
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      placeholder="Type your message..."
                      rows={6}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BrandButton
                        variant="secondary"
                        size="sm"
                      >
                        <Paperclip className="w-4 h-4 mr-2" />
                        Attach File
                      </BrandButton>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BrandButton
                        variant="secondary"
                        onClick={() => setShowComposeEmail(false)}
                      >
                        Cancel
                      </BrandButton>
                      <BrandButton
                        variant="primary"
                        onClick={handleSendEmail}
                        disabled={!emailSubject.trim() || !emailBody.trim()}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send
                      </BrandButton>
                    </div>
                  </div>
                </div>
              </BrandCard>
            </motion.div>
          </div>
        )}
      </div>
  );
};

export default DealDetailComprehensive;
