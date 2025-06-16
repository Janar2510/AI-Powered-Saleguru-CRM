import React, { useState, useEffect, useRef } from 'react';
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
  X
} from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { useGuru } from '../contexts/GuruContext';
import { useToastContext } from '../contexts/ToastContext';
import { createClient } from '@supabase/supabase-js';
import Container from '../components/layout/Container';
import AnalyticsChart from '../components/analytics/AnalyticsChart';
import PerformanceMetricsCard from '../components/analytics/PerformanceMetricsCard';
import InsightsPanel from '../components/analytics/InsightsPanel';
import * as d3 from 'd3';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

// Chart types
type ChartType = 'funnel' | 'bar' | 'line' | 'pie' | '3d';

// Time periods
type TimePeriod = 'week' | 'month' | 'quarter' | 'year' | 'all';

// Data sources
type DataSource = 'deals' | 'leads' | 'revenue';

const Analytics: React.FC = () => {
  const { openGuru, sendMessage } = useGuru();
  const { showToast } = useToastContext();
  
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
  
  // Analytics data
  const [analyticsData, setAnalyticsData] = useState({
    metrics: [
      { title: 'Total Deals', value: 0, change: '+0%', trend: 'up' as const, icon: Target, color: 'text-blue-500' },
      { title: 'Total Value', value: '$0', change: '+0%', trend: 'up' as const, icon: DollarSign, color: 'text-green-500' },
      { title: 'Avg Deal Size', value: '$0', change: '+0%', trend: 'up' as const, icon: TrendingUp, color: 'text-purple-500' },
      { title: 'Conversion Rate', value: '0.0%', change: '+0%', trend: 'up' as const, icon: Users, color: 'text-yellow-500' },
      { title: 'Avg Deal Cycle', value: '0 days', change: '+0%', trend: 'up' as const, icon: Clock, color: 'text-orange-500' }
    ],
    pipeline: {
      stages: [] as {id: string, name: string, count: number, value: number, color: string}[],
      conversion: [] as {id: string, name: string, value: number, color: string}[]
    },
    velocity: {
      data: [] as {id: string, name: string, value: number, color: string}[]
    },
    distribution: {
      data: [] as {id: string, name: string, value: number, color: string}[]
    },
    forecast: {
      data: [] as {id: string, name: string, value: number, color: string}[]
    },
    source: {
      data: [] as {id: string, name: string, value: number, color: string}[]
    },
    insights: [
      {
        title: 'Conversion bottleneck detected',
        description: 'Your conversion rate from Proposal to Negotiation (50%) is below industry average (65%). Consider reviewing your proposal templates.',
        type: 'deal' as const,
        priority: 'high' as const,
        action: {
          label: 'Analyze bottleneck',
          query: 'Analyze why deals are getting stuck in the proposal stage'
        }
      },
      {
        title: 'Deal cycle improvement',
        description: 'Deal cycle time has improved by 8% compared to last month, showing your process optimizations are working.',
        type: 'performance' as const,
        priority: 'medium' as const,
        action: {
          label: 'View cycle analysis',
          query: 'Show me detailed deal cycle analysis'
        }
      },
      {
        title: 'Industry performance insight',
        description: 'The Technology sector has your highest win rate at 72%, while Financial Services is lowest at 45%.',
        type: 'lead' as const,
        priority: 'medium' as const,
        action: {
          label: 'Industry breakdown',
          query: 'Show me performance by industry'
        }
      }
    ]
  });

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      try {
        // Fetch deals
        const { data: deals, error: dealsError } = await supabase
          .from('deals')
          .select('*');
        
        if (dealsError) throw dealsError;
        
        // Fetch stages
        const { data: stages, error: stagesError } = await supabase
          .from('stages')
          .select('*')
          .order('sort_order');
        
        if (stagesError) throw stagesError;
        
        // Process data
        const dealsData = deals || [];
        const stagesData = stages || [];
        
        // Calculate deals by stage
        const dealsByStage = stagesData.map((stage, index) => {
          const stageDeals = dealsData.filter(deal => deal.stage_id === stage.id);
          
          // Determine color based on stage
          let color;
          if (stage.id === 'lead') color = '#6b7280'; // gray-500
          else if (stage.id === 'qualified') color = '#3b82f6'; // blue-500
          else if (stage.id === 'proposal') color = '#eab308'; // yellow-500
          else if (stage.id === 'negotiation') color = '#f97316'; // orange-500
          else if (stage.id === 'closed-won') color = '#22c55e'; // green-500
          else if (stage.id === 'closed-lost') color = '#ef4444'; // red-500
          else color = `hsl(${index * 360 / stagesData.length}, 70%, 60%)`;
          
          return {
            id: stage.id,
            name: stage.name,
            count: stageDeals.length,
            value: stageDeals.reduce((sum, deal) => sum + (deal.value || 0), 0),
            color
          };
        });
        
        // Calculate stage conversion rates
        const stageConversions = [];
        for (let i = 0; i < stagesData.length - 1; i++) {
          const fromStage = stagesData[i];
          const toStage = stagesData[i + 1];
          
          const fromCount = dealsData.filter(deal => deal.stage_id === fromStage.id).length;
          const toCount = dealsData.filter(deal => deal.stage_id === toStage.id).length;
          
          const conversionRate = fromCount > 0 ? (toCount / fromCount) * 100 : 0;
          
          stageConversions.push({
            id: `${fromStage.id}-to-${toStage.id}`,
            name: `${fromStage.name} → ${toStage.name}`,
            value: Math.round(conversionRate),
            color: '#7c3aed' // primary-600
          });
        }
        
        // Generate velocity data (mock data for demonstration)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const velocityData = months.map((month, index) => ({
          id: `month-${index}`,
          name: month,
          value: Math.floor(Math.random() * 15) + 5, // 5-20 days
          color: '#7c3aed' // primary-600
        }));
        
        // Generate distribution data (mock data for demonstration)
        const industries = ['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing'];
        const distributionData = industries.map((industry, index) => ({
          id: `industry-${index}`,
          name: industry,
          value: Math.floor(Math.random() * 200000) + 50000, // $50K-$250K
          color: `hsl(${index * 360 / industries.length}, 70%, 60%)`
        }));
        
        // Generate forecast data (mock data for demonstration)
        const forecastData = months.map((month, index) => ({
          id: `forecast-${index}`,
          name: month,
          value: Math.floor(Math.random() * 300000) + 100000, // $100K-$400K
          color: '#10b981' // accent-500
        }));
        
        // Generate source data (mock data for demonstration)
        const sources = ['Website', 'Referral', 'Cold Call', 'LinkedIn', 'Event'];
        const sourceData = sources.map((source, index) => ({
          id: `source-${index}`,
          name: source,
          value: Math.floor(Math.random() * 20) + 5, // 5-25 deals
          color: `hsl(${index * 360 / sources.length}, 70%, 60%)`
        }));
        
        // Calculate metrics
        const totalDeals = dealsData.length;
        const totalValue = dealsData.reduce((sum, deal) => sum + (deal.value || 0), 0);
        const avgDealSize = totalDeals > 0 ? Math.round(totalValue / totalDeals) : 0;
        
        const closedDeals = dealsData.filter(deal => deal.stage_id === 'closed-won').length;
        const conversionRate = totalDeals > 0 ? Math.round((closedDeals / totalDeals) * 100) : 0;
        
        // Update analytics data
        setAnalyticsData({
          metrics: [
            { 
              title: 'Total Deals', 
              value: totalDeals, 
              change: '+10% vs previous month', 
              trend: 'up', 
              icon: Target, 
              color: 'text-blue-500' 
            },
            { 
              title: 'Total Value', 
              value: `$${(totalValue / 1000).toFixed(0)}K`, 
              change: '+15% vs previous month', 
              trend: 'up', 
              icon: DollarSign, 
              color: 'text-green-500' 
            },
            { 
              title: 'Avg Deal Size', 
              value: `$${(avgDealSize / 1000).toFixed(0)}K`, 
              change: '+5% vs previous month', 
              trend: 'up', 
              icon: TrendingUp, 
              color: 'text-purple-500' 
            },
            { 
              title: 'Conversion Rate', 
              value: `${conversionRate}%`, 
              change: '-2% vs previous month', 
              trend: 'down', 
              icon: Users, 
              color: 'text-yellow-500' 
            },
            { 
              title: 'Avg Deal Cycle', 
              value: '28 days', 
              change: '-8% vs previous month', 
              trend: 'down', 
              icon: Clock, 
              color: 'text-orange-500' 
            }
          ],
          pipeline: {
            stages: dealsByStage,
            conversion: stageConversions
          },
          velocity: {
            data: velocityData
          },
          distribution: {
            data: distributionData
          },
          forecast: {
            data: forecastData
          },
          source: {
            data: sourceData
          },
          insights: analyticsData.insights // Keep existing insights
        });
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
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
      message: `Showing data for ${period}`
    });
  };

  // Handle data source change
  const handleDataSourceChange = (source: DataSource) => {
    setDataSource(source);
    showToast({
      type: 'info',
      title: 'Data Source Changed',
      message: `Showing ${source} data`
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
      message: `Changed to ${type} chart`
    });
  };

  // Handle export data
  const handleExportData = (format: 'csv' | 'pdf' | 'excel') => {
    showToast({
      type: 'success',
      title: 'Export Started',
      message: `Exporting analytics data as ${format.toUpperCase()}`
    });
  };

  // Handle refresh data
  const handleRefreshData = () => {
    showToast({
      type: 'info',
      title: 'Refreshing Data',
      message: 'Updating analytics with latest information'
    });
    
    // Re-fetch data
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showToast({
        type: 'success',
        title: 'Data Refreshed',
        message: 'Analytics data has been updated'
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

  // Team members for filter
  const teamMembers = [
    { id: 'all', name: 'All Team Members' },
    { id: 'current-user', name: 'Janar Kuusk (You)' },
    { id: 'sarah-wilson', name: 'Sarah Wilson' },
    { id: 'mike-chen', name: 'Mike Chen' },
    { id: 'lisa-park', name: 'Lisa Park' }
  ];

  if (isLoading) {
    return (
      <Container>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-secondary-400">Loading analytics data...</p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Analytics</h1>
            <p className="text-secondary-400 mt-1">Track your sales performance with interactive visualizations</p>
          </div>
          <div className="flex space-x-2">
            <div className="relative">
              <button 
                onClick={() => setShowCustomize(!showCustomize)}
                className={`btn-secondary flex items-center space-x-2 ${showCustomize ? 'bg-primary-600 text-white' : ''}`}
              >
                <Settings className="w-4 h-4" />
                <span>Customize</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showCustomize ? 'rotate-180' : ''}`} />
              </button>
              
              {showCustomize && (
                <div className="absolute right-0 mt-2 w-72 bg-secondary-800 border border-secondary-700 rounded-lg shadow-xl z-10">
                  <div className="p-3 border-b border-secondary-700">
                    <h4 className="font-medium text-white text-sm">Customize Analytics</h4>
                  </div>
                  <div className="p-3 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-secondary-300 mb-1">
                        Time Period
                      </label>
                      <select
                        value={timePeriod}
                        onChange={(e) => handleTimePeriodChange(e.target.value as TimePeriod)}
                        className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
                      >
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="quarter">This Quarter</option>
                        <option value="year">This Year</option>
                        <option value="all">All Time</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-300 mb-1">
                        Data Source
                      </label>
                      <select
                        value={dataSource}
                        onChange={(e) => handleDataSourceChange(e.target.value as DataSource)}
                        className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
                      >
                        <option value="deals">Deals</option>
                        <option value="leads">Leads</option>
                        <option value="revenue">Revenue</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-300 mb-1">
                        Pipeline Chart Type
                      </label>
                      <select
                        value={pipelineChartType}
                        onChange={(e) => handleChartTypeChange('pipeline', e.target.value as ChartType)}
                        className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
                      >
                        <option value="funnel">Funnel</option>
                        <option value="bar">Bar Chart</option>
                        <option value="pie">Pie Chart</option>
                        <option value="3d">3D Chart</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-300 mb-1">
                        Conversion Chart Type
                      </label>
                      <select
                        value={conversionChartType}
                        onChange={(e) => handleChartTypeChange('conversion', e.target.value as ChartType)}
                        className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
                      >
                        <option value="bar">Bar Chart</option>
                        <option value="line">Line Chart</option>
                        <option value="pie">Pie Chart</option>
                        <option value="3d">3D Chart</option>
                      </select>
                    </div>
                    
                    <button 
                      onClick={() => setShowCustomize(false)}
                      className="w-full btn-primary text-sm"
                    >
                      Apply Changes
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`btn-secondary flex items-center space-x-2 ${showAdvancedFilters ? 'bg-primary-600 text-white' : ''}`}
              >
                <Sliders className="w-4 h-4" />
                <span>Filters</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => handleExportData('csv')}
                className="btn-secondary flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
            
            <button 
              onClick={handleRefreshData}
              className="btn-secondary flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            
            <button 
              onClick={handleAskGuruInsights}
              className="btn-primary flex items-center space-x-2"
            >
              <Bot className="w-4 h-4" />
              <span>Ask Guru</span>
            </button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <Card className="bg-secondary-800/80 backdrop-blur-md border border-secondary-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">Advanced Filters</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Stage Filter */}
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-2">
                  Deal Stage
                </label>
                <select
                  value={filters.stage}
                  onChange={(e) => setFilters(prev => ({ ...prev, stage: e.target.value }))}
                  className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                >
                  <option value="all">All Stages</option>
                  {analyticsData.pipeline.stages.map(stage => (
                    <option key={stage.id} value={stage.id}>{stage.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Owner Filter */}
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-2">
                  Deal Owner
                </label>
                <select
                  value={filters.owner}
                  onChange={(e) => setFilters(prev => ({ ...prev, owner: e.target.value }))}
                  className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                >
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-2">
                  Date Range
                </label>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                    <input
                      type="date"
                      value={filters.dateRange.start?.toISOString().split('T')[0] || ''}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        dateRange: {
                          ...prev.dateRange,
                          start: e.target.value ? new Date(e.target.value) : null
                        }
                      }))}
                      className="w-full pl-8 pr-2 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                    />
                  </div>
                  <span className="text-secondary-400">to</span>
                  <div className="relative flex-1">
                    <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                    <input
                      type="date"
                      value={filters.dateRange.end?.toISOString().split('T')[0] || ''}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        dateRange: {
                          ...prev.dateRange,
                          end: e.target.value ? new Date(e.target.value) : null
                        }
                      }))}
                      className="w-full pl-8 pr-2 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                    />
                  </div>
                </div>
              </div>
              
              {/* Value Range Filter */}
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-2">
                  Deal Value Range
                </label>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                    <input
                      type="number"
                      min="0"
                      value={filters.minValue}
                      onChange={(e) => setFilters(prev => ({ ...prev, minValue: parseInt(e.target.value) || 0 }))}
                      className="w-full pl-8 pr-2 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                    />
                  </div>
                  <span className="text-secondary-400">to</span>
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                    <input
                      type="number"
                      min="0"
                      value={filters.maxValue}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxValue: parseInt(e.target.value) || 0 }))}
                      className="w-full pl-8 pr-2 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-4 pt-4 border-t border-secondary-700">
              <div className="flex space-x-2">
                <button 
                  onClick={resetFilters}
                  className="btn-secondary"
                >
                  Reset Filters
                </button>
                <button 
                  onClick={() => setShowAdvancedFilters(false)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply Filters</span>
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* Time Period Selector */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {[
            { value: 'week', label: 'This Week' },
            { value: 'month', label: 'This Month' },
            { value: 'quarter', label: 'This Quarter' },
            { value: 'year', label: 'This Year' },
            { value: 'all', label: 'All Time' }
          ].map((period) => (
            <button
              key={period.value}
              onClick={() => handleTimePeriodChange(period.value as TimePeriod)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                timePeriod === period.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-secondary-800 text-secondary-300 hover:bg-secondary-700'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>

        {/* Key Metrics */}
        <PerformanceMetricsCard metrics={analyticsData.metrics} />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pipeline Analysis */}
          <Card className="bg-secondary-800/80 backdrop-blur-md border border-secondary-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Pipeline Analysis</h3>
              <div className="flex items-center space-x-2">
                <select
                  value={pipelineChartType}
                  onChange={(e) => handleChartTypeChange('pipeline', e.target.value as ChartType)}
                  className="px-2 py-1 bg-secondary-700 border border-secondary-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
                >
                  <option value="funnel">Funnel</option>
                  <option value="bar">Bar Chart</option>
                  <option value="pie">Pie Chart</option>
                  <option value="3d">3D Chart</option>
                </select>
              </div>
            </div>
            <AnalyticsChart
              type={pipelineChartType}
              data={analyticsData.pipeline.stages}
              height={300}
            />
          </Card>

          {/* Conversion Rates */}
          <Card className="bg-secondary-800/80 backdrop-blur-md border border-secondary-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Conversion Rates</h3>
              <div className="flex items-center space-x-2">
                <select
                  value={conversionChartType}
                  onChange={(e) => handleChartTypeChange('conversion', e.target.value as ChartType)}
                  className="px-2 py-1 bg-secondary-700 border border-secondary-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
                >
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="pie">Pie Chart</option>
                  <option value="3d">3D Chart</option>
                </select>
              </div>
            </div>
            <AnalyticsChart
              type={conversionChartType}
              data={analyticsData.pipeline.conversion}
              height={300}
            />
          </Card>

          {/* Deal Velocity */}
          <Card className="bg-secondary-800/80 backdrop-blur-md border border-secondary-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Deal Velocity</h3>
              <div className="flex items-center space-x-2">
                <select
                  value={velocityChartType}
                  onChange={(e) => handleChartTypeChange('velocity', e.target.value as ChartType)}
                  className="px-2 py-1 bg-secondary-700 border border-secondary-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
                >
                  <option value="line">Line Chart</option>
                  <option value="bar">Bar Chart</option>
                  <option value="pie">Pie Chart</option>
                  <option value="3d">3D Chart</option>
                </select>
              </div>
            </div>
            <AnalyticsChart
              type={velocityChartType}
              data={analyticsData.velocity.data}
              height={300}
            />
          </Card>

          {/* Revenue Distribution */}
          <Card className="bg-secondary-800/80 backdrop-blur-md border border-secondary-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Revenue Distribution</h3>
              <div className="flex items-center space-x-2">
                <select
                  value={distributionChartType}
                  onChange={(e) => handleChartTypeChange('distribution', e.target.value as ChartType)}
                  className="px-2 py-1 bg-secondary-700 border border-secondary-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
                >
                  <option value="pie">Pie Chart</option>
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="3d">3D Chart</option>
                </select>
              </div>
            </div>
            <AnalyticsChart
              type={distributionChartType}
              data={analyticsData.distribution.data}
              height={300}
            />
          </Card>
        </div>

        {/* Full Width Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Forecast */}
          <Card className="bg-secondary-800/80 backdrop-blur-md border border-secondary-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Revenue Forecast</h3>
              <div className="flex items-center space-x-2">
                <select
                  value={forecastChartType}
                  onChange={(e) => handleChartTypeChange('forecast', e.target.value as ChartType)}
                  className="px-2 py-1 bg-secondary-700 border border-secondary-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
                >
                  <option value="line">Line Chart</option>
                  <option value="bar">Bar Chart</option>
                  <option value="pie">Pie Chart</option>
                  <option value="3d">3D Chart</option>
                </select>
              </div>
            </div>
            <AnalyticsChart
              type={forecastChartType}
              data={analyticsData.forecast.data}
              height={300}
            />
          </Card>

          {/* Lead Sources */}
          <Card className="bg-secondary-800/80 backdrop-blur-md border border-secondary-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Lead Sources</h3>
              <div className="flex items-center space-x-2">
                <select
                  value={sourceChartType}
                  onChange={(e) => handleChartTypeChange('source', e.target.value as ChartType)}
                  className="px-2 py-1 bg-secondary-700 border border-secondary-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
                >
                  <option value="pie">Pie Chart</option>
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="3d">3D Chart</option>
                </select>
              </div>
            </div>
            <AnalyticsChart
              type={sourceChartType}
              data={analyticsData.source.data}
              height={300}
            />
          </Card>
        </div>

        {/* AI Insights Panel */}
        <InsightsPanel
          insights={analyticsData.insights}
          onAskGuru={handleAskGuruInsights}
        />
      </div>
    </Container>
  );
};

export default Analytics;