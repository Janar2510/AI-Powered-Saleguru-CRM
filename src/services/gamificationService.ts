// Gamification Service
// Comprehensive service for managing points, badges, achievements, and leaderboards

import { supabase } from './supabase';

// Types and Interfaces
export interface UserGamification {
  id: string;
  user_id: string;
  org_id: string;
  total_points: number;
  monthly_points: number;
  weekly_points: number;
  daily_points: number;
  level: number;
  experience_points: number;
  current_streak: number;
  longest_streak: number;
  deals_closed: number;
  calls_made: number;
  emails_sent: number;
  meetings_attended: number;
  tasks_completed: number;
  leads_converted: number;
  global_rank?: number;
  team_rank?: number;
  last_activity_date: string;
  created_at: string;
  updated_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'achievement' | 'milestone' | 'streak' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirement_type: 'points' | 'deals' | 'calls' | 'streak' | 'special';
  requirement_value?: number;
  requirement_conditions: any;
  points_reward: number;
  experience_reward: number;
  is_active: boolean;
  is_repeatable: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  org_id: string;
  badge: Badge;
  earned_at: string;
  progress_value?: number;
  times_earned: number;
  is_featured: boolean;
  is_public: boolean;
}

export interface PointsTransaction {
  id: string;
  user_id: string;
  org_id: string;
  points: number;
  transaction_type: 'earned' | 'bonus' | 'penalty' | 'manual';
  source_type: 'deal' | 'call' | 'email' | 'task' | 'meeting' | 'badge' | 'admin';
  source_id?: string;
  description?: string;
  metadata: any;
  created_at: string;
  created_by?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  category: 'daily' | 'weekly' | 'monthly' | 'lifetime';
  goal_type: 'points' | 'deals' | 'calls' | 'revenue' | 'streak';
  goal_value: number;
  time_period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  points_reward: number;
  badge_reward?: string;
  is_active: boolean;
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  created_at: string;
  updated_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  org_id: string;
  achievement: Achievement;
  current_progress: number;
  goal_value: number;
  progress_percentage: number;
  is_completed: boolean;
  completed_at?: string;
  period_start?: string;
  period_end?: string;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardEntry {
  user_id: string;
  rank: number;
  points: number;
  deals_closed: number;
  revenue_generated: number;
  activities_completed: number;
  user_name?: string;
  user_avatar?: string;
  badges_count?: number;
  level?: number;
}

export interface TeamChallenge {
  id: string;
  org_id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  goal_type: 'collective_points' | 'collective_deals' | 'team_average';
  goal_value: number;
  start_date: string;
  end_date: string;
  team_reward_points: number;
  individual_reward_points: number;
  reward_badge?: string;
  is_active: boolean;
  is_completed: boolean;
  current_progress: number;
  participants_count?: number;
  created_at: string;
  updated_at: string;
}

// Points scoring configuration
export const POINTS_CONFIG = {
  // Deal activities
  DEAL_CREATED: 10,
  DEAL_UPDATED: 5,
  DEAL_CLOSED_WON: 100,
  DEAL_MOVED_FORWARD: 15,
  DEAL_LOST: -10,
  
  // Call activities
  CALL_MADE: 5,
  CALL_ANSWERED: 10,
  CALL_DURATION_BONUS: 2, // per minute
  CALL_FOLLOW_UP: 8,
  
  // Email activities
  EMAIL_SENT: 3,
  EMAIL_REPLIED: 8,
  EMAIL_OPENED: 1,
  EMAIL_CLICKED: 5,
  
  // Meeting activities
  MEETING_SCHEDULED: 15,
  MEETING_ATTENDED: 20,
  MEETING_COMPLETED: 25,
  
  // Task activities
  TASK_CREATED: 2,
  TASK_COMPLETED: 10,
  TASK_OVERDUE: -5,
  
  // Lead activities
  LEAD_CREATED: 5,
  LEAD_QUALIFIED: 15,
  LEAD_CONVERTED: 50,
  
  // Streak bonuses
  DAILY_STREAK_BONUS: 5,
  WEEKLY_STREAK_BONUS: 25,
  MONTHLY_STREAK_BONUS: 100,
  
  // Special bonuses
  FIRST_ACTIVITY_OF_DAY: 10,
  WEEKEND_ACTIVITY: 15,
  LATE_NIGHT_ACTIVITY: 5,
};

class GamificationService {
  /**
   * Get mock user gamification data (fallback when tables don't exist)
   */
  private getMockUserGamification(userId: string): UserGamification {
    return {
      id: `mock-${userId}`,
      user_id: userId,
      org_id: 'mock-org',
      total_points: 1250,
      monthly_points: 320,
      weekly_points: 85,
      daily_points: 15,
      level: 3,
      experience_points: 250,
      current_streak: 5,
      longest_streak: 12,
      deals_closed: 8,
      calls_made: 45,
      emails_sent: 127,
      meetings_attended: 12,
      tasks_completed: 28,
      leads_converted: 15,
      global_rank: 7,
      team_rank: 3,
      last_activity_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Get mock user badges (fallback when tables don't exist)
   */
  private getMockUserBadges(): UserBadge[] {
    return [
      {
        id: 'mock-badge-1',
        user_id: 'mock-user',
        badge_id: 'mock-first-deal',
        org_id: 'mock-org',
        badge: {
          id: 'mock-first-deal',
          name: 'First Deal',
          description: 'Closed your first deal',
          icon: 'Trophy',
          color: 'gold',
          category: 'milestone',
          rarity: 'common',
          requirement_type: 'deals',
          requirement_value: 1,
          requirement_conditions: {},
          points_reward: 100,
          experience_reward: 50,
          is_active: true,
          is_repeatable: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        earned_at: new Date().toISOString(),
        progress_value: 1,
        times_earned: 1,
        is_featured: true,
        is_public: true
      },
      {
        id: 'mock-badge-2',
        user_id: 'mock-user',
        badge_id: 'mock-call-master',
        org_id: 'mock-org',
        badge: {
          id: 'mock-call-master',
          name: 'Call Master',
          description: 'Made 50 calls',
          icon: 'Phone',
          color: 'blue',
          category: 'achievement',
          rarity: 'rare',
          requirement_type: 'calls',
          requirement_value: 50,
          requirement_conditions: {},
          points_reward: 300,
          experience_reward: 150,
          is_active: true,
          is_repeatable: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        earned_at: new Date(Date.now() - 86400000).toISOString(),
        progress_value: 50,
        times_earned: 1,
        is_featured: false,
        is_public: true
      }
    ];
  }

  /**
   * Get mock user achievements (fallback when tables don't exist)
   */
  private getMockUserAchievements(): UserAchievement[] {
    return [
      {
        id: 'mock-achievement-1',
        user_id: 'mock-user',
        achievement_id: 'mock-monthly-target',
        org_id: 'mock-org',
        achievement: {
          id: 'mock-monthly-target',
          title: 'Monthly Sales Target',
          description: 'Close 10 deals this month',
          icon: 'Target',
          color: 'green',
          category: 'monthly',
          goal_type: 'deals',
          goal_value: 10,
          time_period: 'month',
          points_reward: 500,
          badge_reward: 'monthly-achiever',
          is_active: true,
          difficulty: 'medium',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        current_progress: 8,
        goal_value: 10,
        progress_percentage: 80,
        is_completed: false,
        period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
        period_end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  /**
   * Get mock leaderboard (fallback when tables don't exist)
   */
  private getMockLeaderboard(): LeaderboardEntry[] {
    return [
      {
        user_id: 'user-1',
        rank: 1,
        points: 2150,
        deals_closed: 15,
        revenue_generated: 125000,
        activities_completed: 89,
        user_name: 'Sarah Johnson',
        level: 5,
        badges_count: 8
      },
      {
        user_id: 'user-2',
        rank: 2,
        points: 1890,
        deals_closed: 12,
        revenue_generated: 98000,
        activities_completed: 76,
        user_name: 'Mike Chen',
        level: 4,
        badges_count: 6
      },
      {
        user_id: 'current-user-id',
        rank: 3,
        points: 1250,
        deals_closed: 8,
        revenue_generated: 75000,
        activities_completed: 55,
        user_name: 'You',
        level: 3,
        badges_count: 4
      }
    ];
  }
  /**
   * Get user's gamification profile
   */
  async getUserGamification(userId: string): Promise<UserGamification | null> {
    try {
      const { data, error } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No record found, create one
          return await this.initializeUserGamification(userId);
        }
        // If table doesn't exist, return mock data
        if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
          console.warn('Gamification tables not yet created, returning mock data');
          return this.getMockUserGamification(userId);
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user gamification:', error);
      // Return mock data if there's any error
      return this.getMockUserGamification(userId);
    }
  }

  /**
   * Initialize gamification for a new user
   */
  async initializeUserGamification(userId: string): Promise<UserGamification | null> {
    try {
      // Get user's org_id
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('org_id')
        .eq('user_id', userId)
        .single();

      if (!profile) throw new Error('User profile not found');

      const { data, error } = await supabase
        .from('user_gamification')
        .insert({
          user_id: userId,
          org_id: profile.org_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error initializing user gamification:', error);
      return null;
    }
  }

  /**
   * Award points to a user for an activity
   */
  async awardPoints(
    userId: string,
    points: number,
    sourceType: PointsTransaction['source_type'],
    sourceId?: string,
    description?: string,
    metadata?: any
  ): Promise<boolean> {
    try {
      // Get user's org_id
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('org_id')
        .eq('user_id', userId)
        .single();

      if (!profile) throw new Error('User profile not found');

      // Use the database function to award points
      const { error } = await supabase.rpc('award_points', {
        p_user_id: userId,
        p_org_id: profile.org_id,
        p_points: points,
        p_transaction_type: 'earned',
        p_source_type: sourceType,
        p_source_id: sourceId,
        p_description: description || `Points awarded for ${sourceType}`
      });

      if (error) throw error;

      // Check for new badges after awarding points
      await this.checkAndAwardBadges(userId, profile.org_id);

      return true;
    } catch (error) {
      console.error('Error awarding points:', error);
      return false;
    }
  }

  /**
   * Award points for specific activities
   */
  async awardActivityPoints(
    userId: string,
    activity: keyof typeof POINTS_CONFIG,
    sourceId?: string,
    additionalPoints: number = 0
  ): Promise<boolean> {
    const basePoints = POINTS_CONFIG[activity] || 0;
    const totalPoints = basePoints + additionalPoints;
    
    const sourceTypeMap: Record<string, PointsTransaction['source_type']> = {
      DEAL_CREATED: 'deal',
      DEAL_UPDATED: 'deal',
      DEAL_CLOSED_WON: 'deal',
      DEAL_MOVED_FORWARD: 'deal',
      DEAL_LOST: 'deal',
      CALL_MADE: 'call',
      CALL_ANSWERED: 'call',
      CALL_DURATION_BONUS: 'call',
      CALL_FOLLOW_UP: 'call',
      EMAIL_SENT: 'email',
      EMAIL_REPLIED: 'email',
      EMAIL_OPENED: 'email',
      EMAIL_CLICKED: 'email',
      MEETING_SCHEDULED: 'meeting',
      MEETING_ATTENDED: 'meeting',
      MEETING_COMPLETED: 'meeting',
      TASK_CREATED: 'task',
      TASK_COMPLETED: 'task',
      TASK_OVERDUE: 'task',
    };

    const sourceType = sourceTypeMap[activity] || 'admin';
    
    return await this.awardPoints(
      userId,
      totalPoints,
      sourceType,
      sourceId,
      `${activity.replace(/_/g, ' ').toLowerCase()} activity`
    );
  }

  /**
   * Check and award badges to a user
   */
  async checkAndAwardBadges(userId: string, orgId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('check_and_award_badges', {
        p_user_id: userId,
        p_org_id: orgId
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error checking badges:', error);
    }
  }

  /**
   * Get user's badges
   */
  async getUserBadges(userId: string): Promise<UserBadge[]> {
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge:badges(*)
        `)
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      if (error) {
        if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
          console.warn('Badges tables not yet created, returning mock data');
          return this.getMockUserBadges();
        }
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching user badges:', error);
      return this.getMockUserBadges();
    }
  }

  /**
   * Get all available badges
   */
  async getAllBadges(): Promise<Badge[]> {
    try {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .eq('is_active', true)
        .order('requirement_value', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching badges:', error);
      return [];
    }
  }

  /**
   * Get leaderboard for a specific period
   */
  async getLeaderboard(
    period: 'daily' | 'weekly' | 'monthly' | 'all-time' = 'monthly',
    limit: number = 10
  ): Promise<LeaderboardEntry[]> {
    try {
      let pointsColumn = 'total_points';
      
      switch (period) {
        case 'daily':
          pointsColumn = 'daily_points';
          break;
        case 'weekly':
          pointsColumn = 'weekly_points';
          break;
        case 'monthly':
          pointsColumn = 'monthly_points';
          break;
        default:
          pointsColumn = 'total_points';
      }

      const { data, error } = await supabase
        .from('user_gamification')
        .select(`
          user_id,
          ${pointsColumn},
          deals_closed,
          calls_made,
          emails_sent,
          level,
          user_profiles!inner(name, avatar_url)
        `)
        .order(pointsColumn, { ascending: false })
        .limit(limit);

      if (error) {
        if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
          console.warn('Leaderboard tables not yet created, returning mock data');
          return this.getMockLeaderboard();
        }
        throw error;
      }

      // Transform data to LeaderboardEntry format
      const leaderboard: LeaderboardEntry[] = (data || []).map((entry, index) => ({
        user_id: entry.user_id,
        rank: index + 1,
        points: entry[pointsColumn],
        deals_closed: entry.deals_closed,
        revenue_generated: 0, // Would need to calculate from deals
        activities_completed: entry.calls_made + entry.emails_sent,
        user_name: entry.user_profiles?.name,
        user_avatar: entry.user_profiles?.avatar_url,
        level: entry.level,
      }));

      return leaderboard;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return this.getMockLeaderboard();
    }
  }

  /**
   * Get user's achievements
   */
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
          console.warn('Achievements tables not yet created, returning mock data');
          return this.getMockUserAchievements();
        }
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      return this.getMockUserAchievements();
    }
  }

  /**
   * Get available achievements
   */
  async getAvailableAchievements(): Promise<Achievement[]> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('difficulty', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  }

  /**
   * Update activity counters
   */
  async updateActivityCounter(
    userId: string,
    activity: 'deals_closed' | 'calls_made' | 'emails_sent' | 'meetings_attended' | 'tasks_completed' | 'leads_converted',
    increment: number = 1
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_gamification')
        .update({
          [activity]: supabase.sql`${activity} + ${increment}`,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating activity counter:', error);
      return false;
    }
  }

  /**
   * Update user streak
   */
  async updateStreak(userId: string): Promise<boolean> {
    try {
      const gamification = await this.getUserGamification(userId);
      if (!gamification) return false;

      const today = new Date().toISOString().split('T')[0];
      const lastActivity = gamification.last_activity_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = gamification.current_streak;

      if (lastActivity === yesterdayStr) {
        // Consecutive day, increment streak
        newStreak = gamification.current_streak + 1;
      } else if (lastActivity !== today) {
        // Streak broken, reset to 1
        newStreak = 1;
      }
      // If lastActivity === today, streak stays the same

      const longestStreak = Math.max(gamification.longest_streak, newStreak);

      const { error } = await supabase
        .from('user_gamification')
        .update({
          current_streak: newStreak,
          longest_streak: longestStreak,
          last_activity_date: today,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      // Award streak bonus points
      if (newStreak > gamification.current_streak) {
        let bonusPoints = 0;
        if (newStreak % 30 === 0) bonusPoints = POINTS_CONFIG.MONTHLY_STREAK_BONUS;
        else if (newStreak % 7 === 0) bonusPoints = POINTS_CONFIG.WEEKLY_STREAK_BONUS;
        else bonusPoints = POINTS_CONFIG.DAILY_STREAK_BONUS;

        if (bonusPoints > 0) {
          await this.awardPoints(
            userId,
            bonusPoints,
            'admin',
            undefined,
            `${newStreak}-day streak bonus`
          );
        }
      }

      return true;
    } catch (error) {
      console.error('Error updating streak:', error);
      return false;
    }
  }

  /**
   * Get points transaction history
   */
  async getPointsHistory(userId: string, limit: number = 50): Promise<PointsTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('points_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching points history:', error);
      return [];
    }
  }

  /**
   * Get team challenges
   */
  async getTeamChallenges(): Promise<TeamChallenge[]> {
    try {
      const { data, error } = await supabase
        .from('team_challenges')
        .select(`
          *,
          participants:team_challenge_participants(count)
        `)
        .eq('is_active', true)
        .order('start_date', { ascending: false });

      if (error) {
        if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
          console.warn('Team challenges tables not yet created, returning empty array');
          return [];
        }
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching team challenges:', error);
      return [];
    }
  }

  /**
   * Join a team challenge
   */
  async joinTeamChallenge(challengeId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('team_challenge_participants')
        .insert({
          challenge_id: challengeId,
          user_id: userId,
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error joining team challenge:', error);
      return false;
    }
  }

  /**
   * Get gamification statistics for dashboard
   */
  async getGamificationStats(orgId: string): Promise<{
    totalUsers: number;
    totalPoints: number;
    totalBadges: number;
    activeAchievements: number;
    topPerformer: string;
    averageLevel: number;
  }> {
    try {
      const { data: stats, error } = await supabase
        .from('user_gamification')
        .select('total_points, level, user_profiles!inner(name)')
        .eq('org_id', orgId);

      if (error) throw error;

      const { data: badgeCount } = await supabase
        .from('user_badges')
        .select('id', { count: 'exact' })
        .eq('org_id', orgId);

      const { data: achievementCount } = await supabase
        .from('achievements')
        .select('id', { count: 'exact' })
        .eq('is_active', true);

      const totalUsers = stats?.length || 0;
      const totalPoints = stats?.reduce((sum, user) => sum + user.total_points, 0) || 0;
      const totalBadges = badgeCount?.length || 0;
      const activeAchievements = achievementCount?.length || 0;
      const averageLevel = totalUsers > 0 
        ? stats?.reduce((sum, user) => sum + user.level, 0) / totalUsers 
        : 0;
      
      const topPerformer = stats?.sort((a, b) => b.total_points - a.total_points)[0]?.user_profiles?.name || 'None';

      return {
        totalUsers,
        totalPoints,
        totalBadges,
        activeAchievements,
        topPerformer,
        averageLevel: Math.round(averageLevel * 10) / 10,
      };
    } catch (error) {
      console.error('Error fetching gamification stats:', error);
      return {
        totalUsers: 0,
        totalPoints: 0,
        totalBadges: 0,
        activeAchievements: 0,
        topPerformer: 'None',
        averageLevel: 0,
      };
    }
  }
}

// Singleton instance
export const gamificationService = new GamificationService();

export default GamificationService;
