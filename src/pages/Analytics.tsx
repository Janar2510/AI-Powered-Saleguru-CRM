import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Users, 
  Clock, 
  Bot, 
  Filter,
  Download,
  Calendar,
  ChevronDown,
  BarChart,
  PieChart,
  LineChart,
  ArrowRight,
  Zap,
  Settings,
  RefreshCw,
  Sliders,
  Check,
  X,
  BarChart3,
  Activity,
  Heart,
  MessageSquare,
  Phone
} from 'lucide-react';
import Spline from '@splinetool/react-spline';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { useGuru } from '../contexts/GuruContext';
import { useToastContext } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import Container from '../components/layout/Container';
import AnalyticsChart from '../components/analytics/AnalyticsChart';
import PerformanceMetricsCard from '../components/analytics/PerformanceMetricsCard';
import InsightsPanel from '../components/analytics/InsightsPanel';
import ProductivityInsightsPanel from '../components/analytics/ProductivityInsightsPanel';
import * as d3 from 'd3';
import Bar3DChart from '../components/analytics/3DBarChart';
import { ProductivityInsight } from '../types/ai';

// Chart types
type ChartType = 'funnel' | 'bar' | 'line' | 'pie' | '3d';

// Time periods
type TimePeriod = 'week' | 'month' | 'quarter' | 'year' | 'all';

// Data sources
type DataSource = 'deals' | 'leads' | 'revenue';

interface AnalyticsData {
  sales: Array<{ name: string; value: number; color?: string }>;
  leads: Array<{ name: string; value: number; color?: string }>;
  conversions: Array<{ name: string; value: number; color?: string }>;
  revenue: Array<{ name: string; value: number; color?: string }>;
  pipeline: Array<{ name: string; value: number; color?: string }>;
  activities: Array<{ name: string; value: number; color?: string }>;
}

