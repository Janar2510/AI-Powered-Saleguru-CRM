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
  Star
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

const DealDetailImproved: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'documents' | 'automations' | 'notes'>('overview');
  const [newNote, setNewNote] = useState('');

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

  const getCurrentStageIndex = () => {
    return PIPELINE_STAGES.findIndex(stage => stage.id === deal?.stage) || 0;
  };

  const getProgressPercentage = () => {
    const currentIndex = getCurrentStageIndex();
    return ((currentIndex + 1) / PIPELINE_STAGES.length) * 100;
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
        {/* Compact Header */}
        <div className="px-6 py-4 border-b border-white/10">
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
                  <h1 className="text-2xl font-bold text-white">{deal.title}</h1>
                  <div className="flex items-center space-x-3 mt-1">
                    <BrandBadge variant="secondary" size="sm">
                      {stageConfig?.label}
                    </BrandBadge>
                    <BrandBadge variant={deal.probability > 75 ? "success" : "warning"} size="sm">
                      {deal.probability}%
                    </BrandBadge>
                    <span className="text-xl font-bold text-green-400">
                      {formatCurrency(deal.value)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
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
                variant="secondary"
                size="sm"
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
                  <BrandCard className="p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Deal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-white/60 text-sm">Description</label>
                        <p className="text-white/80 mt-1">{deal.description}</p>
                      </div>
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
                      <div>
                        <label className="text-white/60 text-sm">Expected Value</label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Target className="w-4 h-4 text-white/60" />
                          <span className="text-white font-bold">
                            {formatCurrency(deal.value * (deal.probability / 100))}
                          </span>
                        </div>
                      </div>
                    </div>

                    {deal.tags && deal.tags.length > 0 && (
                      <div className="mt-4">
                        <label className="text-white/60 text-sm">Tags</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {deal.tags.map((tag, index) => (
                            <BrandBadge key={index} variant="secondary" size="sm">
                              {tag}
                            </BrandBadge>
                          ))}
                        </div>
                      </div>
                    )}
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
                        <BrandButton
                          variant="ghost"
                          size="sm"
                          className="p-1"
                          title="Open Customer Portal"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </BrandButton>
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
      </div>
    </BrandBackground>
  );
};

export default DealDetailImproved;
