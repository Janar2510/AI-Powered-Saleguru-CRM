import React from 'react';
import { Bot, Zap, TrendingUp, Target, Users, Calendar, ChevronRight } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { useGuru } from '../../contexts/GuruContext';

interface InsightsPanelProps {
  insights: {
    title: string;
    description: string;
    type: 'deal' | 'task' | 'lead' | 'calendar' | 'performance';
    priority: 'high' | 'medium' | 'low';
    action?: {
      label: string;
      query: string;
    };
  }[];
  onAskGuru: () => void;
  className?: string;
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({ 
  insights,
  onAskGuru,
  className = ''
}) => {
  const { openGuru, sendMessage } = useGuru();
  
  // CRM color palette from the screenshot
  const colorPalette = {
    deal: '#7c3aed',       // Purple (primary)
    task: '#f97316',       // Orange
    lead: '#22c55e',       // Green
    calendar: '#3b82f6',   // Blue
    performance: '#eab308' // Yellow
  };
  
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
        return <Target className="w-5 h-5" style={{ color: colorPalette.deal }} />;
      case 'task':
        return <Calendar className="w-5 h-5" style={{ color: colorPalette.task }} />;
      case 'lead':
        return <Users className="w-5 h-5" style={{ color: colorPalette.lead }} />;
      case 'performance':
        return <TrendingUp className="w-5 h-5" style={{ color: colorPalette.performance }} />;
      default:
        return <Zap className="w-5 h-5" style={{ color: colorPalette.deal }} />;
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
    <Card className={`bg-gradient-to-r from-primary-600/10 to-purple-600/10 border border-primary-600/20 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-600/30 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI-Powered Insights</h3>
            <p className="text-sm text-secondary-300">Guru's analysis of your sales data</p>
          </div>
        </div>
        <button
          onClick={onAskGuru}
          className="btn-primary text-sm flex items-center space-x-2"
        >
          <Bot className="w-4 h-4" />
          <span>Get Full Analysis</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((insight, index) => (
          <div 
            key={index} 
            className="bg-secondary-700/50 rounded-lg p-4 hover:bg-secondary-700/70 transition-colors hover:shadow-lg hover:scale-105 duration-300"
            style={{ borderLeft: `3px solid ${colorPalette[insight.type as keyof typeof colorPalette]}` }}
          >
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
                    className="mt-3 text-sm hover:text-primary-300 flex items-center space-x-1 group"
                    style={{ color: colorPalette[insight.type as keyof typeof colorPalette] }}
                  >
                    <span>{insight.action.label}</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default InsightsPanel;