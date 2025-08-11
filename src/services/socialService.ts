import { supabase } from './supabase';
import { SocialMention, SocialMentionFilters } from '../types/social';

export class SocialService {
  /**
   * Fetch social mentions with optional filters
   */
  static async getMentions(filters: SocialMentionFilters = {}, limit = 50): Promise<SocialMention[]> {
    let query = supabase
      .from('social_mentions')
      .select('*')
      .order('mention_time', { ascending: false })
      .limit(limit);

    // Apply filters
    if (filters.source) {
      query = query.eq('source', filters.source);
    }
    if (filters.contact_id) {
      query = query.eq('contact_id', filters.contact_id);
    }
    if (filters.author) {
      query = query.ilike('author', `%${filters.author}%`);
    }
    if (filters.sentiment) {
      query = query.eq('sentiment', filters.sentiment);
    }
    if (filters.date_from) {
      query = query.gte('mention_time', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('mention_time', filters.date_to);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching social mentions:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get mentions for a specific contact
   */
  static async getContactMentions(contactId: string, limit = 10): Promise<SocialMention[]> {
    const { data, error } = await supabase
      .from('social_mentions')
      .select('*')
      .eq('contact_id', contactId)
      .order('mention_time', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching contact mentions:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get mentions by author (useful for finding mentions from unknown contacts)
   */
  static async getMentionsByAuthor(author: string, limit = 20): Promise<SocialMention[]> {
    const { data, error } = await supabase
      .from('social_mentions')
      .select('*')
      .ilike('author', `%${author}%`)
      .order('mention_time', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching mentions by author:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get recent mentions (last 24 hours)
   */
  static async getRecentMentions(hours = 24, limit = 50): Promise<SocialMention[]> {
    const dateFrom = new Date();
    dateFrom.setHours(dateFrom.getHours() - hours);

    const { data, error } = await supabase
      .from('social_mentions')
      .select('*')
      .gte('mention_time', dateFrom.toISOString())
      .order('mention_time', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent mentions:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get mention statistics
   */
  static async getMentionStats() {
    const { data, error } = await supabase
      .from('social_mentions')
      .select('source, sentiment, mention_time');

    if (error) {
      console.error('Error fetching mention stats:', error);
      throw error;
    }

    const stats = {
      total: data?.length || 0,
      bySource: {} as Record<string, number>,
      bySentiment: {} as Record<string, number>,
      recent24h: 0,
      recent7d: 0
    };

    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    data?.forEach(mention => {
      // Count by source
      stats.bySource[mention.source] = (stats.bySource[mention.source] || 0) + 1;
      
      // Count by sentiment
      if (mention.sentiment) {
        stats.bySentiment[mention.sentiment] = (stats.bySentiment[mention.sentiment] || 0) + 1;
      }

      // Count recent mentions
      const mentionTime = new Date(mention.mention_time);
      if (mentionTime >= dayAgo) {
        stats.recent24h++;
      }
      if (mentionTime >= weekAgo) {
        stats.recent7d++;
      }
    });

    return stats;
  }

  /**
   * Update contact's social media handles
   */
  static async updateContactSocialData(contactId: string, socialData: {
    twitter_handle?: string;
    linkedin_url?: string;
    facebook_url?: string;
    instagram_handle?: string;
  }) {
    const { error } = await supabase
      .from('contacts')
      .update(socialData)
      .eq('id', contactId);

    if (error) {
      console.error('Error updating contact social data:', error);
      throw error;
    }
  }

  /**
   * Link existing mentions to a contact
   */
  static async linkMentionsToContact(contactId: string, author: string) {
    const { error } = await supabase
      .from('social_mentions')
      .update({ contact_id: contactId })
      .eq('author', author)
      .is('contact_id', null);

    if (error) {
      console.error('Error linking mentions to contact:', error);
      throw error;
    }
  }
} 