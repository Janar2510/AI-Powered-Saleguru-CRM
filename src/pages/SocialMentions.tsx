import React, { useState, useEffect } from 'react';
import { 
  Twitter, 
  Linkedin, 
  Facebook, 
  Instagram, 
  MessageCircle, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Heart, 
  Share2, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  MoreHorizontal, 
  RefreshCw, 
  Download, 
  Settings, 
  Zap, 
  Brain, 
  Lightbulb, 
  Target, 
  Activity, 
  BarChart3, 
  PieChart, 
  LineChart, 
  Globe, 
  Hash, 
  AtSign, 
  Calendar,
  Clock,
  Star,
  Bookmark,
  Reply,
  Repeat,
  MessageSquare,
  Bell,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Plus,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  Filter as FilterIcon,
  Globe as GlobeIcon,
  TrendingUp as TrendingUpIcon,
  Users as UsersIcon,
  MessageCircle as MessageCircleIcon
} from 'lucide-react';
import Spline from '@splinetool/react-spline';
import { useToastContext } from '../contexts/ToastContext';
import { useGuruContext } from '../contexts/GuruContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { SocialMention } from '../types/social';

interface SocialMentionFilters {
  source?: string;
  sentiment?: string;
  author?: string;
  date_from?: string;
  date_to?: string;
  engagement?: string;
  reach?: string;
}

interface SocialStats {
  totalMentions: number;
  positiveMentions: number;
  negativeMentions: number;
  neutralMentions: number;
  totalEngagement: number;
  totalReach: number;
  topPlatform: string;
  trendingTopics: string[];
  influencerMentions: number;
  brandMentions: number;
}

