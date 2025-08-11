import React, { useState } from 'react';
import { Search, Zap, Filter, DollarSign, Users, Calendar, CheckSquare, Mail, MessageSquare, Bell, Clock, Tag, Target, FileText, Edit, Play, Database, Globe, Shield, Cpu, Brain, GitBranch, Timer, AlertTriangle, CheckCircle, XCircle, ArrowRight, ArrowLeft, RotateCcw, Settings, Activity, BarChart3, TrendingUp, TrendingDown, Smartphone, Monitor, Wifi, WifiOff, Cloud, Server, GitCommit, GitMerge, GitCompare, GitFork, Layers, Palette, Code, GitBranchPlus } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { AutomationComponent } from '../../types/automation';

interface AutomationComponentLibraryProps {
  onSelectComponent: (component: AutomationComponent) => void;
}

const AutomationComponentLibrary: React.FC<AutomationComponentLibraryProps> = ({ 
  onSelectComponent 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'trigger' | 'condition' | 'action'>('all');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Define all available components
  const components: AutomationComponent[] = [
    // Basic Triggers
    {
      id: 'deal_stage_changed',
      name: 'Deal Stage Changed',
      description: 'Triggered when a deal moves to a different stage',
      category: 'trigger',
      icon: Target,
      complexity: 'basic',
      config: {
        fromStage: 'any',
        toStage: 'any'
      }
    },
    {
      id: 'deal_created',
      name: 'New Deal Created',
      description: 'Triggered when a new deal is created',
      category: 'trigger',
      icon: Target,
      complexity: 'basic',
      config: {}
    },
    {
      id: 'contact_created',
      name: 'New Contact Created',
      description: 'Triggered when a new contact is added',
      category: 'trigger',
      icon: Users,
      complexity: 'basic',
      config: {}
    },
    {
      id: 'task_deadline_missed',
      name: 'Task Deadline Missed',
      description: 'Triggered when a task becomes overdue',
      category: 'trigger',
      icon: CheckSquare,
      complexity: 'basic',
      config: {}
    },
    {
      id: 'task_completed',
      name: 'Task Completed',
      description: 'Triggered when a task is marked as complete',
      category: 'trigger',
      icon: CheckSquare,
      complexity: 'basic',
      config: {}
    },
    {
      id: 'form_submitted',
      name: 'Form Submission',
      description: 'Triggered when a form is submitted',
      category: 'trigger',
      icon: FileText,
      complexity: 'basic',
      config: {
        formId: 'any'
      }
    },
    {
      id: 'email_opened',
      name: 'Email Opened',
      description: 'Triggered when a recipient opens an email',
      category: 'trigger',
      icon: Mail,
      complexity: 'basic',
      config: {}
    },
    {
      id: 'email_clicked',
      name: 'Email Link Clicked',
      description: 'Triggered when a recipient clicks a link in an email',
      category: 'trigger',
      icon: Mail,
      complexity: 'basic',
      config: {}
    },
    
    // Advanced Triggers
    {
      id: 'webhook_received',
      name: 'Webhook Received',
      description: 'Triggered when a webhook is received from external system',
      category: 'trigger',
      icon: Globe,
      complexity: 'advanced',
      config: {
        webhookUrl: '',
        secret: '',
        method: 'POST'
      }
    },
    {
      id: 'scheduled_trigger',
      name: 'Scheduled Trigger',
      description: 'Triggered on a specific schedule (cron-like)',
      category: 'trigger',
      icon: Timer,
      complexity: 'advanced',
      config: {
        schedule: 'daily',
        time: '09:00',
        timezone: 'UTC'
      }
    },
    {
      id: 'api_call',
      name: 'API Call Trigger',
      description: 'Triggered when an API endpoint is called',
      category: 'trigger',
      icon: Server,
      complexity: 'advanced',
      config: {
        endpoint: '/api/trigger',
        method: 'POST',
        auth: 'none'
      }
    },
    {
      id: 'database_change',
      name: 'Database Change',
      description: 'Triggered when database records are modified',
      category: 'trigger',
      icon: Database,
      complexity: 'advanced',
      config: {
        table: '',
        operation: 'insert',
        conditions: {}
      }
    },
    
    // Basic Conditions
    {
      id: 'deal_value',
      name: 'Deal Value',
      description: 'Check if deal value meets criteria',
      category: 'condition',
      icon: DollarSign,
      complexity: 'basic',
      config: {
        operator: 'greater_than',
        value: 10000
      }
    },
    {
      id: 'deal_probability',
      name: 'Deal Probability',
      description: 'Check deal probability percentage',
      category: 'condition',
      icon: Target,
      complexity: 'basic',
      config: {
        operator: 'greater_than',
        value: 50
      }
    },
    {
      id: 'task_priority',
      name: 'Task Priority',
      description: 'Check task priority level',
      category: 'condition',
      icon: CheckSquare,
      complexity: 'basic',
      config: {
        priority: 'high'
      }
    },
    {
      id: 'contact_tags',
      name: 'Contact Has Tags',
      description: 'Check if contact has specific tags',
      category: 'condition',
      icon: Tag,
      complexity: 'basic',
      config: {
        tags: [],
        operator: 'contains_any'
      }
    },
    {
      id: 'time_based',
      name: 'Time Condition',
      description: 'Check if current time meets criteria',
      category: 'condition',
      icon: Clock,
      complexity: 'basic',
      config: {
        days: ['weekday'],
        timeFrom: '09:00',
        timeTo: '17:00'
      }
    },
    {
      id: 'custom_field',
      name: 'Custom Field Value',
      description: 'Check value of a custom field',
      category: 'condition',
      icon: Filter,
      complexity: 'basic',
      config: {
        field: '',
        operator: 'equals',
        value: ''
      }
    },
    
    // Advanced Conditions
    {
      id: 'complex_logic',
      name: 'Complex Logic',
      description: 'Combine multiple conditions with AND/OR logic',
      category: 'condition',
      icon: GitBranch,
      complexity: 'advanced',
      config: {
        logic: 'AND',
        conditions: []
      }
    },
    {
      id: 'data_validation',
      name: 'Data Validation',
      description: 'Validate data format and content',
      category: 'condition',
      icon: Shield,
      complexity: 'advanced',
      config: {
        field: '',
        validation: 'email',
        customRegex: ''
      }
    },
    {
      id: 'external_api_check',
      name: 'External API Check',
      description: 'Check condition against external API',
      category: 'condition',
      icon: Globe,
      complexity: 'advanced',
      config: {
        url: '',
        method: 'GET',
        expectedResponse: '',
        timeout: 30
      }
    },
    {
      id: 'machine_learning',
      name: 'AI Prediction',
      description: 'Use AI to predict outcomes and conditions',
      category: 'condition',
      icon: Brain,
      complexity: 'advanced',
      config: {
        model: 'lead_scoring',
        threshold: 0.7,
        features: []
      }
    },
    
    // Basic Actions
    {
      id: 'send_email',
      name: 'Send Email',
      description: 'Send an email using a template',
      category: 'action',
      icon: Mail,
      complexity: 'basic',
      config: {
        templateId: '',
        to: '{{contact.email}}',
        subject: ''
      }
    },
    {
      id: 'create_task',
      name: 'Create Task',
      description: 'Create a new task and assign it',
      category: 'action',
      icon: CheckSquare,
      complexity: 'basic',
      config: {
        title: '',
        description: '',
        dueDate: 'in_3_days',
        priority: 'medium',
        assignTo: 'current_user'
      }
    },
    {
      id: 'update_record',
      name: 'Update Record',
      description: 'Update fields on a record',
      category: 'action',
      icon: Edit,
      complexity: 'basic',
      config: {
        recordType: 'deal',
        fields: {}
      }
    },
    {
      id: 'add_note',
      name: 'Add Note',
      description: 'Add a note to a record',
      category: 'action',
      icon: MessageSquare,
      complexity: 'basic',
      config: {
        recordType: 'deal',
        noteText: ''
      }
    },
    {
      id: 'send_notification',
      name: 'Send Notification',
      description: 'Send an in-app notification',
      category: 'action',
      icon: Bell,
      complexity: 'basic',
      config: {
        message: '',
        recipientType: 'user',
        recipientId: 'current_user'
      }
    },
    {
      id: 'create_calendar_event',
      name: 'Create Calendar Event',
      description: 'Schedule a calendar event',
      category: 'action',
      icon: Calendar,
      complexity: 'basic',
      config: {
        title: '',
        description: '',
        startDate: 'tomorrow',
        duration: 30,
        attendees: []
      }
    },
    
    // Advanced Actions
    {
      id: 'webhook_call',
      name: 'Call Webhook',
      description: 'Send data to external system via webhook',
      category: 'action',
      icon: Globe,
      complexity: 'advanced',
      config: {
        url: '',
        method: 'POST',
        headers: {},
        body: {},
        retryOnFailure: true
      }
    },
    {
      id: 'api_integration',
      name: 'API Integration',
      description: 'Integrate with external APIs',
      category: 'action',
      icon: Server,
      complexity: 'advanced',
      config: {
        service: 'slack',
        action: 'send_message',
        channel: '',
        message: ''
      }
    },
    {
      id: 'data_transformation',
      name: 'Data Transformation',
      description: 'Transform and manipulate data',
      category: 'action',
      icon: Cpu,
      complexity: 'advanced',
      config: {
        input: '',
        transformation: 'json_to_csv',
        output: ''
      }
    },
    {
      id: 'conditional_action',
      name: 'Conditional Action',
      description: 'Execute different actions based on conditions',
      category: 'action',
      icon: GitBranch,
      complexity: 'advanced',
      config: {
        conditions: [],
        actions: []
      }
    },
    {
      id: 'delay_action',
      name: 'Delay Action',
      description: 'Delay execution for specified time',
      category: 'action',
      icon: Timer,
      complexity: 'advanced',
      config: {
        delay: 300,
        unit: 'seconds',
        reason: ''
      }
    },
    {
      id: 'batch_processing',
      name: 'Batch Processing',
      description: 'Process multiple records in batch',
      category: 'action',
      icon: Layers,
      complexity: 'advanced',
      config: {
        batchSize: 100,
        operation: 'update',
        records: []
      }
    },
    {
      id: 'ai_action',
      name: 'AI Action',
      description: 'Use AI to generate content or make decisions',
      category: 'action',
      icon: Brain,
      complexity: 'advanced',
      config: {
        model: 'gpt-4',
        prompt: '',
        outputField: '',
        temperature: 0.7
      }
    }
  ];
  
  // Filter components based on search, category, and complexity
  const filteredComponents = components.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeCategory === 'all' || component.category === activeCategory;
    
    const matchesComplexity = showAdvanced || component.complexity === 'basic';
    
    return matchesSearch && matchesCategory && matchesComplexity;
  });
  
  // Group components by category
  const groupedComponents = filteredComponents.reduce((acc, component) => {
    const category = component.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(component);
    return acc;
  }, {} as Record<string, AutomationComponent[]>);
  
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'basic': return 'text-green-400 bg-green-900/20 border-green-500/30';
      case 'intermediate': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
      case 'advanced': return 'text-purple-400 bg-purple-900/20 border-purple-500/30';
      default: return 'text-blue-400 bg-blue-900/20 border-blue-500/30';
    }
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'trigger': return Zap;
      case 'condition': return Filter;
      case 'action': return Play;
      default: return Zap;
    }
  };
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'trigger': return 'text-purple-400 bg-purple-900/20 border-purple-500/30';
      case 'condition': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
      case 'action': return 'text-green-400 bg-green-900/20 border-green-500/30';
      default: return 'text-blue-400 bg-blue-900/20 border-blue-500/30';
    }
  };
  
  return (
    <Card className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-4 h-full">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-bold text-white">Component Library</h3>
          <Button
            onClick={() => setShowAdvanced(!showAdvanced)}
            variant="secondary"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            {showAdvanced ? 'Basic' : 'Advanced'}
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
          <input
            type="text"
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
        </div>
        
        {/* Category Filters */}
        <div className="flex space-x-1 bg-white/10 backdrop-blur-md rounded-lg p-1">
          {[
            { key: 'all', label: 'All', icon: Zap },
            { key: 'trigger', label: 'Triggers', icon: Zap },
            { key: 'condition', label: 'Conditions', icon: Filter },
            { key: 'action', label: 'Actions', icon: Play }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key as any)}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                activeCategory === key
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-secondary-400 hover:text-white'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{label}</span>
            </button>
          ))}
        </div>
        
        {/* Components List */}
        <div className="space-y-4 max-h-[500px] overflow-y-auto">
          {Object.entries(groupedComponents).map(([category, categoryComponents]) => (
            <div key={category} className="space-y-2">
              <div className="flex items-center space-x-2">
                {React.createElement(getCategoryIcon(category), { className: "w-4 h-4 text-secondary-400" })}
                <h4 className="font-semibold text-white capitalize text-sm">{category}s</h4>
                <Badge variant="secondary" className={getCategoryColor(category)}>
                  {categoryComponents.length}
                </Badge>
              </div>
              
              <div className="grid gap-2">
                {categoryComponents.map((component) => (
                  <div
                    key={component.id}
                    onClick={() => onSelectComponent(component)}
                    className="bg-[#23233a]/60 backdrop-blur-sm rounded-xl p-3 border border-[#23233a]/50 hover:border-white/20 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        {component.icon && <component.icon className="w-5 h-5 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h5 className="font-semibold text-white group-hover:text-purple-300 transition-colors text-sm">
                            {component.name}
                          </h5>
                          <Badge variant="secondary" size="sm" className={getComplexityColor(component.complexity || 'basic')}>
                            {component.complexity || 'basic'}
                          </Badge>
                        </div>
                        <p className="text-xs text-secondary-300 mb-2">{component.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" size="sm" className={getCategoryColor(category)}>
                              {category}
                            </Badge>
                          </div>
                          <ArrowRight className="w-3 h-3 text-secondary-400 group-hover:text-purple-400 transition-colors" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {filteredComponents.length === 0 && (
            <div className="text-center py-6">
              <Search className="w-8 h-8 text-secondary-600 mx-auto mb-3" />
              <h4 className="text-base font-semibold text-white mb-1">No components found</h4>
              <p className="text-secondary-400 text-sm">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
        
        {/* Quick Actions */}
        <div className="pt-3 border-t border-[#23233a]/50">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs"
            >
              <GitBranch className="w-3 h-3 mr-1" />
              Templates
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs"
            >
              <Settings className="w-3 h-3 mr-1" />
              Import
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AutomationComponentLibrary;