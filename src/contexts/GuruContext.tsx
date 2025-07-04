import React, { createContext, useContext, useState } from 'react';
import { Contact, Deal, Task } from '../services/supabase';

interface GuruInsight {
  id: string;
  type: 'tip' | 'warning' | 'opportunity' | 'reminder';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  category: 'sales' | 'automation' | 'analytics' | 'general';
  timestamp: Date;
  actionable?: boolean;
  actionText?: string;
  actionUrl?: string;
}

interface GuruContextType {
  insights: GuruInsight[];
  isLoading: boolean;
  generateInsights: (data: {
    contacts?: Contact[];
    deals?: Deal[];
    tasks?: Task[];
  }) => Promise<void>;
  addInsight: (insight: Omit<GuruInsight, 'id' | 'timestamp'>) => void;
  clearInsights: () => void;
  getSalesTips: () => Promise<string[]>;
  analyzeLead: (contact: Contact) => Promise<{
    score: number;
    recommendations: string[];
    nextSteps: string[];
  }>;
  suggestAutomations: () => Promise<{
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
  }[]>;
}

const GuruContext = createContext<GuruContextType | undefined>(undefined);

export const useGuru = () => {
  const context = useContext(GuruContext);
  if (context === undefined) {
    throw new Error('useGuru must be used within a GuruProvider');
  }
  return context;
};

export const GuruProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [insights, setInsights] = useState<GuruInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateInsights = async (data: {
    contacts?: Contact[];
    deals?: Deal[];
    tasks?: Task[];
  }) => {
    setIsLoading(true);
    
    try {
      const newInsights: GuruInsight[] = [];
      
      // Analyze contacts
      if (data.contacts) {
        const highValueContacts = data.contacts.filter(c => c.lead_score && c.lead_score > 7);
        if (highValueContacts.length > 0) {
          newInsights.push({
            id: Date.now().toString(),
            type: 'opportunity',
            title: 'High-Value Leads Detected',
            message: `You have ${highValueContacts.length} contacts with lead scores above 7. Consider prioritizing follow-ups.`,
            priority: 'high',
            category: 'sales',
            timestamp: new Date(),
            actionable: true,
            actionText: 'View High-Value Leads',
            actionUrl: '/contacts?filter=high-value',
          });
        }
      }

      // Analyze deals
      if (data.deals) {
        const closingDeals = data.deals.filter(d => 
          d.stage === 'negotiation' || d.stage === 'proposal'
        );
        if (closingDeals.length > 0) {
          newInsights.push({
            id: (Date.now() + 1).toString(),
            type: 'reminder',
            title: 'Deals Closing Soon',
            message: `You have ${closingDeals.length} deals in negotiation/proposal stage. Focus on closing these opportunities.`,
            priority: 'medium',
            category: 'sales',
            timestamp: new Date(),
            actionable: true,
            actionText: 'View Closing Deals',
            actionUrl: '/deals?filter=closing',
          });
        }
      }

      // Analyze tasks
      if (data.tasks) {
        const overdueTasks = data.tasks.filter(t => 
          t.status === 'pending' && t.due_date && new Date(t.due_date) < new Date()
        );
        if (overdueTasks.length > 0) {
          newInsights.push({
            id: (Date.now() + 2).toString(),
            type: 'warning',
            title: 'Overdue Tasks',
            message: `You have ${overdueTasks.length} overdue tasks. Review and update their status.`,
            priority: 'high',
            category: 'general',
            timestamp: new Date(),
            actionable: true,
            actionText: 'View Overdue Tasks',
            actionUrl: '/tasks?filter=overdue',
          });
        }
      }

      // Add general sales tips
      newInsights.push({
        id: (Date.now() + 3).toString(),
        type: 'tip',
        title: 'Sales Tip of the Day',
        message: 'Follow up with prospects within 24 hours of initial contact. Response time is crucial for conversion.',
        priority: 'low',
        category: 'sales',
        timestamp: new Date(),
      });

      setInsights(prev => [...newInsights, ...prev].slice(0, 10)); // Keep last 10 insights
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addInsight = (insight: Omit<GuruInsight, 'id' | 'timestamp'>) => {
    const newInsight: GuruInsight = {
      ...insight,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setInsights(prev => [newInsight, ...prev].slice(0, 10));
  };

  const clearInsights = () => {
    setInsights([]);
  };

  const getSalesTips = async (): Promise<string[]> => {
    // Simulated AI-generated sales tips
    return [
      'Personalize your outreach by mentioning recent company news or achievements',
      'Use social proof and testimonials to build trust with prospects',
      'Focus on solving problems rather than selling features',
      'Follow up consistently but don\'t be pushy - timing is everything',
      'Ask open-ended questions to understand prospect needs better',
      'Use video calls to build stronger relationships with prospects',
      'Create urgency without being aggressive',
      'Always have a clear next step in mind for each interaction',
    ];
  };

  const analyzeLead = async (contact: Contact): Promise<{
    score: number;
    recommendations: string[];
    nextSteps: string[];
  }> => {
    // Simulated AI lead analysis
    const baseScore = contact.lead_score || 5;
    const recommendations: string[] = [];
    const nextSteps: string[] = [];

    if (baseScore < 3) {
      recommendations.push('Consider nurturing this lead with educational content');
      recommendations.push('Focus on building awareness before pushing for sales');
      nextSteps.push('Send welcome email with valuable resources');
      nextSteps.push('Schedule follow-up in 1 week');
    } else if (baseScore < 7) {
      recommendations.push('Engage with personalized content and offers');
      recommendations.push('Schedule a discovery call to understand needs better');
      nextSteps.push('Send personalized proposal or demo');
      nextSteps.push('Follow up within 48 hours');
    } else {
      recommendations.push('This is a high-value prospect - prioritize engagement');
      recommendations.push('Prepare for advanced sales conversations');
      nextSteps.push('Schedule executive presentation');
      nextSteps.push('Prepare contract and pricing discussion');
    }

    return {
      score: baseScore,
      recommendations,
      nextSteps,
    };
  };

  const suggestAutomations = async (): Promise<{
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
  }[]> => {
    return [
      {
        title: 'Lead Nurturing Sequence',
        description: 'Automatically send educational content to new leads over 30 days',
        impact: 'high',
      },
      {
        title: 'Follow-up Reminders',
        description: 'Send reminders for overdue follow-ups and task completion',
        impact: 'medium',
      },
      {
        title: 'Deal Stage Notifications',
        description: 'Notify team when deals move to closing stages',
        impact: 'medium',
      },
      {
        title: 'Email Open Tracking',
        description: 'Track email engagement and trigger follow-up actions',
        impact: 'high',
      },
    ];
  };

  const value = {
    insights,
    isLoading,
    generateInsights,
    addInsight,
    clearInsights,
    getSalesTips,
    analyzeLead,
    suggestAutomations,
  };

  return (
    <GuruContext.Provider value={value}>
      {children}
    </GuruContext.Provider>
  );
}; 