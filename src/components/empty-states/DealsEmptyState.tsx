import React from 'react';
import { Target, Plus, Zap, TrendingUp, Users, BarChart3 } from 'lucide-react';
import { Card } from '../common/Card';

interface DealsEmptyStateProps {
  onCreateDeal: () => void;
  onSetupAutomation: () => void;
}

export const DealsEmptyState: React.FC<DealsEmptyStateProps> = ({
  onCreateDeal,
  onSetupAutomation
}) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Target className="w-10 h-10 text-blue-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-3">No deals yet</h2>
        <p className="text-dark-400 mb-8">
          Start building your sales pipeline by creating your first deal. Track opportunities, manage relationships, and close more sales.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={onCreateDeal}
            className="w-full bg-accent hover:bg-accent/80 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Your First Deal</span>
          </button>
          
          <button
            onClick={onSetupAutomation}
            className="w-full bg-dark-200/70 hover:bg-dark-300 text-dark-400 hover:text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <Zap className="w-5 h-5" />
            <span>Setup Automation</span>
          </button>
        </div>
        
        {/* Quick Tips */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-surface/80 backdrop-blur-sm border border-dark-200">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="font-semibold text-white text-sm mb-1">Track Progress</h3>
            <p className="text-xs text-dark-400">Monitor deal stages and conversion rates</p>
          </Card>
          
          <Card className="p-4 bg-surface/80 backdrop-blur-sm border border-dark-200">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Users className="w-4 h-4 text-green-400" />
            </div>
            <h3 className="font-semibold text-white text-sm mb-1">Manage Contacts</h3>
            <p className="text-xs text-dark-400">Keep track of all your customer interactions</p>
          </Card>
          
          <Card className="p-4 bg-surface/80 backdrop-blur-sm border border-dark-200">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="font-semibold text-white text-sm mb-1">Analytics</h3>
            <p className="text-xs text-dark-400">Get insights into your sales performance</p>
          </Card>
        </div>
      </div>
    </div>
  );
}; 