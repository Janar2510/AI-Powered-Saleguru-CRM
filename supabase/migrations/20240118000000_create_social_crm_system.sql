-- Social CRM System
-- Comprehensive database schema for social media integration, listening, and contact social profiles

-- Social platforms configuration
CREATE TABLE IF NOT EXISTS social_platforms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Platform details
    name TEXT NOT NULL UNIQUE, -- 'twitter', 'linkedin', 'facebook', 'instagram', 'youtube', etc.
    display_name TEXT NOT NULL,
    icon TEXT NOT NULL, -- Icon identifier
    color TEXT NOT NULL DEFAULT '#1DA1F2', -- Brand color
    api_base_url TEXT,
    
    -- API Configuration
    api_version TEXT,
    requires_oauth BOOLEAN DEFAULT true,
    webhook_support BOOLEAN DEFAULT false,
    rate_limit_per_hour INTEGER DEFAULT 300,
    
    -- Features supported
    supports_mentions BOOLEAN DEFAULT true,
    supports_profiles BOOLEAN DEFAULT true,
    supports_posts BOOLEAN DEFAULT true,
    supports_direct_messages BOOLEAN DEFAULT false,
    supports_lead_generation BOOLEAN DEFAULT true,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_configured BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Social mentions and listening
CREATE TABLE IF NOT EXISTS social_mentions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Platform and source
    platform_id UUID NOT NULL REFERENCES social_platforms(id) ON DELETE CASCADE,
    platform_name TEXT NOT NULL, -- Denormalized for performance
    mention_id TEXT NOT NULL, -- Platform-specific ID
    
    -- Author information
    author_id TEXT, -- Platform-specific author ID
    author_username TEXT,
    author_display_name TEXT,
    author_avatar_url TEXT,
    author_follower_count INTEGER DEFAULT 0,
    author_verified BOOLEAN DEFAULT false,
    
    -- Content
    content TEXT NOT NULL,
    content_type TEXT DEFAULT 'text', -- 'text', 'image', 'video', 'link'
    language TEXT DEFAULT 'en',
    
    -- Engagement metrics
    likes_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    retweets_count INTEGER DEFAULT 0, -- Twitter specific
    
    -- Context and metadata
    mention_type TEXT NOT NULL, -- 'mention', 'hashtag', 'keyword', 'brand'
    sentiment TEXT, -- 'positive', 'negative', 'neutral'
    confidence_score DECIMAL(3,2), -- AI sentiment confidence 0.00-1.00
    keywords TEXT[], -- Extracted keywords
    hashtags TEXT[], -- Hashtags used
    urls TEXT[], -- URLs mentioned
    
    -- Location data
    location_name TEXT,
    coordinates POINT,
    
    -- Threading and conversation
    parent_mention_id UUID REFERENCES social_mentions(id),
    thread_id TEXT, -- Platform thread identifier
    is_reply BOOLEAN DEFAULT false,
    reply_to_username TEXT,
    
    -- Processing status
    is_processed BOOLEAN DEFAULT false,
    is_relevant BOOLEAN DEFAULT true,
    is_lead BOOLEAN DEFAULT false,
    is_customer_service BOOLEAN DEFAULT false,
    requires_response BOOLEAN DEFAULT false,
    priority_score INTEGER DEFAULT 0, -- 0-100 priority score
    
    -- CRM Integration
    contact_id UUID REFERENCES contacts(id),
    lead_id UUID REFERENCES leads(id),
    deal_id UUID REFERENCES deals(id),
    assigned_to UUID REFERENCES auth.users(id),
    
    -- Response tracking
    response_status TEXT DEFAULT 'pending', -- 'pending', 'responded', 'ignored', 'escalated'
    responded_at TIMESTAMPTZ,
    responded_by UUID REFERENCES auth.users(id),
    response_content TEXT,
    
    -- Timestamps
    mention_time TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure unique mentions per platform
    UNIQUE(platform_name, mention_id, org_id)
);

