import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  TrendingUp, 
  Calendar, 
  Target, 
  Zap, 
  Star,
  AlertTriangle,
  CheckCircle,
  CalendarDays,
  BarChart3,
  Activity,
  RefreshCw
} from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useToastContext } from '../../contexts/ToastContext';
import { ChronoLeadScoringService, ChronoLeadScore, TemporalContext } from '../../services/chronoLeadScoringService';

interface ChronoDealsWidgetProps {
  contactId?: string;
  baseScore?: number;
  onScoreUpdate?: (score: ChronoLeadScore) => void;
}

const ChronoDealsWidget: React.FC<ChronoDealsWidgetProps> = ({ 
  contactId, 
  baseScore = 50, 
  onScoreUpdate 
}) => {
  const { showToast } = useToastContext();
  const [chronoScore, setChronoScore] = useState<ChronoLeadScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (contactId) {
      loadChronoScore();
    }
    loadTemporalInsights();
  }, [contactId]);

  const loadChronoScore = async () => {
    if (!contactId) return;
    
    try {
      setLoading(true);
      const score = await ChronoLeadScoringService.getChronoLeadScore(contactId);
      setChronoScore(score);
    } catch (error) {
      console.error('Error loading chrono score:', error);
      showToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to load temporal lead score'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTemporalInsights = async () => {
    try {
      const temporalInsights = await ChronoLeadScoringService.getTemporalInsights();
      setInsights(temporalInsights);
    } catch (error) {
      console.error('Error loading temporal insights:', error);
    }
  };

  const calculateChronoScore = async () => {
    if (!contactId) return;

    try {
      setLoading(true);
      
      const temporalContext: TemporalContext = {
        contact_id: contactId,
        base_score: baseScore,
        current_date: new Date().toISOString(),
        quarter: ChronoLeadScoringService.getTemporalContext().quarter,
        season: ChronoLeadScoringService.getTemporalContext().season,
        holiday_period: ChronoLeadScoringService.getTemporalContext().holiday_period,
        industry: 'Technology', // This would come from contact data
        company_name: 'Demo Company', // This would come from contact data
        role: 'Manager', // This would come from contact data
        deal_history: [] // This would come from actual deal data
      };

      const newScore = await ChronoLeadScoringService.createOrUpdateChronoLeadScore(
        contactId,
        baseScore,
        temporalContext
      );

      setChronoScore(newScore);
      onScoreUpdate?.(newScore);
      
      showToast({
        type: 'success',
        title: 'Success',
        description: 'Temporal lead score calculated successfully'
      });
    } catch (error) {
      console.error('Error calculating chrono score:', error);
      showToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to calculate temporal lead score'
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    if (score >= 60) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    return 'bg-gradient-to-r from-red-500 to-pink-500';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getQuarterColor = (quarter: string) => {
    switch (quarter) {
      case 'Q4': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Q3': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Q2': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Q1': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Main ChronoDeals Widget */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">ChronoDeals™</h3>
              <p className="text-sm text-[#b0b0d0]">Temporal Lead Scoring</p>
            </div>
          </div>
          <Badge variant="gradient" className="text-xs">
            AI-Powered
          </Badge>
        </div>

        {/* Score Display */}
        {chronoScore ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#b0b0d0]">Base Score</p>
                <p className="text-2xl font-bold text-white">{chronoScore.base_score}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#b0b0d0]">Temporal Score</p>
                <p className={`text-3xl font-bold ${getScoreColor(chronoScore.final_score)}`}>
                  {chronoScore.final_score}
                </p>
              </div>
            </div>

            {/* Animated Score Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#b0b0d0]">Score Progress</span>
                <span className="text-white">{chronoScore.final_score}/100</span>
              </div>
              <div className="w-full bg-[#23233a]/60 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-3 rounded-full transition-all duration-1000 ease-out ${getScoreBarColor(chronoScore.final_score)}`}
                  style={{ width: `${chronoScore.final_score}%` }}
                />
              </div>
            </div>

            {/* Time Factors */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-white">Temporal Factors</h4>
              <div className="flex flex-wrap gap-2">
                {chronoScore.time_factors?.quarter && (
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getQuarterColor(chronoScore.time_factors.quarter)}`}
                  >
                    {chronoScore.time_factors.quarter}
                  </Badge>
                )}
                {chronoScore.time_factors?.urgency && (
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getUrgencyColor(chronoScore.time_factors.urgency)}`}
                  >
                    {chronoScore.time_factors.urgency} urgency
                  </Badge>
                )}
                {chronoScore.time_factors?.season && (
                  <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                    {chronoScore.time_factors.season}
                  </Badge>
                )}
                {chronoScore.time_factors?.holiday && (
                  <Badge variant="outline" className="text-xs bg-orange-500/20 text-orange-400 border-orange-500/30">
                    {chronoScore.time_factors.holiday}
                  </Badge>
                )}
              </div>
            </div>

            {/* Reasoning */}
            {chronoScore.time_factors?.reasoning && (
              <div className="bg-[#23233a]/30 rounded-lg p-3">
                <p className="text-xs text-[#b0b0d0] leading-relaxed">
                  {chronoScore.time_factors.reasoning}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-[#8a8a8a] mx-auto mb-4" />
            <p className="text-[#b0b0d0] mb-4">No temporal score calculated yet</p>
            <Button
              onClick={calculateChronoScore}
              disabled={loading || !contactId}
              variant="gradient"
              size="sm"
              icon={loading ? RefreshCw : Zap}
            >
              {loading ? 'Calculating...' : 'Calculate Temporal Score'}
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-6">
          <Button
            onClick={calculateChronoScore}
            disabled={loading}
            variant="secondary"
            size="sm"
            icon={RefreshCw}
          >
            Recalculate
          </Button>
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="secondary"
            size="sm"
            icon={isExpanded ? CalendarDays : BarChart3}
          >
            {isExpanded ? 'Hide Insights' : 'Show Insights'}
          </Button>
        </div>
      </Card>

      {/* Temporal Insights */}
      {isExpanded && insights && (
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Activity className="w-5 h-5 text-purple-400" />
            <h4 className="text-lg font-semibold text-white">Temporal Insights</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#23233a]/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-4 h-4 text-green-400" />
                <span className="text-sm text-[#b0b0d0]">High Priority</span>
              </div>
              <p className="text-2xl font-bold text-white">{insights.high_priority_leads}</p>
            </div>

            <div className="bg-[#23233a]/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-[#b0b0d0]">Avg Score</span>
              </div>
              <p className="text-2xl font-bold text-white">{insights.average_score.toFixed(1)}</p>
            </div>

            <div className="bg-[#23233a]/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-[#b0b0d0]">Current Quarter</span>
              </div>
              <p className="text-2xl font-bold text-white">{insights.current_context.quarter}</p>
            </div>
          </div>

          {/* Quarter Distribution */}
          <div className="mt-6">
            <h5 className="text-sm font-medium text-white mb-3">Quarter Distribution</h5>
            <div className="flex space-x-2">
              {Object.entries(insights.quarter_distribution).map(([quarter, count]) => (
                <div key={quarter} className="flex-1 bg-[#23233a]/30 rounded-lg p-3 text-center">
                  <p className="text-xs text-[#b0b0d0]">{quarter}</p>
                  <p className="text-lg font-bold text-white">{count as number}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Urgency Distribution */}
          <div className="mt-6">
            <h5 className="text-sm font-medium text-white mb-3">Urgency Distribution</h5>
            <div className="flex space-x-2">
              {Object.entries(insights.urgency_distribution).map(([urgency, count]) => (
                <div key={urgency} className="flex-1 bg-[#23233a]/30 rounded-lg p-3 text-center">
                  <p className="text-xs text-[#b0b0d0] capitalize">{urgency}</p>
                  <p className="text-lg font-bold text-white">{count as number}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ChronoDealsWidget; 