import React, { useState, useEffect } from 'react';
import {
  FileText as Template,
  Plus,
  Search,
  Edit,
  Eye,
  Star,
  Mail,
  TrendingUp,
  Users,
  List,
  Grid
} from 'lucide-react';
import Container from '../components/layout/Container';
import {
  BrandPageLayout,
  BrandCard,
  BrandButton,
  BrandBadge,
  BrandInput
} from '../contexts/BrandDesignContext';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
  tags: string[];
  usage: number;
  lastUsed?: string;
  isStarred: boolean;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  variables: string[];
}

const EmailTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock templates data
  const mockTemplates: EmailTemplate[] = [
    {
      id: '1',
      name: 'Follow-up After Meeting',
      subject: 'Thank you for our meeting - {{meeting_topic}}',
      content: 'Hi {{contact_name}},\n\nThank you for taking the time to meet with me today...',
      category: 'follow-up',
      tags: ['meeting', 'follow-up', 'professional'],
      usage: 156,
      lastUsed: '2024-01-19',
      isStarred: true,
      isPublic: true,
      createdBy: 'John Doe',
      createdAt: '2024-01-01',
      variables: ['contact_name', 'meeting_topic', 'next_steps']
    },
    {
      id: '2',
      name: 'Sales Proposal',
      subject: 'Proposal for {{company_name}} - {{solution_name}}',
      content: 'Dear {{contact_name}},\n\nI hope this email finds you well...',
      category: 'sales',
      tags: ['proposal', 'sales', 'business'],
      usage: 89,
      lastUsed: '2024-01-18',
      isStarred: false,
      isPublic: true,
      createdBy: 'Sarah Johnson',
      createdAt: '2023-12-15',
      variables: ['contact_name', 'company_name', 'solution_name']
    },
    {
      id: '3',
      name: 'Demo Invitation',
      subject: 'Let\'s schedule a demo of {{product_name}}',
      content: 'Hi {{contact_name}},\n\nI\'d love to show you how {{product_name}} can transform...',
      category: 'demo',
      tags: ['demo', 'product', 'meeting'],
      usage: 234,
      lastUsed: '2024-01-20',
      isStarred: true,
      isPublic: true,
      createdBy: 'Mike Wilson',
      createdAt: '2023-11-20',
      variables: ['contact_name', 'product_name', 'demo_time']
    }
  ];

  useEffect(() => {
    setTemplates(mockTemplates);
  }, []);

  const filteredTemplates = templates.filter(template => {
    if (searchTerm && !template.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !template.subject.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (selectedCategory !== 'all' && template.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  const categories = [
    { id: 'all', name: 'All Templates', count: templates.length },
    { id: 'sales', name: 'Sales', count: templates.filter(t => t.category === 'sales').length },
    { id: 'follow-up', name: 'Follow-up', count: templates.filter(t => t.category === 'follow-up').length },
    { id: 'demo', name: 'Demo', count: templates.filter(t => t.category === 'demo').length },
    { id: 'support', name: 'Support', count: templates.filter(t => t.category === 'support').length }
  ];

  const TemplateCard = ({ template }: { template: EmailTemplate }) => (
    <BrandCard className="p-6" borderGradient="primary">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-white">{template.name}</h3>
              {template.isStarred && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
            </div>
            <p className="text-white/70 text-sm mb-2">Subject: {template.subject}</p>
            <div className="flex items-center space-x-3 text-xs text-white/60">
              <span>Used {template.usage} times</span>
              {template.lastUsed && <span>Last used: {new Date(template.lastUsed).toLocaleDateString()}</span>}
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-4">
          <p className="text-white/80 text-sm line-clamp-3">
            {template.content.substring(0, 150)}...
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <BrandBadge variant="blue" size="sm">{template.category}</BrandBadge>
            {template.isPublic && <BrandBadge variant="info" size="sm">Public</BrandBadge>}
            </div>
          
          <div className="flex flex-wrap gap-1">
            {template.tags.slice(0, 3).map((tag) => (
              <BrandBadge key={tag} variant="secondary" size="sm">{tag}</BrandBadge>
            ))}
            {template.tags.length > 3 && (
              <BrandBadge variant="secondary" size="sm">+{template.tags.length - 3} more</BrandBadge>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <BrandButton variant="purple" size="sm">
            <Eye className="w-3 h-3 mr-1" />
            Preview
          </BrandButton>
          <BrandButton variant="blue" size="sm">
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </BrandButton>
          <BrandButton variant="green" size="sm">
            <Mail className="w-3 h-3 mr-1" />
            Use
          </BrandButton>
        </div>
      </div>
    </BrandCard>
  );

  return (
    <Container>
      <BrandPageLayout
        title="Email Templates"
        subtitle="Create, manage, and organize your email templates"
        logoGradient={true}
        actions={
          <div className="flex items-center space-x-4">
            <BrandButton variant="secondary" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
              {viewMode === 'grid' ? <List className="w-4 h-4 mr-2" /> : <Grid className="w-4 h-4 mr-2" />}
              {viewMode === 'grid' ? 'List View' : 'Grid View'}
            </BrandButton>
            <BrandButton variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </BrandButton>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <BrandCard className="p-6" borderGradient="blue">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-blue-500/20">
                  <Template className="w-6 h-6 text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-white/80">Total Templates</p>
                  <p className="text-2xl font-bold text-white">{templates.length}</p>
                </div>
              </div>
            </BrandCard>

            <BrandCard className="p-6" borderGradient="green">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-green-500/20">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-white/80">Most Used</p>
                  <p className="text-2xl font-bold text-white">
                    {Math.max(...templates.map(t => t.usage), 0)}
                  </p>
                </div>
              </div>
            </BrandCard>

            <BrandCard className="p-6" borderGradient="yellow">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-yellow-500/20">
                  <Star className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-white/80">Starred</p>
                  <p className="text-2xl font-bold text-white">
                    {templates.filter(t => t.isStarred).length}
                  </p>
                </div>
              </div>
            </BrandCard>

            <BrandCard className="p-6" borderGradient="purple">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-purple-500/20">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-white/80">Public</p>
                  <p className="text-2xl font-bold text-white">
                    {templates.filter(t => t.isPublic).length}
                  </p>
                </div>
              </div>
            </BrandCard>
              </div>

          {/* Categories */}
          <BrandCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedCategory === category.id
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-white/20 hover:border-white/40 bg-white/5'
                  }`}
                >
                  <div className="text-center">
                    <p className={`font-medium ${
                      selectedCategory === category.id ? 'text-purple-400' : 'text-white'
                    }`}>
                      {category.name}
                    </p>
                    <p className="text-white/60 text-sm">{category.count}</p>
                  </div>
                </button>
              ))}
                  </div>
          </BrandCard>

          {/* Search */}
          <BrandCard className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                  <BrandInput
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12"
                  />
                </div>
              </div>
            </div>
          </BrandCard>

          {/* Templates Grid */}
          {filteredTemplates.length === 0 ? (
            <BrandCard className="p-12">
              <div className="text-center">
                <Template className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No templates found</h3>
                <p className="text-white/70 mb-6">
                  {searchTerm || selectedCategory !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Create your first email template to get started'
                  }
                </p>
                <BrandButton variant="primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </BrandButton>
              </div>
            </BrandCard>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
            }>
              {filteredTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          )}
        </div>
      </BrandPageLayout>
    </Container>
  );
};

export default EmailTemplates;