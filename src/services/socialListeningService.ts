// Social Listening Service
// Comprehensive service for monitoring social media mentions, extracting insights, and generating leads

import { supabase } from './supabase';

// Types and Interfaces
export interface SocialPlatform {
  id: string;
  name: string;
  display_name: string;
  icon: string;
  color: string;
  api_base_url?: string;
  api_version?: string;
  requires_oauth: boolean;
  webhook_support: boolean;
  rate_limit_per_hour: number;
  supports_mentions: boolean;
  supports_profiles: boolean;
  supports_posts: boolean;
  supports_direct_messages: boolean;
  supports_lead_generation: boolean;
  is_active: boolean;
  is_configured: boolean;
  created_at: string;
  updated_at: string;
}

export interface SocialMention {
  id: string;
  org_id: string;
  platform_id: string;
  platform_name: string;
  mention_id: string;
  author_id?: string;
  author_username?: string;
  author_display_name?: string;
  author_avatar_url?: string;
  author_follower_count: number;
  author_verified: boolean;
  content: string;
  content_type: 'text' | 'image' | 'video' | 'link';
  language: string;
  likes_count: number;
  shares_count: number;
  comments_count: number;
  retweets_count: number;
  mention_type: 'mention' | 'hashtag' | 'keyword' | 'brand';
  sentiment?: 'positive' | 'negative' | 'neutral';
  confidence_score?: number;
  keywords: string[];
  hashtags: string[];
  urls: string[];
  location_name?: string;
  coordinates?: { x: number; y: number };
  parent_mention_id?: string;
  thread_id?: string;
  is_reply: boolean;
  reply_to_username?: string;
  is_processed: boolean;
  is_relevant: boolean;
  is_lead: boolean;
  is_customer_service: boolean;
  requires_response: boolean;
  priority_score: number;
  contact_id?: string;
  lead_id?: string;
  deal_id?: string;
  assigned_to?: string;
  response_status: 'pending' | 'responded' | 'ignored' | 'escalated';
  responded_at?: string;
  responded_by?: string;
  response_content?: string;
  mention_time: string;
  created_at: string;
  updated_at: string;
}

export interface SocialListeningRule {
  id: string;
  org_id: string;
  name: string;
  description?: string;
  keywords: string[];
  exclude_keywords: string[];
  hashtags: string[];
  mentions: string[];
  platforms: string[];
  languages: string[];
  locations: string[];
  min_follower_count: number;
  require_verified: boolean;
  sentiment_filter: string[];
  auto_create_lead: boolean;
  auto_assign_to?: string;
  notification_enabled: boolean;
  notification_channels: string[];
  lead_qualification_score: number;
  lead_source: string;
  lead_tags: string[];
  is_active: boolean;
  check_frequency_minutes: number;
  last_checked_at?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface SocialEngagementItem {
  id: string;
  org_id: string;
  mention_id?: string;
  post_id?: string;
  platform_id: string;
  engagement_type: 'mention' | 'dm' | 'comment' | 'review';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: 'support' | 'sales' | 'general' | 'complaint' | 'compliment';
  assigned_to?: string;
  assigned_at?: string;
  team_id?: string;
  status: 'pending' | 'in_progress' | 'responded' | 'escalated' | 'closed';
  response_required_by?: string;
  first_response_time?: string;
  resolution_time?: string;
  response_content?: string;
  response_platform_id?: string;
  responded_at?: string;
  responded_by?: string;
  escalated_to?: string;
  escalated_at?: string;
  escalation_reason?: string;
  customer_satisfaction_score?: number;
  customer_feedback?: string;
  created_at: string;
  updated_at: string;
}

// Twitter API Integration (mock implementation - replace with actual API calls)
class TwitterListeningService {
  private bearerToken: string;
  private baseUrl = 'https://api.twitter.com/2';

  constructor(bearerToken: string) {
    this.bearerToken = bearerToken;
  }

