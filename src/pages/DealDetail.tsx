import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Edit,
  Trash2,
  DollarSign,
  Target,
  Calendar,
  User,
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  Clock,
  Star,
  Tag,
  FileText,
  Activity,
  MessageSquare,
  Users,
  Bot,
  AlertTriangle,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

import {
  BrandBackground,
  BrandPageLayout,
  BrandCard,
  BrandButton,
  BrandBadge,
  BrandStatCard
} from '../contexts/BrandDesignContext';

import { Deal, useDeals, PIPELINE_STAGES } from '../hooks/useDeals';
import { BrandedDealModal } from '../components/deals/BrandedDealModal';

const DealDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { deals, updateDeal, deleteDeal, loading } = useDeals();
  
  const [deal, setDeal] = useState<Deal | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'notes' | 'files'>('overview');

  // Find the deal
  useEffect(() => {
    if (id && deals.length > 0) {
      const foundDeal = deals.find(d => d.id === id);
      setDeal(foundDeal || null);
    }
  }, [id, deals]);

  const handleSaveDeal = async (data: any) => {
    if (!deal) return false;
    const success = await updateDeal(deal.id, data);
    if (success) {
      // Refresh deal data
      const updatedDeal = deals.find(d => d.id === deal.id);
      if (updatedDeal) setDeal(updatedDeal);
    }
    return success;
  };

  const handleDeleteDeal = async () => {
    if (!deal) return;
    const success = await deleteDeal(deal.id);
    if (success) {
      navigate('/deals');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: deal?.currency || 'USD',
    }).format(amount);
  };

  const getStageConfig = (stageId: string) => {
    return PIPELINE_STAGES.find(stage => stage.id === stageId);
  };

  const getPriorityBadge = (priority: string) => {
    const config = {
      high: { variant: 'red' as const, icon: AlertTriangle, label: 'High Priority' },
      medium: { variant: 'warning' as const, icon: Clock, label: 'Medium Priority' },
      low: { variant: 'secondary' as const, icon: TrendingUp, label: 'Low Priority' }
    };
    
    const { variant, icon: IconComponent, label } = config[priority as keyof typeof config] || config.medium;
    
    return (
      <BrandBadge variant={variant} className="flex items-center space-x-1">
        <IconComponent className="w-3 h-3" />
        <span>{label}</span>
      </BrandBadge>
    );
  };

  const getStatusBadge = (status: string) => {
    const config = {
      open: { variant: 'info' as const, icon: Clock, label: 'Open' },
      won: { variant: 'success' as const, icon: CheckCircle, label: 'Won' },
      lost: { variant: 'red' as const, icon: AlertTriangle, label: 'Lost' }
    };
    
    const { variant, icon: IconComponent, label } = config[status as keyof typeof config] || config.open;
    
    return (
      <BrandBadge variant={variant} className="flex items-center space-x-1">
        <IconComponent className="w-3 h-3" />
        <span>{label}</span>
      </BrandBadge>
    );
  };

  if (loading) {
    return (
      <BrandBackground>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="ml-3 text-white/70">Loading deal...</span>
        </div>
      </BrandBackground>
    );
  }

  if (!deal) {
    return (
      <BrandBackground>
        <BrandPageLayout
          title="Deal Not Found"
          subtitle="The requested deal could not be found"
          actions={
            <BrandButton variant="secondary" onClick={() => navigate('/deals')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Deals
            </BrandButton>
          }
        >
          <BrandCard className="p-12 text-center">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Deal Not Found</h3>
            <p className="text-white/60 mb-6">
              The deal you're looking for doesn't exist or has been deleted.
            </p>
            <BrandButton variant="primary" onClick={() => navigate('/deals')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Deals
            </BrandButton>
          </BrandCard>
        </BrandPageLayout>
      </BrandBackground>
    );
  }

  const stageConfig = getStageConfig(deal.stage);

  return (
    <BrandBackground>
      <BrandPageLayout
        title={deal.title}
        subtitle={`Deal in ${stageConfig?.label || 'Unknown'} stage`}
        actions={
          <div className="flex items-center space-x-3">
            <BrandButton
              variant="ghost"
              onClick={() => {/* Handle ask AI */}}
              className="flex items-center space-x-2"
            >
              <Bot className="w-4 h-4" />
              <span>Ask AI</span>
            </BrandButton>
            <BrandButton
              variant="secondary"
              onClick={() => setShowEditModal(true)}
              className="flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </BrandButton>
            <BrandButton
              variant="secondary"
              onClick={() => navigate('/deals')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </BrandButton>
          </div>
        }
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <BrandStatCard
              icon={<DollarSign className="w-6 h-6 text-green-400" />}
              title="Deal Value"
              value={formatCurrency(deal.value)}
              trend={`${deal.currency} currency`}
              borderGradient="green"
            />
            <BrandStatCard
              icon={<Target className="w-6 h-6 text-blue-400" />}
              title="Probability"
              value={`${deal.probability}%`}
              trend={stageConfig?.label || 'Unknown Stage'}
              borderGradient="blue"
            />
            <BrandStatCard
              icon={<TrendingUp className="w-6 h-6 text-purple-400" />}
              title="Expected Value"
              value={formatCurrency(deal.value * (deal.probability / 100))}
              trend="Weighted value"
              borderGradient="purple"
            />
            <BrandStatCard
              icon={<Calendar className="w-6 h-6 text-yellow-400" />}
              title="Days to Close"
              value={deal.expected_close_date ? 
                Math.max(0, Math.ceil((new Date(deal.expected_close_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))).toString() :
                '—'
              }
              trend={deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString() : 'No date set'}
              borderGradient="yellow"
            />
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-black/20 p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Overview', icon: FileText },
              { id: 'activity', label: 'Activity', icon: Activity },
              { id: 'notes', label: 'Notes', icon: MessageSquare },
              { id: 'files', label: 'Files', icon: Users }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Deal Information */}
              <BrandCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  <span>Deal Information</span>
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-1">Status</label>
                      {getStatusBadge(deal.status)}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-1">Priority</label>
                      {getPriorityBadge(deal.priority || 'medium')}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-1">Stage</label>
                    <BrandBadge 
                      variant="primary" 
                      style={{ backgroundColor: `${stageConfig?.color}20`, color: stageConfig?.color }}
                      className="text-sm"
                    >
                      {stageConfig?.label || 'Unknown'}
                    </BrandBadge>
                  </div>
                  
                  {deal.description && (
                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-1">Description</label>
                      <p className="text-white">{deal.description}</p>
                    </div>
                  )}
                  
                  {deal.tags && deal.tags.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-1">Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {deal.tags.map((tag, index) => (
                          <BrandBadge key={index} variant="secondary" className="flex items-center space-x-1">
                            <Tag className="w-3 h-3" />
                            <span>{tag}</span>
                          </BrandBadge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="block text-white/60">Created</label>
                      <p className="text-white">{new Date(deal.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="block text-white/60">Last Updated</label>
                      <p className="text-white">{new Date(deal.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </BrandCard>

              {/* Contact & Organization */}
              <BrandCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Users className="w-5 h-5 text-green-400" />
                  <span>Customer Information</span>
                </h3>
                
                <div className="space-y-6">
                  {deal.contact && (
                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-2">Contact</label>
                      <div className="flex items-start space-x-3 p-4 bg-black/20 rounded-lg">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{deal.contact.name}</h4>
                          {deal.contact.email && (
                            <div className="flex items-center space-x-2 mt-1">
                              <Mail className="w-4 h-4 text-white/60" />
                              <span className="text-sm text-white/80">{deal.contact.email}</span>
                            </div>
                          )}
                          {deal.contact.phone && (
                            <div className="flex items-center space-x-2 mt-1">
                              <Phone className="w-4 h-4 text-white/60" />
                              <span className="text-sm text-white/80">{deal.contact.phone}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          <BrandButton variant="ghost" size="sm" className="p-2">
                            <Phone className="w-4 h-4" />
                          </BrandButton>
                          <BrandButton variant="ghost" size="sm" className="p-2">
                            <Mail className="w-4 h-4" />
                          </BrandButton>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {deal.organization && (
                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-2">Organization</label>
                      <div className="flex items-start space-x-3 p-4 bg-black/20 rounded-lg">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{deal.organization.name}</h4>
                          {deal.organization.email && (
                            <div className="flex items-center space-x-2 mt-1">
                              <Mail className="w-4 h-4 text-white/60" />
                              <span className="text-sm text-white/80">{deal.organization.email}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          <BrandButton variant="ghost" size="sm" className="p-2">
                            <Globe className="w-4 h-4" />
                          </BrandButton>
                          <BrandButton variant="ghost" size="sm" className="p-2">
                            <Mail className="w-4 h-4" />
                          </BrandButton>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {!deal.contact && !deal.organization && (
                    <div className="text-center py-8 text-white/40">
                      <Users className="w-8 h-8 mx-auto mb-2" />
                      <p>No customer information available</p>
                    </div>
                  )}
                </div>
              </BrandCard>
            </div>
          )}

          {activeTab === 'activity' && (
            <BrandCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="text-center py-8 text-white/60">
                <Activity className="w-8 h-8 mx-auto mb-2" />
                <p>No recent activity recorded</p>
              </div>
            </BrandCard>
          )}

          {activeTab === 'notes' && (
            <BrandCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Notes</h3>
              {deal.notes ? (
                <div className="bg-black/20 p-4 rounded-lg">
                  <p className="text-white">{deal.notes}</p>
                </div>
              ) : (
                <div className="text-center py-8 text-white/60">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                  <p>No notes available</p>
                </div>
              )}
            </BrandCard>
          )}

          {activeTab === 'files' && (
            <BrandCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Files & Documents</h3>
              <div className="text-center py-8 text-white/60">
                <FileText className="w-8 h-8 mx-auto mb-2" />
                <p>No files uploaded</p>
              </div>
            </BrandCard>
          )}

          {/* Danger Zone */}
          <BrandCard className="p-6 border-red-500/30">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span>Danger Zone</span>
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Delete this deal</p>
                <p className="text-white/60 text-sm">This action cannot be undone</p>
              </div>
              <BrandButton
                variant="secondary"
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-600/20 border-red-500/30 text-red-400 hover:bg-red-600/30"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Deal
              </BrandButton>
            </div>
          </BrandCard>
        </motion.div>

        {/* Edit Modal */}
        <BrandedDealModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          deal={deal}
          mode="edit"
          onSave={handleSaveDeal}
        />

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteConfirm(false)}></div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative z-10 w-full max-w-md"
            >
              <BrandCard className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                  <span>Delete Deal</span>
                </h3>
                <p className="text-white/70 mb-6">
                  Are you sure you want to delete "{deal.title}"? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <BrandButton
                    variant="secondary"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </BrandButton>
                  <BrandButton
                    variant="primary"
                    onClick={handleDeleteDeal}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Deal
                  </BrandButton>
                </div>
              </BrandCard>
            </motion.div>
          </div>
        )}
      </BrandPageLayout>
    </BrandBackground>
  );
};

export default DealDetail;