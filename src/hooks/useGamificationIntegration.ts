// Gamification Integration Hook
// Easy integration with existing CRM actions to automatically award points and update activities

import { useCallback } from 'react';
import { gamificationService, POINTS_CONFIG } from '../services/gamificationService';

interface UseGamificationIntegrationOptions {
  userId?: string;
  showNotifications?: boolean;
  autoUpdateStreak?: boolean;
}

interface UseGamificationIntegrationReturn {
  // Deal actions
  onDealCreated: (dealId: string) => Promise<void>;
  onDealUpdated: (dealId: string) => Promise<void>;
  onDealClosed: (dealId: string, dealValue?: number, isWon?: boolean) => Promise<void>;
  onDealMoved: (dealId: string, fromStage: string, toStage: string) => Promise<void>;
  
  // Call actions
  onCallMade: (callId: string) => Promise<void>;
  onCallAnswered: (callId: string, duration?: number) => Promise<void>;
  onCallFollowUp: (callId: string) => Promise<void>;
  
  // Email actions
  onEmailSent: (emailId: string) => Promise<void>;
  onEmailReplied: (emailId: string) => Promise<void>;
  onEmailOpened: (emailId: string) => Promise<void>;
  onEmailClicked: (emailId: string) => Promise<void>;
  
  // Meeting actions
  onMeetingScheduled: (meetingId: string) => Promise<void>;
  onMeetingAttended: (meetingId: string) => Promise<void>;
  onMeetingCompleted: (meetingId: string) => Promise<void>;
  
  // Task actions
  onTaskCreated: (taskId: string) => Promise<void>;
  onTaskCompleted: (taskId: string) => Promise<void>;
  onTaskOverdue: (taskId: string) => Promise<void>;
  
  // Lead actions
  onLeadCreated: (leadId: string) => Promise<void>;
  onLeadQualified: (leadId: string) => Promise<void>;
  onLeadConverted: (leadId: string) => Promise<void>;
  
  // Special bonus actions
  onFirstActivityOfDay: () => Promise<void>;
  onWeekendActivity: (activityType: string) => Promise<void>;
  onLateNightActivity: (activityType: string) => Promise<void>;
}

