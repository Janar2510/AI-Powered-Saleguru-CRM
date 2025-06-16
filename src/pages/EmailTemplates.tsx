import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Copy, ThumbsUp, ThumbsDown, Bot, FileText, Tag, Star, Users, TrendingUp } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  tags: string[];
  isShared: boolean;
  createdBy: string;
  createdAt: Date;
  usageCount: number;
  rating?: 'up' | 'down';
  category: 'onboarding' | 'follow-up' | 'closing' | 'custom';
  variables: string[];
}

const EmailTemplates: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);

  const templates: EmailTemplate[] = [
    {
      id: '1',
      name: 'Welcome New Lead',
      subject: 'Welcome to SaleToru - Let\'s Get Started!',
      body: 'Hi {{contact_name}},\n\nThank you for your interest in SaleToru! We\'re excited to help you streamline your sales process.\n\nI\'d love to schedule a quick 15-minute call to understand your needs better and show you how SaleToru can help your team close more deals.\n\nBest regards,\n{{user_name}}',
      tags: ['welcome', 'new-lead', 'intro'],
      isShared: true,
      createdBy: 'Admin',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      usageCount: 24,
      rating: 'up',
      category: 'onboarding',
      variables: ['contact_name', 'user_name']
    },
    {
      id: '2',
      name: 'Follow-up After Demo',
      subject: 'Thanks for the demo - Next steps',
      body: 'Hi {{contact_name}},\n\nThank you for taking the time to see our demo yesterday. I hope you found it valuable and can see how {{product_name}} would benefit {{company_name}}.\n\nAs discussed, here are the next steps:\n1. {{next_step_1}}\n2. {{next_step_2}}\n\nI\'ll follow up with you early next week to answer any questions.\n\nBest,\n{{user_name}}',
      tags: ['demo', 'follow-up', 'next-steps'],
      isShared: true,
      createdBy: 'Janar Kuusk',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      usageCount: 18,
      category: 'follow-up',
      variables: ['contact_name', 'product_name', 'company_name', 'next_step_1', 'next_step_2', 'user_name']
    },
    {
      id: '3',
      name: 'Proposal Sent',
      subject: 'Your SaleToru Proposal - {{deal_name}}',
      body: 'Hi {{contact_name}},\n\nI\'ve attached your customized proposal for {{deal_name}}. This includes everything we discussed:\n\n• {{feature_1}}\n• {{feature_2}}\n• {{feature_3}}\n\nThe proposal is valid for 30 days. I\'m confident this solution will help {{company_name}} achieve {{goal}}.\n\nLet\'s schedule a call to discuss any questions you might have.\n\nBest regards,\n{{user_name}}',
      tags: ['proposal', 'pricing', 'features'],
      isShared: false,
      createdBy: 'Janar Kuusk',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      usageCount: 5,
      category: 'closing',
      variables: ['contact_name', 'deal_name', 'feature_1', 'feature_2', 'feature_3', 'company_name', 'goal', 'user_name']
    },
    {
      id: '4',
      name: 'Contract Signed - Thank You',
      subject: 'Welcome to the SaleToru family! 🎉',
      body: 'Hi {{contact_name}},\n\nCongratulations! We\'re thrilled to welcome {{company_name}} to the SaleToru family.\n\nYour implementation specialist {{specialist_name}} will reach out within 24 hours to begin your onboarding process.\n\nIn the meantime, here are some helpful resources:\n• Getting Started Guide: {{guide_link}}\n• Video Tutorials: {{video_link}}\n• Support Portal: {{support_link}}\n\nThank you for choosing SaleToru. We\'re excited to help you grow your business!\n\nBest,\n{{user_name}}',
      tags: ['welcome', 'onboarding', 'success'],
      isShared: true,
      createdBy: 'Admin',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      usageCount: 12,
      rating: 'up',
      category: 'onboarding',
      variables: ['contact_name', 'company_name', 'specialist_name', 'guide_link', 'video_link', 'support_link', 'user_name']
    }
  ];

  const categories = [
    { key: 'all', label: 'All Templates', count: templates.length },
    { key: 'onboarding', label: 'Onboarding', count: templates.filter(t => t.category === 'onboarding').length },
    { key: 'follow-up', label: 'Follow-up', count: templates.filter(t => t.category === 'follow-up').length },
    { key: 'closing', label: 'Closing', count: templates.filter(t => t.category === 'closing').length },
    { key: 'custom', label: 'Custom', count: templates.filter(t => t.category === 'custom').length }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleRating = (templateId: string, rating: 'up' | 'down') => {
    console.log(`Rated template ${templateId} as ${rating}`);
  };

  const handleDuplicate = (template: EmailTemplate) => {
    const duplicatedTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      createdBy: 'Janar Kuusk',
      createdAt: new Date(),
      usageCount: 0,
      isShared: false
    };
    console.log('Template duplicated:', duplicatedTemplate);
  };

  const TemplateCard = ({ template }: { template: EmailTemplate }) => (
    <Card hover className="bg-white/10 backdrop-blur-md cursor-pointer group">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-white">{template.name}</h3>
              {template.isShared && <Badge variant="success" size="sm">Shared</Badge>}
              {template.rating === 'up' && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
            </div>
            <p className="text-sm text-secondary-400 mb-2 font-medium">{template.subject}</p>
            <p className="text-sm text-secondary-500 line-clamp-3">{template.body.substring(0, 150)}...</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {template.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" size="sm">
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4 text-secondary-400">
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-4 h-4" />
              <span>{template.usageCount} uses</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{template.createdBy}</span>
            </div>
          </div>
          <Badge variant="secondary" size="sm">
            {template.category}
          </Badge>
        </div>

        <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRating(template.id, 'up');
              }}
              className={`p-1 rounded transition-colors ${
                template.rating === 'up' ? 'text-green-500' : 'text-secondary-400 hover:text-green-500'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRating(template.id, 'down');
              }}
              className={`p-1 rounded transition-colors ${
                template.rating === 'down' ? 'text-red-500' : 'text-secondary-400 hover:text-red-500'
              }`}
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDuplicate(template);
              }}
              className="p-1 text-secondary-400 hover:text-white transition-colors"
              title="Duplicate"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingTemplate(template);
                setShowCreateModal(true);
              }}
              className="p-1 text-secondary-400 hover:text-white transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="p-1 text-secondary-400 hover:text-red-400 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );

  const CreateTemplateModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-secondary-700">
          <h3 className="text-xl font-semibold text-white">
            {editingTemplate ? 'Edit Template' : 'Create New Template'}
          </h3>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors">
              <Bot className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setShowCreateModal(false);
                setEditingTemplate(null);
              }}
              className="p-2 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">Template Name</label>
              <input
                type="text"
                placeholder="Enter template name..."
                defaultValue={editingTemplate?.name}
                className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">Category</label>
              <select
                defaultValue={editingTemplate?.category}
                className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
              >
                <option value="onboarding">Onboarding</option>
                <option value="follow-up">Follow-up</option>
                <option value="closing">Closing</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">Subject Line</label>
            <input
              type="text"
              placeholder="Email subject..."
              defaultValue={editingTemplate?.subject}
              className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">Tags</label>
            <input
              type="text"
              placeholder="Enter tags separated by commas..."
              defaultValue={editingTemplate?.tags.join(', ')}
              className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">Email Body</label>
            <textarea
              rows={12}
              placeholder="Type your email template..."
              defaultValue={editingTemplate?.body}
              className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>

          <div className="p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
            <h4 className="font-medium text-blue-200 mb-2 flex items-center space-x-2">
              <Tag className="w-4 h-4" />
              <span>Available Variables</span>
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-blue-300">
              {['{{contact_name}}', '{{company_name}}', '{{user_name}}', '{{deal_name}}', 
                '{{product_name}}', '{{next_step_1}}', '{{next_step_2}}', '{{specialist_name}}'
              ].map((variable, index) => (
                <button
                  key={index}
                  className="text-left hover:text-blue-200 transition-colors"
                  onClick={() => navigator.clipboard.writeText(variable)}
                >
                  {variable}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                defaultChecked={editingTemplate?.isShared}
                className="rounded border-secondary-600 bg-secondary-700 text-primary-600 focus:ring-primary-600"
              />
              <span className="text-secondary-300">Share with team</span>
            </label>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-6 border-t border-secondary-700">
          <button className="btn-secondary flex items-center space-x-2">
            <Bot className="w-4 h-4" />
            <span>AI Enhance</span>
          </button>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setShowCreateModal(false);
                setEditingTemplate(null);
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button className="btn-primary">
              {editingTemplate ? 'Update Template' : 'Create Template'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full px-5 py-5 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Email Templates</h1>
          <p className="text-secondary-400 mt-1">Create and manage reusable email templates</p>
        </div>
        <div className="flex space-x-2">
          <button className="btn-secondary flex items-center space-x-2">
            <Bot className="w-4 h-4" />
            <span>Ask Guru</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Template</span>
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex space-x-2 overflow-x-auto">
        {categories.map((category) => (
          <button
            key={category.key}
            onClick={() => setSelectedCategory(category.key)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              selectedCategory === category.key
                ? 'bg-primary-600 text-white'
                : 'bg-secondary-700 text-secondary-300 hover:bg-secondary-600'
            }`}
          >
            {category.label} ({category.count})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
        </div>
      </div>

      {/* AI Suggestions */}
      <Card className="bg-gradient-to-r from-primary-600/10 to-purple-600/10 border border-primary-600/20">
        <div className="flex items-center space-x-3 mb-4">
          <Bot className="w-6 h-6 text-primary-600" />
          <h3 className="text-lg font-semibold text-white">AI Template Suggestions</h3>
          <Badge variant="success" size="sm">Smart</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Cold Outreach Template',
              description: 'Based on your recent lead activity, create a template for initial contact.',
              confidence: '92%'
            },
            {
              title: 'Demo Follow-up Enhancement',
              description: 'Improve your existing demo follow-up template with proven phrases.',
              confidence: '87%'
            },
            {
              title: 'Pricing Discussion Template',
              description: 'Create a template for discussing pricing with qualified leads.',
              confidence: '94%'
            }
          ].map((suggestion, index) => (
            <div key={index} className="p-4 bg-secondary-700/50 rounded-lg">
              <h4 className="font-medium text-white mb-2">{suggestion.title}</h4>
              <p className="text-sm text-secondary-400 mb-3">{suggestion.description}</p>
              <div className="flex items-center justify-between">
                <Badge variant="success" size="sm">{suggestion.confidence} match</Badge>
                <button className="btn-primary text-sm px-3 py-1">Create</button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTemplates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card className="bg-white/10 backdrop-blur-md text-center py-12">
          <FileText className="w-16 h-16 text-secondary-600 mx-auto mb-4" />
          <p className="text-secondary-400 text-lg">No templates found</p>
          <p className="text-secondary-500 text-sm mt-2">
            {searchTerm ? 'Try adjusting your search criteria' : 'Create your first template to get started'}
          </p>
          {!searchTerm && (
            <div className="mt-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                Create First Template
              </button>
            </div>
          )}
        </Card>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && <CreateTemplateModal />}
    </div>
  );
};

export default EmailTemplates;