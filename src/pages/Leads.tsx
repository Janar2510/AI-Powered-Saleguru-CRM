import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Users, TrendingUp, Target, CheckSquare, Archive, Eye, Edit, Trash2, 
  ArrowRight, Download, Upload, Star, Building, Mail, Phone, Calendar, DollarSign,
  Bot, Zap, Globe, MessageSquare, FileText, Settings, BarChart3, RefreshCw, 
  ChevronDown, ChevronUp, MoreHorizontal, Sparkles, Lightbulb, Clock,
  Share2, Grid, List, BookOpen, CheckCircle, AlertTriangle, PieChart, Activity, Award, Crown, Trophy, Medal, Badge as BadgeIcon, 
  Square, Play, Pause, Volume2, VolumeX, Mic, MicOff, Video, VideoOff, PhoneOff, 
  Headphones, Speaker, Monitor, Smartphone, Tablet, Laptop, Server, Database, HardDrive, 
  Cloud, Wifi, WifiOff, Signal, SignalHigh, SignalMedium, SignalLow, Battery, BatteryCharging, 
  BatteryFull, BatteryMedium, BatteryLow, Power, PowerOff, Lock, Unlock, Shield, ShieldCheck,
  ShieldAlert, ShieldX, Key, KeyRound, Fingerprint, UserCheck, UserX, UserPlus,
  UserMinus, UserCog, X
} from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/common/EmptyState';
import LeadConversionModal from '../components/leads/LeadConversionModal';
import BulkConversionModal from '../components/leads/BulkConversionModal';
import CreateLeadModal from '../components/leads/CreateLeadModal';
import InboundLeadManager from '../components/leads/InboundLeadManager';
import LeadMergeModal from '../components/leads/LeadMergeModal';
import LeadDetailModal from '../components/leads/LeadDetailModal';
import LeadEditModal from '../components/leads/LeadEditModal';
import { useGuru } from '../contexts/GuruContext';
import { useToastContext } from '../contexts/ToastContext';
import { useModal } from '../contexts/ModalContext';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import Spline from '@splinetool/react-spline';

interface Lead {
  id: string;
  org_id?: string;
  contact_id?: string;
  company_id?: string;
  source?: string;
  status?: string;
  score?: number;
  notes?: string;
  created_at?: Date;
  // Additional fields that might exist in the database
  name?: string;
  email?: string;
  company?: string;
  position?: string;
  phone?: string;
  last_contacted_at?: Date;
  converted_at?: Date;
  enriched_at?: Date;
  enrichment_status?: 'pending' | 'completed' | 'failed' | 'none';
  tags?: string[];
  deal_value_estimate?: number;
  industry?: string;
  company_size?: string;
  linkedin_url?: string;
  website?: string;
  // Fields for compatibility with other components
  first_name?: string;
  last_name?: string;
  lead_score?: number;
  title?: string;
  ai_insight?: string;
  owner_id?: string;
}

