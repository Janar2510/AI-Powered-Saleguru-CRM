import React from 'react';
import { Bot, Plus } from 'lucide-react';
import { useGuru } from '../../contexts/GuruContext';
import Card from '../ui/Card';

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  guruSuggestion?: string;
  actionLabel?: string;
  onAction?: () => void;
  showGuru?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  guruSuggestion,
  actionLabel,
  onAction,
  showGuru = true
}) => {
  const { openGuru, sendMessage } = useGuru();

  const handleGuruHelp = async () => {
    openGuru();
    if (guruSuggestion) {
      // Small delay to ensure panel is open
      setTimeout(() => {
        sendMessage(guruSuggestion);
      }, 300);
    }
  };

  return (
    <Card 
      className="text-center" 
      padding="lg"
      variant="glass"
    >
      <Icon className="w-16 h-16 text-secondary-600 mx-auto mb-6" />
      <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
      <p className="text-secondary-400 mb-8 max-w-md mx-auto">{description}</p>
      
      <div className="flex items-center justify-center space-x-4">
        {onAction && actionLabel && (
          <button 
            onClick={onAction} 
            className="btn-primary flex items-center space-x-2 px-6 py-3"
          >
            <Plus className="w-4 h-4" />
            <span>{actionLabel}</span>
          </button>
        )}
        
        {showGuru && (
          <button 
            onClick={handleGuruHelp}
            className="btn-secondary flex items-center space-x-2 px-6 py-3"
          >
            <Bot className="w-4 h-4" />
            <span>Ask Guru for Help</span>
          </button>
        )}
      </div>
      
      {guruSuggestion && (
        <p className="text-xs text-secondary-500 mt-6">
          Guru can help with: "{guruSuggestion}"
        </p>
      )}
    </Card>
  );
};

export default EmptyState;