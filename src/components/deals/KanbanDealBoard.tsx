import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, X, AlertTriangle, Check, DollarSign, Target, TrendingUp, Bot, Plus, Eye, Edit, Trash2, MessageSquare, Mail, Clock, User, Building } from 'lucide-react';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, TouchSensor, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { DealsAPI } from '../../lib/deals-api';
import { useToastContext } from '../../contexts/ToastContext';
import { usePlan } from '../../contexts/PlanContext';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface KanbanDealBoardProps {
  onCreateDeal: () => void;
  onViewDeal: (deal: any) => void;
  onEditDeal: (deal: any) => void;
}

const KanbanDealBoard: React.FC<KanbanDealBoardProps> = ({ onCreateDeal, onViewDeal, onEditDeal }) => {
  const { showToast } = useToastContext();
  const { demoMode } = usePlan();
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

  // Fetch deals and stages from DealsAPI
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Force demo mode for testing
        const forceDemoMode = true;
        
        // Fetch stages and deals using DealsAPI
        const stagesList = await DealsAPI.getPipelineStages();
        const dealsList = await DealsAPI.getDeals({}, forceDemoMode);

        console.log('Fetched stages:', stagesList);
        console.log('Fetched deals:', dealsList);

        // Assign deals to stages
        const stagesWithDeals = stagesList.map(stage => ({
          ...stage,
          deals: dealsList
            .filter(deal => deal.stage_id === stage.id)
            .sort((a, b) => (a.position || 0) - (b.position || 0))
            .map(deal => ({
              ...deal,
              created_at: new Date(deal.created_at),
              company: typeof deal.company === 'object' && deal.company !== null ? deal.company.name : (typeof deal.company === 'string' ? deal.company : ''),
              contact: typeof deal.contact === 'object' && deal.contact !== null ? deal.contact.name : (typeof deal.contact === 'string' ? deal.contact : ''),
            }))
        }));
        
        console.log('Stages with deals:', stagesWithDeals);
        setStages(stagesWithDeals);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load deal board data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [demoMode]);

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
    if (activeId !== overId) {
      const activeDeal = findDealById(activeId);
      if (!activeDeal) return;
      const activeStageId = activeDeal.stage_id;
      const isDropOnDeal = overId.toString().includes('deal-');
      let targetStageId: string;
      let newPosition: number;
      if (isDropOnDeal) {
        const overDeal = findDealById(overId);
        if (!overDeal) return;
        targetStageId = overDeal.stage_id;
        newPosition = overDeal.position;
      } else {
        targetStageId = overId;
        const stageDeals = stages.find(s => s.id === targetStageId)?.deals || [];
        newPosition = stageDeals.length > 0 
          ? Math.max(...stageDeals.map(d => d.position || 0)) + 1 
          : 0;
      }
      const newStages = [...stages];
      const sourceStageIndex = newStages.findIndex(s => s.id === activeStageId);
      if (sourceStageIndex !== -1) {
        newStages[sourceStageIndex].deals = newStages[sourceStageIndex].deals.filter(
          d => d.id !== activeId
        );
      }
      const destStageIndex = newStages.findIndex(s => s.id === targetStageId);
      if (destStageIndex !== -1) {
        const updatedDeal = {
          ...activeDeal,
          stage_id: targetStageId,
          position: newPosition,
          days_in_stage: targetStageId !== activeStageId ? 0 : activeDeal.days_in_stage
        };
        const destDeals = [...newStages[destStageIndex].deals];
        if (isDropOnDeal) {
          const overIndex = destDeals.findIndex(d => d.id === overId);
          if (overIndex !== -1) {
            destDeals.splice(overIndex, 0, updatedDeal);
          } else {
            destDeals.push(updatedDeal);
          }
        } else {
          destDeals.push(updatedDeal);
        }
        newStages[destStageIndex].deals = destDeals.map((deal, index) => ({
          ...deal,
          position: index
        }));
      }
      setStages(newStages);
      // Only update DealsAPI if not in demoMode
      if (!demoMode) {
        try {
          await DealsAPI.updateDeal(activeId, {
            stage_id: targetStageId,
            position: newPosition,
            days_in_stage: targetStageId !== activeStageId ? 0 : activeDeal.days_in_stage,
            updated_at: new Date().toISOString()
          });
          if (destStageIndex !== -1) {
            const destDeals = newStages[destStageIndex].deals;
            for (let i = 0; i < destDeals.length; i++) {
              if (destDeals[i].id !== activeId) {
                await DealsAPI.updateDeal(destDeals[i].id, {
                  position: i,
                  updated_at: new Date().toISOString()
                });
              }
            }
          }
          showToast({
            type: 'success',
            title: 'Deal Moved',
            message: `Deal moved to ${newStages[destStageIndex].name}!`
          });
        } catch (error) {
          console.error('Error updating deal in DealsAPI:', error);
          showToast({
            type: 'error',
            title: 'Update Failed',
            message: 'Failed to update deal position'
          });
        }
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
      // Delete from DealsAPI
      await DealsAPI.deleteDeal(dealId);
      
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
        className="mb-2.5 transition-all duration-200"
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
            <div className="bg-[#23233a]/90 backdrop-blur-sm border border-[#23233a]/50 rounded-lg px-3 py-2 text-xs text-white shadow-xl whitespace-nowrap">
              Created {daysAgo} days ago
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#23233a]/50"></div>
            </div>
          </div>
        )}

        <div 
          className={`
            cursor-grab active:cursor-grabbing rounded-xl px-4 py-4 shadow-xl border transition-all duration-300 group mb-2.5
            ${isDragging 
              ? 'bg-[#a259ff]/40 border-[#a259ff]/50 shadow-2xl ring-2 ring-[#a259ff]/60' 
              : 'bg-[#23233a]/40 backdrop-blur-sm border-[#23233a]/50 hover:border-[#a259ff]/50'
            }
          `}
        >
          <div className="space-y-3">
            {/* Header with Deal Title and ID */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className={`font-bold text-sm leading-tight mb-1 transition-colors ${
                  isDragging ? 'text-white' : 'text-white group-hover:text-[#a259ff]'
                }`}>
                  {deal.title}
                </h4>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-mono text-[#a259ff] bg-[#a259ff]/10 px-2 py-1 rounded">
                    {deal.deal_id}
                  </span>
                  <Badge 
                    variant="secondary" 
                    className={`${getStatusBadgeColor(deal.days_in_stage, deal.priority)}`}
                  >
                    {getStatusLabel(deal.days_in_stage)}
                  </Badge>
                </div>
              </div>
              <div className="text-right ml-2">
                <div className="text-lg font-bold text-[#43e7ad] mb-1">
                  ${(deal.value / 1000).toFixed(0)}K
                </div>
                {/* Priority and Status Indicators */}
                <div className="flex items-center space-x-1">
                  {deal.priority === 'high' && <span className="text-[#ef4444]" title="High Priority">🔥</span>}
                  {isStuckDeal(deal.days_in_stage) && (
                    <span className="text-[#f59e0b]" title={`${deal.days_in_stage} days in stage`}>⏳</span>
                  )}
                </div>
              </div>
            </div>

            {/* Company and Contact - Always visible */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#b0b0d0]">Company:</span>
                <span className="text-white font-medium truncate ml-2">{deal.company}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#b0b0d0]">Contact:</span>
                <span className="text-white font-medium truncate ml-2">{deal.contact}</span>
              </div>
            </div>

            {/* Last Activity with Timestamp - Always visible */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-[#b0b0d0]" />
                <span className="text-[#b0b0d0]">Last Activity:</span>
              </div>
              <span className="text-white font-medium">{deal.lastActivity}</span>
            </div>

            {/* Next Action (if exists) - Always visible */}
            {deal.next_action && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#b0b0d0]">Next Action:</span>
                <span className={`text-sm font-medium truncate ml-2 ${isOverdue(deal.next_action_date!) ? 'text-[#ef4444]' : 'text-white'}`}>
                  {deal.next_action}
                </span>
              </div>
            )}

            {/* Progress Bar with Probability - Always visible */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#b0b0d0]">Probability</span>
                <span className="text-white font-medium">{deal.probability}%</span>
              </div>
              <div className="w-full bg-[#23233a]/50 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-[#a259ff] to-[#377dff] h-2 rounded-full transition-all duration-300"
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
                    className="w-6 h-6 bg-[#a259ff] rounded-full flex items-center justify-center text-xs text-white border-2 border-[#23233a]"
                    title={member}
                  >
                    {member.split(' ').map(n => n[0]).join('')}
                  </div>
                ))}
                {deal.team_members && deal.team_members.length > 3 && (
                  <div className="w-6 h-6 bg-[#23233a]/50 rounded-full flex items-center justify-center text-xs text-white border-2 border-[#23233a]">
                    +{deal.team_members.length - 3}
                  </div>
                )}
              </div>
            </div>

            {/* Activity Stats - Always visible */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-xs text-[#b0b0d0]">
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

            {/* Action Buttons - Always visible (not hidden while dragging) */}
            <div className="flex space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDealDetails(deal);
                }}
                className="flex-1 bg-[#23233a]/50 hover:bg-[#23233a]/70 text-[#b0b0d0] hover:text-white text-xs py-1.5 flex items-center justify-center space-x-1 rounded transition-colors"
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
                className="flex-1 bg-[#23233a]/50 hover:bg-[#23233a]/70 text-[#b0b0d0] hover:text-white text-xs py-1.5 flex items-center justify-center space-x-1 rounded transition-colors"
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
                className="flex-1 bg-[#23233a]/50 hover:bg-[#ef4444]/20 text-[#b0b0d0] hover:text-[#ef4444] text-xs py-1.5 flex items-center justify-center space-x-1 rounded transition-colors"
                title="Delete Deal"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
            
            {/* Delete Confirmation */}
            {showConfirmDelete === deal.id && (
              <div className="mt-2 p-2 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg">
                <p className="text-xs text-[#ef4444] mb-2">Delete this deal?</p>
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDeal(deal.id);
                    }}
                    className="flex-1 bg-[#ef4444] hover:bg-[#dc2626] text-white text-xs py-1 rounded flex items-center justify-center space-x-1 transition-colors"
                  >
                    <Check className="w-3 h-3" />
                    <span>Yes</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowConfirmDelete(null);
                    }}
                    className="flex-1 bg-[#23233a]/50 hover:bg-[#23233a]/70 text-white text-xs py-1 rounded flex items-center justify-center space-x-1 transition-colors"
                  >
                    <X className="w-3 h-3" />
                    <span>No</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  });

  const StageColumn = React.memo(({ stage }: { stage: any }) => {
    const stageValue = stage.deals.reduce((sum: number, deal: any) => sum + deal.value, 0);

    return (
      <div className="flex-shrink-0 w-80 bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 shadow-lg">
        {/* Stage Header */}
        <div className="sticky top-0 z-10 bg-[#23233a]/95 backdrop-blur-sm p-4 border-b border-[#23233a]/30 rounded-t-xl">
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
            <span className="text-[#b0b0d0]">Total Value</span>
            <span className="font-semibold text-[#43e7ad]">
              ${(stageValue / 1000).toFixed(0)}K
            </span>
          </div>
        </div>

        {/* Deals List */}
        <div
          data-droppable-id={stage.id}
          className="p-4 min-h-[220px] space-y-2.5 transition-all duration-300"
        >
          <SortableContext items={stage.deals.map((deal: any) => deal.id)} strategy={verticalListSortingStrategy}>
            {stage.deals.length > 0 ? (
              stage.deals.map((deal: any, index: number) => (
                <SortableDealCard key={deal.id} deal={deal} index={index} />
              ))
            ) : (
              <div className="text-center py-10">
                <Target className="w-10 h-10 text-[#b0b0d0] mx-auto mb-3" />
                <p className="text-[#b0b0d0] text-base">No deals in {stage.name}</p>
              </div>
            )}
          </SortableContext>
          
          {/* Add Deal Button */}
          <button 
            onClick={onCreateDeal}
            className="w-full mt-4 py-2 px-4 bg-[#23233a]/50 hover:bg-[#23233a]/70 text-[#b0b0d0] hover:text-white rounded-lg transition-colors text-base flex items-center justify-center space-x-2 shadow-md"
          >
            <Plus className="w-5 h-5" />
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
          <div className="w-8 h-8 border-2 border-[#a259ff] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#b0b0d0]">Loading deals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl text-center">
        <AlertTriangle className="w-12 h-12 text-[#ef4444] mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Failed to Load Deals</h3>
        <p className="text-[#ef4444] mb-4">{error}</p>
        <Button variant="primary">
          Try Again
        </Button>
      </div>
    );
  }

  const totalPipelineValue = stages.reduce((sum, stage) => 
    sum + stage.deals.reduce((stageSum: number, deal: any) => stageSum + deal.value, 0), 0
  );

  const stuckDeals = stages.flatMap(stage => stage.deals).filter(deal => isStuckDeal(deal.days_in_stage));

  return (
    <div className="space-y-5 relative">
      {/* Custom CSS for drag highlighting */}
      <style>{`
        .drag-destination-highlight {
          background-color: rgba(162, 89, 255, 0.1) !important;
          border-color: rgba(162, 89, 255, 0.3) !important;
          transform: scale(1.02);
          transition: all 0.2s ease;
        }
      `}</style>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl p-4 border border-[#23233a]/50">
          <div className="flex items-center space-x-3">
            <DollarSign className="w-8 h-8 text-[#43e7ad]" />
            <div>
              <p className="text-[#b0b0d0] text-sm">Total Pipeline</p>
              <p className="text-xl font-bold text-white">${(totalPipelineValue / 1000).toFixed(0)}K</p>
            </div>
          </div>
        </div>
        <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl p-4 border border-[#23233a]/50">
          <div className="flex items-center space-x-3">
            <Target className="w-8 h-8 text-[#377dff]" />
            <div>
              <p className="text-[#b0b0d0] text-sm">Active Deals</p>
              <p className="text-xl font-bold text-white">
                {stages.reduce((sum, stage) => sum + stage.deals.length, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl p-4 border border-[#23233a]/50">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-8 h-8 text-[#a259ff]" />
            <div>
              <p className="text-[#b0b0d0] text-sm">Win Rate</p>
              <p className="text-xl font-bold text-white">
                {stages.length > 0 ? Math.round((stages.find(s => s.name === 'Closed Won')?.deals.length || 0) / Math.max(stages.reduce((sum, stage) => sum + stage.deals.length, 0), 1) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
        <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl p-4 border border-[#23233a]/50">
          <div className="flex items-center space-x-3">
            <Bot className="w-8 h-8 text-[#f59e0b]" />
            <div>
              <p className="text-[#b0b0d0] text-sm">Stuck Deals</p>
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

      {/* Kanban Board Container */}
      <div className="relative">
        {/* Main Kanban Board */}
        <div className="relative bg-[#23233a]/20 backdrop-blur-sm rounded-2xl border border-[#23233a]/30 p-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToWindowEdges]}
          >
            <div className="flex space-x-2.5 overflow-x-auto pb-4">
              {stages.map((stage) => (
                <StageColumn key={stage.id} stage={stage} />
              ))}
            </div>
            <DragOverlay>
              {activeDeal ? (
                <div className="transform rotate-2 scale-105">
                  <DealCard deal={activeDeal} isDragging={true} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </div>
  );
};

export default KanbanDealBoard;