import React, { useState, useEffect } from 'react';
import { Bot, Zap, TrendingUp, CheckSquare, AlertTriangle, Target, Calendar, ChevronRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useGuru } from '../../contexts/GuruContext';

interface GuruInsight {
  id: string;
  title: string;
  description: string;
  type: 'deal' | 'task' | 'lead' | 'calendar';
  priority: 'high' | 'medium' | 'low';
  action?: {
    label: string;
    query: string;
  };
}

const GuruDashboardWidget: React.FC = () => {
  const { openGuru, sendMessage } = useGuru();
  const [insights, setInsights] = useState<GuruInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchInsights = async () => {
      setIsLoading(true);
      
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      try {
        // Generate helpful insights for the user
        const generatedInsights: GuruInsight[] = [
          {
            id: 'productivity-tip',
            title: 'Boost your productivity today',
            description: 'Focus on high-priority tasks and update your deals to maintain momentum.',
            type: 'task',
            priority: 'medium',
            action: {
              label: 'Get Tips',
              query: 'How can I be more productive today?'
            }
          },
          {
            id: 'pipeline-review',
            title: 'Review your sales pipeline',
            description: 'Check your deals and move them forward to close more opportunities this quarter.',
            type: 'deal',
            priority: 'high',
            action: {
              label: 'View Pipeline',
              query: 'Show me my sales pipeline'
            }
          },
          {
            id: 'ai-assistant',
            title: 'AI Assistant ready to help',
            description: 'Ask me anything about your CRM data, sales strategies, or productivity tips.',
            type: 'calendar',
            priority: 'low',
            action: {
              label: 'Ask Guru',
              query: 'What can you help me with?'
            }
          }
        ];
        
        setInsights(generatedInsights);
      } catch (error) {
        console.error('Error generating insights:', error);
        setInsights([
          {
            id: 'welcome',
            title: 'Welcome to your CRM dashboard',
            description: 'Your AI assistant is ready to help you manage your sales pipeline and boost productivity.',
            type: 'calendar',
            priority: 'medium',
            action: {
              label: 'Get Started',
              query: 'How can I get started?'
            }
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    // Start with immediate insights, then fetch more
    setInsights([
      {
        id: 'initial',
        title: 'AI Assistant is analyzing your data...',
        description: 'Getting personalized insights for your sales activities.',
        type: 'calendar',
        priority: 'low'
      }
    ]);
    
    fetchInsights();
  }, []);

  const handleAction = (query: string) => {
    sendMessage(query);
    openGuru();
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'deal':
        return <Target className="w-5 h-5 text-blue-500" />;
      case 'task':
        return <CheckSquare className="w-5 h-5 text-orange-500" />;
      case 'lead':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'calendar':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      default:
        return <Zap className="w-5 h-5 text-primary-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="danger" size="sm">High Priority</Badge>;
      case 'medium':
        return <Badge variant="warning" size="sm">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="success" size="sm">Low Priority</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="bg-gradient-to-r from-primary-600/10 to-purple-600/10 border border-primary-600/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-600/30 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">SaleToruGuru Insights</h3>
            <p className="text-sm text-secondary-300">AI-powered recommendations for your day</p>
          </div>
        </div>
        <button
          onClick={openGuru}
          className="px-4 py-2 bg-gradient-to-r from-[#a259ff] to-[#377dff] text-white rounded-lg text-sm flex items-center space-x-2 hover:opacity-90 transition-opacity"
        >
          <Zap className="w-4 h-4" />
          <span>Ask Guru</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-3 text-secondary-300">AI is analyzing your data...</p>
        </div>
      ) : insights.length > 0 ? (
        <div className="space-y-4">
          {insights.map((insight) => (
            <div key={insight.id} className="bg-secondary-700/50 rounded-lg p-4 hover:bg-secondary-700/70 transition-colors">
              <div className="flex items-start space-x-3">
                <div className="mt-1">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-white">{insight.title}</h4>
                    {getPriorityBadge(insight.priority)}
                  </div>
                  <p className="text-sm text-secondary-300 mt-1">{insight.description}</p>
                  
                  {insight.action && (
                    <button
                      onClick={() => handleAction(insight.action!.query)}
                      className="mt-3 text-sm text-primary-400 hover:text-primary-300 flex items-center space-x-1"
                    >
                      <span>{insight.action.label}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-secondary-600 mx-auto mb-4" />
          <p className="text-secondary-400">No insights available</p>
          <p className="text-secondary-500 text-sm mt-1">Try asking Guru a question to get started</p>
        </div>
      )}
    </Card>
  );
};

export default GuruDashboardWidget;