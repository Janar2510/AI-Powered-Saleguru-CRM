import { supabase } from './supabase';

export interface PulseMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  trend: 'up' | 'down' | 'stable';
  icon: string;
  color: string;
  description: string;
  target?: number;
  unit?: string;
  created_at: string;
  updated_at: string;
}

export interface PulseActivity {
  id: string;
  type: 'deal' | 'task' | 'email' | 'call' | 'meeting';
  title: string;
  description: string;
  timestamp: string;
  user_id: string;
  user_name: string;
  status: 'completed' | 'pending' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  deal_id?: string;
  contact_id?: string;
  company_id?: string;
  created_at: string;
  updated_at: string;
}

export interface PulseFilter {
  timeRange?: 'today' | 'week' | 'month' | 'quarter' | 'year';
  activityType?: 'all' | 'deal' | 'task' | 'email' | 'call' | 'meeting';
  userId?: string;
  status?: string;
  priority?: string;
  search?: string;
}

export class PulseService {
  // Get pulse metrics
  static async getPulseMetrics(timeRange: string = 'week'): Promise<PulseMetric[]> {
    try {
      // For now, return demo data
      // TODO: Implement real API call when database is ready
      return [
        {
          id: 'deals-created',
          name: 'Deals Created',
          value: 24,
          change: 12.5,
          changeType: 'increase',
          trend: 'up',
          icon: 'Target',
          color: '#a259ff',
          description: 'New deals added this period',
          target: 30,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'revenue',
          name: 'Revenue Generated',
          value: 125000,
          change: 8.3,
          changeType: 'increase',
          trend: 'up',
          icon: 'DollarSign',
          color: '#43e7ad',
          description: 'Total revenue this period',
          unit: 'USD',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'conversion-rate',
          name: 'Conversion Rate',
          value: 68.5,
          change: -2.1,
          changeType: 'decrease',
          trend: 'down',
          icon: 'TrendingUp',
          color: '#f59e0b',
          description: 'Lead to deal conversion',
          unit: '%',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'active-users',
          name: 'Active Users',
          value: 156,
          change: 15.2,
          changeType: 'increase',
          trend: 'up',
          icon: 'Users',
          color: '#377dff',
          description: 'Users active this period',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'avg-deal-size',
          name: 'Avg Deal Size',
          value: 5200,
          change: 5.8,
          changeType: 'increase',
          trend: 'up',
          icon: 'BarChart3',
          color: '#ef4444',
          description: 'Average deal value',
          unit: 'USD',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'response-time',
          name: 'Response Time',
          value: 2.4,
          change: -12.5,
          changeType: 'decrease',
          trend: 'up',
          icon: 'Clock',
          color: '#8b5cf6',
          description: 'Average response time',
          unit: 'hours',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    } catch (error) {
      console.error('Error fetching pulse metrics:', error);
      throw error;
    }
  }

  // Get pulse activities
  static async getPulseActivities(filters: PulseFilter = {}): Promise<PulseActivity[]> {
    try {
      // For now, return demo data
      // TODO: Implement real API call when database is ready
      return [
        {
          id: '1',
          type: 'deal',
          title: 'Enterprise Deal Closed',
          description: 'TechCorp software package deal worth $50,000 closed successfully',
          timestamp: '2 hours ago',
          user_id: 'user-1',
          user_name: 'Sarah Johnson',
          status: 'completed',
          priority: 'high',
          deal_id: 'deal-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          type: 'task',
          title: 'Follow-up Call Scheduled',
          description: 'Follow-up call with StartupXYZ CEO scheduled for tomorrow',
          timestamp: '4 hours ago',
          user_id: 'user-2',
          user_name: 'Mike Chen',
          status: 'pending',
          priority: 'medium',
          contact_id: 'contact-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          type: 'email',
          title: 'Proposal Sent',
          description: 'Custom proposal sent to Demo Company Inc. for cloud migration',
          timestamp: '6 hours ago',
          user_id: 'user-3',
          user_name: 'Alex Rodriguez',
          status: 'completed',
          priority: 'high',
          company_id: 'company-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '4',
          type: 'call',
          title: 'Discovery Call Completed',
          description: 'Initial discovery call with NewTech Solutions completed',
          timestamp: '8 hours ago',
          user_id: 'user-4',
          user_name: 'Emily Davis',
          status: 'completed',
          priority: 'medium',
          contact_id: 'contact-2',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '5',
          type: 'meeting',
          title: 'Team Standup',
          description: 'Daily team standup meeting completed with 8 participants',
          timestamp: '1 day ago',
          user_id: 'user-5',
          user_name: 'David Wilson',
          status: 'completed',
          priority: 'low',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '6',
          type: 'deal',
          title: 'Qualification Meeting',
          description: 'Qualification meeting with potential client scheduled',
          timestamp: '1 day ago',
          user_id: 'user-6',
          user_name: 'Lisa Thompson',
          status: 'pending',
          priority: 'high',
          deal_id: 'deal-2',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    } catch (error) {
      console.error('Error fetching pulse activities:', error);
      throw error;
    }
  }

  // Create pulse activity
  static async createPulseActivity(activity: Partial<PulseActivity>): Promise<PulseActivity> {
    try {
      // TODO: Implement real API call when database is ready
      const newActivity: PulseActivity = {
        id: `activity-${Date.now()}`,
        type: activity.type || 'task',
        title: activity.title || '',
        description: activity.description || '',
        timestamp: new Date().toISOString(),
        user_id: activity.user_id || 'current-user',
        user_name: activity.user_name || 'Current User',
        status: activity.status || 'pending',
        priority: activity.priority || 'medium',
        deal_id: activity.deal_id,
        contact_id: activity.contact_id,
        company_id: activity.company_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return newActivity;
    } catch (error) {
      console.error('Error creating pulse activity:', error);
      throw error;
    }
  }

  // Update pulse activity
  static async updatePulseActivity(id: string, updates: Partial<PulseActivity>): Promise<PulseActivity> {
    try {
      // TODO: Implement real API call when database is ready
      const updatedActivity: PulseActivity = {
        id,
        type: updates.type || 'task',
        title: updates.title || '',
        description: updates.description || '',
        timestamp: updates.timestamp || new Date().toISOString(),
        user_id: updates.user_id || 'current-user',
        user_name: updates.user_name || 'Current User',
        status: updates.status || 'pending',
        priority: updates.priority || 'medium',
        deal_id: updates.deal_id,
        contact_id: updates.contact_id,
        company_id: updates.company_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return updatedActivity;
    } catch (error) {
      console.error('Error updating pulse activity:', error);
      throw error;
    }
  }

  // Delete pulse activity
  static async deletePulseActivity(id: string): Promise<void> {
    try {
      // TODO: Implement real API call when database is ready
      console.log('Deleting pulse activity:', id);
    } catch (error) {
      console.error('Error deleting pulse activity:', error);
      throw error;
    }
  }

  // Get pulse insights
  static async getPulseInsights(timeRange: string = 'week'): Promise<any> {
    try {
      // TODO: Implement real API call when database is ready
      return {
        topPerformers: [
          { name: 'Sarah Johnson', deals: 8, revenue: 125000 },
          { name: 'Mike Chen', deals: 6, revenue: 89000 },
          { name: 'Alex Rodriguez', deals: 5, revenue: 67000 }
        ],
        trends: [
          { metric: 'Deals Created', trend: 'up', change: 12.5 },
          { metric: 'Conversion Rate', trend: 'down', change: -2.1 },
          { metric: 'Response Time', trend: 'up', change: -12.5 }
        ],
        alerts: [
          { type: 'warning', message: 'Conversion rate dropped by 2.1% this week' },
          { type: 'success', message: 'Response time improved by 12.5%' },
          { type: 'info', message: '5 new deals created today' }
        ]
      };
    } catch (error) {
      console.error('Error fetching pulse insights:', error);
      throw error;
    }
  }
} 