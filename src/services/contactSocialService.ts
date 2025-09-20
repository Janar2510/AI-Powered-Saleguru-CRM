// Contact Social Service
// Service for managing social media profiles linked to CRM contacts

import { supabase } from './supabase';

// Types
export interface ContactSocialProfile {
  id: string;
  contact_id: string;
  platform_id: string;
  org_id: string;
  platform_user_id?: string;
  username: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  profile_url?: string;
  follower_count: number;
  following_count: number;
  posts_count: number;
  is_verified: boolean;
  account_type: 'personal' | 'business' | 'organization';
  location?: string;
  website_url?: string;
  joined_date?: string;
  last_post_date?: string;
  avg_engagement_rate: number;
  influence_score: number;
  is_private: boolean;
  is_verified_by_us: boolean;
  verification_method?: 'manual' | 'api' | 'oauth';
  verified_at?: string;
  verified_by?: string;
  is_active: boolean;
  last_updated: string;
  created_at: string;
  updated_at: string;
}

export interface SocialPost {
  id: string;
  org_id: string;
  platform_id: string;
  contact_social_profile_id?: string;
  platform_post_id: string;
  author_id?: string;
  author_username?: string;
  author_display_name?: string;
  content?: string;
  content_type: 'text' | 'image' | 'video' | 'link' | 'poll';
  media_urls: string[];
  link_url?: string;
  link_title?: string;
  link_description?: string;
  likes_count: number;
  shares_count: number;
  comments_count: number;
  hashtags: string[];
  mentions: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
  is_business_relevant: boolean;
  relevance_score: number;
  sales_opportunity_score: number;
  posted_at: string;
  created_at: string;
  updated_at: string;
}

export interface SocialInsight {
  contact_id: string;
  platform_breakdown: { [platform: string]: number };
  total_followers: number;
  total_posts: number;
  avg_engagement_rate: number;
  influence_score: number;
  last_activity_date?: string;
  top_hashtags: string[];
  recent_sentiment: 'positive' | 'negative' | 'neutral';
  business_opportunities: number;
}

