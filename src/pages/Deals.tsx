import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Filter, 
  Search, 
  Eye, 
  MessageSquare, 
  Mail, 
  FolderOpen, 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  Grid, 
  Kanban, 
  Bot,
  ChevronDown,
  X,
  Check,
  Sliders
} from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/common/EmptyState';
import DealDetailsModal from '../components/deals/DealDetailsModal';
import DealNotesModal from '../components/deals/DealNotesModal';
import DealEmailsModal from '../components/deals/DealEmailsModal';
import CreateDealModal from '../components/deals/CreateDealModal';
import KanbanDealBoard from '../components/deals/KanbanDealBoard';
import { useGuru } from '../contexts/GuruContext';
import { useToastContext } from '../contexts/ToastContext';
import { createClient } from '@supabase/supabase-js';
import Container from '../components/layout/Container';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface Deal {
  id: string;
  deal_id: string;
  title: string;
  company: string;
  value: number;
  stage: string;
  stage_id: string;
  contact: string;
  lastActivity: string;
  probability: number;
  drive_url?: string;
  created_at: Date;
  notes_count: number;
  emails_count: number;
  team_members: string[];
  priority: 'low' | 'medium' | 'high';
  next_action?: string;
  next_action_date?: string;
}

interface FilterState {
  status: string;
  valueRange: [number, number];
  dateRange: [Date | null, Date | null];
  owner: string;
  industry: string;
  stage: string;
  priority: string;
}

