import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Square, 
  Upload, 
  Download, 
  Brain, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Users, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb, 
  Phone, 
  Video, 
  Settings, 
  Search,
  Filter,
  Calendar,
  BarChart3,
  MessageSquare,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Zap,
  Eye,
  Star,
  Award,
  Rocket,
  Shield,
  Globe,
  X,
  Plus,
  Edit,
  Trash2,
  Share,
  Copy,
  ExternalLink
} from 'lucide-react';
import { BrandBackground, BrandPageLayout, BrandCard, BrandButton, BrandBadge } from '../contexts/BrandDesignContext';

// Types and Interfaces
interface CallTranscript {
  id: string;
  contactId?: string;
  dealId?: string;
  title: string;
  duration: string;
  date: string;
  type: 'sales_call' | 'demo' | 'discovery' | 'follow_up' | 'meeting';
  status: 'recording' | 'transcribing' | 'analyzing' | 'completed';
  transcript: string;
  summary: string;
  sentiment: {
    overall: 'positive' | 'neutral' | 'negative';
    confidence: number;
    emotions: string[];
  };
  insights: {
    customerNeeds: string[];
    objections: string[];
    opportunities: string[];
    concerns: string[];
  };
  actionItems: {
    id: string;
    action: string;
    priority: 'high' | 'medium' | 'low';
    assignee?: string;
    dueDate?: string;
    completed: boolean;
  }[];
  participants: {
    name: string;
    role: 'rep' | 'customer' | 'prospect' | 'team';
    speakingTime: number;
  }[];
  keywords: string[];
  nextSteps: string[];
  competitorsMentioned: string[];
  dealSize?: number;
  closeProbability?: number;
}

interface AIInsight {
  type: 'opportunity' | 'risk' | 'action' | 'trend';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  category: string;
}

