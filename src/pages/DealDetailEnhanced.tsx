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
  Activity
} from 'lucide-react';

import {
  BrandBackground,
  BrandCard,
  BrandButton,
  BrandInput,
  BrandBadge,
  BrandTextarea
} from '../contexts/BrandDesignContext';

import { Deal, PIPELINE_STAGES } from '../hooks/useDeals';

// Mock data structure for deal timeline
interface TimelineEntry {
  id: string;
  type: 'stage_change' | 'note' | 'email' | 'call' | 'document' | 'automation';
  title: string;
  description: string;
  user: string;
  timestamp: Date;
  duration?: number; // days in stage
  metadata?: any;
}

// Mock data structure for related documents
interface RelatedDocument {
  id: string;
  type: 'quote' | 'order' | 'invoice' | 'contract' | 'proforma';
  number: string;
  title: string;
  amount: number;
  status: string;
  date: Date;
  url: string;
}

// Mock data structure for automations
interface Automation {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'disabled';
  triggerCount: number;
  lastTriggered?: Date;
}

const DealDetailEnhanced: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // States
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'documents' | 'automations' | 'notes'>('overview');
  const [newNote, setNewNote] = useState('');
  const [mentionUser, setMentionUser] = useState('');
  const [showMentions, setShowMentions] = useState(false);

  // Mock data
  const [timeline] = useState<TimelineEntry[]>([
    {
      id: '1',
      type: 'stage_change',
      title: 'Deal moved to Negotiation',
      description: 'Deal progressed from Proposal to Negotiation stage',
      user: 'John Smith',
      timestamp: new Date(Date.now() - 86400000 * 2),
      duration: 14
    },
    {
      id: '2',
      type: 'email',
      title: 'Email sent: Proposal Follow-up',
      description: 'Sent follow-up email regarding the pricing proposal',
      user: 'Sarah Johnson',
      timestamp: new Date(Date.now() - 86400000 * 3),
    },
    {
      id: '3',
      type: 'call',
      title: 'Call completed: 45 minutes',
      description: 'Discussed technical requirements and implementation timeline',
      user: 'Mike Chen',
      timestamp: new Date(Date.now() - 86400000 * 5),
    }
  ]);

  const [relatedDocs] = useState<RelatedDocument[]>([
    {
      id: '1',
      type: 'quote',
      number: 'QUO-2025-001',
      title: 'Enterprise CRM Implementation Quote',
      amount: 150000,
      status: 'Sent',
      date: new Date(Date.now() - 86400000 * 10),
      url: '/quotes/1'
    },
    {
      id: '2',
      type: 'contract',
      number: 'CON-2025-001',
      title: 'Service Agreement Draft',
      amount: 150000,
      status: 'Draft',
      date: new Date(Date.now() - 86400000 * 5),
      url: '/contracts/1'
    }
  ]);

  const [automations] = useState<Automation[]>([
    {
      id: '1',
      name: 'Follow-up Email Sequence',
      description: 'Automated email sequence for proposal follow-ups',
      status: 'active',
      triggerCount: 3,
      lastTriggered: new Date(Date.now() - 86400000 * 1)
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
        return <Quote className="w-4 h-4 text-blue-400" />;
      case 'order':
        return <ShoppingCart className="w-4 h-4 text-green-400" />;
      case 'invoice':
        return <Receipt className="w-4 h-4 text-purple-400" />;
      case 'contract':
        return <FileContract className="w-4 h-4 text-yellow-400" />;
      case 'proforma':
        return <FileText className="w-4 h-4 text-orange-400" />;
      default:
        return <FileText className="w-4 h-4 text-white/60" />;
    }
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      console.log('Adding note:', newNote);
      setNewNote('');
    }
  };

  const handleExport = (format: 'excel' | 'pdf' | 'csv') => {
    console.log('Exporting deal data in format:', format);
    // Implementation would go here
  };

  const toggleAutomation = (automationId: string) => {
    console.log('Toggling automation:', automationId);
    // Implementation would go here
  };

  if (loading) {
    return (
      <BrandBackground>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="ml-3 text-white/70">Loading deal details...</span>
        </div>
      </BrandBackground>
    );
  }

  if (!deal) {
    return (
      <BrandBackground>
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
      </BrandBackground>
    );
  }

  const stageConfig = getStageConfig(deal.stage);

  return (
    <BrandBackground>
      <div className="min-h-screen">
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BrandButton
                variant="ghost"
                onClick={() => navigate('/deals')}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </BrandButton>
              
              <div className="flex items-center space-x-3">
                {getPriorityIcon(deal.priority)}
                <div>
                  <h1 className="text-3xl font-bold text-white">{deal.title}</h1>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: stageConfig?.color || '#6b7280' }}
                      ></div>
                      <span className="text-white/70">{stageConfig?.label}</span>
                    </div>
                    <BrandBadge variant="secondary">
                      {deal.probability}% probability
                    </BrandBadge>
                    <span className="text-2xl font-bold text-green-400">
                      {formatCurrency(deal.value)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Export Options */}
              <div className="flex items-center space-x-2">
                <BrandButton
                  variant="secondary"
                  size="sm"
                  onClick={() => handleExport('excel')}
                  className="flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </BrandButton>
                <BrandButton
                  variant="secondary"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Import</span>
                </BrandButton>
              </div>

              {/* Quick Actions */}
              <BrandButton
                variant="secondary"
                size="sm"
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
                variant="primary"
                className="flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Deal</span>
              </BrandButton>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Navigation Tabs */}
              <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
                {[
                  { id: 'overview', label: 'Overview', icon: BarChart3 },
                  { id: 'timeline', label: 'Timeline', icon: Activity },
                  { id: 'documents', label: 'Documents', icon: FileText },
                  { id: 'automations', label: 'Automations', icon: Settings },
                  { id: 'notes', label: 'Notes', icon: MessageSquare }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
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
                  {/* Deal Overview */}
                  <BrandCard className="p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Deal Overview</h3>
                    <div className="space-y-4">
                      <p className="text-white/80 leading-relaxed">{deal.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-white/60 text-sm">Expected Close</label>
                          <div className="flex items-center space-x-2 mt-1">
                            <Calendar className="w-4 h-4 text-white/60" />
                            <span className="text-white">
                              {deal.expected_close_date?.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="text-white/60 text-sm">Deal Owner</label>
                          <div className="flex items-center space-x-2 mt-1">
                            <User className="w-4 h-4 text-white/60" />
                            <span className="text-white">John Smith</span>
                          </div>
                        </div>
                      </div>

                      {deal.tags && deal.tags.length > 0 && (
                        <div>
                          <label className="text-white/60 text-sm">Tags</label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {deal.tags.map((tag, index) => (
                              <BrandBadge key={index} variant="secondary">
                                {tag}
                              </BrandBadge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </BrandCard>

                  {/* Progress Timeline */}
                  <BrandCard className="p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Stage Progress</h3>
                    <div className="space-y-4">
                      {PIPELINE_STAGES.map((stage, index) => {
                        const isActive = stage.id === deal.stage;
                        const isPassed = PIPELINE_STAGES.findIndex(s => s.id === deal.stage) > index;
                        
                        return (
                          <div key={stage.id} className="flex items-center space-x-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                              isActive 
                                ? 'bg-blue-500 border-blue-500 text-white' 
                                : isPassed 
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'bg-white/10 border-white/20 text-white/60'
                            }`}>
                              {isPassed ? <CheckCircle className="w-4 h-4" /> : index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className={`font-medium ${
                                  isActive ? 'text-white' : isPassed ? 'text-green-400' : 'text-white/60'
                                }`}>
                                  {stage.label}
                                </span>
                                {isActive && (
                                  <span className="text-sm text-white/60">
                                    16 days in stage
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </BrandCard>
                </motion.div>
              )}

              {activeTab === 'documents' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <BrandCard className="p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Related Documents</h3>
                    <div className="space-y-3">
                      {relatedDocs.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getDocumentIcon(doc.type)}
                            <div>
                              <h4 className="text-white font-medium">{doc.title}</h4>
                              <p className="text-white/60 text-sm">{doc.number} • {formatCurrency(doc.amount)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <BrandBadge variant="secondary">{doc.status}</BrandBadge>
                            <BrandButton
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(doc.url)}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </BrandButton>
                          </div>
                        </div>
                      ))}
                    </div>
                  </BrandCard>
                </motion.div>
              )}

              {activeTab === 'automations' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <BrandCard className="p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Active Automations</h3>
                    <div className="space-y-4">
                      {automations.map((automation) => (
                        <div key={automation.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
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
                            <p className="text-white/50 text-xs">
                              Triggered {automation.triggerCount} times • Last: {automation.lastTriggered?.toLocaleDateString()}
                            </p>
                          </div>
                          <BrandButton
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleAutomation(automation.id)}
                            className="ml-4"
                          >
                            {automation.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </BrandButton>
                        </div>
                      ))}
                    </div>
                  </BrandCard>
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
                        <div className="flex items-center space-x-2">
                          <AtSign className="w-4 h-4 text-white/60" />
                          <span className="text-white/60 text-sm">Mention users with @</span>
                        </div>
                        <BrandButton
                          onClick={handleAddNote}
                          disabled={!newNote.trim()}
                        >
                          Add Note
                        </BrandButton>
                      </div>
                    </div>
                  </BrandCard>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Information */}
              <BrandCard className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Contact Information</h3>
                <div className="space-y-4">
                  {deal.contact && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/60 text-sm">Primary Contact</span>
                        <BrandButton
                          variant="ghost"
                          size="sm"
                          className="p-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </BrandButton>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-white/60" />
                          <span className="text-white">{deal.contact.name}</span>
                        </div>
                        {deal.contact.email && (
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-white/60" />
                            <span className="text-white/80">{deal.contact.email}</span>
                          </div>
                        )}
                        {deal.contact.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-white/60" />
                            <span className="text-white/80">{deal.contact.phone}</span>
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
                            title="View Customer Portal"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </BrandButton>
                          <BrandButton
                            variant="ghost"
                            size="sm"
                            className="p-1"
                            title="Open Customer Portal"
                          >
                            <Building2 className="w-3 h-3" />
                          </BrandButton>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-white/60" />
                        <span className="text-white">{deal.organization.name}</span>
                      </div>
                    </div>
                  )}
                </div>
              </BrandCard>

              {/* Deal Statistics */}
              <BrandCard className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Deal Statistics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Expected Value</span>
                    <span className="text-white font-bold">
                      {formatCurrency(deal.value * (deal.probability / 100))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Days in Pipeline</span>
                    <span className="text-white">30 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Current Stage Duration</span>
                    <span className="text-white">16 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Next Follow-up</span>
                    <span className="text-white">Tomorrow</span>
                  </div>
                </div>
              </BrandCard>

              {/* Routing Alerts */}
              <BrandCard className="p-6 border border-red-500/30">
                <div className="flex items-center space-x-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <h3 className="text-lg font-bold text-red-400">Routing Alert</h3>
                </div>
                <p className="text-white/80 mb-4">
                  This deal has been in the Negotiation stage for 16 days, which exceeds the recommended 14-day threshold.
                </p>
                <div className="flex items-center space-x-2">
                  <BrandButton
                    variant="secondary"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <RotateCcw className="w-4 h-4" />
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
      </div>
    </BrandBackground>
  );
};

export default DealDetailEnhanced;
