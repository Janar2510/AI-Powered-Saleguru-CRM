import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Users, 
  Clock, 
  Download,
  Settings,
  RefreshCw,
  X,
  Activity,
  MessageSquare,
  Globe,
  MapPin,
  Building,
  Eye,
  Brain,
  Lightbulb,
  Database,
  AlertTriangle,
  CheckCircle,
  Rocket
} from 'lucide-react';
import { useGuru } from '../contexts/GuruContext';
import { useToastContext } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import AnalyticsChart from '../components/analytics/AnalyticsChart';
import Bar3DChart from '../components/analytics/3DBarChart';
import { 
  BrandBackground, 
  BrandPageLayout, 
  BrandCard, 
  BrandButton, 
  BrandBadge
} from '../contexts/BrandDesignContext';

// Time periods
type TimePeriod = 'week' | 'month' | 'quarter' | 'year' | 'all';



// Analytics scope types
type AnalyticsScope = 'organization' | 'user' | 'country' | 'product' | 'region' | 'team' | 'industry';

interface AnalyticsData {
  sales: Array<{ name: string; value: number; color?: string }>;
  leads: Array<{ name: string; value: number; color?: string }>;
  conversions: Array<{ name: string; value: number; color?: string }>;
  revenue: Array<{ name: string; value: number; color?: string }>;
  pipeline: Array<{ name: string; value: number; color?: string }>;
  activities: Array<{ name: string; value: number; color?: string }>;
}

interface AdminSettings {
  scope: AnalyticsScope;
  selectedUser: string;
  selectedCountry: string;
  selectedProduct: string;
  selectedRegion: string;
  selectedTeam: string;
  selectedIndustry: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  refreshInterval: number;
  exportFormat: 'csv' | 'pdf' | 'excel' | 'json';
  enableAIInsights: boolean;
  enableRealTimeUpdates: boolean;
  enablePredictiveAnalytics: boolean;
}

interface AIInsight {
  id: string;
  type: 'suggestion' | 'warning' | 'opportunity' | 'prediction';
  category: 'sales' | 'pipeline' | 'market' | 'performance';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  impact: 'low' | 'medium' | 'high';
  timestamp: Date;
  metadata?: any;
}

interface MarketAnalytics {
  industryTrends: Array<{ name: string; trend: 'up' | 'down' | 'stable'; percentage: number }>;
  competitorAnalysis: Array<{ name: string; marketShare: number; growth: number }>;
  marketOpportunities: Array<{ segment: string; potential: number; difficulty: number }>;
  seasonalPatterns: Array<{ period: string; factor: number; confidence: number }>;
}