-- Contact social profiles
CREATE TABLE IF NOT EXISTS contact_social_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    platform_id UUID NOT NULL REFERENCES social_platforms(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Profile information
    platform_user_id TEXT, -- Platform-specific user ID
    username TEXT NOT NULL,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    profile_url TEXT,
    
    -- Profile metrics
    follower_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    
    -- Account details
    account_type TEXT DEFAULT 'personal', -- 'personal', 'business', 'organization'
    location TEXT,
    website_url TEXT,
    joined_date DATE,
    
    -- Engagement tracking
    last_post_date TIMESTAMPTZ,
    avg_engagement_rate DECIMAL(5,2) DEFAULT 0.00,
    influence_score INTEGER DEFAULT 0, -- 0-100 influence score
    
    -- Privacy and verification
    is_private BOOLEAN DEFAULT false,
    is_verified_by_us BOOLEAN DEFAULT false,
    verification_method TEXT, -- 'manual', 'api', 'oauth'
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES auth.users(id),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure one profile per contact per platform
    UNIQUE(contact_id, platform_id)
);

-- Social posts (from contacts/leads we follow)
CREATE TABLE IF NOT EXISTS social_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Source
    platform_id UUID NOT NULL REFERENCES social_platforms(id) ON DELETE CASCADE,
    contact_social_profile_id UUID REFERENCES contact_social_profiles(id) ON DELETE CASCADE,
    platform_post_id TEXT NOT NULL,
    
    -- Author (may not be a contact)
    author_id TEXT,
    author_username TEXT,
    author_display_name TEXT,
    
    -- Content
    content TEXT,
    content_type TEXT DEFAULT 'text', -- 'text', 'image', 'video', 'link', 'poll'
    media_urls TEXT[],
    link_url TEXT,
    link_title TEXT,
    link_description TEXT,
    
    -- Engagement
    likes_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    
    -- Context
    hashtags TEXT[],
    mentions TEXT[],
    sentiment TEXT,
    
    -- CRM relevance
    is_business_relevant BOOLEAN DEFAULT false,
    relevance_score INTEGER DEFAULT 0, -- 0-100
    sales_opportunity_score INTEGER DEFAULT 0, -- 0-100
    
    -- Timestamps
    posted_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(platform_post_id, platform_id, org_id)
);

-- Social listening keywords and rules
CREATE TABLE IF NOT EXISTS social_listening_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Rule definition
    name TEXT NOT NULL,
    description TEXT,
    keywords TEXT[] NOT NULL, -- Keywords to monitor
    exclude_keywords TEXT[] DEFAULT '{}', -- Keywords to exclude
    hashtags TEXT[] DEFAULT '{}', -- Hashtags to monitor
    mentions TEXT[] DEFAULT '{}', -- Specific mentions (@username)
    
    -- Platform targeting
    platforms TEXT[] NOT NULL, -- Which platforms to monitor
    languages TEXT[] DEFAULT '{"en"}', -- Language codes
    locations TEXT[] DEFAULT '{}', -- Location filters
    
    -- Filtering criteria
    min_follower_count INTEGER DEFAULT 0,
    require_verified BOOLEAN DEFAULT false,
    sentiment_filter TEXT[], -- 'positive', 'negative', 'neutral'
    
    -- Actions
    auto_create_lead BOOLEAN DEFAULT false,
    auto_assign_to UUID REFERENCES auth.users(id),
    notification_enabled BOOLEAN DEFAULT true,
    notification_channels TEXT[] DEFAULT '{"email"}', -- 'email', 'slack', 'teams'
    
    -- Lead generation settings
    lead_qualification_score INTEGER DEFAULT 50, -- Minimum score to create lead
    lead_source TEXT DEFAULT 'social_listening',
    lead_tags TEXT[] DEFAULT '{"social", "inbound"}',
    
    -- Status and scheduling
    is_active BOOLEAN DEFAULT true,
    check_frequency_minutes INTEGER DEFAULT 15,
    last_checked_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Social engagement queue (responses needed)
CREATE TABLE IF NOT EXISTS social_engagement_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Source mention or post
    mention_id UUID REFERENCES social_mentions(id) ON DELETE CASCADE,
    post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
    platform_id UUID NOT NULL REFERENCES social_platforms(id) ON DELETE CASCADE,
    
    -- Engagement details
    engagement_type TEXT NOT NULL, -- 'mention', 'dm', 'comment', 'review'
    priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    category TEXT, -- 'support', 'sales', 'general', 'complaint', 'compliment'
    
    -- Assignment
    assigned_to UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMPTZ,
    team_id UUID, -- Reference to team table if exists
    
    -- Status tracking
    status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'responded', 'escalated', 'closed'
    response_required_by TIMESTAMPTZ,
    first_response_time INTERVAL,
    resolution_time INTERVAL,
    
    -- Response
    response_content TEXT,
    response_platform_id TEXT, -- Platform-specific response ID
    responded_at TIMESTAMPTZ,
    responded_by UUID REFERENCES auth.users(id),
    
    -- Escalation
    escalated_to UUID REFERENCES auth.users(id),
    escalated_at TIMESTAMPTZ,
    escalation_reason TEXT,
    
    -- Customer satisfaction
    customer_satisfaction_score INTEGER, -- 1-5 rating
    customer_feedback TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Social campaign tracking
