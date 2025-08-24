import React, { useState, useEffect } from 'react';
import { 
  X, 
  TrendingUp, 
  Target, 
  Calendar, 
  Tag, 
  Building2,
  Download,
  RefreshCw,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  MessageSquare,
  Mail,
  Phone,
  FileText,
  DollarSign,
  Clock,
  Star,
  AlertCircle
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Deal } from '../../types/deals';
import { DealScoreBadge } from './DealScoreBadge';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatDistanceToNow } from 'date-fns';

interface LeadScoringPanelProps {
  deals: Deal[];
  onClose: () => void;
}

export const LeadScoringPanel: React.FC<LeadScoringPanelProps> = ({
  deals,
  onClose
}) => {
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Hot Lead';
    if (score >= 60) return 'Warm Lead';
    if (score >= 40) return 'Cool Lead';
    return 'Cold Lead';
  };

  const calculateScore = (deal: Deal) => {
    let score = 0;
    
    // Base score from probability
    score += deal.probability * 0.5;
    
    // Value-based scoring
    if (deal.value >= 100000) score += 20;
    else if (deal.value >= 50000) score += 15;
    else if (deal.value >= 10000) score += 10;
    else if (deal.value >= 5000) score += 5;
    
    // Activity-based scoring
    score += Math.min(deal.activities_count * 2, 20);
    score += Math.min(deal.emails_count, 10);
    score += Math.min(deal.tasks_count, 10);
    
    // Priority-based scoring
    if (deal.priority === 'high') score += 15;
    else if (deal.priority === 'medium') score += 10;
    else if (deal.priority === 'low') score += 5;
    
    return Math.min(score, 100);
  };

  const scoredDeals = deals.map(deal => ({
    ...deal,
    score: calculateScore(deal)
  })).sort((a, b) => b.score - a.score);

  return (
    <Card className="p-6 bg-surface/80 backdrop-blur-sm border border-dark-200 shadow-glass">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Lead Scoring</h3>
            <p className="text-sm text-dark-400">AI-powered lead prioritization</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-dark-200/50 transition-colors"
        >
          <X className="w-5 h-5 text-dark-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scoring Overview */}
        <div className="lg:col-span-1">
          <h4 className="font-semibold text-white mb-4">Scoring Overview</h4>
          <div className="space-y-4">
            <div className="p-4 bg-dark-200/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-dark-400">Hot Leads (80-100)</span>
                <span className="text-sm text-green-400 font-semibold">
                  {scoredDeals.filter(d => d.score >= 80).length}
                </span>
              </div>
              <div className="w-full bg-dark-300 rounded-full h-2">
                <div 
                  className="bg-green-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(scoredDeals.filter(d => d.score >= 80).length / scoredDeals.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="p-4 bg-dark-200/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-dark-400">Warm Leads (60-79)</span>
                <span className="text-sm text-yellow-400 font-semibold">
                  {scoredDeals.filter(d => d.score >= 60 && d.score < 80).length}
                </span>
              </div>
              <div className="w-full bg-dark-300 rounded-full h-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(scoredDeals.filter(d => d.score >= 60 && d.score < 80).length / scoredDeals.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="p-4 bg-dark-200/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-dark-400">Cool Leads (40-59)</span>
                <span className="text-sm text-orange-400 font-semibold">
                  {scoredDeals.filter(d => d.score >= 40 && d.score < 60).length}
                </span>
              </div>
              <div className="w-full bg-dark-300 rounded-full h-2">
                <div 
                  className="bg-orange-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(scoredDeals.filter(d => d.score >= 40 && d.score < 60).length / scoredDeals.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="p-4 bg-dark-200/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-dark-400">Cold Leads (0-39)</span>
                <span className="text-sm text-red-400 font-semibold">
                  {scoredDeals.filter(d => d.score < 40).length}
                </span>
              </div>
              <div className="w-full bg-dark-300 rounded-full h-2">
                <div 
                  className="bg-red-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(scoredDeals.filter(d => d.score < 40).length / scoredDeals.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Lead List */}
        <div className="lg:col-span-2">
          <h4 className="font-semibold text-white mb-4">Prioritized Leads</h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {scoredDeals.map((deal) => (
              <div
                key={deal.id}
                className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:scale-[1.02] ${
                  selectedDeal?.id === deal.id
                    ? 'bg-accent/10 border-accent'
                    : 'bg-dark-200/30 border-dark-200 hover:border-dark-300'
                }`}
                onClick={() => setSelectedDeal(deal)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-white truncate">{deal.title}</h5>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-semibold ${getScoreColor(deal.score)}`}>
                      {deal.score}
                    </span>
                    <Star className="w-4 h-4 text-yellow-400" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4 text-dark-400">
                    <span>{getScoreLabel(deal.score)}</span>
                    <span>${deal.value.toLocaleString()}</span>
                    <span>{deal.probability}% probability</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {deal.priority === 'high' && (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    )}
                    <Target className="w-4 h-4 text-dark-400" />
                    <span className="text-dark-400">{deal.activities_count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Deal Details */}
      {selectedDeal && (
        <div className="mt-6 p-4 bg-dark-200/30 rounded-lg">
          <h4 className="font-semibold text-white mb-3">Lead Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-dark-400">Score Breakdown:</span>
              <ul className="mt-2 space-y-1 text-dark-300">
                <li>• Probability: {selectedDeal.probability * 0.5} points</li>
                <li>• Deal Value: {selectedDeal.value >= 100000 ? 20 : selectedDeal.value >= 50000 ? 15 : selectedDeal.value >= 10000 ? 10 : 5} points</li>
                <li>• Activities: {Math.min(selectedDeal.activities_count * 2, 20)} points</li>
                <li>• Priority: {selectedDeal.priority === 'high' ? 15 : selectedDeal.priority === 'medium' ? 10 : 5} points</li>
              </ul>
            </div>
            <div>
              <span className="text-dark-400">Recommendations:</span>
              <ul className="mt-2 space-y-1 text-dark-300">
                <li>• {selectedDeal.score >= 80 ? 'High priority - focus immediately' : selectedDeal.score >= 60 ? 'Medium priority - nurture actively' : 'Low priority - maintain contact'}</li>
                <li>• Schedule follow-up within {selectedDeal.score >= 80 ? '24 hours' : selectedDeal.score >= 60 ? '3 days' : '1 week'}</li>
                <li>• {selectedDeal.activities_count < 3 ? 'Increase engagement activities' : 'Maintain current engagement level'}</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}; 