const Intelligence: React.FC = () => {
  // State Management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentCall, setCurrentCall] = useState<CallTranscript | null>(null);
  const [transcripts, setTranscripts] = useState<CallTranscript[]>([]);
  const [selectedTranscript, setSelectedTranscript] = useState<CallTranscript | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Sample Data
  useEffect(() => {
    const sampleTranscripts: CallTranscript[] = [
      {
        id: '1',
        contactId: 'contact-1',
        dealId: 'deal-1',
        title: 'Discovery Call - TechCorp Solutions',
        duration: '32:45',
        date: '2024-01-15T10:30:00Z',
        type: 'discovery',
        status: 'completed',
        transcript: 'Thank you for taking the time to speak with me today. I understand you\'re looking for a CRM solution that can help streamline your sales process. Can you tell me about your current challenges? Well, we\'re using a combination of spreadsheets and an outdated system that doesn\'t integrate well. Our team is growing and we need something more robust. That makes sense. How many users would you be looking to support initially? We have about 15 sales reps now, but we\'re planning to double that in the next year. What\'s your timeline for making a decision? We\'d like to have something in place by Q2. Budget-wise, we\'re looking at around $150 per user per month. That sounds reasonable. Let me show you how our platform can address those specific needs...',
        summary: 'Discovery call with TechCorp Solutions. They need a CRM for 15 users (scaling to 30), budget $150/user/month, timeline Q2. Current pain points: spreadsheets, poor integration, scaling team. Strong interest in our platform features.',
        sentiment: {
          overall: 'positive',
          confidence: 0.85,
          emotions: ['interested', 'optimistic', 'engaged']
        },
        insights: {
          customerNeeds: ['Robust CRM system', 'Better integration', 'User scalability', 'Team growth support'],
          objections: ['Budget considerations', 'Timeline constraints'],
          opportunities: ['Growing team', 'Current system inadequate', 'Clear pain points'],
          concerns: ['Implementation timeline', 'User adoption']
        },
        actionItems: [
          {
            id: 'action-1',
            action: 'Send detailed pricing proposal for 15-30 users',
            priority: 'high',
            assignee: 'John Smith',
            dueDate: '2024-01-17',
            completed: false
          },
          {
            id: 'action-2',
            action: 'Schedule product demo focusing on integration features',
            priority: 'high',
            assignee: 'John Smith',
            dueDate: '2024-01-20',
            completed: false
          },
          {
            id: 'action-3',
            action: 'Prepare implementation timeline document',
            priority: 'medium',
            assignee: 'Sarah Johnson',
            dueDate: '2024-01-18',
            completed: true
          }
        ],
        participants: [
          { name: 'John Smith', role: 'rep', speakingTime: 45 },
          { name: 'Mike Johnson', role: 'prospect', speakingTime: 55 }
        ],
        keywords: ['CRM', 'integration', 'scaling', 'Q2 timeline', 'budget'],
        nextSteps: ['Send proposal', 'Schedule demo', 'Follow up in 3 days'],
        competitorsMentioned: ['Salesforce', 'HubSpot'],
        dealSize: 54000,
        closeProbability: 75
      },
      {
        id: '2',
        contactId: 'contact-2',
        title: 'Product Demo - RetailMax Inc',
        duration: '45:20',
        date: '2024-01-14T14:00:00Z',
        type: 'demo',
        status: 'completed',
        transcript: 'Good afternoon! Thank you for joining today\'s demo. I\'m excited to show you how our CRM can transform your retail operations. Let\'s start with the dashboard... This looks impressive, but I\'m concerned about the learning curve for our team. How long does implementation typically take? Great question. For a team your size, we typically see full adoption within 4-6 weeks. We provide comprehensive training and support. What about data migration from our current system? We have a dedicated migration team that handles that seamlessly. Most clients are surprised by how smooth the process is. I\'m also wondering about mobile access - our sales team is often on the road. Absolutely, let me show you our mobile app... That\'s exactly what we need. What are the next steps if we decide to move forward?',
        summary: 'Successful product demo with RetailMax Inc. Strong interest in mobile features and dashboard. Main concerns: learning curve and implementation time. Ready to discuss next steps.',
        sentiment: {
          overall: 'positive',
          confidence: 0.92,
          emotions: ['impressed', 'confident', 'ready to proceed']
        },
        insights: {
          customerNeeds: ['Mobile CRM access', 'Easy implementation', 'Team training', 'Data migration'],
          objections: ['Learning curve concerns', 'Implementation timeline'],
          opportunities: ['Mobile-first team', 'Ready to make decision', 'Budget approved'],
          concerns: ['User adoption', 'Training requirements']
        },
        actionItems: [
          {
            id: 'action-4',
            action: 'Send implementation timeline and training schedule',
            priority: 'high',
            assignee: 'Sarah Johnson',
            dueDate: '2024-01-16',
            completed: false
          },
          {
            id: 'action-5',
            action: 'Prepare data migration assessment',
            priority: 'medium',
            assignee: 'Tech Team',
            dueDate: '2024-01-18',
            completed: false
          }
        ],
        participants: [
          { name: 'Sarah Johnson', role: 'rep', speakingTime: 60 },
          { name: 'Lisa Chen', role: 'prospect', speakingTime: 40 }
        ],
        keywords: ['mobile CRM', 'implementation', 'training', 'data migration'],
        nextSteps: ['Send implementation plan', 'Schedule follow-up call', 'Prepare contract'],
        competitorsMentioned: [],
        dealSize: 72000,
        closeProbability: 85
      }
    ];

    setTranscripts(sampleTranscripts);

    // Sample AI Insights
    const sampleInsights: AIInsight[] = [
      {
        type: 'opportunity',
        title: 'High-Value Deal Potential',
        description: 'TechCorp Solutions shows strong buying signals with approved budget and clear timeline.',
        confidence: 0.87,
        impact: 'high',
        category: 'Sales Opportunity'
      },
      {
        type: 'action',
        title: 'Immediate Follow-up Required',
        description: 'RetailMax Inc is ready to proceed - send implementation timeline within 24 hours.',
        confidence: 0.94,
        impact: 'high',
        category: 'Action Required'
      },
      {
        type: 'trend',
        title: 'Mobile Features High Demand',
        description: 'Last 5 calls mentioned mobile CRM as primary requirement.',
        confidence: 0.78,
        impact: 'medium',
        category: 'Product Trend'
      },
      {
        type: 'risk',
        title: 'Competitor Mentions Increasing',
        description: 'Salesforce mentioned in 3 recent calls - prepare competitive positioning.',
        confidence: 0.82,
        impact: 'medium',
        category: 'Competitive Risk'
      }
    ];

    setAiInsights(sampleInsights);
  }, []);

  // Recording Functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        processRecording(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);

      // Create current call object
      const newCall: CallTranscript = {
        id: `call-${Date.now()}`,
        title: `Sales Call - ${new Date().toLocaleString()}`,
        duration: '00:00',
        date: new Date().toISOString(),
        type: 'sales_call',
        status: 'recording',
        transcript: '',
        summary: '',
        sentiment: { overall: 'neutral', confidence: 0, emotions: [] },
        insights: { customerNeeds: [], objections: [], opportunities: [], concerns: [] },
        actionItems: [],
        participants: [],
        keywords: [],
        nextSteps: [],
        competitorsMentioned: []
      };

      setCurrentCall(newCall);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  const processRecording = async (audioBlob: Blob) => {
    setIsAnalyzing(true);
    
    // Simulate API processing
    setTimeout(() => {
      if (currentCall) {
        const processedCall: CallTranscript = {
          ...currentCall,
          status: 'completed',
          transcript: 'This is a simulated transcript of the recorded call. In a real implementation, this would be generated by OpenAI Whisper or similar speech-to-text service.',
          summary: 'AI-generated summary: This was a productive sales call discussing CRM requirements and next steps.',
          sentiment: {
            overall: 'positive',
            confidence: 0.8,
            emotions: ['engaged', 'interested']
          },
          insights: {
            customerNeeds: ['CRM solution', 'Better reporting'],
            objections: ['Price concerns'],
            opportunities: ['Growth potential', 'Decision maker present'],
            concerns: ['Implementation timeline']
          },
          actionItems: [
            {
              id: `action-${Date.now()}`,
              action: 'Send follow-up email with pricing',
              priority: 'high',
              assignee: 'Current User',
              dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
              completed: false
            }
          ],
          participants: [
            { name: 'Sales Rep', role: 'rep', speakingTime: 50 },
            { name: 'Prospect', role: 'customer', speakingTime: 50 }
          ],
          keywords: ['CRM', 'pricing', 'timeline'],
          nextSteps: ['Send proposal', 'Schedule follow-up'],
          competitorsMentioned: []
        };

        setTranscripts(prev => [processedCall, ...prev]);
        setCurrentCall(null);
      }
      setIsAnalyzing(false);
    }, 3000);
  };

  // Helper Functions
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <ThumbsUp className="w-4 h-4 text-green-400" />;
      case 'negative': return <ThumbsDown className="w-4 h-4 text-red-400" />;
      default: return <MessageSquare className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'secondary';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="w-4 h-4" />;
      case 'risk': return <AlertTriangle className="w-4 h-4" />;
      case 'action': return <Zap className="w-4 h-4" />;
      case 'trend': return <BarChart3 className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getInsightBorderColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'green';
      case 'risk': return 'red';
      case 'action': return 'purple';
      case 'trend': return 'blue';
      default: return 'primary';
    }
  };

  const generateInsights = async () => {
    setIsGeneratingInsights(true);
    
    // Simulate AI insight generation
    setTimeout(() => {
      const newInsight: AIInsight = {
        type: 'opportunity',
        title: 'New Pattern Detected',
        description: `AI analysis of recent calls shows increased interest in mobile features. Consider highlighting mobile capabilities in next demo.`,
        confidence: Math.random() * 0.3 + 0.7,
        impact: 'medium',
        category: 'Sales Intelligence'
      };
      
      setAiInsights(prev => [newInsight, ...prev]);
      setIsGeneratingInsights(false);
    }, 2000);
  };

  // Filtering and Search
  const filteredTranscripts = transcripts.filter(transcript => {
    const matchesSearch = transcript.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transcript.transcript.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || transcript.type === filterType;
    return matchesSearch && matchesFilter;
  });

  // Tab Components
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <BrandCard>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Total Calls</p>
                <p className="text-2xl font-bold text-white">{transcripts.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/20">
                <Phone className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>
        </BrandCard>

        <BrandCard>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Avg. Sentiment</p>
                <p className="text-2xl font-bold text-green-400">85%</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/20">
                <Heart className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>
        </BrandCard>

        <BrandCard>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Action Items</p>
                <p className="text-2xl font-bold text-purple-400">
                  {transcripts.reduce((sum, t) => sum + t.actionItems.length, 0)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/20">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>
        </BrandCard>

        <BrandCard>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Total Duration</p>
                <p className="text-2xl font-bold text-orange-400">12h 45m</p>
              </div>
              <div className="p-3 rounded-xl bg-orange-500/20">
                <Clock className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </div>
        </BrandCard>
      </div>

      {/* AI Insights Panel */}
      <BrandCard borderGradient="purple">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20">
                <Brain className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">AI Intelligence Insights</h3>
                <p className="text-white/70">Real-time analysis and recommendations</p>
              </div>
            </div>
            <BrandButton 
              variant="purple" 
              size="sm" 
              onClick={generateInsights}
              disabled={isGeneratingInsights}
            >
              {isGeneratingInsights ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              ) : (
                <Lightbulb className="w-4 h-4 mr-2" />
              )}
              Generate Insights
            </BrandButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiInsights.slice(0, 4).map((insight, index) => (
              <BrandCard key={index} borderGradient={getInsightBorderColor(insight.type)} className="p-4">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg bg-${getInsightBorderColor(insight.type)}-500/20`}>
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white text-sm">{insight.title}</h4>
                      <BrandBadge variant={insight.impact === 'high' ? 'red' : insight.impact === 'medium' ? 'yellow' : 'green'}>
                        {insight.impact}
                      </BrandBadge>
                    </div>
                    <p className="text-white/70 text-xs mb-2">{insight.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/50">{insight.category}</span>
                      <span className="text-xs text-white/50">{Math.round(insight.confidence * 100)}% confidence</span>
                    </div>
                  </div>
                </div>
              </BrandCard>
            ))}
          </div>
        </div>
      </BrandCard>

      {/* Recent Transcripts */}
      <BrandCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Recent Call Transcripts</h3>
            <BrandButton variant="secondary" size="sm" onClick={() => setActiveTab('transcripts')}>
              View All
            </BrandButton>
          </div>

          <div className="space-y-4">
            {transcripts.slice(0, 3).map((transcript) => (
              <div key={transcript.id} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                   onClick={() => setSelectedTranscript(transcript)}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white">{transcript.title}</h4>
                  <div className="flex items-center space-x-2">
                    {getSentimentIcon(transcript.sentiment.overall)}
                    <span className="text-xs text-white/70">{transcript.duration}</span>
                  </div>
                </div>
                <p className="text-white/70 text-sm mb-2 line-clamp-2">{transcript.summary}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/50">{new Date(transcript.date).toLocaleDateString()}</span>
                  <div className="flex space-x-1">
                    {transcript.actionItems.slice(0, 2).map((action) => (
                      <BrandBadge key={action.id} variant={getPriorityColor(action.priority)}>
                        {action.priority}
                      </BrandBadge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </BrandCard>
    </div>
  );

  const renderLiveRecording = () => (
    <div className="space-y-6">
      {/* Recording Controls */}
      <BrandCard borderGradient="red">
        <div className="p-8 text-center">
          <div className="mb-6">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${isRecording ? 'bg-red-500/20 animate-pulse' : 'bg-gray-500/20'} mb-4`}>
              <Mic className={`w-12 h-12 ${isRecording ? 'text-red-400' : 'text-gray-400'}`} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {isRecording ? (isPaused ? 'Recording Paused' : 'Recording in Progress') : 'Ready to Record'}
            </h3>
            <p className="text-white/70">
              {isRecording ? 'AI is actively transcribing and analyzing your conversation' : 'Start recording to begin AI-powered call analysis'}
            </p>
          </div>

          <div className="flex items-center justify-center space-x-4">
            {!isRecording ? (
              <BrandButton variant="red" size="lg" onClick={startRecording}>
                <Mic className="w-5 h-5 mr-2" />
                Start Recording
              </BrandButton>
            ) : (
              <>
                <BrandButton 
                  variant={isPaused ? "green" : "yellow"} 
                  size="lg" 
                  onClick={pauseRecording}
                >
                  {isPaused ? <Play className="w-5 h-5 mr-2" /> : <Pause className="w-5 h-5 mr-2" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </BrandButton>
                <BrandButton variant="secondary" size="lg" onClick={stopRecording}>
                  <Square className="w-5 h-5 mr-2" />
                  Stop & Analyze
                </BrandButton>
              </>
            )}
          </div>

          {isRecording && (
            <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-red-400 font-medium">LIVE</span>
              </div>
              <p className="text-white/70 text-sm">
                Real-time transcription and AI analysis active
              </p>
            </div>
          )}
        </div>
      </BrandCard>

      {/* Current Call Analysis */}
      {(currentCall || isAnalyzing) && (
        <BrandCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Current Call Analysis</h3>
              <BrandBadge variant={isAnalyzing ? "yellow" : "green"}>
                {isAnalyzing ? "Analyzing" : currentCall?.status}
              </BrandBadge>
            </div>

            {isAnalyzing ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
                <h4 className="text-white font-semibold mb-2">AI Processing Your Call</h4>
                <p className="text-white/70">Generating transcript, summary, and actionable insights...</p>
              </div>
            ) : currentCall && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/70 text-sm">Call Title</label>
                    <p className="text-white font-medium">{currentCall.title}</p>
                  </div>
                  <div>
                    <label className="text-white/70 text-sm">Duration</label>
                    <p className="text-white font-medium">{currentCall.duration}</p>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <h5 className="text-white font-medium mb-2">Live Transcript Preview</h5>
                  <p className="text-white/70 text-sm">
                    {isRecording ? "Transcription will appear here as you speak..." : currentCall.transcript || "No transcript available yet"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </BrandCard>
      )}

      {/* Upload Option */}
      <BrandCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Upload Recording</h3>
            <BrandButton variant="secondary" onClick={() => setShowUploadModal(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </BrandButton>
          </div>
          <p className="text-white/70">
            Upload existing audio/video files for AI transcription and analysis. 
            Supports MP3, MP4, WAV, and other common formats.
          </p>
        </div>
      </BrandCard>
    </div>
  );

  const renderTranscripts = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <BrandCard>
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="text"
                  placeholder="Search transcripts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="all">All Types</option>
                <option value="sales_call">Sales Calls</option>
                <option value="demo">Demos</option>
                <option value="discovery">Discovery</option>
                <option value="follow_up">Follow-ups</option>
                <option value="meeting">Meetings</option>
              </select>
              
              <BrandButton variant="secondary" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </BrandButton>
            </div>
          </div>
        </div>
      </BrandCard>

      {/* Transcripts List */}
      <div className="grid gap-6">
        {filteredTranscripts.map((transcript) => (
          <BrandCard key={transcript.id} className="hover:scale-[1.02] transition-transform cursor-pointer"
                     onClick={() => setSelectedTranscript(transcript)}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{transcript.title}</h3>
                    <BrandBadge variant="secondary">{transcript.type.replace('_', ' ')}</BrandBadge>
                    <BrandBadge variant={transcript.status === 'completed' ? 'green' : 'yellow'}>
                      {transcript.status}
                    </BrandBadge>
                  </div>
                  <p className="text-white/70 mb-3">{transcript.summary}</p>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-white/70">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{transcript.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getSentimentIcon(transcript.sentiment.overall)}
                    <span className={getSentimentColor(transcript.sentiment.overall)}>
                      {transcript.sentiment.overall}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <h5 className="text-white/80 font-medium text-sm mb-2">Key Insights</h5>
                  <div className="space-y-1">
                    {transcript.insights.customerNeeds.slice(0, 2).map((need, idx) => (
                      <span key={idx} className="inline-block px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded mr-1 mb-1">
                        {need}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h5 className="text-white/80 font-medium text-sm mb-2">Action Items</h5>
                  <div className="space-y-1">
                    {transcript.actionItems.slice(0, 2).map((action) => (
                      <div key={action.id} className="flex items-center space-x-2">
                        <BrandBadge variant={getPriorityColor(action.priority)} className="text-xs">
                          {action.priority}
                        </BrandBadge>
                        <span className="text-white/70 text-xs truncate">{action.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h5 className="text-white/80 font-medium text-sm mb-2">Participants</h5>
                  <div className="space-y-1">
                    {transcript.participants.map((participant, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-xs">
                        <Users className="w-3 h-3 text-white/50" />
                        <span className="text-white/70">{participant.name}</span>
                        <span className="text-white/50">({participant.speakingTime}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-white/50">
                  {new Date(transcript.date).toLocaleString()}
                </span>
                <div className="flex items-center space-x-2">
                  <BrandButton variant="secondary" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </BrandButton>
                  <BrandButton variant="secondary" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </BrandButton>
                </div>
              </div>
            </div>
          </BrandCard>
        ))}
      </div>

      {filteredTranscripts.length === 0 && (
        <BrandCard>
          <div className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Transcripts Found</h3>
            <p className="text-white/70 mb-6">Start recording calls or upload audio files to begin AI analysis.</p>
            <BrandButton onClick={() => setActiveTab('recording')}>
              <Mic className="w-4 h-4 mr-2" />
              Start Recording
            </BrandButton>
          </div>
        </BrandCard>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <BrandCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-medium">Avg Call Duration</h4>
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">38.5 min</p>
            <p className="text-green-400 text-sm">+12% from last month</p>
          </div>
        </BrandCard>

        <BrandCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-medium">Sentiment Score</h4>
              <Heart className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white">84.2%</p>
            <p className="text-green-400 text-sm">+5% improvement</p>
          </div>
        </BrandCard>

        <BrandCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-medium">Action Completion</h4>
              <CheckCircle className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">76.8%</p>
            <p className="text-yellow-400 text-sm">-3% needs attention</p>
          </div>
        </BrandCard>

        <BrandCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-medium">Deal Conversion</h4>
              <TrendingUp className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-white">68.4%</p>
            <p className="text-green-400 text-sm">+15% this quarter</p>
          </div>
        </BrandCard>
      </div>

      {/* Sentiment Trends */}
      <BrandCard>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Sentiment Analysis Trends</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
                <ThumbsUp className="w-8 h-8 text-green-400" />
              </div>
              <h4 className="text-xl font-bold text-green-400">72%</h4>
              <p className="text-white/70">Positive Calls</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500/20 mb-4">
                <MessageSquare className="w-8 h-8 text-yellow-400" />
              </div>
              <h4 className="text-xl font-bold text-yellow-400">21%</h4>
              <p className="text-white/70">Neutral Calls</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
                <ThumbsDown className="w-8 h-8 text-red-400" />
              </div>
              <h4 className="text-xl font-bold text-red-400">7%</h4>
              <p className="text-white/70">Negative Calls</p>
            </div>
          </div>
        </div>
      </BrandCard>

      {/* Top Keywords & Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BrandCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Top Keywords</h3>
            <div className="space-y-3">
              {['CRM integration', 'Mobile features', 'Pricing', 'Implementation', 'Training'].map((keyword, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-white/80">{keyword}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        style={{ width: `${Math.random() * 80 + 20}%` }}
                      ></div>
                    </div>
                    <span className="text-white/60 text-sm">{Math.floor(Math.random() * 30 + 10)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </BrandCard>

        <BrandCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Competitor Mentions</h3>
            <div className="space-y-3">
              {['Salesforce', 'HubSpot', 'Pipedrive', 'Zoho CRM', 'Monday.com'].map((competitor, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-white/80">{competitor}</span>
                  <div className="flex items-center space-x-2">
                    <BrandBadge variant={idx < 2 ? 'red' : 'yellow'}>
                      {Math.floor(Math.random() * 10 + 3)} mentions
                    </BrandBadge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </BrandCard>
      </div>
    </div>
  );

  // Tabs configuration
  const tabs = [
    { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { key: 'recording', label: 'Live Recording', icon: Mic },
    { key: 'transcripts', label: 'Transcripts', icon: FileText },
    { key: 'analytics', label: 'Analytics', icon: TrendingUp }
  ];

  return (
    <BrandBackground>
      <BrandPageLayout
        title="Intelligence Hub"
        subtitle="AI-powered call transcription, analysis, and insights"
        actions={
          <div className="flex items-center space-x-3">
            <BrandButton variant="secondary" onClick={() => setShowSettings(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </BrandButton>
            <BrandButton variant="green">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </BrandButton>
          </div>
        }
      >
        {/* Tab Navigation */}
        <BrandCard className="mb-6">
          <div className="p-6">
            <div className="flex space-x-1 bg-white/5 rounded-xl p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === tab.key
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </BrandCard>

        {/* Tab Content */}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'recording' && renderLiveRecording()}
        {activeTab === 'transcripts' && renderTranscripts()}
        {activeTab === 'analytics' && renderAnalytics()}

        {/* Transcript Detail Modal */}
        {selectedTranscript && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <BrandCard className="w-full max-w-4xl max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedTranscript.title}</h2>
                    <p className="text-white/70">{new Date(selectedTranscript.date).toLocaleString()}</p>
                  </div>
                  <BrandButton variant="secondary" size="sm" onClick={() => setSelectedTranscript(null)}>
                    <X className="w-4 h-4" />
                  </BrandButton>
                </div>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Transcript */}
                  <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-white mb-4">Full Transcript</h3>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 max-h-96 overflow-y-auto">
                      <p className="text-white/80 leading-relaxed whitespace-pre-wrap">
                        {selectedTranscript.transcript}
                      </p>
                    </div>
                  </div>
                  
                  {/* Analysis */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">AI Analysis</h3>
                    <div className="space-y-4">
                      {/* Summary */}
                      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <h4 className="font-semibold text-white mb-2">Summary</h4>
                        <p className="text-white/70 text-sm">{selectedTranscript.summary}</p>
                      </div>
                      
                      {/* Sentiment */}
                      <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                        <h4 className="font-semibold text-white mb-2">Sentiment Analysis</h4>
                        <div className="flex items-center space-x-2 mb-2">
                          {getSentimentIcon(selectedTranscript.sentiment.overall)}
                          <span className={`font-medium ${getSentimentColor(selectedTranscript.sentiment.overall)}`}>
                            {selectedTranscript.sentiment.overall}
                          </span>
                          <span className="text-white/70 text-sm">
                            ({Math.round(selectedTranscript.sentiment.confidence * 100)}% confident)
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {selectedTranscript.sentiment.emotions.map((emotion, idx) => (
                            <span key={idx} className="px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded">
                              {emotion}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {/* Action Items */}
                      <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                        <h4 className="font-semibold text-white mb-2">Action Items</h4>
                        <div className="space-y-2">
                          {selectedTranscript.actionItems.map((action) => (
                            <div key={action.id} className="flex items-start space-x-2">
                              <input 
                                type="checkbox" 
                                checked={action.completed}
                                className="mt-1 rounded border-white/20"
                                readOnly
                              />
                              <div className="flex-1">
                                <p className={`text-sm ${action.completed ? 'line-through text-white/50' : 'text-white/80'}`}>
                                  {action.action}
                                </p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <BrandBadge variant={getPriorityColor(action.priority)} className="text-xs">
                                    {action.priority}
                                  </BrandBadge>
                                  {action.dueDate && (
                                    <span className="text-xs text-white/50">{action.dueDate}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </BrandCard>
          </div>
        )}

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <BrandCard borderGradient="purple" className="w-full max-w-4xl max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20">
                      <Settings className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Intelligence Hub Settings</h2>
                      <p className="text-white/70">Configure AI transcription and analysis preferences</p>
                    </div>
                  </div>
                  <BrandButton variant="secondary" size="sm" onClick={() => setShowSettings(false)}>
                    <X className="w-4 h-4" />
                  </BrandButton>
                </div>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto">
                <div className="space-y-8">
                  {/* AI Configuration */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Brain className="w-5 h-5 mr-2 text-blue-400" />
                      AI Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Transcription Language
                          </label>
                          <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50">
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                            <option value="auto">Auto-detect</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Analysis Model
                          </label>
                          <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50">
                            <option value="gpt-4">GPT-4 (Most Accurate)</option>
                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</option>
                            <option value="claude">Claude (Alternative)</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Confidence Threshold
                          </label>
                          <div className="flex items-center space-x-3">
                            <input
                              type="range"
                              min="50"
                              max="95"
                              defaultValue="70"
                              className="flex-1 h-2 bg-black/20 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <span className="text-white font-medium w-12">70%</span>
                          </div>
                          <p className="text-white/50 text-xs mt-1">Minimum confidence for action items</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Real-time Processing
                          </label>
                          <div className="flex items-center space-x-3">
                            <input type="checkbox" defaultChecked className="rounded border-white/20" />
                            <span className="text-white/80">Enable live transcription</span>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Speaker Identification
                          </label>
                          <div className="flex items-center space-x-3">
                            <input type="checkbox" defaultChecked className="rounded border-white/20" />
                            <span className="text-white/80">Automatic speaker diarization</span>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Sentiment Analysis
                          </label>
                          <div className="flex items-center space-x-3">
                            <input type="checkbox" defaultChecked className="rounded border-white/20" />
                            <span className="text-white/80">Enable emotional intelligence</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Privacy & Security */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-green-400" />
                      Privacy & Security
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Data Retention
                          </label>
                          <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50">
                            <option value="30">30 days</option>
                            <option value="90">90 days</option>
                            <option value="365">1 year</option>
                            <option value="forever">Forever</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Encryption Level
                          </label>
                          <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50">
                            <option value="aes256">AES-256 (Recommended)</option>
                            <option value="aes128">AES-128</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Data Sharing
                          </label>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <input type="checkbox" className="rounded border-white/20" />
                              <span className="text-white/80">Share anonymized insights</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <input type="checkbox" defaultChecked className="rounded border-white/20" />
                              <span className="text-white/80">Team access to call summaries</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Compliance Mode
                          </label>
                          <div className="flex items-center space-x-3">
                            <input type="checkbox" className="rounded border-white/20" />
                            <span className="text-white/80">GDPR Compliance</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CRM Integration */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Globe className="w-5 h-5 mr-2 text-orange-400" />
                      CRM Integration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Auto-linking
                          </label>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <input type="checkbox" defaultChecked className="rounded border-white/20" />
                              <span className="text-white/80">Link calls to contacts</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <input type="checkbox" defaultChecked className="rounded border-white/20" />
                              <span className="text-white/80">Link calls to deals</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <input type="checkbox" className="rounded border-white/20" />
                              <span className="text-white/80">Auto-create contacts from calls</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Automation
                          </label>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <input type="checkbox" defaultChecked className="rounded border-white/20" />
                              <span className="text-white/80">Create action items automatically</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <input type="checkbox" className="rounded border-white/20" />
                              <span className="text-white/80">Update deal probabilities</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <input type="checkbox" className="rounded border-white/20" />
                              <span className="text-white/80">Send team notifications</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notifications */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
                      Notifications
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Email Notifications
                          </label>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <input type="checkbox" defaultChecked className="rounded border-white/20" />
                              <span className="text-white/80">Call transcription complete</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <input type="checkbox" className="rounded border-white/20" />
                              <span className="text-white/80">Negative sentiment detected</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <input type="checkbox" className="rounded border-white/20" />
                              <span className="text-white/80">High-priority action items</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            In-App Notifications
                          </label>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <input type="checkbox" defaultChecked className="rounded border-white/20" />
                              <span className="text-white/80">Real-time analysis updates</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <input type="checkbox" defaultChecked className="rounded border-white/20" />
                              <span className="text-white/80">Weekly analytics summary</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Storage & Performance */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Rocket className="w-5 h-5 mr-2 text-purple-400" />
                      Storage & Performance
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Audio Quality
                          </label>
                          <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50">
                            <option value="high">High Quality (44kHz)</option>
                            <option value="medium">Medium Quality (22kHz)</option>
                            <option value="low">Low Quality (16kHz)</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Storage Location
                          </label>
                          <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50">
                            <option value="cloud">Cloud Storage</option>
                            <option value="local">Local Storage</option>
                            <option value="hybrid">Hybrid</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Processing Priority
                          </label>
                          <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50">
                            <option value="realtime">Real-time</option>
                            <option value="fast">Fast (5 min)</option>
                            <option value="standard">Standard (15 min)</option>
                            <option value="batch">Batch (1 hour)</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">
                            Cache Duration
                          </label>
                          <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50">
                            <option value="1">1 hour</option>
                            <option value="24">24 hours</option>
                            <option value="168">1 week</option>
                            <option value="720">1 month</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <div className="text-white/60 text-sm">
                    Settings are automatically saved as you change them
                  </div>
                  <div className="flex space-x-3">
                    <BrandButton variant="secondary" onClick={() => setShowSettings(false)}>
                      Cancel
                    </BrandButton>
                    <BrandButton variant="purple" onClick={() => {
                      // TODO: Save settings logic
                      console.log('Settings saved');
                      setShowSettings(false);
                    }}>
                      <Settings className="w-4 h-4 mr-2" />
                      Save Settings
                    </BrandButton>
                  </div>
                </div>
              </div>
            </BrandCard>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <BrandCard className="w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Upload Recording</h2>
                  <BrandButton variant="secondary" size="sm" onClick={() => setShowUploadModal(false)}>
                    <X className="w-4 h-4" />
                  </BrandButton>
                </div>
                
                <div 
                  className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-purple-400/50 transition-colors cursor-pointer"
                  onDrop={(e) => {
                    e.preventDefault();
                    const files = Array.from(e.dataTransfer.files);
                    const audioFile = files.find(file => 
                      file.type.startsWith('audio/') || file.type.startsWith('video/')
                    );
                    if (audioFile) {
                      console.log('File dropped:', audioFile.name);
                      // TODO: Process uploaded file
                      setShowUploadModal(false);
                    }
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'audio/*,video/*';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        console.log('File selected:', file.name);
                        // TODO: Process uploaded file
                        setShowUploadModal(false);
                      }
                    };
                    input.click();
                  }}
                >
                  <Upload className="w-12 h-12 text-white/50 mx-auto mb-4" />
                  <h3 className="text-white font-medium mb-2">Drop your files here</h3>
                  <p className="text-white/70 text-sm mb-4">
                    or click to browse
                  </p>
                  <BrandButton variant="secondary" onClick={(e) => e.stopPropagation()}>
                    Choose Files
                  </BrandButton>
                </div>
                
                <div className="mt-6">
                  <p className="text-white/70 text-sm">
                    Supported formats: MP3, MP4, WAV, M4A (max 100MB)
                  </p>
                </div>
              </div>
            </BrandCard>
          </div>
        )}
      </BrandPageLayout>
    </BrandBackground>
  );
};

export default Intelligence;
