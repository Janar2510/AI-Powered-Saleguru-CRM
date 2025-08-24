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
  RefreshCw,
  Workflow,
  Cpu,
  Brain,
  Lightbulb,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Pause,
  PlayCircle,
  StopCircle,
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Shield,
  Lock,
  Unlock,
  Download,
  Upload,
  Share2,
  MoreHorizontal,
  Search,
  SortAsc,
  SortDesc,
  Filter as FilterIcon,
  Globe,
  Database,
  Cloud,
  Server,
  Wifi,
  WifiOff,
  CheckCircle,
  XCircle,
  Minus,
  Star,
  Bookmark,
  Edit,
  Eye as EyeIcon,
  Code,
  Palette,
  Layers,
  GitBranch,
  GitCommit,
  GitPullRequest,
  GitMerge,
  GitCompare,
  GitFork
} from 'lucide-react';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, TouchSensor } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import Spline from '@splinetool/react-spline';
import { supabase } from '../services/supabase';
import { useToastContext } from '../contexts/ToastContext';
import { useGuruContext } from '../contexts/GuruContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import AutomationFlowDesigner from '../components/automation/AutomationFlowDesigner';
import AutomationComponentLibrary from '../components/automation/AutomationComponentLibrary';
import AutomationRuleForm from '../components/automation/AutomationRuleForm';
import AutomationRuleCard from '../components/automation/AutomationRuleCard';
import AutomationRuleTemplates from '../components/automation/AutomationRuleTemplates';
import AutomationTestPanel from '../components/automation/AutomationTestPanel';
import { AutomationRule, AutomationComponent, AutomationTrigger, AutomationCondition, AutomationAction } from '../types/automation';

interface AutomationStats {
  totalRules: number;
  activeRules: number;
  inactiveRules: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  topTriggerType: string;
  mostUsedAction: string;
  automationEfficiency: number;
  timeSaved: number;
  costSavings: number;
}

