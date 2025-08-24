import React from 'react';
import { Zap, Clock, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { EnrichmentStatus } from '../../services/enrichmentService';
import { Card } from '../ui/Card';
import EnrichmentButton from './EnrichmentButton';
import EnrichmentStatusBadge from './EnrichmentStatusBadge';

interface EnrichmentDataCardProps {
  title: string;
  description: string;
  status: EnrichmentStatus;
  lastUpdated?: Date;
  onEnrich: () => void;
  isLoading: boolean;
  onViewDetails?: () => void;
  type: 'contact' | 'company';
}

const EnrichmentDataCard: React.FC<EnrichmentDataCardProps> = ({
  title,
  description,
  status,
  lastUpdated,
  onEnrich,
  isLoading,
  onViewDetails,
  type
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Zap className="w-5 h-5 text-primary-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'completed':
        return `Data enriched from LinkedIn and web ${lastUpdated ? `on ${lastUpdated.toLocaleDateString()}` : ''}`;
      case 'failed':
        return 'Enrichment failed';
      case 'pending':
        return 'Enrichment in progress...';
      default:
        return 'Not yet enriched';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'failed':
        return 'text-red-500';
      case 'pending':
        return 'text-yellow-500';
      default:
        return 'text-secondary-400';
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-md">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-primary-600/30 rounded-full flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h3 className="font-medium text-white">{title}</h3>
            <p className="text-sm text-secondary-400 mt-1">{description}</p>
            <div className={`flex items-center space-x-2 mt-2 ${getStatusColor()}`}>
              {getStatusIcon()}
              <span className="text-sm">{getStatusText()}</span>
            </div>
          </div>
        </div>
        <EnrichmentStatusBadge status={status} lastUpdated={lastUpdated} />
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-secondary-700">
        <div>
          {status === 'completed' && onViewDetails && (
            <button
              onClick={onViewDetails}
              className="text-primary-400 hover:text-primary-300 text-sm flex items-center space-x-1"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View Details</span>
            </button>
          )}
        </div>
        <EnrichmentButton
          onClick={onEnrich}
          isLoading={isLoading}
          status={status}
          label={`Enrich ${type === 'contact' ? 'Contact' : 'Company'} from LinkedIn & Web`}
        />
      </div>
    </Card>
  );
};

export default EnrichmentDataCard;