export function useGamificationIntegration(
  options: UseGamificationIntegrationOptions = {}
): UseGamificationIntegrationReturn {
  const { 
    userId = 'current-user-id', 
    showNotifications = true, 
    autoUpdateStreak = true 
  } = options;

  // Helper function to show notification (if enabled)
  const showPointsNotification = useCallback((points: number, activity: string) => {
    if (showNotifications && points > 0) {
      // In a real app, this would show a toast notification
      console.log(`🎉 +${points} points for ${activity}!`);
    }
  }, [showNotifications]);

  // Helper function to award points and handle common logic
  const awardActivityPoints = useCallback(async (
    activity: keyof typeof POINTS_CONFIG,
    sourceId: string,
    additionalPoints: number = 0,
    updateCounter?: string
  ) => {
    try {
      const success = await gamificationService.awardActivityPoints(userId, activity, sourceId, additionalPoints);
      
      if (success) {
        const totalPoints = POINTS_CONFIG[activity] + additionalPoints;
        showPointsNotification(totalPoints, activity.replace(/_/g, ' ').toLowerCase());
        
        // Update activity counter if specified
        if (updateCounter) {
          await gamificationService.updateActivityCounter(userId, updateCounter as any);
        }
        
        // Auto-update streak for significant activities
        if (autoUpdateStreak && totalPoints >= 10) {
          await gamificationService.updateStreak(userId);
        }
      }
      
      return success;
    } catch (error) {
      console.error(`Error awarding points for ${activity}:`, error);
      return false;
    }
  }, [userId, showPointsNotification, autoUpdateStreak]);

  // Deal Actions
  const onDealCreated = useCallback(async (dealId: string) => {
    await awardActivityPoints('DEAL_CREATED', dealId);
  }, [awardActivityPoints]);

  const onDealUpdated = useCallback(async (dealId: string) => {
    await awardActivityPoints('DEAL_UPDATED', dealId);
  }, [awardActivityPoints]);

  const onDealClosed = useCallback(async (dealId: string, dealValue?: number, isWon: boolean = true) => {
    if (isWon) {
      let bonusPoints = 0;
      if (dealValue && dealValue > 10000) {
        bonusPoints = Math.floor(dealValue / 10000) * 20; // 20 bonus points per 10k
      }
      await awardActivityPoints('DEAL_CLOSED_WON', dealId, bonusPoints, 'deals_closed');
    } else {
      await awardActivityPoints('DEAL_LOST', dealId, 0);
    }
  }, [awardActivityPoints]);

  const onDealMoved = useCallback(async (dealId: string, fromStage: string, toStage: string) => {
    // Award points for moving deal forward in pipeline
    const stageOrder = ['lead', 'qualified', 'proposal', 'negotiation', 'closed'];
    const fromIndex = stageOrder.indexOf(fromStage.toLowerCase());
    const toIndex = stageOrder.indexOf(toStage.toLowerCase());
    
    if (toIndex > fromIndex) {
      await awardActivityPoints('DEAL_MOVED_FORWARD', dealId);
    }
  }, [awardActivityPoints]);

  // Call Actions
  const onCallMade = useCallback(async (callId: string) => {
    await awardActivityPoints('CALL_MADE', callId, 0, 'calls_made');
  }, [awardActivityPoints]);

  const onCallAnswered = useCallback(async (callId: string, duration?: number) => {
    let bonusPoints = 0;
    if (duration) {
      bonusPoints = Math.floor(duration / 60) * POINTS_CONFIG.CALL_DURATION_BONUS;
    }
    await awardActivityPoints('CALL_ANSWERED', callId, bonusPoints, 'calls_made');
  }, [awardActivityPoints]);

  const onCallFollowUp = useCallback(async (callId: string) => {
    await awardActivityPoints('CALL_FOLLOW_UP', callId);
  }, [awardActivityPoints]);

  // Email Actions
  const onEmailSent = useCallback(async (emailId: string) => {
    await awardActivityPoints('EMAIL_SENT', emailId, 0, 'emails_sent');
  }, [awardActivityPoints]);

  const onEmailReplied = useCallback(async (emailId: string) => {
    await awardActivityPoints('EMAIL_REPLIED', emailId);
  }, [awardActivityPoints]);

  const onEmailOpened = useCallback(async (emailId: string) => {
    await awardActivityPoints('EMAIL_OPENED', emailId);
  }, [awardActivityPoints]);

  const onEmailClicked = useCallback(async (emailId: string) => {
    await awardActivityPoints('EMAIL_CLICKED', emailId);
  }, [awardActivityPoints]);

  // Meeting Actions
  const onMeetingScheduled = useCallback(async (meetingId: string) => {
    await awardActivityPoints('MEETING_SCHEDULED', meetingId);
  }, [awardActivityPoints]);

  const onMeetingAttended = useCallback(async (meetingId: string) => {
    await awardActivityPoints('MEETING_ATTENDED', meetingId, 0, 'meetings_attended');
  }, [awardActivityPoints]);

  const onMeetingCompleted = useCallback(async (meetingId: string) => {
    await awardActivityPoints('MEETING_COMPLETED', meetingId, 0, 'meetings_attended');
  }, [awardActivityPoints]);

  // Task Actions
  const onTaskCreated = useCallback(async (taskId: string) => {
    await awardActivityPoints('TASK_CREATED', taskId);
  }, [awardActivityPoints]);

  const onTaskCompleted = useCallback(async (taskId: string) => {
    await awardActivityPoints('TASK_COMPLETED', taskId, 0, 'tasks_completed');
  }, [awardActivityPoints]);

  const onTaskOverdue = useCallback(async (taskId: string) => {
    await awardActivityPoints('TASK_OVERDUE', taskId);
  }, [awardActivityPoints]);

  // Lead Actions
  const onLeadCreated = useCallback(async (leadId: string) => {
    await awardActivityPoints('LEAD_CREATED', leadId);
  }, [awardActivityPoints]);

  const onLeadQualified = useCallback(async (leadId: string) => {
    await awardActivityPoints('LEAD_QUALIFIED', leadId);
  }, [awardActivityPoints]);

  const onLeadConverted = useCallback(async (leadId: string) => {
    await awardActivityPoints('LEAD_CONVERTED', leadId, 0, 'leads_converted');
  }, [awardActivityPoints]);

  // Special Bonus Actions
  const onFirstActivityOfDay = useCallback(async () => {
    await awardActivityPoints('FIRST_ACTIVITY_OF_DAY', 'daily-bonus');
  }, [awardActivityPoints]);

  const onWeekendActivity = useCallback(async (activityType: string) => {
    await gamificationService.awardPoints(
      userId,
      POINTS_CONFIG.WEEKEND_ACTIVITY,
      'admin',
      undefined,
      `Weekend ${activityType} activity`
    );
    showPointsNotification(POINTS_CONFIG.WEEKEND_ACTIVITY, `weekend ${activityType}`);
  }, [userId, showPointsNotification]);

  const onLateNightActivity = useCallback(async (activityType: string) => {
    await gamificationService.awardPoints(
      userId,
      POINTS_CONFIG.LATE_NIGHT_ACTIVITY,
      'admin',
      undefined,
      `Late night ${activityType} activity`
    );
    showPointsNotification(POINTS_CONFIG.LATE_NIGHT_ACTIVITY, `late night ${activityType}`);
  }, [userId, showPointsNotification]);

  return {
    // Deal actions
    onDealCreated,
    onDealUpdated,
    onDealClosed,
    onDealMoved,
    
    // Call actions
    onCallMade,
    onCallAnswered,
    onCallFollowUp,
    
    // Email actions
    onEmailSent,
    onEmailReplied,
    onEmailOpened,
    onEmailClicked,
    
    // Meeting actions
    onMeetingScheduled,
    onMeetingAttended,
    onMeetingCompleted,
    
    // Task actions
    onTaskCreated,
    onTaskCompleted,
    onTaskOverdue,
    
    // Lead actions
    onLeadCreated,
    onLeadQualified,
    onLeadConverted,
    
    // Special bonus actions
    onFirstActivityOfDay,
    onWeekendActivity,
    onLateNightActivity,
  };
}

export default useGamificationIntegration;

