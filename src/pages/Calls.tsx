import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, 
  Plus, 
  Filter, 
  Search, 
  TrendingUp, 
  Clock, 
  Users, 
  Target, 
  Mic, 
  Play, 
  Pause, 
  Download, 
  Share2, 
  MessageSquare, 
  Calendar,
  BarChart3,
  Sparkles,
  Headphones,
  Phone,
  Video,
  FileText,
  Star,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  Filter as FilterIcon,
  RefreshCw,
  Settings,
  Zap,
  Brain,
  Lightbulb,
  Target as TargetIcon,
  TrendingDown,
  Activity,
  PieChart,
  LineChart,
  Smartphone,
  Monitor,
  Globe
} from 'lucide-react';
import Spline from '@splinetool/react-spline';
import CallTranscriptionModal from '../components/calls/CallTranscriptionModal';
import CallHistory from '../components/calls/CallHistory';
import CallInsightsWidget from '../components/calls/CallInsightsWidget';
import { useToastContext } from '../contexts/ToastContext';
import { useGuruContext } from '../contexts/GuruContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Dropdown from '../components/ui/Dropdown';
import { CallTranscript, CallInsights } from '../types/call';

// Mock data for demonstration
const mockCallInsights: CallInsights = {
  totalCalls: 1247,
  averageDuration: 18,
  sentimentBreakdown: {
    positive: 65,
    neutral: 25,
    negative: 10
  },
  dealStageBreakdown: {
    qualification: 30,
    discovery: 25,
    proposal: 20,
    negotiation: 15,
    closing: 10
  },
  topActionItems: [
    'Schedule follow-up meeting',
    'Send proposal',
    'Update CRM',
    'Share demo recording',
    'Connect with technical team'
  ],
  conversionRate: 68
};

const mockCalls: CallTranscript[] = [
  {
    id: '1',
    contact_id: 'contact-1',
    deal_id: 'deal-1',
    call_type: 'sales_call',
    duration: 25,
    audio_url: 'https://example.com/audio1.mp3',
    transcript: 'Full call transcript...',
    summary: 'Productive sales call with potential client discussing enterprise solution.',
    key_points: ['Client interested in enterprise features', 'Budget approved', 'Technical requirements discussed'],
    action_items: ['Send proposal by Friday', 'Schedule technical demo', 'Follow up next week'],
    sentiment: 'positive',
    deal_stage: 'proposal',
    risk_level: 'low',
    recommendations: ['Focus on enterprise features', 'Highlight ROI benefits'],
    confidence_score: 85,
    status: 'completed',
    created_at: '2024-12-19T10:30:00Z',
    updated_at: '2024-12-19T10:30:00Z'
  },
  {
    id: '2',
    contact_id: 'contact-2',
    deal_id: 'deal-2',
    call_type: 'discovery_call',
    duration: 32,
    audio_url: 'https://example.com/audio2.mp3',
    transcript: 'Full call transcript...',
    summary: 'Initial discovery call to understand client needs and pain points.',
    key_points: ['Current system limitations identified', 'Decision makers involved', 'Timeline discussed'],
    action_items: ['Create needs assessment', 'Schedule demo', 'Prepare ROI analysis'],
    sentiment: 'neutral',
    deal_stage: 'discovery',
    risk_level: 'medium',
    recommendations: ['Focus on pain points', 'Build urgency'],
    confidence_score: 72,
    status: 'completed',
    created_at: '2024-12-18T14:15:00Z',
    updated_at: '2024-12-18T14:15:00Z'
  },
  {
    id: '3',
    contact_id: 'contact-3',
    deal_id: 'deal-3',
    call_type: 'demo_call',
    duration: 45,
    audio_url: 'https://example.com/audio3.mp3',
    transcript: 'Full call transcript...',
    summary: 'Comprehensive product demo showing key features and benefits.',
    key_points: ['All features demonstrated', 'Questions answered', 'Next steps agreed'],
    action_items: ['Send proposal', 'Schedule follow-up', 'Prepare contract'],
    sentiment: 'positive',
    deal_stage: 'negotiation',
    risk_level: 'low',
    recommendations: ['Close deal quickly', 'Address final concerns'],
    confidence_score: 90,
    status: 'completed',
    created_at: '2024-12-17T09:45:00Z',
    updated_at: '2024-12-17T09:45:00Z'
  }
];

