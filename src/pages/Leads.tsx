import { useState, useEffect } from 'react';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../contexts/AuthContext';
import { useToastContext } from '../contexts/ToastContext';
import { supabase } from '../services/supabase';
import { useLeadEnrichment } from '../hooks/useLeadEnrichment';
import { 
  BrandBackground,
  BrandPageLayout,
  BrandStatsGrid,
  BrandStatCard,
  BrandCard,
  BrandButton,
  BrandInput,
  BrandBadge,
  BrandDropdown
} from '../contexts/BrandDesignContext';
import { 
  Plus, 
  Search, 
  UserPlus, 
  Target, 
  TrendingUp,
  Phone,
  Mail,
  Calendar,
  Edit,
  Trash2,
  CheckCircle,
  Star,
  Sparkles
} from 'lucide-react';

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  lead_score: number;
  priority: string;
  industry: string;
  company: string;
  job_title: string;
  website: string;
  linkedin: string;
  notes: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

interface CreateLeadData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  source: string;
  priority: string;
  industry: string;
  company: string;
  job_title: string;
  website: string;
  linkedin: string;
  notes: string;
}

const LEAD_STATUSES = [
  { value: 'New', label: 'New', color: 'bg-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
  { value: 'Contacted', label: 'Contacted', color: 'bg-yellow-500', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700' },
  { value: 'Qualified', label: 'Qualified', color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700' },
  { value: 'Disqualified', label: 'Disqualified', color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-700' },
  { value: 'Converted', label: 'Converted', color: 'bg-purple-500', bgColor: 'bg-purple-50', textColor: 'text-purple-700' }
];

const LEAD_SOURCES = [
  'Web Form', 'Cold Call', 'Referral', 'Expo', 'Social Media', 'Email Campaign', 'Website', 'Other'
];

const LEAD_PRIORITIES = [
  'Low',
  'Medium',
  'High',
  'Urgent'
];

const LEAD_INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Manufacturing',
  'Retail',
  'Education',
  'Real Estate',
  'Consulting',
  'Other'
];

export default function Leads() {
  const { user } = useAuth();
  const { showToast } = useToastContext();
  const { enrichLead, loading: enriching, error: enrichError, clearError } = useLeadEnrichment();
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'lead_score' | 'name'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [newLead, setNewLead] = useState<CreateLeadData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    source: '',
    priority: 'Medium',
    industry: '',
    company: '',
    job_title: '',
    website: '',
    linkedin: '',
    notes: ''
  });

  const [editLead, setEditLead] = useState<CreateLeadData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    source: '',
    priority: 'Medium',
    industry: '',
    company: '',
    job_title: '',
    website: '',
    linkedin: '',
    notes: ''
  });

  const [convertOptions, setConvertOptions] = useState({
    createDeal: false,
    dealTitle: '',
    dealValue: 0,
    dealStage: 'new'
  });

  // Load leads on component mount
  useEffect(() => {
    if (user) {
      loadLeads();
    }
  }, [user]);

  // Filter and sort leads when filters change
  useEffect(() => {
    console.log('🔄 Leads changed, filtering and sorting. Current leads:', leads);
    filterAndSortLeads();
  }, [leads, searchTerm, statusFilter, sourceFilter, sortBy, sortOrder]);

  const loadLeads = async () => {
    try {
      setIsLoading(true);
      const orgId = (user as any)?.org_id || 'temp-org';

      const { data: leadsData, error } = await supabase
          .from('leads')
          .select('*')
        .eq('org_id', orgId)
          .order('created_at', { ascending: false });
        
      if (error || !leadsData || leadsData.length === 0) {
        console.error('Error loading leads:', error);
        showToast({ title: 'Error loading leads', type: 'error' });
        
        // Add dummy data for testing
        console.log('🔄 Setting dummy data for testing...');
        const dummyLeads: Lead[] = [
          {
            id: '1',
            first_name: 'John',
            last_name: 'Smith',
            email: 'john.smith@techcorp.com',
            phone: '+1-555-0123',
            source: 'Web Form',
            status: 'Qualified',
            lead_score: 85,
            priority: 'High',
            industry: 'Technology',
            company: 'TechCorp Inc.',
            job_title: 'CTO',
            website: 'www.techcorp.com',
            linkedin: 'linkedin.com/in/johnsmith',
            notes: 'Interested in enterprise CRM solution. Budget: $50k-100k',
            created_at: '2024-08-01T10:00:00Z',
            updated_at: '2024-08-01T10:00:00Z'
          },
          {
            id: '2',
            first_name: 'Sarah',
            last_name: 'Johnson',
            email: 'sarah.j@healthcare.com',
            phone: '+1-555-0456',
            source: 'Referral',
            status: 'Contacted',
            lead_score: 72,
            priority: 'Medium',
            industry: 'Healthcare',
            company: 'Healthcare Solutions',
            job_title: 'Operations Manager',
            website: 'www.healthcare.com',
            linkedin: 'linkedin.com/in/sarahjohnson',
            notes: 'Looking for patient management system. Team of 50+ users.',
            created_at: '2024-07-28T14:30:00Z',
            updated_at: '2024-07-30T09:15:00Z'
          },
          {
            id: '3',
            first_name: 'Michael',
            last_name: 'Chen',
            email: 'mchen@financegroup.com',
            phone: '+1-555-0789',
            source: 'Cold Call',
            status: 'New',
            lead_score: 45,
            priority: 'Low',
            industry: 'Finance',
            company: 'Finance Group LLC',
            job_title: 'VP of Sales',
            website: 'www.financegroup.com',
            linkedin: 'linkedin.com/in/michaelchen',
            notes: 'Initial contact made. Follow up scheduled for next week.',
            created_at: '2024-08-05T16:45:00Z',
            updated_at: '2024-08-05T16:45:00Z'
          }
        ];
        console.log('🔄 Setting dummy leads:', dummyLeads);
        setLeads(dummyLeads);
      } else {
        console.log('🔄 Setting real leads:', leadsData);
        setLeads(leadsData || []);
      }
    } catch (error) {
      console.error('Error loading leads:', error);
      showToast({ title: 'Error loading leads', type: 'error' });
      } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortLeads = () => {
    console.log('🔄 Filtering and sorting leads. Input leads:', leads);
    let filtered = [...leads];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(lead => 
        `${lead.first_name} ${lead.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.source?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    // Apply source filter
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(lead => lead.source === sourceFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = `${a.first_name} ${a.last_name}`.toLowerCase();
          bValue = `${b.first_name} ${b.last_name}`.toLowerCase();
          break;
        case 'lead_score':
          aValue = a.lead_score || 0;
          bValue = b.lead_score || 0;
          break;
        case 'created_at':
      default:
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    console.log('🔄 Setting filtered leads:', filtered);
    setFilteredLeads(filtered);
  };

  const handleEnrichLead = async () => {
    clearError();
    
    // Prepare data for enrichment
    const leadInfo = {
      name: `${newLead.first_name} ${newLead.last_name}`.trim() || undefined,
      email: newLead.email || undefined,
      company: newLead.company || undefined,
      linkedinUrl: newLead.linkedin || undefined,
    };

    // Check if we have enough info to enrich
    if (!leadInfo.name && !leadInfo.email && !leadInfo.company && !leadInfo.linkedinUrl) {
      showToast({ 
        title: 'Please enter at least a name, email, company, or LinkedIn URL to enrich the lead', 
        type: 'error' 
      });
      return;
    }

    try {
      const enrichedData = await enrichLead(leadInfo);
      
      if (enrichedData) {
        // Update form with enriched data
        const [firstName, ...lastNameParts] = enrichedData.fullName.split(' ');
        const lastName = lastNameParts.join(' ');
        
        setNewLead(prev => ({
          ...prev,
          first_name: firstName || prev.first_name,
          last_name: lastName || prev.last_name,
          email: enrichedData.workEmail || prev.email,
          phone: enrichedData.phoneNumber || prev.phone,
          company: enrichedData.companyName || prev.company,
          job_title: enrichedData.jobTitle || prev.job_title,
          linkedin: enrichedData.linkedinUrl || prev.linkedin,
        }));

        showToast({ 
          title: 'Lead enriched successfully! Review and save the updated information.', 
          type: 'success' 
        });
      }
    } catch (error) {
      console.error('Enrichment error:', error);
      showToast({ 
        title: enrichError || 'Failed to enrich lead. Please try again.', 
        type: 'error' 
      });
    }
  };

  const createLead = async () => {
    try {
      const orgId = (user as any)?.org_id || 'temp-org';
      
      const { error } = await supabase
        .from('leads')
        .insert({
          ...newLead,
          org_id: orgId,
          status: 'New',
          lead_score: 0
        });

      if (error) {
        console.error('Error creating lead:', error);
        showToast({ title: 'Error creating lead', type: 'error' });
    } else {
        showToast({ title: 'Lead created successfully', type: 'success' });
        setShowCreateModal(false);
        setNewLead({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          source: '',
          priority: 'Medium',
          industry: '',
          company: '',
          job_title: '',
          website: '',
          linkedin: '',
          notes: ''
        });
        loadLeads();
      }
    } catch (error) {
      console.error('Error creating lead:', error);
      showToast({ title: 'Error creating lead', type: 'error' });
    }
  };

  const updateLead = async () => {
    if (!selectedLead) return;

    try {
      const { error } = await supabase
        .from('leads')
        .update(editLead)
        .eq('id', selectedLead.id);

      if (error) {
        console.error('Error updating lead:', error);
        showToast({ title: 'Error updating lead', type: 'error' });
      } else {
        showToast({ title: 'Lead updated successfully', type: 'success' });
        setShowEditModal(false);
        setSelectedLead(null);
        loadLeads();
      }
    } catch (error) {
      console.error('Error updating lead:', error);
      showToast({ title: 'Error updating lead', type: 'error' });
    }
  };

  const deleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) {
        console.error('Error deleting lead:', error);
        showToast({ title: 'Error deleting lead', type: 'error' });
      } else {
        showToast({ title: 'Lead deleted successfully', type: 'success' });
        loadLeads();
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
      showToast({ title: 'Error deleting lead', type: 'error' });
    }
  };

  const convertLead = async (lead: Lead, createDeal = false, dealData?: { title: string; value: number; stage: string }) => {
    try {
      // 1. Create a contact record from the lead
      const { data: newContact, error: contactError } = await supabase
        .from('contacts')
        .insert({
          first_name: lead.first_name,
          last_name: lead.last_name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          title: lead.job_title,
          source: lead.source,
          status: 'lead', // Initially as a lead, can be upgraded to customer later
          lead_score: lead.lead_score || 0,
          notes: lead.notes,
          tags: [lead.industry, lead.priority].filter(Boolean),
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (contactError) {
        console.error('Error creating contact:', contactError);
        showToast({ title: 'Error creating contact from lead', type: 'error' });
        return;
      }

      let newDeal = null;
      
      // 2. Optionally create a deal if requested
      if (createDeal && dealData && newContact) {
        const { data: createdDeal, error: dealError } = await supabase
          .from('deals')
          .insert({
            title: dealData.title,
            description: `Converted from lead: ${lead.first_name} ${lead.last_name}`,
            value: dealData.value,
            currency: 'EUR',
            probability: 25, // Initial probability for new deals
            stage_id: dealData.stage,
            contact_id: newContact.id,
            owner_id: user?.id,
            source: lead.source,
            tags: [lead.industry, 'converted-lead'].filter(Boolean),
            notes: `Original lead notes: ${lead.notes || 'No notes'}`,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (dealError) {
          console.error('Error creating deal:', dealError);
          showToast({ title: 'Contact created, but failed to create deal', type: 'error' });
        } else {
          newDeal = createdDeal;
        }
      }

      // 3. Update lead status to converted and link to contact
      const { error: leadError } = await supabase
        .from('leads')
        .update({ 
          status: 'Converted',
          notes: `${lead.notes || ''}\n\nConverted to contact ID: ${newContact.id}${newDeal ? ` and deal ID: ${newDeal.id}` : ''}`
        })
        .eq('id', lead.id);

      if (leadError) {
        console.error('Error updating lead status:', leadError);
        showToast({ title: 'Created contact/deal but failed to update lead status', type: 'error' });
      }

      // 4. Show success message and close modal
      const successMessage = createDeal && newDeal 
        ? 'Lead converted successfully! Created contact and deal.'
        : 'Lead converted successfully! Created contact.';
      
      showToast({ title: successMessage, type: 'success' });
      setShowConvertModal(false);
      setSelectedLead(null);
      loadLeads();

      // 5. Navigate to the created contact or deal
      if (newDeal) {
        // Navigate to deal page if deal was created
        setTimeout(() => {
          window.location.href = `/deals/${newDeal.id}`;
        }, 1500);
      } else if (newContact) {
        // Navigate to contact page if only contact was created
        setTimeout(() => {
          window.location.href = `/contacts/${newContact.id}`;
        }, 1500);
      }

    } catch (error) {
      console.error('Error converting lead:', error);
      showToast({ title: 'Error converting lead', type: 'error' });
    }
  };

  const openEditModal = (lead: Lead) => {
      setSelectedLead(lead);
    setEditLead({
      first_name: lead.first_name,
      last_name: lead.last_name,
      email: lead.email,
      phone: lead.phone || '',
      source: lead.source || '',
      priority: lead.priority || 'Medium',
      industry: lead.industry || '',
      company: lead.company || '',
      job_title: lead.job_title || '',
      website: lead.website || '',
      linkedin: lead.linkedin || '',
      notes: lead.notes || ''
    });
    setShowEditModal(true);
  };

  const openConvertModal = (lead: Lead) => {
    setSelectedLead(lead);
    // Reset conversion options and pre-fill deal title with lead name
    setConvertOptions({
      createDeal: false,
      dealTitle: `${lead.company ? `${lead.company} - ` : ''}${lead.first_name} ${lead.last_name}`,
      dealValue: 0,
      dealStage: 'new'
    });
    setShowConvertModal(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = LEAD_STATUSES.find(s => s.value === status);
    if (!statusConfig) return <BrandBadge variant="default">{status}</BrandBadge>;

    return (
      <BrandBadge 
        variant="default"
        className={`${statusConfig.bgColor} ${statusConfig.textColor} border-0`}
      >
        {statusConfig.label}
      </BrandBadge>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <BrandBackground>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a259ff] mx-auto"></div>
            <p className="mt-4 text-white/80">Loading leads...</p>
          </div>
        </div>
      </BrandBackground>
    );
  }

  return (
    <BrandBackground>
      <BrandPageLayout
        title="Leads Management"
        subtitle="Track and manage potential customers through your sales pipeline"
        actions={
          <div className="flex flex-wrap items-center gap-2 lg:gap-3">
            <BrandButton variant="green" onClick={() => setShowCreateModal(true)} animation="scaleIn" size="sm" className="text-xs lg:text-sm">
              <Plus className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
              Add New Lead
            </BrandButton>
            <BrandButton variant="blue" onClick={() => setShowBulkModal(true)} animation="slideUp" size="sm" className="text-xs lg:text-sm">
              <Target className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
              Bulk Actions
            </BrandButton>
            <BrandButton variant="purple" onClick={() => setShowImportModal(true)} animation="fadeIn" size="sm" className="text-xs lg:text-sm">
              <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
              Import/Export
            </BrandButton>
            <BrandButton variant="orange" onClick={() => setShowCreateModal(true)} animation="scaleIn" size="sm" className="text-xs lg:text-sm">
              <Star className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
              Lead Enrichment
            </BrandButton>
      </div>
        }
      >
        {/* Stats Cards */}
        <BrandStatsGrid>
          <BrandStatCard
            icon={<UserPlus className="w-6 h-6 text-white" />}
            title="Total Leads"
            value={leads.length}
            borderGradient="primary"
            animation="fadeIn"
          />
          <BrandStatCard
            icon={<Target className="w-6 h-6 text-white" />}
            title="Qualified"
            value={leads.filter(l => l.status === 'Qualified').length}
            borderGradient="green"
            animation="slideUp"
          />
          <BrandStatCard
            icon={<CheckCircle className="w-6 h-6 text-white" />}
            title="Converted"
            value={leads.filter(l => l.status === 'Converted').length}
            borderGradient="purple"
            animation="slideUp"
          />
          <BrandStatCard
            icon={<TrendingUp className="w-6 h-6 text-white" />}
            title="Avg Score"
            value={
              leads.length > 0 
                ? Math.round(leads.reduce((sum, l) => sum + (l.lead_score || 0), 0) / leads.length)
                : 0
            }
            borderGradient="orange"
            animation="fadeIn"
          />
        </BrandStatsGrid>

          {/* Filters and Search */}
        <BrandCard className="p-5 mx-5 mb-5">
          <div className="grid gap-4" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'}}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
              <BrandInput
                placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <BrandDropdown
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: 'All Statuses' },
                ...LEAD_STATUSES.map(status => ({ value: status.value, label: status.label }))
              ]}
            />

            <BrandDropdown
              value={sourceFilter}
              onChange={setSourceFilter}
              options={[
                { value: 'all', label: 'All Sources' },
                ...LEAD_SOURCES.map(source => ({ value: source, label: source }))
              ]}
            />

            <BrandDropdown
              value={`${sortBy}-${sortOrder}`}
              onChange={(value) => {
                const [field, order] = value.split('-');
                setSortBy(field as any);
                setSortOrder(order as any);
              }}
              options={[
                { value: 'created_at-desc', label: 'Newest First' },
                { value: 'created_at-asc', label: 'Oldest First' },
                { value: 'lead_score-desc', label: 'Score High to Low' },
                { value: 'lead_score-asc', label: 'Score Low to High' },
                { value: 'name-asc', label: 'Name A-Z' },
                { value: 'name-desc', label: 'Name Z-A' }
              ]}
            />
                </div>
        </BrandCard>

          {/* Leads Table */}
        <BrandCard className="overflow-hidden mx-5 mb-5">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Lead</th>
                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Contact</th>
                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Source</th>
                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Status</th>
                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Score</th>
                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Created</th>
                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
              <tbody className="divide-y divide-white/5">
                    {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-3 lg:px-6 py-2 lg:py-4 whitespace-nowrap">
                            <div>
                        <div className="text-sm font-medium text-white">
                          {lead.first_name} {lead.last_name}
                              </div>
                        {lead.notes && (
                          <div className="text-sm text-white/60 truncate max-w-xs">
                            {lead.notes}
                          </div>
                                )}
                              </div>
                    </td>
                    <td className="px-3 lg:px-6 py-2 lg:py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-white">
                          <Mail className="w-4 h-4 mr-2 text-white/50" />
                          {lead.email}
                            </div>
                        {lead.phone && (
                          <div className="flex items-center text-sm text-white/60">
                            <Phone className="w-4 h-4 mr-2 text-white/50" />
                            {lead.phone}
                          </div>
                        )}
                          </div>
                        </td>
                    <td className="px-3 lg:px-6 py-2 lg:py-4 whitespace-nowrap">
                      <BrandBadge variant="default">{lead.source || '—'}</BrandBadge>
                        </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(lead.status)}
                    </td>
                    <td className="px-3 lg:px-6 py-2 lg:py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className={`w-4 h-4 mr-1 ${getScoreColor(lead.lead_score || 0)}`} />
                        <span className={`font-medium ${getScoreColor(lead.lead_score || 0)}`}>
                          {lead.lead_score || 0}
                        </span>
                          </div>
                        </td>
                    <td className="px-3 lg:px-6 py-2 lg:py-4 whitespace-nowrap text-sm text-white/60">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-white/50" />
                        {new Date(lead.created_at).toLocaleDateString()}
                          </div>
                        </td>
                    <td className="px-3 lg:px-6 py-2 lg:py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <BrandButton
                          size="sm"
                          variant="blue"
                          onClick={() => {
                            setSelectedLead(lead);
                            setShowViewModal(true);
                          }}
                        >
                          <UserPlus className="w-4 h-4" />
                        </BrandButton>
                        
                        <BrandButton
                          size="sm"
                          variant="secondary"
                          onClick={() => openEditModal(lead)}
                        >
                          <Edit className="w-4 h-4" />
                        </BrandButton>
                        
                        {lead.status !== 'Converted' && (
                          <BrandButton
                            size="sm"
                            variant="green"
                            onClick={() => openConvertModal(lead)}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </BrandButton>
                        )}
                        
                        <BrandButton
                          size="sm"
                          variant="red"
                          onClick={() => deleteLead(lead.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </BrandButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            
            {filteredLeads.length === 0 && (
              <div className="text-center py-12">
                <UserPlus className="w-12 h-12 text-white/40 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No leads found</h3>
                <p className="text-white/60 mb-4">
                  {searchTerm || statusFilter !== 'all' || sourceFilter !== 'all'
                    ? 'Try adjusting your filters or search terms.'
                    : 'Get started by creating your first lead.'
                  }
                </p>
                {!searchTerm && statusFilter === 'all' && sourceFilter === 'all' && (
                  <BrandButton onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Lead
                  </BrandButton>
                )}
              </div>
            )}
          </div>
        </BrandCard>

              {/* Create Lead Modal */}
        <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} size="3xl">
          <div className="p-8 max-w-4xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Add New Lead</h2>
              <BrandButton 
                variant="purple" 
                size="sm"
                onClick={handleEnrichLead}
                disabled={enriching}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {enriching ? 'Enriching...' : 'AI Enrich'}
              </BrandButton>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">First Name</label>
                  <BrandInput
                    value={newLead.first_name}
                    onChange={(e) => setNewLead({...newLead, first_name: e.target.value})}
                    placeholder="First Name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Last Name</label>
                  <BrandInput
                    value={newLead.last_name}
                    onChange={(e) => setNewLead({...newLead, last_name: e.target.value})}
                    placeholder="Last Name"
                    required
                  />
        </div>
      </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Email</label>
                <BrandInput
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                  placeholder="Email"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Phone</label>
                <BrandInput
                  value={newLead.phone}
                  onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                  placeholder="Phone"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Source</label>
                  <BrandDropdown
                    value={newLead.source}
                    onChange={(value) => setNewLead({...newLead, source: value})}
                    options={[
                      { value: '', label: 'Select Source' },
                      ...LEAD_SOURCES.map(source => ({ value: source, label: source }))
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Priority</label>
                  <BrandDropdown
                    value={newLead.priority}
                    onChange={(value) => setNewLead({...newLead, priority: value})}
                    options={LEAD_PRIORITIES.map(priority => ({ value: priority, label: priority }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Industry</label>
                  <BrandDropdown
                    value={newLead.industry}
                    onChange={(value) => setNewLead({...newLead, industry: value})}
                    options={[
                      { value: '', label: 'Select Industry' },
                      ...LEAD_INDUSTRIES.map(industry => ({ value: industry, label: industry }))
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Company</label>
                  <BrandInput
                    value={newLead.company}
                    onChange={(e) => setNewLead({...newLead, company: e.target.value})}
                    placeholder="Company Name"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Job Title</label>
                  <BrandInput
                    value={newLead.job_title}
                    onChange={(e) => setNewLead({...newLead, job_title: e.target.value})}
                    placeholder="Job Title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Website</label>
                  <BrandInput
                    value={newLead.website}
                    onChange={(e) => setNewLead({...newLead, website: e.target.value})}
                    placeholder="Website URL"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">LinkedIn</label>
                <BrandInput
                  value={newLead.linkedin}
                  onChange={(e) => setNewLead({...newLead, linkedin: e.target.value})}
                  placeholder="LinkedIn Profile URL"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Notes</label>
                <textarea
                  value={newLead.notes}
                  onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
                  placeholder="Additional notes..."
                  rows={3}
                  className="w-full px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <BrandButton variant="secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </BrandButton>
              <BrandButton onClick={createLead}>
                Create Lead
              </BrandButton>
            </div>
          </div>
        </Modal>

        {/* Edit Lead Modal */}
        <Modal open={showEditModal} onClose={() => setShowEditModal(false)} size="3xl">
          <div className="p-8 max-w-4xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Edit Lead</h2>
              <BrandButton 
                variant="purple" 
                size="sm"
                onClick={() => {
                  const leadInfo = {
                    name: `${editLead.first_name} ${editLead.last_name}`.trim() || undefined,
                    email: editLead.email || undefined,
                    company: editLead.company || undefined,
                    linkedinUrl: editLead.linkedin || undefined,
                  };
                  
                  // Check if we have enough info to enrich
                  if (!leadInfo.name && !leadInfo.email && !leadInfo.company && !leadInfo.linkedinUrl) {
                    showToast({ 
                      title: 'Please enter at least a name, email, company, or LinkedIn URL to enrich the lead', 
                      type: 'error' 
                    });
                    return;
                  }

                  enrichLead(leadInfo).then(enrichedData => {
                    if (enrichedData) {
                      const [firstName, ...lastNameParts] = enrichedData.fullName.split(' ');
                      const lastName = lastNameParts.join(' ');
                      
                      setEditLead(prev => ({
                        ...prev,
                        first_name: firstName || prev.first_name,
                        last_name: lastName || prev.last_name,
                        email: enrichedData.workEmail || prev.email,
                        phone: enrichedData.phoneNumber || prev.phone,
                        company: enrichedData.companyName || prev.company,
                        job_title: enrichedData.jobTitle || prev.job_title,
                        linkedin: enrichedData.linkedinUrl || prev.linkedin,
                      }));

                      showToast({ 
                        title: 'Lead enriched successfully! Review and save the updated information.', 
                        type: 'success' 
                      });
                    }
                  });
                }}
                disabled={enriching}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {enriching ? 'Enriching...' : 'AI Enrich'}
              </BrandButton>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">First Name</label>
                  <BrandInput
                    value={editLead.first_name}
                    onChange={(e) => setEditLead({...editLead, first_name: e.target.value})}
                    placeholder="First Name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Last Name</label>
                  <BrandInput
                    value={editLead.last_name}
                    onChange={(e) => setEditLead({...editLead, last_name: e.target.value})}
                    placeholder="Last Name"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Email</label>
                <BrandInput
                  type="email"
                  value={editLead.email}
                  onChange={(e) => setEditLead({...editLead, email: e.target.value})}
                  placeholder="Email"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Phone</label>
                <BrandInput
                  value={editLead.phone}
                  onChange={(e) => setEditLead({...editLead, phone: e.target.value})}
                  placeholder="Phone"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Source</label>
                  <BrandDropdown
                    value={editLead.source}
                    onChange={(value) => setEditLead({...editLead, source: value})}
                    options={[
                      { value: '', label: 'Select Source' },
                      ...LEAD_SOURCES.map(source => ({ value: source, label: source }))
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Priority</label>
                  <BrandDropdown
                    value={editLead.priority}
                    onChange={(value) => setEditLead({...editLead, priority: value})}
                    options={LEAD_PRIORITIES.map(priority => ({ value: priority, label: priority }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Industry</label>
                  <BrandDropdown
                    value={editLead.industry}
                    onChange={(value) => setEditLead({...editLead, industry: value})}
                    options={[
                      { value: '', label: 'Select Industry' },
                      ...LEAD_INDUSTRIES.map(industry => ({ value: industry, label: industry }))
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Company</label>
                  <BrandInput
                    value={editLead.company}
                    onChange={(e) => setEditLead({...editLead, company: e.target.value})}
                    placeholder="Company Name"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Job Title</label>
                  <BrandInput
                    value={editLead.job_title}
                    onChange={(e) => setEditLead({...editLead, job_title: e.target.value})}
                    placeholder="Job Title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Website</label>
                  <BrandInput
                    value={editLead.website}
                    onChange={(e) => setEditLead({...editLead, website: e.target.value})}
                    placeholder="Website URL"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">LinkedIn</label>
                <BrandInput
                  value={editLead.linkedin}
                  onChange={(e) => setEditLead({...editLead, linkedin: e.target.value})}
                  placeholder="LinkedIn Profile URL"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Notes</label>
                <textarea
                  value={editLead.notes}
                  onChange={(e) => setEditLead({...editLead, notes: e.target.value})}
                  placeholder="Additional notes..."
                  rows={3}
                  className="w-full px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <BrandButton variant="secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </BrandButton>
              <BrandButton onClick={updateLead}>
                Update Lead
              </BrandButton>
            </div>
          </div>
        </Modal>

        {/* View Lead Modal */}
        <Modal open={showViewModal} onClose={() => setShowViewModal(false)}>
          <div className="p-6 max-w-4xl">
            <h2 className="text-xl font-semibold mb-4 text-white">Lead Details</h2>
            {selectedLead && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-3">Basic Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white/60">Name:</span>
                        <span className="font-medium text-white">{selectedLead.first_name} {selectedLead.last_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Email:</span>
                        <span className="font-medium text-white">{selectedLead.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Phone:</span>
                        <span className="font-medium text-white">{selectedLead.phone || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Company:</span>
                        <span className="font-medium text-white">{selectedLead.company || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Job Title:</span>
                        <span className="font-medium text-white">{selectedLead.job_title || '—'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-white mb-3">Lead Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white/60">Status:</span>
                        <BrandBadge variant={selectedLead.status === 'Qualified' ? 'success' : selectedLead.status === 'Converted' ? 'info' : 'default'}>
                          {selectedLead.status}
                        </BrandBadge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Source:</span>
                        <span className="font-medium text-white">{selectedLead.source || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Priority:</span>
                        <span className="font-medium text-white">{selectedLead.priority || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Industry:</span>
                        <span className="font-medium text-white">{selectedLead.industry || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Lead Score:</span>
                        <span className={`font-medium ${getScoreColor(selectedLead.lead_score)}`}>
                          {selectedLead.lead_score || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Additional Information */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">Additional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white/60">Website:</span>
                        <span className="font-medium text-white">{selectedLead.website || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">LinkedIn:</span>
                        <span className="font-medium text-white">{selectedLead.linkedin || '—'}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white/60">Created:</span>
                        <span className="font-medium text-white">
                          {new Date(selectedLead.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Updated:</span>
                        <span className="font-medium text-white">
                          {new Date(selectedLead.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Notes */}
                {selectedLead.notes && (
                  <div>
                    <h3 className="text-lg font-medium text-white mb-3">Notes</h3>
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                      <p className="text-white/80">{selectedLead.notes}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                  <BrandButton variant="secondary" onClick={() => setShowViewModal(false)}>
                    Close
                  </BrandButton>
                  <BrandButton variant="blue" onClick={() => {
                    setShowViewModal(false);
                    setEditLead({
                      first_name: selectedLead.first_name,
                      last_name: selectedLead.last_name,
                      email: selectedLead.email,
                      phone: selectedLead.phone,
                      source: selectedLead.source,
                      priority: selectedLead.priority,
                      industry: selectedLead.industry,
                      company: selectedLead.company,
                      job_title: selectedLead.job_title,
                      website: selectedLead.website,
                      linkedin: selectedLead.linkedin,
                      notes: selectedLead.notes
                    });
                    setShowEditModal(true);
                  }}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Lead
                  </BrandButton>
                </div>
              </div>
      )}
    </div>
        </Modal>

        {/* Convert Lead Modal */}
        <Modal open={showConvertModal} onClose={() => setShowConvertModal(false)} size="3xl">
          <div className="p-8 max-w-4xl w-full">
            <h2 className="text-xl font-semibold mb-4 text-white">Convert Lead</h2>
            {selectedLead && (
              <div className="space-y-6">
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <h4 className="font-medium text-white mb-3">Lead Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-white/60">Name:</span>
                      <span className="ml-2 font-medium text-white">{selectedLead.first_name} {selectedLead.last_name}</span>
                    </div>
                    <div>
                      <span className="text-white/60">Email:</span>
                      <span className="ml-2 font-medium text-white">{selectedLead.email}</span>
                    </div>
                    <div>
                      <span className="text-white/60">Company:</span>
                      <span className="ml-2 font-medium text-white">{selectedLead.company || '—'}</span>
                    </div>
                    <div>
                      <span className="text-white/60">Source:</span>
                      <span className="ml-2 font-medium text-white">{selectedLead.source || '—'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <h4 className="font-medium text-white mb-3">Conversion Options</h4>
                  <p className="text-white/80 mb-4">
                    This lead will be converted to a contact. You can optionally create a deal at the same time.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="createDeal"
                        checked={convertOptions.createDeal}
                        onChange={(e) => setConvertOptions(prev => ({ ...prev, createDeal: e.target.checked }))}
                        className="w-4 h-4 text-[#a259ff] border-gray-300 rounded focus:ring-[#a259ff]"
                      />
                      <label htmlFor="createDeal" className="text-white font-medium">
                        Also create a deal for this contact
                      </label>
                    </div>

                    {convertOptions.createDeal && (
                      <div className="ml-7 space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Deal Title</label>
                            <BrandInput
                              value={convertOptions.dealTitle}
                              onChange={(e) => setConvertOptions(prev => ({ ...prev, dealTitle: e.target.value }))}
                              placeholder="Enter deal title"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Estimated Value (EUR)</label>
                            <BrandInput
                              type="number"
                              value={convertOptions.dealValue.toString()}
                              onChange={(e) => setConvertOptions(prev => ({ ...prev, dealValue: Number(e.target.value) }))}
                              placeholder="0"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">Pipeline Stage</label>
                          <BrandDropdown
                            value={convertOptions.dealStage}
                            onChange={(value) => setConvertOptions(prev => ({ ...prev, dealStage: value }))}
                            options={[
                              { value: 'new', label: 'New' },
                              { value: 'qualified', label: 'Qualified' },
                              { value: 'proposal', label: 'Proposal' },
                              { value: 'negotiation', label: 'Negotiation' }
                            ]}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-[#a259ff]/10 rounded-lg border border-[#a259ff]/20">
                  <p className="text-sm text-[#a259ff]">
                    <strong>What happens next:</strong> A contact record will be created with all lead information. 
                    {convertOptions.createDeal ? ' A deal will also be created and linked to the contact.' : ''} 
                    The lead will be marked as converted and you'll be redirected to the new {convertOptions.createDeal ? 'deal' : 'contact'}.
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 mt-6">
              <BrandButton variant="secondary" onClick={() => setShowConvertModal(false)}>
                Cancel
              </BrandButton>
              <BrandButton 
                onClick={() => {
                  if (selectedLead) {
                    const dealData = convertOptions.createDeal ? {
                      title: convertOptions.dealTitle,
                      value: convertOptions.dealValue,
                      stage: convertOptions.dealStage
                    } : undefined;
                    convertLead(selectedLead, convertOptions.createDeal, dealData);
                  }
                }}
                disabled={convertOptions.createDeal && (!convertOptions.dealTitle || convertOptions.dealValue <= 0)}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Convert Lead
              </BrandButton>
            </div>
          </div>
        </Modal>

        {/* Bulk Actions Modal */}
        <Modal open={showBulkModal} onClose={() => setShowBulkModal(false)}>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">Bulk Actions</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Select Action</label>
                <BrandDropdown
                  value={bulkAction}
                  onChange={setBulkAction}
                  options={[
                    { value: '', label: 'Choose an action...' },
                    { value: 'status', label: 'Update Status' },
                    { value: 'source', label: 'Update Source' },
                    { value: 'priority', label: 'Update Priority' },
                    { value: 'assign', label: 'Assign to User' },
                    { value: 'delete', label: 'Delete Selected' }
                  ]}
                />
              </div>
              
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <p className="text-sm text-white/80">
                  <strong>Note:</strong> Bulk actions will be applied to all selected leads. 
                  Use the checkboxes in the leads table to select multiple leads.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <BrandButton variant="secondary" onClick={() => setShowBulkModal(false)}>
                  Cancel
                </BrandButton>
                <BrandButton variant="red" disabled={!bulkAction}>
                  Apply Bulk Action
                </BrandButton>
              </div>
            </div>
          </div>
        </Modal>

        {/* Import/Export Modal */}
        <Modal open={showImportModal} onClose={() => setShowImportModal(false)}>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">Import/Export Leads</h2>
            <div className="space-y-6">
              {/* Export Section */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Export Leads</h3>
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <p className="text-sm text-white/80 mb-3">
                    Export your leads data in various formats for analysis or backup.
                  </p>
                  <div className="flex space-x-3">
                    <BrandButton variant="blue" size="sm">
                      Export as CSV
                    </BrandButton>
                    <BrandButton variant="purple" size="sm">
                      Export as Excel
                    </BrandButton>
                    <BrandButton variant="green" size="sm">
                      Export as JSON
                    </BrandButton>
                  </div>
                </div>
              </div>
              
              {/* Import Section */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Import Leads</h3>
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <p className="text-sm text-white/80 mb-3">
                    Import leads from CSV, Excel, or other formats. Make sure your file has the correct column headers.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        className="text-sm text-white/80 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-white/10 file:text-white hover:file:bg-white/20"
                      />
                    </div>
                    <div className="flex space-x-3">
                      <BrandButton variant="blue" size="sm">
                        Import File
                      </BrandButton>
                      <BrandButton variant="secondary" size="sm">
                        Download Template
                      </BrandButton>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <BrandButton variant="secondary" onClick={() => setShowImportModal(false)}>
                  Close
                </BrandButton>
              </div>
            </div>
          </div>
        </Modal>
      </BrandPageLayout>
    </BrandBackground>
  );
}