const AutomationBuilder: React.FC = () => {
  const { showToast } = useToastContext();
  const { askGuru } = useGuruContext();
  
  // State for automation rules
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my-rules' | 'templates' | 'analytics'>('my-rules');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    triggerType: 'all',
    actionType: 'all',
    dateRange: 'all'
  });
  
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
  
  // Mock automation stats
  const [stats, setStats] = useState<AutomationStats>({
    totalRules: 24,
    activeRules: 18,
    inactiveRules: 6,
    totalExecutions: 1247,
    successfulExecutions: 1189,
    failedExecutions: 58,
    averageExecutionTime: 2.3,
    topTriggerType: 'Deal Stage Changed',
    mostUsedAction: 'Send Email',
    automationEfficiency: 95.3,
    timeSaved: 47.2,
    costSavings: 2840
  });
  
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
            <Button
              onClick={() => {
                setIsCreating(false);
                setIsEditing(false);
                setSelectedRule(null);
              }}
              variant="secondary"
              size="lg"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md min-w-[120px] h-12"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
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
                    <div className="p-3 bg-primary-600/90 backdrop-blur-sm border border-primary-500 rounded-lg shadow-lg text-white max-w-xs">
                      <div className="flex items-center space-x-2">
                        {activeComponent.icon && <activeComponent.icon className="w-4 h-4" />}
                        <span className="text-sm">{activeComponent.name}</span>
                      </div>
                    </div>
                  )}
                </DragOverlay>
              </DndContext>
            </div>
          </div>
          
          {/* Save Button - Aligned with Component Library bottom */}
          <div className="flex justify-end space-x-3 mt-4 mb-8 px-4 md:px-6 lg:px-8 xl:px-12">
            <Button
              onClick={() => {
                setIsCreating(false);
                setIsEditing(false);
                setSelectedRule(null);
              }}
              variant="secondary"
              size="lg"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md min-w-[120px] h-12"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={() => handleSaveRule({
                name: selectedRule?.name || 'New Automation Rule',
                description: selectedRule?.description || '',
                trigger: currentFlow.trigger!,
                conditions: currentFlow.conditions,
                actions: currentFlow.actions,
                is_active: true
              })}
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white backdrop-blur-md min-w-[120px] h-12"
              disabled={!currentFlow.trigger || currentFlow.actions.length === 0}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Rule
            </Button>
          </div>
        </div>
      );
    } else if (isTesting) {
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
          
          <AutomationTestPanel rule={selectedRule!} />
        </div>
      );
    } else {
      // Main dashboard view
      return (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-1 bg-white/10 backdrop-blur-md rounded-lg p-1">
              <button
                onClick={() => setActiveTab('my-rules')}
                className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 min-w-[100px] h-10 flex items-center justify-center ${
                  activeTab === 'my-rules'
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'text-secondary-400 hover:text-white'
                }`}
              >
                My Rules
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 min-w-[100px] h-10 flex items-center justify-center ${
                  activeTab === 'templates'
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'text-secondary-400 hover:text-white'
                }`}
              >
                Templates
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 min-w-[100px] h-10 flex items-center justify-center ${
                  activeTab === 'analytics'
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'text-secondary-400 hover:text-white'
                }`}
              >
                Analytics
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Search rules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-purple-500 h-10 min-w-[200px]"
                />
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex bg-white/10 backdrop-blur-md rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all duration-200 w-10 h-10 flex items-center justify-center ${
                    viewMode === 'grid'
                      ? 'bg-white/20 text-white'
                      : 'text-secondary-400 hover:text-white'
                  }`}
                >
                  <GridIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all duration-200 w-10 h-10 flex items-center justify-center ${
                    viewMode === 'list'
                      ? 'bg-white/20 text-white'
                      : 'text-secondary-400 hover:text-white'
                  }`}
                >
                  <ListIcon className="w-4 h-4" />
                </button>
              </div>
              
              {/* Refresh */}
              <button
                onClick={handleRefreshRules}
                disabled={isRefreshing}
                className="p-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-200 disabled:opacity-50 w-10 h-10 flex items-center justify-center"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          
          {/* Content based on active tab */}
          {activeTab === 'my-rules' && (
            <div className="space-y-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-secondary-400">Loading automation rules...</p>
                  </div>
                </div>
              ) : rules.length > 0 ? (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-8' : 'space-y-6'}>
                  {rules.map(rule => (
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
                  <Button
                    onClick={handleCreateRule}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white backdrop-blur-md px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 mx-auto h-12 min-w-[200px] justify-center"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Your First Rule</span>
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'templates' && (
            <AutomationRuleTemplates
              onUseTemplate={(template) => {
                setCurrentFlow({
                  trigger: template.trigger,
                  conditions: template.conditions,
                  actions: template.actions
                });
                setSelectedRule({
                  id: undefined, // Will be set when saved
                  name: template.name,
                  description: template.description,
                  is_active: true,
                  trigger: template.trigger,
                  conditions: template.conditions,
                  actions: template.actions,
                  created_at: new Date(),
                  updated_at: new Date(),
                  last_executed: undefined,
                  execution_count: 0,
                  success_count: 0,
                  failure_count: 0,
                  average_execution_time: 0
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
    <div className="min-h-screen relative overflow-hidden">
      {/* 3D Spline Background */}
      <div className="fixed inset-0 z-0">
        <Spline scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode" />
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-6 px-4 md:px-6 lg:px-8 xl:px-12 pt-6 transition-all duration-300">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Workflow className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white to-secondary-300 bg-clip-text text-transparent">
                  Automation Builder
                </h1>
                <p className="text-secondary-400 mt-1 text-sm">AI-powered workflow automation to streamline your sales process</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => askGuru("How can I optimize my automation workflows?")}
              variant="secondary" 
              size="lg"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md min-w-[140px] h-12"
            >
              <Brain className="w-4 h-4 mr-2" />
              Ask AI Guru
            </Button>
            {!isCreating && !isEditing && !isTesting && (
              <Button
                onClick={handleCreateRule}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white backdrop-blur-md min-w-[140px] h-12"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Rule
              </Button>
            )}
          </div>
        </div>

        {/* Enhanced Stats Overview */}
        {!isCreating && !isEditing && !isTesting && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6 hover:bg-[#23233a]/60 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-secondary-400 text-sm font-medium">Total Rules</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.totalRules}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                <span className="text-green-400">+12% this month</span>
              </div>
            </Card>

            <Card className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6 hover:bg-[#23233a]/60 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-secondary-400 text-sm font-medium">Active Rules</p>
                  <p className="text-3xl font-bold text-green-400 mt-1">{stats.activeRules}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <Activity className="w-4 h-4 text-green-400 mr-1" />
                <span className="text-green-400">{stats.automationEfficiency}% efficiency</span>
              </div>
            </Card>

            <Card className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6 hover:bg-[#23233a]/60 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-secondary-400 text-sm font-medium">Total Executions</p>
                  <p className="text-3xl font-bold text-blue-400 mt-1">{stats.totalExecutions.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <PlayCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <Clock className="w-4 h-4 text-blue-400 mr-1" />
                <span className="text-blue-400">{stats.averageExecutionTime}s avg</span>
              </div>
            </Card>

            <Card className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6 hover:bg-[#23233a]/60 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-secondary-400 text-sm font-medium">Time Saved</p>
                  <p className="text-3xl font-bold text-purple-400 mt-1">{stats.timeSaved}h</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-purple-400 mr-1" />
                <span className="text-purple-400">${stats.costSavings} saved</span>
              </div>
            </Card>
          </div>
        )}

        {/* Analytics Tab */}
        {!isCreating && !isEditing && !isTesting && activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
                Execution Performance
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-secondary-400">Success Rate</span>
                  <span className="text-green-400 font-semibold">
                    {((stats.successfulExecutions / stats.totalExecutions) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary-400">Failed Executions</span>
                  <span className="text-red-400 font-semibold">{stats.failedExecutions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary-400">Top Trigger</span>
                  <span className="text-white font-semibold">{stats.topTriggerType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary-400">Most Used Action</span>
                  <span className="text-white font-semibold">{stats.mostUsedAction}</span>
                </div>
              </div>
            </Card>

            <Card className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                Efficiency Metrics
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-secondary-400">Automation Efficiency</span>
                  <span className="text-green-400 font-semibold">{stats.automationEfficiency}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary-400">Time Saved This Month</span>
                  <span className="text-blue-400 font-semibold">{stats.timeSaved} hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary-400">Cost Savings</span>
                  <span className="text-purple-400 font-semibold">${stats.costSavings}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary-400">Active Rules</span>
                  <span className="text-white font-semibold">{stats.activeRules}/{stats.totalRules}</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Main Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default AutomationBuilder;