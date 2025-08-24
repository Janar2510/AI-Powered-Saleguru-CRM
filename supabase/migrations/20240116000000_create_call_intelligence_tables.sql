-- Call Intelligence Tables
-- Create tables for AI-powered call transcription, analysis, and CRM integration

-- Main call transcripts table
CREATE TABLE IF NOT EXISTS call_transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Call metadata
    title TEXT NOT NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    call_type TEXT NOT NULL CHECK (call_type IN ('sales_call', 'demo', 'discovery', 'follow_up', 'meeting', 'support')),
    status TEXT NOT NULL DEFAULT 'recording' CHECK (status IN ('recording', 'transcribing', 'analyzing', 'completed', 'failed')),
    
    -- Timing
    duration_seconds INTEGER DEFAULT 0,
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    
    -- Transcription data
    transcript_text TEXT DEFAULT '',
    transcript_confidence DECIMAL(3,2) DEFAULT 0.0 CHECK (transcript_confidence >= 0 AND transcript_confidence <= 1),
    language TEXT DEFAULT 'en',
    
    -- AI Analysis results
    summary TEXT DEFAULT '',
    sentiment_overall TEXT DEFAULT 'neutral' CHECK (sentiment_overall IN ('positive', 'neutral', 'negative')),
    sentiment_score DECIMAL(3,2) DEFAULT 0.0 CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
    sentiment_confidence DECIMAL(3,2) DEFAULT 0.0 CHECK (sentiment_confidence >= 0 AND sentiment_confidence <= 1),
    
    -- Insights (JSON arrays)
    customer_needs JSONB DEFAULT '[]',
    objections JSONB DEFAULT '[]',
    opportunities JSONB DEFAULT '[]',
    concerns JSONB DEFAULT '[]',
    competitors_mentioned JSONB DEFAULT '[]',
    key_quotes JSONB DEFAULT '[]',
    
    -- Predictions
    deal_probability INTEGER CHECK (deal_probability >= 0 AND deal_probability <= 100),
    urgency_level TEXT DEFAULT 'medium' CHECK (urgency_level IN ('low', 'medium', 'high')),
    next_best_action TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Call participants table
CREATE TABLE IF NOT EXISTS call_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id UUID NOT NULL REFERENCES call_transcripts(id) ON DELETE CASCADE,
    
    -- Participant info
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('rep', 'customer', 'prospect', 'team', 'other')),
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    
    -- Speaking analytics
    speaking_time_percentage DECIMAL(5,2) DEFAULT 0.0 CHECK (speaking_time_percentage >= 0 AND speaking_time_percentage <= 100),
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Call action items table
CREATE TABLE IF NOT EXISTS call_action_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id UUID NOT NULL REFERENCES call_transcripts(id) ON DELETE CASCADE,
    
    -- Action details
    action_text TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    due_date DATE,
    
    -- Status
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    
    -- AI metadata
    confidence_score DECIMAL(3,2) DEFAULT 0.0 CHECK (confidence_score >= 0 AND confidence_score <= 1),
    category TEXT DEFAULT 'general',
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Call keywords table for analytics
CREATE TABLE IF NOT EXISTS call_keywords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id UUID NOT NULL REFERENCES call_transcripts(id) ON DELETE CASCADE,
    
    -- Keyword data
    keyword TEXT NOT NULL,
    frequency INTEGER DEFAULT 1,
    relevance_score DECIMAL(3,2) DEFAULT 0.0 CHECK (relevance_score >= 0 AND relevance_score <= 1),
    category TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure unique keywords per call
    UNIQUE(call_id, keyword)
);

-- Call sentiment timeline (for detailed sentiment analysis)
CREATE TABLE IF NOT EXISTS call_sentiment_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id UUID NOT NULL REFERENCES call_transcripts(id) ON DELETE CASCADE,
    
    -- Timeline data
    timestamp_seconds INTEGER NOT NULL,
    sentiment TEXT NOT NULL CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    sentiment_score DECIMAL(3,2) NOT NULL CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
    confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    
    -- Context
    text_segment TEXT,
    speaker_id TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_call_transcripts_org_id ON call_transcripts(org_id);
CREATE INDEX IF NOT EXISTS idx_call_transcripts_user_id ON call_transcripts(user_id);
CREATE INDEX IF NOT EXISTS idx_call_transcripts_contact_id ON call_transcripts(contact_id);
CREATE INDEX IF NOT EXISTS idx_call_transcripts_deal_id ON call_transcripts(deal_id);
CREATE INDEX IF NOT EXISTS idx_call_transcripts_status ON call_transcripts(status);
CREATE INDEX IF NOT EXISTS idx_call_transcripts_started_at ON call_transcripts(started_at);
CREATE INDEX IF NOT EXISTS idx_call_transcripts_sentiment ON call_transcripts(sentiment_overall);
CREATE INDEX IF NOT EXISTS idx_call_transcripts_call_type ON call_transcripts(call_type);

CREATE INDEX IF NOT EXISTS idx_call_participants_call_id ON call_participants(call_id);
CREATE INDEX IF NOT EXISTS idx_call_participants_contact_id ON call_participants(contact_id);

CREATE INDEX IF NOT EXISTS idx_call_action_items_call_id ON call_action_items(call_id);
CREATE INDEX IF NOT EXISTS idx_call_action_items_assignee_id ON call_action_items(assignee_id);
CREATE INDEX IF NOT EXISTS idx_call_action_items_due_date ON call_action_items(due_date);
CREATE INDEX IF NOT EXISTS idx_call_action_items_completed ON call_action_items(completed);

