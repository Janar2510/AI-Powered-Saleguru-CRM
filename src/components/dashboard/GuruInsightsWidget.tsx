import React, { useState, useEffect } from 'react';
import { Bot, Zap, TrendingUp, CheckSquare, AlertTriangle, Target, Calendar, ChevronRight } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { useGuru } from '../../contexts/GuruContext';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface GuruInsight {
  id: string;
  title: string;
  description: string;
  type: 'deal' | 'task' | 'lead' | 'calendar';
  priority: 'high' | 'medium' | 'low';
  action?: {
    label: string;
    query: string;
  };
}

const GuruInsightsWidget: React.FC = () => {
  const { openGuru, sendMessage } = useGuru();
  const [insights, setInsights] = useState<GuruInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [meetingsCount, setMeetingsCount] = useState(0);
  const [overdueTasksCount, setOverdueTasksCount] = useState(0);
  const [highValueDealsCount, setHighValueDealsCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch calendar events for this week
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7); // End on Saturday
        
        const { data: calendarEvents, error: calendarError } = await supabase
          .from('calendar_events')
          .select('*')
          .gte('start_time', startOfWeek.toISOString())
          .lt('start_time', endOfWeek.toISOString());
        
        if (calendarError) throw calendarError;
        
        // Count meetings
        const meetings = calendarEvents?.filter(event => 
          event.event_type === 'meeting' || event.event_type === 'call'
        ) || [];
        setMeetingsCount(meetings.length);
        
        // Fetch overdue tasks
        const { data: overdueTasks, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('status', 'overdue');
        
        if (tasksError) throw tasksError;
        setOverdueTasksCount(overdueTasks?.length || 0);
        
        // Fetch high-value deals
        const { data: highValueDeals, error: dealsError } = await supabase
          .from('deals')
          .select('*')
          .gt('value', 50000)
          .not('stage_id', 'in', '("closed-won","closed-lost")');
        
        if (dealsError) throw dealsError;
        setHighValueDealsCount(highValueDeals?.length || 0);
        
        // Generate insights based on data
        const generatedInsights: GuruInsight[] = [];
        
        if (overdueTasks?.length > 0) {
          generatedInsights.push({
            id: 'overdue-tasks',
            title: `${overdueTasks.length} overdue tasks need attention`,
            description: `You have ${overdueTasks.length} tasks that are past their due date. The oldest is "${overdueTasks[0]?.title}" from ${new Date(overdueTasks[0]?.due_date).toLocaleDateString()}.`,
            type: 'task',
            priority: 'high',
            action: {
              label: 'View overdue tasks',
              query: 'Show me all overdue tasks'
            }
          });
        }
        
        if (meetings.length > 0) {
          const busiestDay = getBusiestDay(meetings);
          generatedInsights.push({
            id: 'upcoming-meetings',
            title: `You have ${meetings.length} meetings scheduled this week`,
            description: `Your busiest day is ${busiestDay} with ${meetings.filter(m => new Date(m.start_time).getDay() === getDayNumber(busiestDay)).length} meetings. Consider preparing materials in advance.`,
            type: 'calendar',
            priority: 'medium',
            action: {
              label: 'Prepare meeting materials',
              query: 'Help me prepare for this week\'s meetings'
            }
          });
        }
        
        if (highValueDeals?.length > 0) {
          generatedInsights.push({
            id: 'high-value-deals',
            title: `${highValueDeals.length} high-value deals in progress`,
            description: `You have ${highValueDeals.length} deals worth over $50K in your pipeline. The largest is "${highValueDeals.sort((a, b) => b.value - a.value)[0]?.title}" at $${(highValueDeals.sort((a, b) => b.value - a.value)[0]?.value / 1000).toFixed(0)}K.`,
            type: 'deal',
            priority: 'high',
            action: {
              label: 'Analyze high-value deals',
              query: 'Analyze my high-value deals over $50K'
            }
          });
        }
        
        // Add a pipeline health check if needed
        if (generatedInsights.length < 3) {
          generatedInsights.push({
            id: 'pipeline-health',
            title: 'Pipeline health check recommended',
            description: 'It\'s been 14 days since your last pipeline review. Consider analyzing deal progress and conversion rates.',
            type: 'deal',
            priority: 'medium',
            action: {
              label: 'Analyze pipeline health',
              query: 'Analyze my sales pipeline health'
            }
          });
        }
        
        setInsights(generatedInsights);
      } catch (error) {
        console.error('Error fetching insights:', error);
        
        // Fallback insights
        setInsights([
          {
            id: 'overdue-tasks',
            title: 'Overdue tasks need attention',
            description: 'You have several tasks that are past their due date. Consider prioritizing these to maintain momentum.',
            type: 'task',
            priority: 'high',
            action: {
              label: 'View overdue tasks',
              query: 'Show me all overdue tasks'
            }
          },
          {
            id: 'upcoming-meetings',
            title: 'Upcoming meetings this week',
            description: 'You have several client meetings scheduled. Consider preparing materials in advance.',
            type: 'calendar',
            priority: 'medium',
            action: {
              label: 'Prepare meeting materials',
              query: 'Help me prepare for this week\'s meetings'
            }
          },
          {
            id: 'pipeline-health',
            title: 'Pipeline health check recommended',
            description: 'It\'s been 14 days since your last pipeline review. Consider analyzing deal progress and conversion rates.',
            type: 'deal',
            priority: 'medium',
            action: {
              label: 'Analyze pipeline health',
              query: 'Analyze my sales pipeline health'
            }
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleAction = (query: string) => {
    openGuru();
    // Small delay to ensure panel is open
    setTimeout(() => {
      sendMessage(query);
    }, 300);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'deal':
        return <Target className="w-5 h-5 text-primary-500" />;
      case 'task':
        return <CheckSquare className="w-5 h-5 text-orange-500" />;
      case 'lead':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'calendar':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      default:
        return <Zap className="w-5 h-5 text-primary-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="danger" size="sm">High Priority</Badge>;
      case 'medium':
        return <Badge variant="warning" size="sm">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="success" size="sm">Low Priority</Badge>;
      default:
        return null;
    }
  };
  
  // Helper function to get the busiest day of the week
  const getBusiestDay = (events: any[]) => {
    const dayCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun, Mon, Tue, Wed, Thu, Fri, Sat
    
    events.forEach(event => {
      const day = new Date(event.start_time).getDay();
      dayCounts[day]++;
    });
    
    const busiestDayIndex = dayCounts.indexOf(Math.max(...dayCounts));
    return getDayName(busiestDayIndex);
  };
  
  // Helper function to get day name from index
  const getDayName = (dayIndex: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
  };
  
  // Helper function to get day number from name
  const getDayNumber = (dayName: string) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days.indexOf(dayName);
  };

  return (
    <Card className="bg-gradient-to-r from-primary-600/10 to-purple-600/10 border border-primary-600/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-600/30 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">SaleToruGuru Insights</h3>
            <p className="text-sm text-secondary-300">AI-powered recommendations for your day</p>
          </div>
        </div>
        <button
          onClick={openGuru}
          className="btn-primary text-sm flex items-center space-x-2"
        >
          <Zap className="w-4 h-4" />
          <span>Ask Guru</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : insights.length > 0 ? (
        <div className="space-y-4">
          {insights.map((insight) => (
            <div key={insight.id} className="bg-secondary-700/50 rounded-lg p-4 hover:bg-secondary-700/70 transition-colors">
              <div className="flex items-start space-x-3">
                <div className="mt-1">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-white">{insight.title}</h4>
                    {getPriorityBadge(insight.priority)}
                  </div>
                  <p className="text-sm text-secondary-300 mt-1">{insight.description}</p>
                  
                  {insight.action && (
                    <button
                      onClick={() => handleAction(insight.action!.query)}
                      className="mt-3 text-sm text-primary-400 hover:text-primary-300 flex items-center space-x-1"
                    >
                      <span>{insight.action.label}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-secondary-600 mx-auto mb-4" />
          <p className="text-secondary-400">No insights available</p>
          <p className="text-secondary-500 text-sm mt-1">Try asking Guru a question to get started</p>
        </div>
      )}
    </Card>
  );
};

export default GuruInsightsWidget;