const Leads: React.FC = () => {
  const { openGuru } = useGuru();
  const { showToast } = useToastContext();
  const { openModal, closeModal } = useModal();
  const navigate = useNavigate();
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
  const [showInboundManager, setShowInboundManager] = useState(false);
  const [showLeadMerge, setShowLeadMerge] = useState(false);
  const [showLeadDetail, setShowLeadDetail] = useState(false);
  const [showLeadEdit, setShowLeadEdit] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Fetch leads from Supabase
  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      try {
        // First, let's check if the foreign key relationships exist
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          // Fetch related contacts and companies separately if needed
          const contactIds = data.filter(lead => lead.contact_id).map(lead => lead.contact_id);
          const companyIds = data.filter(lead => lead.company_id).map(lead => lead.company_id);
          
          let contacts: any[] = [];
          let companies: any[] = [];
          
          // Fetch contacts if there are any contact_ids
          if (contactIds.length > 0) {
            const { data: contactsData } = await supabase
              .from('contacts')
              .select('id, first_name, last_name, email, phone, title')
              .in('id', contactIds);
            contacts = contactsData || [];
          }
          
          // Fetch companies if there are any company_ids
          if (companyIds.length > 0) {
            const { data: companiesData } = await supabase
              .from('companies')
              .select('id, name, domain')
              .in('id', companyIds);
            companies = companiesData || [];
          }
          
          const formattedLeads = data.map(lead => {
            const contact = contacts.find(c => c.id === lead.contact_id);
            const company = companies.find(c => c.id === lead.company_id);
            
            return {
              ...lead,
              name: contact ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim() : 'Unknown',
              email: contact?.email || '',
              phone: contact?.phone || '',
              position: contact?.title || '',
              company: company?.name || '',
              created_at: new Date(lead.created_at),
              last_contacted_at: lead.last_contacted_at ? new Date(lead.last_contacted_at) : undefined,
              converted_at: lead.converted_at ? new Date(lead.converted_at) : undefined,
              enriched_at: lead.enriched_at ? new Date(lead.enriched_at) : undefined,
              // Ensure compatibility with other interfaces
              first_name: contact?.first_name || '',
              last_name: contact?.last_name || '',
              lead_score: lead.score || 0,
              title: contact?.title || ''
            };
          });
          
          setLeads(formattedLeads as any);
        }
      } catch (err) {
        console.error('Error fetching leads:', err);
        showToast({
          type: 'error',
          title: 'Data Loading Error',
          description: 'Failed to load leads'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeads();
  }, [showToast]);

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSource = filters.source === 'all' || lead.source === filters.source;
    const matchesStatus = filters.status === 'all' || lead.status === filters.status;
    const matchesScore = (lead.score || 0) >= filters.scoreRange[0] && (lead.score || 0) <= filters.scoreRange[1];
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
      const { error } = await supabase
        .from('leads')
        .update({ status: 'archived', updated_at: new Date().toISOString() })
        .in('id', selectedLeads);
      
      if (error) throw error;
      
      setLeads(prev => prev.map(lead => 
        selectedLeads.includes(lead.id) 
          ? { ...lead, status: 'archived' as const }
          : lead
      ));
      
      showToast({
        type: 'success',
        title: 'Leads Archived',
        description: `${selectedLeads.length} leads have been archived.`
      });
      
      setSelectedLeads([]);
    } catch (err) {
      console.error('Error archiving leads:', err);
      showToast({
        type: 'error',
        title: 'Archive Failed',
        description: 'Failed to archive leads. Please try again.'
      });
    }
  };

  const handleExportLeads = () => {
    const csvContent = [
      ['Name', 'Email', 'Company', 'Position', 'Source', 'Score', 'Status', 'Created'],
      ...leads.map(lead => [
        lead.name || '',
        lead.email || '',
        lead.company || '',
        lead.position || '',
        lead.source || '',
        (lead.score || 0).toString(),
        lead.status || '',
        lead.created_at?.toLocaleDateString() || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast({
      type: 'success',
      title: 'Leads Exported',
      description: `${selectedLeads.length} leads have been exported.`
    });
  };

  const handleViewLead = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      setSelectedLead(lead);
      setShowLeadDetail(true);
    }
  };

  const handleEditLead = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      setSelectedLead(lead);
      setShowLeadEdit(true);
    }
  };

  const handleLeadCreated = async (newLead: any) => {
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
    avgScore: Math.round(leads.reduce((sum, l) => sum + (l.score || 0), 0) / leads.length) || 0,
    hotLeads: leads.filter(l => (l.score || 0) >= 80).length
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
    <div className="min-h-screen bg-gradient-to-br from-[#18182c] via-[#23233a] to-[#18182c]">
      {/* 3D Spline Background */}
      <div className="fixed inset-0 z-0">
        <Spline scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode" />
      </div>
      
      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Lead Management</h1>
              <p className="text-[#b0b0d0]">Manage and convert your leads into deals with AI-powered insights</p>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={openGuru}
                className="bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-all flex items-center space-x-2"
              >
                <Target className="w-4 h-4" />
                <span>Ask Guru</span>
              </button>
              <button 
                onClick={() => navigate('/lead-scoring')}
                className="bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-all flex items-center space-x-2"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Lead Scoring</span>
              </button>
              <button 
                onClick={() => setShowInboundManager(true)}
                className="bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-all flex items-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>Inbound Manager</span>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-[#a259ff] to-[#377dff] px-4 py-2 rounded-lg text-white hover:from-[#8b4dff] hover:to-[#2d6bff] transition-all flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Lead</span>
              </button>
            </div>
          </div>

          {/* AI Insights */}
          {stats.hotLeads > 0 && (
            <Card className="bg-gradient-to-r from-green-600/10 to-blue-600/10 border border-green-600/20 backdrop-blur-xl mb-6">
              <div className="flex items-start space-x-3">
                <Target className="w-5 h-5 text-green-500 mt-1" />
                <div className="flex-1">
                  <h4 className="font-medium text-white">🎯 Lead Insight</h4>
                  <p className="text-[#b0b0d0] text-sm mt-1">
                    You have {stats.hotLeads} high-scoring leads (80+ points) ready for immediate outreach. 
                    These leads show strong buying signals and should be prioritized for conversion.
                  </p>
                  <div className="flex space-x-2 mt-3">
                    <button 
                      onClick={() => navigate('/lead-scoring')}
                      className="bg-gradient-to-r from-[#a259ff] to-[#377dff] px-3 py-1 rounded-lg text-white text-sm hover:from-[#8b4dff] hover:to-[#2d6bff] transition-all"
                    >
                      View Lead Scoring
                    </button>
                    <button 
                      onClick={openGuru}
                      className="bg-white/5 backdrop-blur-xl border border-white/10 px-3 py-1 rounded-lg text-white text-sm hover:bg-white/10 transition-all"
                    >
                      Ask Guru
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{stats.total}</div>
                <div className="text-[#b0b0d0] text-sm">Total Leads</div>
              </div>
            </Card>
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{stats.new}</div>
                <div className="text-[#b0b0d0] text-sm">New</div>
              </div>
            </Card>
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{stats.qualified}</div>
                <div className="text-[#b0b0d0] text-sm">Qualified</div>
              </div>
            </Card>
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{stats.converted}</div>
                <div className="text-[#b0b0d0] text-sm">Converted</div>
              </div>
            </Card>
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{stats.avgScore}</div>
                <div className="text-[#b0b0d0] text-sm">Avg Score</div>
              </div>
            </Card>
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{stats.hotLeads}</div>
                <div className="text-[#b0b0d0] text-sm">Hot Leads</div>
              </div>
            </Card>
          </div>

          {/* Filters and Search */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b0b0d0]" />
                <input
                  type="text"
                  placeholder="Search leads by name, email, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                />
              </div>
              <button 
                onClick={() => {
                  showToast({
                    type: 'info',
                    title: 'Advanced Filters',
                    description: 'Opening advanced filter panel...'
                  });
                }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-all flex items-center space-x-2"
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
                  className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                    filters.status === status
                      ? 'bg-gradient-to-r from-[#a259ff] to-[#377dff] text-white'
                      : 'bg-white/5 backdrop-blur-xl border border-white/10 text-[#b0b0d0] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedLeads.length > 0 && (
            <Card className="bg-gradient-to-r from-[#a259ff]/10 to-[#377dff]/10 border border-[#a259ff]/30 backdrop-blur-xl mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckSquare className="w-5 h-5 text-[#a259ff]" />
                  <span className="text-white font-medium">
                    {selectedLeads.length} lead{selectedLeads.length > 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleBulkConvert}
                    className="bg-gradient-to-r from-[#a259ff] to-[#377dff] px-3 py-1 rounded-lg text-white text-sm hover:from-[#8b4dff] hover:to-[#2d6bff] transition-all flex items-center space-x-1"
                  >
                    <ArrowRight className="w-3 h-3" />
                    <span>Convert</span>
                  </button>
                  <button
                    onClick={handleArchiveLeads}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 px-3 py-1 rounded-lg text-white text-sm hover:bg-white/10 transition-all flex items-center space-x-1"
                  >
                    <Archive className="w-3 h-3" />
                    <span>Archive</span>
                  </button>
                  <button
                    onClick={handleExportLeads}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 px-3 py-1 rounded-lg text-white text-sm hover:bg-white/10 transition-all flex items-center space-x-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Export</span>
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* Leads Table */}
          {filteredLeads.length > 0 ? (
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-white/20 bg-white/5 text-[#a259ff] focus:ring-[#a259ff]"
                        />
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-[#b0b0d0]">Lead</th>
                      <th className="text-left py-3 px-4 font-medium text-[#b0b0d0]">Company</th>
                      <th className="text-left py-3 px-4 font-medium text-[#b0b0d0]">Source</th>
                      <th className="text-left py-3 px-4 font-medium text-[#b0b0d0]">Score</th>
                      <th className="text-left py-3 px-4 font-medium text-[#b0b0d0]">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-[#b0b0d0]">Created</th>
                      <th className="text-left py-3 px-4 font-medium text-[#b0b0d0]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedLeads.includes(lead.id)}
                            onChange={() => handleSelectLead(lead.id)}
                            className="rounded border-white/20 bg-white/5 text-[#a259ff] focus:ring-[#a259ff]"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-[#a259ff] to-[#377dff] rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {lead.name?.split(' ').map(n => n[0]).join('') || 'U'}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-white flex items-center space-x-2">
                                <span>{lead.name || 'Unknown'}</span>
                                {getEnrichmentStatus(lead.enrichment_status || 'none')}
                                {(lead.score || 0) >= 80 && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                              </div>
                              <div className="text-sm text-[#b0b0d0]">{lead.position}</div>
                              <div className="text-xs text-[#8a8a8a] flex items-center space-x-2">
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
                            <Building className="w-4 h-4 text-[#b0b0d0]" />
                            <div>
                              <div className="font-medium text-white">{lead.company}</div>
                              {lead.industry && (
                                <div className="text-sm text-[#b0b0d0]">{lead.industry}</div>
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
                            <span className="text-lg">{getSourceIcon(lead.source || 'website')}</span>
                            <span className="text-white capitalize">{lead.source?.replace('-', ' ')}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <div className={`text-2xl font-bold px-3 py-1 rounded-lg ${getScoreColor(lead.score || 0)}`}>
                              {lead.score || 0}
                            </div>
                            <button 
                              onClick={() => navigate('/lead-scoring')}
                              className="text-[#b0b0d0] hover:text-[#a259ff] transition-colors"
                              title="View detailed scoring"
                            >
                              <Target className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(lead.status || 'new')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-white">
                            {lead.created_at?.toLocaleDateString()}
                          </div>
                          <div className="text-sm text-[#b0b0d0]">
                            {lead.created_at?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          {lead.last_contacted_at && (
                            <div className="text-xs text-[#8a8a8a] flex items-center space-x-1 mt-1">
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
                                className="bg-gradient-to-r from-[#a259ff] to-[#377dff] px-2 py-1 rounded-lg text-white text-xs hover:from-[#8b4dff] hover:to-[#2d6bff] transition-all flex items-center space-x-1"
                              >
                                <ArrowRight className="w-3 h-3" />
                                <span>Convert</span>
                              </button>
                            )}
                            <button 
                              onClick={() => handleViewLead(lead.id)}
                              className="bg-white/5 backdrop-blur-xl border border-white/10 px-2 py-1 rounded-lg text-white text-xs hover:bg-white/10 transition-all flex items-center space-x-1"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View</span>
                            </button>
                            <button 
                              onClick={() => handleEditLead(lead.id)}
                              className="bg-white/5 backdrop-blur-xl border border-white/10 px-2 py-1 rounded-lg text-white text-xs hover:bg-white/10 transition-all flex items-center space-x-1"
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
        </div>
      </div>

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
              
              setLeads(prev => prev.map(lead => 
                lead.id === selectedLead.id 
                  ? { ...lead, status: 'converted', converted_at: new Date() }
                  : lead
              ));
              
              showToast({
                type: 'success',
                title: 'Lead Converted',
                description: `${selectedLead.name} has been converted to deal ${dealId}`
              });
              
              setShowConversionModal(false);
              setSelectedLead(null);
            } catch (err) {
              console.error('Error updating lead status:', err);
              showToast({
                type: 'error',
                title: 'Conversion Error',
                description: 'Failed to update lead status'
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
              const { error } = await supabase
                .from('leads')
                .update({ 
                  status: 'converted', 
                  converted_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })
                .in('id', selectedLeads);
              
              if (error) throw error;
              
              setLeads(prev => prev.map(lead => 
                selectedLeads.includes(lead.id) 
                  ? { ...lead, status: 'converted', converted_at: new Date() }
                  : lead
              ));
              
              showToast({
                type: 'success',
                title: 'Bulk Conversion Complete',
                description: `${dealIds.length} leads have been converted to deals`
              });
              
              setSelectedLeads([]);
              setShowBulkConversionModal(false);
            } catch (err) {
              console.error('Error updating lead statuses:', err);
              showToast({
                type: 'error',
                title: 'Conversion Error',
                description: 'Failed to update lead statuses'
              });
            }
          }}
        />
      )}

      {showInboundManager && (
        <InboundLeadManager
          isOpen={showInboundManager}
          onClose={() => setShowInboundManager(false)}
        />
      )}

      {showLeadMerge && (
        <LeadMergeModal
          isOpen={showLeadMerge}
          onClose={() => setShowLeadMerge(false)}
          primaryLead={leads[0] || {
            id: '',
            name: 'Unknown',
            email: '',
            source: 'unknown',
            lead_score: 0,
            status: 'new',
            created_at: new Date()
          }}
          duplicateLeads={leads.slice(1)}
          onMerge={(mergedLead) => {
            setShowLeadMerge(false);
            showToast({
              type: 'success',
              title: 'Leads Merged',
              description: 'Duplicate leads have been merged'
            });
          }}
        />
      )}

      {showLeadDetail && selectedLead && (
        <LeadDetailModal
          isOpen={showLeadDetail}
          onClose={() => setShowLeadDetail(false)}
          lead={selectedLead}
          onEdit={() => {
            setShowLeadDetail(false);
            setShowLeadEdit(true);
          }}
        />
      )}

      {showLeadEdit && selectedLead && (
        <LeadEditModal
          isOpen={showLeadEdit}
          onClose={() => setShowLeadEdit(false)}
          lead={selectedLead}
          onUpdated={(updatedLead) => {
            setLeads(prev => prev.map(lead => 
              lead.id === updatedLead.id ? updatedLead : lead
            ));
            setShowLeadEdit(false);
            showToast({
              type: 'success',
              title: 'Lead Updated',
              description: 'Lead has been updated successfully'
            });
          }}
        />
      )}
    </div>
  );
};

export default Leads;