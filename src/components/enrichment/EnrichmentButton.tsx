import React from 'react';
import { Zap, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { EnrichmentStatus } from '../../services/enrichmentService';

interface EnrichmentButtonProps {
  onClick: () => void;
  isLoading: boolean;
  status: EnrichmentStatus;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const EnrichmentButton: React.FC<EnrichmentButtonProps> = ({
  onClick,
  isLoading,
  status,
  disabled = false,
  size = 'md',
  className = '',
  label = 'Enrich Data'
}) => {
  const getButtonStyle = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'failed':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'pending':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      default:
        return 'bg-primary-600 hover:bg-primary-700 text-white';
    }
  };

  const getIcon = () => {
    if (isLoading) {
      return <Loader className="w-4 h-4 animate-spin" />;
    }

    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      case 'pending':
        return <Loader className="w-4 h-4 animate-spin" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  const getLabel = () => {
    if (isLoading) return 'Enriching...';

    switch (status) {
      case 'completed':
        return 'Enriched';
      case 'failed':
        return 'Retry Enrichment';
      case 'pending':
        return 'Enriching...';
      default:
        return label;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-3 text-base';
      default:
        return 'px-3 py-2 text-sm';
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={isLoading || disabled || status === 'pending'}
      className={`
        ${getButtonStyle()}
        ${getSizeClasses()}
        rounded-lg font-medium transition-colors
        flex items-center justify-center space-x-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {getIcon()}
      <span>{getLabel()}</span>
    </button>
  );
};

export default EnrichmentButton;