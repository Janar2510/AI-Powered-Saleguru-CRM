import React, { useState, useEffect } from 'react';
import { X, BarChart3, TrendingUp, DollarSign, Target, Calendar, Download, Filter } from 'lucide-react';
import { Deal, PipelineStage } from '../../types/deals';
import { Card } from '../common/Card';
import { format } from 'date-fns';

interface DealAnalyticsPanelProps {
  deals: Deal[];
  stages: PipelineStage[];
  onClose: () => void;
  onExport: () => void;
}

export const DealAnalyticsPanel: React.FC<DealAnalyticsPanelProps> = ({
  deals,
  stages,
  onClose,
  onExport
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedStage, setSelectedStage] = useState<string>('all');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getFilteredDeals = () => {
    let filtered = deals;
    
    // Filter by time range
    const now = new Date();
    const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    filtered = filtered.filter(deal => new Date(deal.created_at) >= cutoffDate);
    
    // Filter by stage
    if (selectedStage !== 'all') {
      filtered = filtered.filter(deal => deal.stage_id === selectedStage);
    }
    
    return filtered;
  };

  const filteredDeals = getFilteredDeals();
  
  const totalValue = filteredDeals.reduce((sum, deal) => sum + deal.value, 0);
  const avgDealSize = filteredDeals.length > 0 ? totalValue / filteredDeals.length : 0;
  const wonDeals = filteredDeals.filter(deal => deal.status === 'won');
  const wonValue = wonDeals.reduce((sum, deal) => sum + deal.value, 0);
  const conversionRate = filteredDeals.length > 0 ? (wonDeals.length / filteredDeals.length) * 100 : 0;

  const dealsByStage = stages.map(stage => {
    const stageDeals = filteredDeals.filter(deal => deal.stage_id === stage.id);
    return {
      stage,
      count: stageDeals.length,
      value: stageDeals.reduce((sum, deal) => sum + deal.value, 0)
    };
  });

  const dealsByStatus = [
    { status: 'open', count: filteredDeals.filter(d => d.status === 'open').length },
    { status: 'won', count: wonDeals.length },
    { status: 'lost', count: filteredDeals.filter(d => d.status === 'lost').length }
  ];

  return (
    <Card className="p-6 bg-surface/80 backdrop-blur-sm border border-dark-200 shadow-glass">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Deal Analytics</h3>
            <p className="text-sm text-dark-400">Performance insights and trends</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onExport}
            className="bg-dark-200/70 hover:bg-dark-300 text-dark-400 hover:text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-dark-200/50 transition-colors"
          >
            <X className="w-5 h-5 text-dark-400" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-dark-400" />
          <span className="text-sm text-dark-400">Time Range:</span>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="bg-dark-200/70 border border-dark-300 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-dark-400">Stage:</span>
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="bg-dark-200/70 border border-dark-300 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Stages</option>
            {stages.map(stage => (
              <option key={stage.id} value={stage.id}>{stage.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-surface/80 backdrop-blur-sm border border-dark-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Total Deals</p>
              <p className="text-lg font-semibold text-white">{filteredDeals.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-surface/80 backdrop-blur-sm border border-dark-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Total Value</p>
              <p className="text-lg font-semibold text-white">{formatCurrency(totalValue)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-surface/80 backdrop-blur-sm border border-dark-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Avg Deal Size</p>
              <p className="text-lg font-semibold text-white">{formatCurrency(avgDealSize)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-surface/80 backdrop-blur-sm border border-dark-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Win Rate</p>
              <p className="text-lg font-semibold text-white">{conversionRate.toFixed(1)}%</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deals by Stage */}
        <Card className="p-6 bg-surface/80 backdrop-blur-sm border border-dark-200">
          <h4 className="font-semibold text-white mb-4">Deals by Stage</h4>
          <div className="space-y-3">
            {dealsByStage.map(({ stage, count, value }) => (
              <div key={stage.id} className="flex items-center justify-between p-3 bg-dark-200/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  ></div>
                  <span className="text-white font-medium">{stage.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{count} deals</p>
                  <p className="text-sm text-dark-400">{formatCurrency(value)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Deals by Status */}
        <Card className="p-6 bg-surface/80 backdrop-blur-sm border border-dark-200">
          <h4 className="font-semibold text-white mb-4">Deals by Status</h4>
          <div className="space-y-3">
            {dealsByStatus.map(({ status, count }) => (
              <div key={status} className="flex items-center justify-between p-3 bg-dark-200/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    status === 'won' ? 'bg-green-400' : 
                    status === 'lost' ? 'bg-red-400' : 'bg-yellow-400'
                  }`}></div>
                  <span className="text-white font-medium capitalize">{status}</span>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{count} deals</p>
                  <p className="text-sm text-dark-400">
                    {filteredDeals.length > 0 ? ((count / filteredDeals.length) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6 bg-surface/80 backdrop-blur-sm border border-dark-200 mt-6">
        <h4 className="font-semibold text-white mb-4">Recent Activity</h4>
        <div className="space-y-3">
          {filteredDeals.slice(0, 5).map((deal) => (
            <div key={deal.id} className="flex items-center justify-between p-3 bg-dark-200/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-dark-200/50 rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4 text-dark-400" />
                </div>
                <div>
                  <p className="text-white font-medium">{deal.title}</p>
                  <p className="text-sm text-dark-400">
                    {format(new Date(deal.created_at), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold">{formatCurrency(deal.value)}</p>
                <p className="text-sm text-dark-400">{deal.probability}%</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </Card>
  );
}; 