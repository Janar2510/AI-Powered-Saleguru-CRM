import React, { useState } from 'react';
import { X, ArrowRight, Users, Target, Calendar, DollarSign, CheckCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { supabase } from '../../services/supabase';
import { useToastContext } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  title?: string;
  phone?: string;
  source: 'website' | 'linkedin' | 'referral' | 'cold-email' | 'demo-request' | 'import' | 'manual';
  lead_score: number;
  status: 'new' | 'contacted' | 'qualified' | 'disqualified' | 'converted' | 'archived';
  created_at: Date;
  last_contacted_at?: Date;
  converted_at?: Date;
  enriched_at?: Date;
  enrichment_status?: 'pending' | 'completed' | 'failed' | 'none';
  tags?: string[];
  notes?: string;
  deal_value_estimate?: number;
  industry?: string;
  company_size?: string;
  linkedin_url?: string;
  website?: string;
  ai_insight?: string;
  owner_id?: string;
}

interface BulkConversionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLeadIds: string[];
  leads: Lead[];
  onConverted: (dealIds: string[]) => void;
}

const BulkConversionModal: React.FC<BulkConversionModalProps> = ({
  isOpen,
  onClose,
  selectedLeadIds,
  leads,
  onConverted
}) => {
  const [conversionSettings, setConversionSettings] = useState({
    pipeline: 'sales-pipeline',
    stage: 2, // Use bigint ID for 'Qualified' stage
    owner: 'current-user',
    priority: 'medium' as 'low' | 'medium' | 'high',
    expectedCloseDate: '',
    createContacts: true,
    createCompanies: true,
    teamMembers: [] as string[]
  });

  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);

  const pipelines = [
    { id: 'sales-pipeline', name: 'Sales Pipeline' },
    { id: 'enterprise-pipeline', name: 'Enterprise Pipeline' },
    { id: 'partner-pipeline', name: 'Partner Pipeline' }
  ];

  const stages = [
    { id: 1, name: 'Lead In', probability: 10 },
    { id: 2, name: 'Qualified', probability: 25 },
    { id: 3, name: 'Proposal', probability: 50 },
    { id: 4, name: 'Negotiation', probability: 75 },
    { id: 5, name: 'Closed Won', probability: 100 },
    { id: 6, name: 'Closed Lost', probability: 0 }
  ];

  const teamMembers = [
    'Janar Kuusk',
    'Sarah Wilson',
    'Mike Chen',
    'Lisa Park',
    'David Brown'
  ];

  const totalValue = leads.reduce((sum, lead) => sum + (lead.deal_value_estimate || 50000), 0);
  const avgScore = Math.round(leads.reduce((sum, lead) => sum + lead.lead_score, 0) / leads.length);

  const { showToast } = useToastContext();
  const { user } = useAuth();

  const handleInputChange = (field: string, value: any) => {
    setConversionSettings(prev => ({ ...prev, [field]: value }));
  };

  const toggleTeamMember = (member: string) => {
    setConversionSettings(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.includes(member)
        ? prev.teamMembers.filter(m => m !== member)
        : [...prev.teamMembers, member]
    }));
  };

  const generateDealId = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ST-${year}-${randomNum}`;
  };

  const handleBulkConvert = async () => {
    setIsConverting(true);
    setConversionProgress(0);

    try {
      // Use the user from AuthContext instead of getting from Supabase
      if (!user) throw new Error('No authenticated user');

      // For development, use a default owner_id since we don't have a users table
      const ownerId = 1; // Default owner ID for demo

      const dealIds: string[] = [];
      const totalLeads = leads.length;

      for (let i = 0; i < leads.length; i++) {
        const lead = leads[i];

        // 1. Find or create company
        let companyId = null;
        if (lead.company) {
          const { data: company } = await supabase.from('companies').select('id').eq('name', lead.company).maybeSingle();
          if (company?.id) {
            companyId = company.id;
          } else {
            const { data: newCompany } = await supabase.from('companies').insert({ name: lead.company }).select().single();
            companyId = newCompany?.id;
          }
        }

        // 2. Find or create contact
        let contactId = null;
        if (lead.email) {
          const { data: contact } = await supabase.from('contacts').select('id').eq('email', lead.email).maybeSingle();
          if (contact?.id) {
            contactId = contact.id;
          } else {
            const { data: newContact } = await supabase.from('contacts').insert({
              first_name: lead.first_name,
              last_name: lead.last_name,
              email: lead.email,
              company_id: companyId
            }).select().single();
            contactId = newContact?.id;
          }
        }

        // 3. Get correct stage id (bigint) for selected pipeline/stage
        let stageId = null;
        const { data: stage } = await supabase.from('stages').select('id').eq('id', conversionSettings.stage).maybeSingle();
        if (stage?.id) stageId = stage.id;
        if (!stageId) throw new Error('Could not find stage');

        // 4. Insert deal
        const { data: deal, error } = await supabase.from('deals').insert({
          title: `${lead.company || ''} - ${lead.first_name || ''} ${lead.last_name || ''}`.trim(),
          description: `Converted from lead: ${lead.first_name || ''} ${lead.last_name || ''} (${lead.email || ''})\nSource: ${lead.source || ''}`,
          value: lead.deal_value_estimate || 50000,
          stage_id: stageId,
          probability: 10,
          expected_close_date: conversionSettings.expectedCloseDate || null,
          company_id: companyId,
          contact_id: contactId,
          lead_id: parseInt(lead.id) || null,
          owner_id: ownerId
        }).select().single();
        if (error) {
          showToast({ type: 'error', title: 'Deal Creation Failed', description: error.message });
          continue;
        }
        dealIds.push(deal.id);
        setConversionProgress(Math.round(((i + 1) / totalLeads) * 100));
      }
      onConverted(dealIds);
      showToast({ type: 'success', title: 'Bulk Conversion Complete', description: `${dealIds.length} deals added to deals` });
    } catch (err: any) {
      showToast({ type: 'error', title: 'Bulk Conversion Failed', description: err.message });
    } finally {
      setIsConverting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-700">
          <div>
            <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
              <Users className="w-5 h-5 text-primary-600" />
              <span>Bulk Convert Leads to Deals</span>
            </h3>
            <p className="text-secondary-400 text-sm mt-1">
              Convert {leads.length} selected leads into active sales opportunities
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors"
            disabled={isConverting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Conversion Progress */}
          {isConverting && (
            <div className="p-4 bg-primary-600/10 border border-primary-600/30 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-white font-medium">Converting leads to deals...</span>
                <Badge variant="primary" size="sm">{conversionProgress}%</Badge>
              </div>
              <div className="w-full bg-secondary-700 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${conversionProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-secondary-700 rounded-lg text-center">
              <div className="text-2xl font-bold text-white">{leads.length}</div>
              <div className="text-secondary-400 text-sm">Leads to Convert</div>
            </div>
            <div className="p-4 bg-secondary-700 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-500">${(totalValue / 1000).toFixed(0)}K</div>
              <div className="text-secondary-400 text-sm">Total Estimated Value</div>
            </div>
            <div className="p-4 bg-secondary-700 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-500">{avgScore}</div>
              <div className="text-secondary-400 text-sm">Average Lead Score</div>
            </div>
          </div>

          {/* Selected Leads Preview */}
          <div className="p-4 bg-secondary-700 rounded-lg">
            <h4 className="font-medium text-white mb-3">Selected Leads</h4>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {leads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-2 bg-secondary-600 rounded">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {`${lead.first_name?.[0] || ''}${lead.last_name?.[0] || ''}`}
                      </span>
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">{`${lead.first_name} ${lead.last_name}`}</div>
                      <div className="text-secondary-400 text-xs">{lead.company}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="primary" size="sm">Score: {lead.lead_score}</Badge>
                    <span className="text-green-500 text-sm font-medium">
                      ${((lead.deal_value_estimate || 50000) / 1000).toFixed(0)}K
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conversion Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                Target Pipeline
              </label>
              <select
                value={conversionSettings.pipeline}
                onChange={(e) => handleInputChange('pipeline', e.target.value)}
                disabled={isConverting}
                className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600 disabled:opacity-50"
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
                value={conversionSettings.stage}
                onChange={(e) => handleInputChange('stage', e.target.value)}
                disabled={isConverting}
                className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600 disabled:opacity-50"
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
                value={conversionSettings.owner}
                onChange={(e) => handleInputChange('owner', e.target.value)}
                disabled={isConverting}
                className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600 disabled:opacity-50"
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
                value={conversionSettings.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                disabled={isConverting}
                className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600 disabled:opacity-50"
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
              Expected Close Date (Applied to All)
            </label>
            <div className="relative max-w-md">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                type="date"
                value={conversionSettings.expectedCloseDate}
                onChange={(e) => handleInputChange('expectedCloseDate', e.target.value)}
                disabled={isConverting}
                className="w-full pl-10 pr-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Team Members */}
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Team Members (Applied to All Deals)
            </label>
            <div className="flex flex-wrap gap-2">
              {teamMembers.map((member) => (
                <button
                  key={member}
                  type="button"
                  onClick={() => toggleTeamMember(member)}
                  disabled={isConverting}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                    conversionSettings.teamMembers.includes(member)
                      ? 'bg-primary-600 text-white'
                      : 'bg-secondary-700 text-secondary-300 hover:bg-secondary-600'
                  }`}
                >
                  {member}
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-secondary-700 rounded-lg">
            <h4 className="font-medium text-white mb-3">Conversion Options</h4>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={conversionSettings.createContacts}
                  onChange={(e) => handleInputChange('createContacts', e.target.checked)}
                  disabled={isConverting}
                  className="rounded border-secondary-600 bg-secondary-700 text-primary-600 focus:ring-primary-600 disabled:opacity-50"
                />
                <span className="text-secondary-300">
                  Create contact records for all leads
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={conversionSettings.createCompanies}
                  onChange={(e) => handleInputChange('createCompanies', e.target.checked)}
                  disabled={isConverting}
                  className="rounded border-secondary-600 bg-secondary-700 text-primary-600 focus:ring-primary-600 disabled:opacity-50"
                />
                <span className="text-secondary-300">
                  Create company records for unique companies
                </span>
              </label>
            </div>
          </div>

          {/* Warning */}
          <div className="p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-200">Bulk Conversion Notice</h4>
                <p className="text-yellow-300/80 text-sm mt-1">
                  This action will convert {leads.length} leads into deals with the same settings.
                  Each deal will get a unique ID and cloud folder. This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-secondary-700">
          <div className="text-sm text-secondary-400">
            {leads.length} deals will be created with auto-generated IDs
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
              onClick={handleBulkConvert}
              className="btn-primary flex items-center space-x-2"
              disabled={isConverting}
            >
              {isConverting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Converting {conversionProgress}%...</span>
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  <span>Convert {leads.length} Leads</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkConversionModal;