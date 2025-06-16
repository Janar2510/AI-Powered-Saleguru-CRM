import React, { useRef, useEffect } from 'react';
import { useResizeObserver } from '../../hooks/useResizeObserver';

interface ChartContainerProps {
  children: React.ReactNode;
  className?: string;
  aspectRatio?: number;
  minHeight?: number;
  maxHeight?: number;
}

const ChartContainer: React.FC<ChartContainerProps> = ({
  children,
  className = '',
  aspectRatio = 16/9,
  minHeight = 200,
  maxHeight = 500
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dimensions = useResizeObserver(containerRef);
  
  useEffect(() => {
    if (containerRef.current && dimensions) {
      const width = dimensions.width;
      const height = Math.min(Math.max(width / aspectRatio, minHeight), maxHeight);
      
      containerRef.current.style.height = `${height}px`;
    }
  }, [dimensions, aspectRatio, minHeight, maxHeight]);
  
  return (
    <div 
      ref={containerRef} 
      className={`relative overflow-hidden transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  );
};

export default ChartContainer;