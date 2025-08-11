import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Grid, 
  List, 
  MoreHorizontal,
  TrendingUp,
  DollarSign,
  Calendar,
  User,
  Building,
  Tag,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  MessageSquare,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Target,
  Users,
  BarChart3,
  Settings,
  Download,
  Share2,
  Star,
  Zap,
  GitBranch,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Deal } from '../types/deals';
import { DealsAPI } from '../lib/deals-api';
import { Card } from '../components/common/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Dropdown from '../components/ui/Dropdown';
import { useToastContext } from '../contexts/ToastContext';
import { useGuru } from '../contexts/GuruContext';
import Container from '../components/layout/Container';
import Spline from '@splinetool/react-spline';
import CreateDealModal from '../components/deals/CreateDealModal';
import KanbanDealBoard from '../components/deals/KanbanDealBoard';
import { supabase } from '../services/supabase';

const Deals: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToastContext();
  const { openGuru } = useGuru();
  
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'grid'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'value' | 'probability' | 'created_at' | 'expected_close_date'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const dealsData = await DealsAPI.getDeals({}, true); // Force demo mode for now
      setDeals(dealsData);
    } catch (error) {
      console.error('Error fetching deals:', error);
      showToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to load deals'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDealClick = (deal: Deal) => {
    navigate(`/deals/${deal.id}`);
  };

  const handleEditDeal = (deal: Deal) => {
    navigate(`/deals/${deal.id}?tab=edit`);
  };

  const handleDeleteDeal = async (dealId: string) => {
    try {
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', dealId);

      if (error) throw error;

      setDeals(prev => prev.filter(deal => deal.id !== dealId));
      setShowDeleteConfirm(false);
      setSelectedDeal(null);
      
      showToast({
        type: 'success',
        title: 'Deal Deleted',
        description: 'Deal has been deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting deal:', error);
      showToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to delete deal'
      });
    }
  };

  const handleDealCreated = async (dealData: any) => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .insert([{
          title: dealData.title,
          description: dealData.description,
          value: dealData.value,
          stage_id: dealData.stage_id,
          probability: dealData.probability,
          expected_close_date: dealData.expected_close_date,
          company_id: null,
          contact_id: null,
          owner_id: 'demo-user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;

      setDeals(prev => [data[0], ...prev]);
      setIsCreateModalOpen(false);
      
      showToast({
        type: 'success',
        title: 'Deal Created',
        description: 'New deal has been created successfully'
      });
    } catch (error) {
      console.error('Error creating deal:', error);
      showToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to create deal'
      });
    }
  };

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (deal.description && deal.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStage = selectedStage === 'all' || deal.stage?.id === selectedStage;
    return matchesSearch && matchesStage;
  });

  const sortedDeals = [...filteredDeals].sort((a, b) => {
    let aValue: any = a[sortBy];
    let bValue: any = b[sortBy];

    if (sortBy === 'created_at' || sortBy === 'expected_close_date') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'won':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'lost':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'open':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      default:
        return <Activity className="w-5 h-5 text-blue-400" />;
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-400';
    if (probability >= 60) return 'text-yellow-400';
    if (probability >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="relative z-10 min-h-screen">
      {/* 3D Background */}
      <div className="fixed inset-0 z-0">
        <Spline
          scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode"
          className="w-full h-full"
        />
      </div>
      
      {/* Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#18182c]/50 to-[#18182c]/70 z-0"></div>
      
      {/* Content */}
      <div className="relative z-10">
        <Container>
          <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div>
                  <h1 className="text-2xl font-bold text-white">Deals</h1>
                  <p className="text-[#b0b0d0]">Manage your sales pipeline</p>
                </div>
                <Badge variant="primary" size="sm">
                  {deals.length} deals
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => openGuru()}
                  variant="gradient"
                  size="sm"
                  icon={Zap}
                >
                  Ask Guru
                </Button>
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  variant="gradient"
                  icon={Plus}
                >
                  New Deal
                </Button>
              </div>
            </div>

            {/* Filters and Controls */}
            <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#b0b0d0]" />
                    <input
                      type="text"
                      placeholder="Search deals..."
                      value={searchTerm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 rounded-lg bg-[#23233a]/60 text-white border border-[#23233a]/50 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-64"
                    />
                  </div>
                  <Dropdown
                    options={[
                      { value: 'all', label: 'All Stages' },
                      { value: 'lead', label: 'Lead' },
                      { value: 'prospect', label: 'Prospect' },
                      { value: 'qualified', label: 'Qualified' },
                      { value: 'proposal', label: 'Proposal' },
                      { value: 'negotiation', label: 'Negotiation' },
                      { value: 'closed-won', label: 'Closed Won' },
                      { value: 'closed-lost', label: 'Closed Lost' }
                    ]}
                    value={selectedStage}
                    onChange={setSelectedStage}
                    className="w-36"
                  />
                </div>

                {/* View Mode and Sort */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-[#23233a]/60 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('kanban')}
                      className={`p-2 rounded-md transition-all duration-200 ${
                        viewMode === 'kanban' 
                          ? 'bg-purple-500 text-white' 
                          : 'text-[#b0b0d0] hover:text-white'
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-all duration-200 ${
                        viewMode === 'list' 
                          ? 'bg-purple-500 text-white' 
                          : 'text-[#b0b0d0] hover:text-white'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-all duration-200 ${
                        viewMode === 'grid' 
                          ? 'bg-purple-500 text-white' 
                          : 'text-[#b0b0d0] hover:text-white'
                      }`}
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <Dropdown
                    options={[
                      { value: 'created_at-desc', label: 'Newest First' },
                      { value: 'created_at-asc', label: 'Oldest First' },
                      { value: 'value-desc', label: 'Value: High to Low' },
                      { value: 'value-asc', label: 'Value: Low to High' },
                      { value: 'probability-desc', label: 'Probability: High to Low' },
                      { value: 'probability-asc', label: 'Probability: Low to High' },
                      { value: 'expected_close_date-asc', label: 'Close Date: Soonest' },
                      { value: 'expected_close_date-desc', label: 'Close Date: Latest' }
                    ]}
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(value) => {
                      const [field, order] = value.split('-');
                      setSortBy(field as any);
                      setSortOrder(order as any);
                    }}
                    className="w-40"
                  />
                </div>
              </div>
            </div>

            {/* Deals Content */}
            {viewMode === 'kanban' ? (
              <KanbanDealBoard 
                onCreateDeal={() => setIsCreateModalOpen(true)}
                onViewDeal={handleDealClick}
                onEditDeal={handleEditDeal}
              />
            ) : viewMode === 'list' ? (
              <div className="space-y-4">
                {sortedDeals.map(deal => (
                  <div 
                    key={deal.id} 
                    className="p-6 bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50 hover:bg-[#23233a]/60 transition-all duration-300 cursor-pointer rounded-xl"
                    onClick={() => handleDealClick(deal)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(deal.status)}
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-1">{deal.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-[#b0b0d0]">
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {formatCurrency(deal.value)}
                            </span>
                            <span className={`flex items-center gap-1 ${getProbabilityColor(deal.probability)}`}>
                              <TrendingUp className="w-4 h-4" />
                              {deal.probability}%
                            </span>
                            {deal.expected_close_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(deal.expected_close_date).toLocaleDateString()}
                              </span>
                            )}
                            {deal.company && (
                              <span className="flex items-center gap-1">
                                <Building className="w-4 h-4" />
                                {deal.company.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            handleEditDeal(deal);
                          }}
                          variant="secondary"
                          size="sm"
                          icon={Edit}
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            setSelectedDeal(deal);
                            setShowDeleteConfirm(true);
                          }}
                          variant="danger"
                          size="sm"
                          icon={Trash2}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedDeals.map(deal => (
                  <div 
                    key={deal.id} 
                    className="p-6 bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50 hover:bg-[#23233a]/60 transition-all duration-300 cursor-pointer rounded-xl"
                    onClick={() => handleDealClick(deal)}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        {getStatusIcon(deal.status)}
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              handleEditDeal(deal);
                            }}
                            variant="secondary"
                            size="sm"
                            icon={Edit}
                          />
                          <Button
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              setSelectedDeal(deal);
                              setShowDeleteConfirm(true);
                            }}
                            variant="danger"
                            size="sm"
                            icon={Trash2}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">{deal.title}</h3>
                        {deal.description && (
                          <p className="text-[#b0b0d0] text-sm mb-3 line-clamp-2">{deal.description}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[#b0b0d0] text-sm">Value</span>
                          <span className="text-white font-semibold">{formatCurrency(deal.value)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#b0b0d0] text-sm">Probability</span>
                          <span className={`font-semibold ${getProbabilityColor(deal.probability)}`}>
                            {deal.probability}%
                          </span>
                        </div>
                        {deal.expected_close_date && (
                          <div className="flex items-center justify-between">
                            <span className="text-[#b0b0d0] text-sm">Close Date</span>
                            <span className="text-white text-sm">
                              {new Date(deal.expected_close_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-[#23233a]/50">
                        {deal.company && (
                          <span className="flex items-center gap-1 text-[#b0b0d0] text-sm">
                            <Building className="w-3 h-3" />
                            {deal.company.name}
                          </span>
                        )}
                        {deal.stage && (
                          <Badge variant="secondary" size="sm">
                            {deal.stage.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {sortedDeals.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-[#23233a]/60 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-[#b0b0d0]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No deals found</h3>
                <p className="text-[#b0b0d0] mb-4">
                  {searchTerm || selectedStage !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : 'Get started by creating your first deal'
                  }
                </p>
                {!searchTerm && selectedStage === 'all' && (
                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    variant="gradient"
                    icon={Plus}
                  >
                    Create First Deal
                  </Button>
                )}
              </div>
            )}
          </div>
        </Container>
      </div>

      {/* Create Deal Modal */}
      {isCreateModalOpen && (
        <CreateDealModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onDealCreated={handleDealCreated}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedDeal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#23233a]/95 backdrop-blur-md rounded-xl border border-[#23233a]/50 p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Delete Deal</h3>
                <p className="text-[#b0b0d0] text-sm">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-[#b0b0d0] mb-6">
              Are you sure you want to delete "{selectedDeal.title}"? This will permanently remove the deal and all associated data.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteDeal(selectedDeal.id)}
                variant="danger"
                className="flex-1"
              >
                Delete Deal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deals;