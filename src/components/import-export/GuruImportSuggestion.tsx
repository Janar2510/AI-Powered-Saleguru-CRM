import React from 'react';
import { Zap, BarChart3, X, ArrowRight } from 'lucide-react';
import { Card } from '../common/Card';

interface GuruImportSuggestionProps {
  entityType: string;
  importCount: number;
  onClose: () => void;
  onAnalyze: () => void;
}

export const GuruImportSuggestion: React.FC<GuruImportSuggestionProps> = ({
  entityType,
  importCount,
  onClose,
  onAnalyze
}) => {
  return (
    <Card className="p-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-500/30 shadow-xl">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Import Complete!</h3>
            <p className="text-sm text-dark-300">
              Successfully imported {importCount} {entityType}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-dark-200/50 transition-colors"
        >
          <X className="w-4 h-4 text-dark-400" />
        </button>
      </div>
      
      <div className="bg-dark-200/30 rounded-lg p-4 mb-4">
        <div className="flex items-center space-x-3 mb-3">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <h4 className="font-medium text-white">AI Analysis Available</h4>
        </div>
        <p className="text-sm text-dark-300 mb-3">
          Let Guru analyze your imported {entityType} and suggest:
        </p>
        <ul className="text-sm text-dark-300 space-y-1">
          <li>• Optimal tags and categories</li>
          <li>• Stage assignments and probabilities</li>
          <li>• Priority levels and follow-up tasks</li>
          <li>• Potential duplicates and data quality issues</li>
        </ul>
      </div>
      
      <button
        onClick={onAnalyze}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 transform hover:scale-[1.02]"
      >
        <Zap className="w-5 h-5" />
        <span>Analyze with AI</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </Card>
  );
}; 