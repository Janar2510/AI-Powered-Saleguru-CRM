import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Zap, 
  Filter, 
  Play, 
  Save, 
  Trash2, 
  Settings, 
  AlertTriangle, 
  Check, 
  X, 
  ChevronDown, 
  ChevronRight, 
  Copy, 
  Eye, 
  HelpCircle,
  Mail,
  Calendar,
  CheckSquare,
  MessageSquare,
  Bell,
  Target,
  Users,
  Clock,
  DollarSign,
  Tag,
  FileText,
  Bot,
  Grid as GridIcon,
  List as ListIcon,
  RefreshCw
} from 'lucide-react';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, TouchSensor } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { createClient } from '@supabase/supabase-js';
import Container from '../components/layout/Container';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import AutomationFlowDesigner from '../components/automation/AutomationFlowDesigner';
import AutomationComponentLibrary from '../components/automation/AutomationComponentLibrary';
import AutomationRuleForm from '../components/automation/AutomationRuleForm';
import AutomationRuleCard from '../components/automation/AutomationRuleCard';
import AutomationRuleTemplates from '../components/automation/AutomationRuleTemplates';
import AutomationTestPanel from '../components/automation/AutomationTestPanel';
import { useToastContext } from '../contexts/ToastContext';
import { useGuru } from '../contexts/GuruContext';
import { AutomationRule, AutomationComponent, AutomationTrigger, AutomationCondition, AutomationAction } from '../types/automation';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