const SocialMentions: React.FC = () => {
  const [mentions, setMentions] = useState<SocialMention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SocialMentionFilters>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState<'date' | 'engagement' | 'sentiment'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedMention, setSelectedMention] = useState<SocialMention | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  const { showToast } = useToastContext();
  const { askGuru } = useGuruContext();

  // Mock social stats
  const [stats, setStats] = useState<SocialStats>({
    totalMentions: 1247,
    positiveMentions: 892,
    negativeMentions: 89,
    neutralMentions: 266,
    totalEngagement: 45678,
    totalReach: 234567,
    topPlatform: 'Twitter',
    trendingTopics: ['AI Sales', 'CRM', 'Automation', 'Productivity', 'Lead Scoring'],
    influencerMentions: 45,
    brandMentions: 156
  });

  const fetchMentions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulated API call - replace with real Supabase query
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Enhanced mock data for demo
      const mockMentions: SocialMention[] = [
        {
          id: '1',
          source: 'twitter',
          mention_id: '123456789',
          author: 'tech_enthusiast',
          content: 'Just discovered @SaleToruCRM - amazing AI-powered sales tool! The lead scoring feature is incredible. Highly recommend for sales teams looking to boost productivity. #SalesTech #AI #CRM',
          mention_time: '2024-06-20T10:30:00Z',
          sentiment: 'positive',
          url: 'https://twitter.com/tech_enthusiast/status/123456789',
          created_at: '2024-06-20T10:30:00Z',
          updated_at: '2024-06-20T10:30:00Z'
        },
        {
          id: '2',
          source: 'linkedin',
          mention_id: '987654321',
          author: 'Sarah Johnson',
          content: 'Our team has been using SaleToru CRM for the past month and the results are impressive. The automation features have saved us hours every week. The AI insights are game-changing!',
          mention_time: '2024-06-19T15:45:00Z',
          sentiment: 'positive',
          contact_id: 'contact_123',
          created_at: '2024-06-19T15:45:00Z',
          updated_at: '2024-06-19T15:45:00Z'
        },
        {
          id: '3',
          source: 'twitter',
          mention_id: '123456790',
          author: 'startup_founder',
          content: 'Looking for a CRM that actually understands sales. Any recommendations? Currently evaluating @SaleToruCRM and @Salesforce. What\'s your experience?',
          mention_time: '2024-06-18T09:15:00Z',
          sentiment: 'neutral',
          url: 'https://twitter.com/startup_founder/status/123456790',
          created_at: '2024-06-18T09:15:00Z',
          updated_at: '2024-06-18T09:15:00Z'
        },
        {
          id: '4',
          source: 'facebook',
          mention_id: '456789123',
          author: 'Marketing Pro',
          content: 'SaleToru CRM has transformed our sales process. The AI-powered lead scoring is incredibly accurate and the automation workflows are so intuitive. Our conversion rates have improved by 40%!',
          mention_time: '2024-06-17T14:20:00Z',
          sentiment: 'positive',
          created_at: '2024-06-17T14:20:00Z',
          updated_at: '2024-06-17T14:20:00Z'
        },
        {
          id: '5',
          source: 'instagram',
          mention_id: '789123456',
          author: 'sales_coach',
          content: 'Working with SaleToru CRM this week. The interface is clean and the features are powerful. Still exploring all the AI capabilities but so far, so good! 📈 #SalesSuccess',
          mention_time: '2024-06-16T11:30:00Z',
          sentiment: 'positive',
          created_at: '2024-06-16T11:30:00Z',
          updated_at: '2024-06-16T11:30:00Z'
        },
        {
          id: '6',
          source: 'twitter',
          mention_id: '321654987',
          author: 'tech_critic',
          content: 'Tried SaleToru CRM but found it too complex for our small team. The AI features are impressive but the learning curve is steep. Maybe better for enterprise?',
          mention_time: '2024-06-15T16:45:00Z',
          sentiment: 'negative',
          url: 'https://twitter.com/tech_critic/status/321654987',
          created_at: '2024-06-15T16:45:00Z',
          updated_at: '2024-06-15T16:45:00Z'
        }
      ];
      
      setMentions(mockMentions);
    } catch (err) {
      setError('Failed to fetch social mentions. Please try again.');
      showToast('Error fetching social mentions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    // Mock stats - replace with real API call
    console.log('Fetching social mentions stats...');
  };

  useEffect(() => {
    fetchMentions();
    fetchStats();
  }, []);

  const handleFilterChange = (key: keyof SocialMentionFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const handleAskGuru = () => {
    askGuru('Analyze our social media mentions and provide insights on brand sentiment, trending topics, and engagement opportunities.');
  };

  const handleExportData = () => {
    // Mock export functionality
    showToast('Exporting social mentions data...', 'success');
  };

  const getPlatformIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case 'twitter':
        return <Twitter className="w-5 h-5 text-brand-blue" />;
      case 'linkedin':
        return <Linkedin className="w-5 h-5 text-brand-blue" />;
      case 'facebook':
        return <Facebook className="w-5 h-5 text-brand-blue" />;
      case 'instagram':
        return <Instagram className="w-5 h-5 text-brand-purple" />;
      default:
        return <Globe className="w-5 h-5 text-gray-400" />;
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return 'bg-brand-green/20 text-brand-green border-brand-green/30';
      case 'negative':
        return 'bg-brand-red/20 text-brand-red border-brand-red/30';
      case 'neutral':
        return 'bg-brand-yellow/20 text-brand-yellow border-brand-yellow/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return <CheckCircle className="w-4 h-4 text-brand-green" />;
      case 'negative':
        return <XCircle className="w-4 h-4 text-brand-red" />;
      case 'neutral':
        return <Minus className="w-4 h-4 text-brand-yellow" />;
      default:
        return <MessageCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const truncateContent = (content: string, maxLength = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const extractHashtags = (content: string) => {
    const hashtags = content.match(/#\w+/g);
    return hashtags || [];
  };

  const extractMentions = (content: string) => {
    const mentions = content.match(/@\w+/g);
    return mentions || [];
  };

  const getEngagementScore = (mention: SocialMention) => {
    // Mock engagement score based on content length and sentiment
    let score = mention.content.length * 0.1;
    if (mention.sentiment === 'positive') score += 50;
    if (mention.sentiment === 'negative') score += 30;
    return Math.round(score);
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
            <h1 className="text-3xl font-bold text-white mb-1">Social Mentions</h1>
            <p className="text-secondary-400">
              AI-powered social media monitoring and brand sentiment analysis
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleAskGuru}
              variant="outline"
              className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Ask Guru
            </Button>
            <Button
              onClick={handleExportData}
              variant="outline"
              className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={fetchMentions}
              disabled={loading}
              className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Social Analytics Dashboard */}
        <Card className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Social Analytics</h3>
                <p className="text-secondary-400 text-sm">Real-time brand monitoring and insights</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-brand-green/20 text-brand-green border-brand-green/30">
              <Zap className="w-3 h-3 mr-1" />
              Live Monitoring
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">{stats.totalMentions}</div>
              <div className="text-secondary-400 text-sm">Total Mentions</div>
              <div className="flex items-center justify-center text-brand-green text-xs mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +15% this week
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">{stats.totalEngagement.toLocaleString()}</div>
              <div className="text-secondary-400 text-sm">Total Engagement</div>
              <div className="flex items-center justify-center text-brand-green text-xs mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +8% this week
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">{stats.totalReach.toLocaleString()}</div>
              <div className="text-secondary-400 text-sm">Total Reach</div>
              <div className="flex items-center justify-center text-brand-green text-xs mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12% this week
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">{stats.influencerMentions}</div>
              <div className="text-secondary-400 text-sm">Influencer Mentions</div>
              <div className="flex items-center justify-center text-brand-green text-xs mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +5 this week
              </div>
            </div>
          </div>
        </Card>

        {/* Sentiment Analysis & Trending Topics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Sentiment Analysis</h3>
              <PieChart className="w-5 h-5 text-brand-blue" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-brand-green rounded-full"></div>
                  <span className="text-white text-sm">Positive</span>
                </div>
                <span className="text-white font-semibold">{stats.positiveMentions}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-brand-yellow rounded-full"></div>
                  <span className="text-white text-sm">Neutral</span>
                </div>
                <span className="text-white font-semibold">{stats.neutralMentions}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-brand-red rounded-full"></div>
                  <span className="text-white text-sm">Negative</span>
                </div>
                <span className="text-white font-semibold">{stats.negativeMentions}</span>
              </div>
            </div>
          </Card>

          <Card className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Top Platform</h3>
              <BarChart3 className="w-5 h-5 text-brand-purple" />
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Twitter className="w-8 h-8 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stats.topPlatform}</div>
              <div className="text-secondary-400 text-sm">Most Active Platform</div>
              <div className="flex items-center justify-center text-brand-green text-xs mt-2">
                <TrendingUp className="w-3 h-3 mr-1" />
                45% of mentions
              </div>
            </div>
          </Card>

          <Card className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Trending Topics</h3>
              <TrendingUpIcon className="w-5 h-5 text-brand-green" />
            </div>
            <div className="space-y-2">
              {stats.trendingTopics.slice(0, 5).map((topic, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-white text-sm">#{topic}</span>
                  <Badge variant="secondary" className="bg-brand-blue/20 text-brand-blue border-brand-blue/30 text-xs">
                    {Math.floor(Math.random() * 100) + 20} mentions
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50 rounded-xl shadow-lg p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Search mentions..."
                  className="pl-10 pr-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <select
                value={filters.source || ''}
                onChange={(e) => handleFilterChange('source', e.target.value)}
                className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Platforms</option>
                <option value="twitter">Twitter</option>
                <option value="linkedin">LinkedIn</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
              </select>
              
              <select
                value={filters.sentiment || ''}
                onChange={(e) => handleFilterChange('sentiment', e.target.value)}
                className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Sentiments</option>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setViewMode('list')}
                variant={viewMode === 'list' ? 'primary' : 'secondary'}
                size="sm"
                className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setViewMode('grid')}
                variant={viewMode === 'grid' ? 'primary' : 'secondary'}
                size="sm"
                className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Mentions List */}
        <div className="space-y-4">
          {error ? (
            <Card className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50 rounded-xl shadow-lg p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <AlertTriangle className="w-16 h-16 text-brand-red mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Error Loading Mentions</h3>
                <p className="text-secondary-400 mb-4">{error}</p>
                <Button onClick={fetchMentions} className="bg-primary-600 hover:bg-primary-500">
                  Try Again
                </Button>
              </div>
            </Card>
          ) : loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50 rounded-xl shadow-lg p-6 animate-pulse">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-white/20 rounded w-3/4"></div>
                        <div className="h-3 bg-white/20 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-white/20 rounded"></div>
                      <div className="h-4 bg-white/20 rounded w-5/6"></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : mentions.length === 0 ? (
            <Card className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50 rounded-xl shadow-lg p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <MessageCircle className="w-16 h-16 text-secondary-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Social Mentions Yet</h3>
                <p className="text-secondary-400 mb-4">
                  Connect your social media accounts to start monitoring brand mentions and sentiment.
                </p>
                <Button onClick={fetchMentions} className="bg-primary-600 hover:bg-primary-500">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Data
                </Button>
              </div>
            </Card>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {mentions.map((mention) => (
                <Card 
                  key={mention.id} 
                  className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50 rounded-xl shadow-lg p-6 hover:bg-[#23233a]/60 transition-all duration-300 cursor-pointer group"
                  onClick={() => setSelectedMention(mention)}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          {getPlatformIcon(mention.source)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-semibold text-white">@{mention.author}</span>
                            <Badge variant="secondary" className={getSentimentColor(mention.sentiment)}>
                              {getSentimentIcon(mention.sentiment)}
                              <span className="ml-1">{mention.sentiment}</span>
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-secondary-400">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(mention.mention_time)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="secondary" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                          <Reply className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="secondary" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                          <Bookmark className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      <p className="text-sm text-secondary-200 leading-relaxed">
                        {truncateContent(mention.content, viewMode === 'grid' ? 150 : 300)}
                      </p>
                      
                      {/* Hashtags and Mentions */}
                      <div className="flex flex-wrap gap-2">
                        {extractHashtags(mention.content).slice(0, 3).map((hashtag, index) => (
                          <Badge key={index} variant="secondary" className="bg-brand-blue/20 text-brand-blue border-brand-blue/30 text-xs">
                            {hashtag}
                          </Badge>
                        ))}
                        {extractMentions(mention.content).slice(0, 2).map((mention, index) => (
                          <Badge key={index} variant="secondary" className="bg-brand-purple/20 text-brand-purple border-brand-purple/30 text-xs">
                            {mention}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Engagement Metrics */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <div className="flex items-center space-x-4 text-xs text-secondary-400">
                        <div className="flex items-center space-x-1">
                          <Heart className="w-3 h-3" />
                          <span>{Math.floor(Math.random() * 50) + 5}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Repeat className="w-3 h-3" />
                          <span>{Math.floor(Math.random() * 20) + 2}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>{Math.floor(Math.random() * 10) + 1}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {mention.contact_id && (
                          <Badge variant="secondary" className="bg-brand-green/20 text-brand-green border-brand-green/30 text-xs">
                            <Users className="w-3 h-3 mr-1" />
                            Contact
                          </Badge>
                        )}
                        {mention.url && (
                          <Button size="sm" variant="secondary" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                            <ArrowUpRight className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SocialMentions; 