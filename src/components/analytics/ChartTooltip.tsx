import React from 'react';
import { Card } from '../ui/Card';

interface ChartTooltipProps {
  title: string;
  value: number | string;
  color?: string;
  x: number;
  y: number;
  visible: boolean;
}

const ChartTooltip: React.FC<ChartTooltipProps> = ({
  title,
  value,
  color = '#7c3aed',
  x,
  y,
  visible
}) => {
  if (!visible) return null;
  
  return (
    <div 
      className="absolute z-10 pointer-events-none transform -translate-x-1/2 -translate-y-full"
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      <div className="bg-secondary-800/90 backdrop-blur-sm border border-secondary-700 rounded-lg px-3 py-2 shadow-xl">
        <div className="text-xs text-secondary-300">{title}</div>
        <div className="text-sm font-medium text-white">{value}</div>
        <div className="absolute bottom-0 left-1/2 transform translate-y-full -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-secondary-700"></div>
      </div>
    </div>
  );
};

export default ChartTooltip;