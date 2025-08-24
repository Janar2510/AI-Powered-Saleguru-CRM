import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/input';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { 
  BrandPageLayout,
  BrandStatsGrid,
  BrandStatCard,
  BrandCard,
  BrandButton,
  BrandInput,
  BrandBadge
} from '../contexts/BrandDesignContext';
import { 
  Plus, 
  DollarSign,
  Calendar,
  Building2, 
  User,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  ExternalLink
} from 'lucide-react';

// Pipeline stages configuration
const PIPELINE_STAGES = [
  { id: 'new', label: 'New', color: 'bg-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
  { id: 'qualified', label: 'Qualified', color: 'bg-purple-500', bgColor: 'bg-purple-50', textColor: 'text-purple-700' },
  { id: 'proposal', label: 'Proposal', color: 'bg-orange-500', bgColor: 'bg-orange-50', textColor: 'text-orange-700' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-yellow-500', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700' },
  { id: 'won', label: 'Won', color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700' },
  { id: 'lost', label: 'Lost', color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-700' }
];

interface Deal {
  id: string;
  title: string;
  value: number;
  currency: string;
  stage: string;
  status: string;
  expected_close_date: string;
  probability: number;
  organization?: { name: string };
  contact?: { first_name: string; last_name: string };
  created_at: string;
  updated_at: string;
}

interface CreateDealData {
  title: string;
  value: number;
  currency: string;
  stage: string;
  expected_close_date: string;
  probability: number;
}

export default function Deals() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [dealsByStage, setDealsByStage] = useState<Record<string, Deal[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [draggedDeal, setDraggedDeal] = useState<{ dealId: string; fromStage: string } | null>(null);
  const [stats, setStats] = useState({
    totalDeals: 0,
    totalValue: 0,
    wonDeals: 0,
    wonValue: 0
  });

  console.log('🎯 Deals component rendering, user:', user);
  
  // Initialize stages
  useEffect(() => {
    const initialStages: Record<string, Deal[]> = {};
    PIPELINE_STAGES.forEach(stage => {
      initialStages[stage.id] = [];
    });
    setDealsByStage(initialStages);
  }, []);

  // Load deals on component mount
  useEffect(() => {
    console.log('🚀 Deals component mounted, user:', user);
    if (user) {
      console.log('👤 User found, loading deals...');
      loadDeals();
      setupRealtimeSubscription();
      
      // Fallback timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        console.log('⏰ Loading timeout reached, forcing completion');
        setIsLoading(false);
      }, 10000); // 10 seconds
      
      return () => clearTimeout(timeout);
    } else {
      console.log('❌ No user found, skipping deal load');
      // Add a retry mechanism to wait for user to become available
      const retryTimeout = setTimeout(() => {
        console.log('🔄 Retrying to load deals after delay...');
        if (user) {
          console.log('👤 User now available, loading deals...');
          loadDeals();
          setupRealtimeSubscription();
        } else {
          console.log('❌ User still not available after retry');
        }
      }, 2000); // Wait 2 seconds and retry
      
      return () => clearTimeout(retryTimeout);
    }
  }, [user]); // Only depend on user

  const loadDeals = async () => {
    try {
      setIsLoading(true);
      const orgId = (user as any)?.org_id || 'temp-org';
      
      console.log('🔍 Loading deals for org:', orgId);
      
      const { data: deals, error } = await supabase
        .from('deals')
        .select(`
          id, title, value, currency, stage, status, expected_close_date, probability, created_at, updated_at,
          organization:organizations(name), 
          contact:contacts(first_name, last_name)
        `)
        .eq('org_id', orgId);

      if (error) {
        console.error('❌ Error loading deals:', error);
        // Show some sample data for testing
        const sampleDeals = [
          {
            id: '1',
            title: 'Sample Deal 1',
            value: 50000,
            currency: 'EUR',
            stage: 'new',
            status: 'Open',
            expected_close_date: '2024-12-31',
            probability: 75,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            organization: { name: 'Sample Company' },
            contact: { first_name: 'John', last_name: 'Doe' }
          },
          {
            id: '2',
            title: 'Sample Deal 2',
            value: 25000,
            currency: 'EUR',
            stage: 'qualified',
            status: 'Open',
            expected_close_date: '2024-11-30',
            probability: 60,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            organization: { name: 'Test Corp' },
            contact: { first_name: 'Jane', last_name: 'Smith' }
          }
        ];
        
        console.log('📊 Using sample data for testing');
        const grouped: Record<string, Deal[]> = {};
        PIPELINE_STAGES.forEach(stage => {
          grouped[stage.id] = [];
        });
        
        sampleDeals.forEach(deal => {
          if (grouped[deal.stage]) {
            grouped[deal.stage].push(deal);
          }
        });
        
        setDealsByStage(grouped);
        calculateStats(sampleDeals);
        return;
      }

      console.log('✅ Deals loaded successfully:', deals?.length || 0);

      // Group deals by stage
      const grouped: Record<string, Deal[]> = {};
      PIPELINE_STAGES.forEach(stage => {
        grouped[stage.id] = [];
      });

      deals?.forEach((deal: any) => {
        if (grouped[deal.stage]) {
          // Transform the data to match our Deal interface
          const transformedDeal: Deal = {
            ...deal,
            organization: deal.organization?.[0] || null,
            contact: deal.contact?.[0] || null
          };
          grouped[deal.stage].push(transformedDeal);
        }
      });

      setDealsByStage(grouped);
      calculateStats(deals || []);
    } catch (error) {
      console.error('❌ Exception in loadDeals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (deals: any[]) => {
    const totalDeals = deals.length;
    const totalValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
    const wonDeals = deals.filter(deal => deal.stage === 'won').length;
    const wonValue = deals
      .filter(deal => deal.stage === 'won')
      .reduce((sum, deal) => sum + (deal.value || 0), 0);

    setStats({ totalDeals, totalValue, wonDeals, wonValue });
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('deals-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'deals' 
      }, () => {
        loadDeals();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, dealId: string, fromStage: string) => {
    setDraggedDeal({ dealId, fromStage });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newStage: string) => {
    e.preventDefault();
    
    if (!draggedDeal || draggedDeal.fromStage === newStage) {
      setDraggedDeal(null);
      return;
    }

    try {
      const orgId = (user as any)?.org_id || 'temp-org';
      
      const { error } = await supabase
        .from('deals')
        .update({ 
          stage: newStage, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', draggedDeal.dealId)
        .eq('org_id', orgId);

      if (error) {
        console.error('Failed to update deal stage:', error);
        return;
      }

      // Update local state immediately for better UX
      setDealsByStage(prev => {
        const updated = { ...prev };
        const deal = updated[draggedDeal.fromStage].find(d => d.id === draggedDeal.dealId);
        
        if (deal) {
          // Remove from old stage
          updated[draggedDeal.fromStage] = updated[draggedDeal.fromStage].filter(d => d.id !== draggedDeal.dealId);
          // Add to new stage
          deal.stage = newStage;
          updated[newStage].push(deal);
        }
        
        return updated;
      });

      // Reload to get fresh data and recalculate stats
      loadDeals();
    } catch (error) {
      console.error('Error updating deal stage:', error);
    } finally {
      setDraggedDeal(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedDeal(null);
  };

  // Create new deal
  const createDeal = async (dealData: CreateDealData) => {
    try {
      const orgId = (user as any)?.org_id || 'temp-org';
      
      const { error } = await supabase
        .from('deals')
        .insert({
          ...dealData,
          org_id: orgId,
          status: 'Open',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error creating deal:', error);
        return false;
      }

      setShowCreateModal(false);
      loadDeals();
      return true;
    } catch (error) {
      console.error('Error creating deal:', error);
      return false;
    }
  };

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'EUR'
    }).format(value || 0);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysUntilClose = (dateString: string) => {
    if (!dateString) return null;
    const today = new Date();
    const closeDate = new Date(dateString);
    const diffTime = closeDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f23] text-white p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Loading deals...</div>
        </div>
      </div>
    );
  }

  return (
    <BrandPageLayout
      title="Deals Pipeline"
      subtitle="Manage your sales pipeline with drag-and-drop"
      actions={
        <BrandButton 
          variant="primary"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="h-5 w-5 mr-2" />
          New Deal
        </BrandButton>
      }
      logoGradient={true}
    >


      {/* Brand Stats Grid */}
      <BrandStatsGrid>
        <BrandStatCard
          icon={<Target className="h-6 w-6 text-white" />}
          title="Total Deals"
          value={stats.totalDeals}
          borderGradient="primary"
        />
        <BrandStatCard
          icon={<DollarSign className="h-6 w-6 text-white" />}
          title="Total Value"
          value={formatCurrency(stats.totalValue, 'EUR')}
          borderGradient="secondary"
        />
        <BrandStatCard
          icon={<CheckCircle className="h-6 w-6 text-white" />}
          title="Won Deals"
          value={stats.wonDeals}
          borderGradient="accent"
        />
        <BrandStatCard
          icon={<TrendingUp className="h-6 w-6 text-white" />}
          title="Won Value"
          value={formatCurrency(stats.wonValue, 'EUR')}
          borderGradient="logo"
        />
      </BrandStatsGrid>

        {/* Kanban Board */}
        <div className="flex gap-5 mx-5 overflow-x-auto pb-5" style={{minHeight: '550px', alignItems: 'flex-start'}}>
          {PIPELINE_STAGES.map((stage, index) => {
            // Progressive height reduction from New to Lost
            const heights = [500, 480, 460, 440, 420, 400]; // New=500px, Lost=400px
            const cardHeight = heights[index] || 400;
            
            return (
            <div 
              key={stage.id}
              style={{width: '280px', minWidth: '280px', maxWidth: '280px', flexShrink: 0}}
            >
              <BrandCard
                variant="glass"
                borderGradient="primary"
                className="p-4 flex flex-col w-full h-full"
                style={{minHeight: `${cardHeight}px`}}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
              {/* Stage Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                  <h3 className="font-semibold text-white">{stage.label}</h3>
                </div>
                <BrandBadge variant="default">
                  {dealsByStage[stage.id]?.length || 0}
                </BrandBadge>
                  </div>
                  
              {/* Stage Value */}
              <div className="mb-4">
                <p className="text-xs text-gray-400">Stage Value</p>
                <p className="text-sm font-medium text-white">
                  {formatCurrency(
                    dealsByStage[stage.id]?.reduce((sum, deal) => sum + (deal.value || 0), 0) || 0,
                    'EUR'
                  )}
                </p>
            </div>

              {/* Deal Cards */}
              <div className="space-y-3 flex-1">
                {dealsByStage[stage.id]?.map((deal) => (
                  <div className="relative group">
                    <BrandCard
                      key={deal.id} 
                      variant="glass"
                      borderGradient="secondary"
                      className="p-2 cursor-move hover:scale-105 w-full"
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, deal.id, stage.id)}
                      onDragEnd={handleDragEnd}
                      onClick={(e) => {
                        // Only navigate if not dragging and not clicking the view button
                        if (!draggedDeal && !(e.target as HTMLElement).closest('button')) {
                          navigate(`/deals/${deal.id}`);
                        }
                      }}
                    >
                    {/* Deal Title */}
                    <h4 className="font-medium text-white mb-1 line-clamp-2 text-sm">{deal.title}</h4>
                    
                    {/* Deal Value */}
                    <div className="flex items-center gap-1 mb-1">
                      <DollarSign className="h-4 w-4 text-white" />
                      <span className="text-sm font-medium text-white">
                        {formatCurrency(deal.value || 0, deal.currency)}
                              </span>
                      </div>
                      
                    {/* Organization/Contact */}
                    <div className="flex items-center gap-1 mb-1">
                      {deal.organization ? (
                        <>
                          <Building2 className="h-4 w-4 text-white/70" />
                          <span className="text-xs text-white/70">{deal.organization.name}</span>
                        </>
                      ) : deal.contact ? (
                        <>
                          <User className="h-4 w-4 text-white/70" />
                          <span className="text-xs text-white/70">
                            {deal.contact.first_name} {deal.contact.last_name}
                          </span>
                        </>
                      ) : null}
                        </div>

                                        {/* Close Date */}
                    {deal.expected_close_date && (
                      <div className="flex items-center gap-1 mb-1">
                        <Calendar className="h-4 w-4 text-white/70" />
                        <span className="text-xs text-white/70">
                          {formatDate(deal.expected_close_date)}
                            </span>
                        {(() => {
                          const daysUntil = getDaysUntilClose(deal.expected_close_date);
                          if (daysUntil !== null) {
                            if (daysUntil < 0) {
                              return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">Overdue</Badge>;
                            } else if (daysUntil <= 7) {
                              return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">{daysUntil}d</Badge>;
                            }
                          }
                          return null;
                        })()}
                      </div>
                    )}

                    {/* Probability */}
                    {deal.probability && (
                      <div className="flex items-center gap-1 mb-1">
                        <Target className="h-4 w-4 text-white/70" />
                        <span className="text-xs text-white/70">{deal.probability}%</span>
                      </div>
                    )}

                    {/* Created Date */}
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-white/50" />
                      <span className="text-xs text-white/50">
                        {formatDate(deal.created_at)}
                      </span>
                    </div>
                  </BrandCard>
                  
                  {/* View Deal Button - appears on hover */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <BrandButton
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        navigate(`/deals/${deal.id}`);
                      }}
                      className="!p-1"
                    >
                      <Eye className="w-3 h-3" />
                    </BrandButton>
                  </div>
                </div>
                ))}
              </div>

            {/* Empty State */}
              {(!dealsByStage[stage.id] || dealsByStage[stage.id].length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-[#374151] flex items-center justify-center">
                    <Plus className="h-6 w-6" />
                  </div>
                  <p className="text-sm">No deals</p>
                  <p className="text-xs">Drag deals here</p>
                </div>
              )}
            </BrandCard>
            </div>
            );
          })}
        </div>

      {/* Create Deal Modal */}
        <CreateDealModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateDeal={createDeal}
      />
    </BrandPageLayout>
  );
}

// Create Deal Modal Component
interface CreateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateDeal: (dealData: CreateDealData) => Promise<boolean>;
}

function CreateDealModal({ isOpen, onClose, onCreateDeal }: CreateDealModalProps) {
  const [formData, setFormData] = useState<CreateDealData>({
    title: '',
    value: 0,
    currency: 'EUR',
    stage: 'new',
    expected_close_date: '',
    probability: 50
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const success = await onCreateDeal(formData);
    if (success) {
      setFormData({
        title: '',
        value: 0,
        currency: 'EUR',
        stage: 'new',
        expected_close_date: '',
        probability: 50
      });
    }
    
    setIsSubmitting(false);
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className="bg-[#1a1a2e] border border-[#374151] rounded-lg p-6 w-full max-w-2xl">
        <h2 className="text-xl font-bold text-white mb-4">Create New Deal</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Deal Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter deal title"
              required
              className="bg-[#2d2d44] border-[#4b5563] text-white"
            />
              </div>

          <div className="grid grid-cols-2 gap-4">
              <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Value</label>
              <Input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
                step="0.01"
                className="bg-[#2d2d44] border-[#4b5563] text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                className="w-full bg-[#2d2d44] border border-[#4b5563] rounded-md px-3 py-2 text-white"
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Stage</label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData(prev => ({ ...prev, stage: e.target.value }))}
                className="w-full bg-[#2d2d44] border border-[#4b5563] rounded-md px-3 py-2 text-white"
              >
                {PIPELINE_STAGES.map(stage => (
                  <option key={stage.id} value={stage.id}>{stage.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Probability (%)</label>
              <Input
                type="number"
                value={formData.probability}
                onChange={(e) => setFormData(prev => ({ ...prev, probability: parseInt(e.target.value) || 0 }))}
                min="0"
                max="100"
                className="bg-[#2d2d44] border-[#4b5563] text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Expected Close Date</label>
            <Input
              type="date"
              value={formData.expected_close_date}
              onChange={(e) => setFormData(prev => ({ ...prev, expected_close_date: e.target.value }))}
              className="bg-[#2d2d44] border-[#4b5563] text-white"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent border-[#4b5563] text-gray-300 hover:bg-[#374151]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-[#6366f1] to-[#06b6d4] hover:from-[#5b5ee6] hover:to-[#06a6c4] text-white"
            >
              {isSubmitting ? 'Creating...' : 'Create Deal'}
            </Button>
        </div>
        </form>
    </div>
    </Modal>
  );
}
