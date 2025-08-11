import React, { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, Users, Target, Bot, AlertTriangle, Star, ArrowUp, ArrowDown } from 'lucide-react';
import Spline from '@splinetool/react-spline';
import Container from '../components/layout/Container';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/common/EmptyState';
import ChronoDealsWidget from '../components/ai/ChronoDealsWidget';
import { useGuru } from '../contexts/GuruContext';
import { useToastContext } from '../contexts/ToastContext';
import { supabase } from '../services/supabase';

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  position: string;
  score: number;
  lastActivity: Date;
  source: string;
  status: 'hot' | 'warm' | 'cold';
  interactions: number;
  dealValue?: number;
}

const LeadScoring: React.FC = () => {
  const { openGuru } = useGuru();
  const { showToast } = useToastContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'company' | 'lastActivity'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filter, setFilter] = useState('all');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch leads from Supabase
  useEffect(() => {
    const fetchLeads = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .order('lead_score', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          // Transform data to match Lead interface
          const formattedLeads: Lead[] = data.map(lead => ({
            id: lead.id.toString(),
            name: `${lead.first_name || ''} ${lead.last_name || ''}`.trim(),
            email: lead.email || '',
            company: lead.company || '',
            position: lead.title || '',
            score: lead.lead_score || 0,
            lastActivity: lead.updated_at ? new Date(lead.updated_at) : new Date(lead.created_at),
            source: lead.source || 'Unknown',
            status: (lead.lead_score || 0) >= 70 ? 'hot' : (lead.lead_score || 0) >= 40 ? 'warm' : 'cold',
            interactions: Math.floor(Math.random() * 20) + 1, // Mock data
            dealValue: undefined // Not available in current schema
          }));
          
          setLeads(formattedLeads);
        }
      } catch (err) {
        console.error('Error fetching leads:', err);
        
        // Fallback to sample data
        const sampleLeads: Lead[] = [
          {
            id: '1',
            name: 'John Smith',
            email: 'john.smith@techcorp.com',
            company: 'TechCorp Inc.',
            position: 'CTO',
            score: 87,
            lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
            source: 'Website',
            status: 'hot',
            interactions: 15,
            dealValue: 75000
          },
          {
            id: '2',
            name: 'Sarah Johnson',
            email: 'sarah@startupxyz.com',
            company: 'StartupXYZ',
            position: 'CEO',
            score: 72,
            lastActivity: new Date(Date.now() - 5 * 60 * 60 * 1000),
            source: 'LinkedIn',
            status: 'warm',
            interactions: 8,
            dealValue: 25000
          },
          {
            id: '3',
            name: 'Mike Wilson',
            email: 'mike.wilson@financecore.com',
            company: 'FinanceCore',
            position: 'VP Operations',
            score: 58,
            lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000),
            source: 'Referral',
            status: 'warm',
            interactions: 5
          },
          {
            id: '4',
            name: 'Lisa Chen',
            email: 'lisa.chen@globaltech.com',
            company: 'GlobalTech Solutions',
            position: 'Director of IT',
            score: 94,
            lastActivity: new Date(Date.now() - 30 * 60 * 1000),
            source: 'Demo Request',
            status: 'hot',
            interactions: 22,
            dealValue: 120000
          },
          {
            id: '5',
            name: 'David Brown',
            email: 'david@smallbiz.com',
            company: 'Small Business Co.',
            position: 'Owner',
            score: 34,
            lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            source: 'Cold Email',
            status: 'cold',
            interactions: 2
          }
        ];
        
        setLeads(sampleLeads);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLeads();
  }, []);

  const filteredLeads = leads
    .filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lead.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      switch (filter) {
        case 'hot':
          return lead.status === 'hot' && matchesSearch;
        case 'warm':
          return lead.status === 'warm' && matchesSearch;
        case 'cold':
          return lead.status === 'cold' && matchesSearch;
        case 'high-score':
          return lead.score >= 70 && matchesSearch;
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

  const scoreRanges = [
    { 
      label: 'Total Contacts', 
      value: leads.length, 
      color: 'text-blue-500', 
      icon: Users 
    },
    { 
      label: 'Hot Leads (70+)', 
      value: leads.filter(l => l.score >= 70).length, 
      color: 'text-green-500', 
      icon: TrendingUp 
    },
    { 
      label: 'Warm Leads (40-69)', 
      value: leads.filter(l => l.score >= 40 && l.score < 70).length, 
      color: 'text-yellow-500', 
      icon: Target 
    },
    { 
      label: 'Cold Leads (0-39)', 
      value: leads.filter(l => l.score < 40).length, 
      color: 'text-red-500', 
      icon: AlertTriangle 
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500 bg-green-500/10';
    if (score >= 60) return 'text-yellow-500 bg-yellow-500/10';
    if (score >= 40) return 'text-orange-500 bg-orange-500/10';
    return 'text-red-500 bg-red-500/10';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'hot':
        return <Badge variant="danger" size="sm">🔥 Hot</Badge>;
      case 'warm':
        return <Badge variant="warning" size="sm">🌡️ Warm</Badge>;
      case 'cold':
        return <Badge variant="secondary" size="sm">❄️ Cold</Badge>;
      default:
        return <Badge variant="secondary" size="sm">{status}</Badge>;
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

  const handleRefreshScores = async () => {
    try {
      showToast({
        type: 'info',
        title: 'Running AI Lead Scoring',
        description: 'Analyzing leads with AI...'
      });

      const response = await fetch('https://bsgqtbiyhqwzzsadkg.supabase.co/functions/v1/ai-lead-scoring', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showToast({
          type: 'success',
          title: 'AI Scoring Complete',
          description: 'Lead scores and insights updated!'
        });
        // Refresh the leads data
        window.location.reload();
      } else {
        const error = await response.json();
        showToast({
          type: 'error',
          title: 'AI Scoring Failed',
          description: error.message || 'Failed to run AI lead scoring'
        });
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'AI Scoring Error',
        description: 'Failed to connect to AI scoring service'
      });
    }
  };

  return (
    <div className="relative z-10 min-h-screen">
      {/* 3D Spline Background */}
      <div className="fixed inset-0 z-0">
        <Spline
          scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode"
          className="w-full h-full"
        />
      </div>
      {/* Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#18182c]/50 to-[#18182c]/70 z-0"></div>
      <div className="relative z-10">
        <Container>
          <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-[#a259ff] to-[#377dff] rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Lead Scoring</h1>
                  <p className="text-[#b0b0d0]">AI-powered lead analysis and temporal scoring</p>
                </div>
              </div>
              <p className="text-[#b0b0d0] max-w-2xl mx-auto">
                Prioritize your leads with advanced AI and time-aware scoring. ChronoDeals™ brings next-level intelligence to your sales pipeline.
              </p>
            </div>

            {/* ChronoDeals Widget */}
            <ChronoDealsWidget />

            {/* Score Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {scoreRanges.map((range, index) => (
                <div key={index} className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#b0b0d0] text-sm">{range.label}</p>
                      <p className="text-2xl font-bold text-white mt-1">{range.value}</p>
                      <p className="text-xs text-[#8a8a8a] mt-1">
                        {Math.round((range.value / leads.length) * 100)}% of total
                      </p>
                    </div>
                    <range.icon className={`w-8 h-8 ${range.color}`} />
                  </div>
                </div>
              ))}
            </div>

            {/* Filters and Search */}
            <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b0b0d0]" />
                  <input
                    type="text"
                    placeholder="Search leads by name, company, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#23233a]/60 text-white border border-[#23233a]/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <Button
                  onClick={() => showToast({ type: 'info', title: 'Advanced Filters', description: 'Opening advanced filter panel...' })}
                  variant="secondary"
                  size="sm"
                  icon={Filter}
                >
                  Advanced Filters
                </Button>
              </div>
              <div className="flex items-center gap-2">
                {['all', 'hot', 'warm', 'cold', 'high-score'].map((filterType) => (
                  <Button
                    key={filterType}
                    onClick={() => setFilter(filterType)}
                    variant={filter === filterType ? 'gradient' : 'secondary'}
                    size="sm"
                  >
                    {filterType === 'high-score' ? 'High Score' : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Leads Table */}
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-[#a259ff] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-[#b0b0d0]">Loading leads...</p>
                </div>
              </div>
            ) : filteredLeads.length > 0 ? (
              <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6 overflow-x-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Lead Scores</h3>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" size="sm">
                      Last updated: {new Date().toLocaleTimeString()}
                    </Badge>
                    <Button 
                      onClick={handleRefreshScores}
                      variant="secondary"
                      size="sm"
                      icon={Bot}
                    >
                      Refresh Scores
                    </Button>
                  </div>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#23233a]/50">
                      <th className="text-left py-3 px-4 font-medium text-[#b0b0d0] cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('name')}>
                        <div className="flex items-center">Contact <SortIcon column="name" /></div>
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-[#b0b0d0] cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('company')}>
                        <div className="flex items-center">Company <SortIcon column="company" /></div>
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-[#b0b0d0] cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('score')}>
                        <div className="flex items-center">Lead Score <SortIcon column="score" /></div>
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-[#b0b0d0] cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('lastActivity')}>
                        <div className="flex items-center">Last Activity <SortIcon column="lastActivity" /></div>
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-[#b0b0d0]">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-[#b0b0d0]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id} className="border-b border-[#23233a]/30 hover:bg-[#23233a]/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-[#a259ff] to-[#377dff] rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {lead.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-white">{lead.name}</div>
                              <div className="text-sm text-[#b0b0d0]">{lead.position}</div>
                              <div className="text-xs text-[#8a8a8a]">{lead.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-white">{lead.company}</td>
                        <td className="py-3 px-4">
                          <span className={`font-bold ${getScoreColor(lead.score)}`}>{lead.score}</span>
                        </td>
                        <td className="py-3 px-4 text-[#b0b0d0]">{lead.lastActivity.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          {getStatusBadge(lead.status)}
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="secondary" size="sm" onClick={() => showToast({ type: 'info', title: 'Lead Details', description: 'Open lead details modal...' })}>
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={Star}
                title="No leads found"
                description="Start adding leads to see AI-powered scoring and insights."
              />
            )}
          </div>
        </Container>
      </div>
    </div>
  );
};

export default LeadScoring;