  async searchMentions(keywords: string[], excludeKeywords: string[] = []): Promise<any[]> {
    try {
      // Construct search query
      const includeQuery = keywords.map(k => `"${k}"`).join(' OR ');
      const excludeQuery = excludeKeywords.length > 0 
        ? ' -' + excludeKeywords.map(k => `"${k}"`).join(' -')
        : '';
      const query = encodeURIComponent(includeQuery + excludeQuery);

      // Mock API response (replace with actual fetch in production)
      const mockTweets = [
        {
          id: '1234567890',
          text: `Love using ${keywords[0]}! It's made our workflow so much better. #productivity #saas`,
          author_id: 'user123',
          created_at: new Date().toISOString(),
          public_metrics: {
            like_count: 15,
            retweet_count: 3,
            reply_count: 2,
            quote_count: 1
          },
          author: {
            id: 'user123',
            username: 'productivitypro',
            name: 'Sarah Johnson',
            verified: false,
            public_metrics: {
              followers_count: 1250,
              following_count: 890
            }
          }
        },
        {
          id: '1234567891',
          text: `Anyone know a good alternative to ${keywords[0]}? Having some issues with their support.`,
          author_id: 'user124',
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
          public_metrics: {
            like_count: 5,
            retweet_count: 1,
            reply_count: 8,
            quote_count: 0
          },
          author: {
            id: 'user124',
            username: 'techleader',
            name: 'Mike Chen',
            verified: true,
            public_metrics: {
              followers_count: 5600,
              following_count: 1200
            }
          }
        }
      ];

      console.log(`🐦 Mock Twitter API: Found ${mockTweets.length} mentions for keywords: ${keywords.join(', ')}`);
      return mockTweets;
    } catch (error) {
      console.error('Error fetching Twitter mentions:', error);
      return [];
    }
  }
}

// LinkedIn API Integration (mock implementation)
class LinkedInListeningService {
  private accessToken: string;
  private baseUrl = 'https://api.linkedin.com/v2';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async searchPosts(keywords: string[]): Promise<any[]> {
    try {
      // Mock LinkedIn posts
      const mockPosts = [
        {
          id: 'urn:li:share:1234567890',
          text: `Excited to announce we're implementing ${keywords[0]} in our sales process! The ROI has been incredible. #sales #technology`,
          author: {
            id: 'person123',
            firstName: 'Jennifer',
            lastName: 'Williams',
            headline: 'VP of Sales at TechCorp'
          },
          created: {
            time: Date.now() - 2 * 60 * 60 * 1000 // 2 hours ago
          },
          ugcPost: {
            socialDetail: {
              totalSocialActivityCounts: {
                numLikes: 24,
                numComments: 6,
                numShares: 3
              }
            }
          }
        }
      ];

      console.log(`💼 Mock LinkedIn API: Found ${mockPosts.length} posts for keywords: ${keywords.join(', ')}`);
      return mockPosts;
    } catch (error) {
      console.error('Error fetching LinkedIn posts:', error);
      return [];
    }
  }
}

// Facebook/Instagram API Integration (mock implementation)
class FacebookListeningService {
  private accessToken: string;
  private baseUrl = 'https://graph.facebook.com';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async searchPosts(keywords: string[]): Promise<any[]> {
    try {
      // Mock Facebook posts
      const mockPosts = [
        {
          id: '123456789_987654321',
          message: `Just discovered ${keywords[0]} and it's a game changer for our business! Highly recommend to other entrepreneurs. 🚀`,
          created_time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
          from: {
            id: '123456789',
            name: 'Business Growth Hub'
          },
          likes: {
            summary: {
              total_count: 42
            }
          },
          comments: {
            summary: {
              total_count: 8
            }
          },
          shares: {
            count: 5
          }
        }
      ];

      console.log(`📘 Mock Facebook API: Found ${mockPosts.length} posts for keywords: ${keywords.join(', ')}`);
      return mockPosts;
    } catch (error) {
      console.error('Error fetching Facebook posts:', error);
      return [];
    }
  }
}

// Main Social Listening Service
class SocialListeningService {
  private twitterService?: TwitterListeningService;
  private linkedinService?: LinkedInListeningService;
  private facebookService?: FacebookListeningService;

