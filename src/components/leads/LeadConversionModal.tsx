import React, { useState } from 'react';
import { X, ArrowRight, DollarSign, Users, Calendar, Target, FolderPlus, Building, User, Mail, Bot } from 'lucide-react';
import Badge from '../ui/Badge';
import GuruChatModal from '../ai/GuruChatModal';
import { useToastContext } from '../../contexts/ToastContext';

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  position?: string;
  phone?: string;
  source: string;
  score: number;
  deal_value_estimate?: number;
  industry?: string;
  company_size?: string;
  tags: string[];
}

interface LeadConversionModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  onConverted: (dealId: string) => void;
}

const LeadConversionModal: React.FC<LeadConversionModalProps> = ({ 
  isOpen, 
  onClose, 
  lead, 
  onConverted 
}) => {
  const { showToast } = useToastContext();
  const [formData, setFormData] = useState({
    dealTitle: `${lead.company} - ${lead.name}`,
    estimatedValue: lead.deal_value_estimate || 50000,
    pipeline: 'sales-pipeline',
    stage: 'qualified',
    owner: 'current-user',
    priority: 'medium' as 'low' | 'medium' | 'high',
    expectedCloseDate: '',
    description: `Converted from lead: ${lead.name} (${lead.email})\nSource: ${lead.source}\nLead Score: ${lead.score}`,
    createContact: true,
    createCompany: true,
    teamMembers: [] as string[]
  });

  const [isConverting, setIsConverting] = useState(false);
  const [showGuruChat, setShowGuruChat] = useState(false);

  const pipelines = [
    { id: 'sales-pipeline', name: 'Sales Pipeline' },
    { id: 'enterprise-pipeline', name: 'Enterprise Pipeline' },
    { id: 'partner-pipeline', name: 'Partner Pipeline' }
  ];

  const stages = [
    { id: 'lead', name: 'Lead In', probability: 10 },
    { id: 'qualified', name: 'Qualified', probability: 25 },
    { id: 'proposal', name: 'Proposal', probability: 50 },
    { id: 'negotiation', name: 'Negotiation', probability: 75 }
  ];

  const teamMembers = [
    'Janar Kuusk',
    'Sarah Wilson', 
    'Mike Chen',
    'Lisa Park',
    'David Brown'
  ];

  const generateDealId = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ST-${year}-${randomNum}`;
  };

  const createCloudFolder = async (paramDealId: string, dealTitle: string) => {
    const dealId = paramDealId;
    // Simulate cloud folder creation
    await new Promise(resolve => setTimeout(resolve, 1500));
    return `https://drive.google.com/drive/folders/${dealId.toLowerCase().replace('-', '')}`;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleTeamMember = (member: string) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.includes(member)
        ? prev.teamMembers.filter(m => m !== member)
        : [...prev.teamMembers, member]
    }));
  };

  const handleConvert = async () => {
    setIsConverting(true);
    
    try {
      const dealId = generateDealId();
      
      // Create cloud folder
      const driveUrl = await createCloudFolder(dealId, formData.dealTitle);
      
      // In real implementation, this would:
      // 1. Create contact record if createContact is true
      // 2. Create company record if createCompany is true
      // 3. Create deal record with all relationships
      // 4. Transfer any associated files/communications
      // 5. Update lead status to converted
      
      const dealData = {
        id: Date.now().toString(),
        deal_id: dealId,
        title: formData.dealTitle,
        description: formData.description,
        value: formData.estimatedValue,
        pipeline_id: formData.pipeline,
        stage_id: formData.stage,
        owner_id: formData.owner,
        priority: formData.priority,
        expected_close_date: formData.expectedCloseDate,
        team_members: formData.teamMembers,
        drive_url: driveUrl,
        created_at: new Date(),
        // Contact and company relationships
        contact_data: {
          name: lead.name,
          email: lead.email,
          position: lead.position,
          phone: lead.phone
        },
        company_data: {
          name: lead.company,
          industry: lead.industry,
          size: lead.company_size
        },
        lead_source: lead.source,
        lead_score: lead.score,
        converted_from_lead_id: lead.id
      };

      console.log('Creating deal from lead:', dealData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onConverted(dealId);
      
      showToast({
        title: 'Lead Converted',
        description: `${lead.name} has been converted to deal ${dealId}`,
        type: 'success'
      });
      
      onClose();
    } catch (error) {
      console.error('Conversion failed:', error);
      showToast({
        title: 'Conversion Failed',
        description: 'There was an error converting the lead to a deal',
        type: 'error'
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleAskGuru = () => {
    setShowGuruChat(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-700">
          <div>
            <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
              <ArrowRight className="w-5 h-5 text-primary-600" />
              <span>Convert Lead to Deal</span>
            </h3>
            <p className="text-secondary-400 text-sm mt-1">
              Transform this qualified lead into an active sales opportunity
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleAskGuru}
              className="btn-secondary flex items-center space-x-2"
            >
              <Bot className="w-4 h-4" />
              <span>Ask Guru</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Lead Summary */}
          <div className="p-4 bg-secondary-700 rounded-lg">
            <h4 className="font-medium text-white mb-3 flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Lead Information</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {lead.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-white">{lead.name}</div>
                  <div className="text-sm text-secondary-400">{lead.position}</div>
                  <div className="text-xs text-secondary-500 flex items-center space-x-1">
                    <Mail className="w-3 h-3" />
                    <span>{lead.email}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Building className="w-8 h-8 text-secondary-400" />
                <div>
                  <div className="font-medium text-white">{lead.company}</div>
                  <div className="text-sm text-secondary-400">{lead.industry}</div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="primary" size="sm">Score: {lead.score}</Badge>
                    <Badge variant="secondary" size="sm">{lead.source}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Guru Insights */}
          <div className="bg-gradient-to-r from-primary-600/10 to-purple-600/10 border border-primary-600/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Bot className="w-5 h-5 text-primary-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-white">Guru Conversion Insights</h4>
                <p className="text-secondary-300 text-sm mt-1">
                  Based on this lead's score of {lead.score} and engagement history, I recommend:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-secondary-300">
                  <li>Start in the <strong className="text-primary-300">Qualified</strong> stage</li>
                  <li>Set <strong className="text-primary-300">Medium</strong> priority based on deal value</li>
                  <li>Schedule a discovery call within 3 days</li>
                  <li>Include {lead.score > 70 ? 'technical specialist' : 'account manager'} in the team</li>
                </ul>
                <button 
                  onClick={handleAskGuru}
                  className="mt-2 text-sm text-primary-400 hover:text-primary-300"
                >
                  Ask for more detailed analysis
                </button>
              </div>
            </div>
          </div>

          {/* Deal Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                Deal Title *
              </label>
              <input
                type="text"
                required
                value={formData.dealTitle}
                onChange={(e) => handleInputChange('dealTitle', e.target.value)}
                className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                Estimated Value *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type="number"
                  required
                  value={formData.estimatedValue}
                  onChange={(e) => handleInputChange('estimatedValue', parseInt(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                Pipeline
              </label>
              <select
                value={formData.pipeline}
                onChange={(e) => handleInputChange('pipeline', e.target.value)}
                className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
              >
                {pipelines.map((pipeline) => (
                  <option key={pipeline.id} value={pipeline.id}>
                    {pipeline.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                Initial Stage
              </label>
              <select
                value={formData.stage}
                onChange={(e) => handleInputChange('stage', e.target.value)}
                className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
              >
                {stages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name} ({stage.probability}% probability)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                Deal Owner
              </label>
              <select
                value={formData.owner}
                onChange={(e) => handleInputChange('owner', e.target.value)}
                className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
              >
                <option value="current-user">Janar Kuusk (You)</option>
                <option value="sarah-wilson">Sarah Wilson</option>
                <option value="mike-chen">Mike Chen</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Expected Close Date */}
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Expected Close Date
            </label>
            <div className="relative max-w-md">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                type="date"
                value={formData.expectedCloseDate}
                onChange={(e) => handleInputChange('expectedCloseDate', e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
          </div>

          {/* Team Members */}
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Team Members
            </label>
            <div className="flex flex-wrap gap-2">
              {teamMembers.map((member) => (
                <button
                  key={member}
                  type="button"
                  onClick={() => toggleTeamMember(member)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.teamMembers.includes(member)
                      ? 'bg-primary-600 text-white'
                      : 'bg-secondary-700 text-secondary-300 hover:bg-secondary-600'
                  }`}
                >
                  {member}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Deal Description
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>

          {/* Relationship Creation Options */}
          <div className="p-4 bg-secondary-700 rounded-lg">
            <h4 className="font-medium text-white mb-3">Create Related Records</h4>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.createContact}
                  onChange={(e) => handleInputChange('createContact', e.target.checked)}
                  className="rounded border-secondary-600 bg-secondary-700 text-primary-600 focus:ring-primary-600"
                />
                <span className="text-secondary-300">
                  Create contact record for {lead.name}
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.createCompany}
                  onChange={(e) => handleInputChange('createCompany', e.target.checked)}
                  className="rounded border-secondary-600 bg-secondary-700 text-primary-600 focus:ring-primary-600"
                />
                <span className="text-secondary-300">
                  Create company record for {lead.company}
                </span>
              </label>
            </div>
          </div>

          {/* Cloud Folder Info */}
          <div className="p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
            <div className="flex items-start space-x-3">
              <FolderPlus className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-200">Automatic Cloud Folder</h4>
                <p className="text-blue-300/80 text-sm mt-1">
                  A dedicated Google Drive folder will be created for this deal with the format: 
                  "Deal {generateDealId()} – {formData.dealTitle}"
                </p>
                {isConverting && (
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-blue-300">Creating cloud folder...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-secondary-700">
          <div className="text-sm text-secondary-400">
            Deal ID will be auto-generated (e.g., ST-2025-001)
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="btn-secondary"
              disabled={isConverting}
            >
              Cancel
            </button>
            <button
              onClick={handleConvert}
              className="btn-primary flex items-center space-x-2"
              disabled={isConverting}
            >
              {isConverting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Converting...</span>
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  <span>Convert to Deal</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Guru Chat Modal */}
      <GuruChatModal
        isOpen={showGuruChat}
        onClose={() => setShowGuruChat(false)}
        initialPrompt={`Analyze lead conversion for ${lead.name} from ${lead.company} with score ${lead.score}`}
        contextType="lead"
        contextId={lead.id}
      />
    </div>
  );
};

export default LeadConversionModal;