CREATE INDEX IF NOT EXISTS idx_call_keywords_call_id ON call_keywords(call_id);
CREATE INDEX IF NOT EXISTS idx_call_keywords_keyword ON call_keywords(keyword);
CREATE INDEX IF NOT EXISTS idx_call_keywords_category ON call_keywords(category);

CREATE INDEX IF NOT EXISTS idx_call_sentiment_timeline_call_id ON call_sentiment_timeline(call_id);

-- Full-text search index for transcripts
CREATE INDEX IF NOT EXISTS idx_call_transcripts_transcript_search ON call_transcripts USING gin(to_tsvector('english', transcript_text));
CREATE INDEX IF NOT EXISTS idx_call_transcripts_summary_search ON call_transcripts USING gin(to_tsvector('english', summary));

-- RLS (Row Level Security) policies
ALTER TABLE call_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_sentiment_timeline ENABLE ROW LEVEL SECURITY;

-- Policy for call_transcripts
CREATE POLICY "Users can access call transcripts from their organization"
    ON call_transcripts FOR ALL
    USING (org_id = (SELECT org_id FROM user_profiles WHERE user_id = auth.uid()));

-- Policy for call_participants
CREATE POLICY "Users can access call participants from their organization"
    ON call_participants FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM call_transcripts ct 
            WHERE ct.id = call_participants.call_id 
            AND ct.org_id = (SELECT org_id FROM user_profiles WHERE user_id = auth.uid())
        )
    );

-- Policy for call_action_items
CREATE POLICY "Users can access call action items from their organization"
    ON call_action_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM call_transcripts ct 
            WHERE ct.id = call_action_items.call_id 
            AND ct.org_id = (SELECT org_id FROM user_profiles WHERE user_id = auth.uid())
        )
    );

-- Policy for call_keywords
CREATE POLICY "Users can access call keywords from their organization"
    ON call_keywords FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM call_transcripts ct 
            WHERE ct.id = call_keywords.call_id 
            AND ct.org_id = (SELECT org_id FROM user_profiles WHERE user_id = auth.uid())
        )
    );

-- Policy for call_sentiment_timeline
CREATE POLICY "Users can access call sentiment timeline from their organization"
    ON call_sentiment_timeline FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM call_transcripts ct 
            WHERE ct.id = call_sentiment_timeline.call_id 
            AND ct.org_id = (SELECT org_id FROM user_profiles WHERE user_id = auth.uid())
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_call_transcripts_updated_at 
    BEFORE UPDATE ON call_transcripts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_call_action_items_updated_at 
    BEFORE UPDATE ON call_action_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically mark action items as completed
CREATE OR REPLACE FUNCTION mark_action_item_completed()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.completed = TRUE AND OLD.completed = FALSE THEN
        NEW.completed_at = NOW();
    ELSIF NEW.completed = FALSE AND OLD.completed = TRUE THEN
        NEW.completed_at = NULL;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for action item completion
CREATE TRIGGER mark_action_item_completed_trigger
    BEFORE UPDATE ON call_action_items
    FOR EACH ROW EXECUTE FUNCTION mark_action_item_completed();

-- Sample function for call analytics
CREATE OR REPLACE FUNCTION get_call_analytics(
    p_org_id UUID,
    p_date_from TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    p_date_to TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_calls', COUNT(*),
        'avg_duration', AVG(duration_seconds),
        'avg_sentiment_score', AVG(sentiment_score),
        'sentiment_breakdown', json_build_object(
            'positive', COUNT(*) FILTER (WHERE sentiment_overall = 'positive'),
            'neutral', COUNT(*) FILTER (WHERE sentiment_overall = 'neutral'),
            'negative', COUNT(*) FILTER (WHERE sentiment_overall = 'negative')
        ),
        'call_types', json_agg(DISTINCT call_type),
        'top_keywords', (
            SELECT json_agg(json_build_object('keyword', keyword, 'count', SUM(frequency)))
            FROM call_keywords ck
            JOIN call_transcripts ct ON ck.call_id = ct.id
            WHERE ct.org_id = p_org_id
            AND ct.started_at BETWEEN p_date_from AND p_date_to
            GROUP BY keyword
            ORDER BY SUM(frequency) DESC
            LIMIT 10
        )
    ) INTO result
    FROM call_transcripts
    WHERE org_id = p_org_id
    AND started_at BETWEEN p_date_from AND p_date_to
    AND status = 'completed';
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON call_transcripts TO authenticated;
GRANT ALL ON call_participants TO authenticated;
GRANT ALL ON call_action_items TO authenticated;
GRANT ALL ON call_keywords TO authenticated;
GRANT ALL ON call_sentiment_timeline TO authenticated;

-- Comments for documentation
COMMENT ON TABLE call_transcripts IS 'AI-powered call transcriptions with analysis and insights';
COMMENT ON TABLE call_participants IS 'Participants in recorded calls with speaking analytics';
COMMENT ON TABLE call_action_items IS 'AI-extracted action items from calls';
COMMENT ON TABLE call_keywords IS 'Keywords and topics extracted from calls for analytics';
COMMENT ON TABLE call_sentiment_timeline IS 'Detailed sentiment analysis timeline for calls';

COMMENT ON COLUMN call_transcripts.transcript_confidence IS 'AI confidence score for transcription accuracy (0-1)';
COMMENT ON COLUMN call_transcripts.sentiment_score IS 'Numerical sentiment score (-1 to 1, negative to positive)';
COMMENT ON COLUMN call_transcripts.deal_probability IS 'AI-predicted deal close probability (0-100%)';
COMMENT ON COLUMN call_action_items.confidence_score IS 'AI confidence in action item extraction (0-1)';
COMMENT ON COLUMN call_keywords.relevance_score IS 'Relevance score for keyword importance (0-1)';

