import React from 'react';
import { Bot, Plus } from 'lucide-react';
import { useGuru } from '../../contexts/GuruContext';
import Button from '../ui/Button';

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
    <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-8 text-center">
      <Icon className="w-16 h-16 text-[#b0b0d0] mx-auto mb-6" />
      <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
      <p className="text-[#b0b0d0] mb-8 max-w-md mx-auto">{description}</p>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {onAction && actionLabel && (
          <Button 
            onClick={onAction} 
            variant="gradient"
            size="lg"
            icon={Plus}
          >
            {actionLabel}
          </Button>
        )}
        
        {showGuru && (
          <Button 
            onClick={handleGuruHelp}
            variant="secondary"
            size="lg"
            icon={Bot}
          >
            Ask Guru for Help
          </Button>
        )}
      </div>
      
      {guruSuggestion && (
        <p className="text-xs text-[#b0b0d0] mt-6">
          Guru can help with: "{guruSuggestion}"
        </p>
      )}
    </div>
  );
};

export default EmptyState;