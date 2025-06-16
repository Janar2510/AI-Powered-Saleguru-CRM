import React from 'react';
import { CheckCircle, AlertCircle, Clock, HelpCircle } from 'lucide-react';
import { EnrichmentStatus } from '../../services/enrichmentService';
import Badge from '../ui/Badge';

interface EnrichmentStatusBadgeProps {
  status: EnrichmentStatus;
  lastUpdated?: Date;
  size?: 'sm' | 'md';
  showTimestamp?: boolean;
}

const EnrichmentStatusBadge: React.FC<EnrichmentStatusBadgeProps> = ({
  status,
  lastUpdated,
  size = 'sm',
  showTimestamp = false
}) => {
  const getVariant = () => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'danger';
      case 'pending':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'failed':
        return <AlertCircle className="w-3 h-3 mr-1" />;
      case 'pending':
        return <Clock className="w-3 h-3 mr-1" />;
      default:
        return <HelpCircle className="w-3 h-3 mr-1" />;
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'completed':
        return 'Enriched';
      case 'failed':
        return 'Failed';
      case 'pending':
        return 'Enriching...';
      default:
        return 'Not Enriched';
    }
  };

  const formatTimestamp = (date?: Date) => {
    if (!date) return '';
    
    // If less than 24 hours ago, show relative time
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) {
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
      }
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    
    // Otherwise show date
    return date.toLocaleDateString();
  };

  return (
    <Badge variant={getVariant()} size={size}>
      <div className="flex items-center">
        {getIcon()}
        <span>{getLabel()}</span>
        {showTimestamp && lastUpdated && (
          <span className="ml-1 opacity-75 text-xs">
            ({formatTimestamp(lastUpdated)})
          </span>
        )}
      </div>
    </Badge>
  );
};

export default EnrichmentStatusBadge;