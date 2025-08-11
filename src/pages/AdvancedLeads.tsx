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
import Button from '../components/ui/Button';
import EmptyState from '../components/common/EmptyState';
import LeadConversionModal from '../components/leads/LeadConversionModal';
import BulkConversionModal from '../components/leads/BulkConversionModal';
import CreateLeadModal from '../components/leads/CreateLeadModal';
import InboundLeadManager from '../components/leads/InboundLeadManager';
import LeadMergeModal from '../components/leads/LeadMergeModal';
import LeadDetailModal from '../components/leads/LeadDetailModal';
import LeadEditModal from '../components/leads/LeadEditModal';
import ChronoDealsWidget from '../components/ai/ChronoDealsWidget';
import DealEmotionTimeline from '../components/deals/DealEmotionTimeline';
import { useGuru } from '../contexts/GuruContext';
import { useToastContext } from '../contexts/ToastContext';
import { useModal } from '../contexts/ModalContext';
import { supabase } from '../services/supabase';
import Spline from '@splinetool/react-spline';

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

const AdvancedLeads: React.FC = () => {
  const { openGuru } = useGuru();
  const { showToast } = useToastContext();
  const { openModal, closeModal } = useModal();
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
  const [activeTab, setActiveTab] = useState<'leads' | 'inbound' | 'campaigns' | 'analytics'>('leads');

  // Advanced features state
  const [showChronoDeals, setShowChronoDeals] = useState(false);
  const [showSentimentAnalysis, setShowSentimentAnalysis] = useState(false);
  const [showEmailCampaigns, setShowEmailCampaigns] = useState(false);

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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      new: 'secondary',
      contacted: 'warning',
      qualified: 'primary',
      converted: 'success',
      archived: 'error'
    } as const;
    return <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>{status}</Badge>;
  };

  const getSourceIcon = (source: string) => {
    const icons = {
      website: Globe,
      linkedin: Building,
      referral: Users,
      'cold-email': Mail,
      'demo-request': Calendar,
      import: Download,
      manual: Plus
    };
    const Icon = icons[source as keyof typeof icons] || Users;
    return <Icon className="w-4 h-4" />;
  };

  const getEnrichmentStatus = (status: string) => {
    const variants = {
      pending: 'warning',
      completed: 'success',
      failed: 'error',
      none: 'secondary'
    } as const;
    return <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>{status}</Badge>;
  };

  const handleSelectLead = (leadId: string) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map(lead => lead.id));
    }
  };

  const handleConvertLead = (lead: Lead) => {
    setSelectedLead(lead);
    setShowConversionModal(true);
  };

  const handleBulkConvert = () => {
    if (selectedLeads.length === 0) {
      showToast({
        type: 'warning',
        title: 'No Leads Selected',
        message: 'Please select leads to convert'
      });
      return;
    }
    setShowBulkConversionModal(true);
  };

  const handleArchiveLeads = async () => {
    if (selectedLeads.length === 0) {
      showToast({
        type: 'warning',
        title: 'No Leads Selected',
        message: 'Please select leads to archive'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: 'archived' })
        .in('id', selectedLeads);

      if (error) throw error;

      setLeads(prev => prev.map(lead => 
        selectedLeads.includes(lead.id) 
          ? { ...lead, status: 'archived' as const }
          : lead
      ));
      setSelectedLeads([]);

      showToast({
        type: 'success',
        title: 'Leads Archived',
        message: `${selectedLeads.length} leads have been archived`
      });
    } catch (error) {
      console.error('Error archiving leads:', error);
      showToast({
        type: 'error',
        title: 'Archive Failed',
        message: 'Failed to archive selected leads'
      });
    }
  };

  const handleExportLeads = () => {
    const csvContent = [
      ['Name', 'Email', 'Company', 'Position', 'Source', 'Score', 'Status', 'Created'],
      ...leads.map(lead => [
        lead.name,
        lead.email,
        lead.company,
        lead.position || '',
        lead.source,
        lead.score.toString(),
        lead.status,
        lead.created_at.toLocaleDateString()
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
      title: 'Export Complete',
      message: 'Leads have been exported to CSV'
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
    setLeads(prev => [newLead, ...prev]);
    setShowCreateModal(false);
    showToast({
      type: 'success',
      title: 'Lead Created',
      message: 'New lead has been created successfully'
    });
  };

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

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    converted: leads.filter(l => l.status === 'converted').length,
    highScore: leads.filter(l => l.score >= 80).length,
    enriched: leads.filter(l => l.enrichment_status === 'completed').length
  };

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
              <h1 className="text-3xl font-bold text-white mb-2">Advanced Lead Management</h1>
              <p className="text-[#b0b0d0]">AI-powered lead scoring, enrichment, and automation</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setShowInboundManager(true)}
                variant="secondary"
                icon={Zap}
              >
                Inbound Manager
              </Button>
              <Button
                onClick={() => setShowChronoDeals(true)}
                variant="secondary"
                icon={Clock}
              >
                ChronoDeals™
              </Button>
              <Button
                onClick={() => setShowSentimentAnalysis(true)}
                variant="secondary"
                icon={Heart}
              >
                Sentiment Analysis
              </Button>
              <Button
                onClick={() => setShowEmailCampaigns(true)}
                variant="secondary"
                icon={Mail}
              >
                Email Campaigns
              </Button>
              <Button
                onClick={() => openGuru()}
                variant="primary"
                icon={Bot}
              >
                Ask Guru
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-1">
            {[
              { id: 'leads', label: 'Leads', icon: Users },
              { id: 'inbound', label: 'Inbound Sources', icon: Globe },
              { id: 'campaigns', label: 'Campaigns', icon: Mail },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white/10 text-white shadow-lg'
                      : 'text-[#b0b0d0] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{stats.total}</div>
                <div className="text-sm text-[#b0b0d0]">Total Leads</div>
              </div>
            </Card>
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{stats.new}</div>
                <div className="text-sm text-[#b0b0d0]">New</div>
              </div>
            </Card>
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{stats.contacted}</div>
                <div className="text-sm text-[#b0b0d0]">Contacted</div>
              </div>
            </Card>
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{stats.qualified}</div>
                <div className="text-sm text-[#b0b0d0]">Qualified</div>
              </div>
            </Card>
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{stats.converted}</div>
                <div className="text-sm text-[#b0b0d0]">Converted</div>
              </div>
            </Card>
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">{stats.highScore}</div>
                <div className="text-sm text-[#b0b0d0]">High Score</div>
              </div>
            </Card>
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">{stats.enriched}</div>
                <div className="text-sm text-[#b0b0d0]">Enriched</div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          {activeTab === 'leads' && (
            <div className="space-y-6">
              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#b0b0d0] w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search leads..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    variant="primary"
                    icon={Plus}
                  >
                    Add Lead
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={handleBulkConvert}
                    variant="secondary"
                    icon={ArrowRight}
                    disabled={selectedLeads.length === 0}
                  >
                    Convert ({selectedLeads.length})
                  </Button>
                  <Button
                    onClick={handleArchiveLeads}
                    variant="secondary"
                    icon={Archive}
                    disabled={selectedLeads.length === 0}
                  >
                    Archive
                  </Button>
                  <Button
                    onClick={handleExportLeads}
                    variant="secondary"
                    icon={Download}
                  >
                    Export
                  </Button>
                </div>
              </div>

              {/* Leads Table */}
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left p-4">
                          <input
                            type="checkbox"
                            checked={selectedLeads.length === leads.length && leads.length > 0}
                            onChange={handleSelectAll}
                            className="rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500"
                          />
                        </th>
                        <th className="text-left p-4 text-[#b0b0d0] font-medium">Lead</th>
                        <th className="text-left p-4 text-[#b0b0d0] font-medium">Company</th>
                        <th className="text-left p-4 text-[#b0b0d0] font-medium">Source</th>
                        <th className="text-left p-4 text-[#b0b0d0] font-medium">Score</th>
                        <th className="text-left p-4 text-[#b0b0d0] font-medium">Status</th>
                        <th className="text-left p-4 text-[#b0b0d0] font-medium">Enrichment</th>
                        <th className="text-left p-4 text-[#b0b0d0] font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.map((lead) => (
                        <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="p-4">
                            <input
                              type="checkbox"
                              checked={selectedLeads.includes(lead.id)}
                              onChange={() => handleSelectLead(lead.id)}
                              className="rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500"
                            />
                          </td>
                          <td className="p-4">
                            <div>
                              <div className="font-medium text-white">{lead.name}</div>
                              <div className="text-sm text-[#b0b0d0]">{lead.email}</div>
                              {lead.position && (
                                <div className="text-xs text-[#8a8a8a]">{lead.position}</div>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-white">{lead.company}</div>
                            {lead.industry && (
                              <div className="text-sm text-[#b0b0d0]">{lead.industry}</div>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              {getSourceIcon(lead.source)}
                              <span className="text-white capitalize">{lead.source}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className={`font-bold ${getScoreColor(lead.score)}`}>
                              {lead.score}
                            </div>
                          </td>
                          <td className="p-4">
                            {getStatusBadge(lead.status)}
                          </td>
                          <td className="p-4">
                            {getEnrichmentStatus(lead.enrichment_status)}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleViewLead(lead.id)}
                                className="p-1 text-[#b0b0d0] hover:text-white"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditLead(lead.id)}
                                className="p-1 text-[#b0b0d0] hover:text-white"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleConvertLead(lead)}
                                className="p-1 text-[#b0b0d0] hover:text-white"
                              >
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'inbound' && (
            <div className="text-center py-12">
              <Globe className="w-16 h-16 text-[#a259ff] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Inbound Lead Sources</h3>
              <p className="text-[#b0b0d0] mb-4">Manage email gateways, social media monitoring, and automated lead capture</p>
              <Button
                onClick={() => setShowInboundManager(true)}
                variant="primary"
                icon={Zap}
              >
                Open Inbound Manager
              </Button>
            </div>
          )}

          {activeTab === 'campaigns' && (
            <div className="text-center py-12">
              <Mail className="w-16 h-16 text-[#a259ff] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Email Campaigns</h3>
              <p className="text-[#b0b0d0] mb-4">Create and manage automated email campaigns for lead nurturing</p>
              <Button
                onClick={() => setShowEmailCampaigns(true)}
                variant="primary"
                icon={Mail}
              >
                Open Campaign Manager
              </Button>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-[#a259ff] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Lead Analytics</h3>
              <p className="text-[#b0b0d0] mb-4">Advanced analytics and insights for lead performance and conversion</p>
              <Button
                onClick={() => setShowChronoDeals(true)}
                variant="primary"
                icon={Clock}
              >
                View Analytics
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateLeadModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onLeadCreated={handleLeadCreated}
      />

      <LeadConversionModal
        isOpen={showConversionModal}
        onClose={() => setShowConversionModal(false)}
        lead={selectedLead!}
        onConverted={(dealId) => {
          setShowConversionModal(false);
          showToast({
            type: 'success',
            title: 'Lead Converted',
            message: `Lead converted to deal ${dealId}`
          });
        }}
      />

      <BulkConversionModal
        isOpen={showBulkConversionModal}
        onClose={() => setShowBulkConversionModal(false)}
        leads={leads.filter(lead => selectedLeads.includes(lead.id))}
        onConverted={() => {
          setShowBulkConversionModal(false);
          setSelectedLeads([]);
          showToast({
            type: 'success',
            title: 'Bulk Conversion',
            message: 'Selected leads have been converted'
          });
        }}
      />

      <InboundLeadManager
        isOpen={showInboundManager}
        onClose={() => setShowInboundManager(false)}
      />

      <LeadMergeModal
        isOpen={showLeadMerge}
        onClose={() => setShowLeadMerge(false)}
        leads={leads}
        onMerged={() => {
          setShowLeadMerge(false);
          showToast({
            type: 'success',
            title: 'Leads Merged',
            message: 'Duplicate leads have been merged'
          });
        }}
      />

      <LeadDetailModal
        isOpen={showLeadDetail}
        onClose={() => setShowLeadDetail(false)}
        lead={selectedLead!}
        onEdit={() => {
          setShowLeadDetail(false);
          setShowLeadEdit(true);
        }}
      />

      <LeadEditModal
        isOpen={showLeadEdit}
        onClose={() => setShowLeadEdit(false)}
        lead={selectedLead!}
        onUpdated={(updatedLead) => {
          setLeads(prev => prev.map(lead => 
            lead.id === updatedLead.id ? updatedLead : lead
          ));
          setShowLeadEdit(false);
          showToast({
            type: 'success',
            title: 'Lead Updated',
            message: 'Lead has been updated successfully'
          });
        }}
      />

      {/* Advanced Feature Modals */}
      {showChronoDeals && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">ChronoDeals™ - Temporal Lead Scoring</h2>
              <button onClick={() => setShowChronoDeals(false)} className="text-[#b0b0d0] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <ChronoDealsWidget />
          </div>
        </div>
      )}

      {showSentimentAnalysis && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Live Sentiment Replay™</h2>
              <button onClick={() => setShowSentimentAnalysis(false)} className="text-[#b0b0d0] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <DealEmotionTimeline dealId="demo-deal" />
          </div>
        </div>
      )}

      {showEmailCampaigns && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Email Campaign Management</h2>
              <button onClick={() => setShowEmailCampaigns(false)} className="text-[#b0b0d0] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-center py-12">
              <Mail className="w-16 h-16 text-[#a259ff] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Email Campaigns</h3>
              <p className="text-[#b0b0d0] mb-4">Create and manage automated email campaigns for lead nurturing</p>
              <div className="flex items-center justify-center space-x-4">
                <Button variant="primary" icon={Plus}>Create Campaign</Button>
                <Button variant="secondary" icon={BarChart3}>View Analytics</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedLeads;
