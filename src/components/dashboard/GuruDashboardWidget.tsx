import React, { useState, useEffect } from 'react';
import { Bot, Zap, TrendingUp, CheckSquare, AlertTriangle, Target, Calendar, ChevronRight } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { useGuru } from '../../contexts/GuruContext';
import { supabase } from '../../services/supabase';

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      setIsLoading(true);
      try {
        // Fetch data from Supabase to generate insights
        
        // Check for overdue tasks
        const { data: overdueTasks } = await supabase
          .from('tasks')
          .select('*')
          .eq('status', 'overdue')
          .eq('completed', false)
          .order('due_date', { ascending: true });
        
        // Check for deals in negotiation stage
        const { data: negotiationDeals } = await supabase
          .from('deals')
          .select('*')
          .eq('stage_id', 'negotiation')
          .order('updated_at', { ascending: true });
        
        // Check for high-scoring leads
        const { data: highScoringLeads } = await supabase
          .from('leads')
          .select('*')
          .gte('score', 80)
          .order('score', { ascending: false });
        
        // Generate insights based on data
        const generatedInsights: GuruInsight[] = [];
        
        if (overdueTasks && overdueTasks.length > 0) {
          generatedInsights.push({
            id: 'overdue-tasks',
            title: `${overdueTasks.length} overdue tasks need attention`,
            description: `You have ${overdueTasks.length} tasks that are past their due date. The oldest is "${overdueTasks[0].title}" from ${new Date(overdueTasks[0].due_date).toLocaleDateString()}.`,
            type: 'task',
            priority: 'high',
            action: {
              label: 'View overdue tasks',
              query: 'Show me all overdue tasks'
            }
          });
        }
        
        if (negotiationDeals && negotiationDeals.length > 0) {
          const totalValue = negotiationDeals.reduce((sum, deal) => sum + deal.value, 0);
          
          generatedInsights.push({
            id: 'negotiation-deals',
            title: `${negotiationDeals.length} deals in negotiation ($${(totalValue/1000).toFixed(0)}K)`,
            description: `Focus on these deals to improve your close rate. The oldest deal in negotiation is "${negotiationDeals[0].title}" with ${negotiationDeals[0].company}.`,
            type: 'deal',
            priority: 'medium',
            action: {
              label: 'Analyze negotiation deals',
              query: 'Analyze deals in negotiation stage'
            }
          });
        }
        
        if (highScoringLeads && highScoringLeads.length > 0) {
          generatedInsights.push({
            id: 'high-scoring-leads',
            title: `${highScoringLeads.length} leads have high engagement scores`,
            description: `${highScoringLeads[0].company} and ${highScoringLeads.length > 1 ? highScoringLeads[1].company : 'others'} have shown increased activity. These leads are ready for outreach.`,
            type: 'lead',
            priority: 'high',
            action: {
              label: 'Prioritize outreach',
              query: 'Suggest outreach strategy for high-scoring leads'
            }
          });
        }
        
        // Add some static insights for demonstration
        generatedInsights.push({
          id: 'upcoming-meetings',
          title: 'You have 3 meetings scheduled this week',
          description: 'Your busiest day is Wednesday with 2 client meetings. Consider preparing materials in advance.',
          type: 'calendar',
          priority: 'medium',
          action: {
            label: 'Prepare meeting materials',
            query: 'Help me prepare for this week\'s meetings'
          }
        });
        
        if (generatedInsights.length < 3) {
          generatedInsights.push({
            id: 'pipeline-health',
            title: 'Pipeline health check recommended',
            description: 'It\'s been 14 days since your last pipeline review. Consider analyzing deal progress and conversion rates.',
            type: 'deal',
            priority: 'medium',
            action: {
              label: 'Analyze pipeline health',
              query: 'Analyze my sales pipeline health'
            }
          });
        }
        
        setInsights(generatedInsights);
      } catch (error) {
        console.error('Error fetching insights:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInsights();
  }, []);

  const handleAction = (query: string) => {
    openGuru();
    // Small delay to ensure panel is open
    setTimeout(() => {
      sendMessage(query);
    }, 300);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'deal':
        return <Target className="w-5 h-5 text-primary-500" />;
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
          className="btn-primary text-sm flex items-center space-x-2"
        >
          <Zap className="w-4 h-4" />
          <span>Ask Guru</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
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