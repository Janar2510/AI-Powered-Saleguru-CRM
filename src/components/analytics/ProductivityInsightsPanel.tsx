import React from 'react';
import { 
  TrendingUp, 
  X, 
  ArrowUp, 
  ArrowDown, 
  Minus,
  Clock,
  CheckCircle,
  User,
  Calendar
} from 'lucide-react';
import { Card } from '../common/Card';
import { ProductivityInsight } from '../../types/ai';

interface ProductivityInsightsPanelProps {
  insights: ProductivityInsight[];
  onClose: () => void;
  onAction: (url: string) => void;
}

const ProductivityInsightsPanel: React.FC<ProductivityInsightsPanelProps> = ({
  insights,
  onClose,
  onAction
}) => {
  const getCategoryIcon = (category: ProductivityInsight['category']) => {
    switch (category) {
      case 'time_management':
        return <Clock className="w-5 h-5 text-blue-400" />;
      case 'deal_progress':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'contact_engagement':
        return <User className="w-5 h-5 text-purple-400" />;
      case 'task_completion':
        return <CheckCircle className="w-5 h-5 text-yellow-400" />;
      default:
        return <TrendingUp className="w-5 h-5 text-secondary-400" />;
    }
  };

  const getChangeIcon = (change?: number) => {
    if (!change) return null;
    
    if (change > 0) {
      return <ArrowUp className="w-3 h-3 text-green-400" />;
    } else if (change < 0) {
      return <ArrowDown className="w-3 h-3 text-red-400" />;
    } else {
      return <Minus className="w-3 h-3 text-secondary-400" />;
    }
  };

  const getChangeColor = (change?: number) => {
    if (!change) return 'text-secondary-400';
    
    if (change > 0) {
      return 'text-green-400';
    } else if (change < 0) {
      return 'text-red-400';
    } else {
      return 'text-secondary-400';
    }
  };

  return (
    <Card className="p-4 border-l-4 border-purple-400">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-white">Productivity Insights</h3>
            <p className="text-xs text-secondary-400">
              Your performance metrics and recommendations
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-secondary-700 transition-colors"
        >
          <X className="w-4 h-4 text-secondary-400" />
        </button>
      </div>
      
      {insights.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map(insight => (
              <div 
                key={insight.id} 
                className="p-4 rounded-lg bg-secondary-700/50 border border-secondary-600 hover:border-secondary-500 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getCategoryIcon(insight.category)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-white">{insight.title}</h4>
                      
                      {insight.metric_value !== undefined && (
                        <div className="flex items-center space-x-1">
                          <span className="text-white font-medium">{insight.metric_value}</span>
                          {insight.metric_unit && (
                            <span className="text-secondary-400 text-xs">{insight.metric_unit}</span>
                          )}
                          {insight.metric_change !== undefined && (
                            <div className={`flex items-center ${getChangeColor(insight.metric_change)}`}>
                              {getChangeIcon(insight.metric_change)}
                              <span className="text-xs ml-0.5">{Math.abs(insight.metric_change)}%</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-secondary-400 mt-2">{insight.description}</p>
                    
                    {insight.action_url && insight.action_label && (
                      <button
                        onClick={() => onAction(insight.action_url!)}
                        className="mt-3 text-xs bg-secondary-600 hover:bg-secondary-500 text-white px-2 py-1 rounded transition-colors"
                      >
                        {insight.action_label}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-secondary-700/50 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-white">Weekly Summary</h4>
                <p className="text-sm text-secondary-400 mt-1">
                  This week you've completed 12 tasks, made 8 calls, and sent 15 emails.
                  Your productivity is up 15% compared to last week.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <TrendingUp className="w-12 h-12 text-secondary-400 mx-auto mb-3" />
          <p className="text-white font-medium mb-1">No insights available</p>
          <p className="text-secondary-400 text-sm">
            We need more data to generate productivity insights.
          </p>
        </div>
      )}
    </Card>
  );
};

export default ProductivityInsightsPanel; 