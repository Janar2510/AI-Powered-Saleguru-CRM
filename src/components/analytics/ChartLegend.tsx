import React from 'react';

interface LegendItem {
  id: string;
  name: string;
  color: string;
  value: number | string;
}

interface ChartLegendProps {
  items: LegendItem[];
  className?: string;
  showValues?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

const ChartLegend: React.FC<ChartLegendProps> = ({
  items,
  className = '',
  showValues = true,
  orientation = 'horizontal'
}) => {
  return (
    <div className={`flex ${orientation === 'vertical' ? 'flex-col space-y-2' : 'flex-wrap gap-4'} ${className}`}>
      {items.map((item) => (
        <div 
          key={item.id} 
          className="flex items-center space-x-2"
        >
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: item.color }}
          ></div>
          <span className="text-xs text-secondary-300">{item.name}</span>
          {showValues && (
            <span className="text-xs text-white font-medium">{item.value}</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default ChartLegend;