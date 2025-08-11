import React, { useState } from 'react';
import { ArrowRight, X, AlertTriangle, Check, Plus, Settings, Clock, GitBranch, Zap, Play, Pause, RotateCcw } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
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
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<any>(null);
  
  // Check if the flow is valid
  const isValid = !!trigger && actions.length > 0;
  
  // Calculate flow complexity score
  const complexityScore = (conditions.length * 2) + (actions.length * 1) + (trigger ? 1 : 0);
  
  const getComplexityLevel = () => {
    if (complexityScore <= 3) return { level: 'Basic', color: 'text-green-400', bg: 'bg-green-900/20' };
    if (complexityScore <= 6) return { level: 'Intermediate', color: 'text-yellow-400', bg: 'bg-yellow-900/20' };
    return { level: 'Advanced', color: 'text-purple-400', bg: 'bg-purple-900/20' };
  };
  
  const complexity = getComplexityLevel();
  
  return (
    <div className="space-y-4">
      {/* Flow Header with Advanced Controls */}
      <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h3 className="text-lg font-bold text-white">Automation Flow</h3>
            <div className={`flex items-center space-x-2 px-2 py-1 rounded-lg ${complexity.bg}`}>
              <Zap className={`w-4 h-4 ${complexity.color}`} />
              <span className={`text-sm font-medium ${complexity.color}`}>{complexity.level}</span>
            </div>
            <Badge variant="secondary" className="bg-blue-900/20 text-blue-400 border-blue-500/30">
              {complexityScore} steps
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowAdvancedConfig(!showAdvancedConfig)}
              variant="secondary"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Settings className="w-4 h-4 mr-2" />
              Advanced
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Play className="w-4 h-4 mr-2" />
              Test Flow
            </Button>
          </div>
        </div>
        
        {/* Main Flow Design */}
        <div className="relative">
          {/* Flow Connection Lines */}
          <div className="absolute inset-0 pointer-events-none">
            <svg className="w-full h-full" style={{ zIndex: 0 }}>
              {/* Trigger to Conditions */}
              {trigger && (
                <path
                  d="M 33% 50% L 66% 50%"
                  stroke="url(#gradient1)"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="5,5"
                />
              )}
              {/* Conditions to Actions */}
              {conditions.length > 0 && actions.length > 0 && (
                <path
                  d="M 66% 50% L 100% 50%"
                  stroke="url(#gradient2)"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="5,5"
                />
              )}
              <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
                <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          
          {/* Flow Components */}
          <div className="flex flex-col lg:flex-row items-start space-y-4 lg:space-y-0 lg:space-x-4 relative" style={{ zIndex: 1 }}>
            {/* Trigger Section */}
            <div className="w-full lg:flex-1">
              <div className="text-center mb-3">
                <Badge variant="primary" size="md" className="px-3 py-1">
                  <Zap className="w-4 h-4 mr-2" />
                  Trigger
                </Badge>
              </div>
              <div 
                className="min-h-[140px] border-2 border-dashed border-purple-500/50 rounded-xl p-4 flex items-center justify-center hover:border-purple-400/70 transition-all duration-300 bg-purple-900/10"
                data-droppable-id="trigger-zone"
              >
                {trigger ? (
                  <div className="w-full bg-[#23233a]/60 backdrop-blur-sm rounded-xl p-3 relative border border-purple-500/30">
                    <button
                      onClick={() => onRemoveComponent('trigger', 0)}
                      className="absolute -top-2 -right-2 p-1.5 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors shadow-lg"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                        {trigger.icon && <trigger.icon className="w-5 h-5 text-white" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white text-base">{trigger.name}</h4>
                        <p className="text-sm text-secondary-300 mt-1">{trigger.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="secondary" size="sm" className="bg-purple-900/30 text-purple-300">
                            Active
                          </Badge>
                          <button
                            onClick={() => setSelectedComponent(trigger)}
                            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                          >
                            Configure
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-secondary-400">
                    <Zap className="w-10 h-10 mx-auto mb-2 text-purple-500/50" />
                    <p className="font-medium text-base">Drag a trigger here</p>
                    <p className="text-sm mt-1">When should this automation run?</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Conditions Section */}
            <div className="w-full lg:flex-1">
              <div className="text-center mb-3">
                <Badge variant="warning" size="md" className="px-3 py-1">
                  <GitBranch className="w-4 h-4 mr-2" />
                  Conditions
                  {conditions.length > 0 && (
                    <span className="ml-2 bg-yellow-600 text-white px-2 py-0.5 rounded-full text-xs">
                      {conditions.length}
                    </span>
                  )}
                </Badge>
              </div>
              <div 
                className="min-h-[140px] border-2 border-dashed border-yellow-500/50 rounded-xl p-4 flex flex-col items-center justify-center hover:border-yellow-400/70 transition-all duration-300 bg-yellow-900/10"
                data-droppable-id="condition-zone"
              >
                {conditions.length > 0 ? (
                  <div className="w-full space-y-2">
                    {conditions.map((condition, index) => (
                      <div key={index} className="bg-[#23233a]/60 backdrop-blur-sm rounded-xl p-3 relative border border-yellow-500/30">
                        <button
                          onClick={() => onRemoveComponent('condition', index)}
                          className="absolute -top-2 -right-2 p-1.5 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors shadow-lg"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                            {condition.icon && <condition.icon className="w-4 h-4 text-white" />}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-white text-sm">{condition.name}</h4>
                            <p className="text-xs text-secondary-300 mt-1">{condition.description}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="secondary" size="sm" className="bg-yellow-900/30 text-yellow-300">
                                Step {index + 1}
                              </Badge>
                              <button
                                onClick={() => setSelectedComponent(condition)}
                                className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
                              >
                                Configure
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="text-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-yellow-900/20 border-yellow-500/30 text-yellow-400 hover:bg-yellow-900/30"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Condition
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-secondary-400">
                    <GitBranch className="w-10 h-10 mx-auto mb-2 text-yellow-500/50" />
                    <p className="font-medium text-base">Drag conditions here (optional)</p>
                    <p className="text-sm mt-1">Only run if these conditions are met</p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-2 bg-yellow-900/20 border-yellow-500/30 text-yellow-400 hover:bg-yellow-900/30"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Condition
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Actions Section */}
            <div className="w-full lg:flex-1">
              <div className="text-center mb-3">
                <Badge variant="success" size="md" className="px-3 py-1">
                  <Play className="w-4 h-4 mr-2" />
                  Actions
                  {actions.length > 0 && (
                    <span className="ml-2 bg-green-600 text-white px-2 py-0.5 rounded-full text-xs">
                      {actions.length}
                    </span>
                  )}
                </Badge>
              </div>
              <div 
                className="min-h-[140px] border-2 border-dashed border-green-500/50 rounded-xl p-4 flex flex-col items-center justify-center hover:border-green-400/70 transition-all duration-300 bg-green-900/10"
                data-droppable-id="action-zone"
              >
                {actions.length > 0 ? (
                  <div className="w-full space-y-2">
                    {actions.map((action, index) => (
                      <div key={index} className="bg-[#23233a]/60 backdrop-blur-sm rounded-xl p-3 relative border border-green-500/30">
                        <button
                          onClick={() => onRemoveComponent('action', index)}
                          className="absolute -top-2 -right-2 p-1.5 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors shadow-lg"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                            {action.icon && <action.icon className="w-4 h-4 text-white" />}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-white text-sm">{action.name}</h4>
                            <p className="text-xs text-secondary-300 mt-1">{action.description}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="secondary" size="sm" className="bg-green-900/30 text-green-300">
                                Step {index + 1}
                              </Badge>
                              <button
                                onClick={() => setSelectedComponent(action)}
                                className="text-xs text-green-400 hover:text-green-300 transition-colors"
                              >
                                Configure
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="text-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-green-900/20 border-green-500/30 text-green-400 hover:bg-green-900/30"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Action
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-secondary-400">
                    <Play className="w-10 h-10 mx-auto mb-2 text-green-500/50" />
                    <p className="font-medium text-base">Drag actions here</p>
                    <p className="text-sm mt-1">What should happen when triggered?</p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-2 bg-green-900/20 border-green-500/30 text-green-400 hover:bg-green-900/30"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Action
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Advanced Configuration Panel */}
        {showAdvancedConfig && (
          <div className="mt-4 p-4 bg-[#23233a]/30 backdrop-blur-sm rounded-xl border border-[#23233a]/50">
            <h4 className="text-base font-semibold text-white mb-3 flex items-center">
              <Settings className="w-4 h-4 mr-2 text-blue-400" />
              Advanced Configuration
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-3">
                <h5 className="font-medium text-white text-sm">Execution Settings</h5>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-secondary-400">Max Retries</span>
                    <select className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-xs">
                      <option>0</option>
                      <option>1</option>
                      <option>2</option>
                      <option>3</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-secondary-400">Timeout</span>
                    <select className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-xs">
                      <option>30s</option>
                      <option>1m</option>
                      <option>5m</option>
                      <option>15m</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-secondary-400">Priority</span>
                    <select className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-xs">
                      <option>Normal</option>
                      <option>High</option>
                      <option>Critical</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h5 className="font-medium text-white text-sm">Scheduling</h5>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-secondary-400">Delay</span>
                    <select className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-xs">
                      <option>None</option>
                      <option>5 minutes</option>
                      <option>1 hour</option>
                      <option>1 day</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-secondary-400">Time Window</span>
                    <select className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-xs">
                      <option>24/7</option>
                      <option>Business Hours</option>
                      <option>Custom</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-secondary-400">Rate Limit</span>
                    <select className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-xs">
                      <option>Unlimited</option>
                      <option>1 per minute</option>
                      <option>1 per hour</option>
                      <option>1 per day</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h5 className="font-medium text-white text-sm">Error Handling</h5>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-secondary-400">On Error</span>
                    <select className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-xs">
                      <option>Stop</option>
                      <option>Continue</option>
                      <option>Retry</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-secondary-400">Notifications</span>
                    <select className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-xs">
                      <option>None</option>
                      <option>Email</option>
                      <option>Slack</option>
                      <option>Webhook</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-secondary-400">Logging</span>
                    <select className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-xs">
                      <option>Basic</option>
                      <option>Detailed</option>
                      <option>Debug</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Validation and Status */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {isValid ? (
              <div className="flex items-center space-x-2 text-green-400 bg-green-900/20 px-3 py-2 rounded-lg">
                <Check className="w-4 h-4" />
                <span className="font-medium text-sm">Valid automation flow</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-yellow-400 bg-yellow-900/20 px-3 py-2 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium text-sm">Automation requires at least one trigger and one action</span>
              </div>
            )}
            
            <div className="flex items-center space-x-2 text-blue-400 bg-blue-900/20 px-2 py-1 rounded-lg">
              <Clock className="w-3 h-3" />
              <span className="text-xs">Estimated execution time: ~{Math.max(1, Math.ceil(actions.length * 0.5))}s</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Play className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomationFlowDesigner;