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
  Sparkles,
  UserCircle
} from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import QuickActionButton from '../components/ui/QuickActionButton';
import { useGuru } from '../contexts/GuruContext';
import { useToastContext } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import Container from '../components/layout/Container';
import Spline from '@splinetool/react-spline';
import GuruInsightsWidget from '../components/dashboard/GuruInsightsWidget';
import TaskSummaryWidget from '../components/dashboard/TaskSummaryWidget';
import PipelineWidget from '../components/dashboard/PipelineWidget';
import DashboardAnalytics from '../components/dashboard/DashboardAnalytics';
import { supabase } from '../services/supabase';
import CreateDealModal from '../components/deals/CreateDealModal';
import CreateContactModal from '../components/contacts/CreateContactModal';
import CreateTaskModal from '../components/tasks/CreateTaskModal';
import CreateEventModal from '../components/calendar/CreateEventModal';
import DealUpdatesWidget from '../components/dashboard/DealUpdatesWidget';
import NotificationCard from '../components/dashboard/NotificationCard';
import LeadScoringCard from '../components/dashboard/LeadScoringCard';
import AppMarketplaceCard from '../components/dashboard/AppMarketplaceCard';
import { FocusTimeWidget } from '../components/dashboard/FocusTimeWidget';
import { SocialMentionsWidget } from '../components/social/SocialMentionsWidget';
import Leaderboard from '../components/dashboard/Leaderboard';
import DatabaseStatus from '../components/common/DatabaseStatus';

