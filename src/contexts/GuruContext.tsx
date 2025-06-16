import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { callOpenAI } from '../services/openaiService';
import { useToastContext } from './ToastContext';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface GuruMessage {
  id: string;
  type: 'user' | 'guru';
  content: string;
  timestamp: Date;
  metadata?: {
    confidence?: number;
    sources?: string[];
    actions?: Array<{
      label: string;
      action: string;
      data?: any;
    }>;
  };
}

interface GuruContextType {
  isOpen: boolean;
  messages: GuruMessage[];
  currentPage: string;
  pageTitle: string;
  suggestedQueries: string[];
  openGuru: () => void;
  closeGuru: () => void;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  usageCount: number;
  usageLimit: number;
  isLoading: boolean;
}

const GuruContext = createContext<GuruContextType | undefined>(undefined);

export const useGuru = () => {
  const context = useContext(GuruContext);
  if (!context) {
    throw new Error('useGuru must be used within a GuruProvider');
  }
  return context;
};

export const GuruProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToastContext();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<GuruMessage[]>([]);
  const [usageCount, setUsageCount] = useState(0);
  const [usageLimit, setUsageLimit] = useState(10); // Default to Pro plan
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const location = useLocation();

  // Fetch user's plan and usage from Supabase on mount
  useEffect(() => {
    const fetchUserPlan = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setUserId(user.id);
          
          // Get user's plan from user_profiles
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          
          // Set usage limit based on plan
          if (profile) {
            if (profile.role === 'admin' || profile.role === 'developer_admin') {
              setUsageLimit(Infinity); // Unlimited
            } else if (profile.role === 'manager') {
              setUsageLimit(20); // Manager plan
            } else {
              setUsageLimit(10); // Standard plan
            }
          }
          
          // Get today's usage count using RPC function
          const { data: usageData, error: usageError } = await supabase.rpc(
            'get_daily_ai_usage',
            { p_user_id: user.id }
          );
          
          if (usageError) {
            console.error('Error fetching AI usage:', usageError);
            // Fallback to direct query if RPC fails
            const today = new Date().toISOString().split('T')[0];
            const { count } = await supabase
              .from('ai_logs')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', user.id)
              .gte('timestamp', `${today}T00:00:00`)
              .lte('timestamp', `${today}T23:59:59`);
            
            if (count !== null) {
              setUsageCount(count);
            }
          } else {
            setUsageCount(usageData || 0);
          }
        }
      } catch (error) {
        console.error('Error fetching user plan:', error);
      }
    };
    
    fetchUserPlan();
  }, []);

  // Get context data based on current page
  const getPageContext = useCallback(() => {
    const path = location.pathname;
    
    switch (path) {
      case '/':
      case '/dashboard':
        return {
          currentPage: 'dashboard',
          pageTitle: 'Dashboard',
          suggestedQueries: [
            "Summarize my active deals this week",
            "What tasks are due today?", 
            "Show me stuck deals that need attention",
            "How many deals closed this month?",
            "What's my pipeline conversion rate?"
          ]
        };
      
      case '/deals':
        return {
          currentPage: 'deals',
          pageTitle: 'Deals',
          suggestedQueries: [
            "Which deals are stuck in proposal stage?",
            "Create follow-up email for TechCorp deal",
            "Show me high-value deals over $50k",
            "What's the average deal size this quarter?",
            "Suggest next actions for my deals"
          ]
        };
      
      case '/contacts':
        return {
          currentPage: 'contacts',
          pageTitle: 'Contacts',
          suggestedQueries: [
            "What's my top lead scoring company?",
            "Which contacts need follow-up?",
            "Segment contacts by industry",
            "Show me contacts with high engagement",
            "Create email campaign for enterprise contacts"
          ]
        };
      
      case '/companies':
        return {
          currentPage: 'companies',
          pageTitle: 'Companies',
          suggestedQueries: [
            "Which companies have the most deals?",
            "Show me companies without recent activity",
            "Identify high-value company accounts",
            "Suggest companies to prioritize",
            "Find companies in the technology sector"
          ]
        };
      
      case '/tasks':
        return {
          currentPage: 'tasks',
          pageTitle: 'Tasks',
          suggestedQueries: [
            "What tasks are overdue?",
            "Prioritize my activities for today",
            "Create task for TechCorp follow-up",
            "Show me tasks by priority",
            "Suggest tasks for stuck deals"
          ]
        };
      
      case '/calendar':
        return {
          currentPage: 'calendar',
          pageTitle: 'Calendar',
          suggestedQueries: [
            "Show me my schedule for next week",
            "Find conflicts in my calendar",
            "Suggest optimal meeting times with TechCorp",
            "Summarize my upcoming meetings",
            "Create follow-up tasks for this week's meetings"
          ]
        };
      
      case '/emails':
        return {
          currentPage: 'emails',
          pageTitle: 'Emails',
          suggestedQueries: [
            "Summarize unread emails",
            "Draft reply to John Smith",
            "Find emails about TechCorp deal",
            "Show me high priority emails",
            "Create follow-up email template"
          ]
        };

      case '/email-templates':
        return {
          currentPage: 'email-templates',
          pageTitle: 'Email Templates',
          suggestedQueries: [
            "Generate a follow-up email template",
            "Create proposal email template",
            "Suggest improvements for existing templates",
            "What are the best performing templates?",
            "Help me write a cold outreach template"
          ]
        };

      case '/lead-scoring':
        return {
          currentPage: 'lead-scoring',
          pageTitle: 'Lead Scoring',
          suggestedQueries: [
            "Why is this lead scored so high?",
            "Show me leads ready for outreach",
            "Explain the scoring methodology",
            "Which factors improve lead scores?",
            "Suggest actions for low-scoring leads"
          ]
        };

      case '/offers':
        return {
          currentPage: 'offers',
          pageTitle: 'Offers',
          suggestedQueries: [
            "Which offers are expiring soon?",
            "Generate a new offer template",
            "Show me accepted vs rejected offers",
            "Help me follow up on pending offers",
            "What's the average offer acceptance rate?"
          ]
        };
      
      case '/analytics':
        return {
          currentPage: 'analytics',
          pageTitle: 'Analytics',
          suggestedQueries: [
            "Generate monthly sales report",
            "What's my team's performance this quarter?",
            "Show conversion rate trends",
            "Compare performance to last month",
            "Identify top performing deals"
          ]
        };

      case '/automation':
        return {
          currentPage: 'automation',
          pageTitle: 'Automation',
          suggestedQueries: [
            "Suggest automation rules for my workflow",
            "What automations should I set up first?",
            "Help me create a deal stage change automation",
            "Explain how to use conditions effectively",
            "What are the most useful automation triggers?"
          ]
        };
      
      default:
        return {
          currentPage: 'general',
          pageTitle: 'SaleToru CRM',
          suggestedQueries: [
            "Show me today's overview",
            "What needs my attention?",
            "Summarize my pipeline",
            "Create a task reminder",
            "Help me prioritize my work"
          ]
        };
    }
  }, [location.pathname]);

  const { currentPage, pageTitle, suggestedQueries } = getPageContext();

  const openGuru = useCallback(() => {
    setIsOpen(true);
    
    // Add welcome message if no messages exist
    if (messages.length === 0) {
      const welcomeMessage: GuruMessage = {
        id: Date.now().toString(),
        type: 'guru',
        content: `Hi! I'm SaleToruGuru, your AI sales assistant. I can help you with ${pageTitle.toLowerCase()} tasks. Try asking me: "${suggestedQueries[0]}"`,
        timestamp: new Date(),
        metadata: {
          confidence: 100,
          sources: ['system']
        }
      };
      setMessages([welcomeMessage]);
    }
  }, [messages.length, pageTitle, suggestedQueries]);

  const closeGuru = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Check if user has reached their daily AI usage limit
  const checkUsageLimit = async (): Promise<boolean> => {
    if (!userId) return false;
    
    try {
      // Use RPC function to check if user has reached their limit
      const { data: hasReachedLimit, error } = await supabase.rpc(
        'has_reached_ai_limit',
        { 
          p_user_id: userId,
          p_limit: usageLimit === Infinity ? 1000000 : usageLimit // Use a large number for unlimited
        }
      );
      
      if (error) {
        console.error('Error checking AI usage limit:', error);
        // Fallback to local check if RPC fails
        return usageCount >= usageLimit;
      }
      
      return hasReachedLimit || false;
    } catch (error) {
      console.error('Error checking AI usage limit:', error);
      return usageCount >= usageLimit;
    }
  };

  // Log AI interaction to Supabase
  const logInteraction = async (
    prompt: string, 
    response: string, 
    context: string, 
    metadata: any = {},
    tokens_used: number = 0
  ) => {
    if (!userId) return;
    
    try {
      // Use RPC function to log interaction
      const { error } = await supabase.rpc(
        'log_ai_interaction',
        {
          p_user_id: userId,
          p_prompt: prompt,
          p_response: response,
          p_context: context,
          p_metadata: {
            ...metadata,
            page: currentPage,
            timestamp: new Date().toISOString()
          },
          p_tokens_used: tokens_used,
          p_model: 'gpt-4o'
        }
      );
      
      if (error) {
        console.error('Error logging AI interaction via RPC:', error);
        
        // Fallback to direct insert if RPC fails
        const { error: insertError } = await supabase.from('ai_logs').insert({
          user_id: userId,
          prompt,
          response,
          context,
          metadata: {
            ...metadata,
            page: currentPage,
            timestamp: new Date().toISOString()
          },
          tokens_used,
          model: 'gpt-4o',
          timestamp: new Date().toISOString()
        });
        
        if (insertError) {
          console.error('Error logging AI interaction via insert:', insertError);
        }
      }
      
      // Update local usage count
      setUsageCount(prev => prev + 1);
    } catch (error) {
      console.error('Error logging AI interaction:', error);
    }
  };

  const fetchContextualData = async () => {
    try {
      const contextData: any = {
        page: currentPage,
        timestamp: new Date().toISOString()
      };
      
      // Get data based on current page
      switch (currentPage) {
        case 'deals':
          const { data: deals } = await supabase
            .from('deals')
            .select(`
              *,
              stages(name, probability)
            `)
            .order('created_at', { ascending: false })
            .limit(20);
          
          contextData.deals = deals;
          
          // Get deal stage transitions
          const { data: stageTransitions } = await supabase
            .from('deal_stage_history')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
          
          if (stageTransitions) {
            contextData.stageTransitions = stageTransitions;
          }
          
          break;
        
        case 'contacts':
        case 'lead-scoring':
          // Get high-scoring leads
          const { data: highScoringLeads } = await supabase
            .from('leads')
            .select('*')
            .gte('score', 70)
            .order('score', { ascending: false })
            .limit(10);
          
          if (highScoringLeads) {
            contextData.highScoringLeads = highScoringLeads;
          }
          
          // Get all contacts
          const { data: contacts } = await supabase
            .from('contacts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);
          
          if (contacts) {
            contextData.contacts = contacts;
          }
          
          break;
        
        case 'tasks':
          // Get tasks with due dates
          const { data: tasks } = await supabase
            .from('tasks')
            .select(`
              *,
              deals(title, company),
              contacts(name, company)
            `)
            .order('due_date', { ascending: true })
            .limit(20);
          
          if (tasks) {
            contextData.tasks = tasks;
            
            // Get overdue tasks
            contextData.overdueTasks = tasks.filter((task: any) => {
              const dueDate = new Date(task.due_date);
              return !task.completed && dueDate < new Date();
            });
          }
          
          break;
        
        case 'emails':
          // Get recent emails
          const { data: emails } = await supabase
            .from('emails')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
          
          if (emails) {
            contextData.emails = emails;
          }
          
          break;
          
        case 'companies':
          // Get companies with related data
          const { data: companies } = await supabase
            .from('companies')
            .select(`
              *,
              contacts(count),
              deals(count)
            `)
            .order('created_at', { ascending: false })
            .limit(20);
          
          if (companies) {
            contextData.companies = companies;
          }
          
          break;
          
        case 'dashboard':
          // Get summary data for dashboard
          const { data: dashboardDeals } = await supabase
            .from('deals')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);
          
          if (dashboardDeals) {
            contextData.recentDeals = dashboardDeals;
          }
          
          // Get upcoming tasks
          const { data: upcomingTasks } = await supabase
            .from('tasks')
            .select('*')
            .eq('completed', false)
            .gte('due_date', new Date().toISOString().split('T')[0])
            .order('due_date', { ascending: true })
            .limit(5);
          
          if (upcomingTasks) {
            contextData.upcomingTasks = upcomingTasks;
          }
          
          break;
          
        default:
          // For other pages, get a general overview
          const { data: generalDeals } = await supabase
            .from('deals')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);
          
          if (generalDeals) {
            contextData.deals = generalDeals;
          }
          
          const { data: generalTasks } = await supabase
            .from('tasks')
            .select('*')
            .eq('completed', false)
            .order('due_date', { ascending: true })
            .limit(5);
          
          if (generalTasks) {
            contextData.tasks = generalTasks;
          }
          
          break;
      }
      
      return contextData;
    } catch (error) {
      console.error('Error fetching contextual data:', error);
      return { page: currentPage };
    }
  };

  // Helper function to sleep for a given number of milliseconds
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const sendMessage = useCallback(async (content: string) => {
    // Check if user has reached their daily limit
    const hasReachedLimit = await checkUsageLimit();
    
    if (hasReachedLimit) {
      const limitMessage: GuruMessage = {
        id: Date.now().toString(),
        type: 'guru',
        content: `You've reached your daily limit of ${usageLimit} AI requests. Upgrade your plan for unlimited access to SaleToruGuru.`,
        timestamp: new Date(),
        metadata: {
          confidence: 100,
          sources: ['system']
        }
      };
      setMessages(prev => [...prev, limitMessage]);
      
      showToast({
        title: 'AI Usage Limit Reached',
        description: `You've reached your daily limit of ${usageLimit} AI requests.`,
        type: 'error'
      });
      
      return;
    }
    
    // Add user message
    const userMessage: GuruMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Fetch contextual data
      const contextData = await fetchContextualData();
      
      // Determine the type of request for logging
      let requestType = 'general_query';
      if (content.toLowerCase().includes('pipeline') || content.toLowerCase().includes('deals')) {
        requestType = 'pipeline_coach';
      } else if (content.toLowerCase().includes('lead') || content.toLowerCase().includes('prioritize')) {
        requestType = 'lead_summary';
      } else if (content.toLowerCase().includes('email') || content.toLowerCase().includes('draft')) {
        requestType = 'email_suggestion';
      } else if (content.toLowerCase().includes('performance') || content.toLowerCase().includes('how is')) {
        requestType = 'user_report';
      }
      
      // Prepare system message with context
      const systemMessage = `You are SaleToruGuru, an AI sales assistant for a CRM system. 
Current page: ${contextData.page || 'Unknown'}
Current time: ${new Date().toISOString()}
User role: Sales Manager

You have access to the following CRM data:
${JSON.stringify(contextData, null, 2).substring(0, 1000)}...

Respond in a helpful, concise manner. Format your response using markdown.
For data analysis, include specific numbers and insights.
For recommendations, be specific and actionable.
For email templates, provide subject line and body text.`;

      // Call OpenAI API via the secure Edge Function
      const response = await callOpenAI([
        { role: 'system', content: systemMessage },
        { role: 'user', content }
      ]);
      
      // Estimate tokens used (rough approximation)
      const promptTokens = Math.ceil((systemMessage.length + content.length) / 4);
      const responseTokens = Math.ceil(response.length / 4);
      const totalTokens = promptTokens + responseTokens;
      
      // Log interaction to Supabase with request type and token usage
      await logInteraction(
        content, 
        response, 
        currentPage, 
        { request_type: requestType },
        totalTokens
      );
      
      // Add AI response
      const guruMessage: GuruMessage = {
        id: (Date.now() + 1).toString(),
        type: 'guru',
        content: response,
        timestamp: new Date(),
        metadata: {
          confidence: Math.floor(Math.random() * 20) + 80, // 80-100%
          sources: [currentPage, 'ai-analysis'],
          actions: [
            { label: 'Create Task', action: 'create-task' },
            { label: 'Send Email', action: 'compose-email' }
          ]
        }
      };

      setMessages(prev => [...prev, guruMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Add error message
      const errorMessage: GuruMessage = {
        id: (Date.now() + 1).toString(),
        type: 'guru',
        content: 'I apologize, but I encountered an error while processing your request. Please try again later.',
        timestamp: new Date(),
        metadata: {
          confidence: 100,
          sources: ['system']
        }
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageTitle, suggestedQueries, usageCount, usageLimit, userId, showToast]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const value: GuruContextType = {
    isOpen,
    messages,
    currentPage,
    pageTitle,
    suggestedQueries,
    openGuru,
    closeGuru,
    sendMessage,
    clearMessages,
    usageCount,
    usageLimit,
    isLoading
  };

  return (
    <GuruContext.Provider value={value}>
      {children}
    </GuruContext.Provider>
  );
};