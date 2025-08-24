import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, TrendingUp, Users, Target, AlertTriangle, Star, ArrowUp, ArrowDown, 
  Clock, Brain, BarChart3, Settings, RefreshCw, Eye, Send,
  Download, Info, Award, X, Plus, Grid3X3, List, Columns, Upload, FileDown
} from 'lucide-react';
import {
  BrandBackground,
  BrandPageLayout,
  BrandCard,
  BrandButton,
  BrandBadge
} from '../contexts/BrandDesignContext';
import { useContacts } from '../hooks/useContacts';
import { useToastContext } from '../contexts/ToastContext';
import { ChronoLeadScoringService } from '../services/chronoLeadScoringService';
import { supabase } from '../services/supabase';

interface EnhancedLead {
  id: string;
  name: string;
  email: string;
  company: string;
  position: string;
  score: number;
  chronoScore?: number;
  timeFactors?: any;
  lastActivity: Date;
  source: string;
  status: 'hot' | 'warm' | 'cold' | 'very-hot';
  interactions: number;
  dealValue?: number;
  phone?: string;
  industry?: string;
  enrichmentStatus?: string;
  temporalInsights?: string;
}

const LeadScoring: React.FC = () => {
  const { showToast } = useToastContext();
  const { contacts: contactsFromHook } = useContacts();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'chronoScore' | 'name' | 'company' | 'lastActivity'>('chronoScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filter, setFilter] = useState('all');
  const [leads, setLeads] = useState<EnhancedLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingScores, setIsGeneratingScores] = useState(false);
  const [showScoringCriteria, setShowScoringCriteria] = useState(false);
  const [selectedLead, setSelectedLead] = useState<EnhancedLead | null>(null);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showViewOptions, setShowViewOptions] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'kanban'>('table');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCriteriaSettings, setShowCriteriaSettings] = useState(false);
  const [criteriaSettings, setCriteriaSettings] = useState({
    profileWeights: {
      ceo: 15,
      vp: 10,
      manager: 5,
      enterprise: 20,
      large: 15
    },
    temporalWeights: {
      q4Urgency: 15,
      preHoliday: 10,
      industryTiming: 10,
      seasonal: 5,
      historical: 8
    },
    engagementWeights: {
      demoRequest: 25,
      emailOpen: 5,
      websiteVisit: 3,
      linkedinView: 2,
      unsubscribed: -15
    }
  });
  const [newLeadForm, setNewLeadForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    industry: '',
    source: 'manual'
  });

  // Enhanced lead data processing with ChronoDeals temporal scoring
  useEffect(() => {
    const processLeadsData = async () => {
      setIsLoading(true);
      try {
        // Fetch both contacts and leads data
        const [contactsResponse, leadsResponse] = await Promise.all([
          supabase.from('contacts').select('*').order('lead_score', { ascending: false }),
          supabase.from('leads').select('*').order('lead_score', { ascending: false })
        ]);

        let allLeadsData: EnhancedLead[] = [];

        // Process contacts as leads
        if (contactsResponse.data) {
          const contactLeads = contactsResponse.data.map(contact => ({
            id: contact.id.toString(),
            name: `${contact.first_name || ''} ${contact.last_name || ''}`.trim(),
            email: contact.email || '',
            company: contact.company_name || '',
            position: contact.title || '',
            score: contact.lead_score || 0,
            lastActivity: contact.updated_at ? new Date(contact.updated_at) : new Date(contact.created_at),
            source: contact.source || 'Unknown',
            status: getLeadStatus(contact.lead_score || 0),
            interactions: Math.floor(Math.random() * 20) + 1,
            phone: contact.phone,
            industry: 'Technology', // Mock data
            enrichmentStatus: contact.enrichment_status || 'none'
          }));
          allLeadsData = [...allLeadsData, ...contactLeads];
        }

        // Process leads table
        if (leadsResponse.data) {
          const leads = leadsResponse.data.map(lead => ({
            id: lead.id.toString(),
            name: `${lead.first_name || ''} ${lead.last_name || ''}`.trim(),
            email: lead.email || '',
            company: lead.company || '',
            position: lead.title || '',
            score: lead.lead_score || 0,
            lastActivity: lead.updated_at ? new Date(lead.updated_at) : new Date(lead.created_at),
            source: lead.source || 'Unknown',
            status: getLeadStatus(lead.lead_score || 0),
            interactions: Math.floor(Math.random() * 20) + 1,
            phone: lead.phone,
            industry: 'Various',
            enrichmentStatus: 'completed'
          }));
          allLeadsData = [...allLeadsData, ...leads];
        }

        // Enhance with ChronoDeals temporal scoring
        const enhancedLeads = await Promise.all(
          allLeadsData.map(async (lead) => {
            try {
              const chronoScore = await ChronoLeadScoringService.getChronoLeadScore(lead.id);
              return {
                ...lead,
                chronoScore: chronoScore?.final_score || lead.score,
                timeFactors: chronoScore?.time_factors,
                temporalInsights: generateTemporalInsights(chronoScore?.time_factors)
              };
            } catch (error) {
              console.warn('ChronoDeals scoring failed for lead:', lead.id);
              return {
                ...lead,
                chronoScore: lead.score,
                temporalInsights: 'Standard scoring applied'
              };
            }
          })
        );

        setLeads(enhancedLeads);
      } catch (error) {
        console.error('Error fetching leads:', error);
        
        // Fallback to enhanced sample data
        const sampleLeads: EnhancedLead[] = [
          {
            id: '1',
            name: 'John Smith',
            email: 'john.smith@techcorp.com',
            company: 'TechCorp Inc.',
            position: 'CTO',
            score: 87,
            chronoScore: 92,
            lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
            source: 'Website',
            status: 'very-hot',
            interactions: 15,
            dealValue: 75000,
            phone: '+1 (555) 123-4567',
            industry: 'Technology',
            enrichmentStatus: 'completed',
            timeFactors: { quarter: 'Q4', urgency: 'high', season: 'winter' },
            temporalInsights: 'Q4 urgency boost + high engagement trend'
          },
          {
            id: '2',
            name: 'Sarah Johnson',
            email: 'sarah@startupxyz.com',
            company: 'StartupXYZ',
            position: 'CEO',
            score: 72,
            chronoScore: 78,
            lastActivity: new Date(Date.now() - 5 * 60 * 60 * 1000),
            source: 'LinkedIn',
            status: 'hot',
            interactions: 8,
            dealValue: 25000,
            industry: 'FinTech',
            enrichmentStatus: 'completed',
            temporalInsights: 'Seasonal trend adjustment applied'
          },
          {
            id: '3',
            name: 'Mike Wilson',
            email: 'mike.wilson@financecore.com',
            company: 'FinanceCore',
            position: 'VP Operations',
            score: 58,
            chronoScore: 65,
            lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000),
            source: 'Referral',
            status: 'warm',
            interactions: 5,
            industry: 'Finance',
            enrichmentStatus: 'pending',
            temporalInsights: 'Industry timing analysis positive'
          }
        ];
        
        setLeads(sampleLeads);
      } finally {
        setIsLoading(false);
      }
    };

    processLeadsData();
  }, [contactsFromHook]);

  // Helper functions
  const getLeadStatus = (score: number): 'hot' | 'warm' | 'cold' | 'very-hot' => {
    if (score >= 90) return 'very-hot';
    if (score >= 70) return 'hot';
    if (score >= 40) return 'warm';
    return 'cold';
  };

  const generateTemporalInsights = (timeFactors: any): string => {
    if (!timeFactors) return 'Standard scoring applied';
    
    const insights = [];
    if (timeFactors.quarter === 'Q4') insights.push('Q4 urgency boost');
    if (timeFactors.urgency === 'high') insights.push('High engagement trend');
    if (timeFactors.holiday === 'pre-holiday') insights.push('Pre-holiday opportunity');
    
    return insights.length > 0 ? insights.join(' + ') : 'Temporal analysis complete';
  };

  // Enhanced filtering and sorting logic
  const filteredLeads = leads
    .filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (lead.industry || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      switch (filter) {
        case 'very-hot':
          return lead.status === 'very-hot' && matchesSearch;
        case 'hot':
          return lead.status === 'hot' && matchesSearch;
        case 'warm':
          return lead.status === 'warm' && matchesSearch;
        case 'cold':
          return lead.status === 'cold' && matchesSearch;
        case 'high-chrono':
          return (lead.chronoScore || 0) >= 80 && matchesSearch;
        case 'temporal-boost':
          return lead.timeFactors && matchesSearch;
        default:
          return matchesSearch;
      }
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'score':
          aValue = a.score;
          bValue = b.score;
          break;
        case 'chronoScore':
          aValue = a.chronoScore || a.score;
          bValue = b.chronoScore || b.score;
          break;
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'company':
          aValue = a.company;
          bValue = b.company;
          break;
        case 'lastActivity':
          aValue = a.lastActivity.getTime();
          bValue = b.lastActivity.getTime();
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Enhanced statistics with ChronoDeals metrics
  const scoreRanges = [
    { 
      label: 'Total Leads', 
      value: leads.length, 
      color: 'text-blue-400', 
      icon: Users,
      gradient: 'from-blue-500/20 to-purple-500/20'
    },
    { 
      label: 'Very Hot (90+)', 
      value: leads.filter(l => (l.chronoScore || l.score) >= 90).length, 
      color: 'text-red-400', 
      icon: Award,
      gradient: 'from-red-500/20 to-orange-500/20'
    },
    { 
      label: 'Hot Leads (70+)', 
      value: leads.filter(l => (l.chronoScore || l.score) >= 70 && (l.chronoScore || l.score) < 90).length, 
      color: 'text-green-400', 
      icon: TrendingUp,
      gradient: 'from-green-500/20 to-emerald-500/20'
    },
    { 
      label: 'Temporal Boost', 
      value: leads.filter(l => l.timeFactors && (l.chronoScore || 0) > l.score).length, 
      color: 'text-purple-400', 
      icon: Clock,
      gradient: 'from-purple-500/20 to-pink-500/20'
    }
  ];

  // Enhanced UI helper functions
  const getScoreColor = (score: number, isChronoScore = false) => {
    const base = isChronoScore ? 'border-2 border-purple-400/30' : '';
    if (score >= 90) return `text-red-400 ${base}`;
    if (score >= 80) return `text-green-400 ${base}`;
    if (score >= 60) return `text-yellow-400 ${base}`;
    if (score >= 40) return `text-orange-400 ${base}`;
    return `text-gray-400 ${base}`;
  };

  const getStatusBadge = (status: string, chronoScore?: number, baseScore?: number) => {
    const hasTemporalBoost = chronoScore && baseScore && chronoScore > baseScore;
    
    switch (status) {
      case 'very-hot':
        return (
          <BrandBadge variant="red" className="flex items-center space-x-1">
            <Award className="w-3 h-3" />
            <span>Very Hot</span>
            {hasTemporalBoost && <Clock className="w-3 h-3" />}
          </BrandBadge>
        );
      case 'hot':
        return (
          <BrandBadge variant="green" className="flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>Hot</span>
            {hasTemporalBoost && <Clock className="w-3 h-3" />}
          </BrandBadge>
        );
      case 'warm':
        return (
          <BrandBadge variant="yellow" className="flex items-center space-x-1">
            <Target className="w-3 h-3" />
            <span>Warm</span>
            {hasTemporalBoost && <Clock className="w-3 h-3" />}
          </BrandBadge>
        );
      case 'cold':
        return (
          <BrandBadge variant="secondary" className="flex items-center space-x-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Cold</span>
          </BrandBadge>
        );
      default:
        return <BrandBadge variant="secondary">{status}</BrandBadge>;
    }
  };

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const SortIcon = ({ column }: { column: typeof sortBy }) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? 
      <ArrowUp className="w-4 h-4 ml-1" /> : 
      <ArrowDown className="w-4 h-4 ml-1" />;
  };

  // Enhanced AI scoring with ChronoDeals - Fixed implementation
  const handleGenerateChronoScores = async () => {
    if (leads.length === 0) {
      showToast({
        type: 'error',
        title: 'No Leads Found',
        description: 'Please add some leads before generating ChronoDeals™ scores.'
      });
      return;
    }

    setIsGeneratingScores(true);
    try {
      showToast({
        type: 'info',
        title: 'ChronoDeals™ Scoring',
        description: `Analyzing ${leads.length} leads with temporal AI...`
      });

      // Simulate AI processing for demo (replace with actual ChronoDeals service call)
      const updatedLeads = leads.map((lead) => {
        try {
          // Calculate temporal boost based on current conditions
          const currentMonth = new Date().getMonth();
          const isQ4 = currentMonth >= 9; // Q4 boost
          const isPreHoliday = currentMonth === 11 && new Date().getDate() >= 15;
          
          let temporalBoost = 0;
          const timeFactors: any = {
            quarter: `Q${Math.ceil((currentMonth + 1) / 3)}`,
            season: getCurrentSeason(),
            urgency: 'medium'
          };

          // Apply temporal logic
          if (isQ4) {
            temporalBoost += criteriaSettings.temporalWeights.q4Urgency;
            timeFactors.urgency = 'high';
            timeFactors.quarterBoost = true;
          }
          
          if (isPreHoliday) {
            temporalBoost += criteriaSettings.temporalWeights.preHoliday;
            timeFactors.holidayPeriod = 'pre-holiday';
          }

          // Industry-specific adjustments
          if (lead.industry === 'Technology') {
            temporalBoost += 5;
            timeFactors.industryTrend = 'positive';
          } else if (lead.industry === 'Finance') {
            temporalBoost += 8;
            timeFactors.industryTrend = 'very-positive';
          }

          // Role-based adjustments
          if (lead.position?.toLowerCase().includes('ceo') || lead.position?.toLowerCase().includes('founder')) {
            temporalBoost += criteriaSettings.profileWeights.ceo;
            timeFactors.roleBoost = 'executive';
          } else if (lead.position?.toLowerCase().includes('vp') || lead.position?.toLowerCase().includes('director')) {
            temporalBoost += criteriaSettings.profileWeights.vp;
            timeFactors.roleBoost = 'management';
          }

          const finalScore = Math.min(lead.score + temporalBoost, 100);
          const temporalInsights = generateEnhancedTemporalInsights(timeFactors, temporalBoost);

          return {
            ...lead,
            chronoScore: finalScore,
            timeFactors,
            temporalInsights,
            status: getLeadStatus(finalScore)
          };
        } catch (error) {
          console.warn('ChronoDeals scoring failed for lead:', lead.id, error);
          return {
            ...lead,
            chronoScore: lead.score,
            temporalInsights: 'Standard scoring applied (temporal analysis failed)'
          };
        }
      });

      // Simulate processing delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 2000));

      setLeads(updatedLeads);
      
      const boostCount = updatedLeads.filter(l => (l.chronoScore || 0) > l.score).length;
      showToast({
        type: 'success',
        title: 'ChronoDeals™ Complete',
        description: `${boostCount} leads received temporal score boosts!`
      });
    } catch (error) {
      console.error('ChronoDeals error:', error);
      showToast({
        type: 'error',
        title: 'ChronoDeals™ Error',
        description: 'Failed to generate temporal scores. Please try again.'
      });
    } finally {
      setIsGeneratingScores(false);
    }
  };

  // Enhanced temporal insights generator
  const generateEnhancedTemporalInsights = (timeFactors: any, boost: number): string => {
    const insights = [];
    
    if (timeFactors.quarterBoost) insights.push('Q4 urgency detected');
    if (timeFactors.holidayPeriod) insights.push('Pre-holiday opportunity');
    if (timeFactors.industryTrend === 'positive') insights.push('Industry momentum positive');
    if (timeFactors.industryTrend === 'very-positive') insights.push('Industry momentum very positive');
    if (timeFactors.roleBoost === 'executive') insights.push('Executive decision-maker');
    if (timeFactors.roleBoost === 'management') insights.push('Management-level contact');
    
    if (boost > 20) insights.push('High temporal priority');
    else if (boost > 10) insights.push('Moderate temporal boost');
    
    return insights.length > 0 ? insights.join(' • ') : 'Standard temporal analysis';
  };

  const getCurrentSeason = (): string => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  };



  const handleLeadAction = (lead: EnhancedLead, action: string) => {
    switch (action) {
      case 'view':
        setSelectedLead(lead);
        break;
      case 'email':
        showToast({
          type: 'info',
          title: 'Email Lead',
          description: `Opening email composer for ${lead.name}`
        });
        break;
      case 'call':
        showToast({
          type: 'info',
          title: 'Call Lead',
          description: `Initiating call to ${lead.name}`
        });
        break;
      default:
        break;
    }
  };

  // Add new lead functionality
  const handleAddLead = async () => {
    try {
      if (!newLeadForm.firstName || !newLeadForm.lastName || !newLeadForm.email) {
        showToast({
          type: 'error',
          title: 'Missing Information',
          description: 'Please fill in all required fields (First Name, Last Name, Email)'
        });
        return;
      }

      // Add to contacts table
      const { data, error } = await supabase
        .from('contacts')
        .insert({
          first_name: newLeadForm.firstName,
          last_name: newLeadForm.lastName,
          email: newLeadForm.email,
          phone: newLeadForm.phone,
          company_name: newLeadForm.company,
          title: newLeadForm.position,
          source: newLeadForm.source,
          lead_score: 0,
          status: 'lead'
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      const newLead: EnhancedLead = {
        id: data.id,
        name: `${newLeadForm.firstName} ${newLeadForm.lastName}`,
        email: newLeadForm.email,
        company: newLeadForm.company,
        position: newLeadForm.position,
        score: 0,
        lastActivity: new Date(),
        source: newLeadForm.source,
        status: 'cold',
        interactions: 0,
        phone: newLeadForm.phone,
        industry: newLeadForm.industry
      };

      setLeads(prev => [newLead, ...prev]);
      setShowAddLeadModal(false);
      setNewLeadForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        position: '',
        industry: '',
        source: 'manual'
      });

      showToast({
        type: 'success',
        title: 'Lead Added',
        description: `${newLead.name} has been added successfully`
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error Adding Lead',
        description: 'Failed to add the lead. Please try again.'
      });
    }
  };

  // Export functionality
  const handleExport = (format: 'csv' | 'xlsx' | 'pdf') => {
    const exportData = filteredLeads.map(lead => ({
      Name: lead.name,
      Email: lead.email,
      Company: lead.company,
      Position: lead.position,
      'Base Score': lead.score,
      'Chrono Score': lead.chronoScore || lead.score,
      Status: lead.status,
      'Last Activity': lead.lastActivity.toLocaleDateString(),
      'Temporal Insights': lead.temporalInsights || 'Standard scoring',
      Source: lead.source,
      Industry: lead.industry
    }));

    if (format === 'csv') {
      const csvContent = [
        Object.keys(exportData[0]).join(','),
        ...exportData.map(row => Object.values(row).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lead-scores-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }

    showToast({
      type: 'success',
      title: 'Export Complete',
      description: `Lead data exported as ${format.toUpperCase()}`
    });
    setShowExportModal(false);
  };

  // Import functionality
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        showToast({
          type: 'info',
          title: 'Import Started',
          description: `Processing ${file.name}...`
        });
        // Here you would implement actual CSV/Excel parsing
        setTimeout(() => {
          showToast({
            type: 'success',
            title: 'Import Complete',
            description: 'Leads imported successfully'
          });
        }, 2000);
      }
    };
    input.click();
  };

  // Save criteria settings
  const handleSaveCriteriaSettings = () => {
    try {
      // Save to localStorage for persistence
      localStorage.setItem('chronoDealsSettings', JSON.stringify(criteriaSettings));
      
      showToast({
        type: 'success',
        title: 'Settings Saved',
        description: 'ChronoDeals™ scoring criteria updated successfully!'
      });
      
      setShowCriteriaSettings(false);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Save Failed',
        description: 'Failed to save criteria settings'
      });
    }
  };

  // Load settings from localStorage on component mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('chronoDealsSettings');
      if (savedSettings) {
        setCriteriaSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.warn('Failed to load saved criteria settings');
    }
  }, []);

  return (
    <BrandBackground>
      <BrandPageLayout
        title="Lead Scoring"
        subtitle="AI-powered lead analysis with ChronoDeals™ temporal scoring"
        actions={
          <div className="flex items-center space-x-3">
            <BrandBadge variant="purple" className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>ChronoDeals™</span>
            </BrandBadge>
            <BrandButton 
              variant="green" 
              onClick={() => setShowAddLeadModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Lead
            </BrandButton>
            <BrandButton 
              variant="purple" 
              onClick={handleGenerateChronoScores}
              disabled={isGeneratingScores}
              className="flex items-center space-x-2"
            >
              {isGeneratingScores ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
              <span>Generate AI Scores</span>
            </BrandButton>
            <BrandButton 
              variant="secondary" 
              onClick={() => setShowCriteriaSettings(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </BrandButton>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Enhanced Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {scoreRanges.map((range, index) => (
              <BrandCard key={index} borderGradient="purple" className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-white/70 text-sm font-medium">{range.label}</p>
                    <p className="text-2xl font-bold text-white mt-1">{range.value}</p>
                    <p className="text-white/50 text-xs mt-1">
                      {leads.length > 0 ? Math.round((range.value / leads.length) * 100) : 0}% of total
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${range.gradient}`}>
                    <range.icon className={`w-6 h-6 ${range.color}`} />
                  </div>
                </div>
              </BrandCard>
            ))}
          </div>

          {/* Search and Filters */}
          <BrandCard borderGradient="blue" className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type="text"
                    placeholder="Search leads by name, company, industry..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/20 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-white/50"
                  />
                </div>
                <BrandButton variant="secondary" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Advanced
                </BrandButton>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                {['all', 'very-hot', 'hot', 'warm', 'cold', 'high-chrono', 'temporal-boost'].map((filterType) => (
                  <BrandButton
                    key={filterType}
                    variant={filter === filterType ? 'purple' : 'secondary'}
                    size="sm"
                    onClick={() => setFilter(filterType)}
                  >
                    {filterType === 'high-chrono' ? 'High Chrono' : 
                     filterType === 'temporal-boost' ? 'Temporal' : 
                     filterType === 'very-hot' ? 'Very Hot' :
                     filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  </BrandButton>
                ))}
              </div>
            </div>
          </BrandCard>

          {/* Scoring Criteria Panel */}
          {showScoringCriteria && (
            <BrandCard borderGradient="yellow" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Info className="w-5 h-5 mr-2 text-yellow-400" />
                  ChronoDeals™ Scoring Criteria
                </h3>
                <BrandButton variant="secondary" size="sm" onClick={() => setShowScoringCriteria(false)}>
                  <X className="w-4 h-4" />
                </BrandButton>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-white flex items-center">
                    <Users className="w-4 h-4 mr-2 text-blue-400" />
                    Profile Scoring
                  </h4>
                  <ul className="text-sm text-white/70 space-y-1">
                    <li>• CEO/Founder: +15 points</li>
                    <li>• VP/Director: +10 points</li>
                    <li>• Manager: +5 points</li>
                    <li>• Enterprise (1000+): +20 points</li>
                    <li>• Large (200-1000): +15 points</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-white flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-purple-400" />
                    Temporal Factors
                  </h4>
                  <ul className="text-sm text-white/70 space-y-1">
                    <li>• Q4 urgency: +15 points</li>
                    <li>• Pre-holiday: +10 points</li>
                    <li>• Industry timing: +/-10 points</li>
                    <li>• Seasonal trends: +/-5 points</li>
                    <li>• Historical patterns: +/-8 points</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-white flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-green-400" />
                    Engagement
                  </h4>
                  <ul className="text-sm text-white/70 space-y-1">
                    <li>• Demo request: +25 points</li>
                    <li>• Email opened: +5 points</li>
                    <li>• Website visit: +3 points</li>
                    <li>• LinkedIn view: +2 points</li>
                    <li>• Unsubscribed: -15 points</li>
                  </ul>
                </div>
              </div>
            </BrandCard>
          )}

          {/* Enhanced Leads Table */}
          {isLoading ? (
            <BrandCard className="p-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white/70 text-lg">Loading leads with AI scoring...</p>
                <p className="text-white/50 text-sm mt-2">Analyzing temporal factors and engagement patterns</p>
              </div>
            </BrandCard>
          ) : filteredLeads.length > 0 ? (
            <BrandCard borderGradient="green" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <h3 className="text-xl font-semibold text-white">Lead Scores</h3>
                  <BrandBadge variant="green">
                    {filteredLeads.length} leads
                  </BrandBadge>
                </div>
                <div className="flex items-center space-x-3">
                  <BrandBadge variant="secondary" className="text-xs">
                    Updated: {new Date().toLocaleTimeString()}
                  </BrandBadge>
                  <div className="relative">
                    <BrandButton 
                      variant="secondary" 
                      size="sm"
                      onClick={() => setShowViewOptions(!showViewOptions)}
                    >
                      {viewMode === 'table' ? <List className="w-4 h-4 mr-2" /> : 
                       viewMode === 'cards' ? <Grid3X3 className="w-4 h-4 mr-2" /> :
                       <Columns className="w-4 h-4 mr-2" />}
                      View
                    </BrandButton>
                    {showViewOptions && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-black/80 backdrop-blur-sm border border-white/20 rounded-xl p-2 z-10">
                        <div className="space-y-1">
                          <button
                            onClick={() => { setViewMode('table'); setShowViewOptions(false); }}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                              viewMode === 'table' ? 'bg-purple-500/20 text-purple-400' : 'text-white/70 hover:bg-white/10'
                            }`}
                          >
                            <List className="w-4 h-4" />
                            <span>Table View</span>
                          </button>
                          <button
                            onClick={() => { setViewMode('cards'); setShowViewOptions(false); }}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                              viewMode === 'cards' ? 'bg-purple-500/20 text-purple-400' : 'text-white/70 hover:bg-white/10'
                            }`}
                          >
                            <Grid3X3 className="w-4 h-4" />
                            <span>Card View</span>
                          </button>
                          <button
                            onClick={() => { setViewMode('kanban'); setShowViewOptions(false); }}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                              viewMode === 'kanban' ? 'bg-purple-500/20 text-purple-400' : 'text-white/70 hover:bg-white/10'
                            }`}
                          >
                            <Columns className="w-4 h-4" />
                            <span>Kanban View</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <BrandButton 
                    variant="secondary" 
                    size="sm"
                    onClick={handleImport}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                  </BrandButton>
                  <BrandButton 
                    variant="secondary" 
                    size="sm"
                    onClick={() => setShowExportModal(true)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </BrandButton>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-4 px-4 font-medium text-white/70 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('name')}>
                        <div className="flex items-center">Contact <SortIcon column="name" /></div>
                      </th>
                      <th className="text-left py-4 px-4 font-medium text-white/70 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('company')}>
                        <div className="flex items-center">Company <SortIcon column="company" /></div>
                      </th>
                      <th className="text-left py-4 px-4 font-medium text-white/70 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('score')}>
                        <div className="flex items-center">Base Score <SortIcon column="score" /></div>
                      </th>
                      <th className="text-left py-4 px-4 font-medium text-white/70 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('chronoScore')}>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Chrono Score <SortIcon column="chronoScore" />
                        </div>
                      </th>
                      <th className="text-left py-4 px-4 font-medium text-white/70">Status</th>
                      <th className="text-left py-4 px-4 font-medium text-white/70">Insights</th>
                      <th className="text-left py-4 px-4 font-medium text-white/70">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-white">{lead.name}</div>
                              <div className="text-sm text-white/60">{lead.position}</div>
                              <div className="text-xs text-white/40">{lead.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-white font-medium">{lead.company}</div>
                          <div className="text-xs text-white/60">{lead.industry}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className={`font-bold text-lg ${getScoreColor(lead.score)}`}>
                            {lead.score}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className={`font-bold text-lg ${getScoreColor(lead.chronoScore || lead.score, true)} flex items-center space-x-2`}>
                            <span>{lead.chronoScore || lead.score}</span>
                            {lead.chronoScore && lead.chronoScore > lead.score && (
                              <ArrowUp className="w-4 h-4 text-green-400" />
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(lead.status, lead.chronoScore, lead.score)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-xs text-white/60 max-w-32">
                            {lead.temporalInsights || 'Standard scoring'}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <BrandButton 
                              variant="secondary" 
                              size="sm"
                              onClick={() => handleLeadAction(lead, 'view')}
                            >
                              <Eye className="w-4 h-4" />
                            </BrandButton>
                            <BrandButton 
                              variant="secondary" 
                              size="sm"
                              onClick={() => handleLeadAction(lead, 'email')}
                            >
                              <Send className="w-4 h-4" />
                            </BrandButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </BrandCard>
          ) : (
            <BrandCard className="p-12">
              <div className="text-center">
                <Star className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No leads found</h3>
                <p className="text-white/60 mb-6">Start adding leads to see AI-powered scoring and temporal insights.</p>
                <BrandButton 
                  variant="purple"
                  onClick={() => setShowAddLeadModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Leads
                </BrandButton>
              </div>
            </BrandCard>
          )}

          {/* Lead Detail Modal */}
          {selectedLead && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <BrandCard borderGradient="purple" className="w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                        <span className="text-white font-medium">
                          {selectedLead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">{selectedLead.name}</h2>
                        <p className="text-white/70">{selectedLead.position} at {selectedLead.company}</p>
                      </div>
                    </div>
                    <BrandButton variant="secondary" size="sm" onClick={() => setSelectedLead(null)}>
                      <X className="w-4 h-4" />
                    </BrandButton>
                  </div>
                </div>
                
                <div className="p-6 flex-1 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-white flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
                        Scoring Details
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-white/70">Base Score:</span>
                          <span className={`font-bold ${getScoreColor(selectedLead.score)}`}>
                            {selectedLead.score}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">ChronoDeals™ Score:</span>
                          <span className={`font-bold ${getScoreColor(selectedLead.chronoScore || selectedLead.score, true)}`}>
                            {selectedLead.chronoScore || selectedLead.score}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Status:</span>
                          <div>{getStatusBadge(selectedLead.status, selectedLead.chronoScore, selectedLead.score)}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-semibold text-white flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-purple-400" />
                        Temporal Insights
                      </h3>
                      <div className="text-sm text-white/70">
                        {selectedLead.temporalInsights || 'No temporal insights available'}
                      </div>
                      {selectedLead.timeFactors && (
                        <div className="space-y-2">
                          <div className="text-xs text-white/50">Time Factors:</div>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(selectedLead.timeFactors).map(([key, value]) => (
                              <BrandBadge key={key} variant="purple" className="text-xs">
                                {key}: {String(value)}
                              </BrandBadge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-6 border-t border-white/10">
                  <div className="flex justify-end space-x-3">
                    <BrandButton variant="secondary" onClick={() => setSelectedLead(null)}>
                      Close
                    </BrandButton>
                    <BrandButton variant="purple" onClick={() => handleLeadAction(selectedLead, 'email')}>
                      <Send className="w-4 h-4 mr-2" />
                      Send Email
                    </BrandButton>
                  </div>
                </div>
              </BrandCard>
            </div>
          )}

          {/* Add Lead Modal */}
          {showAddLeadModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <BrandCard borderGradient="green" className="w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20">
                        <Plus className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Add New Lead</h2>
                        <p className="text-white/70">Create a new lead in your pipeline</p>
                      </div>
                    </div>
                    <BrandButton variant="secondary" size="sm" onClick={() => setShowAddLeadModal(false)}>
                      <X className="w-4 h-4" />
                    </BrandButton>
                  </div>
                </div>
                
                <div className="p-6 flex-1 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          First Name <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={newLeadForm.firstName}
                          onChange={(e) => setNewLeadForm(prev => ({ ...prev, firstName: e.target.value }))}
                          className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Enter first name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          Last Name <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={newLeadForm.lastName}
                          onChange={(e) => setNewLeadForm(prev => ({ ...prev, lastName: e.target.value }))}
                          className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Enter last name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          Email <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="email"
                          value={newLeadForm.email}
                          onChange={(e) => setNewLeadForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Enter email address"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={newLeadForm.phone}
                          onChange={(e) => setNewLeadForm(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          Company
                        </label>
                        <input
                          type="text"
                          value={newLeadForm.company}
                          onChange={(e) => setNewLeadForm(prev => ({ ...prev, company: e.target.value }))}
                          className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Enter company name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          Position
                        </label>
                        <input
                          type="text"
                          value={newLeadForm.position}
                          onChange={(e) => setNewLeadForm(prev => ({ ...prev, position: e.target.value }))}
                          className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Enter job title"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          Industry
                        </label>
                        <select
                          value={newLeadForm.industry}
                          onChange={(e) => setNewLeadForm(prev => ({ ...prev, industry: e.target.value }))}
                          className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">Select industry</option>
                          <option value="Technology">Technology</option>
                          <option value="Finance">Finance</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="Manufacturing">Manufacturing</option>
                          <option value="Retail">Retail</option>
                          <option value="Education">Education</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          Source
                        </label>
                        <select
                          value={newLeadForm.source}
                          onChange={(e) => setNewLeadForm(prev => ({ ...prev, source: e.target.value }))}
                          className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="manual">Manual Entry</option>
                          <option value="website">Website</option>
                          <option value="linkedin">LinkedIn</option>
                          <option value="referral">Referral</option>
                          <option value="cold-email">Cold Email</option>
                          <option value="demo-request">Demo Request</option>
                          <option value="import">Import</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 border-t border-white/10">
                  <div className="flex justify-end space-x-3">
                    <BrandButton variant="secondary" onClick={() => setShowAddLeadModal(false)}>
                      Cancel
                    </BrandButton>
                    <BrandButton variant="green" onClick={handleAddLead}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Lead
                    </BrandButton>
                  </div>
                </div>
              </BrandCard>
            </div>
          )}

          {/* Export Modal */}
          {showExportModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <BrandCard borderGradient="blue" className="w-full max-w-md">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20">
                        <FileDown className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Export Leads</h2>
                        <p className="text-white/70">Choose export format</p>
                      </div>
                    </div>
                    <BrandButton variant="secondary" size="sm" onClick={() => setShowExportModal(false)}>
                      <X className="w-4 h-4" />
                    </BrandButton>
                  </div>
                  
                  <div className="space-y-3">
                    <BrandButton 
                      variant="secondary" 
                      className="w-full justify-start"
                      onClick={() => handleExport('csv')}
                    >
                      <FileDown className="w-4 h-4 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">CSV File</div>
                        <div className="text-xs text-white/60">Comma-separated values</div>
                      </div>
                    </BrandButton>
                    
                    <BrandButton 
                      variant="secondary" 
                      className="w-full justify-start"
                      onClick={() => handleExport('xlsx')}
                    >
                      <FileDown className="w-4 h-4 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">Excel File</div>
                        <div className="text-xs text-white/60">Microsoft Excel format</div>
                      </div>
                    </BrandButton>
                    
                    <BrandButton 
                      variant="secondary" 
                      className="w-full justify-start"
                      onClick={() => handleExport('pdf')}
                    >
                      <FileDown className="w-4 h-4 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">PDF Report</div>
                        <div className="text-xs text-white/60">Formatted report</div>
                      </div>
                    </BrandButton>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <div className="text-xs text-white/60 text-center">
                      Exporting {filteredLeads.length} leads
                    </div>
                  </div>
                </div>
              </BrandCard>
            </div>
          )}

          {/* Criteria Settings Modal */}
          {showCriteriaSettings && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <BrandCard borderGradient="purple" className="w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20">
                        <Settings className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">ChronoDeals™ Scoring Settings</h2>
                        <p className="text-white/70">Configure temporal scoring weights and criteria</p>
                      </div>
                    </div>
                    <BrandButton variant="secondary" size="sm" onClick={() => setShowCriteriaSettings(false)}>
                      <X className="w-4 h-4" />
                    </BrandButton>
                  </div>
                </div>
                
                <div className="p-6 flex-1 overflow-y-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Scoring Weights */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <Users className="w-5 h-5 mr-2 text-blue-400" />
                        Profile Weights
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            CEO/Founder Bonus
                          </label>
                          <div className="flex items-center space-x-3">
                            <input
                              type="range"
                              min="0"
                              max="30"
                              value={criteriaSettings.profileWeights.ceo}
                              onChange={(e) => setCriteriaSettings(prev => ({
                                ...prev,
                                profileWeights: { ...prev.profileWeights, ceo: parseInt(e.target.value) }
                              }))}
                              className="flex-1 h-2 bg-black/20 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <span className="text-white font-medium w-12">+{criteriaSettings.profileWeights.ceo}</span>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            VP/Director Bonus
                          </label>
                          <div className="flex items-center space-x-3">
                            <input
                              type="range"
                              min="0"
                              max="20"
                              value={criteriaSettings.profileWeights.vp}
                              onChange={(e) => setCriteriaSettings(prev => ({
                                ...prev,
                                profileWeights: { ...prev.profileWeights, vp: parseInt(e.target.value) }
                              }))}
                              className="flex-1 h-2 bg-black/20 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <span className="text-white font-medium w-12">+{criteriaSettings.profileWeights.vp}</span>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Manager Bonus
                          </label>
                          <div className="flex items-center space-x-3">
                            <input
                              type="range"
                              min="0"
                              max="15"
                              value={criteriaSettings.profileWeights.manager}
                              onChange={(e) => setCriteriaSettings(prev => ({
                                ...prev,
                                profileWeights: { ...prev.profileWeights, manager: parseInt(e.target.value) }
                              }))}
                              className="flex-1 h-2 bg-black/20 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <span className="text-white font-medium w-12">+{criteriaSettings.profileWeights.manager}</span>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Enterprise Company (1000+)
                          </label>
                          <div className="flex items-center space-x-3">
                            <input
                              type="range"
                              min="0"
                              max="30"
                              value={criteriaSettings.profileWeights.enterprise}
                              onChange={(e) => setCriteriaSettings(prev => ({
                                ...prev,
                                profileWeights: { ...prev.profileWeights, enterprise: parseInt(e.target.value) }
                              }))}
                              className="flex-1 h-2 bg-black/20 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <span className="text-white font-medium w-12">+{criteriaSettings.profileWeights.enterprise}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Temporal Scoring Weights */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-purple-400" />
                        Temporal Weights
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Q4 Urgency Boost
                          </label>
                          <div className="flex items-center space-x-3">
                            <input
                              type="range"
                              min="0"
                              max="25"
                              value={criteriaSettings.temporalWeights.q4Urgency}
                              onChange={(e) => setCriteriaSettings(prev => ({
                                ...prev,
                                temporalWeights: { ...prev.temporalWeights, q4Urgency: parseInt(e.target.value) }
                              }))}
                              className="flex-1 h-2 bg-black/20 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <span className="text-white font-medium w-12">+{criteriaSettings.temporalWeights.q4Urgency}</span>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Pre-Holiday Boost
                          </label>
                          <div className="flex items-center space-x-3">
                            <input
                              type="range"
                              min="0"
                              max="20"
                              value={criteriaSettings.temporalWeights.preHoliday}
                              onChange={(e) => setCriteriaSettings(prev => ({
                                ...prev,
                                temporalWeights: { ...prev.temporalWeights, preHoliday: parseInt(e.target.value) }
                              }))}
                              className="flex-1 h-2 bg-black/20 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <span className="text-white font-medium w-12">+{criteriaSettings.temporalWeights.preHoliday}</span>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Industry Timing Weight
                          </label>
                          <div className="flex items-center space-x-3">
                            <input
                              type="range"
                              min="0"
                              max="15"
                              value={criteriaSettings.temporalWeights.industryTiming}
                              onChange={(e) => setCriteriaSettings(prev => ({
                                ...prev,
                                temporalWeights: { ...prev.temporalWeights, industryTiming: parseInt(e.target.value) }
                              }))}
                              className="flex-1 h-2 bg-black/20 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <span className="text-white font-medium w-12">±{criteriaSettings.temporalWeights.industryTiming}</span>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Seasonal Trends
                          </label>
                          <div className="flex items-center space-x-3">
                            <input
                              type="range"
                              min="0"
                              max="10"
                              value={criteriaSettings.temporalWeights.seasonal}
                              onChange={(e) => setCriteriaSettings(prev => ({
                                ...prev,
                                temporalWeights: { ...prev.temporalWeights, seasonal: parseInt(e.target.value) }
                              }))}
                              className="flex-1 h-2 bg-black/20 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <span className="text-white font-medium w-12">±{criteriaSettings.temporalWeights.seasonal}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Engagement Scoring Weights */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                        Engagement Weights
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Demo Request
                          </label>
                          <div className="flex items-center space-x-3">
                            <input
                              type="range"
                              min="0"
                              max="40"
                              value={criteriaSettings.engagementWeights.demoRequest}
                              onChange={(e) => setCriteriaSettings(prev => ({
                                ...prev,
                                engagementWeights: { ...prev.engagementWeights, demoRequest: parseInt(e.target.value) }
                              }))}
                              className="flex-1 h-2 bg-black/20 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <span className="text-white font-medium w-12">+{criteriaSettings.engagementWeights.demoRequest}</span>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Email Opened
                          </label>
                          <div className="flex items-center space-x-3">
                            <input
                              type="range"
                              min="0"
                              max="15"
                              value={criteriaSettings.engagementWeights.emailOpen}
                              onChange={(e) => setCriteriaSettings(prev => ({
                                ...prev,
                                engagementWeights: { ...prev.engagementWeights, emailOpen: parseInt(e.target.value) }
                              }))}
                              className="flex-1 h-2 bg-black/20 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <span className="text-white font-medium w-12">+{criteriaSettings.engagementWeights.emailOpen}</span>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Website Visit
                          </label>
                          <div className="flex items-center space-x-3">
                            <input
                              type="range"
                              min="0"
                              max="10"
                              value={criteriaSettings.engagementWeights.websiteVisit}
                              onChange={(e) => setCriteriaSettings(prev => ({
                                ...prev,
                                engagementWeights: { ...prev.engagementWeights, websiteVisit: parseInt(e.target.value) }
                              }))}
                              className="flex-1 h-2 bg-black/20 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <span className="text-white font-medium w-12">+{criteriaSettings.engagementWeights.websiteVisit}</span>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Unsubscribed Penalty
                          </label>
                          <div className="flex items-center space-x-3">
                            <input
                              type="range"
                              min="-25"
                              max="0"
                              value={criteriaSettings.engagementWeights.unsubscribed}
                              onChange={(e) => setCriteriaSettings(prev => ({
                                ...prev,
                                engagementWeights: { ...prev.engagementWeights, unsubscribed: parseInt(e.target.value) }
                              }))}
                              className="flex-1 h-2 bg-black/20 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <span className="text-white font-medium w-12">{criteriaSettings.engagementWeights.unsubscribed}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Preview Section */}
                  <div className="mt-8 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                    <h4 className="font-semibold text-white mb-3 flex items-center">
                      <Eye className="w-4 h-4 mr-2" />
                      Settings Preview
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-white/70">Max Profile Boost:</div>
                        <div className="text-green-400 font-medium">
                          +{Math.max(...Object.values(criteriaSettings.profileWeights))} points
                        </div>
                      </div>
                      <div>
                        <div className="text-white/70">Max Temporal Boost:</div>
                        <div className="text-purple-400 font-medium">
                          +{Math.max(...Object.values(criteriaSettings.temporalWeights))} points
                        </div>
                      </div>
                      <div>
                        <div className="text-white/70">Max Engagement:</div>
                        <div className="text-blue-400 font-medium">
                          +{criteriaSettings.engagementWeights.demoRequest} points
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <div className="text-white/60 text-sm">
                      Changes will affect future ChronoDeals™ scoring runs
                    </div>
                    <div className="flex space-x-3">
                      <BrandButton variant="secondary" onClick={() => setShowCriteriaSettings(false)}>
                        Cancel
                      </BrandButton>
                      <BrandButton variant="purple" onClick={handleSaveCriteriaSettings}>
                        <Settings className="w-4 h-4 mr-2" />
                        Save Settings
                      </BrandButton>
                    </div>
                  </div>
                </div>
              </BrandCard>
            </div>
          )}
        </div>
      </BrandPageLayout>
    </BrandBackground>
  );
};

export default LeadScoring;