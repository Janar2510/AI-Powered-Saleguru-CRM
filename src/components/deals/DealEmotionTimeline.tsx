import React, { useEffect, useRef, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Heart, AlertTriangle, MessageCircle, Phone, Calendar, FileText } from 'lucide-react';
import { SentimentAnalysisService, DealEmotion } from '../../services/sentimentAnalysisService';
import { useToastContext } from '../../contexts/ToastContext';

interface DealEmotionTimelineProps {
  dealId: string;
  className?: string;
}

const DealEmotionTimeline: React.FC<DealEmotionTimelineProps> = ({ dealId, className = '' }) => {
  const [emotions, setEmotions] = useState<DealEmotion[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToastContext();

  useEffect(() => {
    loadEmotions();
  }, [dealId]);

  const loadEmotions = async () => {
    try {
      setIsLoading(true);
      const [emotionsData, summaryData] = await Promise.all([
        SentimentAnalysisService.getDealEmotions(dealId),
        SentimentAnalysisService.getDealSentimentSummary(dealId)
      ]);
      
      setEmotions(emotionsData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading emotions:', error);
      showToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to load sentiment data'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '#10B981';
      case 'negative': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getEmotionIcon = (source: string) => {
    switch (source) {
      case 'email': return MessageCircle;
      case 'call': return Phone;
      case 'meeting': return Calendar;
      case 'chat': return MessageCircle;
      case 'note': return FileText;
      default: return MessageCircle;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return TrendingUp;
      case 'declining': return TrendingDown;
      default: return Minus;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return '#10B981';
      case 'declining': return '#EF4444';
      default: return '#6B7280';
    }
  };

  // Prepare data for chart
  const chartData = emotions.map(emotion => ({
    date: new Date(emotion.timestamp).toLocaleDateString(),
    score: emotion.score,
    sentiment: emotion.sentiment,
    emotion: emotion.emotion,
    source: emotion.source,
    content: emotion.content.substring(0, 50) + '...'
  }));

  if (isLoading) {
    return (
      <div className={`bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#a259ff] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#b0b0d0]">Loading sentiment timeline...</p>
          </div>
        </div>
      </div>
    );
  }

  if (emotions.length === 0) {
    return (
      <div className={`bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6 ${className}`}>
        <div className="text-center py-8">
          <Heart className="w-12 h-12 text-[#a259ff] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Sentiment Data</h3>
          <p className="text-[#b0b0d0]">Start interacting with this deal to see emotional sentiment analysis.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-[#a259ff] to-[#377dff] rounded-lg flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Live Sentiment Replay™</h3>
            <p className="text-sm text-[#b0b0d0]">Emotional timeline analysis</p>
          </div>
        </div>
        {summary && (
          <div className="flex items-center space-x-2">
            {React.createElement(getTrendIcon(summary.sentimentTrend), {
              className: `w-5 h-5 ${getTrendColor(summary.sentimentTrend)}`
            })}
            <span className={`text-sm font-medium ${getTrendColor(summary.sentimentTrend)}`}>
              {summary.sentimentTrend}
            </span>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#23233a]/60 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-[#b0b0d0] text-sm">Avg Score</span>
              <span className="text-white font-bold">{summary.averageScore}</span>
            </div>
          </div>
          <div className="bg-[#23233a]/60 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-[#b0b0d0] text-sm">Interactions</span>
              <span className="text-white font-bold">{summary.totalInteractions}</span>
            </div>
          </div>
          <div className="bg-[#23233a]/60 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-[#b0b0d0] text-sm">Dominant</span>
              <span className="text-white font-bold capitalize">{summary.dominantEmotion}</span>
            </div>
          </div>
          <div className="bg-[#23233a]/60 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-[#b0b0d0] text-sm">Positive</span>
              <span className="text-green-400 font-bold">{summary.positiveCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* Sentiment Chart */}
      <div className="mb-6">
        <h4 className="text-white font-medium mb-4">Sentiment Timeline</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a259ff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#a259ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#23233a" />
              <XAxis 
                dataKey="date" 
                stroke="#b0b0d0"
                fontSize={12}
              />
              <YAxis 
                stroke="#b0b0d0"
                fontSize={12}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#23233a',
                  border: '1px solid #23233a',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
                labelStyle={{ color: '#b0b0d0' }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#a259ff"
                strokeWidth={3}
                fill="url(#sentimentGradient)"
                dot={{ fill: '#a259ff', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#a259ff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Interactions */}
      <div>
        <h4 className="text-white font-medium mb-4">Recent Interactions</h4>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {emotions.slice(-5).reverse().map((emotion, index) => {
            const Icon = getEmotionIcon(emotion.source);
            return (
              <div key={emotion.id} className="bg-[#23233a]/60 rounded-lg p-3 hover:bg-[#23233a]/80 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getSentimentColor(emotion.sentiment)}/20`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium capitalize">{emotion.source}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(emotion.sentiment)}/20 ${getSentimentColor(emotion.sentiment)}`}>
                          {emotion.emotion}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-bold">{emotion.score}</span>
                        <div className={`w-2 h-2 rounded-full ${getSentimentColor(emotion.sentiment)}`}></div>
                      </div>
                    </div>
                    <p className="text-[#b0b0d0] text-sm line-clamp-2">{emotion.content}</p>
                    <p className="text-[#8a8a8a] text-xs mt-1">
                      {new Date(emotion.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DealEmotionTimeline; 