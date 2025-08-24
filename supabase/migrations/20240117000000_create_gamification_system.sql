-- Gamification System
-- Complete database schema for points, badges, achievements, and leaderboards

-- User points and gamification profile
CREATE TABLE IF NOT EXISTS user_gamification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Points system
    total_points INTEGER DEFAULT 0,
    monthly_points INTEGER DEFAULT 0,
    weekly_points INTEGER DEFAULT 0,
    daily_points INTEGER DEFAULT 0,
    
    -- Levels and streaks
    level INTEGER DEFAULT 1,
    experience_points INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    
    -- Activity counters
    deals_closed INTEGER DEFAULT 0,
    calls_made INTEGER DEFAULT 0,
    emails_sent INTEGER DEFAULT 0,
    meetings_attended INTEGER DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    leads_converted INTEGER DEFAULT 0,
    
    -- Rankings
    global_rank INTEGER,
    team_rank INTEGER,
    
    -- Metadata
    last_activity_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure one record per user per organization
    UNIQUE(user_id, org_id)
);

-- Badge definitions
CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Badge metadata
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL, -- Icon name from lucide-react
    color TEXT NOT NULL DEFAULT 'blue', -- Badge color theme
    category TEXT NOT NULL, -- 'achievement', 'milestone', 'streak', 'special'
    rarity TEXT NOT NULL DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
    
    -- Requirements
    requirement_type TEXT NOT NULL, -- 'points', 'deals', 'calls', 'streak', 'special'
    requirement_value INTEGER, -- Numeric requirement (if applicable)
    requirement_conditions JSONB DEFAULT '{}', -- Additional conditions
    
    -- Rewards
    points_reward INTEGER DEFAULT 0,
    experience_reward INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_repeatable BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User badges (earned badges)
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Achievement details
    earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    progress_value INTEGER, -- Value that earned the badge
    times_earned INTEGER DEFAULT 1, -- For repeatable badges
    
    -- Display
    is_featured BOOLEAN DEFAULT FALSE, -- Show on profile
    is_public BOOLEAN DEFAULT TRUE,
    
    UNIQUE(user_id, badge_id, org_id) -- One badge per user (unless repeatable)
);

-- Points transactions (audit trail)
CREATE TABLE IF NOT EXISTS points_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Transaction details
    points INTEGER NOT NULL, -- Can be positive or negative
    transaction_type TEXT NOT NULL, -- 'earned', 'bonus', 'penalty', 'manual'
    source_type TEXT NOT NULL, -- 'deal', 'call', 'email', 'task', 'meeting', 'badge', 'admin'
    source_id UUID, -- Reference to the source record (deal_id, call_id, etc.)
    
    -- Context
    description TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Achievements (milestones and goals)
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Achievement metadata
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT 'purple',
    category TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'lifetime'
    
    -- Goals and requirements
    goal_type TEXT NOT NULL, -- 'points', 'deals', 'calls', 'revenue', 'streak'
    goal_value INTEGER NOT NULL,
    time_period TEXT, -- 'day', 'week', 'month', 'quarter', 'year', null for lifetime
    
    -- Rewards
    points_reward INTEGER DEFAULT 0,
    badge_reward UUID REFERENCES badges(id),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    difficulty TEXT DEFAULT 'medium', -- 'easy', 'medium', 'hard', 'legendary'
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User achievement progress
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Progress tracking
    current_progress INTEGER DEFAULT 0,
    goal_value INTEGER NOT NULL,
    progress_percentage DECIMAL(5,2) DEFAULT 0.0,
    
    -- Status
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    
    -- Time period tracking
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id, achievement_id, org_id, period_start)
);

-- Leaderboard periods (for historical tracking)
CREATE TABLE IF NOT EXISTS leaderboard_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Period definition
    period_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Status
    is_current BOOLEAN DEFAULT FALSE,
    is_completed BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Leaderboard entries (rankings for periods)
CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_id UUID NOT NULL REFERENCES leaderboard_periods(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Rankings
    rank INTEGER NOT NULL,
    points INTEGER NOT NULL,
    
    -- Performance metrics
    deals_closed INTEGER DEFAULT 0,
    revenue_generated DECIMAL(12,2) DEFAULT 0,
    activities_completed INTEGER DEFAULT 0,
    
    -- Rewards
    reward_points INTEGER DEFAULT 0,
    reward_badge UUID REFERENCES badges(id),
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(period_id, user_id)
);

