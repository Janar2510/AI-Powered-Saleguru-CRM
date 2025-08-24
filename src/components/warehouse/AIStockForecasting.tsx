import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Zap,
  Brain,
  BarChart3,
  LineChart,
  Calendar,
  Package,
  DollarSign,
  Target,
  Activity,
  Settings,
  RefreshCw,
  Download,
  Eye,
  Plus,
  Filter,
  Search,
  Clock,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  X
} from 'lucide-react';
import {
  BrandCard,
  BrandButton,
  BrandBadge,
  BrandInput,
  BrandPageLayout,
  BrandStatsGrid,
  BrandStatCard
} from '../../contexts/BrandDesignContext';
import {
  useStockForecasts,
  useGenerateStockForecast,
  useStockAlerts,
  useGenerateAIRecommendations,
  type StockForecast,
  type StockAlert
} from '../../hooks/useEnhancedInventory';

interface AIStockForecastingProps {
  orgId: string;
}

interface ForecastConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: ForecastConfig) => void;
}

interface ForecastConfig {
  forecastPeriod: number;
  algorithm: 'linear' | 'exponential' | 'seasonal' | 'ml_advanced';
  seasonalityFactors: boolean;
  promotionImpact: boolean;
  marketTrends: boolean;
  demandVariability: number;
  leadTime: number;
  serviceLevel: number;
  autoReorder: boolean;
  alertThresholds: {
    critical: number;
    high: number;
    medium: number;
  };
}

