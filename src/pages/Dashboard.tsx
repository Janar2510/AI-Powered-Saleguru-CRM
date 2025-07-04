import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  Clock, 
  AlertTriangle,
  CheckSquare,
  MessageSquare,
  Mail,
  Bot,
  ChevronRight,
  ArrowRight,
  Zap,
  Sparkles
} from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { useGuru } from '../contexts/GuruContext';
import { useToastContext } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import Container from '../components/layout/Container';
import Spline from '@splinetool/react-spline';
import GuruInsightsWidget from '../components/dashboard/GuruInsightsWidget';
import TaskSummaryWidget from '../components/dashboard/TaskSummaryWidget';
import PipelineWidget from '../components/dashboard/PipelineWidget';
import DashboardAnalytics from '../components/dashboard/DashboardAnalytics';
import { getSupabaseClient, isSupabaseAvailable } from '../lib/supabase';

// Get the centralized Supabase client
const supabase = isSupabaseAvailable() ? getSupabaseClient() : null;

const Dashboard: React.FC = () => {
  const { openGuru, sendMessage } = useGuru();
  const { showToast } = useToastContext();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState({
    deals: {
      total: 0,
      value: 0,
      byStage: [] as {id: string, name: string, count: number, value: number}[],
      recentlyUpdated: [] as any[]
    },
    tasks: {
      total: 0,
      completed: 0,
      overdue: 0,
      today: [] as any[]
    },
    contacts: {
      total: 0,
      newThisWeek: 0
    },
    performance: {
      conversionRate: 0,
      avgDealCycle: 0,
      avgDealSize: 0
    }
  });
  
  // Sample data for demo mode
  const getSampleData = () => {
    const sampleDeals = [
      { id: '1', title: 'Enterprise Software Package', company: 'TechCorp Inc.', value: 75000, stage_id: 'proposal', contact: 'John Smith', updated_at: new Date().toISOString() },
      { id: '2', title: 'Cloud Migration Project', company: 'StartupXYZ', value: 45000, stage_id: 'negotiation', contact: 'Sarah Wilson', updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
      { id: '3', title: 'Security Audit Package', company: 'FinanceCore', value: 30000, stage_id: 'qualified', contact: 'Mike Chen', updated_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() }
    ];
    
    const sampleStages = [
      { id: 'lead', name: 'Lead', sort_order: 1 },
      { id: 'qualified', name: 'Qualified', sort_order: 2 },
      { id: 'proposal', name: 'Proposal', sort_order: 3 },
      { id: 'negotiation', name: 'Negotiation', sort_order: 4 },
      { id: 'closed-won', name: 'Closed Won', sort_order: 5 }
    ];
    
    const sampleTasks = [
      { id: '1', title: 'Follow up with TechCorp', due_date: new Date().toISOString().split('T')[0], completed: false },
      { id: '2', title: 'Prepare proposal for StartupXYZ', due_date: new Date().toISOString().split('T')[0], completed: false },
      { id: '3', title: 'Schedule demo call', due_date: new Date().toISOString().split('T')[0], completed: true },
      { id: '4', title: 'Review contract terms', due_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: false }
    ];
    
    const sampleContacts = [
      { id: '1', name: 'John Smith', created_at: new Date().toISOString() },
      { id: '2', name: 'Sarah Wilson', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { id: '3', name: 'Mike Chen', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() }
    ];
    
    return { sampleDeals, sampleStages, sampleTasks, sampleContacts };
  };
  
  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setConnectionError(null);
      
      try {
        if (!supabase) {
          // Use sample data if Supabase is not configured
          const { sampleDeals, sampleStages, sampleTasks, sampleContacts } = getSampleData();
          
          // Process sample data
          const dealsByStage = sampleStages.map(stage => {
            const stageDeals = sampleDeals.filter(deal => deal.stage_id === stage.id);
            return {
              id: stage.id,
              name: stage.name,
              count: stageDeals.length,
              value: stageDeals.reduce((sum, deal) => sum + (deal.value || 0), 0)
            };
          });
          
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const todaysTasks = sampleTasks
            .filter(task => {
              const taskDate = new Date(task.due_date);
              taskDate.setHours(0, 0, 0, 0);
              return taskDate.getTime() === today.getTime() && !task.completed;
            })
            .slice(0, 4);
          
          const totalDeals = sampleDeals.length;
          const closedDeals = sampleDeals.filter(deal => deal.stage_id === 'closed-won').length;
          const conversionRate = totalDeals > 0 ? Math.round((closedDeals / totalDeals) * 100) : 24;
          
          const totalValue = sampleDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
          const avgDealSize = totalDeals > 0 ? Math.round(totalValue / totalDeals) : 50000;
          
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          const newContacts = sampleContacts.filter(contact => 
            new Date(contact.created_at) >= oneWeekAgo
          ).length;
          
          setDashboardData({
            deals: {
              total: totalDeals,
              value: totalValue,
              byStage: dealsByStage,
              recentlyUpdated: sampleDeals
            },
            tasks: {
              total: sampleTasks.length,
              completed: sampleTasks.filter(task => task.completed).length,
              overdue: sampleTasks.filter(task => 
                new Date(task.due_date) < today && !task.completed
              ).length,
              today: todaysTasks
            },
            contacts: {
              total: sampleContacts.length,
              newThisWeek: newContacts
            },
            performance: {
              conversionRate,
              avgDealCycle: 28,
              avgDealSize
            }
          });
          
          setConnectionError('Demo Mode: Connect to Supabase for live data');
          return;
        }
        
        // Fetch deals with timeout
        const dealsPromise = Promise.race([
          supabase.from('deals').select('*'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 10000))
        ]);
        
        const { data: deals, error: dealsError } = await dealsPromise as any;
        
        if (dealsError) throw dealsError;
        
        // Fetch stages with timeout
        const stagesPromise = Promise.race([
          supabase.from('stages').select('*').order('sort_order'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 10000))
        ]);
        
        const { data: stages, error: stagesError } = await stagesPromise as any;
        
        if (stagesError) throw stagesError;
        
        // Fetch tasks with timeout
        const tasksPromise = Promise.race([
          supabase.from('tasks').select('*'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 10000))
        ]);
        
        const { data: tasks, error: tasksError } = await tasksPromise as any;
        
        if (tasksError) throw tasksError;
        
        // Fetch contacts with timeout
        const contactsPromise = Promise.race([
          supabase.from('contacts').select('*'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 10000))
        ]);
        
        const { data: contacts, error: contactsError } = await contactsPromise as any;
        
        if (contactsError) throw contactsError;
        
        // Process data
        const dealsData = deals || [];
        const stagesData = stages || [];
        const tasksData = tasks || [];
        const contactsData = contacts || [];
        
        // Calculate deals by stage
        const dealsByStage = stagesData.map(stage => {
          const stageDeals = dealsData.filter(deal => deal.stage_id === stage.id);
          return {
            id: stage.id,
            name: stage.name,
            count: stageDeals.length,
            value: stageDeals.reduce((sum, deal) => sum + (deal.value || 0), 0)
          };
        });
        
        // Get recently updated deals
        const recentDeals = [...dealsData]
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          .slice(0, 3);
        
        // Get today's tasks
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const todaysTasks = tasksData
          .filter(task => {
            const taskDate = new Date(task.due_date);
            taskDate.setHours(0, 0, 0, 0);
            return taskDate.getTime() === today.getTime() && !task.completed;
          })
          .slice(0, 4);
        
        // Calculate performance metrics
        const totalDeals = dealsData.length;
        const closedDeals = dealsData.filter(deal => deal.stage_id === 'closed-won').length;
        const conversionRate = totalDeals > 0 ? Math.round((closedDeals / totalDeals) * 100) : 0;
        
        const totalValue = dealsData.reduce((sum, deal) => sum + (deal.value || 0), 0);
        const avgDealSize = totalDeals > 0 ? Math.round(totalValue / totalDeals) : 0;
        
        // Count new contacts this week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const newContacts = contactsData.filter(contact => 
          new Date(contact.created_at) >= oneWeekAgo
        ).length;
        
        // Update dashboard data
        setDashboardData({
          deals: {
            total: totalDeals,
            value: totalValue,
            byStage: dealsByStage,
            recentlyUpdated: recentDeals
          },
          tasks: {
            total: tasksData.length,
            completed: tasksData.filter(task => task.completed).length,
            overdue: tasksData.filter(task => 
              new Date(task.due_date) < today && !task.completed
            ).length,
            today: todaysTasks
          },
          contacts: {
            total: contactsData.length,
            newThisWeek: newContacts
          },
          performance: {
            conversionRate,
            avgDealCycle: 28, // Placeholder
            avgDealSize
          }
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        
        // Set connection error message
        if (error instanceof Error) {
          if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
            setConnectionError('Unable to connect to database. Please check your internet connection and Supabase configuration.');
          } else if (error.message.includes('timeout')) {
            setConnectionError('Request timed out. Please try again.');
          } else {
            setConnectionError(`Database error: ${error.message}`);
          }
        } else {
          setConnectionError('An unexpected error occurred while loading data.');
        }
        
        // Use sample data as fallback
        const { sampleDeals, sampleStages, sampleTasks, sampleContacts } = getSampleData();
        
        const dealsByStage = sampleStages.map(stage => {
          const stageDeals = sampleDeals.filter(deal => deal.stage_id === stage.id);
          return {
            id: stage.id,
            name: stage.name,
            count: stageDeals.length,
            value: stageDeals.reduce((sum, deal) => sum + (deal.value || 0), 0)
          };
        });
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todaysTasks = sampleTasks
          .filter(task => {
            const taskDate = new Date(task.due_date);
            taskDate.setHours(0, 0, 0, 0);
            return taskDate.getTime() === today.getTime() && !task.completed;
          })
          .slice(0, 4);
        
        setDashboardData({
          deals: {
            total: sampleDeals.length,
            value: sampleDeals.reduce((sum, deal) => sum + deal.value, 0),
            byStage: dealsByStage,
            recentlyUpdated: sampleDeals
          },
          tasks: {
            total: sampleTasks.length,
            completed: sampleTasks.filter(task => task.completed).length,
            overdue: sampleTasks.filter(task => 
              new Date(task.due_date) < today && !task.completed
            ).length,
            today: todaysTasks
          },
          contacts: {
            total: sampleContacts.length,
            newThisWeek: 2
          },
          performance: {
            conversionRate: 24,
            avgDealCycle: 28,
            avgDealSize: 50000
          }
        });
        
        showToast({
          type: 'warning',
          title: 'Connection Issue',
          message: 'Using demo data. Check your Supabase configuration.'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [showToast]);

  const quickActions = [
    { 
      icon: Target, 
      label: 'Add Deal', 
      color: 'bg-purple-600 hover:bg-purple-700',
      action: () => {
        showToast({ 
          type: 'info', 
          title: 'Add Deal', 
          message: 'Opening deal creation form...' 
        });
        navigate('/deals');
      }
    },
    { 
      icon: Users, 
      label: 'Add Contact', 
      color: 'bg-green-600 hover:bg-green-700',
      action: () => {
        showToast({ 
          type: 'info', 
          title: 'Add Contact', 
          message: 'Opening contact creation form...' 
        });
        navigate('/contacts');
      }
    },
    { 
      icon: Calendar, 
      label: 'Schedule Meeting', 
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => {
        showToast({ 
          type: 'info', 
          title: 'Schedule Meeting', 
          message: 'Opening calendar...' 
        });
        navigate('/calendar');
      }
    },
    { 
      icon: CheckSquare, 
      label: 'New Task', 
      color: 'bg-orange-600 hover:bg-orange-700',
      action: () => {
        showToast({ 
          type: 'info', 
          title: 'New Task', 
          message: 'Opening task creation form...' 
        });
        navigate('/tasks');
      }
    },
  ];

  const handleAskGuruAbout = (query: string) => {
    openGuru();
    // Small delay to ensure panel is open
    setTimeout(() => {
      sendMessage(query);
    }, 300);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    } else {
      return `$${value}`;
    }
  };

  if (isLoading) {
    return (
      <Container>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-secondary-400">Loading dashboard data...</p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="space-y-6 animate-fade-in relative">
        {/* 3D Background for visual appeal */}
        <div className="absolute inset-0 -z-10 opacity-20">
          <Spline scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode" />
        </div>
        
        {/* Connection Error Banner */}
        {connectionError && (
          <Card className="bg-yellow-600/10 border border-yellow-600/30">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mt-1" />
              <div className="flex-1">
                <h4 className="font-medium text-yellow-200">Connection Notice</h4>
                <p className="text-yellow-300 text-sm mt-1">{connectionError}</p>
                {connectionError.includes('Demo Mode') && (
                  <p className="text-yellow-400 text-xs mt-2">
                    To connect to your Supabase database, add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.
                  </p>
                )}
              </div>
            </div>
          </Card>
        )}
        
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Welcome, Janar</h1>
            <p className="text-secondary-400 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="success" size="md">Pro Plan</Badge>
            <button 
              onClick={openGuru}
              className="btn-primary flex items-center space-x-2"
            >
              <Bot className="w-4 h-4" />
              <span>Ask Guru</span>
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`${action.color} p-4 rounded-xl text-white transition-all hover:scale-105 duration-200 shadow-lg`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <action.icon className="w-5 h-5" />
                  <span className="font-medium">{action.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Today's Tasks */}
          <TaskSummaryWidget
            tasks={dashboardData.tasks.today}
            totalTasks={dashboardData.tasks.total}
            completedTasks={dashboardData.tasks.completed}
            overdueTasks={dashboardData.tasks.overdue}
          />

          {/* Deal Updates */}
          <Card className="lg:col-span-2 bg-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Deal Updates</h3>
              <button 
                onClick={() => navigate('/deals')}
                className="text-primary-400 hover:text-primary-300"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {dashboardData.deals.recentlyUpdated.length > 0 ? (
                dashboardData.deals.recentlyUpdated.map((deal, index) => (
                  <div key={deal.id} className="flex items-center justify-between p-3 bg-secondary-700/60 backdrop-blur-sm rounded-lg hover:bg-secondary-700 transition-colors">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="w-5 h-5 text-accent-500" />
                      <div>
                        <h4 className="font-medium text-white">{deal.title}</h4>
                        <p className="text-sm text-secondary-400">{deal.stage_id.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                        <p className="text-xs text-secondary-500">{deal.contact} • {new Date(deal.updated_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-accent-500">${deal.value.toLocaleString()}</p>
                      <button 
                        onClick={() => navigate('/deals')}
                        className="text-xs text-primary-400 hover:text-primary-300"
                      >
                        View Deal
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-secondary-600 mx-auto mb-2" />
                  <p className="text-secondary-400">No recent deal updates</p>
                  <button 
                    onClick={() => navigate('/deals')}
                    className="btn-secondary text-sm mt-2"
                  >
                    View All Deals
                  </button>
                </div>
              )}
            </div>
            
            {/* Pipeline Overview */}
            <div className="mt-6 pt-6 border-t border-secondary-700">
              <PipelineWidget 
                stages={dashboardData.deals.byStage}
                totalValue={dashboardData.deals.value}
              />
            </div>
          </Card>
        </div>

        {/* Guru Insights Widget */}
        <GuruInsightsWidget />

        {/* Analytics Overview */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Analytics Overview</h2>
          <DashboardAnalytics />
        </div>
        
        {/* Guru Tip of the Day */}
        <Card className="bg-gradient-to-r from-primary-600/10 to-purple-600/10 border border-primary-600/20">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-primary-600/30 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-white">Guru Tip of the Day</h3>
              <p className="text-secondary-300 text-sm mt-2">
                Try asking SaleToruGuru to "analyze stuck deals" to identify opportunities that need attention and get personalized recommendations for moving them forward.
              </p>
              <button 
                onClick={() => handleAskGuruAbout("analyze stuck deals")}
                className="btn-primary text-sm mt-4 flex items-center space-x-2"
              >
                <Bot className="w-4 h-4" />
                <span>Try This Tip</span>
              </button>
            </div>
          </div>
        </Card>
      </div>
    </Container>
  );
};

export default Dashboard;