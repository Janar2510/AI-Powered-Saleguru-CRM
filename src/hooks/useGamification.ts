import { useState, useEffect, useCallback } from 'react';
import { gamificationService, UserGamification, UserBadge, UserAchievement, LeaderboardEntry } from '../services/gamificationService';

interface UseGamificationOptions {
  userId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseGamificationReturn {
  // Data
  userGamification: UserGamification | null;
  userBadges: UserBadge[];
  userAchievements: UserAchievement[];
  leaderboard: LeaderboardEntry[];
  
  // Loading states
  isLoading: boolean;
  isAwarding: boolean;
  
  // Error state
  error: string | null;
  
  // Actions
  awardPoints: (points: number, sourceType: string, sourceId?: string, description?: string) => Promise<boolean>;
  updateActivityCounter: (activity: string, increment?: number) => Promise<boolean>;
  updateStreak: () => Promise<boolean>;
  refreshData: () => Promise<void>;
  refreshLeaderboard: (period?: 'daily' | 'weekly' | 'monthly' | 'all-time') => Promise<void>;
  
  // Quick actions for common activities
  awardDealPoints: (dealId: string, dealValue?: number) => Promise<boolean>;
  awardCallPoints: (callId: string, duration?: number) => Promise<boolean>;
  awardEmailPoints: (emailId: string, type?: 'sent' | 'replied' | 'opened') => Promise<boolean>;
  awardTaskPoints: (taskId: string, type?: 'created' | 'completed') => Promise<boolean>;
  awardMeetingPoints: (meetingId: string, type?: 'scheduled' | 'attended' | 'completed') => Promise<boolean>;
}

export function useGamification(options: UseGamificationOptions = {}): UseGamificationReturn {
  const { userId = 'current-user-id', autoRefresh = false, refreshInterval = 30000 } = options;
  
  // State
  const [userGamification, setUserGamification] = useState<UserGamification | null>(null);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAwarding, setIsAwarding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  const refreshData = useCallback(async () => {
    try {
      setError(null);
      const [gamificationData, badgesData, achievementsData, leaderboardData] = await Promise.all([
        gamificationService.getUserGamification(userId),
        gamificationService.getUserBadges(userId),
        gamificationService.getUserAchievements(userId),
        gamificationService.getLeaderboard('monthly', 10)
      ]);

      setUserGamification(gamificationData);
      setUserBadges(badgesData);
      setUserAchievements(achievementsData);
      setLeaderboard(leaderboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gamification data');
      console.error('Error loading gamification data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Refresh leaderboard for specific period
  const refreshLeaderboard = useCallback(async (period: 'daily' | 'weekly' | 'monthly' | 'all-time' = 'monthly') => {
    try {
      const data = await gamificationService.getLeaderboard(period, 10);
      setLeaderboard(data);
    } catch (err) {
      console.error('Error refreshing leaderboard:', err);
    }
  }, []);

  // Award points with loading state
  const awardPoints = useCallback(async (
    points: number,
    sourceType: string,
    sourceId?: string,
    description?: string
  ): Promise<boolean> => {
    setIsAwarding(true);
    try {
      const success = await gamificationService.awardPoints(userId, points, sourceType as any, sourceId, description);
      if (success) {
        // Refresh user data to get updated points and check for new badges
        await refreshData();
      }
      return success;
    } catch (err) {
      console.error('Error awarding points:', err);
      return false;
    } finally {
      setIsAwarding(false);
    }
  }, [userId, refreshData]);

  // Update activity counter
  const updateActivityCounter = useCallback(async (
    activity: string,
    increment: number = 1
  ): Promise<boolean> => {
    try {
      const success = await gamificationService.updateActivityCounter(userId, activity as any, increment);
      if (success) {
        // Update local state to reflect changes immediately
        setUserGamification(prev => prev ? {
          ...prev,
          [activity]: prev[activity as keyof UserGamification] + increment
        } : null);
      }
      return success;
    } catch (err) {
      console.error('Error updating activity counter:', err);
      return false;
    }
  }, [userId]);

  // Update streak
  const updateStreak = useCallback(async (): Promise<boolean> => {
    try {
      const success = await gamificationService.updateStreak(userId);
      if (success) {
        await refreshData(); // Refresh to get updated streak and any bonus points
      }
      return success;
    } catch (err) {
      console.error('Error updating streak:', err);
      return false;
    }
  }, [userId, refreshData]);

  // Quick action: Award deal points
  const awardDealPoints = useCallback(async (dealId: string, dealValue?: number): Promise<boolean> => {
    let bonusPoints = 0;
    if (dealValue && dealValue > 10000) {
      bonusPoints = Math.floor(dealValue / 10000) * 20; // 20 bonus points per 10k
    }
    
    const success = await awardPoints(100 + bonusPoints, 'deal', dealId, `Deal closed with value: ${dealValue || 'unknown'}`);
    if (success) {
      await updateActivityCounter('deals_closed');
    }
    return success;
  }, [awardPoints, updateActivityCounter]);

  // Quick action: Award call points
  const awardCallPoints = useCallback(async (callId: string, duration?: number): Promise<boolean> => {
    let totalPoints = 10; // Base points for answered call
    if (duration) {
      totalPoints += Math.floor(duration / 60) * 2; // 2 points per minute
    }
    
    const success = await awardPoints(totalPoints, 'call', callId, `Call completed (${duration || 0} minutes)`);
    if (success) {
      await updateActivityCounter('calls_made');
    }
    return success;
  }, [awardPoints, updateActivityCounter]);

  // Quick action: Award email points
  const awardEmailPoints = useCallback(async (
    emailId: string, 
    type: 'sent' | 'replied' | 'opened' = 'sent'
  ): Promise<boolean> => {
    const pointsMap = { sent: 3, replied: 8, opened: 1 };
    const points = pointsMap[type];
    
    const success = await awardPoints(points, 'email', emailId, `Email ${type}`);
    if (success && type === 'sent') {
      await updateActivityCounter('emails_sent');
    }
    return success;
  }, [awardPoints, updateActivityCounter]);

  // Quick action: Award task points
  const awardTaskPoints = useCallback(async (
    taskId: string,
    type: 'created' | 'completed' = 'completed'
  ): Promise<boolean> => {
    const pointsMap = { created: 2, completed: 10 };
    const points = pointsMap[type];
    
    const success = await awardPoints(points, 'task', taskId, `Task ${type}`);
    if (success && type === 'completed') {
      await updateActivityCounter('tasks_completed');
    }
    return success;
  }, [awardPoints, updateActivityCounter]);

  // Quick action: Award meeting points
  const awardMeetingPoints = useCallback(async (
    meetingId: string,
    type: 'scheduled' | 'attended' | 'completed' = 'attended'
  ): Promise<boolean> => {
    const pointsMap = { scheduled: 15, attended: 20, completed: 25 };
    const points = pointsMap[type];
    
    const success = await awardPoints(points, 'meeting', meetingId, `Meeting ${type}`);
    if (success && (type === 'attended' || type === 'completed')) {
      await updateActivityCounter('meetings_attended');
    }
    return success;
  }, [awardPoints, updateActivityCounter]);

  // Load data on mount and set up auto-refresh
  useEffect(() => {
    refreshData();
    
    if (autoRefresh) {
      const interval = setInterval(refreshData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshData, autoRefresh, refreshInterval]);

  return {
    // Data
    userGamification,
    userBadges,
    userAchievements,
    leaderboard,
    
    // Loading states
    isLoading,
    isAwarding,
    
    // Error state
    error,
    
    // Actions
    awardPoints,
    updateActivityCounter,
    updateStreak,
    refreshData,
    refreshLeaderboard,
    
    // Quick actions
    awardDealPoints,
    awardCallPoints,
    awardEmailPoints,
    awardTaskPoints,
    awardMeetingPoints,
  };
}

export default useGamification;