const ForecastConfigModal: React.FC<ForecastConfigModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [config, setConfig] = useState<ForecastConfig>({
    forecastPeriod: 30,
    algorithm: 'ml_advanced',
    seasonalityFactors: true,
    promotionImpact: true,
    marketTrends: true,
    demandVariability: 0.2,
    leadTime: 7,
    serviceLevel: 95,
    autoReorder: true,
    alertThresholds: {
      critical: 5,
      high: 10,
      medium: 20
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(config);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <BrandCard borderGradient="primary" className="w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white flex items-center">
              <Brain className="w-6 h-6 mr-2" />
              AI Forecasting Configuration
            </h2>
            <button onClick={onClose} className="text-[#b0b0d0] hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Forecast Settings */}
            <BrandCard borderGradient="secondary" className="p-4">
              <h3 className="text-lg font-medium text-white mb-4">Forecast Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Forecast Period (days)
                  </label>
                  <select
                    value={config.forecastPeriod}
                    onChange={(e) => setConfig(prev => ({ ...prev, forecastPeriod: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                  >
                    <option value={7}>7 days</option>
                    <option value={14}>14 days</option>
                    <option value={30}>30 days</option>
                    <option value={60}>60 days</option>
                    <option value={90}>90 days</option>
                    <option value={180}>180 days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    AI Algorithm
                  </label>
                  <select
                    value={config.algorithm}
                    onChange={(e) => setConfig(prev => ({ ...prev, algorithm: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                  >
                    <option value="linear">Linear Regression</option>
                    <option value="exponential">Exponential Smoothing</option>
                    <option value="seasonal">Seasonal ARIMA</option>
                    <option value="ml_advanced">ML Advanced (Neural Network)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Lead Time (days)
                  </label>
                  <BrandInput
                    type="number"
                    value={config.leadTime}
                    onChange={(e) => setConfig(prev => ({ ...prev, leadTime: parseInt(e.target.value) || 0 }))}
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Service Level (%)
                  </label>
                  <BrandInput
                    type="number"
                    value={config.serviceLevel}
                    onChange={(e) => setConfig(prev => ({ ...prev, serviceLevel: parseInt(e.target.value) || 0 }))}
                    min="50"
                    max="99"
                  />
                </div>
              </div>
            </BrandCard>

            {/* AI Factors */}
            <BrandCard borderGradient="accent" className="p-4">
              <h3 className="text-lg font-medium text-white mb-4">AI Factors</h3>
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={config.seasonalityFactors}
                    onChange={(e) => setConfig(prev => ({ ...prev, seasonalityFactors: e.target.checked }))}
                    className="w-4 h-4 text-[#a259ff] bg-[#23233a] border-[#23233a]/30 rounded focus:ring-[#a259ff] focus:ring-2"
                  />
                  <span className="text-white">Include Seasonality Factors</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={config.promotionImpact}
                    onChange={(e) => setConfig(prev => ({ ...prev, promotionImpact: e.target.checked }))}
                    className="w-4 h-4 text-[#a259ff] bg-[#23233a] border-[#23233a]/30 rounded focus:ring-[#a259ff] focus:ring-2"
                  />
                  <span className="text-white">Promotion Impact Analysis</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={config.marketTrends}
                    onChange={(e) => setConfig(prev => ({ ...prev, marketTrends: e.target.checked }))}
                    className="w-4 h-4 text-[#a259ff] bg-[#23233a] border-[#23233a]/30 rounded focus:ring-[#a259ff] focus:ring-2"
                  />
                  <span className="text-white">Market Trend Integration</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={config.autoReorder}
                    onChange={(e) => setConfig(prev => ({ ...prev, autoReorder: e.target.checked }))}
                    className="w-4 h-4 text-[#a259ff] bg-[#23233a] border-[#23233a]/30 rounded focus:ring-[#a259ff] focus:ring-2"
                  />
                  <span className="text-white">Automatic Reorder Suggestions</span>
                </label>
              </div>
            </BrandCard>

            {/* Alert Thresholds */}
            <BrandCard borderGradient="orange" className="p-4">
              <h3 className="text-lg font-medium text-white mb-4">Alert Thresholds (days of stock)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Critical Alert
                  </label>
                  <BrandInput
                    type="number"
                    value={config.alertThresholds.critical}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      alertThresholds: { 
                        ...prev.alertThresholds, 
                        critical: parseInt(e.target.value) || 0 
                      } 
                    }))}
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    High Alert
                  </label>
                  <BrandInput
                    type="number"
                    value={config.alertThresholds.high}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      alertThresholds: { 
                        ...prev.alertThresholds, 
                        high: parseInt(e.target.value) || 0 
                      } 
                    }))}
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Medium Alert
                  </label>
                  <BrandInput
                    type="number"
                    value={config.alertThresholds.medium}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      alertThresholds: { 
                        ...prev.alertThresholds, 
                        medium: parseInt(e.target.value) || 0 
                      } 
                    }))}
                    min="1"
                  />
                </div>
              </div>
            </BrandCard>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
              <BrandButton variant="secondary" onClick={onClose}>
                Cancel
              </BrandButton>
              <BrandButton variant="primary" type="submit">
                <Settings className="w-4 h-4 mr-2" />
                Save Configuration
              </BrandButton>
            </div>
          </form>
        </div>
      </BrandCard>
    </div>
  );
};