  constructor() {
    // Initialize API services with credentials from environment
    // Note: In production, these would come from secure environment variables
    const twitterToken = 'mock-twitter-token';
    const linkedinToken = 'mock-linkedin-token';
    const facebookToken = 'mock-facebook-token';

    this.twitterService = new TwitterListeningService(twitterToken);
    this.linkedinService = new LinkedInListeningService(linkedinToken);
    this.facebookService = new FacebookListeningService(facebookToken);
  }

  /**
   * Get all social platforms
   */
  async getSocialPlatforms(): Promise<SocialPlatform[]> {
    try {
      const { data, error } = await supabase
        .from('social_platforms')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching social platforms:', error);
      return [];
    }
  }

  /**
   * Get social listening rules for an organization
   */
  async getListeningRules(orgId: string): Promise<SocialListeningRule[]> {
    try {
      const { data, error } = await supabase
        .from('social_listening_rules')
        .select('*')
        .eq('org_id', orgId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching listening rules:', error);
      return [];
    }
  }

  /**
   * Create a new social listening rule
   */
  async createListeningRule(rule: Partial<SocialListeningRule>): Promise<SocialListeningRule | null> {
    try {
      const { data, error } = await supabase
        .from('social_listening_rules')
        .insert([rule])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating listening rule:', error);
      return null;
    }
  }

  /**
   * Process social listening for all active rules
   */
  async processSocialListening(orgId: string): Promise<void> {
    try {
      console.log(`🔍 Starting social listening for organization: ${orgId}`);
      
      const rules = await this.getListeningRules(orgId);
      console.log(`📋 Found ${rules.length} active listening rules`);

      for (const rule of rules) {
        try {
          await this.processListeningRule(rule);
          
          // Update last checked time
          await supabase
            .from('social_listening_rules')
            .update({ last_checked_at: new Date().toISOString() })
            .eq('id', rule.id);
            
        } catch (error) {
          console.error(`Error processing rule ${rule.name}:`, error);
        }
      }
      
      console.log('✅ Social listening processing completed');
    } catch (error) {
      console.error('Error in social listening process:', error);
    }
  }

  /**
   * Process a single listening rule
   */
  private async processListeningRule(rule: SocialListeningRule): Promise<void> {
    console.log(`🎯 Processing rule: ${rule.name}`);
    console.log(`📝 Keywords: ${rule.keywords.join(', ')}`);
    console.log(`📱 Platforms: ${rule.platforms.join(', ')}`);

    const allMentions: any[] = [];

    // Process each platform
    for (const platform of rule.platforms) {
      try {
        let mentions: any[] = [];

        switch (platform) {
          case 'twitter':
            if (this.twitterService) {
              mentions = await this.twitterService.searchMentions(rule.keywords, rule.exclude_keywords);
            }
            break;
          case 'linkedin':
            if (this.linkedinService) {
              mentions = await this.linkedinService.searchPosts(rule.keywords);
            }
            break;
          case 'facebook':
          case 'instagram':
            if (this.facebookService) {
              mentions = await this.facebookService.searchPosts(rule.keywords);
            }
            break;
        }

        // Transform platform-specific mentions to our format
        const transformedMentions = mentions.map(mention => 
          this.transformMentionToStandardFormat(mention, platform, rule.org_id)
        );

        allMentions.push(...transformedMentions);
      } catch (error) {
        console.error(`Error processing platform ${platform}:`, error);
      }
    }

    console.log(`📊 Found ${allMentions.length} total mentions`);

    // Process and store mentions
    for (const mention of allMentions) {
      try {
        await this.processMention(mention, rule);
      } catch (error) {
        console.error(`Error processing mention ${mention.mention_id}:`, error);
      }
    }
  }

  /**
   * Transform platform-specific mention to standard format
   */
  private transformMentionToStandardFormat(mention: any, platform: string, orgId: string): Partial<SocialMention> {
    let standardMention: Partial<SocialMention> = {
      org_id: orgId,
      platform_name: platform,
      is_processed: false,
      is_relevant: true,
      is_lead: false,
      is_customer_service: false,
      requires_response: false,
      priority_score: 0,
      response_status: 'pending',
      is_reply: false,
      content_type: 'text',
      language: 'en',
      likes_count: 0,
      shares_count: 0,
      comments_count: 0,
      retweets_count: 0,
      author_follower_count: 0,
      author_verified: false,
      keywords: [],
      hashtags: [],
      urls: []
    };

    switch (platform) {
      case 'twitter':
        standardMention = {
          ...standardMention,
          mention_id: mention.id,
          content: mention.text,
          author_id: mention.author_id,
          author_username: mention.author?.username,
          author_display_name: mention.author?.name,
          author_verified: mention.author?.verified || false,
          author_follower_count: mention.author?.public_metrics?.followers_count || 0,
          likes_count: mention.public_metrics?.like_count || 0,
          shares_count: mention.public_metrics?.retweet_count || 0,
          comments_count: mention.public_metrics?.reply_count || 0,
          retweets_count: mention.public_metrics?.retweet_count || 0,
          mention_time: mention.created_at,
          mention_type: mention.text.includes('@') ? 'mention' : 'keyword'
        };
        break;

      case 'linkedin':
        standardMention = {
          ...standardMention,
          mention_id: mention.id,
          content: mention.text,
          author_display_name: `${mention.author?.firstName} ${mention.author?.lastName}`,
          likes_count: mention.ugcPost?.socialDetail?.totalSocialActivityCounts?.numLikes || 0,
          shares_count: mention.ugcPost?.socialDetail?.totalSocialActivityCounts?.numShares || 0,
          comments_count: mention.ugcPost?.socialDetail?.totalSocialActivityCounts?.numComments || 0,
          mention_time: new Date(mention.created?.time).toISOString(),
          mention_type: 'keyword'
        };
        break;

      case 'facebook':
      case 'instagram':
        standardMention = {
          ...standardMention,
          mention_id: mention.id,
          content: mention.message,
          author_display_name: mention.from?.name,
          likes_count: mention.likes?.summary?.total_count || 0,
          shares_count: mention.shares?.count || 0,
          comments_count: mention.comments?.summary?.total_count || 0,
          mention_time: mention.created_time,
          mention_type: 'keyword'
        };
        break;
    }

    return standardMention;
  }

  /**
   * Process and analyze a mention
   */
  private async processMention(mention: Partial<SocialMention>, rule: SocialListeningRule): Promise<void> {
    try {
      // Check if mention already exists
      const { data: existingMention } = await supabase
        .from('social_mentions')
        .select('id')
        .eq('platform_name', mention.platform_name)
        .eq('mention_id', mention.mention_id)
        .eq('org_id', mention.org_id)
        .single();

      if (existingMention) {
        console.log(`⏭️  Mention ${mention.mention_id} already exists, skipping`);
        return;
      }

      // Analyze sentiment and extract entities
      const sentimentResult = await this.analyzeSentiment(mention.content || '');
      const entities = await this.extractEntities(mention.content || '');
      
      // Calculate priority and relevance scores
      const priorityScore = this.calculatePriorityScore(mention, rule);
      const isLead = this.shouldCreateLead(mention, rule, priorityScore);
      const requiresResponse = this.shouldRequireResponse(mention, sentimentResult.sentiment);

      // Enhance mention with analysis
      const enhancedMention: Partial<SocialMention> = {
        ...mention,
        sentiment: sentimentResult.sentiment,
        confidence_score: sentimentResult.confidence,
        keywords: entities.keywords,
        hashtags: entities.hashtags,
        urls: entities.urls,
        priority_score: priorityScore,
        is_lead: isLead,
        requires_response: requiresResponse,
        is_customer_service: sentimentResult.sentiment === 'negative' || mention.content?.toLowerCase().includes('support'),
        is_processed: true
      };

      // Store mention in database
      const { data: storedMention, error } = await supabase
        .from('social_mentions')
        .insert([enhancedMention])
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ Stored mention: ${mention.mention_id} (Score: ${priorityScore}, Lead: ${isLead})`);

      // Create lead if qualified
      if (isLead && rule.auto_create_lead) {
        await this.createLeadFromMention(storedMention, rule);
      }

      // Add to engagement queue if response required
      if (requiresResponse) {
        await this.addToEngagementQueue(storedMention, rule);
      }

      // Send notifications if enabled
      if (rule.notification_enabled && (isLead || requiresResponse || priorityScore > 70)) {
        await this.sendNotification(storedMention, rule);
      }

    } catch (error) {
      console.error('Error processing mention:', error);
    }
  }

  /**
   * Analyze sentiment of content
   */
  private async analyzeSentiment(content: string): Promise<{ sentiment: 'positive' | 'negative' | 'neutral'; confidence: number }> {
    // Simple keyword-based sentiment analysis (replace with AI service in production)
    const positiveKeywords = ['love', 'great', 'awesome', 'amazing', 'excellent', 'fantastic', 'perfect', 'best', 'wonderful', 'recommend'];
    const negativeKeywords = ['hate', 'terrible', 'awful', 'worst', 'horrible', 'bad', 'sucks', 'disappointed', 'angry', 'frustrated', 'problem', 'issue'];

    const lowerContent = content.toLowerCase();
    const positiveCount = positiveKeywords.filter(word => lowerContent.includes(word)).length;
    const negativeCount = negativeKeywords.filter(word => lowerContent.includes(word)).length;

    if (positiveCount > negativeCount) {
      return { sentiment: 'positive', confidence: Math.min(0.95, 0.6 + positiveCount * 0.1) };
    } else if (negativeCount > positiveCount) {
      return { sentiment: 'negative', confidence: Math.min(0.95, 0.6 + negativeCount * 0.1) };
    } else {
      return { sentiment: 'neutral', confidence: 0.6 };
    }
  }

  /**
   * Extract entities from content
   */
  private async extractEntities(content: string): Promise<{ keywords: string[]; hashtags: string[]; urls: string[] }> {
    const hashtagRegex = /#(\w+)/g;
    const urlRegex = /https?:\/\/[^\s]+/g;
    const wordRegex = /\b\w{4,}\b/g;

    const hashtags = [...content.matchAll(hashtagRegex)].map(match => match[1]);
    const urls = [...content.matchAll(urlRegex)].map(match => match[0]);
    const words = [...content.matchAll(wordRegex)].map(match => match[0].toLowerCase());
    
    // Filter out common words for keywords
    const commonWords = ['this', 'that', 'with', 'have', 'will', 'been', 'from', 'they', 'were', 'said', 'each', 'which', 'their', 'time', 'would', 'there', 'could', 'other', 'more', 'very', 'what', 'know', 'just', 'first', 'into', 'over', 'think', 'also', 'your', 'work', 'life', 'only', 'still', 'should', 'after', 'being', 'made', 'before', 'here', 'through', 'when', 'where', 'much', 'some', 'these', 'people', 'take', 'than', 'them', 'well'];
    const keywords = words.filter(word => !commonWords.includes(word) && word.length > 3);

    return { keywords, hashtags, urls };
  }

  /**
   * Calculate priority score for a mention
   */
  private calculatePriorityScore(mention: Partial<SocialMention>, rule: SocialListeningRule): number {
    let score = 0;

    // Base score from follower count
    if (mention.author_follower_count) {
      if (mention.author_follower_count > 100000) score += 40;
      else if (mention.author_follower_count > 10000) score += 30;
      else if (mention.author_follower_count > 1000) score += 20;
      else score += 10;
    }

    // Verified account bonus
    if (mention.author_verified) score += 20;

    // Engagement bonus
    const totalEngagement = (mention.likes_count || 0) + (mention.shares_count || 0) + (mention.comments_count || 0);
    if (totalEngagement > 100) score += 20;
    else if (totalEngagement > 10) score += 10;
    else if (totalEngagement > 0) score += 5;

    // Keyword relevance bonus
    const contentLower = (mention.content || '').toLowerCase();
    const keywordMatches = rule.keywords.filter(keyword => contentLower.includes(keyword.toLowerCase())).length;
    score += keywordMatches * 5;

    // Negative sentiment urgency
    if (mention.sentiment === 'negative') score += 15;

    // Direct mention bonus
    if (mention.mention_type === 'mention') score += 15;

    return Math.min(100, score);
  }

  /**
   * Determine if mention should create a lead
   */
  private shouldCreateLead(mention: Partial<SocialMention>, rule: SocialListeningRule, priorityScore: number): boolean {
    if (!rule.auto_create_lead) return false;
    if (priorityScore < rule.lead_qualification_score) return false;
    
    // Check for lead-indicating keywords
    const contentLower = (mention.content || '').toLowerCase();
    const leadKeywords = ['looking for', 'need', 'want', 'buy', 'purchase', 'solution', 'alternative', 'recommend', 'suggestion'];
    const hasLeadKeywords = leadKeywords.some(keyword => contentLower.includes(keyword));
    
    return hasLeadKeywords || priorityScore > 75;
  }

  /**
   * Determine if mention requires response
   */
  private shouldRequireResponse(mention: Partial<SocialMention>, sentiment?: string): boolean {
    if (mention.mention_type === 'mention') return true; // Direct mentions always need response
    if (sentiment === 'negative') return true; // Negative sentiment needs attention
    
    const contentLower = (mention.content || '').toLowerCase();
    const responseKeywords = ['help', 'support', 'question', 'problem', 'issue', 'how to', 'why'];
    return responseKeywords.some(keyword => contentLower.includes(keyword));
  }

  /**
   * Create lead from qualified mention
   */
  private async createLeadFromMention(mention: SocialMention, rule: SocialListeningRule): Promise<void> {
    try {
      const leadData = {
        org_id: mention.org_id,
        name: mention.author_display_name || mention.author_username || 'Social Media Lead',
        email: null, // Email not available from social mentions
        phone: null,
        company: null,
        title: null,
        source: rule.lead_source,
        status: 'new',
        notes: `Lead generated from ${mention.platform_name} mention: "${mention.content}"`,
        tags: rule.lead_tags,
        lead_score: mention.priority_score,
        social_mention_id: mention.id,
        created_at: new Date().toISOString()
      };

      const { data: lead, error } = await supabase
        .from('leads')
        .insert([leadData])
        .select()
        .single();

      if (error) throw error;

      // Update mention with lead reference
      await supabase
        .from('social_mentions')
        .update({ lead_id: lead.id })
        .eq('id', mention.id);

      console.log(`🎯 Created lead from mention: ${mention.mention_id} -> Lead ID: ${lead.id}`);

    } catch (error) {
      console.error('Error creating lead from mention:', error);
    }
  }

  /**
   * Add mention to engagement queue
   */
  private async addToEngagementQueue(mention: SocialMention, rule: SocialListeningRule): Promise<void> {
    try {
      const queueItem = {
        org_id: mention.org_id,
        mention_id: mention.id,
        platform_id: mention.platform_id,
        engagement_type: mention.mention_type === 'mention' ? 'mention' : 'comment',
        priority: mention.priority_score > 80 ? 'high' : mention.priority_score > 60 ? 'medium' : 'low',
        category: mention.is_customer_service ? 'support' : mention.is_lead ? 'sales' : 'general',
        assigned_to: rule.auto_assign_to,
        status: 'pending',
        response_required_by: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('social_engagement_queue')
        .insert([queueItem]);

      if (error) throw error;

      console.log(`📋 Added mention to engagement queue: ${mention.mention_id}`);

    } catch (error) {
      console.error('Error adding to engagement queue:', error);
    }
  }

  /**
   * Send notification for important mentions
   */
  private async sendNotification(mention: SocialMention, rule: SocialListeningRule): Promise<void> {
    try {
      // Mock notification (replace with actual notification service)
      console.log(`🔔 NOTIFICATION: New ${mention.platform_name} mention detected!`);
      console.log(`   Author: ${mention.author_display_name} (@${mention.author_username})`);
      console.log(`   Content: "${mention.content}"`);
      console.log(`   Priority: ${mention.priority_score}/100`);
      console.log(`   Sentiment: ${mention.sentiment}`);
      console.log(`   Lead: ${mention.is_lead ? 'Yes' : 'No'}`);
      console.log(`   Response Required: ${mention.requires_response ? 'Yes' : 'No'}`);

      // In production, send actual notifications via email, Slack, Teams, etc.
      for (const channel of rule.notification_channels) {
        switch (channel) {
          case 'email':
            // await emailService.sendNotification(...);
            break;
          case 'slack':
            // await slackService.sendMessage(...);
            break;
          case 'teams':
            // await teamsService.sendMessage(...);
            break;
        }
      }

    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  /**
   * Get recent social mentions
   */
  async getRecentMentions(
    orgId: string, 
    limit: number = 50, 
    platform?: string,
    sentiment?: string
  ): Promise<SocialMention[]> {
    try {
      let query = supabase
        .from('social_mentions')
        .select('*')
        .eq('org_id', orgId)
        .order('mention_time', { ascending: false })
        .limit(limit);

      if (platform) {
        query = query.eq('platform_name', platform);
      }

      if (sentiment) {
        query = query.eq('sentiment', sentiment);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recent mentions:', error);
      return [];
    }
  }

  /**
   * Get engagement queue items
   */
  async getEngagementQueue(
    orgId: string,
    status?: string,
    assignedTo?: string
  ): Promise<SocialEngagementItem[]> {
    try {
      let query = supabase
        .from('social_engagement_queue')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      if (assignedTo) {
        query = query.eq('assigned_to', assignedTo);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching engagement queue:', error);
      return [];
    }
  }

  /**
   * Update engagement queue item
   */
  async updateEngagementItem(
    itemId: string,
    updates: Partial<SocialEngagementItem>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('social_engagement_queue')
        .update(updates)
        .eq('id', itemId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating engagement item:', error);
      return false;
    }
  }

  /**
   * Get social listening analytics
   */
  async getListeningAnalytics(orgId: string, days: number = 30): Promise<{
    totalMentions: number;
    sentimentBreakdown: { positive: number; negative: number; neutral: number };
    platformBreakdown: { [platform: string]: number };
    leadsGenerated: number;
    responseRate: number;
    averageResponseTime: string;
  }> {
    try {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);

      const { data: mentions, error } = await supabase
        .from('social_mentions')
        .select('platform_name, sentiment, is_lead, requires_response, responded_at, mention_time')
        .eq('org_id', orgId)
        .gte('mention_time', fromDate.toISOString());

      if (error) throw error;

      const totalMentions = mentions?.length || 0;
      const sentimentBreakdown = {
        positive: mentions?.filter(m => m.sentiment === 'positive').length || 0,
        negative: mentions?.filter(m => m.sentiment === 'negative').length || 0,
        neutral: mentions?.filter(m => m.sentiment === 'neutral').length || 0
      };

      const platformBreakdown = mentions?.reduce((acc, mention) => {
        acc[mention.platform_name] = (acc[mention.platform_name] || 0) + 1;
        return acc;
      }, {} as { [platform: string]: number }) || {};

      const leadsGenerated = mentions?.filter(m => m.is_lead).length || 0;
      const responsesRequired = mentions?.filter(m => m.requires_response).length || 0;
      const responsesGiven = mentions?.filter(m => m.requires_response && m.responded_at).length || 0;
      const responseRate = responsesRequired > 0 ? (responsesGiven / responsesRequired) * 100 : 0;

      // Calculate average response time
      const responseTimes = mentions
        ?.filter(m => m.requires_response && m.responded_at)
        .map(m => new Date(m.responded_at!).getTime() - new Date(m.mention_time).getTime()) || [];
      
      const averageResponseTimeMs = responseTimes.length > 0 
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
        : 0;
      
      const averageResponseTime = averageResponseTimeMs > 0 
        ? `${Math.round(averageResponseTimeMs / (1000 * 60 * 60))}h ${Math.round((averageResponseTimeMs % (1000 * 60 * 60)) / (1000 * 60))}m`
        : 'N/A';

      return {
        totalMentions,
        sentimentBreakdown,
        platformBreakdown,
        leadsGenerated,
        responseRate: Math.round(responseRate * 100) / 100,
        averageResponseTime
      };

    } catch (error) {
      console.error('Error fetching listening analytics:', error);
      return {
        totalMentions: 0,
        sentimentBreakdown: { positive: 0, negative: 0, neutral: 0 },
        platformBreakdown: {},
        leadsGenerated: 0,
        responseRate: 0,
        averageResponseTime: 'N/A'
      };
    }
  }
}

// Singleton instance
export const socialListeningService = new SocialListeningService();

export default SocialListeningService;
