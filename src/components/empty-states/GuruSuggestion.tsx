import React from 'react';
import { X, Zap, ArrowRight } from 'lucide-react';
import { Card } from '../common/Card';

interface GuruSuggestionProps {
  title: string;
  description: string;
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  onClose: () => void;
}

export const GuruSuggestion: React.FC<GuruSuggestionProps> = ({
  title,
  description,
  suggestions,
  onSuggestionClick,
  onClose
}) => {
  return (
    <Card className="p-6 bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-purple-500/30 shadow-xl">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="text-sm text-dark-300">{description}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-dark-200/50 transition-colors"
        >
          <X className="w-4 h-4 text-dark-400" />
        </button>
      </div>
      
      <div className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className="w-full text-left p-3 rounded-lg bg-dark-200/30 hover:bg-dark-200/50 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-white group-hover:text-purple-300 transition-colors">
                {suggestion}
              </span>
              <ArrowRight className="w-4 h-4 text-dark-400 group-hover:text-purple-400 transition-colors" />
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}; 