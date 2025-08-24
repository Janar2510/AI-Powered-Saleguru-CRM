import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Target
} from 'lucide-react';

import {
  BrandCard,
  BrandButton,
  BrandBadge
} from '../../contexts/BrandDesignContext';

import { Deal, PIPELINE_STAGES, useDeals } from '../../hooks/useDeals';
import { SimpleDealCard } from './SimpleDealCard';
import { BrandedDealModal } from './BrandedDealModal';

interface DealsKanbanBoardProps {
  className?: string;
}

export const DealsKanbanBoard: React.FC<DealsKanbanBoardProps> = ({ className = '' }) => {
  const { 
    dealsByStage, 
    loading, 
    createDeal, 
    updateDeal, 
    moveDealToStage, 
    deleteDeal 
  } = useDeals();

  const [draggedDeal, setDraggedDeal] = useState<{ dealId: string; fromStage: string } | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('view');
  const [showModal, setShowModal] = useState(false);


  // Handle deal drag start
  const handleDragStart = (e: React.DragEvent, dealId: string, fromStage: string) => {
    console.log('🎯 [BOARD] Drag started:', { dealId, fromStage });
    
    // Set drag data with multiple formats
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', dealId);
    e.dataTransfer.setData('application/json', JSON.stringify({ dealId, fromStage }));
    
    // Set drag state
    setDraggedDeal({ dealId, fromStage });
    
    console.log('🎯 [BOARD] Drag data set successfully');
  };

  // Handle drag over stage - CRITICAL for drop zones
  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault(); // ESSENTIAL - allows drop
    e.stopPropagation();
    
    // Set the correct drop effect
    e.dataTransfer.dropEffect = 'move';
    
    console.log('🎯🎯🎯 [BOARD] DRAG OVER DETECTED for stage:', stageId);
    console.log('🎯🎯🎯 [BOARD] Current dragged deal:', draggedDeal);
    console.log('🎯🎯🎯 [BOARD] Event target:', e.target);
    
    // Always show drop indicator
    setDragOverStage(stageId);
    console.log('🎯🎯🎯 [BOARD] Setting drag over stage to:', stageId);
  };

  // Handle drag leave stage
  const handleDragLeave = (e: React.DragEvent) => {
    console.log('🎯 [BOARD] Drag leave detected');
    
    // Use timeout to avoid flickering between adjacent elements
    setTimeout(() => {
      // Only clear if we're really leaving the drop zone
      const rect = e.currentTarget.getBoundingClientRect();
      const isStillInside = e.clientX >= rect.left && e.clientX <= rect.right &&
                           e.clientY >= rect.top && e.clientY <= rect.bottom;
      
      if (!isStillInside) {
        console.log('🎯 [BOARD] Actually leaving drop zone, clearing dragOverStage');
        setDragOverStage(null);
      }
    }, 50);
  };

  // Handle drop on stage
  const handleDrop = async (e: React.DragEvent, newStage: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🎯 [BOARD] DROP EVENT FIRED on stage:', newStage);
    console.log('🎯 [BOARD] Event details:', {
      type: e.type,
      target: e.target,
      currentTarget: e.currentTarget,
      dataTransfer: e.dataTransfer
    });
    console.log('🎯 [BOARD] Current drag state:', draggedDeal);
    
    // Clear drag UI state immediately
    setDragOverStage(null);

    if (!draggedDeal) {
      console.log('❌ [BOARD] No dragged deal found');
      return;
    }

    if (draggedDeal.fromStage === newStage) {
      console.log('🎯 [BOARD] Drop cancelled - same stage');
      setDraggedDeal(null);
      return;
    }

    console.log('🎯 [BOARD] Moving deal:', draggedDeal.dealId, 'from', draggedDeal.fromStage, 'to', newStage);
    
    try {
      const success = await moveDealToStage(draggedDeal.dealId, newStage);
      
      if (success) {
        console.log('✅ [BOARD] Deal moved successfully');
      } else {
        console.error('❌ [BOARD] Failed to move deal');
      }
    } catch (error) {
      console.error('❌ [BOARD] Error moving deal:', error);
    }
    
    setDraggedDeal(null);
  };

  // Handle drag end - cleanup
  const handleDragEnd = (e: React.DragEvent) => {
    console.log('🎯 [BOARD] Drag ended - cleaning up');
    setDraggedDeal(null);
    setDragOverStage(null);
  };

  // Handle modal actions (removed unused handleViewDeal)

  const handleEditDeal = (deal: Deal) => {
    setSelectedDeal(deal);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleCreateDeal = () => {
    setSelectedDeal(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleSaveDeal = async (data: any): Promise<boolean> => {
    if (modalMode === 'create') {
      const result = await createDeal(data);
      return !!result;
    } else if (modalMode === 'edit' && selectedDeal) {
      const result = await updateDeal(selectedDeal.id, data);
      return !!result;
    }
    return false;
  };

  const handleDeleteDeal = async (dealId: string) => {
    return await deleteDeal(dealId);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDeal(null);
  };

  // Format currency for stage headers
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get stage statistics
  const getStageStats = (stageId: string) => {
    const deals = dealsByStage[stageId] || [];
    const count = deals.length;
    const value = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
    return { count, value };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        <span className="ml-3 text-white/70">Loading deals...</span>
      </div>
    );
  }

  return (
    <div className={`${className}`}>

      {/* Kanban Board - Horizontal scrolling with stat card width */}
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-400px)]">
        {PIPELINE_STAGES.map((stage) => {
          const stageDeals = dealsByStage[stage.id] || [];
          const stageStats = getStageStats(stage.id);
          
          return (
            <motion.div
              key={stage.id}
              className="flex flex-col flex-shrink-0 min-h-full"
              style={{ 
                width: 'calc((100% - 3 * 1rem) / 4)',
                minHeight: '600px' // Make drop zone much larger
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: PIPELINE_STAGES.indexOf(stage) * 0.1 }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🎯 [STAGE] Drag over entire stage:', stage.id);
                handleDragOver(e, stage.id);
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🎯 [STAGE] Drop on entire stage:', stage.id);
                handleDrop(e, stage.id);
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                console.log('🎯 [STAGE] Drag enter stage:', stage.id);
              }}
            >
              {/* Stage Header - Compact */}
              <BrandCard 
                className="p-4 mb-3 sticky top-0 z-10"
                borderGradient="primary"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    ></div>
                    <h3 className="font-bold text-white text-sm">{stage.label}</h3>
                  </div>
                  
                  <div title={`Add deal to ${stage.label}`}>
                    <BrandButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCreateDeal()}
                      className="p-1 w-6 h-6 hover:bg-white/10"
                    >
                      <Plus className="w-3 h-3" />
                    </BrandButton>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <BrandBadge variant="secondary" size="sm">
                    {stageStats.count} deals
                  </BrandBadge>
                  <span className="text-white/80 text-xs font-bold">
                    {formatCurrency(stageStats.value)}
                  </span>
                </div>
              </BrandCard>

              {/* Deals Container - MASSIVE Drop Zone */}
              <div 
                className={`flex-1 space-y-3 px-2 pb-4 rounded-lg transition-all duration-200 min-h-[500px] ${
                  dragOverStage === stage.id 
                    ? 'bg-blue-500/20 border-2 border-dashed border-blue-400' 
                    : draggedDeal 
                      ? 'border-2 border-dashed border-gray-500/20 bg-gray-500/5'
                      : 'border-2 border-transparent'
                }`}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); handleDragOver(e, stage.id); }}
                onDragLeave={handleDragLeave}
                onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleDrop(e, stage.id); }}
                onDragEnter={(e) => { e.preventDefault(); }}
              >
                {/* Clean drop indicator */}
                {dragOverStage === stage.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-blue-500/10 rounded-lg z-50 pointer-events-none">
                    <div className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium text-sm shadow-lg">
                      Drop here
                    </div>
                  </div>
                )}
                <AnimatePresence>
                  {stageDeals.map((deal) => (
                    <SimpleDealCard
                      key={deal.id}
                      deal={deal}
                      onEdit={handleEditDeal}
                      onDragStart={handleDragStart}
                      isDragging={draggedDeal?.dealId === deal.id}
                    />
                  ))}
                </AnimatePresence>
                
                {/* Drop Target Indicator */}
                {dragOverStage === stage.id && draggedDeal && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-center py-8 border-2 border-dashed border-blue-500 rounded-lg bg-blue-500/20 mx-1 mb-3"
                  >
                    <div className="text-center">
                      <Target className="w-10 h-10 text-blue-400 mx-auto mb-2 animate-pulse" />
                      <p className="text-blue-400 font-bold text-sm">Drop Deal Here</p>
                      <p className="text-blue-300 text-xs">Move to {stage.label}</p>
                    </div>
                  </motion.div>
                )}
                
                {/* Empty State */}
                {stageDeals.length === 0 && dragOverStage !== stage.id && (
                  <div className="flex items-center justify-center py-12 text-center">
                    <div>
                      <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Plus className="w-6 h-6 text-white/30" />
                      </div>
                      <p className="text-white/40 text-sm">No deals in {stage.label}</p>
                      <p className="text-white/30 text-xs mt-1">Drag deals here or click + to add</p>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Deal Modal */}
      <BrandedDealModal
        isOpen={showModal}
        onClose={closeModal}
        deal={selectedDeal || undefined}
        mode={modalMode}
        onSave={handleSaveDeal}
        onDelete={modalMode === 'view' ? handleDeleteDeal : undefined}
      />
    </div>
  );
};
