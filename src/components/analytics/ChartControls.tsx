import React, { useState } from 'react';
import { BarChart, PieChart, LineChart, Target, Settings, ChevronDown } from 'lucide-react';
import Badge from '../ui/Badge';

interface ChartControlsProps {
  chartType: 'bar' | 'pie' | 'line' | 'funnel' | '3d';
  onTypeChange: (type: 'bar' | 'pie' | 'line' | 'funnel' | '3d') => void;
  className?: string;
}

const ChartControls: React.FC<ChartControlsProps> = ({
  chartType,
  onTypeChange,
  className = ''
}) => {
  const [showSettings, setShowSettings] = useState(false);
  
  return (
    <div className={`relative ${className}`}>
      <button 
        onClick={() => setShowSettings(!showSettings)}
        className={`p-2 rounded-lg transition-colors ${
          showSettings ? 'bg-primary-600 text-white' : 'text-secondary-400 hover:text-white hover:bg-secondary-700'
        }`}
        title="Chart Settings"
      >
        <Settings className="w-4 h-4" />
      </button>
      
      {showSettings && (
        <div className="absolute right-0 mt-2 w-48 bg-secondary-800 border border-secondary-700 rounded-lg shadow-xl z-10">
          <div className="p-2 border-b border-secondary-700">
            <h4 className="text-sm font-medium text-white">Chart Type</h4>
          </div>
          <div className="p-2 space-y-1">
            <button 
              onClick={() => {
                onTypeChange('bar');
                setShowSettings(false);
              }}
              className={`flex items-center space-x-2 w-full p-2 rounded-lg text-left text-sm ${
                chartType === 'bar' ? 'bg-primary-600 text-white' : 'text-secondary-300 hover:bg-secondary-700'
              }`}
            >
              <BarChart className="w-4 h-4" />
              <span>Bar Chart</span>
            </button>
            <button 
              onClick={() => {
                onTypeChange('pie');
                setShowSettings(false);
              }}
              className={`flex items-center space-x-2 w-full p-2 rounded-lg text-left text-sm ${
                chartType === 'pie' ? 'bg-primary-600 text-white' : 'text-secondary-300 hover:bg-secondary-700'
              }`}
            >
              <PieChart className="w-4 h-4" />
              <span>Pie Chart</span>
            </button>
            <button 
              onClick={() => {
                onTypeChange('line');
                setShowSettings(false);
              }}
              className={`flex items-center space-x-2 w-full p-2 rounded-lg text-left text-sm ${
                chartType === 'line' ? 'bg-primary-600 text-white' : 'text-secondary-300 hover:bg-secondary-700'
              }`}
            >
              <LineChart className="w-4 h-4" />
              <span>Line Chart</span>
            </button>
            <button 
              onClick={() => {
                onTypeChange('funnel');
                setShowSettings(false);
              }}
              className={`flex items-center space-x-2 w-full p-2 rounded-lg text-left text-sm ${
                chartType === 'funnel' ? 'bg-primary-600 text-white' : 'text-secondary-300 hover:bg-secondary-700'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Funnel Chart</span>
            </button>
            <button 
              onClick={() => {
                onTypeChange('3d');
                setShowSettings(false);
              }}
              className={`flex items-center space-x-2 w-full p-2 rounded-lg text-left text-sm ${
                chartType === '3d' ? 'bg-primary-600 text-white' : 'text-secondary-300 hover:bg-secondary-700'
              }`}
            >
              <Badge variant="secondary" size="sm">3D</Badge>
              <span>3D Chart</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartControls;