import React, { useState, useEffect, useRef } from 'react';
import { 
  Target, Users, DollarSign, Send, Brain, BarChart3, Settings, Mic, MicOff, Volume2, VolumeX, X
} from 'lucide-react';
import {
  BrandBackground,
  BrandPageLayout,
  BrandCard,
  BrandButton,
  BrandBadge
} from '../contexts/BrandDesignContext';
import { useGuru } from '../contexts/GuruContext';
import { useToastContext } from '../contexts/ToastContext';

interface GuruMessage {
  id: string;
  sender: 'user' | 'guru';
  content: string;
  timestamp: Date;
  type?: 'text' | 'insight' | 'data';
}

interface AIInsight {
  id: string;
  type: 'lead' | 'deal' | 'invoice' | 'general';
  title: string;
  description: string;
  action?: string;
  priority: 'high' | 'medium' | 'low';
  icon: React.ReactNode;
}

export default function Guru() {
  const { isLoading } = useGuru();
  const { showToast } = useToastContext();
  const [inputMessage, setInputMessage] = useState('');
  const [conversation, setConversation] = useState<GuruMessage[]>([
    {
      id: '1',
      sender: 'guru',
      content: 'Hello! I am Guru, your AI assistant. I can help you analyze your CRM data, provide insights about leads and deals, track invoices, and much more. How can I assist you today?',
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Quick prompt suggestions for AI conversations
  const aiInsights: AIInsight[] = [
    {
      id: '1',
      type: 'lead',
      title: 'Top Leads This Week',
      description: 'Analyze lead scores and conversion potential',
      priority: 'high',
      icon: <Users className="w-5 h-5 text-green-400" />
    },
    {
      id: '2',
      type: 'deal',
      title: 'Pipeline Analysis',
      description: 'Review deals by stage and forecasting',
      priority: 'medium',
      icon: <Target className="w-5 h-5 text-blue-400" />
    },
    {
      id: '3',
      type: 'invoice',
      title: 'Payment Tracking',
      description: 'Check overdue invoices and cash flow',
      priority: 'high',
      icon: <DollarSign className="w-5 h-5 text-yellow-400" />
    },
    {
      id: '4',
      type: 'general',
      title: 'Performance Metrics',
      description: 'Overall business intelligence and trends',
      priority: 'medium',
      icon: <BarChart3 className="w-5 h-5 text-purple-400" />
    }
  ];

  const quickPrompts = [
    "What are my top leads this week?",
    "Show me deals about to close",
    "Which invoices are overdue?",
    "Analyze my pipeline performance",
    "How is my team performing?",
    "When is my next available time slot?",
    "Suggest automations for lead nurturing",
    "Generate insights from recent activities"
  ];

  // AI Response simulation based on query content
  const generateAIResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('lead')) {
      return `Based on your CRM data, here are your top leads this week:

**High-Priority Leads (Score 8+):**
1. **John Doe** from ACME Corp (Lead Score: 85)
   - Recently viewed pricing page 3 times
   - Opened last 4 emails
   - Company size: 500+ employees
   
2. **Jane Smith** from Globex Industries (Lead Score: 78)
   - Downloaded case study
   - Attended recent webinar
   - Budget confirmed: $50k+

**Recommendations:**
• Schedule calls with John and Jane this week
• Send personalized proposals to both prospects
• Follow up on their specific pain points

Would you like me to help you draft outreach emails for these leads?`;
    }
    
    if (lowerQuery.includes('deal') && lowerQuery.includes('close')) {
      return `Here are your deals approaching closure:

**Closing This Week:**
1. **TechCorp Integration** - $125,000
   - Stage: Final Approval (90% probability)
   - Decision maker confirmed
   - Contract sent, awaiting signature
   
2. **StartupXYZ Platform** - $75,000
   - Stage: Negotiation (75% probability)
   - Pricing discussion in progress
   - Demo scheduled for Friday

**Action Items:**
• Follow up on TechCorp contract status
• Prepare counter-proposal for StartupXYZ
• Schedule closing calls for both deals

Total potential revenue closing: **$200,000**`;
    }
    
    if (lowerQuery.includes('invoice')) {
      return `Here's your invoice status overview:

**Overdue Invoices (Requires Attention):**
• INV-2024-1005: **€3,000** - GlobalTech Ltd (12 days overdue)
• INV-2024-0987: **€1,500** - DataCorp Inc (8 days overdue)
• INV-2024-0956: **€500** - SmallBiz Co (5 days overdue)

**Total Overdue: €5,000**

**Recommendations:**
• Contact GlobalTech immediately - significant amount
• Send payment reminder to DataCorp
• Call SmallBiz Co directly

**Recent Payments:**
• INV-2024-1001: €2,500 paid yesterday ✓
• INV-2024-0999: €1,200 paid 2 days ago ✓

Would you like me to help draft payment reminder emails?`;
    }
    
    if (lowerQuery.includes('pipeline') || lowerQuery.includes('performance')) {
      return `Here's your pipeline performance analysis:

**Current Pipeline Overview:**
• **Total Pipeline Value:** $2.4M
• **Active Deals:** 24 opportunities
• **Average Deal Size:** $100k
• **Sales Cycle:** 45 days (avg)

**Stage Breakdown:**
• Prospecting: 8 deals ($320k)
• Qualification: 6 deals ($600k)  
• Proposal: 5 deals ($750k)
• Negotiation: 3 deals ($450k)
• Closing: 2 deals ($280k)

**Performance Trends:**
📈 **Conversion Rate:** 32% (↑12% from last month)
📈 **Win Rate:** 68% (consistent)
📉 **Sales Cycle:** 45 days (↓3 days)

**Key Insights:**
• Your conversion rate is improving significantly
• Focus on moving proposal-stage deals forward
• Strong performance in closing phase

Excellent work this month! 🎉`;
    }
    
    if (lowerQuery.includes('team')) {
      return `Team Performance Analysis:

**Overall Team Metrics:**
• **Team Size:** 5 sales reps
• **Team Quota Attainment:** 87%
• **Average Deal Size:** $95k
• **Team Conversion Rate:** 29%

**Individual Performance:**
1. **Sarah Johnson** - 112% of quota ⭐
2. **Mike Chen** - 98% of quota
3. **Lisa Rodriguez** - 85% of quota  
4. **Tom Wilson** - 82% of quota
5. **Alex Kumar** - 76% of quota

**Team Insights:**
• Sarah is leading in both volume and quality
• Mike is consistently reliable performer
• Lisa and Tom need support with lead qualification
• Alex would benefit from sales training

**Recommendations:**
• Organize knowledge sharing session with Sarah
• Provide additional coaching for Alex
• Team is on track to exceed quarterly targets`;
    }
    
    if (lowerQuery.includes('time') || lowerQuery.includes('calendar')) {
      return `Calendar Analysis & Availability:

**Today's Schedule:**
• 9:00 AM - Team standup (30 min)
• 11:00 AM - ACME Corp demo (60 min)
• 2:00 PM - Pipeline review meeting (45 min)

**Next Available Slots:**
• **Today:** 3:30 PM - 5:00 PM (90 minutes free)
• **Tomorrow:** 10:00 AM - 11:30 AM (90 minutes)
• **Thursday:** 9:00 AM - 12:00 PM (3 hours - perfect for important calls)

**Optimal Times for Calls:**
• Tuesday & Thursday mornings (highest energy)
• Avoid Friday afternoons (lower engagement)

**Meeting Load Analysis:**
• This week: 18 hours of meetings (optimal range)
• Focus time available: 22 hours
• Meeting efficiency: 85% (well-balanced)

Would you like me to schedule any follow-up calls in these available slots?`;
    }
    
    if (lowerQuery.includes('automation')) {
      return `Here are automation suggestions for your workflow:

**High-Impact Automations:**

1. **Lead Nurturing Sequence** 🔥
   - Auto-send educational content to new leads
   - 5-email sequence over 2 weeks
   - Expected impact: +25% conversion rate

2. **Follow-up Reminders** ⏰
   - Automatic reminders for overdue follow-ups
   - Smart timing based on lead behavior
   - Never miss a hot lead again

3. **Deal Stage Notifications** 📈
   - Alert team when deals move to closing stages
   - Automated next-step suggestions
   - Ensure timely follow-ups

4. **Invoice Payment Tracking** 💰
   - Automatic overdue payment reminders
   - Escalation sequence for large amounts
   - Improve cash flow by 30%

**Implementation Priority:**
1. Start with lead nurturing (highest ROI)
2. Set up follow-up reminders
3. Add deal notifications
4. Implement invoice automation

Would you like me to help you set up any of these automations?`;
    }
    
    // Default response
    return `I understand you're looking for insights about "${query}". 

While I'm still learning about your specific data, I can help you with:

**Available Analysis:**
• Lead scoring and prioritization
• Deal pipeline forecasting  
• Invoice tracking and payments
• Team performance metrics
• Calendar optimization
• Automation suggestions

**What I can do:**
• Analyze your CRM data in real-time
• Provide actionable recommendations
• Help you prioritize tasks and opportunities
• Generate reports and insights
• Suggest process improvements

Try asking me something specific like:
• "Show me my top 5 leads"
• "Which deals are at risk?"
• "How can I improve my conversion rate?"

How can I help you succeed today? 🚀`;
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversation]);

  const handleQuickPrompt = (prompt: string) => {
    setInputMessage(prompt);
    handleSendMessage(prompt);
  };

  const handleSendMessage = async (message?: string) => {
    const msg = message || inputMessage;
    if (!msg.trim()) return;

    // Add user message
    const userMessage: GuruMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: msg,
      timestamp: new Date(),
      type: 'text'
    };

    setConversation(prev => [...prev, userMessage]);
    setInputMessage('');

    try {
      // Simulate AI thinking time
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
      
      // Generate AI response
      const aiResponse = generateAIResponse(msg);
      
      const guruMessage: GuruMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'guru',
        content: aiResponse,
        timestamp: new Date(),
        type: 'insight'
      };

      setConversation(prev => [...prev, guruMessage]);

      showToast({
        title: 'Analysis Complete',
        description: 'Guru has analyzed your request and provided insights.',
        type: 'success'
      });

    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to get AI response. Please try again.',
        type: 'error'
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMessage = (message: GuruMessage) => {
    return (
      <div
        key={message.id}
        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`flex max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
          {/* Avatar */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            message.sender === 'user' 
              ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
              : 'bg-gradient-to-r from-orange-500 to-yellow-500'
          }`}>
            {message.sender === 'user' ? (
              <Users className="w-4 h-4 text-white" />
            ) : (
              <Brain className="w-4 h-4 text-white" />
            )}
          </div>
          
          {/* Message Content */}
          <div className={`rounded-2xl p-4 ${
            message.sender === 'user'
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
              : 'bg-black/20 backdrop-blur-xl border border-white/20 text-white'
          }`}>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.content}
            </div>
            <div className={`text-xs mt-2 ${
              message.sender === 'user' ? 'text-blue-100' : 'text-white/60'
            }`}>
              {formatTimestamp(message.timestamp)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <BrandBackground>
      <BrandPageLayout 
        title="Guru AI Hub"
        subtitle="Your intelligent CRM assistant"
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/20 to-yellow-500/20 backdrop-blur-xl border border-white/20">
                <Brain className="w-8 h-8 text-orange-400" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Guru AI Hub</h1>
                <p className="text-white/70">Your intelligent CRM assistant</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <BrandBadge variant="green">
                AI Online
              </BrandBadge>
              <BrandButton variant="secondary" size="sm" onClick={() => setShowSettings(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </BrandButton>
            </div>
          </div>

          {/* Quick Access Insights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {aiInsights.map((insight) => (
              <div
                key={insight.id} 
                className="cursor-pointer"
                onClick={() => {
                  let prompt = '';
                  switch (insight.type) {
                    case 'lead':
                      prompt = 'What are my top leads this week?';
                      break;
                    case 'deal':
                      prompt = 'Show me deals about to close';
                      break;
                    case 'invoice':
                      prompt = 'Which invoices are overdue?';
                      break;
                    case 'general':
                      prompt = 'Analyze my pipeline performance';
                      break;
                  }
                  handleQuickPrompt(prompt);
                }}
              >
                <BrandCard 
                  borderGradient="purple"
                  className="p-4"
                >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-white/10">
                    {insight.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-white text-sm">{insight.title}</h3>
                    <p className="text-white/70 text-xs mt-1">{insight.description}</p>
                  </div>
                </div>
                </BrandCard>
              </div>
            ))}
          </div>

          {/* Main Chat Interface */}
          <BrandCard borderGradient="blue" className="h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="flex-shrink-0 p-4 border-b border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-orange-500/20 to-yellow-500/20">
                    <Brain className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">AI Conversation</h2>
                    <p className="text-white/60 text-sm">Ask me anything about your CRM data</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <BrandButton 
                    variant="secondary" 
                    size="sm"
                    onClick={() => setIsSpeaking(!isSpeaking)}
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </BrandButton>
                  <BrandButton 
                    variant="secondary" 
                    size="sm"
                    onClick={() => setIsListening(!isListening)}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </BrandButton>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
              style={{ 
                backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(168, 85, 247, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)'
              }}
            >
              {conversation.map(renderMessage)}
              
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl p-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-white/60 text-sm">Guru is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="flex-shrink-0 p-4 border-t border-white/20">
              <div className="space-y-3">
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about your CRM data..."
                      disabled={isLoading}
                      className="w-full px-4 py-3 bg-black/20 backdrop-blur-xl border-2 border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  <BrandButton 
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim() || isLoading}
                    variant="orange"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </BrandButton>
                </div>
                
                {/* Quick Prompts */}
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.slice(0, 4).map((prompt, index) => (
                    <BrandButton
                      key={index}
                      variant="secondary"
                      size="sm"
                      onClick={() => handleQuickPrompt(prompt)}
                      disabled={isLoading}
                      className="text-xs"
                    >
                      {prompt}
                    </BrandButton>
                  ))}
                </div>
              </div>
            </div>
          </BrandCard>

          {/* Settings Modal */}
          {showSettings && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <BrandCard borderGradient="purple" className="w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* Settings Header */}
                <div className="flex-shrink-0 p-6 border-b border-white/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20">
                        <Settings className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">AI Hub Settings</h2>
                        <p className="text-white/70">Configure your AI assistant preferences</p>
                      </div>
                    </div>
                    <BrandButton variant="secondary" size="sm" onClick={() => setShowSettings(false)}>
                      <X className="w-4 h-4" />
                    </BrandButton>
                  </div>
                </div>

                {/* Settings Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* AI Preferences */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <Brain className="w-5 h-5 mr-2 text-purple-400" />
                      AI Preferences
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Response Detail Level</p>
                          <p className="text-white/60 text-sm">How detailed should AI responses be?</p>
                        </div>
                        <select className="px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white text-sm">
                          <option value="concise">Concise</option>
                          <option value="detailed" selected>Detailed</option>
                          <option value="comprehensive">Comprehensive</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Auto-suggestions</p>
                          <p className="text-white/60 text-sm">Show quick prompts and suggestions</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-black/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Data Context</p>
                          <p className="text-white/60 text-sm">Include real-time CRM data in responses</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-black/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Voice & Audio */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <Volume2 className="w-5 h-5 mr-2 text-blue-400" />
                      Voice & Audio
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Voice Input</p>
                          <p className="text-white/60 text-sm">Enable voice commands and dictation</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-black/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Text-to-Speech</p>
                          <p className="text-white/60 text-sm">Read AI responses aloud</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-black/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Sound Effects</p>
                          <p className="text-white/60 text-sm">Play notification sounds</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-black/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Privacy & Data */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <Users className="w-5 h-5 mr-2 text-green-400" />
                      Privacy & Data
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Conversation History</p>
                          <p className="text-white/60 text-sm">Save chat history for future reference</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-black/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Data Analytics</p>
                          <p className="text-white/60 text-sm">Use interactions to improve AI responses</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-black/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                      </div>

                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                        <div className="flex items-start space-x-3">
                          <Target className="w-5 h-5 text-yellow-400 mt-0.5" />
                          <div>
                            <p className="text-yellow-300 font-medium text-sm">Privacy Notice</p>
                            <p className="text-yellow-200/80 text-sm mt-1">
                              Your data is processed securely and never shared with third parties. 
                              All AI interactions are encrypted and comply with GDPR standards.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <DollarSign className="w-5 h-5 mr-2 text-orange-400" />
                      Quick Actions
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <BrandButton variant="secondary" className="justify-start">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Clear History
                      </BrandButton>
                      <BrandButton variant="secondary" className="justify-start">
                        <Send className="w-4 h-4 mr-2" />
                        Export Data
                      </BrandButton>
                      <BrandButton variant="secondary" className="justify-start">
                        <Brain className="w-4 h-4 mr-2" />
                        Reset AI
                      </BrandButton>
                      <BrandButton variant="secondary" className="justify-start">
                        <Target className="w-4 h-4 mr-2" />
                        Feedback
                      </BrandButton>
                    </div>
                  </div>
                </div>

                {/* Settings Footer */}
                <div className="flex-shrink-0 p-6 border-t border-white/20">
                  <div className="flex items-center justify-between">
                    <div className="text-white/60 text-sm">
                      AI Hub Version 3.2 • Last updated today
                    </div>
                    <div className="flex space-x-3">
                      <BrandButton variant="secondary" onClick={() => setShowSettings(false)}>
                        Cancel
                      </BrandButton>
                      <BrandButton variant="purple" onClick={() => {
                        setShowSettings(false);
                        showToast({
                          title: 'Settings Saved',
                          description: 'Your AI Hub preferences have been updated.',
                          type: 'success'
                        });
                      }}>
                        Save Changes
                      </BrandButton>
                    </div>
                  </div>
                </div>
              </BrandCard>
            </div>
          )}
        </div>
      </BrandPageLayout>
    </BrandBackground>
  );
}