class ContactSocialService {
  /**
   * Get social profiles for a contact
   */
  async getContactSocialProfiles(contactId: string): Promise<ContactSocialProfile[]> {
    try {
      const { data, error } = await supabase
        .from('contact_social_profiles')
        .select('*')
        .eq('contact_id', contactId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching contact social profiles:', error);
      return [];
    }
  }

  /**
   * Add a social profile to a contact
   */
  async addSocialProfile(
    contactId: string,
    orgId: string,
    profileData: Partial<ContactSocialProfile>
  ): Promise<ContactSocialProfile | null> {
    try {
      const profile = {
        contact_id: contactId,
        org_id: orgId,
        ...profileData,
        influence_score: await this.calculateInfluenceScore({
          follower_count: profileData.follower_count || 0,
          following_count: profileData.following_count || 0,
          posts_count: profileData.posts_count || 0,
          avg_engagement_rate: profileData.avg_engagement_rate || 0,
          is_verified: profileData.is_verified || false
        }),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('contact_social_profiles')
        .insert([profile])
        .select()
        .single();

      if (error) throw error;

      // Log the addition for audit trail
      console.log(`✅ Social profile added for contact ${contactId}:`, data);

      return data;
    } catch (error) {
      console.error('Error adding social profile:', error);
      return null;
    }
  }

  /**
   * Update a social profile
   */
  async updateSocialProfile(
    profileId: string,
    updates: Partial<ContactSocialProfile>
  ): Promise<ContactSocialProfile | null> {
    try {
      // Recalculate influence score if relevant fields updated
      if (updates.follower_count !== undefined || 
          updates.following_count !== undefined ||
          updates.avg_engagement_rate !== undefined) {
        
        const { data: currentProfile } = await supabase
          .from('contact_social_profiles')
          .select('follower_count, following_count, posts_count, avg_engagement_rate, is_verified')
          .eq('id', profileId)
          .single();

        if (currentProfile) {
          updates.influence_score = await this.calculateInfluenceScore({
            follower_count: updates.follower_count ?? currentProfile.follower_count,
            following_count: updates.following_count ?? currentProfile.following_count,
            posts_count: updates.posts_count ?? currentProfile.posts_count,
            avg_engagement_rate: updates.avg_engagement_rate ?? currentProfile.avg_engagement_rate,
            is_verified: updates.is_verified ?? currentProfile.is_verified
          });
        }
      }

      const { data, error } = await supabase
        .from('contact_social_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', profileId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating social profile:', error);
      return null;
    }
  }

  /**
   * Delete a social profile
   */
  async deleteSocialProfile(profileId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('contact_social_profiles')
        .update({ is_active: false })
        .eq('id', profileId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting social profile:', error);
      return false;
    }
  }

  /**
   * Verify a social profile
   */
  async verifySocialProfile(
    profileId: string,
    verificationMethod: 'manual' | 'api' | 'oauth',
    verifiedBy: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('contact_social_profiles')
        .update({
          is_verified_by_us: true,
          verification_method: verificationMethod,
          verified_at: new Date().toISOString(),
          verified_by: verifiedBy,
          updated_at: new Date().toISOString()
        })
        .eq('id', profileId);

      if (error) throw error;

      console.log(`✅ Social profile verified: ${profileId} by ${verifiedBy}`);
      return true;
    } catch (error) {
      console.error('Error verifying social profile:', error);
      return false;
    }
  }

  /**
   * Calculate influence score based on profile metrics
   */
  private async calculateInfluenceScore(metrics: {
    follower_count: number;
    following_count: number;
    posts_count: number;
    avg_engagement_rate: number;
    is_verified: boolean;
  }): Promise<number> {
    let score = 0;

    // Base score from followers (logarithmic scale)
    if (metrics.follower_count > 0) {
      score += Math.min(50, Math.log10(metrics.follower_count + 1) * 10);
    }

    // Engagement rate bonus (0-25 points)
    if (metrics.avg_engagement_rate > 0) {
      score += Math.min(25, metrics.avg_engagement_rate * 2.5);
    }

    // Follower to following ratio (good ratio = 5-15 points)
    if (metrics.following_count > 0 && metrics.follower_count > metrics.following_count) {
      const ratio = metrics.follower_count / metrics.following_count;
      if (ratio > 2) {
        score += Math.min(15, ratio / 2);
      }
    }

    // Activity bonus (regular posting = 5 points)
    if (metrics.posts_count > 100) {
      score += 5;
    }

    // Verification bonus
    if (metrics.is_verified) {
      score += 10;
    }

    return Math.min(100, Math.round(score));
  }

  /**
   * Get social posts for a contact's profiles
   */
  async getContactSocialPosts(
    contactId: string,
    limit: number = 20,
    platform?: string
  ): Promise<SocialPost[]> {
    try {
      // First get the contact's social profiles
      const profiles = await this.getContactSocialProfiles(contactId);
      const profileIds = profiles.map(p => p.id);

      if (profileIds.length === 0) return [];

      let query = supabase
        .from('social_posts')
        .select('*')
        .in('contact_social_profile_id', profileIds)
        .order('posted_at', { ascending: false })
        .limit(limit);

      if (platform) {
        const platformProfiles = profiles.filter(p => p.platform_id === platform);
        const platformProfileIds = platformProfiles.map(p => p.id);
        query = query.in('contact_social_profile_id', platformProfileIds);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching contact social posts:', error);
      return [];
    }
  }

  /**
   * Get social insights for a contact
   */
  async getContactSocialInsights(contactId: string): Promise<SocialInsight | null> {
    try {
      const profiles = await this.getContactSocialProfiles(contactId);
      
      if (profiles.length === 0) {
        return null;
      }

      const posts = await this.getContactSocialPosts(contactId, 50);

      // Calculate platform breakdown
      const platformBreakdown = profiles.reduce((acc, profile) => {
        acc[profile.platform_id] = (acc[profile.platform_id] || 0) + 1;
        return acc;
      }, {} as { [platform: string]: number });

      // Calculate totals
      const totalFollowers = profiles.reduce((sum, p) => sum + p.follower_count, 0);
      const totalPosts = profiles.reduce((sum, p) => sum + p.posts_count, 0);
      const avgEngagementRate = profiles.length > 0 
        ? profiles.reduce((sum, p) => sum + p.avg_engagement_rate, 0) / profiles.length 
        : 0;
      const influenceScore = profiles.length > 0
        ? profiles.reduce((sum, p) => sum + p.influence_score, 0) / profiles.length
        : 0;

      // Find last activity
      const lastActivityDate = profiles
        .map(p => p.last_post_date)
        .filter(Boolean)
        .sort()
        .pop();

      // Extract top hashtags
      const allHashtags = posts.flatMap(p => p.hashtags);
      const hashtagCounts = allHashtags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {} as { [tag: string]: number });
      const topHashtags = Object.entries(hashtagCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([tag]) => tag);

      // Calculate recent sentiment
      const recentPosts = posts.slice(0, 10);
      const sentimentCounts = recentPosts.reduce((acc, post) => {
        if (post.sentiment) {
          acc[post.sentiment] = (acc[post.sentiment] || 0) + 1;
        }
        return acc;
      }, {} as { [sentiment: string]: number });
      
      const recentSentiment = Object.entries(sentimentCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] as 'positive' | 'negative' | 'neutral' || 'neutral';

      // Count business opportunities
      const businessOpportunities = posts.filter(p => p.is_business_relevant && p.sales_opportunity_score > 70).length;

      return {
        contact_id: contactId,
        platform_breakdown: platformBreakdown,
        total_followers: totalFollowers,
        total_posts: totalPosts,
        avg_engagement_rate: Math.round(avgEngagementRate * 100) / 100,
        influence_score: Math.round(influenceScore),
        last_activity_date: lastActivityDate,
        top_hashtags: topHashtags,
        recent_sentiment: recentSentiment,
        business_opportunities: businessOpportunities
      };

    } catch (error) {
      console.error('Error calculating social insights:', error);
      return null;
    }
  }

  /**
   * Find contacts by social username
   */
  async findContactsBySocialUsername(
    username: string,
    platform?: string,
    orgId?: string
  ): Promise<ContactSocialProfile[]> {
    try {
      let query = supabase
        .from('contact_social_profiles')
        .select(`
          *,
          contacts!inner(id, name, email, company)
        `)
        .ilike('username', `%${username}%`)
        .eq('is_active', true);

      if (platform) {
        query = query.eq('platform_id', platform);
      }

      if (orgId) {
        query = query.eq('org_id', orgId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error finding contacts by social username:', error);
      return [];
    }
  }

  /**
   * Sync social profile data from API (mock implementation)
   */
  async syncSocialProfile(profileId: string): Promise<boolean> {
    try {
      // Get current profile
      const { data: profile, error } = await supabase
        .from('contact_social_profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (error || !profile) throw new Error('Profile not found');

      // Mock API sync (replace with actual API calls)
      const mockUpdates = {
        follower_count: profile.follower_count + Math.floor(Math.random() * 100),
        following_count: profile.following_count + Math.floor(Math.random() * 10),
        posts_count: profile.posts_count + Math.floor(Math.random() * 5),
        avg_engagement_rate: Math.max(0, profile.avg_engagement_rate + (Math.random() - 0.5) * 0.5),
        last_updated: new Date().toISOString()
      };

      console.log(`🔄 Syncing social profile ${profileId}:`, mockUpdates);

      return await this.updateSocialProfile(profileId, mockUpdates) !== null;
    } catch (error) {
      console.error('Error syncing social profile:', error);
      return false;
    }
  }

  /**
   * Import social profile from URL
   */
  async importSocialProfileFromUrl(
    contactId: string,
    orgId: string,
    profileUrl: string
  ): Promise<ContactSocialProfile | null> {
    try {
      // Parse URL to determine platform and username
      const url = new URL(profileUrl);
      let platform = '';
      let username = '';

      if (url.hostname.includes('twitter.com') || url.hostname.includes('x.com')) {
        platform = 'twitter';
        username = url.pathname.split('/')[1]?.replace('@', '');
      } else if (url.hostname.includes('linkedin.com')) {
        platform = 'linkedin';
        const pathMatch = url.pathname.match(/\/in\/([^\/]+)/);
        username = pathMatch ? pathMatch[1] : '';
      } else if (url.hostname.includes('facebook.com')) {
        platform = 'facebook';
        username = url.pathname.split('/')[1];
      } else if (url.hostname.includes('instagram.com')) {
        platform = 'instagram';
        username = url.pathname.split('/')[1];
      } else {
        throw new Error('Unsupported platform');
      }

      if (!username) {
        throw new Error('Could not extract username from URL');
      }

      // Mock profile data extraction (replace with actual scraping/API calls)
      const mockProfileData = {
        platform_id: platform,
        username: username,
        display_name: `${username} Profile`,
        profile_url: profileUrl,
        follower_count: Math.floor(Math.random() * 10000),
        following_count: Math.floor(Math.random() * 1000),
        posts_count: Math.floor(Math.random() * 500),
        is_verified: Math.random() > 0.8,
        account_type: 'personal' as const,
        avg_engagement_rate: Math.random() * 5,
        is_private: Math.random() > 0.7
      };

      console.log(`📥 Importing social profile from URL: ${profileUrl}`);

      return await this.addSocialProfile(contactId, orgId, mockProfileData);
    } catch (error) {
      console.error('Error importing social profile from URL:', error);
      return null;
    }
  }

  /**
   * Get social profile analytics
   */
  async getSocialProfileAnalytics(
    profileId: string,
    days: number = 30
  ): Promise<{
    followerGrowth: number;
    engagementTrend: 'up' | 'down' | 'stable';
    postFrequency: number;
    topContent: SocialPost[];
    sentimentTrend: { positive: number; negative: number; neutral: number };
  } | null> {
    try {
      // Mock analytics data (replace with actual tracking)
      const mockAnalytics = {
        followerGrowth: Math.floor(Math.random() * 1000) - 500, // Can be negative
        engagementTrend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
        postFrequency: Math.floor(Math.random() * 20) + 1, // Posts per week
        topContent: [], // Would be actual top performing posts
        sentimentTrend: {
          positive: Math.floor(Math.random() * 50) + 30,
          negative: Math.floor(Math.random() * 20) + 5,
          neutral: Math.floor(Math.random() * 40) + 20
        }
      };

      console.log(`📊 Analytics for profile ${profileId}:`, mockAnalytics);
      return mockAnalytics;
    } catch (error) {
      console.error('Error fetching social profile analytics:', error);
      return null;
    }
  }

  /**
   * Bulk sync all social profiles for an organization
   */
  async bulkSyncSocialProfiles(orgId: string): Promise<{
    total: number;
    synced: number;
    failed: number;
  }> {
    try {
      const { data: profiles, error } = await supabase
        .from('contact_social_profiles')
        .select('id')
        .eq('org_id', orgId)
        .eq('is_active', true);

      if (error) throw error;

      const total = profiles?.length || 0;
      let synced = 0;
      let failed = 0;

      console.log(`🔄 Starting bulk sync for ${total} social profiles...`);

      // Sync profiles in batches to avoid rate limits
      const batchSize = 5;
      for (let i = 0; i < total; i += batchSize) {
        const batch = profiles.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(async (profile) => {
            const success = await this.syncSocialProfile(profile.id);
            if (success) {
              synced++;
            } else {
              failed++;
            }
          })
        );

        // Add delay between batches to respect rate limits
        if (i + batchSize < total) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      console.log(`✅ Bulk sync completed: ${synced} synced, ${failed} failed`);

      return { total, synced, failed };
    } catch (error) {
      console.error('Error in bulk sync:', error);
      return { total: 0, synced: 0, failed: 0 };
    }
  }
}

// Singleton instance
export const contactSocialService = new ContactSocialService();

export default ContactSocialService;


