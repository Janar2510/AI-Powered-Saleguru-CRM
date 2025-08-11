import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Minimize2, Sparkles, Bot, Zap, Lightbulb, Clock, Target, CheckSquare, Calendar, Mail, User, AlertTriangle, Cog, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { useGuru } from '../../contexts/GuruContext';
import { useToastContext } from '../../contexts/ToastContext';
import Badge from '../ui/Badge';
import GuruAISettings from './GuruAISettings';
import BottleneckPanel from './BottleneckPanel';
import { useTasks } from '../../hooks/useTasks';
import EnhancedEmailComposer from '../emails/EnhancedEmailComposer';
import openAIService, { GuruContext, GuruResponse } from '../../services/openaiService';
import { Bottleneck } from '../../types/ai';

// Error Boundary for GuruPanel
class GuruPanelErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    // You can log error here
    console.error('GuruPanel crashed:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary-900/90">
          <div className="bg-secondary-800 p-8 rounded-xl shadow-xl text-center">
            <h2 className="text-lg font-bold text-red-400 mb-2">Guru Chat Error</h2>
            <p className="text-secondary-200 mb-4">Something went wrong with the Guru chat window.</p>
            <pre className="text-xs text-secondary-400 bg-secondary-900 p-2 rounded overflow-x-auto max-w-xs mx-auto">{String(this.state.error)}</pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const GuruPanel: React.FC = () => {
  const guru = useGuru() as any;
  const isOpen = guru?.isOpen;
  const suggestedQueries = Array.isArray(guru?.suggestedQueries) ? guru.suggestedQueries : [
    'Summarize my pipeline',
    'What needs attention?',
    'Show overdue tasks',
    'Suggest next best action',
  ];
  const [input, setInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [bottlenecks, setBottlenecks] = useState<Bottleneck[]>([]);
  const [showBottlenecks, setShowBottlenecks] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const { createTask } = useTasks();
  const { showToast } = useToastContext();
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [emailData, setEmailData] = useState<any>(null);
  const [isAILoading, setIsAILoading] = useState(false);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Build context for AI
  const buildGuruContext = (): GuruContext => {
    return {
      user: {
        name: 'Janar Kuusk',
        role: 'Sales Manager',
        preferences: {
          communicationStyle: 'professional',
          automationLevel: 'high'
        }
      },
      crm: {
        deals: [], // You can fetch real data here
        contacts: [],
        tasks: [],
        companies: [],
        analytics: {
          pipelineValue: 125000,
          conversionRate: 23,
          avgDealCycle: 45,
          activeDeals: 12
        }
      },
      conversation: {
        history: messages,
        currentPage: 'dashboard'
      }
    };
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    
    // Use real AI for processing
    setIsAILoading(true);
    try {
      const context = buildGuruContext();
      const aiResponse = await openAIService.processGuruMessage(
        userMessage,
        context,
        messages
      );
      
      // Handle AI response
      if (aiResponse.type === 'action' && aiResponse.actions) {
        // Execute actions
        for (const action of aiResponse.actions) {
          switch (action.type) {
            case 'create_task':
              const taskCreated = await createTask(action.data);
              if (taskCreated) {
                setMessages(prev => [...prev, { 
                  sender: 'guru', 
                  text: `✅ Task "${action.data.title}" created successfully!` 
                }]);
              }
              break;
            case 'compose_email':
              setEmailData(action.data);
              setShowEmailComposer(true);
              break;
            case 'show_bottlenecks':
              // Handle bottleneck detection
              if (action.data && action.data.bottlenecks) {
                setBottlenecks(action.data.bottlenecks);
                setShowBottlenecks(true);
              }
              break;
            // Add more action handlers as needed
          }
        }
      }
      
      // Add AI response to chat
      setMessages(prev => [...prev, { 
        sender: 'guru', 
        text: aiResponse.content 
      }]);
      
    } catch (error) {
      console.error('AI processing error:', error);
      setMessages(prev => [...prev, { 
        sender: 'guru', 
        text: "I'm having trouble processing your request. Please try again." 
      }]);
    } finally {
      setIsAILoading(false);
    }
  };

  const handleViewEntity = (type: string, id: string) => {
    // Navigate to the specific entity
    console.log(`Viewing ${type} with id: ${id}`);
    // You can implement navigation logic here
    setShowBottlenecks(false);
  };

  const handleCreateTaskFromBottleneck = async (bottleneck: Bottleneck) => {
    try {
      const taskData = {
        title: `Follow up on ${bottleneck.title}`,
        description: bottleneck.description,
        priority: bottleneck.priority,
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
        type: 'follow_up',
        status: 'pending'
      };
      
      const taskCreated = await createTask(taskData);
      if (taskCreated) {
        showToast('Task created successfully!', 'success');
        setShowBottlenecks(false);
      }
    } catch (error) {
      console.error('Error creating task from bottleneck:', error);
      showToast('Failed to create task', 'error');
    }
  };

  const handleEmailSend = async (emailData: any): Promise<boolean> => {
    // Handle email sending (you can integrate with your email service here)
    setShowEmailComposer(false);
    setMessages(prev => [...prev, { 
      sender: 'guru', 
      text: `📧 Email sent successfully to ${emailData.to}!` 
    }]);
    return true; // Return success
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end pointer-events-none">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm pointer-events-auto" onClick={guru?.closeGuru || (() => {})} />
      
      {/* Bottleneck Panel */}
      {showBottlenecks && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
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
      
      {/* Panel */}
      <div className="relative w-full max-w-md m-6 pointer-events-auto animate-fade-in-up">
        <div className="bg-gradient-to-br from-secondary-900/95 to-primary-900/90 backdrop-blur-md border border-primary-700/30 shadow-2xl rounded-2xl overflow-hidden flex flex-col min-h-[480px] max-h-[80vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-primary-700/20 bg-secondary-900/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">G</span>
              </div>
              <div>
                <div className="font-semibold text-lg text-white flex items-center gap-2">Guru
                  <span className="ml-2 w-2 h-2 rounded-full bg-green-400 animate-pulse" title="Online" />
                </div>
                <div className="text-xs text-primary-300 flex items-center gap-1">
                  {isTyping ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>Online</span>}
                </div>
              </div>
            </div>
            <button
              className="p-2 rounded-full hover:bg-primary-800/40 transition-colors text-primary-300"
              onClick={() => setShowSettings(true)}
              title="Guru Settings"
            >
              <Cog className="w-5 h-5" />
            </button>
          </div>
          {/* Chat Area */}
          <div ref={chatRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gradient-to-br from-secondary-900/80 to-primary-900/70">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center text-primary-300 opacity-70">
                <span className="text-2xl mb-2">👋</span>
                <span className="font-medium">Hi, I'm Guru! How can I help you today?</span>
                <span className="text-xs mt-1">Ask me anything about your CRM, automations, analytics, or more.</span>
              </div>
            )}
            {messages.map((msg: any, idx: number) => (
              <div key={idx} className={clsx(
                'flex',
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              )}>
                <div className={clsx(
                  'max-w-[80%] px-4 py-2 rounded-xl shadow',
                  msg.role === 'user'
                    ? 'bg-primary-700 text-white rounded-br-none'
                    : 'bg-secondary-800 text-primary-100 rounded-bl-none border border-primary-700/30'
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[80%] px-4 py-2 rounded-xl bg-secondary-800 text-primary-100 border border-primary-700/30 animate-pulse">
                  Guru is typing...
                </div>
              </div>
            )}
          </div>
          {/* Suggestions */}
          {suggestedQueries.length > 0 && (
            <div className="px-6 pb-2 flex flex-wrap gap-2">
              {suggestedQueries.map((q: string, i: number) => (
                <button
                  key={i}
                  className="px-3 py-1 bg-primary-700/80 hover:bg-primary-600 text-white text-xs rounded-lg transition-colors"
                  onClick={() => setInput(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          )}
          {/* Input Bar */}
          <form
            className="flex items-center gap-2 px-6 py-4 border-t border-primary-700/20 bg-secondary-900/80"
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              className="flex-1 bg-secondary-800/80 text-white px-4 py-2 rounded-lg border border-primary-700/30 focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-primary-400"
              placeholder="Type your message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              type="submit"
              className="ml-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow transition-colors"
              disabled={!input.trim()}
            >
              Send
            </button>
          </form>
        </div>
        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-secondary-900 rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
              <button
                className="absolute top-3 right-3 p-2 rounded-full hover:bg-primary-800/40 text-primary-300"
                onClick={() => setShowSettings(false)}
                title="Close"
              >
                ×
              </button>
              <h2 className="text-xl font-bold text-white mb-4">Guru Settings</h2>
              <div className="text-primary-200 text-sm">Settings coming soon...</div>
            </div>
          </div>
        )}
      </div>
      {/* Email Composer Modal */}
      <EnhancedEmailComposer
        isOpen={showEmailComposer}
        onClose={() => setShowEmailComposer(false)}
        onSend={handleEmailSend}
        initialData={emailData}
      />
      {isAILoading && (
        <div className="flex items-center space-x-2 text-secondary-400 text-sm">
          <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Guru is thinking...</span>
        </div>
      )}
    </div>
  );
};

// Export GuruPanel wrapped in error boundary
const GuruPanelWithBoundary: React.FC = () => (
  <GuruPanelErrorBoundary>
    <GuruPanel />
  </GuruPanelErrorBoundary>
);

export default GuruPanelWithBoundary;