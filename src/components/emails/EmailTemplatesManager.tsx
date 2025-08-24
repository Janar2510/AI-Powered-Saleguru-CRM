import React, { useState, useEffect } from 'react';
import { 
  Mail, Plus, Edit3, Trash2, Copy, Save, Eye, Search, Filter,
  FileText, MessageSquare, Users, Star, Clock, Settings, Bot
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { useToastContext } from '../../contexts/ToastContext';
import { supabase } from '../../services/supabase';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  is_active: boolean;
  created_at: string;
  created_by: string;
}

interface EmailTemplatesManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: EmailTemplate) => void;
}

const EmailTemplatesManager: React.FC<EmailTemplatesManagerProps> = ({
  isOpen,
  onClose,
  onSelectTemplate
}) => {
  const { showToast } = useToastContext();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    body: '',
    category: 'general'
  });

  const categories = [
    { id: 'all', label: 'All Templates', icon: FileText },
    { id: 'general', label: 'General', icon: Mail },
    { id: 'sales', label: 'Sales', icon: Users },
    { id: 'follow-up', label: 'Follow-up', icon: Clock },
    { id: 'proposal', label: 'Proposals', icon: Star },
    { id: 'support', label: 'Support', icon: MessageSquare }
  ];

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setTemplates(data);
      } else {
        // Fallback to sample templates
        setTemplates([
          {
            id: '1',
            name: 'Welcome Email',
            subject: 'Welcome to our platform!',
            body: 'Hi {{contact_name}},\n\nWelcome to our platform! We\'re excited to have you on board.\n\nBest regards,\n{{user_name}}',
            category: 'general',
            is_active: true,
            created_at: new Date().toISOString(),
            created_by: 'user'
          },
          {
            id: '2',
            name: 'Follow-up After Demo',
            subject: 'Thank you for the demo - Next steps',
            body: 'Hi {{contact_name}},\n\nThank you for taking the time to see our demo today. I hope you found it valuable.\n\nAs discussed, the next steps would be:\n1. Review the proposal\n2. Schedule a technical discussion\n3. Finalize the timeline\n\nPlease let me know if you have any questions.\n\nBest regards,\n{{user_name}}',
            category: 'follow-up',
            is_active: true,
            created_at: new Date().toISOString(),
            created_by: 'user'
          },
          {
            id: '3',
            name: 'Proposal Submission',
            subject: 'Proposal for {{deal_title}}',
            body: 'Hi {{contact_name}},\n\nI\'m pleased to submit our proposal for {{deal_title}}.\n\nThe proposal includes:\n- Detailed scope of work\n- Timeline and milestones\n- Investment details\n- Terms and conditions\n\nI\'m available to discuss any questions you might have.\n\nBest regards,\n{{user_name}}',
            category: 'proposal',
            is_active: true,
            created_at: new Date().toISOString(),
            created_by: 'user'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      showToast({
        title: 'Error',
        description: 'Failed to load email templates',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveTemplate = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: userOrg } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!userOrg) throw new Error('User organization not found');

      const templateData = {
        ...templateForm,
        org_id: userOrg.organization_id,
        created_by: user.id,
        is_active: true
      };

      let error;
      if (editingTemplate) {
        ({ error } = await supabase
          .from('email_templates')
          .update(templateData)
          .eq('id', editingTemplate.id));
      } else {
        ({ error } = await supabase
          .from('email_templates')
          .insert(templateData));
      }

      if (error) throw error;

      showToast({
        title: 'Success',
        description: `Template ${editingTemplate ? 'updated' : 'created'} successfully`,
        type: 'success'
      });

      setIsCreateModalOpen(false);
      setEditingTemplate(null);
      setTemplateForm({ name: '', subject: '', body: '', category: 'general' });
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      showToast({
        title: 'Error',
        description: 'Failed to save template',
        type: 'error'
      });
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .update({ is_active: false })
        .eq('id', templateId);

      if (error) throw error;

      showToast({
        title: 'Success',
        description: 'Template deleted successfully',
        type: 'success'
      });

      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      showToast({
        title: 'Error',
        description: 'Failed to delete template',
        type: 'error'
      });
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openCreateModal = () => {
    setEditingTemplate(null);
    setTemplateForm({ name: '', subject: '', body: '', category: 'general' });
    setIsCreateModalOpen(true);
  };

  const openEditModal = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      subject: template.subject,
      body: template.body,
      category: template.category
    });
    setIsCreateModalOpen(true);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Email Templates" size="xl">
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#b0b0d0]" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#23233a]/50 border border-[#23233a]/30 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff] transition-all duration-200"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-[#23233a]/50 border border-[#23233a]/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff] transition-all duration-200"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          <Button variant="gradient" icon={Plus} onClick={openCreateModal}>
            Create Template
          </Button>
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-[#a259ff] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50 hover:border-[#a259ff]/30 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-white">{template.name}</CardTitle>
                    <Badge variant="secondary" size="sm">
                      {template.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-[#b0b0d0] font-medium">{template.subject}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-[#b0b0d0] mb-4 line-clamp-3">
                    {template.body.substring(0, 120)}...
                  </p>
                  <div className="flex items-center justify-between">
                    <Button
                      variant="gradient"
                      size="sm"
                      onClick={() => {
                        onSelectTemplate(template);
                        onClose();
                      }}
                    >
                      Use Template
                    </Button>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Edit3}
                        onClick={() => openEditModal(template)}
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Copy}
                        onClick={() => {
                          navigator.clipboard.writeText(template.body);
                          showToast({
                            title: 'Copied',
                            description: 'Template copied to clipboard',
                            type: 'success'
                          });
                        }}
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Trash2}
                        onClick={() => deleteTemplate(template.id)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredTemplates.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-[#b0b0d0] mx-auto mb-4" />
            <p className="text-[#b0b0d0]">No templates found. Create your first template!</p>
          </div>
        )}
      </div>

      {/* Create/Edit Template Modal */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title={editingTemplate ? 'Edit Template' : 'Create Template'}
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Template Name</label>
              <input
                type="text"
                value={templateForm.name}
                onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                className="w-full px-3 py-2 bg-[#23233a]/50 border border-[#23233a]/30 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff] transition-all duration-200"
                placeholder="Enter template name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">Category</label>
              <select
                value={templateForm.category}
                onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                className="w-full px-3 py-2 bg-[#23233a]/50 border border-[#23233a]/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff] transition-all duration-200"
              >
                {categories.slice(1).map(category => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Subject</label>
              <input
                type="text"
                value={templateForm.subject}
                onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                className="w-full px-3 py-2 bg-[#23233a]/50 border border-[#23233a]/30 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff] transition-all duration-200"
                placeholder="Enter email subject"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Body</label>
              <textarea
                value={templateForm.body}
                onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })}
                rows={8}
                className="w-full px-3 py-2 bg-[#23233a]/50 border border-[#23233a]/30 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff] transition-all duration-200"
                placeholder="Enter email body... Use {{contact_name}}, {{deal_title}}, {{user_name}} for dynamic content"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="gradient" icon={Save} onClick={saveTemplate}>
                {editingTemplate ? 'Update Template' : 'Create Template'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </Modal>
  );
};

export default EmailTemplatesManager;