const AutomationBuilder: React.FC = () => {
  const { showToast } = useToastContext();
  const { openGuru } = useGuru();
  
  // State for automation rules
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my-rules' | 'templates'>('my-rules');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // State for the flow designer
  const [currentFlow, setCurrentFlow] = useState<{
    trigger: AutomationTrigger | null;
    conditions: AutomationCondition[];
    actions: AutomationAction[];
  }>({
    trigger: null,
    conditions: [],
    actions: []
  });
  
  // State for drag and drop
  const [activeComponent, setActiveComponent] = useState<AutomationComponent | null>(null);
  
  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );
  
  // Fetch automation rules from Supabase
  useEffect(() => {
    const fetchRules = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('automation_rules')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          setRules(data.map(rule => ({
            ...rule,
            trigger: rule.trigger_config || {},
            conditions: rule.condition_config || [],
            actions: rule.action_config || [],
            created_at: new Date(rule.created_at),
            updated_at: new Date(rule.updated_at),
            last_executed: rule.last_executed ? new Date(rule.last_executed) : undefined
          })));
        }
      } catch (err) {
        console.error('Error fetching automation rules:', err);
        showToast({
          title: 'Error',
          description: 'Failed to load automation rules',
          type: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRules();
  }, [showToast]);
  
  // Filter rules based on search term
  const filteredRules = rules.filter(rule => 
    rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle creating a new rule
  const handleCreateRule = () => {
    setCurrentFlow({
      trigger: null,
      conditions: [],
      actions: []
    });
    setSelectedRule(null);
    setIsCreating(true);
    setIsEditing(false);
  };
  
  // Handle editing an existing rule
  const handleEditRule = (rule: AutomationRule) => {
    setSelectedRule(rule);
    setCurrentFlow({
      trigger: rule.trigger,
      conditions: rule.conditions,
      actions: rule.actions
    });
    setIsEditing(true);
    setIsCreating(false);
  };
  
  // Handle testing a rule
  const handleTestRule = (rule: AutomationRule) => {
    setSelectedRule(rule);
    setIsTesting(true);
  };
  
  // Handle duplicating a rule
  const handleDuplicateRule = (rule: AutomationRule) => {
    const duplicatedRule = {
      ...rule,
      id: undefined,
      name: `${rule.name} (Copy)`,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    setSelectedRule(duplicatedRule);
    setCurrentFlow({
      trigger: duplicatedRule.trigger,
      conditions: duplicatedRule.conditions,
      actions: duplicatedRule.actions
    });
    setIsCreating(true);
    setIsEditing(false);
    
    showToast({
      title: 'Rule Duplicated',
      description: 'You can now edit and save the duplicated rule',
      type: 'success'
    });
  };
  
  // Handle deleting a rule
  const handleDeleteRule = async (ruleId: string) => {
    try {
      const { error } = await supabase
        .from('automation_rules')
        .delete()
        .eq('id', ruleId);
      
      if (error) throw error;
      
      setRules(prev => prev.filter(rule => rule.id !== ruleId));
      
      showToast({
        title: 'Rule Deleted',
        description: 'Automation rule has been deleted successfully',
        type: 'success'
      });
    } catch (err) {
      console.error('Error deleting rule:', err);
      showToast({
        title: 'Error',
        description: 'Failed to delete automation rule',
        type: 'error'
      });
    }
  };
  
  // Handle toggling a rule's active status
  const handleToggleRuleStatus = async (ruleId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('automation_rules')
        .update({ is_active: isActive })
        .eq('id', ruleId);
      
      if (error) throw error;
      
      setRules(prev => prev.map(rule => 
        rule.id === ruleId ? { ...rule, is_active: isActive } : rule
      ));
      
      showToast({
        title: isActive ? 'Rule Activated' : 'Rule Deactivated',
        description: `Automation rule has been ${isActive ? 'activated' : 'deactivated'} successfully`,
        type: 'success'
      });
    } catch (err) {
      console.error('Error updating rule status:', err);
      showToast({
        title: 'Error',
        description: 'Failed to update automation rule status',
        type: 'error'
      });
    }
  };
  
  // Handle refreshing rules
  const handleRefreshRules = async () => {
    setIsRefreshing(true);
    
    try {
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setRules(data.map(rule => ({
          ...rule,
          trigger: rule.trigger_config || {},
          conditions: rule.condition_config || [],
          actions: rule.action_config || [],
          created_at: new Date(rule.created_at),
          updated_at: new Date(rule.updated_at),
          last_executed: rule.last_executed ? new Date(rule.last_executed) : undefined
        })));
        
        showToast({
          title: 'Rules Refreshed',
          description: 'Automation rules have been refreshed',
          type: 'success'
        });
      }
    } catch (err) {
      console.error('Error refreshing rules:', err);
      showToast({
        title: 'Error',
        description: 'Failed to refresh automation rules',
        type: 'error'
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Handle saving a rule
  const handleSaveRule = async (rule: Partial<AutomationRule>) => {
    try {
      if (!rule.name || !currentFlow.trigger || currentFlow.actions.length === 0) {
        showToast({
          title: 'Validation Error',
          description: 'Rule must have a name, trigger, and at least one action',
          type: 'error'
        });
        return;
      }
      
      const ruleData = {
        name: rule.name,
        description: rule.description || '',
        is_active: rule.is_active !== undefined ? rule.is_active : true,
        trigger_type: currentFlow.trigger.type,
        trigger_config: currentFlow.trigger,
        condition_type: currentFlow.conditions.length > 0 ? currentFlow.conditions[0].type : null,
        condition_config: currentFlow.conditions,
        action_type: currentFlow.actions.length > 0 ? currentFlow.actions[0].type : null,
        action_config: currentFlow.actions
      };
      
      let result;
      
      if (isEditing && selectedRule?.id) {
        // Update existing rule
        const { data, error } = await supabase
          .from('automation_rules')
          .update(ruleData)
          .eq('id', selectedRule.id)
          .select();
        
        if (error) throw error;
        result = data;
      } else {
        // Create new rule
        const { data, error } = await supabase
          .from('automation_rules')
          .insert(ruleData)
          .select();
        
        if (error) throw error;
        result = data;
      }
      
      if (result && result.length > 0) {
        // Refresh rules list
        const { data, error } = await supabase
          .from('automation_rules')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          setRules(data.map(rule => ({
            ...rule,
            trigger: rule.trigger_config || {},
            conditions: rule.condition_config || [],
            actions: rule.action_config || [],
            created_at: new Date(rule.created_at),
            updated_at: new Date(rule.updated_at)
          })));
        }
        
        // Reset state
        setIsCreating(false);
        setIsEditing(false);
        setSelectedRule(null);
        
        showToast({
          title: isEditing ? 'Rule Updated' : 'Rule Created',
          description: `Automation rule has been ${isEditing ? 'updated' : 'created'} successfully`,
          type: 'success'
        });
      }
    } catch (err) {
      console.error('Error saving rule:', err);
      showToast({
        title: 'Error',
        description: 'Failed to save automation rule',
        type: 'error'
      });
    }
  };
  
  // Handle drag start
  const handleDragStart = (event: any) => {
    const { active } = event;
    setActiveComponent(active.data.current.component);
  };
  
  // Handle drag end
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    setActiveComponent(null);
    
    if (!over) return;
    
    const component = active.data.current.component;
    const dropZone = over.id;
    
    // Handle dropping component into flow
    if (dropZone === 'trigger-zone' && component.category === 'trigger') {
      setCurrentFlow(prev => ({
        ...prev,
        trigger: component as AutomationTrigger
      }));
    } else if (dropZone === 'condition-zone' && component.category === 'condition') {
      setCurrentFlow(prev => ({
        ...prev,
        conditions: [...prev.conditions, component as AutomationCondition]
      }));
    } else if (dropZone === 'action-zone' && component.category === 'action') {
      setCurrentFlow(prev => ({
        ...prev,
        actions: [...prev.actions, component as AutomationAction]
      }));
    }
  };
  
  // Handle removing a component from the flow
  const handleRemoveComponent = (category: 'trigger' | 'condition' | 'action', index: number) => {
    if (category === 'trigger') {
      setCurrentFlow(prev => ({
        ...prev,
        trigger: null
      }));
    } else if (category === 'condition') {
      setCurrentFlow(prev => ({
        ...prev,
        conditions: prev.conditions.filter((_, i) => i !== index)
      }));
    } else if (category === 'action') {
      setCurrentFlow(prev => ({
        ...prev,
        actions: prev.actions.filter((_, i) => i !== index)
      }));
    }
  };
  
  // Render the main content based on state
  const renderContent = () => {
    if (isCreating || isEditing) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              {isEditing ? 'Edit Automation Rule' : 'Create New Automation Rule'}
            </h2>
            <button
              onClick={() => {
                setIsCreating(false);
                setIsEditing(false);
                setSelectedRule(null);
              }}
              className="btn-secondary flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Component Library */}
            <div className="lg:col-span-1">
              <AutomationComponentLibrary 
                onSelectComponent={(component) => {
                  if (component.category === 'trigger') {
                    setCurrentFlow(prev => ({
                      ...prev,
                      trigger: component as AutomationTrigger
                    }));
                  } else if (component.category === 'condition') {
                    setCurrentFlow(prev => ({
                      ...prev,
                      conditions: [...prev.conditions, component as AutomationCondition]
                    }));
                  } else if (component.category === 'action') {
                    setCurrentFlow(prev => ({
                      ...prev,
                      actions: [...prev.actions, component as AutomationAction]
                    }));
                  }
                }}
              />
            </div>
            
            {/* Flow Designer */}
            <div className="lg:col-span-3">
              <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToWindowEdges]}
              >
                <AutomationFlowDesigner
                  flow={currentFlow}
                  onRemoveComponent={handleRemoveComponent}
                />
                
                <DragOverlay>
                  {activeComponent && (
                    <div className="p-4 bg-primary-600/90 backdrop-blur-sm border border-primary-500 rounded-lg shadow-lg text-white max-w-xs">
                      <div className="flex items-center space-x-2">
                        {activeComponent.icon && <activeComponent.icon className="w-5 h-5" />}
                        <span className="font-medium">{activeComponent.name}</span>
                      </div>
                    </div>
                  )}
                </DragOverlay>
              </DndContext>
              
              {/* Rule Form */}
              <div className="mt-6">
                <AutomationRuleForm
                  rule={selectedRule}
                  isValid={!!currentFlow.trigger && currentFlow.actions.length > 0}
                  onSave={handleSaveRule}
                />
              </div>
            </div>
          </div>
        </div>
      );
    } else if (isTesting && selectedRule) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Test Automation Rule</h2>
            <button
              onClick={() => {
                setIsTesting(false);
                setSelectedRule(null);
              }}
              className="btn-secondary flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
          </div>
          
          <AutomationTestPanel rule={selectedRule} />
        </div>
      );
    } else {
      return (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('my-rules')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'my-rules'
                  ? 'bg-primary-600 text-white'
                  : 'bg-secondary-700 text-secondary-300 hover:bg-secondary-600'
              }`}
            >
              My Rules
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'templates'
                  ? 'bg-primary-600 text-white'
                  : 'bg-secondary-700 text-secondary-300 hover:bg-secondary-600'
              }`}
            >
              Templates
            </button>
          </div>
          
          {/* Search and Filters */}
          <div className="flex items-center justify-between">
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Search automation rules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1 bg-secondary-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-primary-600 text-white'
                      : 'text-secondary-400 hover:text-white'
                  }`}
                >
                  <GridIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-primary-600 text-white'
                      : 'text-secondary-400 hover:text-white'
                  }`}
                >
                  <ListIcon className="w-4 h-4" />
                </button>
              </div>
              
              <button
                onClick={handleRefreshRules}
                disabled={isRefreshing}
                className="btn-secondary flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              
              <button
                onClick={handleCreateRule}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Rule</span>
              </button>
            </div>
          </div>
          
          {/* Rules or Templates */}
          {activeTab === 'my-rules' ? (
            isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-secondary-400">Loading automation rules...</p>
                </div>
              </div>
            ) : filteredRules.length > 0 ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredRules.map(rule => (
                  <AutomationRuleCard
                    key={rule.id}
                    rule={rule}
                    viewMode={viewMode}
                    onEdit={() => handleEditRule(rule)}
                    onTest={() => handleTestRule(rule)}
                    onDuplicate={() => handleDuplicateRule(rule)}
                    onDelete={() => handleDeleteRule(rule.id!)}
                    onToggleStatus={(isActive) => handleToggleRuleStatus(rule.id!, isActive)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Zap className="w-16 h-16 text-secondary-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Automation Rules Yet</h3>
                <p className="text-secondary-400 mb-6">
                  Create your first automation rule to streamline your workflow
                </p>
                <button
                  onClick={handleCreateRule}
                  className="btn-primary flex items-center space-x-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Your First Rule</span>
                </button>
              </div>
            )
          ) : (
            <AutomationRuleTemplates
              onUseTemplate={(template) => {
                setCurrentFlow({
                  trigger: template.trigger,
                  conditions: template.conditions,
                  actions: template.actions
                });
                setSelectedRule({
                  name: template.name,
                  description: template.description,
                  is_active: true,
                  trigger: template.trigger,
                  conditions: template.conditions,
                  actions: template.actions,
                  created_at: new Date(),
                  updated_at: new Date()
                });
                setIsCreating(true);
              }}
            />
          )}
        </div>
      );
    }
  };
  
  return (
    <Container>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Automation Builder</h1>
            <p className="text-secondary-400 mt-1">Create custom workflows to automate your sales process</p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={openGuru}
              className="btn-secondary flex items-center space-x-2"
            >
              <Bot className="w-4 h-4" />
              <span>Ask Guru</span>
            </button>
            {!isCreating && !isEditing && !isTesting && (
              <button
                onClick={handleCreateRule}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Rule</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Stats Overview */}
        {!isCreating && !isEditing && !isTesting && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white/10 backdrop-blur-md">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{rules.length}</div>
                <div className="text-secondary-400 text-sm">Total Rules</div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {rules.filter(r => r.is_active).length}
                </div>
                <div className="text-secondary-400 text-sm">Active</div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">
                  {rules.filter(r => r.trigger?.type === 'deal_stage_changed').length}
                </div>
                <div className="text-secondary-400 text-sm">Deal Rules</div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {rules.filter(r => r.trigger?.type === 'task_deadline_missed' || r.trigger?.type === 'task_completed').length}
                </div>
                <div className="text-secondary-400 text-sm">Task Rules</div>
              </div>
            </Card>
          </div>
        )}
        
        {/* Main Content */}
        {renderContent()}
      </div>
    </Container>
  );
};

export default AutomationBuilder;