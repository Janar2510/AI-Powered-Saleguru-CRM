import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Plus, 
  MoreHorizontal, 
  DollarSign, 
  Calendar, 
  User, 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  Tag, 
  FileText, 
  MessageSquare, 
  Activity, 
  Star, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Trash2, 
  Copy, 
  Share2, 
  Eye,
  Clock,
  TrendingUp,
  Users,
  Target,
  Zap,
  Filter,
  Search,
  CheckSquare,
  Square,
  RefreshCw
} from 'lucide-react';
import { Deal, PipelineStage, DealFilter } from '../../types/deals';
import { DealsAPI } from '../../lib/deals-api';
import Card from '../ui/Card';
import { format } from 'date-fns';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { StageColumn } from './StageColumn';
import { DealModal } from './DealModal';
import { DealDetailModal } from './DealDetailModal';
import { usePlan } from '../../contexts/PlanContext';

interface KanbanBoardProps {
  pipelineId: string;
  filters?: DealFilter;
  onDealUpdate?: (deal: Deal) => void;
  onSelectionChange?: (dealIds: string[]) => void;
}

interface DealCardProps {
  deal: Deal;
  onEdit: (deal: Deal) => void;
  onView: (deal: Deal) => void;
  onDelete: (deal: Deal) => void;
  isSelected: boolean;
  onSelect: (dealId: string, selected: boolean) => void;
}