const Calls: React.FC = () => {
  const [showTranscriptionModal, setShowTranscriptionModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'duration' | 'sentiment'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedContactId, setSelectedContactId] = useState<string | undefined>();
  const [selectedDealId, setSelectedDealId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [calls, setCalls] = useState<CallTranscript[]>(mockCalls);
  const [insights, setInsights] = useState<CallInsights>(mockCallInsights);
  
  const { showToast } = useToastContext();
  const { askGuru } = useGuruContext();

  useEffect(() => {
    // Filter and sort calls based on current state
    let filteredCalls = mockCalls;
    
    if (searchTerm) {
      filteredCalls = filteredCalls.filter(call => 
        call.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.key_points.some(point => point.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (filterType !== 'all') {
      filteredCalls = filteredCalls.filter(call => call.call_type === filterType);
    }
    
    // Sort calls
    filteredCalls.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'duration':
          aValue = a.duration;
          bValue = b.duration;
          break;
        case 'sentiment':
          const sentimentOrder = { positive: 3, neutral: 2, negative: 1 };
          aValue = sentimentOrder[a.sentiment];
          bValue = sentimentOrder[b.sentiment];
          break;
        default:
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
    
    setCalls(filteredCalls);
  }, [searchTerm, filterType, sortBy, sortOrder]);

  const handleTranscriptionComplete = (callId: string) => {
    showToast({ title: 'Call transcribed successfully!', type: 'success' });
    // Refresh the call history
    window.location.reload();
  };

  const handleQuickTranscribe = () => {
    setShowTranscriptionModal(true);
  };

  const handleAskGuru = () => {
    askGuru('Help me analyze my call performance and suggest improvements for better conversion rates.');
  };

  const getCallTypeIcon = (type: string) => {
    switch (type) {
      case 'sales_call': return <Phone className="w-4 h-4" />;
      case 'discovery_call': return <Search className="w-4 h-4" />;
      case 'demo_call': return <Monitor className="w-4 h-4" />;
      case 'negotiation_call': return <TargetIcon className="w-4 h-4" />;
      case 'follow_up': return <MessageSquare className="w-4 h-4" />;
      default: return <Phone className="w-4 h-4" />;
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'neutral': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'negative': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getRiskLevelColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 3D Spline Background */}
      <div className="fixed inset-0 z-0">
        <Spline scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode" />
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-8 px-4 md:px-8 lg:px-16 xl:px-24 2xl:px-32 pt-8 transition-all duration-300">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Call Management</h1>
            <p className="text-secondary-400">
              AI-powered call transcription, analysis, and insights
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleAskGuru}
              variant="secondary"
              className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Ask Guru
            </Button>
            <Button
              onClick={handleQuickTranscribe}
              className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400"
            >
              <Mic className="w-4 h-4 mr-2" />
              Transcribe Call
            </Button>
          </div>
        </div>

        {/* AI Call Insights Panel */}
        <Card className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">AI Call Insights</h3>
                <p className="text-secondary-400 text-sm">Powered by advanced AI analysis</p>
              </div>
            </div>
            <Badge variant="success" className="bg-green-500/20 text-green-400 border-green-500/30">
              <Zap className="w-3 h-3 mr-1" />
              Live Analysis
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">{insights.totalCalls}</div>
              <div className="text-secondary-400 text-sm">Total Calls</div>
              <div className="flex items-center justify-center text-green-400 text-xs mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12% this month
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">{insights.averageDuration}m</div>
              <div className="text-secondary-400 text-sm">Avg Duration</div>
              <div className="flex items-center justify-center text-green-400 text-xs mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +3% this month
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">{insights.conversionRate}%</div>
              <div className="text-secondary-400 text-sm">Conversion Rate</div>
              <div className="flex items-center justify-center text-green-400 text-xs mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +5% this month
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">24</div>
              <div className="text-secondary-400 text-sm">Active Users</div>
              <div className="flex items-center justify-center text-green-400 text-xs mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +2 this month
              </div>
            </div>
          </div>
        </Card>

        {/* Call Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Sentiment Analysis</h3>
              <PieChart className="w-5 h-5 text-blue-400" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-white text-sm">Positive</span>
                </div>
                <span className="text-white font-semibold">{insights.sentimentBreakdown.positive}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-white text-sm">Neutral</span>
                </div>
                <span className="text-white font-semibold">{insights.sentimentBreakdown.neutral}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-white text-sm">Negative</span>
                </div>
                <span className="text-white font-semibold">{insights.sentimentBreakdown.negative}%</span>
              </div>
            </div>
          </Card>

          <Card className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Deal Stage Progress</h3>
              <BarChart3 className="w-5 h-5 text-purple-400" />
            </div>
            <div className="space-y-3">
              {Object.entries(insights.dealStageBreakdown).map(([stage, count]) => (
                <div key={stage} className="flex items-center justify-between">
                  <span className="text-white text-sm capitalize">{stage}</span>
                  <span className="text-white font-semibold">{count}%</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Top Action Items</h3>
              <Lightbulb className="w-5 h-5 text-orange-400" />
            </div>
            <div className="space-y-2">
              {insights.topActionItems.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <span className="text-white">{item}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Call Management Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Call Insights Widget */}
          <div className="lg:col-span-1">
            <CallInsightsWidget className="animate-slide-up" />
          </div>

          {/* Call History */}
          <div className="lg:col-span-2">
            <Card className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Call History</h2>
                <div className="flex items-center gap-3">
                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-white/10 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-secondary-400'}`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-secondary-400'}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Sort Controls */}
                  <div className="flex items-center gap-2">
                    <Dropdown
                      options={[
                        { value: 'date', label: 'Date' },
                        { value: 'duration', label: 'Duration' },
                        { value: 'sentiment', label: 'Sentiment' }
                      ]}
                      value={sortBy}
                      onChange={val => setSortBy(val as 'date' | 'duration' | 'sentiment')}
                      className="w-36"
                    />
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="p-2 bg-[#23233a]/60 border border-[#23233a]/40 rounded-lg text-white hover:bg-[#23233a]/80 transition-colors"
                    >
                      {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                  <input
                    type="text"
                    placeholder="Search calls by summary, key points, or action items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-secondary-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <Dropdown
                  options={[
                    { value: 'all', label: 'All Types' },
                    { value: 'sales_call', label: 'Sales Calls' },
                    { value: 'discovery_call', label: 'Discovery Calls' },
                    { value: 'demo_call', label: 'Demo Calls' },
                    { value: 'negotiation_call', label: 'Negotiation Calls' },
                    { value: 'follow_up', label: 'Follow-up Calls' }
                  ]}
                  value={filterType}
                  onChange={val => setFilterType(val)}
                  className="w-48"
                />
                <Button
                  variant="secondary"
                  className="bg-[#23233a]/60 border-[#23233a]/40 text-white hover:bg-[#23233a]/80"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>

              {/* Call Cards */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {calls.map((call) => (
                    <Card key={call.id} className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6 hover:bg-[#23233a]/60 transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            {getCallTypeIcon(call.call_type)}
                          </div>
                          <div>
                            <h3 className="text-white font-semibold capitalize">
                              {call.call_type.replace('_', ' ')}
                            </h3>
                            <p className="text-secondary-400 text-sm">
                              {new Date(call.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getSentimentIcon(call.sentiment)}
                          <Badge className={getRiskLevelColor(call.risk_level)}>
                            {call.risk_level} risk
                          </Badge>
                        </div>
                      </div>

                      <p className="text-white text-sm mb-4 line-clamp-2">{call.summary}</p>

                      <div className="space-y-3 mb-4">
                        <div>
                          <h4 className="text-secondary-400 text-xs font-medium mb-1">Key Points</h4>
                          <div className="space-y-1">
                            {call.key_points.slice(0, 2).map((point, index) => (
                              <div key={index} className="flex items-center gap-2 text-white text-sm">
                                <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                                <span className="line-clamp-1">{point}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-secondary-400 text-xs font-medium mb-1">Action Items</h4>
                          <div className="space-y-1">
                            {call.action_items.slice(0, 2).map((item, index) => (
                              <div key={index} className="flex items-center gap-2 text-white text-sm">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                <span className="line-clamp-1">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-secondary-400">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {call.duration}m
                          </span>
                          <span className="text-secondary-400">
                            <Star className="w-3 h-3 inline mr-1" />
                            {call.confidence_score}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="secondary" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                            <Play className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="secondary" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                            <FileText className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="secondary" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                            <MoreHorizontal className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {calls.map((call) => (
                    <Card key={call.id} className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6 hover:bg-[#23233a]/60 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            {getCallTypeIcon(call.call_type)}
                          </div>
                          <div>
                            <h3 className="text-white font-semibold capitalize">
                              {call.call_type.replace('_', ' ')}
                            </h3>
                            <p className="text-secondary-400 text-sm">
                              {new Date(call.created_at).toLocaleDateString()} • {call.duration}m • {call.confidence_score}% confidence
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getSentimentIcon(call.sentiment)}
                          <Badge className={getRiskLevelColor(call.risk_level)}>
                            {call.risk_level} risk
                          </Badge>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="secondary" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                              <Play className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="secondary" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                              <FileText className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="secondary" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                              <MoreHorizontal className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <p className="text-white text-sm mt-3">{call.summary}</p>
                    </Card>
                  ))}
                </div>
              )}

              {calls.length === 0 && (
                <div className="text-center py-12">
                  <Headphones className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                  <h3 className="text-white text-lg font-semibold mb-2">No calls found</h3>
                  <p className="text-secondary-400 mb-4">Try adjusting your search or filter criteria</p>
                  <Button onClick={handleQuickTranscribe} className="bg-gradient-to-r from-primary-600 to-primary-500">
                    <Mic className="w-4 h-4 mr-2" />
                    Start Your First Call
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Call Transcription Modal */}
        {showTranscriptionModal && (
          <CallTranscriptionModal
            isOpen={showTranscriptionModal}
            onClose={() => setShowTranscriptionModal(false)}
            contactId={selectedContactId}
            dealId={selectedDealId}
            onTranscriptionComplete={handleTranscriptionComplete}
          />
        )}
      </div>
    </div>
  );
};

export default Calls; 