import React, { useState } from 'react';
import { Play, Pause, Edit, Trash2, Copy, Eye, Calendar, Clock, Zap, Filter, CheckSquare, FileText, Mail, Target, Users, X, Check } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { AutomationRule } from '../../types/automation';
import { useToastContext } from '../../contexts/ToastContext';
import { supabase } from '../../services/supabase';

interface AutomationRuleCardProps {
  rule: AutomationRule;
  viewMode: 'list' | 'grid';
  onEdit: () => void;
  onTest: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleStatus: (isActive: boolean) => void;
}

const AutomationRuleCard: React.FC<AutomationRuleCardProps> = ({
  rule,
  viewMode,
  onEdit,
  onTest,
  onDuplicate,
  onDelete,
  onToggleStatus
}) => {
  const { showToast } = useToastContext();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  
  // Get trigger icon
  const getTriggerIcon = () => {
    if (!rule.trigger) return <Zap className="w-5 h-5 text-primary-400" />;
    
    switch (rule.trigger.type) {
      case 'deal_stage_changed':
      case 'deal_created':
        return <Target className="w-5 h-5 text-primary-400" />;
      case 'contact_created':
        return <Users className="w-5 h-5 text-primary-400" />;
      case 'task_deadline_missed':
      case 'task_completed':
        return <CheckSquare className="w-5 h-5 text-primary-400" />;
      case 'form_submitted':
        return <FileText className="w-5 h-5 text-primary-400" />;
      case 'email_opened':
      case 'email_clicked':
        return <Mail className="w-5 h-5 text-primary-400" />;
      default:
        return <Zap className="w-5 h-5 text-primary-400" />;
    }
  };
  
  // Get condition count badge
  const getConditionBadge = () => {
    const count = rule.conditions?.length || 0;
    if (count === 0) return null;
    
    return (
      <div className="flex items-center space-x-1">
        <Filter className="w-3 h-3 text-yellow-400" />
        <span className="text-xs text-yellow-400">{count} condition{count !== 1 ? 's' : ''}</span>
      </div>
    );
  };
  
  // Get action count badge
  const getActionBadge = () => {
    const count = rule.actions?.length || 0;
    if (count === 0) return null;
    
    return (
      <div className="flex items-center space-x-1">
        <Play className="w-3 h-3 text-green-400" />
        <span className="text-xs text-green-400">{count} action{count !== 1 ? 's' : ''}</span>
      </div>
    );
  };

  const handleDeleteClick = () => {
    if (showDeleteConfirm) {
      onDelete();
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };
  
  const handleManualExecution = async () => {
    if (!rule.id) {
      showToast({
        type: 'error',
        title: 'Execution Failed',
        description: 'Rule ID is missing'
      });
      return;
    }
    
    setIsExecuting(true);
    
    try {
      // Call the execute-automation function with the rule ID
      const { data, error } = await supabase.functions.invoke('execute-automation', {
        body: {
          ruleId: rule.id
        }
      });
      
      if (error) {
        throw new Error(`Error calling execute-automation: ${error.message}`);
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Unknown error');
      }
      
      showToast({
        type: 'success',
        title: 'Rule Executed',
        description: `${rule.name} was executed successfully`
      });
    } catch (error) {
      console.error('Error executing rule:', error);
      showToast({
        type: 'error',
        title: 'Execution Failed',
        description: error instanceof Error ? error.message : 'Failed to execute rule'
      });
    } finally {
      setIsExecuting(false);
    }
  };
  
  if (viewMode === 'list') {
    return (
      <Card className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 hover:bg-[#23233a]/60 transition-all duration-300 p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                {getTriggerIcon()}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">{rule.name}</h3>
              <p className="text-base text-secondary-300 mb-3">{rule.description}</p>
              <div className="flex items-center space-x-4">
                <Badge 
                  variant={rule.is_active ? 'success' : 'secondary'} 
                  size="md"
                  className="px-3 py-1"
                >
                  {rule.is_active ? 'Active' : 'Inactive'}
                </Badge>
                {getConditionBadge()}
                {getActionBadge()}
                <span className="text-sm text-secondary-400">
                  Updated {rule.updated_at.toLocaleDateString()}
                </span>
                {rule.last_executed && (
                  <span className="text-sm text-secondary-400">
                    Last run: {new Date(rule.last_executed).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onToggleStatus(!rule.is_active)}
              className={`p-3 rounded-xl transition-colors ${
                rule.is_active 
                  ? 'text-green-400 hover:bg-green-900/20' 
                  : 'text-secondary-400 hover:bg-secondary-700'
              }`}
              title={rule.is_active ? 'Deactivate' : 'Activate'}
            >
              {rule.is_active ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button
              onClick={onEdit}
              className="p-3 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-xl transition-colors"
              title="Edit"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={handleManualExecution}
              disabled={isExecuting || !rule.is_active}
              className={`p-3 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-xl transition-colors ${
                isExecuting || !rule.is_active ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title="Execute Now"
            >
              {isExecuting ? (
                <div className="w-5 h-5 border-2 border-secondary-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Zap className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={onTest}
              className="p-3 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-xl transition-colors"
              title="Test"
            >
              <Eye className="w-5 h-5" />
            </button>
            <button
              onClick={onDuplicate}
              className="p-3 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-xl transition-colors"
              title="Duplicate"
            >
              <Copy className="w-5 h-5" />
            </button>
            {showDeleteConfirm ? (
              <div className="flex items-center space-x-1 bg-red-900/20 p-2 rounded-xl">
                <button
                  onClick={handleCancelDelete}
                  className="p-1 text-secondary-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="p-1 text-red-400 hover:text-red-300 transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleDeleteClick}
                className="p-3 text-secondary-400 hover:text-red-400 hover:bg-red-900/20 rounded-xl transition-colors"
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 hover:bg-[#23233a]/60 transition-all duration-300 p-8">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              {getTriggerIcon()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">{rule.name}</h3>
              <Badge 
                variant={rule.is_active ? 'success' : 'secondary'} 
                size="md"
                className="px-3 py-1"
              >
                {rule.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </div>
        
        <p className="text-base text-secondary-300 leading-relaxed">{rule.description}</p>
        
        <div className="flex items-center space-x-4">
          {getConditionBadge()}
          {getActionBadge()}
        </div>
        
        <div className="flex items-center justify-between text-sm text-secondary-400">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>Created {rule.created_at.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Updated {rule.updated_at.toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-[#23233a]/50">
          <button
            onClick={() => onToggleStatus(!rule.is_active)}
            className={`p-3 rounded-xl transition-colors ${
              rule.is_active 
                ? 'text-green-400 hover:bg-green-900/20' 
                : 'text-secondary-400 hover:bg-secondary-700'
            }`}
            title={rule.is_active ? 'Deactivate' : 'Activate'}
          >
            {rule.is_active ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onEdit}
              className="p-3 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-xl transition-colors"
              title="Edit"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={handleManualExecution}
              disabled={isExecuting || !rule.is_active}
              className={`p-3 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-xl transition-colors ${
                isExecuting || !rule.is_active ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title="Execute Now"
            >
              {isExecuting ? (
                <div className="w-5 h-5 border-2 border-secondary-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Zap className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={onTest}
              className="p-3 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-xl transition-colors"
              title="Test"
            >
              <Eye className="w-5 h-5" />
            </button>
            <button
              onClick={onDuplicate}
              className="p-3 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-xl transition-colors"
              title="Duplicate"
            >
              <Copy className="w-5 h-5" />
            </button>
            {showDeleteConfirm ? (
              <div className="flex items-center space-x-1 bg-red-900/20 p-2 rounded-xl">
                <button
                  onClick={handleCancelDelete}
                  className="p-1 text-secondary-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="p-1 text-red-400 hover:text-red-300 transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleDeleteClick}
                className="p-3 text-secondary-400 hover:text-red-400 hover:bg-red-900/20 rounded-xl transition-colors"
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AutomationRuleCard;