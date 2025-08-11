import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useModal } from '../../contexts/ModalContext';
import { 
  AlertCircle, 
  X, 
  Target, 
  CheckCircle, 
  User, 
  ArrowRight,
  Clock
} from 'lucide-react';
import Card from '../ui/Card';
import { Bottleneck } from '../../types/ai';
import { formatDistanceToNow } from 'date-fns';
import Button from '../ui/Button';

interface BottleneckPanelProps {
  bottlenecks: Bottleneck[];
  onClose: () => void;
  onViewEntity: (type: string, id: string) => void;
  onCreateTask: (bottleneck: Bottleneck) => void;
}

export const BottleneckPanel: React.FC<BottleneckPanelProps> = ({
  bottlenecks,
  onClose,
  onViewEntity,
  onCreateTask
}) => {
  const { openModal, closeModal } = useModal();

  // Open modal when component mounts
  useEffect(() => {
    openModal();
    return () => closeModal();
  }, [openModal, closeModal]);
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-400 border-red-400 bg-red-400/10';
      case 'medium':
        return 'text-yellow-400 border-yellow-400 bg-yellow-400/10';
      case 'low':
        return 'text-green-400 border-green-400 bg-green-400/10';
      default:
        return 'text-secondary-400 border-secondary-400 bg-secondary-400/10';
    }
  };

  const getTypeIcon = (type: Bottleneck['type']) => {
    switch (type) {
      case 'deal':
        return <Target className="w-4 h-4 text-blue-400" />;
      case 'task':
        return <CheckCircle className="w-4 h-4 text-purple-400" />;
      case 'contact':
        return <User className="w-4 h-4 text-green-400" />;
      case 'lead':
        return <Target className="w-4 h-4 text-orange-400" />;
      case 'company':
        return <User className="w-4 h-4 text-indigo-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-secondary-400" />;
    }
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center p-2 sm:p-4 z-[9999999] !z-[9999999]">
      <Card className="p-4 sm:p-6 border-l-4 border-red-400 bg-[#23233a]/99 backdrop-blur-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto">
      <div className="flex flex-col sm:flex-row items-start justify-between mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl flex items-center justify-center shadow-lg">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">Bottlenecks Detected</h3>
            <p className="text-[#b0b0d0] text-sm">
              {bottlenecks.length} items that may be blocking your progress
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-3 rounded-xl bg-[#23233a]/60 hover:bg-[#23233a]/80 transition-all border border-[#23233a]/40"
        >
          <X className="w-5 h-5 text-[#b0b0d0]" />
        </button>
      </div>
      
      {bottlenecks.length > 0 ? (
        <div className="space-y-4 max-h-80 sm:max-h-96 overflow-y-auto pr-2 custom-scrollbar">
          {bottlenecks.map(bottleneck => (
            <div 
              key={bottleneck.id} 
              className="p-4 sm:p-6 rounded-xl bg-[#23233a]/60 border border-[#23233a]/40 hover:border-[#23233a]/60 transition-all duration-200 hover:bg-[#23233a]/80 backdrop-blur-sm"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  {getTypeIcon(bottleneck.type)}
                </div>
                
                <div className="ml-4 flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-white mb-1">{bottleneck.title}</h4>
                      <p className="text-sm text-secondary-400">{bottleneck.description}</p>
                    </div>
                    
                    <div className={`ml-3 px-3 py-1 text-xs sm:text-sm border rounded-full font-medium ${getPriorityColor(bottleneck.priority)}`}>
                      {bottleneck.priority}
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center text-xs text-secondary-400">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>Idle for {bottleneck.idle_days} days</span>
                  </div>
                  
                  <div className="mt-4 flex flex-col sm:flex-row justify-end gap-2">
                    <Button
                      onClick={() => onViewEntity(bottleneck.type, bottleneck.entity_id)}
                      className="inline-flex items-center justify-center min-w-[120px] sm:min-w-[140px] px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#23233a]/60 hover:bg-[#23233a]/80 rounded-xl shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg border border-[#23233a]/40"
                    >
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                      <span className="whitespace-nowrap">View {bottleneck.type}</span>
                    </Button>
                    
                    <Button
                      onClick={() => onCreateTask(bottleneck)}
                      className="inline-flex items-center justify-center min-w-[120px] sm:min-w-[140px] px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#a259ff] to-[#377dff] hover:from-[#a259ff]/90 hover:to-[#377dff]/90 rounded-xl shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
                    >
                      <span className="whitespace-nowrap">Create Task</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <p className="text-white font-semibold text-lg mb-2">No bottlenecks detected</p>
          <p className="text-secondary-400 text-sm">
            Great job! Your workflow is running smoothly.
          </p>
        </div>
      )}
    </Card>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default BottleneckPanel; 