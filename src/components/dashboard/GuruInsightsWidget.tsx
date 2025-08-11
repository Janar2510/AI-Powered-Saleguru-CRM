import React, { useState, useEffect } from 'react';
import { Bot, Zap, TrendingUp, CheckSquare, AlertTriangle, Target, Calendar, ChevronRight, ArrowRight } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { useGuru } from '../../contexts/GuruContext';
import { supabase } from '../../services/supabase';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import BottleneckPanel from '../ai/BottleneckPanel';
import { Bottleneck } from '../../types/ai';
import { useTasks } from '../../hooks/useTasks';
import { useToastContext } from '../../contexts/ToastContext';

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

interface GuruInsightsWidgetProps {
  loading?: boolean;
}

const GuruInsightsWidget: React.FC<GuruInsightsWidgetProps> = ({ loading }) => {
  const guru = useGuru();
  const [insights, setInsights] = useState<GuruInsight[]>([]);
  const [meetingsCount, setMeetingsCount] = useState(0);
  const [overdueTasksCount, setOverdueTasksCount] = useState(0);
  const [highValueDealsCount, setHighValueDealsCount] = useState(0);
  const [showBottlenecks, setShowBottlenecks] = useState(false);
  const [bottlenecks, setBottlenecks] = useState<Bottleneck[]>([]);
  const { createTask } = useTasks();
  const { showToast } = useToastContext();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
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
        
        // Fetch all tasks and filter for overdue ones
        const { data: allTasks, error: tasksError } = await supabase
          .from('tasks')
          .select('*');
        
        if (tasksError) throw tasksError;
        
        // Calculate overdue tasks based on due date
        const todayForTasks = new Date();
        todayForTasks.setHours(0, 0, 0, 0);
        const overdueTasks = allTasks?.filter(task => {
          const dueDate = new Date(task.due_date);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate < todayForTasks && task.status !== 'completed' && task.status !== 'cancelled';
        }) || [];
        
        setOverdueTasksCount(overdueTasks.length);
        
        // Fetch high-value deals
        const { data: highValueDeals, error: dealsError } = await supabase
          .from('deals')
          .select('*')
          .gt('value', 50000);
        
        if (dealsError) throw dealsError;
        setHighValueDealsCount(highValueDeals?.length || 0);
        
        // Generate insights based on data
        const generatedInsights: GuruInsight[] = [];
        
        if (overdueTasks.length > 0) {
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
      }
    };
    
    fetchData();
  }, []);

  const handleAction = (query: string) => {
    // Placeholder: show a toast or log
    console.log('Guru action:', query);
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

  const handleShowBottlenecks = () => {
    // Sample bottleneck data - in real app, this would come from AI analysis
    const sampleBottlenecks: Bottleneck[] = [
      {
        id: '1',
        type: 'deal',
        entity_id: 'deal-1',
        title: 'TechCorp Enterprise Deal',
        description: 'This deal has been in negotiation for 15 days without progress. Consider scheduling a follow-up call.',
        priority: 'high',
        idle_days: 15,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        type: 'task',
        entity_id: 'task-1',
        title: 'Prepare Q4 Proposal',
        description: 'This task is overdue and blocking other activities. High priority for completion.',
        priority: 'high',
        idle_days: 8,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        type: 'contact',
        entity_id: 'contact-1',
        title: 'John Smith - Decision Maker',
        description: 'No recent communication with this key contact. Risk of losing relationship.',
        priority: 'medium',
        idle_days: 12,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    setBottlenecks(sampleBottlenecks);
    setShowBottlenecks(true);
  };

  const handleViewEntity = (type: string, id: string) => {
    // Navigate to the specific entity
    console.log(`Viewing ${type} with id: ${id}`);
    setShowBottlenecks(false);
    // You can implement navigation logic here
  };

  const handleCreateTaskFromBottleneck = async (bottleneck: Bottleneck) => {
    try {
      const taskData = {
        title: `Follow up on ${bottleneck.title}`,
        description: bottleneck.description,
        priority: bottleneck.priority,
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
        due_time: '',
        type: 'follow-up' as const,
        assigned_to: '',
        tags: []
      };
      
      const taskCreated = await createTask(taskData);
      if (taskCreated) {
        showToast({
          type: 'success',
          title: 'Success',
          description: 'Task created successfully!'
        });
        setShowBottlenecks(false);
      }
    } catch (error) {
      console.error('Error creating task from bottleneck:', error);
      showToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to create task'
      });
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-[#a259ff] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-[#a259ff]" />
            <h3 className="text-lg font-semibold text-white">Guru Insights</h3>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleShowBottlenecks}
              variant="danger"
              size="sm"
              icon={AlertTriangle}
            >
              View Bottlenecks
            </Button>
            <Button
              onClick={() => console.log('Ask Guru clicked')}
              variant="primary"
              size="sm"
              icon={Zap}
            >
              Ask Guru
            </Button>
          </div>
        </div>

        {insights.length > 0 ? (
          <div className="space-y-4">
            {insights.map((insight) => (
              <div key={insight.id} className="bg-[#23233a]/30 rounded-lg p-4 hover:bg-[#23233a]/50 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-white">{insight.title}</h4>
                      {getPriorityBadge(insight.priority)}
                    </div>
                    <p className="text-sm text-[#b0b0d0] mt-1">{insight.description}</p>
                    
                    {insight.action && (
                      <Button
                        onClick={() => handleAction(insight.action!.query)}
                        variant="gradient"
                        size="sm"
                        icon={ChevronRight}
                        iconPosition="right"
                        className="mt-3"
                      >
                        {insight.action.label}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-[#b0b0d0] mx-auto mb-4" />
            <p className="text-[#b0b0d0]">No insights available</p>
            <p className="text-[#b0b0d0] text-sm mt-1">Try asking Guru a question to get started</p>
          </div>
        )}
      </div>

      {/* Bottleneck Panel Modal */}
      {showBottlenecks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl mx-6">
            <BottleneckPanel
              bottlenecks={bottlenecks}
              onClose={() => setShowBottlenecks(false)}
              onViewEntity={handleViewEntity}
              onCreateTask={handleCreateTaskFromBottleneck}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default GuruInsightsWidget;