export interface SocialMention {
  id: string;
  source: 'twitter' | 'linkedin' | 'facebook' | 'instagram';
  mention_id: string;
  author: string;
  content: string;
  mention_time: string;
  contact_id?: string;
  url?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  created_at: string;
  updated_at: string;
}

export interface SocialProfile {
  platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram';
  handle?: string;
  url?: string;
  user_id?: string;
}

export interface ContactSocialData {
  twitter_handle?: string;
  linkedin_url?: string;
  facebook_url?: string;
  instagram_handle?: string;
}

export interface SocialMentionFilters {
  source?: string;
  contact_id?: string;
  author?: string;
  sentiment?: string;
  date_from?: string;
  date_to?: string;
}

export interface TwitterMentionData {
  id: string;
  author_id: string;
  text: string;
  created_at: string;
} 