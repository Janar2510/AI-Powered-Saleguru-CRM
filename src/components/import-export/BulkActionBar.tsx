import React, { useState } from 'react';
import { X, Users, Tag, Target, Trash2, Download, Check } from 'lucide-react';
import { Card } from '../common/Card';

interface BulkActionBarProps {
  entityType: string;
  selectedIds: string[];
  onClearSelection: () => void;
  onActionComplete: () => void;
  availableActions: string[];
  statuses?: string[];
  tags?: string[];
  stages?: any[];
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  entityType,
  selectedIds,
  onClearSelection,
  onActionComplete,
  availableActions,
  statuses = [],
  tags = [],
  stages = []
}) => {
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [showActionMenu, setShowActionMenu] = useState(false);

  const handleBulkAction = (action: string) => {
    // In a real implementation, this would perform the bulk action
    console.log(`Performing ${action} on ${selectedIds.length} ${entityType}`);
    onActionComplete();
    setShowActionMenu(false);
    setSelectedAction('');
  };

  return (
    <Card className="p-4 bg-surface/80 backdrop-blur-sm border border-dark-200 shadow-glass">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-white font-medium">
            {selectedIds.length} {entityType} selected
          </span>
          
          <div className="relative">
            <button
              onClick={() => setShowActionMenu(!showActionMenu)}
              className="bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Target className="w-4 h-4" />
              <span>Bulk Actions</span>
            </button>
            
            {showActionMenu && (
              <div className="absolute left-0 top-10 w-48 bg-dark-100 border border-dark-200 rounded-lg shadow-xl z-10">
                <div className="py-1">
                  {availableActions.includes('assign') && (
                    <button
                      onClick={() => handleBulkAction('assign')}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-dark-200 flex items-center space-x-2"
                    >
                      <Users className="w-4 h-4" />
                      <span>Assign Owner</span>
                    </button>
                  )}
                  
                  {availableActions.includes('tag') && (
                    <button
                      onClick={() => handleBulkAction('tag')}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-dark-200 flex items-center space-x-2"
                    >
                      <Tag className="w-4 h-4" />
                      <span>Add Tags</span>
                    </button>
                  )}
                  
                  {availableActions.includes('status') && (
                    <button
                      onClick={() => handleBulkAction('status')}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-dark-200 flex items-center space-x-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Change Status</span>
                    </button>
                  )}
                  
                  {availableActions.includes('stage') && (
                    <button
                      onClick={() => handleBulkAction('stage')}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-dark-200 flex items-center space-x-2"
                    >
                      <Target className="w-4 h-4" />
                      <span>Move Stage</span>
                    </button>
                  )}
                  
                  {availableActions.includes('export') && (
                    <button
                      onClick={() => handleBulkAction('export')}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-dark-200 flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export Selected</span>
                    </button>
                  )}
                  
                  {availableActions.includes('delete') && (
                    <button
                      onClick={() => handleBulkAction('delete')}
                      className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Selected</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={onClearSelection}
          className="p-2 rounded-lg hover:bg-dark-200/50 transition-colors"
        >
          <X className="w-4 h-4 text-dark-400" />
        </button>
      </div>
    </Card>
  );
}; 