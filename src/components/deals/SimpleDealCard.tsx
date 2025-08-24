import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Eye,
  Edit,
  AlertTriangle,
  Clock,
  TrendingUp
} from 'lucide-react';

import { BrandCard, BrandBadge, BrandButton } from '../../contexts/BrandDesignContext';
import { Deal, PIPELINE_STAGES } from '../../hooks/useDeals';

interface SimpleDealCardProps {
  deal: Deal;
  onEdit: (deal: Deal) => void;
  onDragStart: (e: React.DragEvent, dealId: string, fromStage: string) => void;
  isDragging?: boolean;
  className?: string;
}

export const SimpleDealCard: React.FC<SimpleDealCardProps> = ({
  deal,
  onEdit,
  onDragStart,
  isDragging = false,
  className = ''
}) => {
  const navigate = useNavigate();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: deal.currency || 'USD',
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
        return <AlertTriangle className="w-3 h-3 text-red-400" />;
      case 'medium':
        return <Clock className="w-3 h-3 text-yellow-400" />;
      case 'low':
        return <TrendingUp className="w-3 h-3 text-green-400" />;
      default:
        return <Clock className="w-3 h-3 text-yellow-400" />;
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    console.log('🎯 [CARD] Card drag start:', deal.id, deal.stage);
    
    // Set drag data
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', deal.id);
    e.dataTransfer.setData('application/json', JSON.stringify({ 
      dealId: deal.id, 
      fromStage: deal.stage 
    }));
    
    // Make the drag image semi-transparent
    e.dataTransfer.setDragImage(e.currentTarget, 0, 0);
    
    // Call parent handler
    onDragStart(e, deal.id, deal.stage);
    
    console.log('🎯 [CARD] Drag start completed successfully');
  };

  const stageConfig = getStageConfig(deal.stage);

  const handleDragEnd = (e: React.DragEvent) => {
    console.log('🎯 Card drag end:', deal.id);
    e.currentTarget.style.pointerEvents = '';
  };

  return (
    <div
      className={`${className} ${isDragging ? 'opacity-60 scale-95 rotate-2' : ''} transition-all duration-200`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <BrandCard className="p-4 cursor-grab active:cursor-grabbing hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border border-white/10 hover:border-blue-400/50" borderGradient="secondary">
        {/* Header with priority */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1">
            {getPriorityIcon(deal.priority || 'medium')}
            <span className="text-xs text-white/60 uppercase">
              {deal.priority || 'med'}
            </span>
          </div>
          
          {/* Show alert if deal is stuck */}
          {16 > 14 && (
            <div className="flex items-center space-x-1">
              <span className="text-xs text-red-400">⚠️ STUCK</span>
            </div>
          )}
        </div>

        {/* Deal Title - Compact */}
        <h3 
          className="text-white font-medium text-sm mb-2 leading-tight cursor-pointer hover:text-blue-300 transition-colors line-clamp-2"
          onClick={() => navigate(`/deals/${deal.id}`)}
          title={deal.title}
        >
          {deal.title.length > 30 ? `${deal.title.substring(0, 30)}...` : deal.title}
        </h3>

        {/* Value and Probability - Compact */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1">
            <DollarSign className="w-3 h-3 text-green-400" />
            <span className="text-white font-semibold text-sm">{formatCurrency(deal.value)}</span>
          </div>
          <BrandBadge 
            variant={deal.probability > 75 ? "success" : deal.probability > 50 ? "warning" : "secondary"}
            size="sm"
          >
            {deal.probability}%
          </BrandBadge>
        </div>

        {/* Contact and Organization */}
        <div className="space-y-1 mb-2">
          {deal.contact && (
            <div className="text-xs text-white/70 truncate">
              👤 {deal.contact.name}
            </div>
          )}
          {deal.organization && (
            <div className="text-xs text-white/60 truncate">
              🏢 {deal.organization.name}
            </div>
          )}
        </div>

        {/* Expected Close Date */}
        {deal.expected_close_date && (
          <div className="text-xs text-white/60 mb-2 flex items-center space-x-1">
            <span>📅</span>
            <span>{new Date(deal.expected_close_date).toLocaleDateString()}</span>
          </div>
        )}

        {/* Tags */}
        {deal.tags && deal.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {deal.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-white/10 text-white/70"
              >
                {tag}
              </span>
            ))}
            {deal.tags.length > 2 && (
              <span className="text-xs text-white/50">+{deal.tags.length - 2}</span>
            )}
          </div>
        )}

        {/* Stage indicator and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: stageConfig?.color || '#6b7280' }}
            ></div>
            <span className="text-xs text-white/50">{stageConfig?.label}</span>
          </div>
          
          {/* Days in stage with warning */}
          <div className="flex items-center space-x-1">
            {/* Show warning if stuck too long */}
            {16 > 14 && (
              <span className="text-xs text-red-400">⚠️</span>
            )}
            <span className="text-xs text-white/40">16d</span>
          </div>
        </div>

        {/* Action Buttons Row - Always Visible */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/20">
          <div className="flex items-center space-x-2">
            <BrandButton
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                console.log('View button clicked for deal:', deal.id);
                navigate(`/deals/${deal.id}`);
              }}
              className="px-2 py-1 text-xs font-medium"
              title="View Details"
            >
              <Eye className="w-3 h-3 mr-1" />
              View
            </BrandButton>
            <BrandButton
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                console.log('Edit button clicked for deal:', deal.id);
                onEdit(deal);
              }}
              className="px-2 py-1 text-xs font-medium border border-white/20 hover:border-white/40"
              title="Edit Deal"
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </BrandButton>
          </div>
          
          {/* Expected Value */}
          <div className="text-xs text-green-400 font-bold">
            ${((deal.value * deal.probability) / 100).toLocaleString()}
          </div>
        </div>
      </BrandCard>
    </div>
  );
};
