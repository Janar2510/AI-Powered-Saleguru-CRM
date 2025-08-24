import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Calendar,
  User,
  Building2,
  Eye,
  Edit,
  Target,
  Clock,
  AlertTriangle,
  TrendingUp,
  Tag
} from 'lucide-react';

import { BrandCard, BrandBadge, BrandButton } from '../../contexts/BrandDesignContext';
import { Deal, PIPELINE_STAGES } from '../../hooks/useDeals';

interface DealCardProps {
  deal: Deal;
  onEdit: (deal: Deal) => void;
  onDragStart?: () => void; // Simplified and optional
  isDragging?: boolean;
  className?: string;
}

export const DealCard: React.FC<DealCardProps> = ({
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
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'low':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };



  const stageConfig = getStageConfig(deal.stage);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: 1
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <BrandCard 
        className="p-5 cursor-pointer relative group hover:shadow-xl transition-all duration-300 hover:shadow-blue-500/20"
        borderGradient="primary"
      >
        {/* Header with Priority and Actions */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {getPriorityIcon(deal.priority || 'medium')}
            <span className="text-xs text-white/60 uppercase font-medium">
              {deal.priority || 'medium'} priority
            </span>
          </div>
          
          {/* Action Buttons - Always Visible */}
          <div className="flex items-center space-x-1 opacity-100">
            <div title="View Deal">
              <BrandButton
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/deals/${deal.id}`)}
                className="p-1.5 w-8 h-8 hover:bg-white/20 transition-colors"
              >
                <Eye className="w-4 h-4" />
              </BrandButton>
            </div>
            <div title="Edit Deal">
              <BrandButton
                variant="ghost"
                size="sm"
                onClick={() => onEdit(deal)}
                className="p-1.5 w-8 h-8 hover:bg-white/20 transition-colors"
              >
                <Edit className="w-4 h-4" />
              </BrandButton>
            </div>
          </div>
        </div>

        {/* Deal Title */}
        <h3 
          className="text-white font-semibold text-sm mb-2 leading-tight cursor-pointer hover:text-blue-300 transition-colors"
          onClick={() => navigate(`/deals/${deal.id}`)}
          title={deal.title}
        >
          {deal.title.length > 50 ? `${deal.title.substring(0, 50)}...` : deal.title}
        </h3>

        {/* Deal Value and Probability */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-white font-semibold">{formatCurrency(deal.value)}</span>
            </div>
            <BrandBadge 
              variant="secondary" 
              className="text-xs"
            >
              {deal.probability}%
            </BrandBadge>
          </div>
          
          {/* Expected Value */}
          <div className="flex items-center space-x-2 text-sm text-white/70">
            <Target className="w-3 h-3" />
            <span>Expected: {formatCurrency(deal.value * (deal.probability / 100))}</span>
          </div>
        </div>

        {/* Customer Information */}
        {(deal.contact || deal.organization) && (
          <div className="space-y-1 mb-3">
            {deal.contact && (
              <div className="flex items-center space-x-2 text-sm text-white/80">
                <User className="w-3 h-3 text-white/60" />
                <span className="truncate">{deal.contact.name}</span>
              </div>
            )}
            {deal.organization && (
              <div className="flex items-center space-x-2 text-sm text-white/80">
                <Building2 className="w-3 h-3 text-white/60" />
                <span className="truncate">{deal.organization.name}</span>
              </div>
            )}
          </div>
        )}

        {/* Expected Close Date */}
        {deal.expected_close_date && (
          <div className="flex items-center space-x-2 text-sm text-white/70 mb-3">
            <Calendar className="w-3 h-3" />
            <span>Close: {new Date(deal.expected_close_date).toLocaleDateString()}</span>
          </div>
        )}

        {/* Tags */}
        {deal.tags && deal.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {deal.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-white/10 text-white/80"
              >
                <Tag className="w-2 h-2 mr-1" />
                {tag}
              </span>
            ))}
            {deal.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-white/10 text-white/60">
                +{deal.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Stage Indicator */}
        <div className="flex items-center space-x-2 mt-auto">
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: stageConfig?.color || '#6b7280' }}
          ></div>
          <span className="text-xs text-white/60">{stageConfig?.label || 'Unknown Stage'}</span>
        </div>

        {/* Drag Indicator */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-1 h-4 bg-white/20 rounded"></div>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none"></div>
      </BrandCard>
    </motion.div>
  );
};