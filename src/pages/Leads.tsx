import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Users, TrendingUp, Target, CheckSquare, Archive, Eye, Edit, Trash2, ArrowRight, Download, Upload, Star, Building, Mail, Phone, Calendar, DollarSign } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/common/EmptyState';
import LeadConversionModal from '../components/leads/LeadConversionModal';
import BulkConversionModal from '../components/leads/BulkConversionModal';
import CreateLeadModal from '../components/leads/CreateLeadModal';
import { useGuru } from '../contexts/GuruContext';
import { useToastContext } from '../contexts/ToastContext';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  position?: string;
  phone?: string;
  source: 'website' | 'linkedin' | 'referral' | 'cold-email' | 'demo-request' | 'import' | 'manual';
  score: number;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'archived';
  created_at: Date;
  last_contacted_at?: Date;
  converted_at?: Date;
  enriched_at?: Date;
  enrichment_status: 'pending' | 'completed' | 'failed' | 'none';
  tags: string[];
  notes?: string;
  deal_value_estimate?: number;
  industry?: string;
  company_size?: string;
  linkedin_url?: string;
  website?: string;
}

const Leads: React.FC = () => {
  const { openGuru } = useGuru();
  const { showToast } = useToastContext();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [filters, setFilters] = useState({
    source: 'all',
    status: 'all',
    scoreRange: [0, 100] as [number, number],
    enrichmentStatus: 'all'
  });

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConversionModal, setShowConversionModal] = useState(false);
  const [showBulkConversionModal, setShowBulkConversionModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Fetch leads from Supabase
  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          const formattedLeads = data.map(lead => ({
            ...lead,
            created_at: new Date(lead.created_at),
            last_contacted_at: lead.last_contacted_at ? new Date(lead.last_contacted_at) : undefined,
            converted_at: lead.converted_at ? new Date(lead.converted_at) : undefined,
            enriched_at: lead.enriched_at ? new Date(lead.enriched_at) : undefined
          }));
          
          setLeads(formattedLeads);
        }
      } catch (err) {
        console.error('Error fetching leads:', err);
        showToast({
          type: 'error',
          title: 'Data Loading Error',
          message: 'Failed to load leads'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeads();
  }, [showToast]);

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSource = filters.source === 'all' || lead.source === filters.source;
    const matchesStatus = filters.status === 'all' || lead.status === filters.status;
    const matchesScore = lead.score >= filters.scoreRange[0] && lead.score <= filters.scoreRange[1];
    const matchesEnrichment = filters.enrichmentStatus === 'all' || lead.enrichment_status === filters.enrichmentStatus;
    
    return matchesSearch && matchesSource && matchesStatus && matchesScore && matchesEnrichment;
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500 bg-green-500/10';
    if (score >= 60) return 'text-yellow-500 bg-yellow-500/10';
    if (score >= 40) return 'text-orange-500 bg-orange-500/10';
    return 'text-red-500 bg-red-500/10';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="secondary" size="sm">🆕 New</Badge>;
      case 'contacted':
        return <Badge variant="primary" size="sm">📞 Contacted</Badge>;
      case 'qualified':
        return <Badge variant="success" size="sm">✅ Qualified</Badge>;
      case 'converted':
        return <Badge variant="success" size="sm">🎯 Converted</Badge>;
      case 'archived':
        return <Badge variant="secondary" size="sm">📁 Archived</Badge>;
      default:
        return <Badge variant="secondary" size="sm">{status}</Badge>;
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'website': return '🌐';
      case 'linkedin': return '💼';
      case 'referral': return '👥';
      case 'cold-email': return '📧';
      case 'demo-request': return '🎯';
      case 'import': return '📥';
      case 'manual': return '✏️';
      default: return '📋';
    }
  };

  const getEnrichmentStatus = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="text-green-500" title="Data enriched">✅</span>;
      case 'pending':
        return <span className="text-yellow-500" title="Enrichment in progress">⏳</span>;
      case 'failed':
        return <span className="text-red-500" title="Enrichment failed">❌</span>;
      default:
        return <span className="text-secondary-400" title="No enrichment">➖</span>;
    }
  };

  const handleSelectLead = (leadId: string) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map(lead => lead.id));
    }
  };

  const handleConvertLead = (lead: Lead) => {
    setSelectedLead(lead);
    setShowConversionModal(true);
  };

  const handleBulkConvert = () => {
    if (selectedLeads.length === 0) return;
    setShowBulkConversionModal(true);
  };

  const handleArchiveLeads = async () => {
    if (selectedLeads.length === 0) return;
    
    try {
      // Update leads in Supabase
      const { error } = await supabase
        .from('leads')
        .update({ status: 'archived', updated_at: new Date().toISOString() })
        .in('id', selectedLeads);
      
      if (error) throw error;
      
      // Update local state
      setLeads(prev => prev.map(lead => 
        selectedLeads.includes(lead.id) 
          ? { ...lead, status: 'archived' as const }
          : lead
      ));
      
      showToast({
        type: 'success',
        title: 'Leads Archived',
        message: `${selectedLeads.length} leads have been archived.`
      });
      
      setSelectedLeads([]);
    } catch (err) {
      console.error('Error archiving leads:', err);
      showToast({
        type: 'error',
        title: 'Archive Failed',
        message: 'Failed to archive leads. Please try again.'
      });
    }
  };

  const handleExportLeads = () => {
    if (selectedLeads.length === 0) return;
    
    // In a real app, this would generate a CSV or Excel file
    showToast({
      type: 'success',
      title: 'Leads Exported',
      message: `${selectedLeads.length} leads have been exported.`
    });
  };

  const handleViewLead = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      showToast({
        type: 'info',
        title: 'View Lead',
        message: `Viewing details for ${lead.name}`
      });
    }
  };

  const handleEditLead = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      showToast({
        type: 'info',
        title: 'Edit Lead',
        message: `Opening editor for ${lead.name}`
      });
    }
  };

  const handleLeadCreated = async (newLead: any) => {
    try {
      // Refresh leads from Supabase to get the newly created lead with calculated score
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        const formattedLeads = data.map(lead => ({
          ...lead,
          created_at: new Date(lead.created_at),
          last_contacted_at: lead.last_contacted_at ? new Date(lead.last_contacted_at) : undefined,
          converted_at: lead.converted_at ? new Date(lead.converted_at) : undefined,
          enriched_at: lead.enriched_at ? new Date(lead.enriched_at) : undefined
        }));
        
        setLeads(formattedLeads);
      }
      
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error refreshing leads:', err);
    }
  };

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    converted: leads.filter(l => l.status === 'converted').length,
    avgScore: Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length) || 0,
    hotLeads: leads.filter(l => l.score >= 80).length
  };

  if (loading) {
    return (
      <div className="w-full px-5 py-5 space-y-5 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-secondary-400">Loading leads...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-5 py-5 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Leads</h1>
          <p className="text-secondary-400 mt-1">Manage and convert your leads into deals</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={openGuru}
            className="btn-secondary flex items-center space-x-2"
          >
            <Target className="w-4 h-4" />
            <span>Ask Guru</span>
          </button>
          <button 
            onClick={() => {
              showToast({
                type: 'info',
                title: 'Import Leads',
                message: 'Opening lead import wizard...'
              });
            }}
            className="btn-secondary flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Import</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* AI Insights */}
      {stats.hotLeads > 0 && (
        <Card className="bg-gradient-to-r from-green-600/10 to-blue-600/10 border border-green-600/20">
          <div className="flex items-start space-x-3">
            <Target className="w-5 h-5 text-green-500 mt-1" />
            <div className="flex-1">
              <h4 className="font-medium text-white">🎯 Lead Insight</h4>
              <p className="text-secondary-300 text-sm mt-1">
                You have {stats.hotLeads} high-scoring leads (80+ points) ready for immediate outreach. 
                These leads show strong buying signals and should be prioritized for conversion.
              </p>
              <div className="flex space-x-2 mt-3">
                <button 
                  onClick={openGuru}
                  className="btn-primary text-sm"
                >
                  Prioritize Outreach
                </button>
                <button 
                  onClick={() => {
                    showToast({
                      type: 'info',
                      title: 'Campaign',
                      message: 'Opening campaign generator...'
                    });
                  }}
                  className="btn-secondary text-sm"
                >
                  Generate Campaign
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="bg-white/10 backdrop-blur-md">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-secondary-400 text-sm">Total Leads</div>
          </div>
        </Card>
        <Card className="bg-white/10 backdrop-blur-md">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">{stats.new}</div>
            <div className="text-secondary-400 text-sm">New</div>
          </div>
        </Card>
        <Card className="bg-white/10 backdrop-blur-md">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">{stats.qualified}</div>
            <div className="text-secondary-400 text-sm">Qualified</div>
          </div>
        </Card>
        <Card className="bg-white/10 backdrop-blur-md">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500">{stats.converted}</div>
            <div className="text-secondary-400 text-sm">Converted</div>
          </div>
        </Card>
        <Card className="bg-white/10 backdrop-blur-md">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500">{stats.avgScore}</div>
            <div className="text-secondary-400 text-sm">Avg Score</div>
          </div>
        </Card>
        <Card className="bg-white/10 backdrop-blur-md">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">{stats.hotLeads}</div>
            <div className="text-secondary-400 text-sm">Hot Leads</div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <input
              type="text"
              placeholder="Search leads by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
          <button 
            onClick={() => {
              showToast({
                type: 'info',
                title: 'Advanced Filters',
                message: 'Opening advanced filter panel...'
              });
            }}
            className="btn-secondary flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Advanced Filters</span>
          </button>
        </div>

        <div className="flex space-x-2">
          {['all', 'new', 'contacted', 'qualified', 'converted'].map((status) => (
            <button
              key={status}
              onClick={() => setFilters(prev => ({ ...prev, status }))}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                filters.status === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-secondary-700 text-secondary-300 hover:bg-secondary-600'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedLeads.length > 0 && (
        <Card className="bg-primary-600/10 border border-primary-600/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckSquare className="w-5 h-5 text-primary-400" />
              <span className="text-white font-medium">
                {selectedLeads.length} lead{selectedLeads.length > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleBulkConvert}
                className="btn-primary text-sm flex items-center space-x-2"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Convert to Deals</span>
              </button>
              <button
                onClick={handleArchiveLeads}
                className="btn-secondary text-sm flex items-center space-x-2"
              >
                <Archive className="w-4 h-4" />
                <span>Archive</span>
              </button>
              <button
                onClick={handleExportLeads}
                className="btn-secondary text-sm flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Leads Table */}
      {filteredLeads.length > 0 ? (
        <Card className="bg-white/10 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary-700">
                  <th className="text-left py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-secondary-600 bg-secondary-700 text-primary-600 focus:ring-primary-600"
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-secondary-300">Lead</th>
                  <th className="text-left py-3 px-4 font-medium text-secondary-300">Company</th>
                  <th className="text-left py-3 px-4 font-medium text-secondary-300">Source</th>
                  <th className="text-left py-3 px-4 font-medium text-secondary-300">Score</th>
                  <th className="text-left py-3 px-4 font-medium text-secondary-300">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-secondary-300">Created</th>
                  <th className="text-left py-3 px-4 font-medium text-secondary-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-secondary-700 hover:bg-secondary-700/50 transition-colors">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => handleSelectLead(lead.id)}
                        className="rounded border-secondary-600 bg-secondary-700 text-primary-600 focus:ring-primary-600"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {lead.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-white flex items-center space-x-2">
                            <span>{lead.name}</span>
                            {getEnrichmentStatus(lead.enrichment_status)}
                            {lead.score >= 80 && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                          </div>
                          <div className="text-sm text-secondary-400">{lead.position}</div>
                          <div className="text-xs text-secondary-500 flex items-center space-x-2">
                            <Mail className="w-3 h-3" />
                            <span>{lead.email}</span>
                            {lead.phone && (
                              <>
                                <Phone className="w-3 h-3 ml-2" />
                                <span>{lead.phone}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-secondary-400" />
                        <div>
                          <div className="font-medium text-white">{lead.company}</div>
                          {lead.industry && (
                            <div className="text-sm text-secondary-400">{lead.industry}</div>
                          )}
                          {lead.company_size && (
                            <Badge variant="secondary" size="sm" className="mt-1">
                              {lead.company_size}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getSourceIcon(lead.source)}</span>
                        <span className="text-white capitalize">{lead.source.replace('-', ' ')}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className={`text-2xl font-bold px-3 py-1 rounded-lg ${getScoreColor(lead.score)}`}>
                          {lead.score}
                        </div>
                        <button 
                          onClick={openGuru}
                          className="text-secondary-400 hover:text-primary-400 transition-colors"
                          title="Ask Guru about this score"
                        >
                          <Target className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(lead.status)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-white">
                        {lead.created_at.toLocaleDateString()}
                      </div>
                      <div className="text-sm text-secondary-400">
                        {lead.created_at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {lead.last_contacted_at && (
                        <div className="text-xs text-secondary-500 flex items-center space-x-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>Last contact: {lead.last_contacted_at.toLocaleDateString()}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {lead.status !== 'converted' && (
                          <button
                            onClick={() => handleConvertLead(lead)}
                            className="btn-primary text-xs px-2 py-1 flex items-center space-x-1"
                          >
                            <ArrowRight className="w-3 h-3" />
                            <span>Convert</span>
                          </button>
                        )}
                        <button 
                          onClick={() => handleViewLead(lead.id)}
                          className="btn-secondary text-xs px-2 py-1 flex items-center space-x-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                        <button 
                          onClick={() => handleEditLead(lead.id)}
                          className="btn-secondary text-xs px-2 py-1 flex items-center space-x-1"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        {lead.deal_value_estimate && (
                          <Badge variant="success" size="sm" className="ml-2">
                            <DollarSign className="w-3 h-3 mr-1" />
                            ${(lead.deal_value_estimate / 1000).toFixed(0)}K
                          </Badge>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <EmptyState
          icon={Users}
          title="No leads found"
          description={searchTerm ? 'Try adjusting your search criteria' : 'Add your first lead to get started'}
          guruSuggestion="Help me import leads from my email"
          actionLabel="Add Lead"
          onAction={() => setShowCreateModal(true)}
        />
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateLeadModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onLeadCreated={handleLeadCreated}
        />
      )}

      {showConversionModal && selectedLead && (
        <LeadConversionModal
          isOpen={showConversionModal}
          onClose={() => {
            setShowConversionModal(false);
            setSelectedLead(null);
          }}
          lead={selectedLead}
          onConverted={async (dealId) => {
            try {
              // Update lead status to converted in Supabase
              const { error } = await supabase
                .from('leads')
                .update({ 
                  status: 'converted', 
                  converted_at: new Date().toISOString(),
                  converted_to_deal_id: dealId,
                  updated_at: new Date().toISOString()
                })
                .eq('id', selectedLead.id);
              
              if (error) throw error;
              
              // Update local state
              setLeads(prev => prev.map(lead => 
                lead.id === selectedLead.id 
                  ? { ...lead, status: 'converted', converted_at: new Date() }
                  : lead
              ));
              
              showToast({
                type: 'success',
                title: 'Lead Converted',
                message: `${selectedLead.name} has been converted to deal ${dealId}`
              });
              
              setShowConversionModal(false);
              setSelectedLead(null);
            } catch (err) {
              console.error('Error updating lead status:', err);
              showToast({
                type: 'error',
                title: 'Conversion Error',
                message: 'Failed to update lead status'
              });
            }
          }}
        />
      )}

      {showBulkConversionModal && (
        <BulkConversionModal
          isOpen={showBulkConversionModal}
          onClose={() => setShowBulkConversionModal(false)}
          selectedLeadIds={selectedLeads}
          leads={leads.filter(lead => selectedLeads.includes(lead.id))}
          onConverted={async (dealIds) => {
            try {
              // Update leads status to converted in Supabase
              const { error } = await supabase
                .from('leads')
                .update({ 
                  status: 'converted', 
                  converted_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })
                .in('id', selectedLeads);
              
              if (error) throw error;
              
              // Update local state
              setLeads(prev => prev.map(lead => 
                selectedLeads.includes(lead.id) 
                  ? { ...lead, status: 'converted', converted_at: new Date() }
                  : lead
              ));
              
              showToast({
                type: 'success',
                title: 'Bulk Conversion Complete',
                message: `${dealIds.length} leads have been converted to deals`
              });
              
              setSelectedLeads([]);
              setShowBulkConversionModal(false);
            } catch (err) {
              console.error('Error updating lead statuses:', err);
              showToast({
                type: 'error',
                title: 'Conversion Error',
                message: 'Failed to update lead statuses'
              });
            }
          }}
        />
      )}
    </div>
  );
};

export default Leads;