const Analytics: React.FC = () => {
  const { openGuru } = useGuru();
  const { showToast } = useToastContext();
  const navigate = useNavigate();
  
  // Enhanced State Management
  const [isLoading, setIsLoading] = useState(true);
  const [showAdminSettings, setShowAdminSettings] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Admin Settings State
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    scope: 'organization',
    selectedUser: 'all',
    selectedCountry: 'all',
    selectedProduct: 'all',
    selectedRegion: 'all',
    selectedTeam: 'all',
    selectedIndustry: 'all',
    dateRange: {
      start: null,
      end: null
    },
    refreshInterval: 300, // 5 minutes
    exportFormat: 'excel',
    enableAIInsights: true,
    enableRealTimeUpdates: false,
    enablePredictiveAnalytics: true
  });
  
  // Enhanced Filters
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
  
  // AI Insights State
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([
    {
      id: '1',
      type: 'opportunity',
      category: 'sales',
      title: 'Q4 Revenue Opportunity',
      description: 'Increase outreach by 25% in December to capture end-of-year budget allocations. Historical data shows 40% higher conversion rates.',
      confidence: 87,
      actionable: true,
      impact: 'high',
      timestamp: new Date(),
      metadata: { expectedIncrease: '25%', timeframe: 'Q4' }
    },
    {
      id: '2',
      type: 'warning',
      category: 'pipeline',
      title: 'Pipeline Velocity Slowdown',
      description: 'Deal progression has slowed by 15% in the last 30 days. Consider increasing follow-up frequency.',
      confidence: 92,
      actionable: true,
      impact: 'medium',
      timestamp: new Date(),
      metadata: { slowdown: '15%', period: '30 days' }
    },
    {
      id: '3',
      type: 'prediction',
      category: 'market',
      title: 'Market Expansion Prediction',
      description: 'AI predicts 35% growth opportunity in the Healthcare sector based on current trends and competitor analysis.',
      confidence: 78,
      actionable: true,
      impact: 'high',
      timestamp: new Date(),
      metadata: { sector: 'Healthcare', growth: '35%' }
    }
  ]);
  
  // Market Analytics State
  const [marketAnalytics] = useState<MarketAnalytics>({
    industryTrends: [
      { name: 'Technology', trend: 'up', percentage: 23 },
      { name: 'Healthcare', trend: 'up', percentage: 18 },
      { name: 'Finance', trend: 'stable', percentage: 5 },
      { name: 'Manufacturing', trend: 'down', percentage: -8 }
    ],
    competitorAnalysis: [
      { name: 'Competitor A', marketShare: 35, growth: 12 },
      { name: 'Competitor B', marketShare: 28, growth: 8 },
      { name: 'Our Company', marketShare: 22, growth: 15 },
      { name: 'Others', marketShare: 15, growth: 5 }
    ],
    marketOpportunities: [
      { segment: 'SMB Healthcare', potential: 85, difficulty: 30 },
      { segment: 'Enterprise Tech', potential: 70, difficulty: 60 },
      { segment: 'Mid-market Finance', potential: 60, difficulty: 45 }
    ],
    seasonalPatterns: [
      { period: 'Q1', factor: 0.9, confidence: 85 },
      { period: 'Q2', factor: 1.1, confidence: 90 },
      { period: 'Q3', factor: 0.95, confidence: 88 },
      { period: 'Q4', factor: 1.25, confidence: 95 }
    ]
  });
  
  // Enhanced Analytics Data with Brand Colors
  const [analyticsData] = useState<AnalyticsData>({
    sales: [
      { name: 'Jan', value: 120000, color: '#a259ff' },
      { name: 'Feb', value: 180000, color: '#377dff' },
      { name: 'Mar', value: 150000, color: '#ff6b6b' },
      { name: 'Apr', value: 220000, color: '#6bcf7f' },
      { name: 'May', value: 280000, color: '#ffd93d' },
      { name: 'Jun', value: 320000, color: '#ff8e53' }
    ],
    leads: [
      { name: 'Website', value: 1247, color: '#a259ff' },
      { name: 'Referrals', value: 856, color: '#377dff' },
      { name: 'Social Media', value: 623, color: '#ff6b6b' },
      { name: 'Email Campaigns', value: 445, color: '#6bcf7f' },
      { name: 'Direct', value: 234, color: '#ffd93d' }
    ],
    conversions: [
      { name: 'Lead to Qualified', value: 35.2, color: '#a259ff' },
      { name: 'Qualified to Opportunity', value: 28.5, color: '#377dff' },
      { name: 'Opportunity to Proposal', value: 42.1, color: '#ff6b6b' },
      { name: 'Proposal to Closed Won', value: 24.8, color: '#6bcf7f' }
    ],
    revenue: [
      { name: 'Q1 2024', value: 625000, color: '#a259ff' },
      { name: 'Q2 2024', value: 780000, color: '#377dff' },
      { name: 'Q3 2024', value: 920000, color: '#ff6b6b' },
      { name: 'Q4 2024 (Projected)', value: 1200000, color: '#6bcf7f' }
    ],
    pipeline: [
      { name: 'Prospecting', value: 150, color: '#a259ff' },
      { name: 'Qualified', value: 120, color: '#377dff' },
      { name: 'Proposal', value: 80, color: '#ff6b6b' },
      { name: 'Negotiation', value: 45, color: '#6bcf7f' },
      { name: 'Closed Won', value: 35, color: '#ffd93d' }
    ],
    activities: [
      { name: 'Calls', value: 285, color: '#a259ff' },
      { name: 'Emails', value: 420, color: '#377dff' },
      { name: 'Meetings', value: 145, color: '#ff6b6b' },
      { name: 'Tasks', value: 365, color: '#6bcf7f' }
    ]
  });



  // Enhanced selector data for admin settings
  const users = ['all', 'John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'Chris Brown'];
  const countries = ['all', 'Estonia', 'USA', 'Germany', 'Finland', 'UK', 'France', 'Canada', 'Sweden', 'Norway'];
  const products = ['all', 'CRM Core', 'AI Assistant', 'Analytics Pro', 'Integrations Hub', 'Mobile App', 'API Platform'];
  const regions = ['all', 'Europe', 'North America', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa'];
  const teams = ['all', 'Sales Team', 'Marketing Team', 'Customer Success', 'Enterprise Sales', 'Inside Sales'];
  const industries = ['all', 'Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Education', 'Real Estate'];

  // Mock data for analytics widgets
  const userClosingRate = 68;
  const companyClosingRate = 74;
  const productClosingRates = [
    { name: 'CRM', value: 80 },
    { name: 'AI Assistant', value: 65 },
    { name: 'Analytics', value: 72 },
    { name: 'Integrations', value: 60 }
  ];

  // Enhanced Handler Functions
  
  // Admin Settings Handlers
  const handleAdminSettingsChange = (key: keyof AdminSettings, value: any) => {
    setAdminSettings(prev => ({ ...prev, [key]: value }));
    
    showToast({
      type: 'info',
      title: 'Settings Updated',
      description: `Analytics ${key} changed to ${value}`
    });
  };

  const handleSaveAdminSettings = () => {
    // Save to localStorage or backend
    localStorage.setItem('analyticsAdminSettings', JSON.stringify(adminSettings));
    
    showToast({
      type: 'success',
      title: 'Settings Saved',
      description: 'Analytics configuration has been saved successfully'
    });
    
    setShowAdminSettings(false);
    
    // Refresh data with new settings
    fetchAnalyticsData();
  };

  // AI Insights Handlers
  const handleGenerateAIInsights = async () => {
    setIsGeneratingInsights(true);
    
    try {
    showToast({
      type: 'info',
        title: 'Generating AI Insights',
        description: 'Analyzing your data with advanced AI algorithms...'
      });

      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      const newInsights: AIInsight[] = [
        {
          id: Date.now().toString(),
          type: 'suggestion',
          category: 'sales',
          title: 'Optimize Follow-up Timing',
          description: 'AI suggests contacting leads on Tuesday-Thursday between 10-11 AM for 34% higher response rates.',
          confidence: 91,
          actionable: true,
          impact: 'high',
          timestamp: new Date()
        },
        {
          id: (Date.now() + 1).toString(),
          type: 'opportunity',
          category: 'market',
          title: 'Emerging Market Opportunity',
          description: 'Healthcare sector shows 89% growth potential. Consider expanding sales efforts in this vertical.',
          confidence: 85,
          actionable: true,
          impact: 'high',
          timestamp: new Date()
        }
      ];

      setAIInsights(prev => [...newInsights, ...prev]);
      
      showToast({
        type: 'success',
        title: 'AI Insights Generated',
        description: `Generated ${newInsights.length} new actionable insights`
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Generation Failed',
        description: 'Failed to generate AI insights. Please try again.'
      });
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  // Export Handlers
  const handleExportAnalytics = async () => {
    setIsExporting(true);
    
    try {
    showToast({
      type: 'info',
        title: 'Exporting Analytics',
        description: `Preparing ${adminSettings.exportFormat.toUpperCase()} export...`
      });

      // Simulate export processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create mock download
      const data = {
        analytics: analyticsData,
        insights: aiInsights,
        marketAnalytics,
        settings: adminSettings,
        exportedAt: new Date().toISOString(),
        scope: adminSettings.scope
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-export-${new Date().toISOString().split('T')[0]}.${adminSettings.exportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    showToast({
      type: 'success',
        title: 'Export Complete',
        description: 'Analytics data has been exported successfully'
      });
      
      setShowExportModal(false);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Export Failed',
        description: 'Failed to export analytics data. Please try again.'
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Pipeline Settings Handler
  const handlePipelineSettings = () => {
    showToast({
      type: 'info',
      title: 'Pipeline Settings',
      description: 'Opening pipeline configuration...'
    });
    navigate('/pipeline-settings');
  };

  // Market Analytics Handler
  const handleViewMarketAnalytics = () => {
    showToast({
      type: 'info',
      title: 'Market Analytics',
      description: 'Opening detailed market analysis report...'
    });
  };

  // Enhanced data fetching with admin settings support
  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call with admin settings
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Load saved admin settings
      const savedSettings = localStorage.getItem('analyticsAdminSettings');
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings);
          setAdminSettings(parsedSettings);
        } catch (error) {
          console.warn('Failed to parse saved admin settings');
        }
      }
      
      showToast({
        type: 'success',
        title: 'Data Refreshed',
        description: `Analytics updated for ${adminSettings.scope}`
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      showToast({
        type: 'error',
        title: 'Data Load Failed',
        description: 'Failed to load analytics data'
      });
      setIsLoading(false);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchAnalyticsData();
  }, [adminSettings.scope, timePeriod]);

  // Auto-refresh data if enabled
  useEffect(() => {
    if (adminSettings.enableRealTimeUpdates && adminSettings.refreshInterval > 0) {
      const interval = setInterval(fetchAnalyticsData, adminSettings.refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [adminSettings.enableRealTimeUpdates, adminSettings.refreshInterval]);

  // Ask Guru for insights
  const handleAskGuruInsights = () => {
    openGuru();
    showToast({
      type: 'info',
      title: 'Guru Analytics',
      description: `Analyzing ${adminSettings.scope} performance for ${timePeriod} period...`
    });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'sales', label: 'Sales', icon: TrendingUp },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'pipeline', label: 'Pipeline', icon: Target },
    { id: 'ai-insights', label: 'AI Insights', icon: Brain },
    { id: 'market', label: 'Market Analytics', icon: Globe },
    { id: 'demographics', label: 'Demographics', icon: MapPin },
  ];

  // Enhanced Rendering Functions with Brand Design
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Enhanced Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <BrandCard borderGradient="primary" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-white">€2.4M</p>
              <p className="text-green-400 text-xs font-medium">↗ +18.5% vs last quarter</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </BrandCard>

        <BrandCard borderGradient="green" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium">Active Leads</p>
              <p className="text-3xl font-bold text-white">3,247</p>
              <p className="text-green-400 text-xs font-medium">↗ +23.2% vs last quarter</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </BrandCard>

        <BrandCard borderGradient="blue" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium">Conversion Rate</p>
              <p className="text-3xl font-bold text-white">28.4%</p>
              <p className="text-green-400 text-xs font-medium">↗ +4.1% vs last quarter</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
        </BrandCard>

        <BrandCard borderGradient="orange" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium">Active Deals</p>
              <p className="text-3xl font-bold text-white">147</p>
              <p className="text-green-400 text-xs font-medium">↗ +31.3% vs last quarter</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </BrandCard>
      </div>

      {/* Enhanced 3D Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BrandCard borderGradient="primary" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Sales Performance (3D)</h3>
            <BrandBadge variant="purple">Live Data</BrandBadge>
          </div>
          <Bar3DChart
            data={analyticsData.sales.map(d => ({ id: d.name, ...d }))}
            title=""
            height={350}
          />
        </BrandCard>

        <BrandCard borderGradient="blue" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Revenue Trend</h3>
            <BrandBadge variant="blue">Predictive</BrandBadge>
        </div>
          <AnalyticsChart
            data={analyticsData.revenue.map(d => ({ id: d.name, ...d }))}
            type="line"
            title=""
            height={350}
          />
        </BrandCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BrandCard borderGradient="green" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Lead Sources</h3>
            <BrandBadge variant="green">Real-time</BrandBadge>
          </div>
          <AnalyticsChart
            data={analyticsData.leads.map(d => ({ id: d.name, ...d }))}
            type="pie"
            title=""
            height={350}
          />
        </BrandCard>

        <BrandCard borderGradient="orange" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Activity Heatmap (3D)</h3>
            <BrandBadge variant="orange">AI-Enhanced</BrandBadge>
        </div>
          <Bar3DChart
            data={analyticsData.activities.map(d => ({ id: d.name, ...d }))}
            title=""
            height={350}
          />
        </BrandCard>
      </div>
    </div>
  );

  const renderSales = () => (
    <div className="space-y-6">
      <BrandCard borderGradient="purple" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-white">Sales Performance (3D Visualization)</h3>
          <BrandBadge variant="purple">AI-Enhanced</BrandBadge>
        </div>
        <Bar3DChart
          data={analyticsData.sales.map(d => ({ id: d.name, ...d }))}
          title=""
          height={400}
        />
      </BrandCard>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BrandCard borderGradient="blue" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Conversion Funnel</h3>
            <BrandBadge variant="blue">Real-time</BrandBadge>
          </div>
          <AnalyticsChart
            data={analyticsData.conversions.map(d => ({ id: d.name, ...d }))}
            type="pie"
            title=""
            height={350}
          />
        </BrandCard>
        
        <BrandCard borderGradient="green" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Revenue Growth</h3>
            <BrandBadge variant="green">Predictive</BrandBadge>
        </div>
          <AnalyticsChart
            data={analyticsData.revenue.map(d => ({ id: d.name, ...d }))}
            type="line"
            title=""
            height={350}
          />
        </BrandCard>
      </div>
    </div>
  );

  const renderLeads = () => (
    <div className="space-y-6">
      <BrandCard borderGradient="green" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-white">Lead Source Distribution</h3>
          <BrandBadge variant="green">Real-time</BrandBadge>
        </div>
        <AnalyticsChart
          data={analyticsData.leads.map(d => ({ id: d.name, ...d }))}
          type="pie"
          title=""
          height={400}
        />
      </BrandCard>
      
      <BrandCard borderGradient="orange" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Lead Activities (3D)</h3>
          <BrandBadge variant="orange">AI-Enhanced</BrandBadge>
      </div>
        <Bar3DChart
          data={analyticsData.activities.map(d => ({ id: d.name, ...d }))}
          title=""
          height={350}
        />
      </BrandCard>
    </div>
  );

  const renderRevenue = () => (
    <div className="space-y-6">
      <BrandCard borderGradient="blue" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-white">Revenue Trend Analysis</h3>
          <BrandBadge variant="blue">Predictive AI</BrandBadge>
        </div>
        <AnalyticsChart
          data={analyticsData.revenue.map(d => ({ id: d.name, ...d }))}
          type="line"
          title=""
          height={400}
        />
      </BrandCard>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BrandCard borderGradient="purple" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Monthly Sales (3D)</h3>
            <BrandBadge variant="purple">3D Visualization</BrandBadge>
          </div>
          <Bar3DChart
            data={analyticsData.sales.map(d => ({ id: d.name, ...d }))}
            title=""
            height={350}
          />
        </BrandCard>
        
        <BrandCard borderGradient="orange" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Revenue by Stage</h3>
            <BrandBadge variant="orange">Live Data</BrandBadge>
        </div>
          <AnalyticsChart
            data={analyticsData.conversions.map(d => ({ id: d.name, ...d }))}
            type="bar"
            title=""
            height={350}
          />
        </BrandCard>
      </div>
    </div>
  );

  const renderPipeline = () => (
    <div className="space-y-6">
      <BrandCard borderGradient="primary" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-white">Pipeline Stages (3D)</h3>
          <div className="flex space-x-2">
            <BrandBadge variant="purple">3D Visualization</BrandBadge>
            <BrandButton variant="secondary" size="sm" onClick={handlePipelineSettings}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </BrandButton>
          </div>
        </div>
        <Bar3DChart
          data={analyticsData.pipeline.map(d => ({ id: d.name, ...d }))}
          title=""
          height={400}
        />
      </BrandCard>
      
      <BrandCard borderGradient="blue" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Pipeline Conversion Rates</h3>
          <BrandBadge variant="blue">Real-time</BrandBadge>
      </div>
        <AnalyticsChart
          data={analyticsData.conversions.map(d => ({ id: d.name, ...d }))}
          type="pie"
          title=""
          height={350}
        />
      </BrandCard>
    </div>
  );

  // New AI Insights Tab
  const renderAIInsights = () => (
    <div className="space-y-6">
      {/* AI Insights Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">AI-Powered Analytics Insights</h2>
          <p className="text-white/70">Intelligent recommendations to optimize your sales performance</p>
        </div>
        <div className="flex space-x-3">
          <BrandButton 
            variant="purple" 
            onClick={handleGenerateAIInsights}
            disabled={isGeneratingInsights}
          >
            {isGeneratingInsights ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Generate Insights
              </>
            )}
          </BrandButton>
          <BrandButton variant="secondary" onClick={handleAskGuruInsights}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Ask Guru
          </BrandButton>
        </div>
      </div>

      {/* AI Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {aiInsights.map((insight) => (
          <BrandCard 
            key={insight.id}
            borderGradient={insight.impact === 'high' ? 'red' : insight.impact === 'medium' ? 'orange' : 'blue'}
            className="p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  insight.type === 'opportunity' ? 'bg-green-500/20' :
                  insight.type === 'warning' ? 'bg-yellow-500/20' :
                  insight.type === 'prediction' ? 'bg-purple-500/20' :
                  'bg-blue-500/20'
                }`}>
                  {insight.type === 'opportunity' && <Rocket className="w-5 h-5 text-green-400" />}
                  {insight.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-400" />}
                  {insight.type === 'prediction' && <Brain className="w-5 h-5 text-purple-400" />}
                  {insight.type === 'suggestion' && <Lightbulb className="w-5 h-5 text-blue-400" />}
                </div>
            <div>
                  <h3 className="text-white font-semibold">{insight.title}</h3>
                  <BrandBadge variant={insight.category as any}>{insight.category}</BrandBadge>
            </div>
            </div>
              <div className="text-right">
                <div className="text-white font-bold">{insight.confidence}%</div>
                <div className="text-white/50 text-xs">confidence</div>
          </div>
        </div>

            <p className="text-white/80 mb-4">{insight.description}</p>
            
          <div className="flex items-center justify-between">
              <BrandBadge 
                variant={insight.impact === 'high' ? 'red' : insight.impact === 'medium' ? 'orange' : 'secondary'}
              >
                {insight.impact} impact
              </BrandBadge>
              {insight.actionable && (
                <BrandButton variant="secondary" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Take Action
                </BrandButton>
              )}
            </div>
          </BrandCard>
        ))}
        </div>

      {/* AI Performance Metrics */}
      <BrandCard borderGradient="purple" className="p-6">
        <h3 className="text-xl font-bold text-white mb-4">AI Analytics Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">94%</div>
            <div className="text-white/70 text-sm">Prediction Accuracy</div>
            </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">127</div>
            <div className="text-white/70 text-sm">Insights Generated</div>
            </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">€450K</div>
            <div className="text-white/70 text-sm">Revenue Impact</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-400">23%</div>
            <div className="text-white/70 text-sm">Performance Boost</div>
        </div>
      </div>
      </BrandCard>
    </div>
  );

  // New Market Analytics Tab
  const renderMarketAnalytics = () => (
    <div className="space-y-6">
      {/* Market Analytics Header */}
      <div className="flex items-center justify-between">
          <div>
          <h2 className="text-2xl font-bold text-white mb-2">Market Intelligence & Trends</h2>
          <p className="text-white/70">Competitive analysis and market opportunities</p>
          </div>
        <BrandButton variant="green" onClick={handleViewMarketAnalytics}>
          <Globe className="w-4 h-4 mr-2" />
          Market Report
        </BrandButton>
        </div>
        
      {/* Industry Trends */}
      <BrandCard borderGradient="green" className="p-6">
        <h3 className="text-xl font-bold text-white mb-4">Industry Growth Trends</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {marketAnalytics.industryTrends.map((trend, index) => (
            <div key={index} className="text-center p-4 bg-black/20 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <span className="text-white font-medium">{trend.name}</span>
                {trend.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-400 ml-2" />}
                {trend.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400 ml-2" />}
                {trend.trend === 'stable' && <Activity className="w-4 h-4 text-yellow-400 ml-2" />}
            </div>
              <div className={`text-2xl font-bold ${
                trend.trend === 'up' ? 'text-green-400' : 
                trend.trend === 'down' ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {trend.percentage > 0 ? '+' : ''}{trend.percentage}%
          </div>
            </div>
          ))}
          </div>
      </BrandCard>

      {/* Market Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BrandCard borderGradient="blue" className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">Market Opportunities</h3>
          <div className="space-y-4">
            {marketAnalytics.marketOpportunities.map((opp, index) => (
              <div key={index} className="p-4 bg-black/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{opp.segment}</span>
                  <BrandBadge variant={opp.potential > 70 ? 'green' : 'orange'}>
                    {opp.potential}% potential
                  </BrandBadge>
            </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="text-xs text-white/70 mb-1">Difficulty</div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-red-500 to-yellow-500 h-2 rounded-full"
                        style={{ width: `${opp.difficulty}%` }}
                      ></div>
          </div>
            </div>
                  <div className="text-white/70 text-sm">{opp.difficulty}%</div>
          </div>
        </div>
            ))}
            </div>
        </BrandCard>

        <BrandCard borderGradient="orange" className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">Seasonal Patterns</h3>
          <div className="space-y-4">
            {marketAnalytics.seasonalPatterns.map((pattern, index) => (
              <div key={index} className="p-4 bg-black/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{pattern.period}</span>
                  <div className="text-right">
                    <div className="text-white font-bold">{pattern.factor.toFixed(2)}x</div>
                    <div className="text-white/70 text-xs">{pattern.confidence}% confidence</div>
              </div>
              </div>
            </div>
            ))}
              </div>
        </BrandCard>
              </div>

      {/* Competitor Analysis */}
      <BrandCard borderGradient="red" className="p-6">
        <h3 className="text-xl font-bold text-white mb-4">Competitive Landscape</h3>
        <Bar3DChart
          data={marketAnalytics.competitorAnalysis.map(comp => ({ 
            id: comp.name, 
            name: comp.name, 
            value: comp.marketShare,
            color: comp.name === 'Our Company' ? '#a259ff' : '#6b7280'
          }))}
          title=""
          height={300}
        />
      </BrandCard>
    </div>
  );

  // Enhanced Demographics with Brand Design
  const renderDemographics = () => (
    <div className="space-y-6">
      {/* Admin Controls */}
      <BrandCard borderGradient="primary" className="p-6">
        <h3 className="text-xl font-bold text-white mb-4">Geographic Analytics Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Region', value: adminSettings.selectedRegion, options: regions, key: 'selectedRegion' },
            { label: 'Country', value: adminSettings.selectedCountry, options: countries, key: 'selectedCountry' },
            { label: 'Product', value: adminSettings.selectedProduct, options: products, key: 'selectedProduct' }
          ].map((filter) => (
            <div key={filter.key}>
              <label className="block text-white/70 text-sm font-medium mb-2">{filter.label}</label>
          <select
                className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={filter.value}
                onChange={(e) => handleAdminSettingsChange(filter.key as keyof AdminSettings, e.target.value)}
              >
                {filter.options.map(option => (
                  <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
          ))}
        </div>
      </BrandCard>

      {/* Enhanced Analytics Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <BrandCard borderGradient="blue" className="p-6">
          <div className="flex items-center justify-between">
        <div>
              <p className="text-white/70 text-sm font-medium">User Closing Rate</p>
              <p className="text-3xl font-bold text-white">{userClosingRate}%</p>
              <p className="text-green-400 text-xs">Above average</p>
        </div>
            <Users className="w-8 h-8 text-blue-400" />
      </div>
        </BrandCard>

        <BrandCard borderGradient="green" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium">Company Rate</p>
              <p className="text-3xl font-bold text-white">{companyClosingRate}%</p>
              <p className="text-green-400 text-xs">Industry leading</p>
        </div>
            <Building className="w-8 h-8 text-green-400" />
        </div>
        </BrandCard>

        <BrandCard borderGradient="orange" className="p-6 col-span-2">
          <h4 className="text-white font-medium mb-4">Product Performance</h4>
          <AnalyticsChart
            data={productClosingRates.map(p => ({ id: p.name, name: p.name, value: p.value }))}
            type="bar"
            title=""
            height={120}
          />
        </BrandCard>
        </div>

      {/* Enhanced Map Visualization */}
      <BrandCard borderGradient="purple" className="p-6">
        <h3 className="text-xl font-bold text-white mb-4">Global Sales Heatmap</h3>
        <div className="w-full h-80 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg flex items-center justify-center border border-white/10">
          <div className="text-center">
            <Globe className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <p className="text-white/70 text-lg">Interactive 3D Global Sales Map</p>
            <p className="text-white/50 text-sm">Real-time deal visualization by geographic location</p>
      </div>
        </div>
      </BrandCard>
    </div>
  );

  if (isLoading) {
    return (
      <BrandBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/70">Loading advanced analytics...</p>
        </div>
            </div>
      </BrandBackground>
    );
  }

  return (
    <BrandBackground>
      <BrandPageLayout
        title="Advanced Analytics Dashboard"
        subtitle="AI-powered insights with comprehensive market intelligence and 3D visualizations"
        actions={
          <div className="flex space-x-3">
            <BrandButton variant="secondary" onClick={() => setShowAdminSettings(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Admin Settings
            </BrandButton>
            <BrandButton variant="purple" onClick={() => setShowExportModal(true)}>
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </BrandButton>
            <BrandButton variant="green" onClick={fetchAnalyticsData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </BrandButton>
      </div>
        }
      >
        <div className="space-y-6">
          {/* Enhanced Analytics Scope Indicator */}
          <BrandCard borderGradient="primary" className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Database className="w-5 h-5 text-purple-400" />
                  <span className="text-white font-medium">Analytics Scope:</span>
                  <BrandBadge variant="purple">{adminSettings.scope}</BrandBadge>
              </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-medium">Period:</span>
                  <BrandBadge variant="blue">{timePeriod}</BrandBadge>
            </div>
                {adminSettings.enableRealTimeUpdates && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm">Live Updates</span>
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <BrandButton variant="secondary" onClick={() => setTimePeriod('week')}>Week</BrandButton>
                <BrandButton variant="secondary" onClick={() => setTimePeriod('month')}>Month</BrandButton>
                <BrandButton variant="secondary" onClick={() => setTimePeriod('quarter')}>Quarter</BrandButton>
                <BrandButton variant="secondary" onClick={() => setTimePeriod('year')}>Year</BrandButton>
              </div>
            </div>
          </BrandCard>

          {/* Enhanced Tab Navigation */}
          <div className="flex space-x-2 bg-black/20 rounded-xl p-2 backdrop-blur-sm">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 flex-1 justify-center ${
                      activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg transform scale-105'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                  <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

          {/* Dynamic Tab Content */}
            <div className="animate-fade-in">
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'sales' && renderSales()}
              {activeTab === 'leads' && renderLeads()}
              {activeTab === 'revenue' && renderRevenue()}
              {activeTab === 'pipeline' && renderPipeline()}
            {activeTab === 'ai-insights' && renderAIInsights()}
            {activeTab === 'market' && renderMarketAnalytics()}
              {activeTab === 'demographics' && renderDemographics()}
            </div>

          {/* Admin Settings Modal */}
          {showAdminSettings && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <BrandCard borderGradient="purple" className="w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20">
                        <Settings className="w-6 h-6 text-purple-400" />
                </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Analytics Administration</h2>
                        <p className="text-white/70">Configure scope, filters, and export settings</p>
                      </div>
                    </div>
                    <BrandButton variant="secondary" size="sm" onClick={() => setShowAdminSettings(false)}>
                      <X className="w-4 h-4" />
                    </BrandButton>
                  </div>
                </div>
                
                <div className="p-6 flex-1 overflow-y-auto space-y-6">
                  {/* Analytics Scope */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Analytics Scope</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: 'scope', label: 'Analysis Scope', options: ['organization', 'user', 'country', 'product', 'region', 'team', 'industry'], value: adminSettings.scope },
                        { key: 'selectedUser', label: 'User Filter', options: users, value: adminSettings.selectedUser },
                        { key: 'selectedCountry', label: 'Country Filter', options: countries, value: adminSettings.selectedCountry },
                        { key: 'selectedProduct', label: 'Product Filter', options: products, value: adminSettings.selectedProduct },
                        { key: 'selectedRegion', label: 'Region Filter', options: regions, value: adminSettings.selectedRegion },
                        { key: 'selectedTeam', label: 'Team Filter', options: teams, value: adminSettings.selectedTeam },
                        { key: 'selectedIndustry', label: 'Industry Filter', options: industries, value: adminSettings.selectedIndustry },
                        { key: 'exportFormat', label: 'Export Format', options: ['csv', 'pdf', 'excel', 'json'], value: adminSettings.exportFormat }
                      ].map((setting) => (
                        <div key={setting.key}>
                          <label className="block text-white/70 text-sm font-medium mb-2">{setting.label}</label>
                          <select
                            className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={setting.value}
                            onChange={(e) => handleAdminSettingsChange(setting.key as keyof AdminSettings, e.target.value)}
                          >
                            {setting.options.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Advanced Settings */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Advanced Settings</h3>
                    <div className="space-y-4">
                      {[
                        { key: 'enableAIInsights', label: 'Enable AI Insights', description: 'Use AI to generate smart recommendations' },
                        { key: 'enableRealTimeUpdates', label: 'Real-time Updates', description: 'Automatically refresh data every few minutes' },
                        { key: 'enablePredictiveAnalytics', label: 'Predictive Analytics', description: 'Show forecast and trend predictions' }
                      ].map((setting) => (
                        <div key={setting.key} className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                          <div>
                            <div className="text-white font-medium">{setting.label}</div>
                            <div className="text-white/70 text-sm">{setting.description}</div>
                          </div>
                          <button
                            onClick={() => handleAdminSettingsChange(setting.key as keyof AdminSettings, !adminSettings[setting.key as keyof AdminSettings])}
                            className={`w-12 h-6 rounded-full transition-colors ${
                              adminSettings[setting.key as keyof AdminSettings] ? 'bg-purple-500' : 'bg-gray-600'
                            }`}
                          >
                            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                              adminSettings[setting.key as keyof AdminSettings] ? 'translate-x-6' : 'translate-x-0.5'
                            }`}></div>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="p-6 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <div className="text-white/60 text-sm">
                      Changes will be applied immediately and saved to your profile
                    </div>
                    <div className="flex space-x-3">
                      <BrandButton variant="secondary" onClick={() => setShowAdminSettings(false)}>
                        Cancel
                      </BrandButton>
                      <BrandButton variant="purple" onClick={handleSaveAdminSettings}>
                        <Settings className="w-4 h-4 mr-2" />
                        Save Settings
                      </BrandButton>
                    </div>
                  </div>
                </div>
              </BrandCard>
              </div>
            )}

          {/* Export Modal */}
          {showExportModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <BrandCard borderGradient="green" className="w-full max-w-lg">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-white">Export Analytics Data</h2>
                      <p className="text-white/70">Choose format and download your data</p>
          </div>
                    <BrandButton variant="secondary" size="sm" onClick={() => setShowExportModal(false)}>
                      <X className="w-4 h-4" />
                    </BrandButton>
      </div>
                  
                  <div className="space-y-4 mb-6">
                    {['csv', 'excel', 'pdf', 'json'].map((format) => (
                      <button
                        key={format}
                        onClick={() => handleAdminSettingsChange('exportFormat', format)}
                        className={`w-full p-4 rounded-lg border text-left transition-all ${
                          adminSettings.exportFormat === format
                            ? 'border-green-500 bg-green-500/10'
                            : 'border-white/20 bg-black/20 hover:border-white/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-medium">{format.toUpperCase()}</div>
                            <div className="text-white/70 text-sm">
                              {format === 'csv' && 'Comma-separated values for spreadsheets'}
                              {format === 'excel' && 'Microsoft Excel format with charts'}
                              {format === 'pdf' && 'Formatted report with visualizations'}
                              {format === 'json' && 'Raw data for developers'}
    </div>
                          </div>
                          {adminSettings.exportFormat === format && (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <BrandButton variant="secondary" onClick={() => setShowExportModal(false)}>
                      Cancel
                    </BrandButton>
                    <BrandButton 
                      variant="green" 
                      onClick={handleExportAnalytics}
                      disabled={isExporting}
                    >
                      {isExporting ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Export Data
                        </>
                      )}
                    </BrandButton>
                  </div>
                </div>
              </BrandCard>
            </div>
          )}
        </div>
      </BrandPageLayout>
    </BrandBackground>
  );
};

export default Analytics;