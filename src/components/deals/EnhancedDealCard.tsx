import React, { useState } from 'react';
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
  Tag,
  GripVertical,
  RotateCcw,
  Bell,
  Mail,
  Phone,
  FileText
} from 'lucide-react';

import { BrandCard, BrandBadge, BrandButton } from '../../contexts/BrandDesignContext';
import { Deal, PIPELINE_STAGES } from '../../hooks/useDeals';

interface EnhancedDealCardProps {
  deal: Deal;
  onEdit: (deal: Deal) => void;
  onDragStart: (e: React.DragEvent, dealId: string, fromStage: string) => void;
  isDragging?: boolean;
  className?: string;
  showAlerts?: boolean;
}

export const EnhancedDealCard: React.FC<EnhancedDealCardProps> = ({
  deal,
  onEdit,
  onDragStart,
  isDragging = false,
  className = '',
  showAlerts = true
}) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

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

  // Calculate days in current stage (mock calculation)
  const getDaysInStage = () => {
    // This would be calculated based on stage transition history
    return Math.floor(Math.random() * 30) + 1;
  };

  const daysInStage = getDaysInStage();
  const isStuck = daysInStage > 14; // Alert if stuck for more than 14 days

  const stageConfig = getStageConfig(deal.stage);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', deal.id);
    e.dataTransfer.setData('application/json', JSON.stringify({ 
      dealId: deal.id, 
      fromStage: deal.stage 
    }));
    onDragStart(e, deal.id, deal.stage);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: isDragging ? 0.7 : 1, 
        y: 0,
        scale: isDragging ? 0.95 : 1,
        rotate: isDragging ? 3 : 0
      }}
      whileHover={{ 
        scale: isDragging ? 0.95 : 1.03,
        y: isDragging ? 0 : -2
      }}
      transition={{ 
        duration: 0.2,
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
      className={className}
      draggable
      onDragStart={handleDragStart}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <BrandCard 
        className={`relative group transition-all duration-300 ${
          isDragging 
            ? 'shadow-2xl ring-2 ring-blue-500/50 bg-gradient-to-br from-blue-500/10 to-purple-500/10' 
            : 'hover:shadow-xl hover:shadow-blue-500/20'
        } ${isStuck ? 'ring-1 ring-red-500/30' : ''}`}
        borderGradient="primary"
      >
        {/* Drag Handle */}
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-60 transition-opacity cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4 text-white/40" />
        </div>

        {/* Card Content */}
        <div className="pl-2">
          {/* Header with Priority, Alerts and Actions */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              {getPriorityIcon(deal.priority || 'medium')}
              <span className="text-xs text-white/60 uppercase font-medium">
                {deal.priority || 'medium'}
              </span>
              {isStuck && showAlerts && (
                <div className="flex items-center space-x-1">
                  <Bell className="w-3 h-3 text-red-400 animate-pulse" />
                  <span className="text-xs text-red-400 font-medium">
                    {daysInStage}d
                  </span>
                </div>
              )}
            </div>
            
            {/* Action Buttons - Always Visible */}
            <div className="flex items-center space-x-1">
              <BrandButton
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/deals/${deal.id}`);
                }}
                className="p-1.5 w-7 h-7 hover:bg-white/20 transition-colors opacity-100"
                title="View Deal Details"
              >
                <Eye className="w-3.5 h-3.5" />
              </BrandButton>
              <BrandButton
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(deal);
                }}
                className="p-1.5 w-7 h-7 hover:bg-white/20 transition-colors opacity-100"
                title="Edit Deal"
              >
                <Edit className="w-3.5 h-3.5" />
              </BrandButton>
            </div>
          </div>

          {/* Deal Title */}
          <h3 
            className="text-white font-semibold text-sm mb-2 leading-tight cursor-pointer hover:text-blue-300 transition-colors line-clamp-2"
            onClick={() => navigate(`/deals/${deal.id}`)}
            title={deal.title}
          >
            {deal.title}
          </h3>

          {/* Deal Value and Probability */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-white font-bold text-base">{formatCurrency(deal.value)}</span>
              </div>
              <BrandBadge 
                variant={deal.probability > 75 ? "success" : deal.probability > 50 ? "warning" : "secondary"}
                className="text-xs font-bold"
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
                  <span className="truncate font-medium">{deal.contact.name}</span>
                </div>
              )}
              {deal.organization && (
                <div className="flex items-center space-x-2 text-sm text-white/80">
                  <Building2 className="w-3 h-3 text-white/60" />
                  <span className="truncate font-medium">{deal.organization.name}</span>
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
              {deal.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/80 border border-white/20"
                >
                  <Tag className="w-2 h-2 mr-1" />
                  {tag}
                </span>
              ))}
              {deal.tags.length > 2 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/60 border border-white/20">
                  +{deal.tags.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Quick Actions Bar - Show on Hover */}
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mb-3 p-2 bg-white/5 rounded-lg border border-white/10"
            >
              <div className="flex items-center space-x-2">
                <BrandButton
                  variant="ghost"
                  size="sm"
                  className="p-1 w-6 h-6"
                  title="Send Email"
                >
                  <Mail className="w-3 h-3" />
                </BrandButton>
                <BrandButton
                  variant="ghost"
                  size="sm"
                  className="p-1 w-6 h-6"
                  title="Make Call"
                >
                  <Phone className="w-3 h-3" />
                </BrandButton>
                <BrandButton
                  variant="ghost"
                  size="sm"
                  className="p-1 w-6 h-6"
                  title="Add Note"
                >
                  <FileText className="w-3 h-3" />
                </BrandButton>
              </div>
              <span className="text-xs text-white/50">
                {daysInStage}d in stage
              </span>
            </motion.div>
          )}

          {/* Stage Indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div 
                className="w-2 h-2 rounded-full shadow-sm"
                style={{ backgroundColor: stageConfig?.color || '#6b7280' }}
              ></div>
              <span className="text-xs text-white/60 font-medium">{stageConfig?.label || 'Unknown Stage'}</span>
            </div>
            
            {/* Stage Duration Warning */}
            {isStuck && (
              <div className="flex items-center space-x-1 text-red-400">
                <RotateCcw className="w-3 h-3" />
                <span className="text-xs font-medium">Review needed</span>
              </div>
            )}
          </div>
        </div>

        {/* Drag Overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg border-2 border-blue-500/50 border-dashed pointer-events-none"></div>
        )}

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none"></div>
      </BrandCard>
    </motion.div>
  );
};