const Deals: React.FC = () => {
  const { openGuru } = useGuru();
  const { showToast } = useToastContext();
  const [selectedStage, setSelectedStage] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'board'>('board');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showEmailsModal, setShowEmailsModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [stages, setStages] = useState<{id: string, name: string, color: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentDeals, setRecentDeals] = useState<Deal[]>([]);
  
  // Advanced filters state
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    valueRange: [0, 1000000],
    dateRange: [null, null],
    owner: 'all',
    industry: 'all',
    stage: 'all',
    priority: 'all'
  });

  // Fetch deals and stages from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch stages
        const { data: stagesData, error: stagesError } = await supabase
          .from('stages')
          .select('*')
          .order('sort_order');

        if (stagesError) throw stagesError;

        // If no stages data yet, use default stages
        const stagesList = stagesData?.length ? stagesData : [
          { id: 'lead', name: 'Lead', color: 'bg-gray-500' },
          { id: 'qualified', name: 'Qualified', color: 'bg-blue-500' },
          { id: 'proposal', name: 'Proposal', color: 'bg-yellow-500' },
          { id: 'negotiation', name: 'Negotiation', color: 'bg-orange-500' },
          { id: 'closed-won', name: 'Closed Won', color: 'bg-green-500' },
          { id: 'closed-lost', name: 'Closed Lost', color: 'bg-red-500' }
        ];
        
        setStages(stagesList);

        // Fetch deals
        const { data: dealsData, error: dealsError } = await supabase
          .from('deals')
          .select('*')
          .order('created_at', { ascending: false });

        if (dealsError) throw dealsError;

        if (dealsData) {
          const formattedDeals = dealsData.map(deal => ({
            ...deal,
            stage: stagesList.find(s => s.id === deal.stage_id)?.name || 'Unknown',
            created_at: new Date(deal.created_at),
            next_action_date: deal.next_action_date || undefined,
            drive_url: deal.drive_url || undefined,
            lastActivity: deal.lastactivity || 'No activity'
          }));
          
          setDeals(formattedDeals);
          
          // Set recent deals (last 5 viewed/modified)
          setRecentDeals(formattedDeals.slice(0, 5));
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load deals');
        showToast({
          type: 'error',
          title: 'Data Loading Error',
          message: 'Failed to load deals and stages'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [showToast]);

  // Apply filters to deals
  const filteredDeals = deals.filter(deal => {
    // Basic search filter
    const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.deal_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.contact.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Basic stage filter
    const matchesStage = selectedStage === 'all' || deal.stage_id === selectedStage;
    
    // Advanced filters
    const matchesStatus = filters.status === 'all' || 
                         (filters.status === 'open' && deal.stage_id !== 'closed-won' && deal.stage_id !== 'closed-lost') ||
                         (filters.status === 'closed' && (deal.stage_id === 'closed-won' || deal.stage_id === 'closed-lost')) ||
                         (filters.status === 'pending' && (deal.stage_id === 'proposal' || deal.stage_id === 'negotiation'));
    
    const matchesValue = deal.value >= filters.valueRange[0] && deal.value <= filters.valueRange[1];
    
    const matchesDateRange = (!filters.dateRange[0] || new Date(deal.created_at) >= filters.dateRange[0]) &&
                            (!filters.dateRange[1] || new Date(deal.created_at) <= filters.dateRange[1]);
    
    const matchesOwner = filters.owner === 'all' || deal.team_members.includes(filters.owner);
    
    // For industry, we'd need to add industry to the deal model or join with company data
    const matchesIndustry = filters.industry === 'all'; // Placeholder
    
    const matchesStageFilter = filters.stage === 'all' || deal.stage_id === filters.stage;
    
    const matchesPriority = filters.priority === 'all' || deal.priority === filters.priority;
    
    return matchesSearch && matchesStage && matchesStatus && matchesValue && 
           matchesDateRange && matchesOwner && matchesIndustry && 
           matchesStageFilter && matchesPriority;
  });

  const handleViewDeal = (deal: any) => {
    // Convert deal board deal to regular deal format
    const convertedDeal: Deal = {
      ...deal,
      stage: stages.find(s => s.id === deal.stage_id)?.name || 'Unknown'
    };
    setSelectedDeal(convertedDeal);
    setShowDetailsModal(true);
  };

  const handleEditDeal = (deal: any) => {
    const convertedDeal: Deal = {
      ...deal,
      stage: stages.find(s => s.id === deal.stage_id)?.name || 'Unknown'
    };
    setSelectedDeal(convertedDeal);
    setShowNotesModal(true);
  };

  const handleDealCreated = async (newDeal: any) => {
    try {
      // Insert the new deal into Supabase
      const { data, error } = await supabase
        .from('deals')
        .insert({
          title: newDeal.title,
          company: newDeal.company,
          contact: newDeal.contact,
          value: newDeal.value,
          stage_id: newDeal.stage,
          probability: newDeal.probability,
          priority: newDeal.priority,
          description: newDeal.description,
          expected_close_date: newDeal.expected_close_date,
          team_members: newDeal.team_members,
          drive_url: newDeal.drive_url,
          created_at: new Date().toISOString(),
          created_by: 'Janar Kuusk', // In a real app, this would be the current user
          position: 0, // Default position at the top of the stage
          days_in_stage: 0
        })
        .select();

      if (error) throw error;

      // Refresh the deals list
      const { data: updatedDeals, error: fetchError } = await supabase
        .from('deals')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      if (updatedDeals) {
        const formattedDeals = updatedDeals.map(deal => ({
          ...deal,
          stage: stages.find(s => s.id === deal.stage_id)?.name || 'Unknown',
          created_at: new Date(deal.created_at),
          next_action_date: deal.next_action_date || undefined,
          drive_url: deal.drive_url || undefined,
          lastActivity: deal.lastactivity || 'No activity'
        }));
        
        setDeals(formattedDeals);
        setRecentDeals(formattedDeals.slice(0, 5));
      }

      showToast({
        type: 'success',
        title: 'Deal Created',
        message: `${newDeal.title} has been created successfully.`
      });
      
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error creating deal:', err);
      showToast({
        type: 'error',
        title: 'Creation Failed',
        message: 'Failed to create deal. Please try again.'
      });
    }
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      valueRange: [0, 1000000],
      dateRange: [null, null],
      owner: 'all',
      industry: 'all',
      stage: 'all',
      priority: 'all'
    });
    setSelectedStage('all');
    setSearchTerm('');
    setShowAdvancedFilters(false);
  };

  // Team members for filter
  const teamMembers = [
    { id: 'all', name: 'All Team Members' },
    { id: 'current-user', name: 'Janar Kuusk (You)' },
    { id: 'sarah-wilson', name: 'Sarah Wilson' },
    { id: 'mike-chen', name: 'Mike Chen' },
    { id: 'lisa-park', name: 'Lisa Park' }
  ];

  // Industries for filter
  const industries = [
    { id: 'all', name: 'All Industries' },
    { id: 'technology', name: 'Technology' },
    { id: 'finance', name: 'Financial Services' },
    { id: 'healthcare', name: 'Healthcare' },
    { id: 'manufacturing', name: 'Manufacturing' },
    { id: 'retail', name: 'Retail' },
    { id: 'education', name: 'Education' }
  ];

  if (isLoading) {
    return (
      <Container>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-secondary-400">Loading deals...</p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Deals</h1>
            <p className="text-secondary-400 mt-1">Manage your sales pipeline with AI-powered insights</p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={openGuru}
              className="btn-secondary flex items-center space-x-2"
            >
              <Bot className="w-4 h-4" />
              <span>Ask Guru</span>
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Deal</span>
            </button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('board')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'board'
                    ? 'bg-primary-600 text-white'
                    : 'bg-secondary-700 text-secondary-400 hover:bg-secondary-600'
                }`}
              >
                <Kanban className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-primary-600 text-white'
                    : 'bg-secondary-700 text-secondary-400 hover:bg-secondary-600'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
            <span className="text-secondary-400 text-sm">
              {viewMode === 'board' ? 'Board View' : 'Card View'}
            </span>
          </div>
        </div>

        {/* Search and Advanced Filters */}
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <input
              type="text"
              placeholder="Search deals by title, company, contact, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`btn-secondary flex items-center space-x-2 ${showAdvancedFilters ? 'bg-primary-600 text-white' : ''}`}
            >
              <Sliders className="w-4 h-4" />
              <span>Advanced Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
            </button>
            
            {filters.status !== 'all' || filters.valueRange[0] > 0 || filters.valueRange[1] < 1000000 || 
             filters.dateRange[0] !== null || filters.dateRange[1] !== null || 
             filters.owner !== 'all' || filters.industry !== 'all' || 
             filters.stage !== 'all' || filters.priority !== 'all' ? (
              <button 
                onClick={resetFilters}
                className="btn-secondary flex items-center space-x-2 text-red-400 hover:text-red-300"
              >
                <X className="w-4 h-4" />
                <span>Clear Filters</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <Card className="bg-secondary-800/80 backdrop-blur-md border border-secondary-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">Advanced Filters</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-2">
                  Deal Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open Deals</option>
                  <option value="closed">Closed Deals</option>
                  <option value="pending">Pending Deals</option>
                </select>
              </div>
              
              {/* Owner Filter */}
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-2">
                  Deal Owner
                </label>
                <select
                  value={filters.owner}
                  onChange={(e) => setFilters(prev => ({ ...prev, owner: e.target.value }))}
                  className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                >
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-2">
                  Date Range
                </label>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                    <input
                      type="date"
                      value={filters.dateRange[0]?.toISOString().split('T')[0] || ''}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        dateRange: [e.target.value ? new Date(e.target.value) : null, prev.dateRange[1]]
                      }))}
                      className="w-full pl-8 pr-2 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                    />
                  </div>
                  <span className="text-secondary-400">to</span>
                  <div className="relative flex-1">
                    <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                    <input
                      type="date"
                      value={filters.dateRange[1]?.toISOString().split('T')[0] || ''}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        dateRange: [prev.dateRange[0], e.target.value ? new Date(e.target.value) : null]
                      }))}
                      className="w-full pl-8 pr-2 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                    />
                  </div>
                </div>
              </div>
              
              {/* Value Range Filter */}
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-2">
                  Deal Value Range
                </label>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                    <input
                      type="number"
                      min="0"
                      value={filters.valueRange[0]}
                      onChange={(e) => setFilters(prev => ({ ...prev, valueRange: [parseInt(e.target.value) || 0, prev.valueRange[1]] }))}
                      className="w-full pl-8 pr-2 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                    />
                  </div>
                  <span className="text-secondary-400">to</span>
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                    <input
                      type="number"
                      min="0"
                      value={filters.valueRange[1]}
                      onChange={(e) => setFilters(prev => ({ ...prev, valueRange: [prev.valueRange[0], parseInt(e.target.value) || 0] }))}
                      className="w-full pl-8 pr-2 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-4 pt-4 border-t border-secondary-700">
              <div className="flex space-x-2">
                <button 
                  onClick={resetFilters}
                  className="btn-secondary"
                >
                  Reset Filters
                </button>
                <button 
                  onClick={() => setShowAdvancedFilters(false)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply Filters</span>
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* Recent Deals */}
        {recentDeals.length > 0 && !showAdvancedFilters && (
          <Card className="bg-secondary-800/60 backdrop-blur-md border border-secondary-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Deals</h3>
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {recentDeals.map(deal => (
                <div 
                  key={deal.id}
                  onClick={() => handleViewDeal(deal)}
                  className="flex-shrink-0 w-64 p-3 bg-secondary-700/60 backdrop-blur-md rounded-lg border border-secondary-600/50 hover:border-primary-600/50 cursor-pointer transition-all"
                >
                  <div className="font-medium text-white truncate">{deal.title}</div>
                  <div className="text-sm text-secondary-400 truncate">{deal.company}</div>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="success" size="sm">${deal.value.toLocaleString()}</Badge>
                    <span className="text-xs text-secondary-500">{deal.stage}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Content based on view mode */}
        {viewMode === 'board' ? (
          <KanbanDealBoard 
            onCreateDeal={() => setShowCreateModal(true)}
            onViewDeal={handleViewDeal}
            onEditDeal={handleEditDeal}
          />
        ) : (
          <>
            {/* Pipeline Overview */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {stages.map((stage) => (
                <Card 
                  key={stage.id}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    selectedStage === stage.id ? 'ring-2 ring-primary-600 bg-primary-600/10' : ''
                  }`}
                  onClick={() => setSelectedStage(stage.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">{stage.name}</h3>
                      <p className="text-2xl font-bold text-white mt-1">
                        {deals.filter(d => d.stage_id === stage.id).length}
                      </p>
                      <p className="text-xs text-secondary-400 mt-1">
                        ${deals.filter(d => d.stage_id === stage.id).reduce((sum, d) => sum + d.value, 0).toLocaleString()}
                      </p>
                    </div>
                    <div className={`w-3 h-12 ${stage.color} rounded-full`}></div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-secondary-400 text-sm">Total Pipeline</p>
                    <p className="text-2xl font-bold text-white">
                      ${filteredDeals.reduce((sum, deal) => sum + deal.value, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
              <Card>
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-secondary-400 text-sm">Avg Deal Size</p>
                    <p className="text-2xl font-bold text-white">
                      ${Math.round(filteredDeals.reduce((sum, deal) => sum + deal.value, 0) / filteredDeals.length).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
              <Card>
                <div className="flex items-center space-x-3">
                  <Clock className="w-8 h-8 text-yellow-500" />
                  <div>
                    <p className="text-secondary-400 text-sm">Avg Cycle</p>
                    <p className="text-2xl font-bold text-white">28 days</p>
                  </div>
                </div>
              </Card>
              <Card>
                <div className="flex items-center space-x-3">
                  <Users className="w-8 h-8 text-purple-500" />
                  <div>
                    <p className="text-secondary-400 text-sm">Team Deals</p>
                    <p className="text-2xl font-bold text-white">{filteredDeals.length}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Deals Grid */}
            {filteredDeals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredDeals.map((deal) => (
                  <DealCard key={deal.id} deal={deal} onViewDeal={handleViewDeal} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={TrendingUp}
                title="No deals found"
                description={searchTerm || selectedStage !== 'all' ? 'Try adjusting your search criteria or filters' : 'Create your first deal to get started'}
                guruSuggestion="Help me create my first deal"
                actionLabel="Create Deal"
                onAction={() => setShowCreateModal(true)}
              />
            )}
          </>
        )}

        {/* Modals */}
        {showCreateModal && (
          <CreateDealModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onDealCreated={handleDealCreated}
          />
        )}

        {showDetailsModal && selectedDeal && (
          <DealDetailsModal
            isOpen={showDetailsModal}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedDeal(null);
            }}
            deal={selectedDeal}
          />
        )}

        {showNotesModal && selectedDeal && (
          <DealNotesModal
            isOpen={showNotesModal}
            onClose={() => {
              setShowNotesModal(false);
              setSelectedDeal(null);
            }}
            deal={selectedDeal}
          />
        )}

        {showEmailsModal && selectedDeal && (
          <DealEmailsModal
            isOpen={showEmailsModal}
            onClose={() => {
              setShowEmailsModal(false);
              setSelectedDeal(null);
            }}
            deal={selectedDeal}
          />
        )}
      </div>
    </Container>
  );
};

