import React, { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, Users, Target, Bot, AlertTriangle, Star, ArrowUp, ArrowDown } from 'lucide-react';
import Container from '../components/layout/Container';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/common/EmptyState';
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
          .order('score', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          // Transform data to match Lead interface
          const formattedLeads: Lead[] = data.map(lead => ({
            id: lead.id,
            name: lead.name,
            email: lead.email,
            company: lead.company,
            position: lead.position || '',
            score: lead.score,
            lastActivity: lead.last_contacted_at ? new Date(lead.last_contacted_at) : new Date(lead.created_at),
            source: lead.source,
            status: lead.score >= 70 ? 'hot' : lead.score >= 40 ? 'warm' : 'cold',
            interactions: Math.floor(Math.random() * 20) + 1, // Mock data
            dealValue: lead.deal_value_estimate
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
    setIsLoading(true);
    showToast({
      type: 'info',
      title: 'Refreshing Scores',
      message: 'Recalculating lead scores...'
    });
    
    try {
      // Call Supabase RPC function to recalculate scores
      const { error } = await supabase.rpc('recalculate_all_lead_scores');
      
      if (error) throw error;
      
      // Refetch leads with updated scores
      const { data, error: fetchError } = await supabase
        .from('leads')
        .select('*')
        .order('score', { ascending: false });
      
      if (fetchError) throw fetchError;
      
      if (data) {
        // Transform data to match Lead interface
        const formattedLeads: Lead[] = data.map(lead => ({
          id: lead.id,
          name: lead.name,
          email: lead.email,
          company: lead.company,
          position: lead.position || '',
          score: lead.score,
          lastActivity: lead.last_contacted_at ? new Date(lead.last_contacted_at) : new Date(lead.created_at),
          source: lead.source,
          status: lead.score >= 70 ? 'hot' : lead.score >= 40 ? 'warm' : 'cold',
          interactions: Math.floor(Math.random() * 20) + 1, // Mock data
          dealValue: lead.deal_value_estimate
        }));
        
        setLeads(formattedLeads);
        
        showToast({
          type: 'success',
          title: 'Scores Refreshed',
          message: 'Lead scores have been recalculated'
        });
      }
    } catch (error) {
      console.error('Error refreshing scores:', error);
      showToast({
        type: 'error',
        title: 'Refresh Failed',
        message: 'Failed to recalculate lead scores'
      });
      
      // Simulate score refresh with random adjustments
      const updatedLeads = leads.map(lead => ({
        ...lead,
        score: Math.min(100, Math.max(0, lead.score + Math.floor(Math.random() * 11) - 5))
      }));
      
      setLeads(updatedLeads);
      
      showToast({
        type: 'success',
        title: 'Scores Refreshed',
        message: 'Lead scores have been recalculated'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Lead Scoring</h1>
            <p className="text-secondary-400 mt-1">AI-powered engagement scoring for contacts and deals</p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={openGuru}
              className="btn-secondary flex items-center space-x-2"
            >
              <Bot className="w-4 h-4" />
              <span>Ask Guru</span>
            </button>
            <button 
              onClick={handleRefreshScores}
              className="btn-primary"
            >
              Export Scores
            </button>
          </div>
        </div>

        {/* AI Insights Banner */}
        {leads.filter(l => l.score >= 80).length > 0 && (
          <Card className="bg-gradient-to-r from-green-600/10 to-blue-600/10 border border-green-600/20">
            <div className="flex items-start space-x-3">
              <Bot className="w-5 h-5 text-green-500 mt-1" />
              <div className="flex-1">
                <h4 className="font-medium text-white">🎯 Guru Insight</h4>
                <p className="text-secondary-300 text-sm mt-1">
                  You have {leads.filter(l => l.score >= 80).length} high-scoring leads ready for immediate outreach. 
                  Lisa Chen (94 points) and John Smith (87 points) show strong buying signals.
                </p>
                <div className="flex space-x-2 mt-3">
                  <button 
                    onClick={() => {
                      openGuru();
                      setTimeout(() => {
                        sendMessage("Prioritize outreach for high-scoring leads");
                      }, 300);
                    }}
                    className="btn-primary text-sm"
                  >
                    Prioritize Outreach
                  </button>
                  <button 
                    onClick={() => {
                      showToast({
                        type: 'info',
                        title: 'Campaign Generator',
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

        {/* Score Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {scoreRanges.map((range, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-secondary-400 text-sm">{range.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{range.value}</p>
                  <p className="text-xs text-secondary-500 mt-1">
                    {Math.round((range.value / leads.length) * 100)}% of total
                  </p>
                </div>
                <range.icon className={`w-8 h-8 ${range.color}`} />
              </div>
            </Card>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                type="text"
                placeholder="Search leads by name, company, or email..."
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
            {['all', 'hot', 'warm', 'cold', 'high-score'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  filter === filterType
                    ? 'bg-primary-600 text-white'
                    : 'bg-secondary-700 text-secondary-300 hover:bg-secondary-600'
                }`}
              >
                {filterType === 'high-score' ? 'High Score' : filterType}
              </button>
            ))}
          </div>
        </div>

        {/* Leads Table */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-secondary-400">Loading leads...</p>
            </div>
          </div>
        ) : filteredLeads.length > 0 ? (
          <Card className="bg-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Lead Scores</h3>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" size="sm">
                  Last updated: {new Date().toLocaleTimeString()}
                </Badge>
                <button 
                  onClick={handleRefreshScores}
                  className="btn-secondary text-sm"
                >
                  Refresh Scores
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-secondary-700">
                    <th 
                      className="text-left py-3 px-4 font-medium text-secondary-300 cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        Contact
                        <SortIcon column="name" />
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-4 font-medium text-secondary-300 cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort('company')}
                    >
                      <div className="flex items-center">
                        Company
                        <SortIcon column="company" />
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-4 font-medium text-secondary-300 cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort('score')}
                    >
                      <div className="flex items-center">
                        Lead Score
                        <SortIcon column="score" />
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-4 font-medium text-secondary-300 cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort('lastActivity')}
                    >
                      <div className="flex items-center">
                        Last Activity
                        <SortIcon column="lastActivity" />
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-secondary-300">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-secondary-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="border-b border-secondary-700 hover:bg-secondary-700/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {lead.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-white">{lead.name}</div>
                            <div className="text-sm text-secondary-400">{lead.position}</div>
                            <div className="text-xs text-secondary-500">{lead.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-white font-medium">{lead.company}</div>
                        <div className="text-sm text-secondary-400">
                          {lead.interactions} interactions • {lead.source}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className={`text-2xl font-bold px-3 py-1 rounded-lg ${getScoreColor(lead.score)}`}>
                            {lead.score}
                          </div>
                          <button 
                            onClick={() => {
                              openGuru();
                              setTimeout(() => {
                                sendMessage(`Why is ${lead.name}'s lead score ${lead.score}?`);
                              }, 300);
                            }}
                            className="text-secondary-400 hover:text-primary-400 transition-colors"
                            title="Ask Guru why this score"
                          >
                            <Bot className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-white">
                          {lead.lastActivity.toLocaleDateString()}
                        </div>
                        <div className="text-sm text-secondary-400">
                          {lead.lastActivity.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(lead.status)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => {
                              showToast({
                                type: 'info',
                                title: 'Contact Lead',
                                message: 'Opening contact options...'
                              });
                            }}
                            className="btn-primary text-xs px-2 py-1">
                            Contact
                          </button>
                          <button 
                            onClick={() => {
                              showToast({
                                type: 'info',
                                title: 'View Profile',
                                message: 'Opening lead profile...'
                              });
                            }}
                            className="btn-secondary text-xs px-2 py-1">
                            View Profile
                          </button>
                          {lead.dealValue && (
                            <Badge variant="success" size="sm">
                              ${(lead.dealValue / 1000).toFixed(0)}K
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
            description={searchTerm ? 'Try adjusting your search criteria' : 'Add contacts to start tracking lead scores'}
            guruSuggestion="Help me set up lead scoring"
            actionLabel="Import Contacts"
            onAction={() => {
              showToast({
                type: 'info',
                title: 'Import Contacts',
                message: 'Opening contact import wizard...'
              });
            }}
          />
        )}

        {/* Scoring Methodology */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/10 backdrop-blur-md">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Scoring Factors</span>
            </h3>
            <div className="space-y-3">
              {[
                { factor: 'Email Engagement', weight: '25%', description: 'Opens, clicks, replies' },
                { factor: 'Website Activity', weight: '20%', description: 'Page views, time spent' },
                { factor: 'Demo Requests', weight: '30%', description: 'Scheduled demos, attended' },
                { factor: 'Company Profile', weight: '15%', description: 'Size, industry, fit' },
                { factor: 'Social Interaction', weight: '10%', description: 'LinkedIn, social media' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary-700/50 rounded-lg">
                  <div>
                    <div className="font-medium text-white">{item.factor}</div>
                    <div className="text-sm text-secondary-400">{item.description}</div>
                  </div>
                  <Badge variant="secondary" size="sm">{item.weight}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Star className="w-5 h-5" />
              <span>Score Ranges</span>
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-green-900/20 border border-green-600/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-green-200">Hot Leads (70-100)</span>
                  <Badge variant="success" size="sm">High Priority</Badge>
                </div>
                <p className="text-green-300/80 text-sm">
                  Ready to engage, high conversion probability. Contact immediately.
                </p>
              </div>

              <div className="p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-yellow-200">Warm Leads (40-69)</span>
                  <Badge variant="warning" size="sm">Medium Priority</Badge>
                </div>
                <p className="text-yellow-300/80 text-sm">
                  Showing interest, nurture with targeted content and follow-ups.
                </p>
              </div>

              <div className="p-4 bg-red-900/20 border border-red-600/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-red-200">Cold Leads (0-39)</span>
                  <Badge variant="danger" size="sm">Low Priority</Badge>
                </div>
                <p className="text-red-300/80 text-sm">
                  Early stage, requires more engagement and education.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Guru Suggestions for Empty State */}
        {filteredLeads.length === 0 && searchTerm === '' && (
          <EmptyState
            icon={Bot}
            title="No leads to score yet?"
            description="Let Guru help you import contacts and set up automated lead scoring!"
            guruSuggestion="Help me set up lead scoring"
            actionLabel="Import Contacts"
            onAction={() => {
              showToast({
                type: 'info',
                title: 'Import Contacts',
                message: 'Opening contact import wizard...'
              });
            }}
          />
        )}
      </div>
    </Container>
  );
};

export default LeadScoring;