CREATE TABLE IF NOT EXISTS social_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Campaign details
    name TEXT NOT NULL,
    description TEXT,
    campaign_type TEXT NOT NULL, -- 'awareness', 'lead_gen', 'customer_service', 'product_launch'
    
    -- Targeting
    target_platforms TEXT[] NOT NULL,
    target_keywords TEXT[],
    target_hashtags TEXT[],
    target_demographics JSONB DEFAULT '{}',
    
    -- Goals and metrics
    goal_type TEXT, -- 'impressions', 'engagement', 'leads', 'conversions'
    goal_value INTEGER,
    budget DECIMAL(10,2),
    
    -- Timeline
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    
    -- Performance tracking
    impressions_count INTEGER DEFAULT 0,
    engagement_count INTEGER DEFAULT 0,
    leads_generated INTEGER DEFAULT 0,
    conversions_count INTEGER DEFAULT 0,
    cost_per_lead DECIMAL(10,2),
    roi_percentage DECIMAL(5,2),
    
    -- Status
    status TEXT DEFAULT 'draft', -- 'draft', 'active', 'paused', 'completed', 'cancelled'
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Social analytics and reporting
CREATE TABLE IF NOT EXISTS social_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Time period
    date DATE NOT NULL,
    hour INTEGER, -- For hourly analytics (0-23)
    platform_id UUID REFERENCES social_platforms(id),
    
    -- Metrics
    mentions_count INTEGER DEFAULT 0,
    positive_mentions INTEGER DEFAULT 0,
    negative_mentions INTEGER DEFAULT 0,
    neutral_mentions INTEGER DEFAULT 0,
    
    -- Engagement
    total_engagement INTEGER DEFAULT 0,
    avg_engagement_rate DECIMAL(5,2) DEFAULT 0.00,
    reach_count INTEGER DEFAULT 0,
    impressions_count INTEGER DEFAULT 0,
    
    -- Lead generation
    leads_generated INTEGER DEFAULT 0,
    lead_conversion_rate DECIMAL(5,2) DEFAULT 0.00,
    
    -- Response metrics
    avg_response_time INTERVAL,
    response_rate DECIMAL(5,2) DEFAULT 0.00,
    
    -- Top performing content
    top_keywords TEXT[],
    top_hashtags TEXT[],
    trending_topics TEXT[],
    
    -- Influencer metrics
    top_influencers JSONB DEFAULT '[]',
    influencer_reach INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(org_id, date, hour, platform_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_social_mentions_org_platform ON social_mentions(org_id, platform_name);
CREATE INDEX IF NOT EXISTS idx_social_mentions_mention_time ON social_mentions(mention_time DESC);
CREATE INDEX IF NOT EXISTS idx_social_mentions_sentiment ON social_mentions(sentiment);
CREATE INDEX IF NOT EXISTS idx_social_mentions_contact_id ON social_mentions(contact_id);
CREATE INDEX IF NOT EXISTS idx_social_mentions_keywords ON social_mentions USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_social_mentions_hashtags ON social_mentions USING GIN(hashtags);
CREATE INDEX IF NOT EXISTS idx_social_mentions_processing ON social_mentions(is_processed, is_relevant);

CREATE INDEX IF NOT EXISTS idx_contact_social_profiles_contact ON contact_social_profiles(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_social_profiles_platform ON contact_social_profiles(platform_id);
CREATE INDEX IF NOT EXISTS idx_contact_social_profiles_username ON contact_social_profiles(username);

CREATE INDEX IF NOT EXISTS idx_social_posts_platform_author ON social_posts(platform_id, author_username);
CREATE INDEX IF NOT EXISTS idx_social_posts_posted_at ON social_posts(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_posts_relevance ON social_posts(is_business_relevant, relevance_score DESC);

CREATE INDEX IF NOT EXISTS idx_social_listening_rules_org ON social_listening_rules(org_id, is_active);
CREATE INDEX IF NOT EXISTS idx_social_listening_rules_keywords ON social_listening_rules USING GIN(keywords);

CREATE INDEX IF NOT EXISTS idx_social_engagement_queue_status ON social_engagement_queue(status, priority);
CREATE INDEX IF NOT EXISTS idx_social_engagement_queue_assigned ON social_engagement_queue(assigned_to, status);

CREATE INDEX IF NOT EXISTS idx_social_analytics_date_platform ON social_analytics(date DESC, platform_id);

-- RLS (Row Level Security) policies
ALTER TABLE social_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_social_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_listening_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_engagement_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Social platforms are globally readable"
    ON social_platforms FOR SELECT
    USING (true);

CREATE POLICY "Users can access social data from their organization"
    ON social_mentions FOR ALL
    USING (org_id = (SELECT org_id FROM user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access contact social profiles from their organization"
    ON contact_social_profiles FOR ALL
    USING (org_id = (SELECT org_id FROM user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access social posts from their organization"
    ON social_posts FOR ALL
    USING (org_id = (SELECT org_id FROM user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access social listening rules from their organization"
    ON social_listening_rules FOR ALL
    USING (org_id = (SELECT org_id FROM user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access social engagement queue from their organization"
    ON social_engagement_queue FOR ALL
    USING (org_id = (SELECT org_id FROM user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access social campaigns from their organization"
    ON social_campaigns FOR ALL
    USING (org_id = (SELECT org_id FROM user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access social analytics from their organization"
    ON social_analytics FOR ALL
    USING (org_id = (SELECT org_id FROM user_profiles WHERE user_id = auth.uid()));

-- Functions for social listening
CREATE OR REPLACE FUNCTION calculate_mention_sentiment(content TEXT)
RETURNS TABLE(sentiment TEXT, confidence DECIMAL(3,2)) AS $$
BEGIN
    -- Simple keyword-based sentiment analysis (replace with AI service in production)
    IF content ~* '\y(love|great|awesome|amazing|excellent|fantastic|perfect|best|wonderful)\y' THEN
        RETURN QUERY SELECT 'positive'::TEXT, 0.80::DECIMAL(3,2);
    ELSIF content ~* '\y(hate|terrible|awful|worst|horrible|bad|sucks|disappointed|angry|frustrated)\y' THEN
        RETURN QUERY SELECT 'negative'::TEXT, 0.80::DECIMAL(3,2);
    ELSE
        RETURN QUERY SELECT 'neutral'::TEXT, 0.60::DECIMAL(3,2);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to extract hashtags and mentions
CREATE OR REPLACE FUNCTION extract_social_entities(content TEXT)
RETURNS TABLE(hashtags TEXT[], mentions TEXT[], keywords TEXT[]) AS $$
DECLARE
    hashtag_matches TEXT[];
    mention_matches TEXT[];
    keyword_matches TEXT[];
BEGIN
    -- Extract hashtags (#something)
    SELECT array_agg(substring(match[1] from 2)) INTO hashtag_matches
    FROM regexp_split_to_array(content, '\s+') AS match
    WHERE match ~ '^#\w+';
    
    -- Extract mentions (@someone)
    SELECT array_agg(substring(match[1] from 2)) INTO mention_matches
    FROM regexp_split_to_array(content, '\s+') AS match
    WHERE match ~ '^@\w+';
    
    -- Extract basic keywords (words longer than 3 chars, excluding common words)
    SELECT array_agg(LOWER(match[1])) INTO keyword_matches
    FROM regexp_split_to_array(content, '\W+') AS match
    WHERE length(match[1]) > 3 
    AND match[1] !~* '^(this|that|with|have|will|been|from|they|were|said|each|which|their|time|would|there|could|other|more|very|what|know|just|first|into|over|think|also|your|work|life|only|can|still|should|after|being|now|made|before|here|through|when|where|much|some|these|people|take|than|them|well|were)$';
    
    RETURN QUERY SELECT 
        COALESCE(hashtag_matches, '{}'),
        COALESCE(mention_matches, '{}'),
        COALESCE(keyword_matches, '{}');
END;
$$ LANGUAGE plpgsql;

-- Function to calculate influence score
CREATE OR REPLACE FUNCTION calculate_influence_score(
    follower_count INTEGER,
    following_count INTEGER,
    posts_count INTEGER,
    avg_engagement_rate DECIMAL,
    is_verified BOOLEAN
)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
    follower_ratio DECIMAL;
BEGIN
    -- Base score from followers (logarithmic scale)
    IF follower_count > 0 THEN
        score := LEAST(50, (LOG(follower_count) * 5)::INTEGER);
    END IF;
    
    -- Engagement rate bonus (0-25 points)
    IF avg_engagement_rate > 0 THEN
        score := score + LEAST(25, (avg_engagement_rate * 100)::INTEGER);
    END IF;
    
    -- Follower to following ratio (good ratio = 5-15 points)
    IF following_count > 0 AND follower_count > following_count THEN
        follower_ratio := follower_count::DECIMAL / following_count::DECIMAL;
        IF follower_ratio > 2 THEN
            score := score + LEAST(15, (follower_ratio)::INTEGER);
        END IF;
    END IF;
    
    -- Activity bonus (regular posting = 5 points)
    IF posts_count > 100 THEN
        score := score + 5;
    END IF;
    
    -- Verification bonus
    IF is_verified THEN
        score := score + 10;
    END IF;
    
    RETURN LEAST(100, score);
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_social_platforms_updated_at 
    BEFORE UPDATE ON social_platforms 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_mentions_updated_at 
    BEFORE UPDATE ON social_mentions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_social_profiles_updated_at 
    BEFORE UPDATE ON contact_social_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_posts_updated_at 
    BEFORE UPDATE ON social_posts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_listening_rules_updated_at 
    BEFORE UPDATE ON social_listening_rules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_engagement_queue_updated_at 
    BEFORE UPDATE ON social_engagement_queue 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_campaigns_updated_at 
    BEFORE UPDATE ON social_campaigns 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default social platforms
INSERT INTO social_platforms (name, display_name, icon, color, api_base_url, supports_mentions, supports_profiles, supports_posts, supports_direct_messages) VALUES
('twitter', 'Twitter/X', 'MessageCircle', '#1DA1F2', 'https://api.twitter.com/2', true, true, true, true),
('linkedin', 'LinkedIn', 'Linkedin', '#0077B5', 'https://api.linkedin.com/v2', true, true, true, true),
('facebook', 'Facebook', 'Facebook', '#1877F2', 'https://graph.facebook.com', true, true, true, true),
('instagram', 'Instagram', 'Instagram', '#E4405F', 'https://graph.instagram.com', true, true, true, true),
('youtube', 'YouTube', 'Youtube', '#FF0000', 'https://www.googleapis.com/youtube/v3', false, true, true, false),
('tiktok', 'TikTok', 'Music', '#000000', 'https://open-api.tiktok.com', true, true, true, false),
('reddit', 'Reddit', 'MessageSquare', '#FF4500', 'https://www.reddit.com/api', true, true, true, true),
('discord', 'Discord', 'MessageSquare', '#5865F2', 'https://discord.com/api', true, true, true, true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON social_platforms TO authenticated;
GRANT ALL ON social_mentions TO authenticated;
GRANT ALL ON contact_social_profiles TO authenticated;
GRANT ALL ON social_posts TO authenticated;
GRANT ALL ON social_listening_rules TO authenticated;
GRANT ALL ON social_engagement_queue TO authenticated;
GRANT ALL ON social_campaigns TO authenticated;
GRANT ALL ON social_analytics TO authenticated;

-- Comments for documentation
COMMENT ON TABLE social_platforms IS 'Supported social media platforms and their configurations';
COMMENT ON TABLE social_mentions IS 'Social media mentions, posts, and interactions mentioning the brand or keywords';
COMMENT ON TABLE contact_social_profiles IS 'Social media profiles linked to CRM contacts';
COMMENT ON TABLE social_posts IS 'Posts from contacts and leads social media accounts';
COMMENT ON TABLE social_listening_rules IS 'Rules for automated social media monitoring and lead generation';
COMMENT ON TABLE social_engagement_queue IS 'Queue of social media interactions requiring response';
COMMENT ON TABLE social_campaigns IS 'Social media campaigns and their performance tracking';
COMMENT ON TABLE social_analytics IS 'Daily/hourly social media analytics and metrics';

COMMENT ON FUNCTION calculate_mention_sentiment IS 'Calculates sentiment and confidence score for social media content';
COMMENT ON FUNCTION extract_social_entities IS 'Extracts hashtags, mentions, and keywords from social media content';
COMMENT ON FUNCTION calculate_influence_score IS 'Calculates influence score (0-100) for social media profiles';

