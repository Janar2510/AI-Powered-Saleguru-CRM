import React, { useState } from 'react';
import { Search, Zap, Target, CheckSquare, Mail, Users, Star, Bot, Bell, DollarSign, Calendar, MessageSquare, Edit, Play } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { AutomationRuleTemplate } from '../../types/automation';
import { useToastContext } from '../../contexts/ToastContext';

interface AutomationRuleTemplatesProps {
  onUseTemplate: (template: AutomationRuleTemplate) => void;
}

const AutomationRuleTemplates: React.FC<AutomationRuleTemplatesProps> = ({ onUseTemplate }) => {
  const { showToast } = useToastContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Define template categories
  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'deals', name: 'Deal Automation' },
    { id: 'tasks', name: 'Task Management' },
    { id: 'contacts', name: 'Contact Engagement' },
    { id: 'notifications', name: 'Notifications' }
  ];
  
  // Define templates
  const templates: AutomationRuleTemplate[] = [
    {
      id: 'deal_won_notification',
      name: 'Deal Won Notification',
      description: 'Send notification and create follow-up task when a deal is marked as won',
      category: 'deals',
      popularity: 'high',
      trigger: {
        id: 'deal_stage_changed',
        name: 'Deal Stage Changed',
        description: 'Triggered when a deal moves to a different stage',
        category: 'trigger',
        icon: Target,
        type: 'deal_stage_changed',
        config: {
          fromStage: 'any',
          toStage: 'closed-won'
        }
      },
      conditions: [],
      actions: [
        {
          id: 'send_notification',
          name: 'Send Notification',
          description: 'Send an in-app notification',
          category: 'action',
          icon: Bell,
          type: 'send_notification',
          config: {
            message: '🎉 Deal {{deal.title}} with {{deal.company}} has been won! Value: ${{deal.value}}',
            recipientType: 'user',
            recipientId: 'current_user'
          }
        },
        {
          id: 'create_task',
          name: 'Create Task',
          description: 'Create a new task and assign it',
          category: 'action',
          icon: CheckSquare,
          type: 'create_task',
          config: {
            title: 'Send thank you email to {{deal.contact}}',
            description: 'Follow up with a thank you email after winning the deal',
            dueDate: 'in_1_day',
            priority: 'high',
            assignTo: 'current_user'
          }
        }
      ]
    },
    {
      id: 'task_overdue_reminder',
      name: 'Task Overdue Reminder',
      description: 'Send notification when a task becomes overdue',
      category: 'tasks',
      popularity: 'high',
      trigger: {
        id: 'task_deadline_missed',
        name: 'Task Deadline Missed',
        description: 'Triggered when a task becomes overdue',
        category: 'trigger',
        icon: CheckSquare,
        type: 'task_deadline_missed',
        config: {}
      },
      conditions: [],
      actions: [
        {
          id: 'send_notification',
          name: 'Send Notification',
          description: 'Send an in-app notification',
          category: 'action',
          icon: Bell,
          type: 'send_notification',
          config: {
            message: '⚠️ Task "{{task.title}}" is now overdue! Due date was {{task.due_date}}',
            recipientType: 'user',
            recipientId: 'task.assigned_to'
          }
        },
        {
          id: 'send_email',
          name: 'Send Email',
          description: 'Send an email using a template',
          category: 'action',
          icon: Mail,
          type: 'send_email',
          config: {
            templateId: 'task_overdue_reminder',
            to: '{{user.email}}',
            subject: 'Task Overdue: {{task.title}}'
          }
        }
      ]
    },
    {
      id: 'new_contact_welcome',
      name: 'New Contact Welcome',
      description: 'Send welcome email when a new contact is created',
      category: 'contacts',
      popularity: 'medium',
      trigger: {
        id: 'contact_created',
        name: 'New Contact Created',
        description: 'Triggered when a new contact is added',
        category: 'trigger',
        icon: Users,
        type: 'contact_created',
        config: {}
      },
      conditions: [],
      actions: [
        {
          id: 'send_email',
          name: 'Send Email',
          description: 'Send an email using a template',
          category: 'action',
          icon: Mail,
          type: 'send_email',
          config: {
            templateId: 'welcome_email',
            to: '{{contact.email}}',
            subject: 'Welcome to {{company.name}}!'
          }
        },
        {
          id: 'create_task',
          name: 'Create Task',
          description: 'Create a new task and assign it',
          category: 'action',
          icon: CheckSquare,
          type: 'create_task',
          config: {
            title: 'Follow up with {{contact.name}}',
            description: 'Initial outreach to new contact',
            dueDate: 'in_3_days',
            priority: 'medium',
            assignTo: 'current_user'
          }
        }
      ]
    },
    {
      id: 'high_value_deal_alert',
      name: 'High Value Deal Alert',
      description: 'Notify team when a high-value deal is created',
      category: 'deals',
      popularity: 'medium',
      trigger: {
        id: 'deal_created',
        name: 'New Deal Created',
        description: 'Triggered when a new deal is created',
        category: 'trigger',
        icon: Target,
        type: 'deal_created',
        config: {}
      },
      conditions: [
        {
          id: 'deal_value',
          name: 'Deal Value',
          description: 'Check if deal value meets criteria',
          category: 'condition',
          icon: DollarSign,
          type: 'deal_value',
          config: {
            operator: 'greater_than',
            value: 50000
          }
        }
      ],
      actions: [
        {
          id: 'send_notification',
          name: 'Send Notification',
          description: 'Send an in-app notification',
          category: 'action',
          icon: Bell,
          type: 'send_notification',
          config: {
            message: '💰 High value deal created: {{deal.title}} worth ${{deal.value}}',
            recipientType: 'team',
            recipientId: 'sales_team'
          }
        },
        {
          id: 'create_calendar_event',
          name: 'Create Calendar Event',
          description: 'Schedule a calendar event',
          category: 'action',
          icon: Calendar,
          type: 'create_calendar_event',
          config: {
            title: 'Review high-value deal: {{deal.title}}',
            description: 'Team review of new high-value opportunity',
            startDate: 'tomorrow',
            duration: 30,
            attendees: ['sales_manager', 'current_user']
          }
        }
      ]
    },
    {
      id: 'email_click_follow_up',
      name: 'Email Click Follow-Up',
      description: 'Create follow-up task when a recipient clicks a link in an email',
      category: 'contacts',
      popularity: 'low',
      trigger: {
        id: 'email_clicked',
        name: 'Email Link Clicked',
        description: 'Triggered when a recipient clicks a link in an email',
        category: 'trigger',
        icon: Mail,
        type: 'email_clicked',
        config: {}
      },
      conditions: [],
      actions: [
        {
          id: 'create_task',
          name: 'Create Task',
          description: 'Create a new task and assign it',
          category: 'action',
          icon: CheckSquare,
          type: 'create_task',
          config: {
            title: 'Follow up with {{contact.name}} (clicked email link)',
            description: 'Contact showed interest by clicking link in email',
            dueDate: 'in_1_day',
            priority: 'high',
            assignTo: 'email.sender'
          }
        },
        {
          id: 'update_record',
          name: 'Update Record',
          description: 'Update fields on a record',
          category: 'action',
          icon: Edit,
          type: 'update_record',
          config: {
            recordType: 'contact',
            fields: {
              'engagement_score': '{{contact.engagement_score + 10}}',
              'last_engaged': 'now()'
            }
          }
        }
      ]
    },
    {
      id: 'task_completion_notification',
      name: 'Task Completion Notification',
      description: 'Notify deal owner when a task related to their deal is completed',
      category: 'tasks',
      popularity: 'low',
      trigger: {
        id: 'task_completed',
        name: 'Task Completed',
        description: 'Triggered when a task is marked as complete',
        category: 'trigger',
        icon: CheckSquare,
        type: 'task_completed',
        config: {}
      },
      conditions: [
        {
          id: 'task_has_deal',
          name: 'Task Has Related Deal',
          description: 'Check if task is related to a deal',
          category: 'condition',
          icon: Target,
          type: 'task_has_deal',
          config: {}
        }
      ],
      actions: [
        {
          id: 'send_notification',
          name: 'Send Notification',
          description: 'Send an in-app notification',
          category: 'action',
          icon: Bell,
          type: 'send_notification',
          config: {
            message: '✅ Task "{{task.title}}" related to deal "{{deal.title}}" has been completed',
            recipientType: 'user',
            recipientId: 'deal.owner'
          }
        },
        {
          id: 'add_note',
          name: 'Add Note',
          description: 'Add a note to a record',
          category: 'action',
          icon: MessageSquare,
          type: 'add_note',
          config: {
            recordType: 'deal',
            noteText: 'Task "{{task.title}}" was completed by {{task.completed_by}} on {{task.completed_at}}'
          }
        }
      ]
    }
  ];
  
  // Filter templates based on search and category
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeCategory === 'all' || template.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = (template: AutomationRuleTemplate) => {
    onUseTemplate(template);
    showToast({
      type: 'success',
      title: 'Template Selected',
      message: `"${template.name}" template has been loaded for editing`
    });
  };

  const handleGenerateCustomRules = () => {
    showToast({
      type: 'info',
      title: 'AI Automation',
      message: 'Generating custom automation rules...'
    });
    
    // In a real implementation, this would call an AI service to generate custom rules
    setTimeout(() => {
      showToast({
        type: 'success',
        title: 'Rules Generated',
        message: '3 custom automation rules have been created based on your data'
      });
    }, 2000);
  };
  
  return (
    <div className="space-y-6">
      {/* AI Suggestion Banner */}
      <Card className="bg-gradient-to-r from-primary-600/10 to-purple-600/10 border border-primary-600/20">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-primary-600/30 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-white">AI-Powered Automation</h3>
            <p className="text-secondary-300 text-sm mt-2">
              Let SaleToruGuru analyze your workflow and suggest custom automation rules tailored to your sales process.
            </p>
            <button 
              onClick={handleGenerateCustomRules}
              className="btn-primary text-sm mt-3 flex items-center space-x-2"
            >
              <Bot className="w-4 h-4" />
              <span>Generate Custom Rules</span>
            </button>
          </div>
        </div>
      </Card>
      
      {/* Search and Filters */}
      <div className="flex items-center justify-between">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
        </div>
        
        <div className="flex space-x-2 overflow-x-auto">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeCategory === category.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-secondary-700 text-secondary-300 hover:bg-secondary-600'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Templates Grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => (
            <Card 
              key={template.id} 
              className="bg-white/10 backdrop-blur-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleUseTemplate(template)}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Zap className="w-5 h-5 text-primary-400" />
                    <h3 className="font-semibold text-white">{template.name}</h3>
                  </div>
                  {template.popularity === 'high' && (
                    <Badge variant="primary" size="sm" className="flex items-center space-x-1">
                      <Star className="w-3 h-3 fill-current" />
                      <span>Popular</span>
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-secondary-400">{template.description}</p>
                
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    {template.trigger.icon && <template.trigger.icon className="w-4 h-4 text-primary-400" />}
                    <span className="text-xs text-primary-400">When: {template.trigger.name}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Play className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-green-400">
                      {template.actions.length} action{template.actions.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-secondary-700">
                  <button className="btn-primary w-full text-sm">
                    Use This Template
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Zap className="w-16 h-16 text-secondary-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Templates Found</h3>
          <p className="text-secondary-400 mb-6">
            Try adjusting your search or category filters
          </p>
        </div>
      )}
    </div>
  );
};

export default AutomationRuleTemplates;