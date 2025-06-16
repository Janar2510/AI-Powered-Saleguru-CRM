import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, X, AlertTriangle, Check, DollarSign, Target, TrendingUp, Bot, Plus, Eye, Edit, Trash2, MessageSquare, Mail, Clock, User, Building } from 'lucide-react';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, TouchSensor, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { createClient } from '@supabase/supabase-js';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { useToastContext } from '../../contexts/ToastContext';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface KanbanDealBoardProps {
  onCreateDeal: () => void;
  onViewDeal: (deal: any) => void;
  onEditDeal: (deal: any) => void;
}

const KanbanDealBoard: React.FC<KanbanDealBoardProps> = ({ onCreateDeal, onViewDeal, onEditDeal }) => {
  const { showToast } = useToastContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedDeal, setDraggedDeal] = useState<string | null>(null);
  const [activeDeal, setActiveDeal] = useState<any | null>(null);
  const [stages, setStages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<any | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

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
        
        // Fetch deals
        const { data: dealsData, error: dealsError } = await supabase
          .from('deals')
          .select('*')
          .order('position');
        
        if (dealsError) throw dealsError;
        
        // Process deals data
        const processedDeals = dealsData || [];
        
        // Assign deals to stages
        const stagesWithDeals = stagesList.map(stage => ({
          ...stage,
          deals: processedDeals
            .filter(deal => deal.stage_id === stage.id)
            .sort((a, b) => a.position - b.position)
            .map(deal => ({
              ...deal,
              created_at: new Date(deal.created_at)
            }))
        }));
        
        setStages(stagesWithDeals);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load deal board data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleDragStart = (event: any) => {
    const { active } = event;
    setDraggedDeal(active.id);
    
    // Find the deal being dragged
    const draggedDealData = findDealById(active.id);
    if (draggedDealData) {
      setActiveDeal(draggedDealData);
    }
    
    // Add visual feedback to destination columns
    const columns = document.querySelectorAll('[data-droppable-id]');
    columns.forEach(column => {
      if (column.getAttribute('data-droppable-id') !== active.data.current?.sortable.containerId) {
        column.classList.add('drag-destination-highlight');
      }
    });
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    
    setDraggedDeal(null);
    setActiveDeal(null);
    
    // Remove visual feedback
    const columns = document.querySelectorAll('[data-droppable-id]');
    columns.forEach(column => {
      column.classList.remove('drag-destination-highlight');
    });

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    
    // If dropped on another deal (within same stage or different stage)
    if (activeId !== overId) {
      const activeDeal = findDealById(activeId);
      if (!activeDeal) return;
      
      const activeStageId = activeDeal.stage_id;
      
      // Determine if this is a drop on a deal or a stage
      const isDropOnDeal = overId.toString().includes('deal-');
      
      let targetStageId: string;
      let newPosition: number;
      
      if (isDropOnDeal) {
        // Dropped on another deal
        const overDeal = findDealById(overId);
        if (!overDeal) return;
        
        targetStageId = overDeal.stage_id;
        newPosition = overDeal.position;
      } else {
        // Dropped directly on a stage
        targetStageId = overId;
        
        // Get the last position in the target stage
        const stageDeals = stages.find(s => s.id === targetStageId)?.deals || [];
        newPosition = stageDeals.length > 0 
          ? Math.max(...stageDeals.map(d => d.position || 0)) + 1 
          : 0;
      }
      
      // Update local state first for immediate feedback
      const newStages = [...stages];
      
      // Remove from source stage
      const sourceStageIndex = newStages.findIndex(s => s.id === activeStageId);
      if (sourceStageIndex !== -1) {
        newStages[sourceStageIndex].deals = newStages[sourceStageIndex].deals.filter(
          d => d.id !== activeId
        );
      }
      
      // Add to destination stage
      const destStageIndex = newStages.findIndex(s => s.id === targetStageId);
      if (destStageIndex !== -1) {
        const updatedDeal = {
          ...activeDeal,
          stage_id: targetStageId,
          position: newPosition,
          days_in_stage: targetStageId !== activeStageId ? 0 : activeDeal.days_in_stage
        };
        
        // Insert at the right position
        const destDeals = [...newStages[destStageIndex].deals];
        if (isDropOnDeal) {
          // Find the index of the over deal
          const overIndex = destDeals.findIndex(d => d.id === overId);
          if (overIndex !== -1) {
            destDeals.splice(overIndex, 0, updatedDeal);
          } else {
            destDeals.push(updatedDeal);
          }
        } else {
          destDeals.push(updatedDeal);
        }
        
        // Update positions for all deals in the destination stage
        newStages[destStageIndex].deals = destDeals.map((deal, index) => ({
          ...deal,
          position: index
        }));
      }
      
      setStages(newStages);
      
      // Update in Supabase
      try {
        // Update the moved deal
        const { error: updateError } = await supabase
          .from('deals')
          .update({
            stage_id: targetStageId,
            position: newPosition,
            days_in_stage: targetStageId !== activeStageId ? 0 : activeDeal.days_in_stage,
            updated_at: new Date().toISOString()
          })
          .eq('id', activeId);
        
        if (updateError) throw updateError;
        
        // Update positions for all deals in the destination stage
        if (destStageIndex !== -1) {
          const destDeals = newStages[destStageIndex].deals;
          
          for (let i = 0; i < destDeals.length; i++) {
            if (destDeals[i].id !== activeId) {
              const { error: posError } = await supabase
                .from('deals')
                .update({
                  position: i,
                  updated_at: new Date().toISOString()
                })
                .eq('id', destDeals[i].id);
              
              if (posError) console.error('Error updating position:', posError);
            }
          }
        }
        
        // Show success feedback
        showToast({
          type: 'success',
          title: 'Deal Moved',
          message: `Deal moved to ${newStages[destStageIndex].name}!`
        });
      } catch (error) {
        console.error('Error updating deal in Supabase:', error);
        showToast({
          type: 'error',
          title: 'Update Failed',
          message: 'Failed to update deal position'
        });
      }
    }
  };

  const findDealById = (id: string): any | null => {
    for (const stage of stages) {
      const deal = stage.deals.find((d: any) => d.id === id);
      if (deal) return deal;
    }
    return null;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 border-red-500';
      case 'medium': return 'text-yellow-500 border-yellow-500';
      case 'low': return 'text-green-500 border-green-500';
      default: return 'text-secondary-400 border-secondary-400';
    }
  };

  const getStatusBadgeColor = (daysInStage: number, priority: string) => {
    if (daysInStage > 14) return 'bg-red-500/20 text-red-400 border-red-500/30'; // Overdue
    if (daysInStage > 7) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'; // Idle
    return 'bg-green-500/20 text-green-400 border-green-500/30'; // Active
  };

  const getStatusLabel = (daysInStage: number) => {
    if (daysInStage > 14) return 'Overdue';
    if (daysInStage > 7) return 'Idle';
    return 'Active';
  };

  const isOverdue = (date: string) => {
    return new Date(date) < new Date();
  };

  const isStuckDeal = (daysInStage: number) => {
    return daysInStage > 7;
  };

  const handleViewDealDetails = (deal: any) => {
    onViewDeal(deal);
  };

  const handleEditDealDetails = (deal: any) => {
    onEditDeal(deal);
  };

  const handleDeleteDeal = async (dealId: string) => {
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', dealId);
      
      if (error) throw error;
      
      // Update local state
      const newStages = stages.map(stage => ({
        ...stage,
        deals: stage.deals.filter(deal => deal.id !== dealId)
      }));
      
      setStages(newStages);
      setShowConfirmDelete(null);
      
      showToast({
        type: 'success',
        title: 'Deal Deleted',
        message: 'Deal has been deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting deal:', error);
      showToast({
        type: 'error',
        title: 'Deletion Failed',
        message: 'Failed to delete deal'
      });
    }
  };

  const SortableDealCard = ({ deal, index }: { deal: any; index: number }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging
    } = useSortable({
      id: deal.id,
      data: {
        deal
      }
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 999 : 'auto'
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="mb-3 transition-all duration-200"
      >
        <DealCard deal={deal} isDragging={isDragging} />
      </div>
    );
  };

  const DealCard = React.memo(({ deal, isDragging }: { deal: any; isDragging: boolean }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const daysAgo = Math.floor((Date.now() - deal.created_at.getTime()) / (1000 * 60 * 60 * 24));

    return (
      <div
        className={`relative transition-all duration-200 ${
          isDragging 
            ? 'z-[9999] transform rotate-2 scale-105 shadow-2xl' 
            : 'hover:shadow-lg hover:scale-[1.02]'
        }`}
        onMouseEnter={() => !isDragging && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={(e) => {
          e.stopPropagation();
          if (!isDragging) {
            handleViewDealDetails(deal);
          }
        }}
      >
        {/* Tooltip - only show when not dragging */}
        {showTooltip && !isDragging && (
          <div className="absolute z-50 -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full">
            <div className="bg-secondary-800/90 backdrop-blur-sm border border-secondary-600 rounded-lg px-3 py-2 text-xs text-white shadow-xl whitespace-nowrap">
              Created {daysAgo} days ago
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-secondary-600"></div>
            </div>
          </div>
        )}

        <Card 
          className={`
            cursor-grab active:cursor-grabbing rounded-xl px-3 py-2 shadow-lg border transition-all duration-300 group
            ${isDragging 
              ? 'bg-primary-600/30 border-primary-400 shadow-2xl ring-2 ring-primary-400/50' 
              : 'bg-dark/60 border-secondary-600/50 hover:border-primary-600/50'
            }
          `}
          padding="none"
          variant={isDragging ? "elevated" : "glass"}
        >
          <div className="space-y-2">
            {/* Header with Deal Title and ID */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className={`font-bold text-sm leading-tight mb-1 transition-colors ${
                  isDragging ? 'text-white' : 'text-white group-hover:text-primary-300'
                }`}>
                  {deal.title}
                </h4>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-mono text-primary-400 bg-primary-600/10 px-2 py-1 rounded">
                    {deal.deal_id}
                  </span>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(deal.days_in_stage, deal.priority)}`}>
                    {getStatusLabel(deal.days_in_stage)}
                  </div>
                </div>
              </div>
              <div className="text-right ml-2">
                <div className="text-lg font-bold text-green-500 mb-1">
                  ${(deal.value / 1000).toFixed(0)}K
                </div>
                {/* Priority and Status Indicators */}
                <div className="flex items-center space-x-1">
                  {deal.priority === 'high' && <span className="text-red-500" title="High Priority">🔥</span>}
                  {isStuckDeal(deal.days_in_stage) && (
                    <span className="text-yellow-500" title={`${deal.days_in_stage} days in stage`}>⏳</span>
                  )}
                </div>
              </div>
            </div>

            {/* Company and Contact - Always visible */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary-400">Company:</span>
                <span className="text-white font-medium truncate ml-2">{deal.company}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary-400">Contact:</span>
                <span className="text-white font-medium truncate ml-2">{deal.contact}</span>
              </div>
            </div>

            {/* Last Activity with Timestamp - Always visible */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-secondary-400" />
                <span className="text-secondary-400">Last Activity:</span>
              </div>
              <span className="text-white font-medium">{deal.lastActivity}</span>
            </div>

            {/* Next Action (if exists) - Always visible */}
            {deal.next_action && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary-400">Next Action:</span>
                <span className={`text-sm font-medium truncate ml-2 ${isOverdue(deal.next_action_date!) ? 'text-red-400' : 'text-white'}`}>
                  {deal.next_action}
                </span>
              </div>
            )}

            {/* Progress Bar with Probability - Always visible */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-secondary-400">Probability</span>
                <span className="text-white font-medium">{deal.probability}%</span>
              </div>
              <div className="w-full bg-secondary-700/70 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-accent-500 to-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${deal.probability}%` }}
                ></div>
              </div>
            </div>

            {/* Team Members */}
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-1">
                {deal.team_members && deal.team_members.slice(0, 3).map((member, index) => (
                  <div
                    key={index}
                    className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-xs text-white border-2 border-secondary-800"
                    title={member}
                  >
                    {member.split(' ').map(n => n[0]).join('')}
                  </div>
                ))}
                {deal.team_members && deal.team_members.length > 3 && (
                  <div className="w-6 h-6 bg-secondary-600 rounded-full flex items-center justify-center text-xs text-white border-2 border-secondary-800">
                    +{deal.team_members.length - 3}
                  </div>
                )}
              </div>
            </div>

            {/* Activity Stats - Always visible */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-xs text-secondary-400">
                <div className="flex items-center space-x-1">
                  <MessageSquare className="w-3 h-3" />
                  <span>{deal.notes_count || 0}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Mail className="w-3 h-3" />
                  <span>{deal.emails_count || 0}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons - Hidden while dragging */}
            {!isDragging && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="flex space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDealDetails(deal);
                    }}
                    className="flex-1 btn-secondary text-xs py-1.5 flex items-center justify-center space-x-1 hover:bg-secondary-500"
                    title="View Deal"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditDealDetails(deal);
                    }}
                    className="flex-1 btn-secondary text-xs py-1.5 flex items-center justify-center space-x-1 hover:bg-secondary-500"
                    title="Edit Deal"
                  >
                    <Edit className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowConfirmDelete(deal.id);
                    }}
                    className="flex-1 btn-secondary text-xs py-1.5 flex items-center justify-center space-x-1 hover:bg-red-500/20 text-red-400 hover:text-red-300"
                    title="Delete Deal"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )}
            
            {/* Delete Confirmation */}
            {showConfirmDelete === deal.id && (
              <div className="mt-2 p-2 bg-red-900/20 border border-red-600/30 rounded-lg">
                <p className="text-xs text-red-300 mb-2">Delete this deal?</p>
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDeal(deal.id);
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs py-1 rounded flex items-center justify-center space-x-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>Yes</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowConfirmDelete(null);
                    }}
                    className="flex-1 bg-secondary-600 hover:bg-secondary-500 text-white text-xs py-1 rounded flex items-center justify-center space-x-1"
                  >
                    <X className="w-3 h-3" />
                    <span>No</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  });

  const StageColumn = React.memo(({ stage }: { stage: any }) => {
    const stageValue = stage.deals.reduce((sum: number, deal: any) => sum + deal.value, 0);

    return (
      <div className="flex-shrink-0 w-72 bg-secondary-800/30 backdrop-blur-md rounded-xl border border-secondary-700/50">
        {/* Stage Header */}
        <div className="sticky top-0 z-10 bg-secondary-800/90 backdrop-blur-sm p-3 border-b border-secondary-700 rounded-t-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 ${stage.color} rounded-full`}></div>
              <h3 className="font-semibold text-white">{stage.name}</h3>
            </div>
            <Badge variant="secondary" size="sm">
              {stage.deals.length}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-secondary-400">Total Value</span>
            <span className="font-semibold text-green-500">
              ${(stageValue / 1000).toFixed(0)}K
            </span>
          </div>
        </div>

        {/* Deals List */}
        <div
          data-droppable-id={stage.id}
          className="p-3 min-h-[200px] transition-all duration-300"
        >
          <SortableContext items={stage.deals.map((deal: any) => deal.id)} strategy={verticalListSortingStrategy}>
            {stage.deals.length > 0 ? (
              stage.deals.map((deal: any, index: number) => (
                <SortableDealCard key={deal.id} deal={deal} index={index} />
              ))
            ) : (
              <div className="text-center py-8">
                <div>
                  <Target className="w-8 h-8 text-secondary-600 mx-auto mb-2" />
                  <p className="text-secondary-400 text-sm">No deals in {stage.name}</p>
                </div>
              </div>
            )}
          </SortableContext>
          
          {/* Add Deal Button */}
          <button 
            onClick={onCreateDeal}
            className="w-full mt-2 py-2 px-3 bg-secondary-700/70 hover:bg-secondary-600/70 text-secondary-400 hover:text-white rounded-lg transition-colors text-sm flex items-center justify-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add Deal</span>
          </button>
        </div>
      </div>
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary-400">Loading deals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-900/20 border border-red-600/30 rounded-lg text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Failed to Load Deals</h3>
        <p className="text-red-300 mb-4">{error}</p>
        <button className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  const totalPipelineValue = stages.reduce((sum, stage) => 
    sum + stage.deals.reduce((stageSum: number, deal: any) => stageSum + deal.value, 0), 0
  );

  const stuckDeals = stages.flatMap(stage => stage.deals).filter(deal => isStuckDeal(deal.days_in_stage));

  return (
    <div className="space-y-5">
      {/* Custom CSS for drag highlighting */}
      <style jsx>{`
        .drag-destination-highlight {
          background-color: rgba(124, 58, 237, 0.1) !important;
          border-color: rgba(124, 58, 237, 0.3) !important;
          transform: scale(1.02);
          transition: all 0.2s ease;
        }
      `}</style>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-secondary-700/60 backdrop-blur-md rounded-lg p-4 border border-secondary-600/50">
          <div className="flex items-center space-x-3">
            <DollarSign className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-secondary-400 text-sm">Total Pipeline</p>
              <p className="text-xl font-bold text-white">${(totalPipelineValue / 1000).toFixed(0)}K</p>
            </div>
          </div>
        </div>
        <div className="bg-secondary-700/60 backdrop-blur-md rounded-lg p-4 border border-secondary-600/50">
          <div className="flex items-center space-x-3">
            <Target className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-secondary-400 text-sm">Active Deals</p>
              <p className="text-xl font-bold text-white">
                {stages.reduce((sum, stage) => sum + stage.deals.length, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-secondary-700/60 backdrop-blur-md rounded-lg p-4 border border-secondary-600/50">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-secondary-400 text-sm">Avg Deal Size</p>
              <p className="text-xl font-bold text-white">
                ${Math.round(totalPipelineValue / stages.reduce((sum, stage) => sum + stage.deals.length, 0) / 1000) || 0}K
              </p>
            </div>
          </div>
        </div>
        <div className="bg-secondary-700/60 backdrop-blur-md rounded-lg p-4 border border-secondary-600/50">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-secondary-400 text-sm">Stuck Deals</p>
              <p className="text-xl font-bold text-white">{stuckDeals.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Guru Insights for Stuck Deals */}
      {stuckDeals.length > 0 && (
        <div className="bg-secondary-700/60 backdrop-blur-md rounded-lg p-6 border border-secondary-600/50">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-primary-600/30 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-white">Guru Insights</h3>
              <p className="text-secondary-300 text-sm mt-1">
                You have {stuckDeals.length} stuck deals that need attention. The most critical is "{stuckDeals[0]?.title}" which has been in {stages.find(s => s.id === stuckDeals[0]?.stage_id)?.name} for {stuckDeals[0]?.days_in_stage} days.
              </p>
              <div className="flex space-x-2 mt-3">
                <button 
                  onClick={() => {
                    showToast({
                      type: 'info',
                      title: 'AI Analysis',
                      message: 'Analyzing stuck deals...'
                    });
                  }}
                  className="btn-primary text-sm">
                  Ask Guru for Help
                </button>
                <button 
                  onClick={() => {
                    showToast({
                      type: 'info',
                      title: 'Stuck Deals',
                      message: 'Showing stuck deals view...'
                    });
                  }}
                  className="btn-secondary text-sm">
                  View Stuck Deals
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deal Board */}
      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToWindowEdges]}
      >
        <div className="overflow-x-auto pb-4">
          <div className="flex space-x-4 min-w-max">
            {stages
              .sort((a, b) => {
                // Custom sort order for stages
                const order = ['lead', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'];
                return order.indexOf(a.id) - order.indexOf(b.id);
              })
              .map((stage) => (
                <StageColumn key={stage.id} stage={stage} />
              ))}
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeDeal ? (
            <div className="w-72 opacity-90 rotate-3 shadow-2xl">
              <DealCard deal={activeDeal} isDragging={true} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default KanbanDealBoard;