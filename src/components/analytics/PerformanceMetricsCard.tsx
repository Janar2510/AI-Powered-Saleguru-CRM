import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Card from '../ui/Card';

interface Metric {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface PerformanceMetricsCardProps {
  metrics: Metric[];
  className?: string;
}

const PerformanceMetricsCard: React.FC<PerformanceMetricsCardProps> = ({ 
  metrics,
  className = ''
}) => {
  return (
    <Card className={`bg-white/10 backdrop-blur-md ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-secondary-700/60 backdrop-blur-sm rounded-lg p-4 hover:bg-secondary-700/80 transition-all duration-300 hover:shadow-lg hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-400 text-sm">{metric.title}</p>
                <p className="text-2xl font-bold text-white mt-1">{metric.value}</p>
                <div className="flex items-center space-x-1 mt-2">
                  {metric.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <p className={`text-sm ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {metric.change}
                  </p>
                </div>
              </div>
              <metric.icon className={`w-8 h-8 ${metric.color}`} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default PerformanceMetricsCard;