const DealCard: React.FC<DealCardProps> = ({ 
  deal, 
  onEdit, 
  onView, 
  onDelete, 
  isSelected, 
  onSelect 
}) => {
  console.log('Rendering DealCard:', deal);
  const [showActions, setShowActions] = useState(false);

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
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'lost':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'open':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      default:
        return <Activity className="w-4 h-4 text-blue-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-400';
    if (probability >= 60) return 'text-yellow-400';
    if (probability >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="mb-3 transition-all duration-200">
      <Card 
        className={`p-4 bg-surface/90 backdrop-blur-sm border transition-all duration-200 cursor-pointer group hover:shadow-lg hover:scale-[1.02] ${
          isSelected 
            ? 'border-accent bg-accent/10' 
            : 'border-dark-200 hover:border-dark-300'
        }`}
        onClick={() => onView(deal)}
      >
        {/* Selection Checkbox */}
        <div className="flex items-start justify-between mb-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect(deal.id, e.target.checked);
            }}
            className="w-4 h-4 text-accent bg-dark-200 border-dark-300 rounded focus:ring-accent focus:ring-2"
          />
          
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="p-1 rounded hover:bg-dark-200/50 transition-colors"
            >
              <MoreHorizontal className="w-4 h-4 text-dark-400" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 top-8 w-48 bg-dark-100 border border-dark-200 rounded-lg shadow-xl z-10">
                <div className="py-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(deal);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-dark-200 flex items-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(deal);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-dark-200 flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Deal</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(deal.id);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-dark-200 flex items-center space-x-2"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy ID</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(deal);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Deal Title */}
        <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-accent transition-colors">
          {deal.title}
        </h3>

        {/* Deal Value and Probability */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="font-semibold text-white">
              {formatCurrency(deal.value)}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Target className="w-3 h-3 text-dark-400" />
            <span className={`text-sm font-medium ${getProbabilityColor(deal.probability)}`}>
              {deal.probability}%
            </span>
          </div>
        </div>

        {/* Company and Contact Info */}
        <div className="flex items-center space-x-2 mb-2">
          <Building className="w-3 h-3 text-dark-400" />
          <span className="text-sm text-dark-300 truncate">
            {deal.company && deal.company.name ? deal.company.name : 'Unknown Company'}
          </span>
        </div>

        <div className="flex items-center space-x-2 mb-2">
          <User className="w-3 h-3 text-dark-400" />
          <span className="text-sm text-dark-300 truncate">
            {deal.contact && deal.contact.name ? deal.contact.name : 'Unknown Contact'}
          </span>
        </div>

        {/* Stage and Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {getStatusIcon(deal.status)}
            <span className="text-xs text-dark-400 capitalize">
              {deal.status}
            </span>
          </div>
          
          {deal.stage && (
            <span className="text-xs px-2 py-1 bg-dark-200/50 text-dark-300 rounded-full">
              {deal.stage.name}
            </span>
          )}
        </div>

        {/* Tags */}
        {deal.tags && deal.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {deal.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30"
              >
                {tag}
              </span>
            ))}
            {deal.tags.length > 2 && (
              <span className="text-xs px-2 py-1 bg-dark-200/50 text-dark-400 rounded-full">
                +{deal.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Priority Badge */}
        {deal.priority && (
          <div className="mb-3">
            <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(deal.priority)}`}>
              {deal.priority} Priority
            </span>
          </div>
        )}

        {/* Activity Indicators */}
        <div className="flex items-center justify-between text-xs text-dark-400">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>
              {format(new Date(deal.created_at), 'MMM d')}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            {deal.activities_count > 0 && (
              <div className="flex items-center space-x-1">
                <Activity className="w-3 h-3" />
                <span>{deal.activities_count}</span>
              </div>
            )}
            
            {deal.emails_count > 0 && (
              <div className="flex items-center space-x-1">
                <Mail className="w-3 h-3" />
                <span>{deal.emails_count}</span>
              </div>
            )}
            
            {deal.tasks_count > 0 && (
              <div className="flex items-center space-x-1">
                <Target className="w-3 h-3" />
                <span>{deal.tasks_count}</span>
              </div>
            )}
          </div>
        </div>

        {/* Next Activity */}
        {deal.next_activity && (
          <div className="mt-3 p-2 bg-dark-200/30 rounded-lg">
            <div className="flex items-center space-x-2 text-xs">
              <Clock className="w-3 h-3 text-yellow-400" />
              <span className="text-dark-300">Next: {deal.next_activity.title}</span>
            </div>
            <div className="text-xs text-dark-400 mt-1">
              {format(new Date(deal.next_activity.due_date), 'MMM d, h:mm a')}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-3 pt-3 border-t border-dark-200/30 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(deal);
            }}
            className="p-1 rounded hover:bg-dark-200/50 transition-colors"
            title="Edit Deal"
          >
            <Edit className="w-3 h-3 text-dark-400" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Add task functionality
            }}
            className="p-1 rounded hover:bg-dark-200/50 transition-colors"
            title="Add Task"
          >
            <Target className="w-3 h-3 text-dark-400" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Send email functionality
            }}
            className="p-1 rounded hover:bg-dark-200/50 transition-colors"
            title="Send Email"
          >
            <Mail className="w-3 h-3 text-dark-400" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Schedule meeting functionality
            }}
            className="p-1 rounded hover:bg-dark-200/50 transition-colors"
            title="Schedule Meeting"
          >
            <Calendar className="w-3 h-3 text-dark-400" />
          </button>
        </div>
      </Card>
    </div>
  );
};

const SortableDealCard: React.FC<DealCardProps & { id: string }> = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <DealCard {...props} />
    </div>
  );
};

// Inline KanbanColumn type
type KanbanColumn = {
  stage: PipelineStage;
  deals: Deal[];
  totalValue: number;
  count: number;
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  pipelineId, 
  filters,
  onDealUpdate,
  onSelectionChange
}) => {
  const { demoMode } = usePlan();
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDeals, setSelectedDeals] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadKanbanData();
  }, [pipelineId, filters]);

  useEffect(() => {
    // Notify parent component when selection changes
    if (onSelectionChange) {
      onSelectionChange(Array.from(selectedDeals));
    }
  }, [selectedDeals, onSelectionChange]);

  const loadKanbanData = async () => {
    try {
      setLoading(true);
      
      // Load pipeline stages
      const stages = await DealsAPI.getPipelineStages(pipelineId);
      
      // Load deals for this pipeline
      const deals = await DealsAPI.getDeals({ 
        pipeline_id: pipelineId,
        search: searchTerm,
        ...filters 
      }, demoMode);

      // Debug: log deals and columns
      console.log('Loaded deals:', deals);

      // Group deals by stage
      const kanbanColumns: KanbanColumn[] = stages.map(stage => {
        const stageDeals = deals.filter(deal => deal.stage_id === stage.id);
        const totalValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0);
        
        return {
          stage,
          deals: stageDeals,
          totalValue,
          count: stageDeals.length,
        };
      });

      console.log('Kanban columns:', kanbanColumns);

      setColumns(kanbanColumns);
    } catch (error) {
      console.error('Error loading kanban data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDealMove = async (dealId: string, targetStageId: string) => {
    try {
      await DealsAPI.updateDeal(dealId, { id: dealId, stage_id: targetStageId }, demoMode);
      loadKanbanData(); // Refresh the board
      
      if (onDealUpdate) {
        const updatedDeal = await DealsAPI.getDeal(dealId, demoMode);
        if (updatedDeal) onDealUpdate(updatedDeal);
      }
    } catch (error) {
      console.error('Error moving deal:', error);
    }
  };

  const handleDealCreate = async (dealData: any) => {
    try {
      const newDeal = await DealsAPI.createDeal({
        ...dealData,
        pipeline_id: pipelineId,
      }, demoMode);
      
      setShowCreateModal(false);
      loadKanbanData();
      
      if (onDealUpdate) onDealUpdate(newDeal);
    } catch (error) {
      console.error('Error creating deal:', error);
    }
  };

  const handleDealEdit = async (dealData: any) => {
    try {
      const updatedDeal = await DealsAPI.updateDeal(dealData.id, dealData, demoMode);
      setSelectedDeal(null);
      setShowCreateModal(false);
      loadKanbanData();
      
      if (onDealUpdate) onDealUpdate(updatedDeal);
    } catch (error) {
      console.error('Error updating deal:', error);
    }
  };

  const handleDealDelete = async (dealId: string) => {
    if (!confirm('Are you sure you want to delete this deal?')) return;
    
    try {
      await DealsAPI.deleteDeal(dealId, demoMode);
      loadKanbanData();
    } catch (error) {
      console.error('Error deleting deal:', error);
    }
  };

  const handleDealView = (deal: Deal) => {
    setSelectedDeal(deal);
    setShowDetailModal(true);
  };
  
  const handleDealSelect = (dealId: string) => {
    if (!selectMode) return;
    
    const newSelected = new Set(selectedDeals);
    if (newSelected.has(dealId)) {
      newSelected.delete(dealId);
    } else {
      newSelected.add(dealId);
    }
    setSelectedDeals(newSelected);
  };
  
  const handleToggleSelectMode = () => {
    setSelectMode(!selectMode);
    if (selectMode) {
      // Clear selection when exiting select mode
      setSelectedDeals(new Set());
    }
  };
  
  const handleRefresh = () => {
    setRefreshing(true);
    loadKanbanData();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const totalPipelineValue = columns.reduce((sum, col) => sum + col.totalValue, 0);
  const totalDeals = columns.reduce((sum, col) => sum + col.count, 0);

  if (loading && columns.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        {/* Filters */}
        <Card className="p-4 bg-secondary-800 border border-secondary-700 shadow-2xl">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <input
                type="text"
                placeholder="Search deals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent w-full"
              />
            </div>
            
            <button 
              onClick={handleToggleSelectMode}
              className={`p-2 border rounded-lg transition-colors ${
                selectMode 
                  ? 'bg-accent border-accent text-white' 
                  : 'bg-secondary-700 border-secondary-600 hover:bg-secondary-600 text-secondary-400'
              }`}
              title={selectMode ? 'Exit selection mode' : 'Enter selection mode'}
            >
              {selectMode ? (
                <CheckSquare className="w-4 h-4" />
              ) : (
                <Square className="w-4 h-4" />
              )}
            </button>
            
            <button
              onClick={handleRefresh}
              className={`p-2 bg-secondary-700 border border-secondary-600 rounded-lg hover:bg-secondary-600 transition-colors ${
                refreshing ? 'text-accent' : 'text-secondary-400 hover:text-white'
              }`}
              disabled={refreshing}
              title="Refresh board"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            
            <button className="p-2 bg-secondary-700 border border-secondary-600 rounded-lg hover:bg-secondary-600 transition-colors text-secondary-400 hover:text-white">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-4 text-sm">
            <div className="flex items-center space-x-4">
              <div className="text-secondary-400">
                <span className="text-white font-medium">{totalDeals}</span> deals
              </div>
              <div className="text-secondary-400">
                Pipeline value: <span className="text-white font-medium">{formatCurrency(totalPipelineValue)}</span>
              </div>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-accent hover:text-accent/80 transition-colors flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Deal</span>
            </button>
          </div>
        </Card>

        {/* Kanban Board */}
        <div className="flex space-x-6 overflow-x-auto pb-6">
          {columns.map((column) => (
            <StageColumn
              key={column.stage.id}
              column={column}
              onDealMove={handleDealMove}
              onDealEdit={(deal) => {
                setSelectedDeal(deal);
                setShowCreateModal(true);
              }}
              onDealView={handleDealView}
              onDealDelete={handleDealDelete}
              selectMode={selectMode}
              selectedDeals={selectedDeals}
              onDealSelect={handleDealSelect}
            />
          ))}
        </div>

        {/* Modals */}
        {showCreateModal && (
          <DealModal
            deal={selectedDeal}
            pipelineId={pipelineId}
            onSave={selectedDeal ? handleDealEdit : handleDealCreate}
            onClose={() => {
              setShowCreateModal(false);
              setSelectedDeal(null);
            }}
          />
        )}

        {showDetailModal && selectedDeal && (
          <DealDetailModal
            deal={selectedDeal}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedDeal(null);
            }}
            onEdit={(deal) => {
              setShowDetailModal(false);
              setSelectedDeal(deal);
              setShowCreateModal(true);
            }}
          />
        )}
      </div>
    </DndProvider>
  );
};

export default KanbanBoard; 