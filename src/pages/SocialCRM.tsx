import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  Heart,
  Share2,
  TrendingUp,
  TrendingDown,
  Users,
  Bell,
  Filter,
  Search,
  Calendar,
  BarChart3,
  Eye,
  MessageSquare,
  Plus,
  Settings,
  RefreshCw,
  Download,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertTriangle,
  Target,
  Sparkles,
  Hash,
  AtSign,
  Globe,
  Zap,
  Activity,
  X,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  PlayCircle,
  Pause,
  Edit,
  Trash2
} from 'lucide-react';
import { BrandBackground, BrandPageLayout, BrandCard, BrandButton, BrandBadge } from '../contexts/BrandDesignContext';
import { socialListeningService, SocialMention, SocialListeningRule, SocialEngagementItem } from '../services/socialListeningService';

interface SocialAnalytics {
  totalMentions: number;
  sentimentBreakdown: { positive: number; negative: number; neutral: number };
  platformBreakdown: { [platform: string]: number };
  leadsGenerated: number;
  responseRate: number;
  averageResponseTime: string;
}

const SocialCRM: React.FC = () => {
  // State Management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mentions, setMentions] = useState<SocialMention[]>([]);
  const [listeningRules, setListeningRules] = useState<SocialListeningRule[]>([]);
  const [engagementQueue, setEngagementQueue] = useState<SocialEngagementItem[]>([]);
  const [analytics, setAnalytics] = useState<SocialAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('all');
  const [showCreateRule, setShowCreateRule] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    keywords: '',
    exclude_keywords: '',
    hashtags: '',
    mentions: '',
    platforms: ['twitter'],
    languages: ['en'],
    auto_create_lead: false,
    notification_enabled: true,
    lead_qualification_score: 50
  });

  // Mock current org ID (in real app, get from auth context)
  const currentOrgId = 'current-org-id';

  // Social platforms with their colors and icons
  const platforms = [
    { name: 'twitter', label: 'Twitter/X', color: '#1DA1F2', icon: MessageCircle },
    { name: 'linkedin', label: 'LinkedIn', color: '#0077B5', icon: Users },
    { name: 'facebook', label: 'Facebook', color: '#1877F2', icon: MessageSquare },
    { name: 'instagram', label: 'Instagram', color: '#E4405F', icon: Heart },
  ];

  // Load data on component mount
  useEffect(() => {
    loadSocialData();
  }, []);

  const loadSocialData = async () => {
    setIsLoading(true);
    try {
      const [
        mentionsData,
        rulesData,
        queueData,
        analyticsData
      ] = await Promise.all([
        socialListeningService.getRecentMentions(currentOrgId, 50, selectedPlatform === 'all' ? undefined : selectedPlatform),
        socialListeningService.getListeningRules(currentOrgId),
        socialListeningService.getEngagementQueue(currentOrgId),
        socialListeningService.getListeningAnalytics(currentOrgId, 30)
      ]);

      setMentions(mentionsData);
      setListeningRules(rulesData);
      setEngagementQueue(queueData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading social data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter mentions based on selected filters
  const filteredMentions = mentions.filter(mention => {
    if (selectedPlatform !== 'all' && mention.platform_name !== selectedPlatform) return false;
    if (selectedSentiment !== 'all' && mention.sentiment !== selectedSentiment) return false;
    return true;
  });

  // Helper Functions
  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'green';
      case 'negative': return 'red';
      case 'neutral': return 'blue';
      default: return 'secondary';
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return TrendingUp;
      case 'negative': return TrendingDown;
      case 'neutral': return Minus;
      default: return Activity;
    }
  };

  const getPlatformIcon = (platform: string) => {
    const platformData = platforms.find(p => p.name === platform);
    return platformData ? platformData.icon : Globe;
  };

  const getPlatformColor = (platform: string) => {
    const platformData = platforms.find(p => p.name === platform);
    return platformData ? platformData.color : '#6B7280';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const processListening = async () => {
    setIsProcessing(true);
    try {
      console.log('🔄 Starting social listening process...');
      await socialListeningService.processSocialListening(currentOrgId);
      await loadSocialData(); // Refresh data
      console.log('✅ Social listening completed');
    } catch (error) {
      console.error('Error processing social listening:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateRule = async () => {
    try {
      const ruleData = {
        org_id: currentOrgId,
        name: newRule.name,
        description: newRule.description,
        keywords: newRule.keywords.split(',').map(k => k.trim()).filter(Boolean),
        exclude_keywords: newRule.exclude_keywords.split(',').map(k => k.trim()).filter(Boolean),
        hashtags: newRule.hashtags.split(',').map(h => h.trim()).filter(Boolean),
        mentions: newRule.mentions.split(',').map(m => m.trim()).filter(Boolean),
        platforms: newRule.platforms,
        languages: newRule.languages,
        auto_create_lead: newRule.auto_create_lead,
        notification_enabled: newRule.notification_enabled,
        lead_qualification_score: newRule.lead_qualification_score,
        is_active: true,
        check_frequency_minutes: 15,
        created_by: 'current-user-id'
      };

      const createdRule = await socialListeningService.createListeningRule(ruleData);
      if (createdRule) {
        console.log('✅ Listening rule created:', createdRule);
        setListeningRules([createdRule, ...listeningRules]);
        setShowCreateRule(false);
        setNewRule({
          name: '',
          description: '',
          keywords: '',
          exclude_keywords: '',
          hashtags: '',
          mentions: '',
          platforms: ['twitter'],
          languages: ['en'],
          auto_create_lead: false,
          notification_enabled: true,
          lead_qualification_score: 50
        });
      }
    } catch (error) {
      console.error('Error creating listening rule:', error);
    }
  };

  // Dashboard Tab
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <BrandCard>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Total Mentions</p>
                  <p className="text-2xl font-bold text-white">{analytics.totalMentions}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/20">
                  <MessageCircle className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </div>
          </BrandCard>

          <BrandCard>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Leads Generated</p>
                  <p className="text-2xl font-bold text-white">{analytics.leadsGenerated}</p>
                </div>
                <div className="p-3 rounded-xl bg-green-500/20">
                  <Target className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </div>
          </BrandCard>

          <BrandCard>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Response Rate</p>
                  <p className="text-2xl font-bold text-white">{analytics.responseRate}%</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/20">
                  <Activity className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </div>
          </BrandCard>

          <BrandCard>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Avg Response Time</p>
                  <p className="text-2xl font-bold text-white">{analytics.averageResponseTime}</p>
                </div>
                <div className="p-3 rounded-xl bg-orange-500/20">
                  <Clock className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </div>
          </BrandCard>
        </div>
      )}

      {/* Sentiment Analysis */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BrandCard>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Sentiment Analysis</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-white">Positive</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-black/20 rounded-full">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ width: `${analytics.totalMentions > 0 ? (analytics.sentimentBreakdown.positive / analytics.totalMentions) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-white font-medium">{analytics.sentimentBreakdown.positive}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    <span className="text-white">Negative</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-black/20 rounded-full">
                      <div 
                        className="h-full bg-red-500 rounded-full" 
                        style={{ width: `${analytics.totalMentions > 0 ? (analytics.sentimentBreakdown.negative / analytics.totalMentions) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-white font-medium">{analytics.sentimentBreakdown.negative}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Minus className="w-4 h-4 text-blue-400" />
                    <span className="text-white">Neutral</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-black/20 rounded-full">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: `${analytics.totalMentions > 0 ? (analytics.sentimentBreakdown.neutral / analytics.totalMentions) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-white font-medium">{analytics.sentimentBreakdown.neutral}</span>
                  </div>
                </div>
              </div>
            </div>
          </BrandCard>

          <BrandCard>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Platform Breakdown</h3>
              <div className="space-y-4">
                {Object.entries(analytics.platformBreakdown).map(([platform, count]) => {
                  const PlatformIcon = getPlatformIcon(platform);
                  const percentage = analytics.totalMentions > 0 ? (count / analytics.totalMentions) * 100 : 0;
                  return (
                    <div key={platform} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <PlatformIcon className="w-4 h-4" style={{ color: getPlatformColor(platform) }} />
                        <span className="text-white capitalize">{platform}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-black/20 rounded-full">
                          <div 
                            className="h-full rounded-full" 
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: getPlatformColor(platform)
                            }}
                          ></div>
                        </div>
                        <span className="text-white font-medium">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </BrandCard>
        </div>
      )}

      {/* Recent High-Priority Mentions */}
      <BrandCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">High-Priority Mentions</h3>
            <BrandButton variant="secondary" size="sm" onClick={() => setActiveTab('mentions')}>
              View All
            </BrandButton>
          </div>
          
          <div className="space-y-4">
            {filteredMentions
              .filter(mention => mention.priority_score >= 70)
              .slice(0, 5)
              .map((mention) => {
                const PlatformIcon = getPlatformIcon(mention.platform_name);
                const SentimentIcon = getSentimentIcon(mention.sentiment);
                return (
                  <div key={mention.id} className="flex items-start space-x-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${getPlatformColor(mention.platform_name)}20` }}>
                      <PlatformIcon className="w-5 h-5" style={{ color: getPlatformColor(mention.platform_name) }} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-white">@{mention.author_username}</span>
                        <span className="text-xs text-white/50">{formatTimeAgo(mention.mention_time)}</span>
                        <BrandBadge variant={getSentimentColor(mention.sentiment)}>
                          <SentimentIcon className="w-3 h-3 mr-1" />
                          {mention.sentiment}
                        </BrandBadge>
                        <BrandBadge variant="purple">
                          {mention.priority_score}/100
                        </BrandBadge>
                      </div>
                      <p className="text-white/80 text-sm line-clamp-2">{mention.content}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-white/50">
                        <span className="flex items-center space-x-1">
                          <Heart className="w-3 h-3" />
                          <span>{mention.likes_count}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Share2 className="w-3 h-3" />
                          <span>{mention.shares_count}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MessageCircle className="w-3 h-3" />
                          <span>{mention.comments_count}</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      {mention.is_lead && (
                        <BrandBadge variant="green">
                          <Target className="w-3 h-3 mr-1" />
                          Lead
                        </BrandBadge>
                      )}
                      {mention.requires_response && (
                        <BrandBadge variant="orange">
                          <Bell className="w-3 h-3 mr-1" />
                          Response
                        </BrandBadge>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </BrandCard>
    </div>
  );

  // Mentions Tab
  const renderMentions = () => (
    <div className="space-y-6">
      {/* Filters */}
      <BrandCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Social Media Mentions</h3>
            <div className="flex items-center space-x-3">
              <BrandButton variant="secondary" onClick={loadSocialData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </BrandButton>
              <BrandButton variant="green" onClick={processListening} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Run Listening
                  </>
                )}
              </BrandButton>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-white/70" />
              <span className="text-white/70 text-sm">Platform:</span>
              <select 
                value={selectedPlatform} 
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm"
              >
                <option value="all">All Platforms</option>
                {platforms.map(platform => (
                  <option key={platform.name} value={platform.name}>{platform.label}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-white/70 text-sm">Sentiment:</span>
              <select 
                value={selectedSentiment} 
                onChange={(e) => setSelectedSentiment(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm"
              >
                <option value="all">All Sentiments</option>
                <option value="positive">Positive</option>
                <option value="negative">Negative</option>
                <option value="neutral">Neutral</option>
              </select>
            </div>
          </div>
        </div>
      </BrandCard>

      {/* Mentions List */}
      <div className="space-y-4">
        {filteredMentions.map((mention) => {
          const PlatformIcon = getPlatformIcon(mention.platform_name);
          const SentimentIcon = getSentimentIcon(mention.sentiment);
          return (
            <BrandCard key={mention.id}>
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: `${getPlatformColor(mention.platform_name)}20` }}>
                    <PlatformIcon className="w-6 h-6" style={{ color: getPlatformColor(mention.platform_name) }} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-white">{mention.author_display_name}</span>
                        <span className="text-white/70">@{mention.author_username}</span>
                        {mention.author_verified && (
                          <CheckCircle className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                      <span className="text-xs text-white/50">{formatTimeAgo(mention.mention_time)}</span>
                    </div>
                    
                    <p className="text-white mb-3">{mention.content}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-white/70">
                      <span className="flex items-center space-x-1">
                        <Heart className="w-4 h-4" />
                        <span>{mention.likes_count}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Share2 className="w-4 h-4" />
                        <span>{mention.shares_count}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{mention.comments_count}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{mention.author_follower_count.toLocaleString()} followers</span>
                      </span>
                    </div>
                    
                    {mention.hashtags.length > 0 && (
                      <div className="flex items-center space-x-2 mt-3">
                        <Hash className="w-4 h-4 text-blue-400" />
                        <div className="flex flex-wrap gap-1">
                          {mention.hashtags.map(hashtag => (
                            <BrandBadge key={hashtag} variant="blue">
                              #{hashtag}
                            </BrandBadge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2 items-end">
                    <div className="flex items-center space-x-2">
                      <BrandBadge variant={getSentimentColor(mention.sentiment)}>
                        <SentimentIcon className="w-3 h-3 mr-1" />
                        {mention.sentiment}
                      </BrandBadge>
                      <BrandBadge variant="purple">
                        {mention.priority_score}/100
                      </BrandBadge>
                    </div>
                    
                    <div className="flex flex-col space-y-1">
                      {mention.is_lead && (
                        <BrandBadge variant="green">
                          <Target className="w-3 h-3 mr-1" />
                          Lead Generated
                        </BrandBadge>
                      )}
                      {mention.requires_response && (
                        <BrandBadge variant={mention.response_status === 'pending' ? 'orange' : 'green'}>
                          <Bell className="w-3 h-3 mr-1" />
                          {mention.response_status === 'pending' ? 'Needs Response' : 'Responded'}
                        </BrandBadge>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 mt-2">
                      <BrandButton size="sm" variant="secondary">
                        <Eye className="w-4 h-4" />
                      </BrandButton>
                      <BrandButton size="sm" variant="primary">
                        <MessageSquare className="w-4 h-4" />
                      </BrandButton>
                    </div>
                  </div>
                </div>
              </div>
            </BrandCard>
          );
        })}
      </div>

      {filteredMentions.length === 0 && (
        <BrandCard>
          <div className="p-12 text-center">
            <MessageCircle className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Mentions Found</h3>
            <p className="text-white/70 mb-6">
              {selectedPlatform !== 'all' || selectedSentiment !== 'all' 
                ? 'Try adjusting your filters or run social listening to find new mentions.'
                : 'Set up listening rules and run social listening to start monitoring mentions.'
              }
            </p>
            <BrandButton variant="green" onClick={processListening}>
              <Sparkles className="w-4 h-4 mr-2" />
              Run Social Listening
            </BrandButton>
          </div>
        </BrandCard>
      )}
    </div>
  );

  // Listening Rules Tab
  const renderListeningRules = () => (
    <div className="space-y-6">
      <BrandCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Social Listening Rules</h3>
            <BrandButton variant="green" onClick={() => setShowCreateRule(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Rule
            </BrandButton>
          </div>
        </div>
      </BrandCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {listeningRules.map((rule) => (
          <BrandCard key={rule.id} borderGradient={rule.is_active ? 'green' : 'secondary'}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-white">{rule.name}</h4>
                  <p className="text-white/70 text-sm">{rule.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <BrandBadge variant={rule.is_active ? 'green' : 'secondary'}>
                    {rule.is_active ? 'Active' : 'Inactive'}
                  </BrandBadge>
                  <BrandButton size="sm" variant="secondary">
                    <Edit className="w-4 h-4" />
                  </BrandButton>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="text-white/70 text-sm">Keywords:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {rule.keywords.map(keyword => (
                      <BrandBadge key={keyword} variant="blue">
                        {keyword}
                      </BrandBadge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <span className="text-white/70 text-sm">Platforms:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {rule.platforms.map(platform => {
                      const PlatformIcon = getPlatformIcon(platform);
                      return (
                        <BrandBadge key={platform} variant="purple">
                          <PlatformIcon className="w-3 h-3 mr-1" />
                          {platform}
                        </BrandBadge>
                      );
                    })}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-white/70">
                  <span>Auto-create leads: {rule.auto_create_lead ? 'Yes' : 'No'}</span>
                  <span>Check every {rule.check_frequency_minutes}m</span>
                </div>
                
                {rule.last_checked_at && (
                  <div className="text-xs text-white/50">
                    Last checked: {formatTimeAgo(rule.last_checked_at)}
                  </div>
                )}
              </div>
            </div>
          </BrandCard>
        ))}
      </div>

      {listeningRules.length === 0 && (
        <BrandCard>
          <div className="p-12 text-center">
            <Zap className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Listening Rules</h3>
            <p className="text-white/70 mb-6">Create your first listening rule to start monitoring social media mentions.</p>
            <BrandButton variant="green" onClick={() => setShowCreateRule(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Rule
            </BrandButton>
          </div>
        </BrandCard>
      )}
    </div>
  );

  // Engagement Queue Tab
  const renderEngagementQueue = () => (
    <div className="space-y-6">
      <BrandCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Engagement Queue</h3>
            <div className="text-sm text-white/70">
              {engagementQueue.filter(item => item.status === 'pending').length} pending responses
            </div>
          </div>
        </div>
      </BrandCard>

      <div className="space-y-4">
        {engagementQueue.map((item) => (
          <BrandCard key={item.id} borderGradient={
            item.priority === 'urgent' ? 'red' : 
            item.priority === 'high' ? 'orange' : 
            item.priority === 'medium' ? 'blue' : 'secondary'
          }>
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <BrandBadge variant={
                      item.priority === 'urgent' ? 'red' : 
                      item.priority === 'high' ? 'orange' : 
                      item.priority === 'medium' ? 'blue' : 'secondary'
                    }>
                      {item.priority} priority
                    </BrandBadge>
                    <BrandBadge variant="purple">
                      {item.engagement_type}
                    </BrandBadge>
                    {item.category && (
                      <BrandBadge variant="blue">
                        {item.category}
                      </BrandBadge>
                    )}
                  </div>
                  
                  <div className="text-white/70 text-sm mb-3">
                    Created {formatTimeAgo(item.created_at)}
                    {item.response_required_by && (
                      <span className="ml-2">• Response due {formatTimeAgo(item.response_required_by)}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <BrandBadge variant={
                      item.status === 'pending' ? 'orange' :
                      item.status === 'in_progress' ? 'blue' :
                      item.status === 'responded' ? 'green' :
                      item.status === 'escalated' ? 'red' : 'secondary'
                    }>
                      {item.status.replace('_', ' ')}
                    </BrandBadge>
                    
                    {item.assigned_to && (
                      <span className="text-white/70">Assigned to: User #{item.assigned_to.slice(-4)}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <BrandButton size="sm" variant="secondary">
                    <Eye className="w-4 h-4" />
                  </BrandButton>
                  {item.status === 'pending' && (
                    <BrandButton size="sm" variant="primary">
                      <MessageSquare className="w-4 h-4" />
                    </BrandButton>
                  )}
                </div>
              </div>
            </div>
          </BrandCard>
        ))}
      </div>

      {engagementQueue.length === 0 && (
        <BrandCard>
          <div className="p-12 text-center">
            <CheckCircle className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">All Caught Up!</h3>
            <p className="text-white/70">No items in the engagement queue right now.</p>
          </div>
        </BrandCard>
      )}
    </div>
  );

  // Tab configuration
  const tabs = [
    { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { key: 'mentions', label: 'Mentions', icon: MessageCircle },
    { key: 'rules', label: 'Listening Rules', icon: Settings },
    { key: 'queue', label: 'Engagement Queue', icon: Bell }
  ];

  if (isLoading) {
    return (
      <BrandBackground>
        <BrandPageLayout title="AI Social Mentions" subtitle="Loading social media data...">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        </BrandPageLayout>
      </BrandBackground>
    );
  }

  return (
    <BrandBackground>
      <BrandPageLayout
        title="AI Social Mentions"
        subtitle="Monitor, engage, and convert across all social media platforms"
        actions={
          <div className="flex items-center space-x-3">
            <BrandButton variant="secondary">
              <Download className="w-4 h-4 mr-2" />
              Export
            </BrandButton>
            <BrandButton variant="secondary" onClick={() => setShowSettings(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </BrandButton>
            <BrandButton variant="green" onClick={processListening} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Run Listening
                </>
              )}
            </BrandButton>
          </div>
        }
      >
        {/* Tab Navigation */}
        <BrandCard className="mb-6">
          <div className="p-6">
            <div className="flex space-x-1 bg-white/5 rounded-xl p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === tab.key
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </BrandCard>

        {/* Tab Content */}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'mentions' && renderMentions()}
        {activeTab === 'rules' && renderListeningRules()}
        {activeTab === 'queue' && renderEngagementQueue()}

        {/* Create Rule Modal */}
        {showCreateRule && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <BrandCard borderGradient="green" className="w-full max-w-4xl max-h-[90vh] flex flex-col">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Create Social Listening Rule</h3>
                  <button onClick={() => setShowCreateRule(false)} className="text-white/70 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Rule Name *</label>
                    <input
                      type="text"
                      value={newRule.name}
                      onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                      placeholder="e.g., Brand Mentions"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Description</label>
                    <input
                      type="text"
                      value={newRule.description}
                      onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                      placeholder="Rule description"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Keywords (comma-separated) *</label>
                    <input
                      type="text"
                      value={newRule.keywords}
                      onChange={(e) => setNewRule({ ...newRule, keywords: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                      placeholder="e.g., YourBrand, product name, competitor"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Exclude Keywords (comma-separated)</label>
                    <input
                      type="text"
                      value={newRule.exclude_keywords}
                      onChange={(e) => setNewRule({ ...newRule, exclude_keywords: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                      placeholder="e.g., spam, irrelevant terms"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Hashtags (comma-separated)</label>
                    <input
                      type="text"
                      value={newRule.hashtags}
                      onChange={(e) => setNewRule({ ...newRule, hashtags: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                      placeholder="e.g., #brandname, #industry"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Mentions (comma-separated)</label>
                    <input
                      type="text"
                      value={newRule.mentions}
                      onChange={(e) => setNewRule({ ...newRule, mentions: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                      placeholder="e.g., @yourbrand, @competitor"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Platforms</label>
                    <div className="space-y-2">
                      {platforms.map(platform => (
                        <label key={platform.name} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={newRule.platforms.includes(platform.name)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewRule({ ...newRule, platforms: [...newRule.platforms, platform.name] });
                              } else {
                                setNewRule({ ...newRule, platforms: newRule.platforms.filter(p => p !== platform.name) });
                              }
                            }}
                            className="rounded border-white/20 bg-white/10"
                          />
                          <span className="text-white text-sm">{platform.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Lead Qualification Score</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={newRule.lead_qualification_score}
                      onChange={(e) => setNewRule({ ...newRule, lead_qualification_score: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-white/70">
                      <span>0</span>
                      <span className="font-medium">{newRule.lead_qualification_score}</span>
                      <span>100</span>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 space-y-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newRule.auto_create_lead}
                        onChange={(e) => setNewRule({ ...newRule, auto_create_lead: e.target.checked })}
                        className="rounded border-white/20 bg-white/10"
                      />
                      <span className="text-white text-sm">Automatically create leads from qualified mentions</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newRule.notification_enabled}
                        onChange={(e) => setNewRule({ ...newRule, notification_enabled: e.target.checked })}
                        className="rounded border-white/20 bg-white/10"
                      />
                      <span className="text-white text-sm">Enable notifications for new mentions</span>
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-6">
                  <div className="text-white/70 text-sm">
                    This rule will monitor social media for the specified terms and conditions.
                  </div>
                  <div className="flex space-x-3">
                    <BrandButton variant="secondary" onClick={() => setShowCreateRule(false)}>
                      Cancel
                    </BrandButton>
                    <BrandButton 
                      variant="green" 
                      onClick={handleCreateRule}
                      disabled={!newRule.name || !newRule.keywords}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Rule
                    </BrandButton>
                  </div>
                </div>
              </div>
            </BrandCard>
          </div>
        )}

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <BrandCard borderGradient="blue" className="w-full max-w-4xl max-h-[90vh] flex flex-col">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">AI Social Mentions Settings</h3>
                  <button onClick={() => setShowSettings(false)} className="text-white/70 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="max-h-[60vh] overflow-y-auto space-y-6">
                  {/* Platform Configuration */}
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Platform Configuration</h4>
                    {platforms.map(platform => (
                      <div key={platform.name} className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <platform.icon className="w-5 h-5" style={{ color: platform.color }} />
                            <span className="text-white font-medium">{platform.label}</span>
                          </div>
                          <label className="flex items-center space-x-2">
                            <input type="checkbox" defaultChecked className="rounded border-white/20 bg-white/10" />
                            <span className="text-white/70 text-sm">Enabled</span>
                          </label>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-white/70 text-xs mb-1">API Key</label>
                            <input
                              type="password"
                              placeholder="Enter API key"
                              className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-white/70 text-xs mb-1">Rate Limit (per hour)</label>
                            <input
                              type="number"
                              defaultValue={300}
                              className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Notification Settings */}
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Notification Settings</h4>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded border-white/20 bg-white/10" />
                        <span className="text-white text-sm">Email notifications for high-priority mentions</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded border-white/20 bg-white/10" />
                        <span className="text-white text-sm">Browser push notifications</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded border-white/20 bg-white/10" />
                        <span className="text-white text-sm">Slack integration</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded border-white/20 bg-white/10" />
                        <span className="text-white text-sm">Teams integration</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Data & Privacy */}
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Data & Privacy</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-white/70 text-sm mb-2">Data Retention Period</label>
                        <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white">
                          <option value="30">30 days</option>
                          <option value="90">90 days</option>
                          <option value="180">6 months</option>
                          <option value="365">1 year</option>
                        </select>
                      </div>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded border-white/20 bg-white/10" />
                        <span className="text-white text-sm">Anonymize personal data after retention period</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded border-white/20 bg-white/10" />
                        <span className="text-white text-sm">GDPR compliance mode</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Advanced Settings */}
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Advanced Settings</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/70 text-sm mb-2">Default Check Frequency</label>
                        <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white">
                          <option value="5">Every 5 minutes</option>
                          <option value="15">Every 15 minutes</option>
                          <option value="30">Every 30 minutes</option>
                          <option value="60">Every hour</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-2">Sentiment Analysis Provider</label>
                        <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white">
                          <option value="openai">OpenAI GPT</option>
                          <option value="azure">Azure Cognitive</option>
                          <option value="aws">AWS Comprehend</option>
                          <option value="google">Google Cloud NL</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-6">
                  <div className="text-white/70 text-sm">
                    Settings are automatically saved when changed
                  </div>
                  <div className="flex space-x-3">
                    <BrandButton variant="secondary" onClick={() => setShowSettings(false)}>
                      Close
                    </BrandButton>
                    <BrandButton variant="blue" onClick={() => {
                      console.log('Settings saved');
                      setShowSettings(false);
                    }}>
                      <Settings className="w-4 h-4 mr-2" />
                      Save Settings
                    </BrandButton>
                  </div>
                </div>
              </div>
            </BrandCard>
          </div>
        )}
      </BrandPageLayout>
    </BrandBackground>
  );
};

export default SocialCRM;
