import React, { useState, useEffect } from 'react';
import { CallTranscriptionService } from '../../services/callTranscriptionService';
import { CallInsights } from '../../types/call';

interface CallInsightsWidgetProps {
  contactId?: string;
  dealId?: string;
  className?: string;
}

const CallInsightsWidget: React.FC<CallInsightsWidgetProps> = ({
  contactId,
  dealId,
  className = ''
}) => {
  const [insights, setInsights] = useState<CallInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInsights();
  }, [contactId, dealId]);

  const loadInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await CallTranscriptionService.getCallInsights({
        contactId,
        dealId,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
        endDate: new Date().toISOString()
      });
      
      setInsights(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white/10 backdrop-blur-md border border-secondary-700 rounded-2xl shadow-xl p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-secondary-700 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-secondary-700 rounded"></div>
            <div className="h-20 bg-secondary-700 rounded"></div>
          </div>
          <div className="h-32 bg-secondary-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white/10 backdrop-blur-md border border-secondary-700 rounded-2xl shadow-xl p-6 ${className}`}>
        <div className="text-center text-secondary-400">
          <svg className="mx-auto h-12 w-12 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!insights || insights.totalCalls === 0) {
    return (
      <div className={`bg-white/10 backdrop-blur-md border border-secondary-700 rounded-2xl shadow-xl p-6 ${className}`}>
        <div className="text-center text-secondary-400">
          <svg className="mx-auto h-12 w-12 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m-4-6h8m-8 6h8" />
          </svg>
          <p className="mt-2 text-sm">No call data available</p>
          <p className="text-xs text-secondary-500">Upload call recordings to see insights</p>
        </div>
      </div>
    );
  }

  const sentimentTotal = insights.sentimentBreakdown.positive + insights.sentimentBreakdown.neutral + insights.sentimentBreakdown.negative;
  const dealStageTotal = Object.values(insights.dealStageBreakdown).reduce((sum, count) => sum + count, 0);

  return (
    <div className={`bg-white/10 backdrop-blur-md border border-secondary-700 rounded-2xl shadow-xl ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Call Insights</h3>
        <div className="flex items-center space-x-2 text-sm text-secondary-400">
          <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
          <span>Last 30 days</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{insights.totalCalls}</div>
          <div className="text-sm text-secondary-400">Total Calls</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{Math.round(insights.averageDuration)}</div>
          <div className="text-sm text-secondary-400">Avg Duration (min)</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{(insights.conversionRate * 100).toFixed(0)}%</div>
          <div className="text-sm text-secondary-400">Conversion Rate</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {insights.sentimentBreakdown.positive > insights.sentimentBreakdown.negative ? '😊' : '😐'}
          </div>
          <div className="text-sm text-secondary-400">Overall Sentiment</div>
        </div>
      </div>

      {/* Sentiment Breakdown */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-white mb-3">Sentiment Analysis</h4>
        <div className="space-y-2">
          {sentimentTotal > 0 && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-400">Positive</span>
                <span className="text-sm font-medium text-white">
                  {insights.sentimentBreakdown.positive} ({((insights.sentimentBreakdown.positive / sentimentTotal) * 100).toFixed(0)}%)
                </span>
              </div>
              <div className="w-full bg-secondary-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(insights.sentimentBreakdown.positive / sentimentTotal) * 100}%` }}
                />
              </div>
            </>
          )}
          
          {sentimentTotal > 0 && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-400">Neutral</span>
                <span className="text-sm font-medium text-white">
                  {insights.sentimentBreakdown.neutral} ({((insights.sentimentBreakdown.neutral / sentimentTotal) * 100).toFixed(0)}%)
                </span>
              </div>
              <div className="w-full bg-secondary-700 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(insights.sentimentBreakdown.neutral / sentimentTotal) * 100}%` }}
                />
              </div>
            </>
          )}
          
          {sentimentTotal > 0 && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-400">Negative</span>
                <span className="text-sm font-medium text-white">
                  {insights.sentimentBreakdown.negative} ({((insights.sentimentBreakdown.negative / sentimentTotal) * 100).toFixed(0)}%)
                </span>
              </div>
              <div className="w-full bg-secondary-700 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(insights.sentimentBreakdown.negative / sentimentTotal) * 100}%` }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Deal Stage Progression */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-white mb-3">Deal Stage Progression</h4>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(insights.dealStageBreakdown).map(([stage, count]) => (
            <div key={stage} className="text-center">
              <div className="text-lg font-semibold text-white">{count}</div>
              <div className="text-xs text-secondary-400 capitalize">{stage}</div>
              {dealStageTotal > 0 && (
                <div className="w-full bg-secondary-700 rounded-full h-1 mt-1">
                  <div 
                    className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${(count / dealStageTotal) * 100}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Top Action Items */}
      {insights.topActionItems.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-white mb-3">Top Action Items</h4>
          <div className="space-y-2">
            {insights.topActionItems.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <span className="text-green-500">✓</span>
                <span className="text-white">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CallInsightsWidget; 