const AIStockForecasting: React.FC<AIStockForecastingProps> = ({ orgId }) => {
  const [activeTab, setActiveTab] = useState<'forecasts' | 'alerts' | 'recommendations'>('forecasts');
  const [showConfig, setShowConfig] = useState(false);
  const [selectedForecastPeriod, setSelectedForecastPeriod] = useState(30);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: forecasts = [], isLoading: loadingForecasts, refetch: refetchForecasts } = useStockForecasts(orgId);
  const { data: alerts = [], isLoading: loadingAlerts } = useStockAlerts(orgId, { status: 'active' });
  const generateForecastMutation = useGenerateStockForecast();
  const generateRecommendationsMutation = useGenerateAIRecommendations();

  const handleGenerateForecast = async () => {
    try {
      // This would generate forecasts for all products
      // For demo, we'll generate a few sample forecasts
      const sampleProducts = ['product-1', 'product-2', 'product-3'];
      
      for (const productId of sampleProducts) {
        await generateForecastMutation.mutateAsync({
          productId,
          forecastPeriodDays: selectedForecastPeriod
        });
      }
      
      refetchForecasts();
    } catch (error) {
      console.error('Error generating forecasts:', error);
    }
  };

  const handleSaveConfig = (config: ForecastConfig) => {
    // Save configuration (would normally save to backend)
    localStorage.setItem('ai_forecast_config', JSON.stringify(config));
    setShowConfig(false);
  };

  const getAlertLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getForecastTrend = (forecast: StockForecast) => {
    const trendRatio = forecast.predicted_demand / forecast.current_stock;
    if (trendRatio > 1.2) return { trend: 'up', color: 'text-red-400', icon: TrendingUp };
    if (trendRatio < 0.8) return { trend: 'down', color: 'text-green-400', icon: TrendingDown };
    return { trend: 'stable', color: 'text-[#b0b0d0]', icon: Activity };
  };

  // Mock data for demonstration
  const mockRecommendations = [
    {
      type: 'reorder',
      product: 'Laptop Stand Pro',
      message: 'Reorder 150 units within 3 days to avoid stockout',
      priority: 'high',
      impact: '$15,000 potential lost sales',
      action: 'Create Purchase Order'
    },
    {
      type: 'optimization',
      product: 'Wireless Mouse',
      message: 'Reduce order frequency from weekly to bi-weekly',
      priority: 'medium',
      impact: '12% reduction in holding costs',
      action: 'Update Reorder Policy'
    },
    {
      type: 'forecast',
      product: 'Gaming Keyboard',
      message: 'Seasonal demand spike expected in 2 weeks',
      priority: 'medium',
      impact: '35% increase in demand predicted',
      action: 'Increase Safety Stock'
    }
  ];

  // Calculate stats
  const forecastStats = {
    totalProducts: forecasts.length,
    highConfidence: forecasts.filter(f => (f.confidence_score || 0) >= 0.8).length,
    reorderRecommendations: forecasts.filter(f => (f.recommended_order_qty || 0) > 0).length,
    avgConfidence: forecasts.length > 0 ? 
      forecasts.reduce((sum, f) => sum + (f.confidence_score || 0), 0) / forecasts.length : 0
  };

  const alertStats = {
    total: alerts.length,
    critical: alerts.filter(a => a.alert_level === 'critical').length,
    high: alerts.filter(a => a.alert_level === 'high').length,
    medium: alerts.filter(a => a.alert_level === 'medium').length
  };

  return (
    <BrandPageLayout
      title="AI Stock Forecasting & Analytics"
      subtitle="Advanced AI-powered demand forecasting and inventory optimization"
      actions={
        <div className="flex space-x-3">
          <BrandButton variant="secondary" onClick={() => setShowConfig(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Configure AI
          </BrandButton>
          <BrandButton variant="primary" onClick={handleGenerateForecast}>
            <Zap className="w-4 h-4 mr-2" />
            Generate Forecasts
          </BrandButton>
        </div>
      }
    >
      {/* Tabs */}
      <div className="flex space-x-1 border-b border-white/20 mb-6">
        <button
          onClick={() => setActiveTab('forecasts')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'forecasts'
              ? 'text-[#a259ff] border-b-2 border-[#a259ff]'
              : 'text-[#b0b0d0] hover:text-white'
          }`}
        >
          Demand Forecasts
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'alerts'
              ? 'text-[#a259ff] border-b-2 border-[#a259ff]'
              : 'text-[#b0b0d0] hover:text-white'
          }`}
        >
          Stock Alerts
        </button>
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'recommendations'
              ? 'text-[#a259ff] border-b-2 border-[#a259ff]'
              : 'text-[#b0b0d0] hover:text-white'
          }`}
        >
          AI Recommendations
        </button>
      </div>

      {/* Stats */}
      <BrandStatsGrid className="mb-6">
        {activeTab === 'forecasts' ? (
          <>
            <BrandStatCard
              title="Products Forecasted"
              value={forecastStats.totalProducts}
              icon={<Package className="w-8 h-8" />}
              color="primary"
            />
            <BrandStatCard
              title="High Confidence"
              value={forecastStats.highConfidence}
              icon={<CheckCircle className="w-8 h-8" />}
              color="green"
            />
            <BrandStatCard
              title="Reorder Needed"
              value={forecastStats.reorderRecommendations}
              icon={<AlertTriangle className="w-8 h-8" />}
              color="orange"
            />
            <BrandStatCard
              title="Avg Confidence"
              value={`${(forecastStats.avgConfidence * 100).toFixed(0)}%`}
              icon={<Brain className="w-8 h-8" />}
              color="blue"
            />
          </>
        ) : activeTab === 'alerts' ? (
          <>
            <BrandStatCard
              title="Total Alerts"
              value={alertStats.total}
              icon={<AlertTriangle className="w-8 h-8" />}
              color="primary"
            />
            <BrandStatCard
              title="Critical"
              value={alertStats.critical}
              icon={<AlertTriangle className="w-8 h-8" />}
              color="red"
            />
            <BrandStatCard
              title="High Priority"
              value={alertStats.high}
              icon={<Clock className="w-8 h-8" />}
              color="orange"
            />
            <BrandStatCard
              title="Medium Priority"
              value={alertStats.medium}
              icon={<Activity className="w-8 h-8" />}
              color="blue"
            />
          </>
        ) : (
          <>
            <BrandStatCard
              title="Active Recommendations"
              value={mockRecommendations.length}
              icon={<Brain className="w-8 h-8" />}
              color="primary"
            />
            <BrandStatCard
              title="High Priority"
              value={mockRecommendations.filter(r => r.priority === 'high').length}
              icon={<Target className="w-8 h-8" />}
              color="red"
            />
            <BrandStatCard
              title="Potential Savings"
              value="$45,000"
              icon={<DollarSign className="w-8 h-8" />}
              color="green"
            />
            <BrandStatCard
              title="Automation Score"
              value="92%"
              icon={<Zap className="w-8 h-8" />}
              color="blue"
            />
          </>
        )}
      </BrandStatsGrid>

      {/* Content based on active tab */}
      {activeTab === 'forecasts' && (
        <div className="space-y-6">
          {/* Forecast Controls */}
          <BrandCard borderGradient="primary" className="p-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b0b0d0] z-10" />
                  <BrandInput
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={selectedForecastPeriod}
                  onChange={(e) => setSelectedForecastPeriod(parseInt(e.target.value))}
                  className="bg-[#23233a]/50 border-2 border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                >
                  <option value={7}>7 days</option>
                  <option value={30}>30 days</option>
                  <option value={90}>90 days</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <BrandButton variant="secondary">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </BrandButton>
                <BrandButton variant="secondary" onClick={() => refetchForecasts()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </BrandButton>
              </div>
            </div>
          </BrandCard>

          {/* Forecasts List */}
          <div className="space-y-4">
            {forecasts.length > 0 ? (
              forecasts.map((forecast) => {
                const trendInfo = getForecastTrend(forecast);
                const TrendIcon = trendInfo.icon;
                
                return (
                  <BrandCard key={forecast.id} borderGradient="secondary" className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-[#a259ff]/20 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-[#a259ff]" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-semibold text-white">Product {forecast.product_id}</h3>
                            <BrandBadge 
                              variant={forecast.confidence_score && forecast.confidence_score >= 0.8 ? 'success' : 'warning'} 
                              size="sm"
                            >
                              {((forecast.confidence_score || 0) * 100).toFixed(0)}% confidence
                            </BrandBadge>
                          </div>
                          <p className="text-[#b0b0d0]">
                            Current Stock: {forecast.current_stock} • Predicted Demand: {forecast.predicted_demand}
                          </p>
                          <p className="text-[#b0b0d0] text-sm">
                            Forecast Period: {forecast.forecast_period_days} days • 
                            Generated: {new Date(forecast.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className={`flex items-center justify-center ${trendInfo.color}`}>
                            <TrendIcon className="w-6 h-6" />
                          </div>
                          <span className="text-xs text-[#b0b0d0]">Trend</span>
                        </div>
                        
                        {forecast.recommended_order_qty && forecast.recommended_order_qty > 0 && (
                          <div className="text-center">
                            <div className="text-lg font-bold text-orange-400">
                              {forecast.recommended_order_qty}
                            </div>
                            <span className="text-xs text-[#b0b0d0]">Reorder Qty</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2">
                          <BrandButton variant="secondary">
                            <Eye className="w-4 h-4 mr-2" />
                            Details
                          </BrandButton>
                          {forecast.recommended_order_qty && forecast.recommended_order_qty > 0 && (
                            <BrandButton variant="orange">
                              <Plus className="w-4 h-4 mr-2" />
                              Create PO
                            </BrandButton>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Forecast Factors */}
                    {forecast.factors && (
                      <div className="mt-4 p-3 bg-white/5 rounded-lg">
                        <h4 className="text-sm font-medium text-white mb-2">AI Factors Considered:</h4>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(forecast.factors).map(([key, value]) => (
                            <BrandBadge key={key} variant="secondary" size="sm">
                              {key}: {typeof value === 'number' ? (value * 100).toFixed(1) + '%' : String(value)}
                            </BrandBadge>
                          ))}
                        </div>
                      </div>
                    )}
                  </BrandCard>
                );
              })
            ) : (
              <BrandCard borderGradient="accent" className="text-center py-12">
                <Brain className="w-16 h-16 text-[#b0b0d0] mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No Forecasts Available</h3>
                <p className="text-[#b0b0d0] mb-6">
                  Generate AI-powered demand forecasts to optimize your inventory
                </p>
                <BrandButton variant="primary" onClick={handleGenerateForecast}>
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Forecasts
                </BrandButton>
              </BrandCard>
            )}
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {alerts.length > 0 ? (
            alerts.map((alert) => (
              <BrandCard key={alert.id} borderGradient={getAlertLevelColor(alert.alert_level)} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      alert.alert_level === 'critical' ? 'bg-red-500/20' :
                      alert.alert_level === 'high' ? 'bg-orange-500/20' :
                      'bg-blue-500/20'
                    }`}>
                      <AlertTriangle className={`w-6 h-6 ${
                        alert.alert_level === 'critical' ? 'text-red-400' :
                        alert.alert_level === 'high' ? 'text-orange-400' :
                        'text-blue-400'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-white">
                          {alert.alert_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h3>
                        <BrandBadge variant={getAlertLevelColor(alert.alert_level)} size="sm">
                          {alert.alert_level.toUpperCase()}
                        </BrandBadge>
                      </div>
                      <p className="text-[#b0b0d0]">{alert.message}</p>
                      <p className="text-[#b0b0d0] text-sm">
                        Current: {alert.current_qty} • Threshold: {alert.threshold_qty} • 
                        Created: {new Date(alert.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <BrandButton variant="secondary">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Acknowledge
                    </BrandButton>
                    <BrandButton variant="primary">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Order
                    </BrandButton>
                  </div>
                </div>
              </BrandCard>
            ))
          ) : (
            <BrandCard borderGradient="accent" className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No Active Alerts</h3>
              <p className="text-[#b0b0d0]">
                All stock levels are within acceptable thresholds
              </p>
            </BrandCard>
          )}
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          {mockRecommendations.map((rec, index) => (
            <BrandCard key={index} borderGradient="purple" className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    rec.priority === 'high' ? 'bg-red-500/20' : 'bg-blue-500/20'
                  }`}>
                    <Brain className={`w-6 h-6 ${
                      rec.priority === 'high' ? 'text-red-400' : 'text-blue-400'
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-white">{rec.product}</h3>
                      <BrandBadge 
                        variant={rec.priority === 'high' ? 'error' : 'info'} 
                        size="sm"
                      >
                        {rec.priority.toUpperCase()}
                      </BrandBadge>
                      <BrandBadge variant="secondary" size="sm">
                        {rec.type.toUpperCase()}
                      </BrandBadge>
                    </div>
                    <p className="text-white">{rec.message}</p>
                    <p className="text-[#b0b0d0] text-sm">Impact: {rec.impact}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <BrandButton variant="secondary">
                    <Eye className="w-4 h-4 mr-2" />
                    Details
                  </BrandButton>
                  <BrandButton variant={rec.priority === 'high' ? 'red' : 'primary'}>
                    <Zap className="w-4 h-4 mr-2" />
                    {rec.action}
                  </BrandButton>
                </div>
              </div>
            </BrandCard>
          ))}
        </div>
      )}

      {/* Configuration Modal */}
      <ForecastConfigModal
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        onSave={handleSaveConfig}
      />
    </BrandPageLayout>
  );
};

export default AIStockForecasting;
