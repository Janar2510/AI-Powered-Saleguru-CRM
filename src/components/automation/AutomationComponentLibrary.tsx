import React, { useState } from 'react';
import { Search, Zap, Filter, DollarSign, Users, Calendar, CheckSquare, Mail, MessageSquare, Bell, Clock, Tag, Target, FileText, Edit, Play } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { AutomationComponent } from '../../types/automation';

interface AutomationComponentLibraryProps {
  onSelectComponent: (component: AutomationComponent) => void;
}

const AutomationComponentLibrary: React.FC<AutomationComponentLibraryProps> = ({ 
  onSelectComponent 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'trigger' | 'condition' | 'action'>('all');
  
  // Define all available components
  const components: AutomationComponent[] = [
    // Triggers
    {
      id: 'deal_stage_changed',
      name: 'Deal Stage Changed',
      description: 'Triggered when a deal moves to a different stage',
      category: 'trigger',
      icon: Target,
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
      config: {}
    },
    {
      id: 'contact_created',
      name: 'New Contact Created',
      description: 'Triggered when a new contact is added',
      category: 'trigger',
      icon: Users,
      config: {}
    },
    {
      id: 'task_deadline_missed',
      name: 'Task Deadline Missed',
      description: 'Triggered when a task becomes overdue',
      category: 'trigger',
      icon: CheckSquare,
      config: {}
    },
    {
      id: 'task_completed',
      name: 'Task Completed',
      description: 'Triggered when a task is marked as complete',
      category: 'trigger',
      icon: CheckSquare,
      config: {}
    },
    {
      id: 'form_submitted',
      name: 'Form Submission',
      description: 'Triggered when a form is submitted',
      category: 'trigger',
      icon: FileText,
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
      config: {}
    },
    {
      id: 'email_clicked',
      name: 'Email Link Clicked',
      description: 'Triggered when a recipient clicks a link in an email',
      category: 'trigger',
      icon: Mail,
      config: {}
    },
    
    // Conditions
    {
      id: 'deal_value',
      name: 'Deal Value',
      description: 'Check if deal value meets criteria',
      category: 'condition',
      icon: DollarSign,
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
      config: {
        field: '',
        operator: 'equals',
        value: ''
      }
    },
    
    // Actions
    {
      id: 'send_email',
      name: 'Send Email',
      description: 'Send an email using a template',
      category: 'action',
      icon: Mail,
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
      config: {
        title: '',
        description: '',
        startDate: 'tomorrow',
        duration: 30,
        attendees: []
      }
    }
  ];
  
  // Filter components based on search and category
  const filteredComponents = components.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeCategory === 'all' || component.category === activeCategory;
    
    return matchesSearch && matchesCategory;
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
  
  return (
    <Card className="bg-white/10 backdrop-blur-md h-full">
      <h3 className="text-lg font-semibold text-white mb-4">Component Library</h3>
      
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
        <input
          type="text"
          placeholder="Search components..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
        />
      </div>
      
      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            activeCategory === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-secondary-700 text-secondary-300 hover:bg-secondary-600'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveCategory('trigger')}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            activeCategory === 'trigger'
              ? 'bg-primary-600 text-white'
              : 'bg-secondary-700 text-secondary-300 hover:bg-secondary-600'
          }`}
        >
          Triggers
        </button>
        <button
          onClick={() => setActiveCategory('condition')}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            activeCategory === 'condition'
              ? 'bg-primary-600 text-white'
              : 'bg-secondary-700 text-secondary-300 hover:bg-secondary-600'
          }`}
        >
          Conditions
        </button>
        <button
          onClick={() => setActiveCategory('action')}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            activeCategory === 'action'
              ? 'bg-primary-600 text-white'
              : 'bg-secondary-700 text-secondary-300 hover:bg-secondary-600'
          }`}
        >
          Actions
        </button>
      </div>
      
      {/* Component List */}
      <div className="space-y-4 max-h-[calc(100vh-350px)] overflow-y-auto pr-2">
        {/* Triggers */}
        {groupedComponents.trigger && groupedComponents.trigger.length > 0 && (
          <div>
            <h4 className="font-medium text-white mb-2 flex items-center space-x-2">
              <Zap className="w-4 h-4 text-primary-400" />
              <span>Triggers</span>
            </h4>
            <div className="space-y-2">
              {groupedComponents.trigger.map(component => (
                <div
                  key={component.id}
                  className="bg-secondary-700 hover:bg-secondary-600 rounded-lg p-3 cursor-pointer transition-colors"
                  onClick={() => onSelectComponent(component)}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/json', JSON.stringify(component));
                  }}
                >
                  <div className="flex items-center space-x-3">
                    {component.icon && <component.icon className="w-5 h-5 text-primary-400" />}
                    <div>
                      <h5 className="font-medium text-white">{component.name}</h5>
                      <p className="text-xs text-secondary-400 mt-1">{component.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Conditions */}
        {groupedComponents.condition && groupedComponents.condition.length > 0 && (
          <div>
            <h4 className="font-medium text-white mb-2 flex items-center space-x-2">
              <Filter className="w-4 h-4 text-yellow-400" />
              <span>Conditions</span>
            </h4>
            <div className="space-y-2">
              {groupedComponents.condition.map(component => (
                <div
                  key={component.id}
                  className="bg-secondary-700 hover:bg-secondary-600 rounded-lg p-3 cursor-pointer transition-colors"
                  onClick={() => onSelectComponent(component)}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/json', JSON.stringify(component));
                  }}
                >
                  <div className="flex items-center space-x-3">
                    {component.icon && <component.icon className="w-5 h-5 text-yellow-400" />}
                    <div>
                      <h5 className="font-medium text-white">{component.name}</h5>
                      <p className="text-xs text-secondary-400 mt-1">{component.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Actions */}
        {groupedComponents.action && groupedComponents.action.length > 0 && (
          <div>
            <h4 className="font-medium text-white mb-2 flex items-center space-x-2">
              <Play className="w-4 h-4 text-green-400" />
              <span>Actions</span>
            </h4>
            <div className="space-y-2">
              {groupedComponents.action.map(component => (
                <div
                  key={component.id}
                  className="bg-secondary-700 hover:bg-secondary-600 rounded-lg p-3 cursor-pointer transition-colors"
                  onClick={() => onSelectComponent(component)}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/json', JSON.stringify(component));
                  }}
                >
                  <div className="flex items-center space-x-3">
                    {component.icon && <component.icon className="w-5 h-5 text-green-400" />}
                    <div>
                      <h5 className="font-medium text-white">{component.name}</h5>
                      <p className="text-xs text-secondary-400 mt-1">{component.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* No Results */}
        {Object.keys(groupedComponents).length === 0 && (
          <div className="text-center py-8">
            <Filter className="w-8 h-8 text-secondary-600 mx-auto mb-2" />
            <p className="text-secondary-400">No components found</p>
            <p className="text-secondary-500 text-sm mt-1">Try adjusting your search</p>
          </div>
        )}
      </div>
      
      {/* Help Text */}
      <div className="mt-4 p-3 bg-secondary-700/50 rounded-lg text-xs text-secondary-400">
        <p>Drag and drop components to build your automation flow, or click to add them directly.</p>
      </div>
    </Card>
  );
};

export default AutomationComponentLibrary;