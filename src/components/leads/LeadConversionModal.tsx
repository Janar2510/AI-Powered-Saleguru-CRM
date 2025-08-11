import React, { useState, useEffect } from 'react';
import { X, ArrowRight, DollarSign, Users, Calendar, Target, FolderPlus, Building, User, Mail, Bot, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import Badge from '../ui/Badge';
import GuruChatModal from '../ai/GuruChatModal';
import { useToastContext } from '../../contexts/ToastContext';
import { supabase } from '../../services/supabase';

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
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load pipelines and stages
  useEffect(() => {
    const loadPipelinesAndStages = async () => {
      try {
        // Load pipelines
        const { data: pipelineData, error: pipelineError } = await supabase
          .from('pipelines')
          .select('*')
          .order('name');

        if (pipelineError) throw pipelineError;

        // Load stages for the first pipeline
        const { data: stageData, error: stageError } = await supabase
          .from('pipeline_stages')
          .select('*')
          .eq('pipeline_id', pipelineData?.[0]?.id || '')
          .order('position');

        if (stageError) throw stageError;

        setPipelines(pipelineData || []);
        setStages(stageData || []);
      } catch (error) {
        console.error('Error loading pipelines and stages:', error);
        // Fallback to default data
        setPipelines([
          { id: 'sales-pipeline', name: 'Sales Pipeline' },
          { id: 'enterprise-pipeline', name: 'Enterprise Pipeline' },
          { id: 'partner-pipeline', name: 'Partner Pipeline' }
        ]);
        setStages([
          { id: 'lead', name: 'Lead In', probability: 10 },
          { id: 'qualified', name: 'Qualified', probability: 25 },
          { id: 'proposal', name: 'Proposal', probability: 50 },
          { id: 'negotiation', name: 'Negotiation', probability: 75 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadPipelinesAndStages();
    }
  }, [isOpen]);

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
      
      // Step 1: Create or update company record
      let companyId = null;
      if (formData.createCompany) {
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .insert({
            name: lead.company,
            domain: lead.email?.split('@')[1] || null,
            metadata: {
              industry: lead.industry,
              size: lead.company_size,
              source: lead.source
            }
          })
          .select()
          .single();

        if (companyError) throw companyError;
        companyId = companyData.id;
      }

      // Step 2: Create or update contact record
      let contactId = null;
      if (formData.createContact) {
        const [firstName, ...lastNameParts] = lead.name.split(' ');
        const lastName = lastNameParts.join(' ') || '';
        
        const { data: contactData, error: contactError } = await supabase
          .from('contacts')
          .insert({
            first_name: firstName,
            last_name: lastName,
            email: lead.email,
            phone: lead.phone,
            title: lead.position,
            company_id: companyId,
            metadata: {
              source: lead.source,
              lead_score: lead.score,
              converted_from_lead_id: lead.id
            }
          })
          .select()
          .single();

        if (contactError) throw contactError;
        contactId = contactData.id;
      }

      // Step 3: Create deal record
      const { data: dealData, error: dealError } = await supabase
        .from('deals')
        .insert({
          title: formData.dealTitle,
          contact_id: contactId,
          company_id: companyId,
          pipeline_id: formData.pipeline,
          stage_id: formData.stage,
          value: formData.estimatedValue,
          currency: 'EUR',
          status: 'open',
          expected_close_date: formData.expectedCloseDate || null,
          metadata: {
            priority: formData.priority,
            team_members: formData.teamMembers,
            drive_url: driveUrl,
            description: formData.description,
            lead_source: lead.source,
            lead_score: lead.score,
            converted_from_lead_id: lead.id
          }
        })
        .select()
        .single();

      if (dealError) throw dealError;

      // Step 4: Update lead status to converted
      const { error: leadUpdateError } = await supabase
        .from('leads')
        .update({ 
          status: 'converted',
          metadata: {
            converted_to_deal_id: dealData.id,
            converted_at: new Date().toISOString(),
            conversion_notes: formData.description
          }
        })
        .eq('id', lead.id);

      if (leadUpdateError) throw leadUpdateError;

      onConverted(dealData.id);
      
      showToast({
        title: 'Lead Converted Successfully',
        description: `${lead.name} has been converted to deal ${dealId}. Contact and company records have been created.`,
        type: 'success'
      });
      
      onClose();
    } catch (error) {
      console.error('Conversion failed:', error);
      showToast({
        title: 'Conversion Failed',
        description: 'There was an error converting the lead to a deal. Please try again.',
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
              <ArrowRight className="w-5 h-5 text-[#a259ff]" />
              <span>Convert Lead to Deal</span>
            </h3>
            <p className="text-[#b0b0d0] text-sm mt-1">
              Transform this qualified lead into an active sales opportunity following Odoo-inspired workflow
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleAskGuru}
              className="bg-white/5 backdrop-blur-xl border border-white/10 px-3 py-2 rounded-lg text-white hover:bg-white/10 transition-all flex items-center space-x-2"
            >
              <Bot className="w-4 h-4" />
              <span>Ask Guru</span>
            </button>
            <button
              onClick={onClose}
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-2 rounded-lg text-[#b0b0d0] hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Lead Information */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4">
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
              <User className="w-5 h-5 text-[#a259ff]" />
              <span>Lead Information</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Name</label>
                <div className="text-white">{lead.name}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Email</label>
                <div className="text-white">{lead.email}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Company</label>
                <div className="text-white">{lead.company}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Lead Score</label>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-bold">{lead.score}</span>
                  <Badge variant={lead.score >= 80 ? 'success' : lead.score >= 60 ? 'warning' : 'secondary'}>
                    {lead.score >= 80 ? 'Hot' : lead.score >= 60 ? 'Warm' : 'Cold'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Conversion Options */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4">
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-[#a259ff]" />
              <span>Conversion Options</span>
            </h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="createContact"
                  checked={formData.createContact}
                  onChange={(e) => handleInputChange('createContact', e.target.checked)}
                  className="rounded border-white/20 bg-white/5 text-[#a259ff] focus:ring-[#a259ff]"
                />
                <label htmlFor="createContact" className="text-white">
                  Create Contact Record
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="createCompany"
                  checked={formData.createCompany}
                  onChange={(e) => handleInputChange('createCompany', e.target.checked)}
                  className="rounded border-white/20 bg-white/5 text-[#a259ff] focus:ring-[#a259ff]"
                />
                <label htmlFor="createCompany" className="text-white">
                  Create Company Record
                </label>
              </div>
            </div>
          </div>

          {/* Deal Information */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4">
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-[#a259ff]" />
              <span>Deal Information</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Deal Title</label>
                <input
                  type="text"
                  value={formData.dealTitle}
                  onChange={(e) => handleInputChange('dealTitle', e.target.value)}
                  className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Estimated Value</label>
                <input
                  type="number"
                  value={formData.estimatedValue}
                  onChange={(e) => handleInputChange('estimatedValue', parseFloat(e.target.value))}
                  className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Pipeline</label>
                <select
                  value={formData.pipeline}
                  onChange={(e) => handleInputChange('pipeline', e.target.value)}
                  className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                >
                  {pipelines.map((pipeline) => (
                    <option key={pipeline.id} value={pipeline.id}>
                      {pipeline.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Stage</label>
                <select
                  value={formData.stage}
                  onChange={(e) => handleInputChange('stage', e.target.value)}
                  className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                >
                  {stages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name} ({stage.probability}%)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Expected Close Date</label>
                <input
                  type="date"
                  value={formData.expectedCloseDate}
                  onChange={(e) => handleInputChange('expectedCloseDate', e.target.value)}
                  className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                />
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4">
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
              <Users className="w-5 h-5 text-[#a259ff]" />
              <span>Team Members</span>
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {teamMembers.map((member) => (
                <div key={member} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={member}
                    checked={formData.teamMembers.includes(member)}
                    onChange={() => toggleTeamMember(member)}
                    className="rounded border-white/20 bg-white/5 text-[#a259ff] focus:ring-[#a259ff]"
                  />
                  <label htmlFor={member} className="text-white text-sm">
                    {member}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4">
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-[#a259ff]" />
              <span>Description</span>
            </h4>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
              placeholder="Describe the deal opportunity..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/10">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span className="text-[#b0b0d0] text-sm">
              This will create a new deal and optionally create contact/company records
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConvert}
              disabled={isConverting}
              className="bg-gradient-to-r from-[#a259ff] to-[#377dff] px-4 py-2 rounded-lg text-white hover:from-[#8b4dff] hover:to-[#2d6bff] transition-all flex items-center space-x-2 disabled:opacity-50"
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
      {showGuruChat && (
        <GuruChatModal
          isOpen={showGuruChat}
          onClose={() => setShowGuruChat(false)}
          initialPrompt={`I'm converting a lead named ${lead.name} from ${lead.company} to a deal. The lead has a score of ${lead.score} and came from ${lead.source}. Help me with the conversion process.`}
          contextType="deal"
          contextId={lead.id}
        />
      )}
    </div>
  );
};

export default LeadConversionModal;