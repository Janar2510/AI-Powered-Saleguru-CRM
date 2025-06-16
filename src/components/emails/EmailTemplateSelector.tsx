import React, { useState, useEffect } from 'react';
import { Search, Check, Star, Bot } from 'lucide-react';
import Badge from '../ui/Badge';
import { useToastContext } from '../../contexts/ToastContext';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  tags: string[];
  usageCount: number;
  isShared: boolean;
}

interface EmailTemplateSelectorProps {
  onSelectTemplate: (template: EmailTemplate) => void;
  onClose: () => void;
}

const EmailTemplateSelector: React.FC<EmailTemplateSelectorProps> = ({
  onSelectTemplate,
  onClose
}) => {
  const { showToast } = useToastContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch templates from Supabase or use mock data
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        // Try to fetch from Supabase
        if (supabase) {
          const { data, error } = await supabase
            .from('email_templates')
            .select('*')
            .order('name');
          
          if (error) throw error;
          
          if (data && data.length > 0) {
            setTemplates(data.map(template => ({
              ...template,
              tags: template.tags || [],
              usageCount: template.usage_count || 0,
              isShared: template.is_shared || false
            })));
            setLoading(false);
            return;
          }
        }
        
        // Fall back to mock data if no templates in Supabase
        setTimeout(() => {
          setTemplates(mockTemplates);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching email templates:', error);
        // Fall back to mock data
        setTimeout(() => {
          setTemplates(mockTemplates);
          setLoading(false);
        }, 500);
      }
    };
    
    fetchTemplates();
  }, []);

  // Mock templates - in a real app, these would be fetched from an API
  const mockTemplates: EmailTemplate[] = [
    {
      id: '1',
      name: 'Welcome New Lead',
      subject: 'Welcome to SaleToru - Let\'s Get Started!',
      body: `<p>Hi {{contact_name}},</p>
             <p>Thank you for your interest in SaleToru! We're excited to help you streamline your sales process.</p>
             <p>I'd love to schedule a quick 15-minute call to understand your needs better and show you how SaleToru can help your team close more deals.</p>
             <p>Best regards,<br>{{user_name}}</p>`,
      category: 'onboarding',
      tags: ['welcome', 'new-lead', 'intro'],
      usageCount: 24,
      isShared: true
    },
    {
      id: '2',
      name: 'Follow-up After Demo',
      subject: 'Thanks for the demo - Next steps',
      body: `<p>Hi {{contact_name}},</p>
             <p>Thank you for taking the time to see our demo yesterday. I hope you found it valuable and can see how {{product_name}} would benefit {{company_name}}.</p>
             <p>As discussed, here are the next steps:</p>
             <ol>
               <li>{{next_step_1}}</li>
               <li>{{next_step_2}}</li>
             </ol>
             <p>I'll follow up with you early next week to answer any questions.</p>
             <p>Best,<br>{{user_name}}</p>`,
      category: 'follow-up',
      tags: ['demo', 'follow-up', 'next-steps'],
      usageCount: 18,
      isShared: true
    },
    {
      id: '3',
      name: 'Proposal Sent',
      subject: 'Your SaleToru Proposal - {{deal_name}}',
      body: `<p>Hi {{contact_name}},</p>
             <p>I've attached your customized proposal for {{deal_name}}. This includes everything we discussed:</p>
             <ul>
               <li>{{feature_1}}</li>
               <li>{{feature_2}}</li>
               <li>{{feature_3}}</li>
             </ul>
             <p>The proposal is valid for 30 days. I'm confident this solution will help {{company_name}} achieve {{goal}}.</p>
             <p>Let's schedule a call to discuss any questions you might have.</p>
             <p>Best regards,<br>{{user_name}}</p>`,
      category: 'closing',
      tags: ['proposal', 'pricing', 'features'],
      usageCount: 5,
      isShared: false
    }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { key: 'all', label: 'All Templates' },
    { key: 'onboarding', label: 'Onboarding' },
    { key: 'follow-up', label: 'Follow-up' },
    { key: 'closing', label: 'Closing' }
  ];

  const handleSelectTemplate = (template: EmailTemplate) => {
    onSelectTemplate(template);
    showToast({
      title: 'Template Applied',
      description: `"${template.name}" template has been applied`,
      type: 'success'
    });
    onClose();
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-white">Select Email Template</h3>
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-primary-400" />
          <span className="text-sm text-primary-400">AI-powered templates</span>
        </div>
      </div>
      
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
        <input
          type="text"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
        />
      </div>
      
      {/* Categories */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.key}
            onClick={() => setSelectedCategory(category.key)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap text-sm ${
              selectedCategory === category.key
                ? 'bg-primary-600 text-white'
                : 'bg-secondary-700 text-secondary-300 hover:bg-secondary-600'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>
      
      {/* Templates List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary-400">Loading templates...</p>
        </div>
      ) : filteredTemplates.length > 0 ? (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="p-3 bg-secondary-700 hover:bg-secondary-600 rounded-lg transition-colors cursor-pointer"
              onClick={() => handleSelectTemplate(template)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-white">{template.name}</h4>
                    {template.isShared && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                  </div>
                  <p className="text-sm text-secondary-400 mt-1">{template.subject}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {template.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" size="sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <button className="p-1 rounded-full bg-primary-600 text-white">
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-secondary-400">No matching templates found</p>
        </div>
      )}
    </div>
  );
};

export default EmailTemplateSelector;