const Dashboard: React.FC = () => {
  const guruContext = useGuru();
  const openGuru = guruContext.openGuru || (() => {});
  const sendMessage = guruContext.sendMessage || (() => {});
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
  
  // Modal state
  const [isDealModalOpen, setDealModalOpen] = useState(false);
  const [isContactModalOpen, setContactModalOpen] = useState(false);
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [isEventModalOpen, setEventModalOpen] = useState(false);

  // Handle deal creation
  const handleDealCreated = async (dealData: any) => {
    try {
      // Save to database
      const { data, error } = await supabase
        .from('deals')
        .insert([{
          title: dealData.title,
          description: dealData.description,
          value: dealData.value,
          stage_id: dealData.stage_id,
          probability: dealData.probability,
          expected_close_date: dealData.expected_close_date,
          company_id: null, // Set to null or map if available
          contact_id: null, // Set to null or map if available
          lead_id: dealData.lead_id || null, // Set if converting from lead
          owner_id: null, // Set to null or map if available
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      showToast({
        type: 'success',
        title: 'Deal Created',
        message: `${dealData.title} has been created successfully!`
      });

      // Refresh dashboard data
      fetchDashboardData();
    } catch (error) {
      console.error('Error creating deal:', error);
      showToast({
        type: 'error',
        title: 'Creation Failed',
        message: 'Failed to create deal. Please try again.'
      });
    }
  };

  // Handle contact creation
  const handleContactCreated = async (contactData: any) => {
    try {
      // Save to database
      const { data, error } = await supabase
        .from('contacts')
        .insert([{
          name: contactData.name,
          email: contactData.email,
          phone: contactData.phone,
          company: contactData.company,
          position: contactData.position,
          owner_id: null, // Will be set to current user
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      showToast({
        type: 'success',
        title: 'Contact Created',
        message: `${contactData.name} has been added to your contacts!`
      });

      // Refresh dashboard data
      fetchDashboardData();
    } catch (error) {
      console.error('Error creating contact:', error);
      showToast({
        type: 'error',
        title: 'Creation Failed',
        message: 'Failed to create contact. Please try again.'
      });
    }
  };

  // Handle task creation
  const handleTaskCreated = async (taskData: any) => {
    try {
      // Save to database
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          title: taskData.title,
          description: taskData.description,
          due_date: taskData.due_date,
          due_time: taskData.due_time,
          priority: taskData.priority,
          status: taskData.status || 'pending',
          type: taskData.type,
          assigned_to: taskData.assigned_to,
          created_by: null, // Will be set to current user
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      showToast({
        type: 'success',
        title: 'Task Created',
        message: `${taskData.title} has been added to your tasks!`
      });

      // Refresh dashboard data
      fetchDashboardData();
    } catch (error) {
      console.error('Error creating task:', error);
      showToast({
        type: 'error',
        title: 'Creation Failed',
        message: 'Failed to create task. Please try again.'
      });
    }
  };

  // Handle event creation
  const handleEventCreated = async (eventData: any) => {
    try {
      showToast({
        type: 'success',
        title: 'Event Created',
        message: `${eventData.title} has been scheduled!`
      });

      // Refresh dashboard data
      fetchDashboardData();
    } catch (error) {
      console.error('Error creating event:', error);
      showToast({
        type: 'error',
        title: 'Creation Failed',
        message: 'Failed to create event. Please try again.'
      });
    }
  };

  // Fetch dashboard data function
  const fetchDashboardData = async () => {
    setIsLoading(true);
    setConnectionError(null);
    
    try {
      if (!supabase) {
        // Use sample data if Supabase is not configured
        const { sampleDeals, sampleStages, sampleTasks, sampleContacts } = getSampleData();
        
        // Process sample data
        const dealsByStage = sampleStages.map((stage: any) => {
          const stageDeals = sampleDeals.filter((deal: any) => deal.stage_id === stage.id);
          return {
            id: stage.id,
            name: stage.name,
            count: stageDeals.length,
            value: stageDeals.reduce((sum: any, deal: any) => sum + (deal.value || 0), 0)
          };
        });
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todaysTasks = sampleTasks
          .filter((task: any) => {
            const taskDate = new Date(task.due_date);
            taskDate.setHours(0, 0, 0, 0);
            return taskDate.getTime() === today.getTime() && !task.completed;
          })
          .slice(0, 4);
        
        const totalDeals = sampleDeals.length;
        const closedDeals = sampleDeals.filter((deal: any) => deal.stage_id === 'closed-won').length;
        const conversionRate = totalDeals > 0 ? Math.round((closedDeals / totalDeals) * 100) : 24;
        
        const totalValue = sampleDeals.reduce((sum: any, deal: any) => sum + (deal.value || 0), 0);
        const avgDealSize = totalDeals > 0 ? Math.round(totalValue / totalDeals) : 50000;
        
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const newContacts = sampleContacts.filter((contact: any) => 
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
      const dealsByStage = stagesData.map((stage: any) => {
        const stageDeals = dealsData.filter((deal: any) => deal.stage_id === stage.id);
        return {
          id: stage.id,
          name: stage.name,
          count: stageDeals.length,
          value: stageDeals.reduce((sum: any, deal: any) => sum + (deal.value || 0), 0)
        };
      });
      
      // Get recently updated deals
      const recentDeals = [...dealsData]
        .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 3)
        .map((deal: any) => {
          // Find the corresponding stage for this deal
          const stage = stagesData.find((s: any) => s.id === deal.stage_id);
          return {
            ...deal,
            stage_name: stage ? stage.name : 'Unknown Stage'
          };
        });
      
      // Get today's tasks
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todaysTasks = tasksData
        .filter((task: any) => {
          const taskDate = new Date(task.due_date);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate.getTime() === today.getTime() && !task.completed;
        })
        .slice(0, 4);
      
      // Calculate performance metrics
      const totalDeals = dealsData.length;
      const closedDeals = dealsData.filter((deal: any) => deal.stage_id === 'closed-won').length;
      const conversionRate = totalDeals > 0 ? Math.round((closedDeals / totalDeals) * 100) : 0;
      
      const totalValue = dealsData.reduce((sum: any, deal: any) => sum + (deal.value || 0), 0);
      const avgDealSize = totalDeals > 0 ? Math.round(totalValue / totalDeals) : 0;
      
      // Count new contacts this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const newContacts = contactsData.filter((contact: any) => 
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
        if (error.message.includes('timeout')) {
          setConnectionError('Connection timeout. Please check your internet connection.');
        } else if (error.message.includes('JWT')) {
          setConnectionError('Authentication error. Please check your Supabase configuration.');
        } else {
          setConnectionError(`Database error: ${error.message}`);
        }
      } else {
        setConnectionError('An unexpected error occurred while fetching data.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
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
  
  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, [showToast]);

  const quickActions = [
    { 
      icon: Target, 
      label: 'Add Deal', 
      gradient: 'bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 hover:from-purple-600 hover:via-purple-700 hover:to-indigo-800',
      action: () => setDealModalOpen(true)
    },
    { 
      icon: Users, 
      label: 'Add Contact', 
      gradient: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 hover:from-emerald-600 hover:via-emerald-700 hover:to-teal-800',
      action: () => setContactModalOpen(true)
    },
    { 
      icon: Calendar, 
      label: 'Schedule Meeting', 
      gradient: 'bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-700 hover:from-blue-600 hover:via-blue-700 hover:to-cyan-800',
      action: () => setEventModalOpen(true)
    },
    { 
      icon: CheckSquare, 
      label: 'New Task', 
      gradient: 'bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 hover:from-orange-600 hover:via-orange-700 hover:to-red-700',
      action: () => setTaskModalOpen(true)
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
    <div className="relative z-10 min-h-screen">
      {/* 3D Background */}
      <div className="fixed inset-0 z-0">
        <Spline
          scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode"
          className="w-full h-full"
        />
      </div>
      
      {/* Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#18182c]/50 to-[#18182c]/70 z-0"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-4 sm:space-y-6 animate-fade-in">
          {/* Connection Error Banner */}
          {connectionError && (
            <div className="bg-yellow-600/10 backdrop-blur-sm border border-yellow-600/30 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-yellow-200">Connection Notice</h4>
                  <p className="text-yellow-300 text-sm mt-1">{connectionError}</p>
                  {connectionError.includes('Demo Mode') && (
                    <p className="text-yellow-400 text-xs mt-2">
                      To connect to your Supabase database, add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">Welcome, Janar</h1>
                <p className="text-[#b0b0d0] mt-1 text-sm lg:text-base">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <Button
                onClick={() => navigate('/settings/account')}
                variant="secondary"
                size="sm"
                icon={UserCircle}
                className="w-10 h-10 p-0 rounded-full"
                title="Account Settings"
              />
            </div>
            <div className="flex items-center space-x-4">
              <DatabaseStatus />
              <Badge variant="success" size="md">Pro Plan</Badge>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <QuickActionButton
                  key={index}
                  icon={action.icon}
                  label={action.label}
                  onClick={action.action}
                  gradient={action.gradient}
                />
              ))}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 min-h-[340px]">
            <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-4 lg:p-6">
              <TaskSummaryWidget
                tasks={dashboardData.tasks.today}
                totalTasks={dashboardData.tasks.total}
                completedTasks={dashboardData.tasks.completed}
                overdueTasks={dashboardData.tasks.overdue}
                loading={isLoading}
              />
            </div>
            <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-4 lg:p-6">
              <PipelineWidget 
                stages={dashboardData.deals.byStage} 
                totalValue={dashboardData.deals.value} 
                loading={isLoading}
              />
            </div>
          </div>

          {/* Insights & Utility Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mt-6 min-h-[340px]">
            <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-4 lg:p-6">
              <NotificationCard loading={isLoading} />
            </div>
            <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-4 lg:p-6">
              <LeadScoringCard loading={isLoading} />
            </div>
            <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-4 lg:p-6 md:col-span-2 lg:col-span-1">
              <AppMarketplaceCard />
            </div>
          </div>

          {/* Deal Updates & Guru Insights (full width) */}
          <div className="grid grid-cols-1 gap-4 lg:gap-6 mt-6 min-h-[340px]">
            <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-4 lg:p-6">
              <DealUpdatesWidget recentlyUpdated={dashboardData.deals.recentlyUpdated} loading={isLoading} />
            </div>
            <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-4 lg:p-6">
              <GuruInsightsWidget loading={isLoading} />
            </div>
          </div>

          {/* Analytics Overview */}
          <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-4 lg:p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Analytics Overview</h2>
            <DashboardAnalytics />
          </div>

          {/* Gamification & Productivity Section */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-white mb-4 lg:mb-6">Gamification & Productivity</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-4 lg:p-6 min-h-[280px] flex flex-col">
                <Leaderboard />
              </div>
              <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-4 lg:p-6 min-h-[280px] flex flex-col">
                <SocialMentionsWidget />
              </div>
              <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-4 lg:p-6 min-h-[280px] flex flex-col md:col-span-2 lg:col-span-1">
                <FocusTimeWidget />
              </div>
            </div>
          </div>
          
          {/* Guru Tip of the Day */}
          <div className="bg-gradient-to-r from-[#a259ff]/10 to-[#377dff]/10 backdrop-blur-sm rounded-xl border border-[#a259ff]/20 p-4 lg:p-6">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-[#a259ff]/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#a259ff]" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white">Guru Tip of the Day</h3>
                <p className="text-[#b0b0d0] text-sm mt-2">
                  Try asking SaleToruGuru to "analyze stuck deals" to identify opportunities that need attention and get personalized recommendations for moving them forward.
                </p>
                <Button 
                  onClick={() => handleAskGuruAbout("analyze stuck deals")}
                  variant="gradient"
                  size="sm"
                  icon={Bot}
                  className="mt-4"
                >
                  Try This Tip
                </Button>
              </div>
            </div>
          </div>

          {/* Modals for Quick Actions */}
          <CreateDealModal
            isOpen={isDealModalOpen}
            onClose={() => setDealModalOpen(false)}
            onDealCreated={handleDealCreated}
            stages={[]}
            companies={[]}
            contacts={[]}
          />
          <CreateContactModal
            isOpen={isContactModalOpen}
            onClose={() => setContactModalOpen(false)}
            onContactCreated={handleContactCreated}
          />
          <CreateTaskModal
            isOpen={isTaskModalOpen}
            onClose={() => setTaskModalOpen(false)}
            onTaskCreated={handleTaskCreated}
            currentUserId={null}
          />
          <CreateEventModal
            isOpen={isEventModalOpen}
            onClose={() => setEventModalOpen(false)}
            onEventCreated={handleEventCreated}
          />

          <div className="flex items-center justify-center mt-10 opacity-60">
            <span className="text-lg font-semibold text-secondary-400">More features coming soon...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;