const Analytics: React.FC = () => {
  const { openGuru, sendMessage } = useGuru();
  const { showToast } = useToastContext();
  const navigate = useNavigate();
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [showCustomize, setShowCustomize] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
  const [dataSource, setDataSource] = useState<DataSource>('deals');
  const [pipelineChartType, setPipelineChartType] = useState<ChartType>('funnel');
  const [conversionChartType, setConversionChartType] = useState<ChartType>('bar');
  const [velocityChartType, setVelocityChartType] = useState<ChartType>('line');
  const [distributionChartType, setDistributionChartType] = useState<ChartType>('pie');
  const [forecastChartType, setForecastChartType] = useState<ChartType>('line');
  const [sourceChartType, setSourceChartType] = useState<ChartType>('pie');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Filters
  const [filters, setFilters] = useState({
    stage: 'all',
    owner: 'all',
    minValue: 0,
    maxValue: 1000000,
    dateRange: {
      start: null as Date | null,
      end: null as Date | null
    }
  });
  
  // Analytics data with dashboard colors
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    sales: [
      { name: 'Jan', value: 120, color: '#8b5cf6' }, // purple-500
      { name: 'Feb', value: 180, color: '#10b981' }, // emerald-500
      { name: 'Mar', value: 150, color: '#3b82f6' }, // blue-500
      { name: 'Apr', value: 220, color: '#f97316' }, // orange-500
      { name: 'May', value: 280, color: '#8b5cf6' }, // purple-500
      { name: 'Jun', value: 320, color: '#10b981' }  // emerald-500
    ],
    leads: [
      { name: 'Website', value: 45, color: '#8b5cf6' },
      { name: 'Referrals', value: 25, color: '#10b981' },
      { name: 'Social', value: 20, color: '#3b82f6' },
      { name: 'Email', value: 10, color: '#f97316' }
    ],
    conversions: [
      { name: 'Lead to Opportunity', value: 35, color: '#8b5cf6' },
      { name: 'Opportunity to Deal', value: 25, color: '#10b981' },
      { name: 'Deal to Won', value: 40, color: '#3b82f6' }
    ],
    revenue: [
      { name: 'Q1', value: 125000, color: '#8b5cf6' },
      { name: 'Q2', value: 180000, color: '#10b981' },
      { name: 'Q3', value: 220000, color: '#3b82f6' },
      { name: 'Q4', value: 280000, color: '#f97316' }
    ],
    pipeline: [
      { name: 'Lead', value: 150, color: '#8b5cf6' },
      { name: 'Qualified', value: 120, color: '#10b981' },
      { name: 'Proposal', value: 80, color: '#3b82f6' },
      { name: 'Negotiation', value: 45, color: '#f97316' },
      { name: 'Closed Won', value: 35, color: '#8b5cf6' }
    ],
    activities: [
      { name: 'Calls', value: 85, color: '#8b5cf6' },
      { name: 'Emails', value: 120, color: '#10b981' },
      { name: 'Meetings', value: 45, color: '#3b82f6' },
      { name: 'Tasks', value: 65, color: '#f97316' }
    ]
  });

  // Productivity insights state
  const [showProductivityInsights, setShowProductivityInsights] = useState(false);
  const [productivityInsights, setProductivityInsights] = useState<ProductivityInsight[]>([
    {
      id: '1',
      category: 'time_management',
      title: 'Focus Time Optimization',
      description: 'Your most productive hours are between 9-11 AM. Schedule important tasks during this window.',
      metric_value: 85,
      metric_unit: '%',
      metric_change: 12,
      action_url: '/tasks',
      action_label: 'Schedule Tasks',
      priority: 'high',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      category: 'deal_progress',
      title: 'Pipeline Velocity',
      description: 'Deals are moving 15% faster through your pipeline compared to last month.',
      metric_value: 12,
      metric_unit: 'days',
      metric_change: -15,
      action_url: '/deals',
      action_label: 'View Deals',
      priority: 'medium',
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      category: 'contact_engagement',
      title: 'Response Rate Improvement',
      description: 'Your email response rate has increased by 8% this week.',
      metric_value: 92,
      metric_unit: '%',
      metric_change: 8,
      action_url: '/emails',
      action_label: 'Check Emails',
      priority: 'medium',
      created_at: new Date().toISOString()
    },
    {
      id: '4',
      category: 'task_completion',
      title: 'Task Completion Rate',
      description: 'You\'ve completed 78% of scheduled tasks this week, up from 65% last week.',
      metric_value: 78,
      metric_unit: '%',
      metric_change: 13,
      action_url: '/tasks',
      action_label: 'View Tasks',
      priority: 'high',
      created_at: new Date().toISOString()
    }
  ]);

  // Demographics filters
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<string>('all');

  // Mock data for selectors
  const regions = ['all', 'Europe', 'North America', 'Asia', 'Australia'];
  const countries = ['all', 'Estonia', 'USA', 'Germany', 'Finland', 'UK'];
  const products = ['all', 'CRM', 'AI Assistant', 'Analytics', 'Integrations'];

  // Mock data for analytics widgets
  const userClosingRate = 68;
  const companyClosingRate = 74;
  const productClosingRates = [
    { name: 'CRM', value: 80 },
    { name: 'AI Assistant', value: 65 },
    { name: 'Analytics', value: 72 },
    { name: 'Integrations', value: 60 }
  ];

  // Productivity insights handlers
  const handleProductivityInsightAction = (url: string) => {
    navigate(url);
    setShowProductivityInsights(false);
  };

  const handleCloseProductivityInsights = () => {
    setShowProductivityInsights(false);
  };

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setIsLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [timePeriod, dataSource]);

  // Handle time period change
  const handleTimePeriodChange = (period: TimePeriod) => {
    setTimePeriod(period);
    showToast({
      type: 'info',
      title: 'Time Period Changed',
      description: `Showing data for ${period}`
    });
  };

  // Handle data source change
  const handleDataSourceChange = (source: DataSource) => {
    setDataSource(source);
    showToast({
      type: 'info',
      title: 'Data Source Changed',
      description: `Showing ${source} data`
    });
  };

  // Handle chart type change
  const handleChartTypeChange = (chart: string, type: ChartType) => {
    switch (chart) {
      case 'pipeline':
        setPipelineChartType(type);
        break;
      case 'conversion':
        setConversionChartType(type);
        break;
      case 'velocity':
        setVelocityChartType(type);
        break;
      case 'distribution':
        setDistributionChartType(type);
        break;
      case 'forecast':
        setForecastChartType(type);
        break;
      case 'source':
        setSourceChartType(type);
        break;
    }
    
    showToast({
      type: 'info',
      title: 'Chart Type Changed',
      description: `Changed to ${type} chart`
    });
  };

  // Handle export data
  const handleExportData = (format: 'csv' | 'pdf' | 'excel') => {
    showToast({
      type: 'success',
      title: 'Export Started',
      description: `Exporting analytics data as ${format.toUpperCase()}`
    });
  };

  // Handle refresh data
  const handleRefreshData = () => {
    showToast({
      type: 'info',
      title: 'Refreshing Data',
      description: 'Updating analytics with latest information'
    });
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showToast({
        type: 'success',
        title: 'Data Refreshed',
        description: 'Analytics data has been updated'
      });
    }, 1500);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      stage: 'all',
      owner: 'all',
      minValue: 0,
      maxValue: 1000000,
      dateRange: {
        start: null,
        end: null
      }
    });
    setShowAdvancedFilters(false);
  };

  // Ask Guru for insights
  const handleAskGuruInsights = () => {
    openGuru();
    setTimeout(() => {
      sendMessage("Analyze my sales pipeline performance and provide insights");
    }, 300);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'sales', label: 'Sales', icon: TrendingUp },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'pipeline', label: 'Pipeline', icon: Target },
    { id: 'productivity', label: 'Productivity', icon: Clock },
    { id: 'pulse', label: 'Pulse', icon: Heart },
    { id: 'demographics', label: 'Demographics', icon: PieChart },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#b0b0d0] text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-white">$805,000</p>
              <p className="text-[#8a8a8a] text-xs">+12.5% vs last month</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#b0b0d0] text-sm font-medium">New Leads</p>
              <p className="text-2xl font-bold text-white">1,247</p>
              <p className="text-[#8a8a8a] text-xs">+8.2% vs last month</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#b0b0d0] text-sm font-medium">Conversion Rate</p>
              <p className="text-2xl font-bold text-white">24.8%</p>
              <p className="text-[#8a8a8a] text-xs">+2.1% vs last month</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-700 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#b0b0d0] text-sm font-medium">Active Deals</p>
              <p className="text-2xl font-bold text-white">89</p>
              <p className="text-[#8a8a8a] text-xs">+15.3% vs last month</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Sales Performance</h3>
          <Bar3DChart
            data={analyticsData.sales.map(d => ({ id: d.name, ...d }))}
            title=""
            height={350}
          />
        </div>
        <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue Trend</h3>
          <AnalyticsChart
            data={analyticsData.revenue.map(d => ({ id: d.name, ...d }))}
            type="line"
            title=""
            height={350}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Lead Sources</h3>
          <AnalyticsChart
            data={analyticsData.leads.map(d => ({ id: d.name, ...d }))}
            type="pie"
            title=""
            height={350}
          />
        </div>
        <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Activity Breakdown</h3>
          <AnalyticsChart
            data={analyticsData.activities.map(d => ({ id: d.name, ...d }))}
            type="bar"
            title=""
            height={350}
          />
        </div>
      </div>
    </div>
  );

  const renderSales = () => (
    <div className="space-y-6">
      <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Sales Performance (3D Visualization)</h3>
        <Bar3DChart
          data={analyticsData.sales.map(d => ({ id: d.name, ...d }))}
          title=""
          height={400}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Conversion Funnel</h3>
          <AnalyticsChart
            data={analyticsData.conversions.map(d => ({ id: d.name, ...d }))}
            type="pie"
            title=""
            height={350}
          />
        </div>
        <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue Growth</h3>
          <AnalyticsChart
            data={analyticsData.revenue.map(d => ({ id: d.name, ...d }))}
            type="line"
            title=""
            height={350}
          />
        </div>
      </div>
    </div>
  );

  const renderLeads = () => (
    <div className="space-y-6">
      <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Lead Source Distribution</h3>
        <AnalyticsChart
          data={analyticsData.leads.map(d => ({ id: d.name, ...d }))}
          type="pie"
          title=""
          height={400}
        />
      </div>
      <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Lead Activities (3D)</h3>
        <Bar3DChart
          data={analyticsData.activities.map(d => ({ id: d.name, ...d }))}
          title=""
          height={350}
        />
      </div>
    </div>
  );

  const renderRevenue = () => (
    <div className="space-y-6">
      <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Revenue Trend Analysis</h3>
        <AnalyticsChart
          data={analyticsData.revenue.map(d => ({ id: d.name, ...d }))}
          type="line"
          title=""
          height={400}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Monthly Sales (3D)</h3>
          <Bar3DChart
            data={analyticsData.sales.map(d => ({ id: d.name, ...d }))}
            title=""
            height={350}
          />
        </div>
        <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue by Conversion Stage</h3>
          <AnalyticsChart
            data={analyticsData.conversions.map(d => ({ id: d.name, ...d }))}
            type="bar"
            title=""
            height={350}
          />
        </div>
      </div>
    </div>
  );

  const renderPipeline = () => (
    <div className="space-y-6">
      <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Pipeline Stages (3D)</h3>
        <Bar3DChart
          data={analyticsData.pipeline.map(d => ({ id: d.name, ...d }))}
          title=""
          height={400}
        />
      </div>
      <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Pipeline Conversion Rates</h3>
        <AnalyticsChart
          data={analyticsData.conversions.map(d => ({ id: d.name, ...d }))}
          type="pie"
          title=""
          height={350}
        />
      </div>
    </div>
  );

  const renderProductivity = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Productivity Insights</h2>
          <p className="text-[#b0b0d0]">AI-powered recommendations to boost your performance</p>
        </div>
        <Button
          onClick={() => setShowProductivityInsights(true)}
          variant="gradient"
          size="sm"
          icon={Zap}
        >
          View All Insights
        </Button>
      </div>

      <ProductivityInsightsPanel
        insights={productivityInsights}
        onClose={handleCloseProductivityInsights}
        onAction={handleProductivityInsightAction}
      />

      {/* Additional productivity metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#b0b0d0] text-sm font-medium">Focus Time</p>
              <p className="text-2xl font-bold text-white">6.2h</p>
              <p className="text-[#8a8a8a] text-xs">Today's deep work</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-700 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#b0b0d0] text-sm font-medium">Task Completion</p>
              <p className="text-2xl font-bold text-white">78%</p>
              <p className="text-[#8a8a8a] text-xs">+13% vs last week</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#b0b0d0] text-sm font-medium">Response Time</p>
              <p className="text-2xl font-bold text-white">2.1h</p>
              <p className="text-[#8a8a8a] text-xs">Avg. email response</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPulse = () => (
    <div className="space-y-6">
      <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-[#a259ff] to-[#377dff] rounded-lg flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Live Sentiment Replay™</h3>
            <p className="text-[#b0b0d0]">Emotional timeline analysis across all deal interactions</p>
          </div>
        </div>
        
        {/* Pulse Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#23233a]/60 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-[#b0b0d0] text-sm">Avg Sentiment</span>
              <span className="text-white font-bold">78%</span>
            </div>
          </div>
          <div className="bg-[#23233a]/60 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-[#b0b0d0] text-sm">Interactions</span>
              <span className="text-white font-bold">1,247</span>
            </div>
          </div>
          <div className="bg-[#23233a]/60 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-[#b0b0d0] text-sm">Trend</span>
              <span className="text-green-400 font-bold">↗ Improving</span>
            </div>
          </div>
          <div className="bg-[#23233a]/60 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-[#b0b0d0] text-sm">Dominant</span>
              <span className="text-white font-bold capitalize">Excited</span>
            </div>
          </div>
        </div>

        {/* Sentiment Timeline Chart */}
        <div className="h-64 bg-[#23233a]/60 rounded-lg p-4">
          <h4 className="text-white font-medium mb-4">Sentiment Timeline</h4>
          <div className="w-full h-48 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Heart className="w-12 h-12 text-[#a259ff] mx-auto mb-2" />
              <p className="text-[#b0b0d0]">Sentiment timeline visualization</p>
              <p className="text-[#8a8a8a] text-sm">Powered by AI analysis</p>
            </div>
          </div>
        </div>

        {/* Recent Interactions */}
        <div className="mt-6">
          <h4 className="text-white font-medium mb-4">Recent Interactions</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-[#23233a]/60 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Email: "Very excited about your product!"</p>
                <p className="text-[#b0b0d0] text-sm">Sentiment: Positive (95%)</p>
              </div>
              <div className="text-green-400 font-bold">95%</div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-[#23233a]/60 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                <Phone className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Call: "Need to think about pricing"</p>
                <p className="text-[#b0b0d0] text-sm">Sentiment: Neutral (45%)</p>
              </div>
              <div className="text-yellow-400 font-bold">45%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Demographics tab render function
  const renderDemographics = () => (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <div>
          <label className="block text-xs text-[#b0b0d0] mb-1">Region</label>
          <select
            className="bg-[#23233a]/60 text-white rounded-lg px-3 py-2 border border-[#23233a]/50"
            value={selectedRegion}
            onChange={e => setSelectedRegion(e.target.value)}
          >
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-[#b0b0d0] mb-1">Country</label>
          <select
            className="bg-[#23233a]/60 text-white rounded-lg px-3 py-2 border border-[#23233a]/50"
            value={selectedCountry}
            onChange={e => setSelectedCountry(e.target.value)}
          >
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-[#b0b0d0] mb-1">Product</label>
          <select
            className="bg-[#23233a]/60 text-white rounded-lg px-3 py-2 border border-[#23233a]/50"
            value={selectedProduct}
            onChange={e => setSelectedProduct(e.target.value)}
          >
            {products.map(product => (
              <option key={product} value={product}>{product}</option>
            ))}
          </select>
        </div>
      </div>
      {/* Analytics Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
          <p className="text-[#b0b0d0] text-sm font-medium">User Closing Rate</p>
          <p className="text-2xl font-bold text-white">{userClosingRate}%</p>
        </div>
        <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
          <p className="text-[#b0b0d0] text-sm font-medium">Company Closing Rate</p>
          <p className="text-2xl font-bold text-white">{companyClosingRate}%</p>
        </div>
        <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6 col-span-2">
          <p className="text-[#b0b0d0] text-sm font-medium mb-2">Product Closing Rates</p>
          <AnalyticsChart
            data={productClosingRates.map(p => ({ id: p.name, name: p.name, value: p.value }))}
            type="bar"
            title=""
            height={120}
            showControls={false}
            disableCardStyling={true}
          />
        </div>
      </div>
      {/* Map Placeholder */}
      <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
        <p className="text-[#b0b0d0] text-sm font-medium mb-2">Deal Demographics Map</p>
        <div className="w-full h-80 bg-[#23233a]/60 rounded-lg flex items-center justify-center text-[#b0b0d0]">
          [Map visualization coming soon: pins for closed deals by address]
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="relative z-10 min-h-screen">
        <div className="fixed inset-0 z-0">
          <Spline scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode" />
        </div>
        <div className="fixed inset-0 bg-gradient-to-b from-[#18182c]/50 to-[#18182c]/70 z-0"></div>
        <div className="relative z-10">
          <Container>
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="w-8 h-8 border-2 border-[#a259ff] border-t-transparent rounded-full animate-spin"></div>
            </div>
          </Container>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 min-h-screen">
      {/* 3D Spline Background */}
      <div className="fixed inset-0 z-0">
        <Spline scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode" />
      </div>
      {/* Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#18182c]/50 to-[#18182c]/70 z-0"></div>
      <div className="relative z-10">
        <Container>
          <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
                <p className="text-[#b0b0d0]">Comprehensive insights into your sales performance</p>
              </div>
              <Button
                onClick={() => navigate('/dashboard')}
                variant="secondary"
                size="sm"
                icon={ArrowRight}
              >
                Back to Dashboard
              </Button>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-[#23233a]/50 rounded-lg p-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-[#a259ff] to-[#377dff] text-white shadow-lg'
                        : 'text-[#b0b0d0] hover:text-white hover:bg-[#23233a]/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="animate-fade-in">
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'sales' && renderSales()}
              {activeTab === 'leads' && renderLeads()}
              {activeTab === 'revenue' && renderRevenue()}
              {activeTab === 'pipeline' && renderPipeline()}
              {activeTab === 'productivity' && renderProductivity()}
              {activeTab === 'pulse' && renderPulse()}
              {activeTab === 'demographics' && renderDemographics()}
            </div>

            {/* Productivity Insights Modal */}
            {showProductivityInsights && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                  <ProductivityInsightsPanel
                    insights={productivityInsights}
                    onClose={handleCloseProductivityInsights}
                    onAction={handleProductivityInsightAction}
                  />
                </div>
              </div>
            )}
          </div>
        </Container>
      </div>
    </div>
  );
};

export default Analytics;