-- Team challenges
CREATE TABLE IF NOT EXISTS team_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Challenge details
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT 'green',
    
    -- Goals
    goal_type TEXT NOT NULL, -- 'collective_points', 'collective_deals', 'team_average'
    goal_value INTEGER NOT NULL,
    
    -- Timing
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    
    -- Rewards
    team_reward_points INTEGER DEFAULT 0,
    individual_reward_points INTEGER DEFAULT 0,
    reward_badge UUID REFERENCES badges(id),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_completed BOOLEAN DEFAULT FALSE,
    current_progress INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Team challenge participants
CREATE TABLE IF NOT EXISTS team_challenge_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES team_challenges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Participation
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    contribution INTEGER DEFAULT 0,
    
    UNIQUE(challenge_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_gamification_user_id ON user_gamification(user_id);
CREATE INDEX IF NOT EXISTS idx_user_gamification_org_id ON user_gamification(org_id);
CREATE INDEX IF NOT EXISTS idx_user_gamification_total_points ON user_gamification(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_gamification_monthly_points ON user_gamification(monthly_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_gamification_level ON user_gamification(level DESC);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned_at ON user_badges(earned_at DESC);

CREATE INDEX IF NOT EXISTS idx_points_transactions_user_id ON points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_created_at ON points_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_points_transactions_source ON points_transactions(source_type, source_id);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_completed ON user_achievements(is_completed, completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_period_rank ON leaderboard_entries(period_id, rank);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_points ON leaderboard_entries(points DESC);

-- RLS (Row Level Security) policies
ALTER TABLE user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_challenge_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can access gamification from their organization"
    ON user_gamification FOR ALL
    USING (org_id = (SELECT org_id FROM user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Badges are globally readable"
    ON badges FOR SELECT
    USING (true);

CREATE POLICY "Users can access user badges from their organization"
    ON user_badges FOR ALL
    USING (org_id = (SELECT org_id FROM user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access points transactions from their organization"
    ON points_transactions FOR ALL
    USING (org_id = (SELECT org_id FROM user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Achievements are globally readable"
    ON achievements FOR SELECT
    USING (true);

CREATE POLICY "Users can access user achievements from their organization"
    ON user_achievements FOR ALL
    USING (org_id = (SELECT org_id FROM user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access leaderboard periods from their organization"
    ON leaderboard_periods FOR ALL
    USING (org_id = (SELECT org_id FROM user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access leaderboard entries from their organization"
    ON leaderboard_entries FOR ALL
    USING (org_id = (SELECT org_id FROM user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access team challenges from their organization"
    ON team_challenges FOR ALL
    USING (org_id = (SELECT org_id FROM user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access team challenge participants from their organization"
    ON team_challenge_participants FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM team_challenges tc 
            WHERE tc.id = team_challenge_participants.challenge_id 
            AND tc.org_id = (SELECT org_id FROM user_profiles WHERE user_id = auth.uid())
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
CREATE TRIGGER update_user_gamification_updated_at 
    BEFORE UPDATE ON user_gamification 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_badges_updated_at 
    BEFORE UPDATE ON badges 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_achievements_updated_at 
    BEFORE UPDATE ON achievements 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_achievements_updated_at 
    BEFORE UPDATE ON user_achievements 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_challenges_updated_at 
    BEFORE UPDATE ON team_challenges 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to award points and update gamification stats
CREATE OR REPLACE FUNCTION award_points(
    p_user_id UUID,
    p_org_id UUID,
    p_points INTEGER,
    p_transaction_type TEXT,
    p_source_type TEXT,
    p_source_id UUID DEFAULT NULL,
    p_description TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_level INTEGER;
    v_new_total_points INTEGER;
BEGIN
    -- Insert or update user gamification record
    INSERT INTO user_gamification (user_id, org_id, total_points, monthly_points, weekly_points, daily_points)
    VALUES (p_user_id, p_org_id, p_points, p_points, p_points, p_points)
    ON CONFLICT (user_id, org_id)
    DO UPDATE SET
        total_points = user_gamification.total_points + p_points,
        monthly_points = user_gamification.monthly_points + p_points,
        weekly_points = user_gamification.weekly_points + p_points,
        daily_points = user_gamification.daily_points + p_points,
        last_activity_date = CURRENT_DATE,
        updated_at = NOW();
    
    -- Get new total points for level calculation
    SELECT total_points INTO v_new_total_points
    FROM user_gamification
    WHERE user_id = p_user_id AND org_id = p_org_id;
    
    -- Calculate level (every 1000 points = 1 level)
    v_level := GREATEST(1, FLOOR(v_new_total_points / 1000) + 1);
    
    -- Update level if changed
    UPDATE user_gamification
    SET level = v_level,
        experience_points = v_new_total_points % 1000
    WHERE user_id = p_user_id AND org_id = p_org_id;
    
    -- Record points transaction
    INSERT INTO points_transactions (
        user_id, org_id, points, transaction_type, source_type, source_id, description
    ) VALUES (
        p_user_id, p_org_id, p_points, p_transaction_type, p_source_type, p_source_id, p_description
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and award badges
CREATE OR REPLACE FUNCTION check_and_award_badges(p_user_id UUID, p_org_id UUID)
RETURNS VOID AS $$
DECLARE
    badge_record RECORD;
    user_stats RECORD;
BEGIN
    -- Get user's current stats
    SELECT * INTO user_stats
    FROM user_gamification
    WHERE user_id = p_user_id AND org_id = p_org_id;
    
    -- Check all active badges
    FOR badge_record IN 
        SELECT * FROM badges 
        WHERE is_active = TRUE 
        AND id NOT IN (
            SELECT badge_id FROM user_badges 
            WHERE user_id = p_user_id AND org_id = p_org_id
        )
    LOOP
        -- Check if user meets badge requirements
        IF (badge_record.requirement_type = 'points' AND user_stats.total_points >= badge_record.requirement_value) OR
           (badge_record.requirement_type = 'deals' AND user_stats.deals_closed >= badge_record.requirement_value) OR
           (badge_record.requirement_type = 'calls' AND user_stats.calls_made >= badge_record.requirement_value) OR
           (badge_record.requirement_type = 'streak' AND user_stats.current_streak >= badge_record.requirement_value) THEN
            
            -- Award the badge
            INSERT INTO user_badges (user_id, badge_id, org_id, progress_value)
            VALUES (p_user_id, badge_record.id, p_org_id, 
                CASE 
                    WHEN badge_record.requirement_type = 'points' THEN user_stats.total_points
                    WHEN badge_record.requirement_type = 'deals' THEN user_stats.deals_closed
                    WHEN badge_record.requirement_type = 'calls' THEN user_stats.calls_made
                    WHEN badge_record.requirement_type = 'streak' THEN user_stats.current_streak
                    ELSE 0
                END
            );
            
            -- Award badge bonus points
            IF badge_record.points_reward > 0 THEN
                PERFORM award_points(
                    p_user_id, p_org_id, badge_record.points_reward,
                    'bonus', 'badge', badge_record.id,
                    'Badge reward: ' || badge_record.name
                );
            END IF;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample badges
INSERT INTO badges (name, description, icon, color, category, rarity, requirement_type, requirement_value, points_reward) VALUES
-- Achievement badges
('First Deal', 'Close your first deal', 'Trophy', 'gold', 'milestone', 'common', 'deals', 1, 100),
('Deal Maker', 'Close 10 deals', 'Target', 'blue', 'milestone', 'rare', 'deals', 10, 500),
('Sales Champion', 'Close 50 deals', 'Crown', 'purple', 'milestone', 'epic', 'deals', 50, 2000),
('Sales Legend', 'Close 100 deals', 'Award', 'red', 'milestone', 'legendary', 'deals', 100, 5000),

-- Activity badges
('Call Master', 'Make 100 calls', 'Phone', 'green', 'achievement', 'rare', 'calls', 100, 300),
('Conversation King', 'Make 500 calls', 'PhoneCall', 'blue', 'achievement', 'epic', 'calls', 500, 1000),
('Communication Expert', 'Make 1000 calls', 'Headphones', 'purple', 'achievement', 'legendary', 'calls', 1000, 2500),

-- Points badges
('Point Collector', 'Earn 1000 points', 'Star', 'yellow', 'milestone', 'common', 'points', 1000, 200),
('Point Accumulator', 'Earn 5000 points', 'Sparkles', 'orange', 'milestone', 'rare', 'points', 5000, 750),
('Point Master', 'Earn 10000 points', 'Zap', 'red', 'milestone', 'epic', 'points', 10000, 1500),

-- Streak badges
('Consistent Performer', 'Maintain a 7-day streak', 'Calendar', 'green', 'streak', 'rare', 'streak', 7, 400),
('Dedication Award', 'Maintain a 30-day streak', 'CalendarCheck', 'blue', 'streak', 'epic', 'streak', 30, 1200),
('Unstoppable Force', 'Maintain a 100-day streak', 'Flame', 'red', 'streak', 'legendary', 'streak', 100, 5000);

-- Insert sample achievements
INSERT INTO achievements (title, description, icon, color, category, goal_type, goal_value, time_period, points_reward, difficulty) VALUES
-- Daily achievements
('Daily Hustler', 'Make 10 calls in a day', 'Phone', 'blue', 'daily', 'calls', 10, 'day', 50, 'easy'),
('Daily Closer', 'Close 2 deals in a day', 'Target', 'green', 'daily', 'deals', 2, 'day', 200, 'hard'),

-- Weekly achievements
('Weekly Warrior', 'Earn 500 points this week', 'Sword', 'purple', 'weekly', 'points', 500, 'week', 100, 'medium'),
('Call Champion', 'Make 50 calls this week', 'PhoneCall', 'orange', 'weekly', 'calls', 50, 'week', 150, 'medium'),

-- Monthly achievements
('Monthly Master', 'Close 20 deals this month', 'Crown', 'gold', 'monthly', 'deals', 20, 'month', 1000, 'hard'),
('Point Powerhouse', 'Earn 2000 points this month', 'Lightning', 'red', 'monthly', 'points', 2000, 'month', 500, 'medium'),

-- Lifetime achievements
('Deal Titan', 'Close 200 deals total', 'Trophy', 'platinum', 'lifetime', 'deals', 200, null, 10000, 'legendary'),
('Call Legend', 'Make 2000 calls total', 'Megaphone', 'diamond', 'lifetime', 'calls', 2000, null, 5000, 'legendary');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON user_gamification TO authenticated;
GRANT ALL ON badges TO authenticated;
GRANT ALL ON user_badges TO authenticated;
GRANT ALL ON points_transactions TO authenticated;
GRANT ALL ON achievements TO authenticated;
GRANT ALL ON user_achievements TO authenticated;
GRANT ALL ON leaderboard_periods TO authenticated;
GRANT ALL ON leaderboard_entries TO authenticated;
GRANT ALL ON team_challenges TO authenticated;
GRANT ALL ON team_challenge_participants TO authenticated;

-- Comments for documentation
COMMENT ON TABLE user_gamification IS 'User gamification profiles with points, levels, and activity tracking';
COMMENT ON TABLE badges IS 'Badge definitions with requirements and rewards';
COMMENT ON TABLE user_badges IS 'Badges earned by users';
COMMENT ON TABLE points_transactions IS 'Audit trail of all points transactions';
COMMENT ON TABLE achievements IS 'Achievement definitions with goals and time periods';
COMMENT ON TABLE user_achievements IS 'User progress on achievements';
COMMENT ON TABLE leaderboard_periods IS 'Time periods for leaderboard tracking';
COMMENT ON TABLE leaderboard_entries IS 'User rankings for specific periods';
COMMENT ON TABLE team_challenges IS 'Team-based challenges and competitions';
COMMENT ON TABLE team_challenge_participants IS 'Users participating in team challenges';

COMMENT ON FUNCTION award_points IS 'Awards points to a user and updates their gamification stats';
COMMENT ON FUNCTION check_and_award_badges IS 'Checks user eligibility for badges and awards them automatically';

