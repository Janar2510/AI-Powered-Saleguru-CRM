import React, { useState, useEffect } from 'react';
import {
  Target,
  Users,
  MessageCircle,
  TrendingUp,
  Filter,
  Search,
  Plus,
  Eye,
  CheckCircle,
  X,
  Star,
  Clock,
  ArrowRight,
  Sparkles,
  Zap,
  Heart,
  Share2,
  AlertTriangle,
  Award,
  Activity,
  Globe,
  MapPin,
  ExternalLink,
  UserPlus,
  Mail,
  Phone,
  Send
} from 'lucide-react';
import { BrandCard, BrandButton, BrandBadge } from '../../contexts/BrandDesignContext';
import { socialListeningService, SocialMention } from '../../services/socialListeningService';

interface LeadOpportunity {
  id: string;
  mention: SocialMention;
  leadScore: number;
  conversionProbability: number;
  qualificationReasons: string[];
  suggestedActions: string[];
  contactInfo?: {
    estimatedEmail?: string;
    linkedinProfile?: string;
    companyDomain?: string;
  };
  isConverted: boolean;
  convertedAt?: string;
}

interface SocialLeadGeneratorProps {
  orgId: string;
  onLeadGenerated?: (leadData: any) => void;
}

const SocialLeadGenerator: React.FC<SocialLeadGeneratorProps> = ({
  orgId,
  onLeadGenerated
}) => {
  const [leadOpportunities, setLeadOpportunities] = useState<LeadOpportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<LeadOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [minLeadScore, setMinLeadScore] = useState<number>(50);
  const [showConvertModal, setShowConvertModal] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  // Lead qualification keywords
  const qualificationKeywords = {
    intent: ['looking for', 'need', 'want', 'searching', 'seeking', 'require', 'help with'],
    buying: ['buy', 'purchase', 'pricing', 'cost', 'price', 'budget', 'invest in'],
    comparison: ['vs', 'versus', 'compare', 'alternative', 'better than', 'instead of'],
    problem: ['problem', 'issue', 'challenge', 'struggle', 'difficult', 'frustrated'],
    recommendation: ['recommend', 'suggest', 'advice', 'opinions', 'thoughts', 'best'],
    timing: ['now', 'urgent', 'asap', 'immediately', 'this week', 'this month', 'soon']
  };

  // Industry indicators
  const industryIndicators = {
    saas: ['saas', 'software', 'platform', 'app', 'tool', 'solution', 'system'],
    ecommerce: ['ecommerce', 'store', 'shop', 'retail', 'sales', 'customers'],
    marketing: ['marketing', 'advertising', 'campaigns', 'leads', 'conversion'],
    finance: ['finance', 'accounting', 'invoicing', 'payments', 'billing'],
    hr: ['hr', 'hiring', 'recruitment', 'employees', 'team', 'staff']
  };

  useEffect(() => {
    loadLeadOpportunities();
  }, [orgId]);

  useEffect(() => {
    filterOpportunities();
  }, [leadOpportunities, selectedPlatform, minLeadScore]);

  const loadLeadOpportunities = async () => {
    setIsLoading(true);
    try {
      // Get recent mentions that could be leads
      const mentions = await socialListeningService.getRecentMentions(orgId, 100);
      
      // Analyze mentions for lead potential
      const opportunities: LeadOpportunity[] = [];
      
      for (const mention of mentions) {
        const leadAnalysis = await analyzeMentionForLead(mention);
        
        if (leadAnalysis.leadScore >= 30) { // Minimum threshold for consideration
          opportunities.push({
            id: `lead_${mention.id}`,
            mention,
            leadScore: leadAnalysis.leadScore,
            conversionProbability: leadAnalysis.conversionProbability,
            qualificationReasons: leadAnalysis.qualificationReasons,
            suggestedActions: leadAnalysis.suggestedActions,
            contactInfo: await enrichContactInfo(mention),
            isConverted: mention.is_lead,
            convertedAt: mention.is_lead ? mention.created_at : undefined
          });
        }
      }

      // Sort by lead score descending
      opportunities.sort((a, b) => b.leadScore - a.leadScore);
      
      setLeadOpportunities(opportunities);
      console.log(`🎯 Found ${opportunities.length} lead opportunities`);
    } catch (error) {
      console.error('Error loading lead opportunities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeMentionForLead = async (mention: SocialMention): Promise<{
    leadScore: number;
    conversionProbability: number;
    qualificationReasons: string[];
    suggestedActions: string[];
  }> => {
    let score = 0;
    const reasons: string[] = [];
    const actions: string[] = [];
    const content = mention.content.toLowerCase();

    // Intent analysis
    const intentMatches = qualificationKeywords.intent.filter(keyword => content.includes(keyword));
    if (intentMatches.length > 0) {
      score += 25;
      reasons.push(`Shows buying intent: "${intentMatches.join(', ')}"`);
      actions.push('Respond with helpful resources');
    }

    // Buying signals
    const buyingMatches = qualificationKeywords.buying.filter(keyword => content.includes(keyword));
    if (buyingMatches.length > 0) {
      score += 30;
      reasons.push(`Strong buying signals: "${buyingMatches.join(', ')}"`);
      actions.push('Share pricing information');
    }

    // Comparison queries
    const comparisonMatches = qualificationKeywords.comparison.filter(keyword => content.includes(keyword));
    if (comparisonMatches.length > 0) {
      score += 20;
      reasons.push(`Comparing solutions: "${comparisonMatches.join(', ')}"`);
      actions.push('Provide competitive comparison');
    }

    // Problem indicators
    const problemMatches = qualificationKeywords.problem.filter(keyword => content.includes(keyword));
    if (problemMatches.length > 0) {
      score += 15;
      reasons.push(`Has pain points: "${problemMatches.join(', ')}"`);
      actions.push('Offer solution consultation');
    }

    // Recommendation requests
    const recommendationMatches = qualificationKeywords.recommendation.filter(keyword => content.includes(keyword));
    if (recommendationMatches.length > 0) {
      score += 20;
      reasons.push(`Seeking recommendations: "${recommendationMatches.join(', ')}"`);
      actions.push('Provide testimonials and case studies');
    }

    // Timing urgency
    const timingMatches = qualificationKeywords.timing.filter(keyword => content.includes(keyword));
    if (timingMatches.length > 0) {
      score += 15;
      reasons.push(`Time-sensitive need: "${timingMatches.join(', ')}"`);
      actions.push('Schedule immediate demo');
    }

    // Industry relevance
    let industryMatch = false;
    Object.entries(industryIndicators).forEach(([industry, keywords]) => {
      const matches = keywords.filter(keyword => content.includes(keyword));
      if (matches.length > 0 && !industryMatch) {
        score += 10;
        reasons.push(`Relevant industry (${industry}): "${matches.join(', ')}"`);
        actions.push('Share industry-specific use cases');
        industryMatch = true;
      }
    });

    // Social proof factors
    if (mention.author_follower_count > 1000) {
      score += 10;
      reasons.push(`Influential user (${mention.author_follower_count.toLocaleString()} followers)`);
      actions.push('Personalized outreach from senior team member');
    }

    if (mention.author_verified) {
      score += 5;
      reasons.push('Verified account holder');
    }

    // Engagement quality
    const totalEngagement = mention.likes_count + mention.shares_count + mention.comments_count;
    if (totalEngagement > 10) {
      score += 8;
      reasons.push(`High engagement post (${totalEngagement} interactions)`);
      actions.push('Join the conversation publicly');
    }

    // Negative sentiment adjustment
    if (mention.sentiment === 'negative') {
      score += 5; // Negative can be opportunity if they're looking for alternatives
      reasons.push('Negative sentiment - potential switching opportunity');
      actions.push('Address concerns and offer better solution');
    }

    // Direct mention bonus
    if (mention.mention_type === 'mention') {
      score += 15;
      reasons.push('Direct mention of your brand');
      actions.push('Respond directly and professionally');
    }

    // Calculate conversion probability based on multiple factors
    let conversionProbability = Math.min(90, score * 0.8);
    
    // Adjust based on qualification strength
    if (buyingMatches.length > 0 && intentMatches.length > 0) {
      conversionProbability += 10;
    }
    
    if (timingMatches.length > 0 && (buyingMatches.length > 0 || intentMatches.length > 0)) {
      conversionProbability += 15;
    }

    // Default actions if none specified
    if (actions.length === 0) {
      actions.push('Monitor for follow-up opportunities');
      actions.push('Add to nurture campaign');
    }

    return {
      leadScore: Math.min(100, score),
      conversionProbability: Math.min(95, Math.round(conversionProbability)),
      qualificationReasons: reasons,
      suggestedActions: actions
    };
  };

  const enrichContactInfo = async (mention: SocialMention): Promise<{
    estimatedEmail?: string;
    linkedinProfile?: string;
    companyDomain?: string;
  }> => {
    const enriched: any = {};

    // Try to find LinkedIn profile if Twitter mention
    if (mention.platform_name === 'twitter' && mention.author_username) {
      // Mock LinkedIn discovery (in real app, use tools like Hunter.io, Apollo, etc.)
      enriched.linkedinProfile = `https://linkedin.com/in/${mention.author_username}`;
    }

    // Estimate email if we can infer company
    if (mention.author_display_name && mention.content.includes('at ')) {
      const companyMatch = mention.content.match(/at ([A-Za-z\s]+)/);
      if (companyMatch) {
        const company = companyMatch[1].trim().toLowerCase().replace(/\s+/g, '');
        enriched.companyDomain = `${company}.com`;
        enriched.estimatedEmail = `${mention.author_username}@${company}.com`;
      }
    }

    return enriched;
  };

  const filterOpportunities = () => {
    let filtered = leadOpportunities;

    // Platform filter
    if (selectedPlatform !== 'all') {
      filtered = filtered.filter(opp => opp.mention.platform_name === selectedPlatform);
    }

    // Lead score filter
    filtered = filtered.filter(opp => opp.leadScore >= minLeadScore);

    setFilteredOpportunities(filtered);
  };

  const convertToLead = async (opportunity: LeadOpportunity) => {
    setIsConverting(true);
    try {
      const leadData = {
        name: opportunity.mention.author_display_name || opportunity.mention.author_username || 'Social Media Lead',
        email: opportunity.contactInfo?.estimatedEmail,
        source: `social_${opportunity.mention.platform_name}`,
        status: 'new',
        lead_score: opportunity.leadScore,
        notes: `Generated from ${opportunity.mention.platform_name} mention: "${opportunity.mention.content}"`,
        social_mention_id: opportunity.mention.id,
        qualification_reasons: opportunity.qualificationReasons,
        suggested_actions: opportunity.suggestedActions,
        social_profile_url: opportunity.mention.platform_name === 'twitter' 
          ? `https://twitter.com/${opportunity.mention.author_username}`
          : opportunity.contactInfo?.linkedinProfile,
        follower_count: opportunity.mention.author_follower_count,
        is_verified: opportunity.mention.author_verified,
        conversion_probability: opportunity.conversionProbability
      };

      // Mock lead creation (replace with actual API call)
      console.log('🎯 Converting social mention to lead:', leadData);
      
      // Update the opportunity as converted
      setLeadOpportunities(opportunities => 
        opportunities.map(opp => 
          opp.id === opportunity.id 
            ? { ...opp, isConverted: true, convertedAt: new Date().toISOString() }
            : opp
        )
      );

      if (onLeadGenerated) {
        onLeadGenerated(leadData);
      }

      setShowConvertModal(null);
      console.log('✅ Lead generated successfully');
    } catch (error) {
      console.error('Error converting to lead:', error);
    } finally {
      setIsConverting(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return MessageCircle;
      case 'linkedin': return Users;
      case 'facebook': return MessageCircle;
      case 'instagram': return Heart;
      default: return Globe;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'twitter': return '#1DA1F2';
      case 'linkedin': return '#0077B5';
      case 'facebook': return '#1877F2';
      case 'instagram': return '#E4405F';
      default: return '#6B7280';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'red';
    if (score >= 60) return 'orange';
    if (score >= 40) return 'blue';
    return 'secondary';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <BrandCard>
        <div className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        </div>
      </BrandCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <BrandCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Target className="w-6 h-6 text-green-400" />
              <div>
                <h2 className="text-xl font-semibold text-white">Social Lead Generator</h2>
                <p className="text-white/70">AI-powered lead identification from social media mentions</p>
              </div>
            </div>
            <BrandButton variant="green" onClick={loadLeadOpportunities}>
              <Sparkles className="w-4 h-4 mr-2" />
              Refresh Opportunities
            </BrandButton>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="text-2xl font-bold text-white">{filteredOpportunities.length}</div>
              <div className="text-xs text-white/70">Total Opportunities</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-green-500/10 border border-green-500/20">
              <div className="text-2xl font-bold text-white">
                {filteredOpportunities.filter(o => o.leadScore >= 70).length}
              </div>
              <div className="text-xs text-white/70">High Quality</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <div className="text-2xl font-bold text-white">
                {filteredOpportunities.filter(o => !o.isConverted).length}
              </div>
              <div className="text-xs text-white/70">Unconverted</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div className="text-2xl font-bold text-white">
                {Math.round(filteredOpportunities.reduce((sum, o) => sum + o.conversionProbability, 0) / (filteredOpportunities.length || 1))}%
              </div>
              <div className="text-xs text-white/70">Avg Conversion Rate</div>
            </div>
          </div>

          {/* Filters */}
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
                <option value="twitter">Twitter/X</option>
                <option value="linkedin">LinkedIn</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-white/70 text-sm">Min Score:</span>
              <input
                type="range"
                min="0"
                max="100"
                value={minLeadScore}
                onChange={(e) => setMinLeadScore(parseInt(e.target.value))}
                className="w-20"
              />
              <span className="text-white text-sm font-medium">{minLeadScore}</span>
            </div>
          </div>
        </div>
      </BrandCard>

      {/* Lead Opportunities */}
      <div className="space-y-4">
        {filteredOpportunities.map((opportunity) => {
          const PlatformIcon = getPlatformIcon(opportunity.mention.platform_name);
          
          return (
            <BrandCard 
              key={opportunity.id} 
              borderGradient={opportunity.isConverted ? 'green' : getScoreColor(opportunity.leadScore) as any}
            >
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Platform Icon */}
                  <div 
                    className="p-3 rounded-xl flex-shrink-0" 
                    style={{ backgroundColor: `${getPlatformColor(opportunity.mention.platform_name)}20` }}
                  >
                    <PlatformIcon 
                      className="w-6 h-6" 
                      style={{ color: getPlatformColor(opportunity.mention.platform_name) }} 
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-white">
                          {opportunity.mention.author_display_name || opportunity.mention.author_username}
                        </span>
                        <span className="text-white/70">@{opportunity.mention.author_username}</span>
                        {opportunity.mention.author_verified && (
                          <CheckCircle className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                      <span className="text-xs text-white/50">{formatTimeAgo(opportunity.mention.mention_time)}</span>
                    </div>
                    
                    {/* Mention Content */}
                    <p className="text-white mb-4">{opportunity.mention.content}</p>
                    
                    {/* Lead Analysis */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-4">
                        <BrandBadge variant={getScoreColor(opportunity.leadScore)}>
                          <Star className="w-3 h-3 mr-1" />
                          Score: {opportunity.leadScore}/100
                        </BrandBadge>
                        <BrandBadge variant="blue">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {opportunity.conversionProbability}% Conversion
                        </BrandBadge>
                        <BrandBadge variant="purple">
                          <Users className="w-3 h-3 mr-1" />
                          {opportunity.mention.author_follower_count.toLocaleString()} followers
                        </BrandBadge>
                      </div>
                      
                      {/* Qualification Reasons */}
                      <div>
                        <h5 className="text-white/70 text-sm font-medium mb-2">Qualification Reasons:</h5>
                        <div className="space-y-1">
                          {opportunity.qualificationReasons.slice(0, 3).map((reason, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                              <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                              <span className="text-white/80">{reason}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Suggested Actions */}
                      <div>
                        <h5 className="text-white/70 text-sm font-medium mb-2">Suggested Actions:</h5>
                        <div className="flex flex-wrap gap-1">
                          {opportunity.suggestedActions.slice(0, 2).map((action, index) => (
                            <BrandBadge key={index} variant="secondary">
                              <Zap className="w-3 h-3 mr-1" />
                              {action}
                            </BrandBadge>
                          ))}
                        </div>
                      </div>
                      
                      {/* Contact Info */}
                      {opportunity.contactInfo && Object.keys(opportunity.contactInfo).length > 0 && (
                        <div className="flex items-center space-x-4 text-sm text-white/70">
                          {opportunity.contactInfo.estimatedEmail && (
                            <span className="flex items-center space-x-1">
                              <Mail className="w-3 h-3" />
                              <span>{opportunity.contactInfo.estimatedEmail}</span>
                            </span>
                          )}
                          {opportunity.contactInfo.linkedinProfile && (
                            <span className="flex items-center space-x-1">
                              <ExternalLink className="w-3 h-3" />
                              <span>LinkedIn</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-col space-y-2">
                    <BrandButton 
                      size="sm" 
                      variant="secondary" 
                      onClick={() => window.open(`https://${opportunity.mention.platform_name}.com/${opportunity.mention.author_username}`, '_blank')}
                    >
                      <Eye className="w-4 h-4" />
                    </BrandButton>
                    
                    {!opportunity.isConverted ? (
                      <BrandButton 
                        size="sm" 
                        variant="green" 
                        onClick={() => setShowConvertModal(opportunity.id)}
                      >
                        <UserPlus className="w-4 h-4" />
                      </BrandButton>
                    ) : (
                      <BrandBadge variant="green">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Converted
                      </BrandBadge>
                    )}
                  </div>
                </div>
              </div>
            </BrandCard>
          );
        })}
      </div>

      {/* Convert to Lead Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          {(() => {
            const opportunity = filteredOpportunities.find(o => o.id === showConvertModal);
            if (!opportunity) return null;
            
            return (
              <BrandCard borderGradient="green" className="w-full max-w-2xl">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Convert to Lead</h3>
                    <button onClick={() => setShowConvertModal(null)} className="text-white/70 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Opportunity Summary */}
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center space-x-3 mb-3">
                        <BrandBadge variant={getScoreColor(opportunity.leadScore)}>
                          Lead Score: {opportunity.leadScore}/100
                        </BrandBadge>
                        <BrandBadge variant="blue">
                          {opportunity.conversionProbability}% Conversion Probability
                        </BrandBadge>
                      </div>
                      <p className="text-white/80 text-sm mb-3">"{opportunity.mention.content}"</p>
                      <div className="flex items-center space-x-2 text-xs text-white/60">
                        <span>by @{opportunity.mention.author_username}</span>
                        <span>•</span>
                        <span>{opportunity.mention.author_follower_count.toLocaleString()} followers</span>
                        <span>•</span>
                        <span>{formatTimeAgo(opportunity.mention.mention_time)}</span>
                      </div>
                    </div>
                    
                    {/* Lead Details Preview */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/70 text-sm mb-2">Name</label>
                        <div className="text-white">
                          {opportunity.mention.author_display_name || opportunity.mention.author_username}
                        </div>
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-2">Source</label>
                        <div className="text-white capitalize">social_{opportunity.mention.platform_name}</div>
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-2">Estimated Email</label>
                        <div className="text-white/70">
                          {opportunity.contactInfo?.estimatedEmail || 'Not available'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-2">Status</label>
                        <div className="text-white">New Lead</div>
                      </div>
                    </div>
                    
                    {/* Qualification Summary */}
                    <div>
                      <h4 className="text-white font-medium mb-2">Qualification Summary</h4>
                      <ul className="space-y-1">
                        {opportunity.qualificationReasons.map((reason, index) => (
                          <li key={index} className="flex items-center space-x-2 text-sm text-white/80">
                            <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Next Steps */}
                    <div>
                      <h4 className="text-white font-medium mb-2">Suggested Next Steps</h4>
                      <ul className="space-y-1">
                        {opportunity.suggestedActions.map((action, index) => (
                          <li key={index} className="flex items-center space-x-2 text-sm text-white/80">
                            <ArrowRight className="w-3 h-3 text-blue-400 flex-shrink-0" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-white/70 text-sm">
                      This will create a new lead in your CRM with all the social context.
                    </div>
                    <div className="flex space-x-3">
                      <BrandButton variant="secondary" onClick={() => setShowConvertModal(null)}>
                        Cancel
                      </BrandButton>
                      <BrandButton 
                        variant="green" 
                        onClick={() => convertToLead(opportunity)}
                        disabled={isConverting}
                      >
                        {isConverting ? (
                          <>
                            <Clock className="w-4 h-4 mr-2 animate-spin" />
                            Converting...
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Convert to Lead
                          </>
                        )}
                      </BrandButton>
                    </div>
                  </div>
                </div>
              </BrandCard>
            );
          })()}
        </div>
      )}

      {/* Empty State */}
      {filteredOpportunities.length === 0 && !isLoading && (
        <BrandCard>
          <div className="p-12 text-center">
            <Target className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Lead Opportunities</h3>
            <p className="text-white/70 mb-6">
              No qualifying social media mentions found. Try adjusting your filters or running social listening to find new opportunities.
            </p>
            <BrandButton variant="green" onClick={loadLeadOpportunities}>
              <Sparkles className="w-4 h-4 mr-2" />
              Refresh Opportunities
            </BrandButton>
          </div>
        </BrandCard>
      )}
    </div>
  );
};

export default SocialLeadGenerator;


