import React from 'react';
import { ArrowRight, X, AlertTriangle, Check } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { AutomationTrigger, AutomationCondition, AutomationAction } from '../../types/automation';

interface AutomationFlowDesignerProps {
  flow: {
    trigger: AutomationTrigger | null;
    conditions: AutomationCondition[];
    actions: AutomationAction[];
  };
  onRemoveComponent: (category: 'trigger' | 'condition' | 'action', index: number) => void;
}

const AutomationFlowDesigner: React.FC<AutomationFlowDesignerProps> = ({ 
  flow, 
  onRemoveComponent 
}) => {
  const { trigger, conditions, actions } = flow;
  
  // Check if the flow is valid
  const isValid = !!trigger && actions.length > 0;
  
  return (
    <div className="space-y-6">
      <div className="bg-secondary-800/60 backdrop-blur-md rounded-xl border border-secondary-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Automation Flow</h3>
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Trigger */}
          <div className="w-full lg:w-1/3">
            <div className="text-center mb-2">
              <Badge variant="primary" size="sm">Trigger</Badge>
            </div>
            <div 
              className="min-h-[120px] border-2 border-dashed border-secondary-600 rounded-lg p-4 flex items-center justify-center hover:border-primary-600/50 transition-colors"
              data-droppable-id="trigger-zone"
            >
              {trigger ? (
                <div className="w-full bg-secondary-700 rounded-lg p-3 relative">
                  <button
                    onClick={() => onRemoveComponent('trigger', 0)}
                    className="absolute -top-2 -right-2 p-1 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="flex items-center space-x-3">
                    {trigger.icon && <trigger.icon className="w-5 h-5 text-primary-400" />}
                    <div>
                      <h4 className="font-medium text-white">{trigger.name}</h4>
                      <p className="text-xs text-secondary-400 mt-1">{trigger.description}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-secondary-500">
                  <p>Drag a trigger here</p>
                  <p className="text-xs mt-1">When should this automation run?</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Arrow */}
          <div className="hidden lg:flex items-center justify-center">
            <ArrowRight className="w-6 h-6 text-secondary-500" />
          </div>
          
          {/* Conditions */}
          <div className="w-full lg:w-1/3">
            <div className="text-center mb-2">
              <Badge variant="warning" size="sm">Conditions (Optional)</Badge>
            </div>
            <div 
              className="min-h-[120px] border-2 border-dashed border-secondary-600 rounded-lg p-4 flex flex-col items-center justify-center hover:border-primary-600/50 transition-colors"
              data-droppable-id="condition-zone"
            >
              {conditions.length > 0 ? (
                <div className="w-full space-y-2">
                  {conditions.map((condition, index) => (
                    <div key={index} className="bg-secondary-700 rounded-lg p-3 relative">
                      <button
                        onClick={() => onRemoveComponent('condition', index)}
                        className="absolute -top-2 -right-2 p-1 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="flex items-center space-x-3">
                        {condition.icon && <condition.icon className="w-5 h-5 text-yellow-400" />}
                        <div>
                          <h4 className="font-medium text-white">{condition.name}</h4>
                          <p className="text-xs text-secondary-400 mt-1">{condition.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-secondary-500">
                  <p>Drag conditions here (optional)</p>
                  <p className="text-xs mt-1">Only run if these conditions are met</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Arrow */}
          <div className="hidden lg:flex items-center justify-center">
            <ArrowRight className="w-6 h-6 text-secondary-500" />
          </div>
          
          {/* Actions */}
          <div className="w-full lg:w-1/3">
            <div className="text-center mb-2">
              <Badge variant="success" size="sm">Actions</Badge>
            </div>
            <div 
              className="min-h-[120px] border-2 border-dashed border-secondary-600 rounded-lg p-4 flex flex-col items-center justify-center hover:border-primary-600/50 transition-colors"
              data-droppable-id="action-zone"
            >
              {actions.length > 0 ? (
                <div className="w-full space-y-2">
                  {actions.map((action, index) => (
                    <div key={index} className="bg-secondary-700 rounded-lg p-3 relative">
                      <button
                        onClick={() => onRemoveComponent('action', index)}
                        className="absolute -top-2 -right-2 p-1 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="flex items-center space-x-3">
                        {action.icon && <action.icon className="w-5 h-5 text-green-400" />}
                        <div>
                          <h4 className="font-medium text-white">{action.name}</h4>
                          <p className="text-xs text-secondary-400 mt-1">{action.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-secondary-500">
                  <p>Drag actions here</p>
                  <p className="text-xs mt-1">What should happen when triggered?</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Validation Message */}
        <div className="mt-6 flex items-center justify-center">
          {isValid ? (
            <div className="flex items-center space-x-2 text-green-400 bg-green-900/20 px-4 py-2 rounded-lg">
              <Check className="w-4 h-4" />
              <span>Valid automation flow</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-yellow-400 bg-yellow-900/20 px-4 py-2 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
              <span>Automation requires at least one trigger and one action</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutomationFlowDesigner;