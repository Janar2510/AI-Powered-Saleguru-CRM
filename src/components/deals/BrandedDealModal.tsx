import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Save,
  Edit,
  Trash2,
  DollarSign,
  Target,
  Calendar,
  User,
  Building2,
  Tag,
  AlertTriangle,
  TrendingUp,
  Clock,
  Star,
  Phone,
  Mail,
  Globe,
  FileText,
  Activity,
  Users,
  Bot
} from 'lucide-react';

import {
  BrandCard,
  BrandButton,
  BrandInput,
  BrandBadge,
  BrandStatCard
} from '../../contexts/BrandDesignContext';

import { Deal, CreateDealData, UpdateDealData, PIPELINE_STAGES } from '../../hooks/useDeals';
import { useContacts } from '../../hooks/useContacts';
import { BrandDropdown } from '../ui/BrandDropdown';

interface BrandedDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal?: Deal;
  mode: 'create' | 'edit' | 'view';
  onSave: (data: CreateDealData | UpdateDealData) => Promise<boolean>;
  onDelete?: (dealId: string) => Promise<boolean>;
}

export const BrandedDealModal: React.FC<BrandedDealModalProps> = ({
  isOpen,
  onClose,
  deal,
  mode,
  onSave,
  onDelete
}) => {
  const { contacts } = useContacts();
  
  const [activeTab, setActiveTab] = useState<'details' | 'notes' | 'activity'>('details');
  const [isSaving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [formData, setFormData] = useState<CreateDealData | UpdateDealData>({
    title: deal?.title || '',
    description: deal?.description || '',
    value: deal?.value || 0,
    currency: deal?.currency || 'USD',
    probability: deal?.probability || 10,
    stage: deal?.stage || 'new',
    expected_close_date: deal?.expected_close_date || '',
    contact_id: deal?.contact_id || '',
    organization_id: deal?.organization_id || '',
    priority: deal?.priority || 'medium',
    tags: deal?.tags || [],
    notes: deal?.notes || ''
  });

  // Reset form when deal changes
  useEffect(() => {
    if (deal) {
      setFormData({
        title: deal.title,
        description: deal.description || '',
        value: deal.value,
        currency: deal.currency,
        probability: deal.probability,
        stage: deal.stage,
        expected_close_date: deal.expected_close_date || '',
        contact_id: deal.contact_id || '',
        organization_id: deal.organization_id || '',
        priority: deal.priority || 'medium',
        tags: deal.tags || [],
        notes: deal.notes || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        value: 0,
        currency: 'USD',
        probability: 10,
        stage: 'new',
        expected_close_date: '',
        contact_id: '',
        organization_id: '',
        priority: 'medium',
        tags: [],
        notes: ''
      });
    }
  }, [deal]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) return;
    
    setSaving(true);
    try {
      const success = await onSave(formData);
      if (success) {
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deal || !onDelete) return;
    
    const success = await onDelete(deal.id);
    if (success) {
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: formData.currency || 'USD',
    }).format(amount);
  };

  const getStageConfig = (stageId: string) => {
    return PIPELINE_STAGES.find(stage => stage.id === stageId);
  };

  const getPriorityBadge = (priority: string) => {
    const config = {
      high: { variant: 'red' as const, icon: AlertTriangle },
      medium: { variant: 'warning' as const, icon: Clock },
      low: { variant: 'secondary' as const, icon: TrendingUp }
    };
    
    const { variant, icon: IconComponent } = config[priority as keyof typeof config] || config.medium;
    
    return (
      <BrandBadge variant={variant} className="flex items-center space-x-1">
        <IconComponent className="w-3 h-3" />
        <span className="capitalize">{priority}</span>
      </BrandBadge>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        <BrandCard className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <span>
                  {mode === 'create' ? 'Create New Deal' : 
                   mode === 'edit' ? 'Edit Deal' : 'Deal Details'}
                </span>
              </h2>
              <p className="text-white/60 mt-1">
                {mode === 'create' ? 'Add a new deal to your pipeline' :
                 mode === 'edit' ? 'Update deal information' :
                 'View and manage deal details'}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              {mode === 'view' && (
                <>
                  <BrandButton
                    variant="ghost"
                    size="sm"
                    onClick={() => {/* Handle ask AI */}}
                    className="p-2"
                  >
                    <Bot className="w-4 h-4" />
                  </BrandButton>
                  <BrandButton
                    variant="ghost"
                    size="sm"
                    onClick={() => {/* Switch to edit mode */}}
                    className="p-2"
                  >
                    <Edit className="w-4 h-4" />
                  </BrandButton>
                </>
              )}
              <BrandButton
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2"
              >
                <X className="w-4 h-4" />
              </BrandButton>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto max-h-[calc(90vh-120px)]">
            {mode === 'view' && deal ? (
              // View Mode
              <div className="p-6 space-y-6">
                {/* Deal Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    trend={getStageConfig(deal.stage)?.label || 'Unknown Stage'}
                    borderGradient="blue"
                  />
                  <BrandStatCard
                    icon={<TrendingUp className="w-6 h-6 text-purple-400" />}
                    title="Expected Value"
                    value={formatCurrency(deal.value * (deal.probability / 100))}
                    trend="Weighted value"
                    borderGradient="purple"
                  />
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-black/20 p-1 rounded-lg">
                  {[
                    { id: 'details', label: 'Details', icon: FileText },
                    { id: 'notes', label: 'Notes', icon: Edit },
                    { id: 'activity', label: 'Activity', icon: Activity }
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
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    <BrandCard className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                        <Target className="w-5 h-5 text-blue-400" />
                        <span>Deal Information</span>
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-white/60 mb-2">Title</label>
                          <p className="text-white font-medium">{deal.title}</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-white/60 mb-2">Stage</label>
                          <BrandBadge 
                            variant="primary" 
                            style={{ backgroundColor: getStageConfig(deal.stage)?.color }}
                          >
                            {getStageConfig(deal.stage)?.label || 'Unknown'}
                          </BrandBadge>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-white/60 mb-2">Priority</label>
                          {getPriorityBadge(deal.priority || 'medium')}
                        </div>
                        
                        {deal.expected_close_date && (
                          <div>
                            <label className="block text-sm font-medium text-white/60 mb-2">Expected Close</label>
                            <div className="flex items-center space-x-2 text-white">
                              <Calendar className="w-4 h-4 text-white/60" />
                              <span>{new Date(deal.expected_close_date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        )}
                        
                        {deal.contact && (
                          <div>
                            <label className="block text-sm font-medium text-white/60 mb-2">Contact</label>
                            <div className="flex items-center space-x-2 text-white">
                              <User className="w-4 h-4 text-white/60" />
                              <div>
                                <p className="font-medium">{deal.contact.name}</p>
                                <p className="text-sm text-white/60">{deal.contact.email}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {deal.organization && (
                          <div>
                            <label className="block text-sm font-medium text-white/60 mb-2">Organization</label>
                            <div className="flex items-center space-x-2 text-white">
                              <Building2 className="w-4 h-4 text-white/60" />
                              <div>
                                <p className="font-medium">{deal.organization.name}</p>
                                <p className="text-sm text-white/60">{deal.organization.email}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {deal.description && (
                        <div className="mt-6">
                          <label className="block text-sm font-medium text-white/60 mb-2">Description</label>
                          <p className="text-white">{deal.description}</p>
                        </div>
                      )}
                      
                      {deal.tags && deal.tags.length > 0 && (
                        <div className="mt-6">
                          <label className="block text-sm font-medium text-white/60 mb-2">Tags</label>
                          <div className="flex flex-wrap gap-2">
                            {deal.tags.map((tag, index) => (
                              <BrandBadge key={index} variant="secondary">
                                {tag}
                              </BrandBadge>
                            ))}
                          </div>
                        </div>
                      )}
                    </BrandCard>
                  </div>
                )}

                {activeTab === 'notes' && (
                  <BrandCard className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Notes</h3>
                    <p className="text-white/60">
                      {deal.notes || 'No notes available for this deal.'}
                    </p>
                  </BrandCard>
                )}

                {activeTab === 'activity' && (
                  <BrandCard className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                    <p className="text-white/60">No recent activity recorded.</p>
                  </BrandCard>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-6 border-t border-white/10">
                  <div>
                    {onDelete && (
                      <BrandButton
                        variant="secondary"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="bg-red-600/20 border-red-500/30 text-red-400 hover:bg-red-600/30"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Deal
                      </BrandButton>
                    )}
                  </div>
                  
                  <div className="flex space-x-3">
                    <BrandButton variant="secondary" onClick={onClose}>
                      Close
                    </BrandButton>
                  </div>
                </div>
              </div>
            ) : (
              // Edit/Create Mode
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Deal Title *
                    </label>
                    <BrandInput
                      type="text"
                      placeholder="Enter deal title..."
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Deal Value *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60">
                        {formData.currency === 'USD' ? '$' : formData.currency === 'EUR' ? '€' : '£'}
                      </span>
                      <BrandInput
                        type="number"
                        placeholder="0.00"
                        value={formData.value}
                        onChange={(e) => handleInputChange('value', parseFloat(e.target.value) || 0)}
                        className="pl-8"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Currency
                    </label>
                    <BrandDropdown
                      value={formData.currency}
                      onChange={(value) => handleInputChange('currency', value)}
                      options={[
                        { value: 'USD', label: 'USD ($)' },
                        { value: 'EUR', label: 'EUR (€)' },
                        { value: 'GBP', label: 'GBP (£)' }
                      ]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Stage
                    </label>
                    <BrandDropdown
                      value={formData.stage}
                      onChange={(value) => {
                        const stage = PIPELINE_STAGES.find(s => s.id === value);
                        handleInputChange('stage', value);
                        if (stage) {
                          handleInputChange('probability', stage.probability);
                        }
                      }}
                      options={PIPELINE_STAGES.map(stage => ({
                        value: stage.id,
                        label: stage.label
                      }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Probability (%)
                    </label>
                    <BrandInput
                      type="number"
                      placeholder="50"
                      value={formData.probability}
                      onChange={(e) => handleInputChange('probability', parseInt(e.target.value) || 0)}
                      min="0"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Priority
                    </label>
                    <BrandDropdown
                      value={formData.priority}
                      onChange={(value) => handleInputChange('priority', value)}
                      options={[
                        { value: 'low', label: 'Low Priority' },
                        { value: 'medium', label: 'Medium Priority' },
                        { value: 'high', label: 'High Priority' }
                      ]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Expected Close Date
                    </label>
                    <BrandInput
                      type="date"
                      value={formData.expected_close_date}
                      onChange={(e) => handleInputChange('expected_close_date', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Contact
                    </label>
                    <BrandDropdown
                      value={formData.contact_id}
                      onChange={(value) => handleInputChange('contact_id', value)}
                      options={[
                        { value: '', label: 'Select contact...' },
                        ...contacts.map(contact => ({
                          value: contact.id,
                          label: `${contact.name} (${contact.email})`
                        }))
                      ]}
                      placeholder="Choose a contact"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Describe the deal..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Notes
                  </label>
                  <textarea
                    placeholder="Internal notes..."
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-white/10">
                  <BrandButton variant="secondary" onClick={onClose}>
                    Cancel
                  </BrandButton>
                  <BrandButton
                    variant="primary"
                    onClick={handleSave}
                    disabled={isSaving || !formData.title.trim()}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : (mode === 'create' ? 'Create Deal' : 'Save Changes')}
                  </BrandButton>
                </div>
              </div>
            )}
          </div>
        </BrandCard>
      </motion.div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
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
                Are you sure you want to delete this deal? This action cannot be undone.
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
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </BrandButton>
              </div>
            </BrandCard>
          </motion.div>
        </div>
      )}
    </div>
  );
};