// Deal Card Component
const DealCard = ({ deal, onViewDeal }: { deal: Deal, onViewDeal: (deal: Deal) => void }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-green-500 bg-green-500/10 border-green-500/20';
      default: return 'text-secondary-400 bg-secondary-500/10 border-secondary-500/20';
    }
  };

  const isOverdue = (date?: string) => {
    return date && new Date(date) < new Date();
  };

  return (
    <Card 
      hover 
      className="cursor-pointer bg-white/10 backdrop-blur-md border border-secondary-600/50 hover:border-primary-600/50 transition-all duration-300 group"
      padding="sm"
      onClick={() => onViewDeal(deal)}
    >
      <div className="space-y-3">
        {/* Header with Deal ID and Priority */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs font-mono text-primary-400 bg-primary-600/10 px-2 py-1 rounded">
                {deal.deal_id}
              </span>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(deal.priority)}`}>
                {deal.priority}
              </div>
            </div>
            <h3 className="font-semibold text-white group-hover:text-primary-300 transition-colors">
              {deal.title}
            </h3>
            <p className="text-secondary-400 text-sm">{deal.company}</p>
          </div>
          <div className="text-right">
            <Badge variant="secondary" className="mb-2">
              ${deal.value.toLocaleString()}
            </Badge>
            {deal.drive_url && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(deal.drive_url, '_blank');
                }}
                className="block p-1 text-secondary-400 hover:text-primary-400 transition-colors"
                title="Open Drive Folder"
              >
                <FolderOpen className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Deal Info */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-secondary-400">Contact:</span>
            <span className="text-white">{deal.contact}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-secondary-400">Last Activity:</span>
            <span className="text-white">{deal.lastActivity}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-secondary-400">Probability:</span>
            <span className="text-accent-500 font-medium">{deal.probability}%</span>
          </div>
          {deal.next_action && (
            <div className="flex items-center justify-between">
              <span className="text-secondary-400">Next Action:</span>
              <span className={`text-sm font-medium ${isOverdue(deal.next_action_date) ? 'text-red-400' : 'text-white'}`}>
                {deal.next_action}
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-secondary-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-accent-500 to-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${deal.probability}%` }}
          ></div>
        </div>

        {/* Team Members */}
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-secondary-400" />
          <div className="flex -space-x-1">
            {deal.team_members.slice(0, 3).map((member, index) => (
              <div
                key={index}
                className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-xs text-white border-2 border-secondary-800"
                title={member}
              >
                {member.split(' ').map(n => n[0]).join('')}
              </div>
            ))}
            {deal.team_members.length > 3 && (
              <div className="w-6 h-6 bg-secondary-600 rounded-full flex items-center justify-center text-xs text-white border-2 border-secondary-800">
                +{deal.team_members.length - 3}
              </div>
            )}
          </div>
        </div>

        {/* Activity Stats */}
        <div className="flex items-center justify-between text-xs text-secondary-400">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <MessageSquare className="w-3 h-3" />
              <span>{deal.notes_count}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Mail className="w-3 h-3" />
              <span>{deal.emails_count}</span>
            </div>
          </div>
          <span>Created {deal.created_at.toLocaleDateString()}</span>
        </div>

        {/* Unified Action Button */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDeal(deal);
            }}
            className="w-full btn-primary text-sm flex items-center justify-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>View Deal Details</span>
          </button>
        </div>
      </div>
    </Card>
  );
};

export default Deals;