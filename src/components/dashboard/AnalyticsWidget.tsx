import React, { useEffect, useRef } from 'react';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useNavigate } from 'react-router-dom';
import * as d3 from 'd3';

interface AnalyticsWidgetProps {
  title: string;
  data: {
    id: string;
    name: string;
    count: number;
    value: number;
  }[];
  type?: 'pipeline' | 'conversion' | 'trend';
  className?: string;
}

const AnalyticsWidget: React.FC<AnalyticsWidgetProps> = ({ 
  title, 
  data, 
  type = 'pipeline',
  className = ''
}) => {
  const navigate = useNavigate();
  const chartRef = useRef<HTMLDivElement>(null);
  
  // CRM color palette from the screenshot
  const colorPalette = {
    lead: '#6b7280',         // Gray
    qualified: '#3b82f6',    // Blue
    proposal: '#eab308',     // Yellow
    negotiation: '#f97316',  // Orange
    'closed-won': '#22c55e', // Green
    'closed-lost': '#ef4444',// Red
    primary: '#7c3aed',      // Purple
    secondary: '#22c55e',    // Green
    accent: '#3b82f6',       // Blue
  };
  
  useEffect(() => {
    if (chartRef.current && data.length > 0) {
      drawChart();
    }
  }, [data]);
  
  const drawChart = () => {
    if (!chartRef.current) return;
    
    // Clear previous chart
    d3.select(chartRef.current).selectAll('*').remove();
    
    const container = chartRef.current;
    const width = container.clientWidth;
    const height = 120;
    
    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(0, 10)`);
    
    if (type === 'pipeline') {
      // Pipeline funnel chart
      const totalValue = data.reduce((sum, d) => sum + d.value, 0);
      const barHeight = 25;
      const maxWidth = width - 100;
      
      // Draw bars
      data.forEach((stage, i) => {
        const barWidth = totalValue > 0 ? (stage.value / totalValue) * maxWidth : 0;
        
        // Determine color based on stage
        let color = colorPalette[stage.id as keyof typeof colorPalette] || colorPalette.primary;
        
        svg.append('rect')
          .attr('x', 0)
          .attr('y', i * (barHeight + 5))
          .attr('width', barWidth)
          .attr('height', barHeight)
          .attr('fill', color)
          .attr('rx', 4)
          .attr('opacity', 0.8)
          .transition()
          .duration(800)
          .attr('width', barWidth);
        
        // Add stage name
        svg.append('text')
          .attr('x', 5)
          .attr('y', i * (barHeight + 5) + barHeight / 2 + 5)
          .attr('fill', 'white')
          .attr('font-size', '12px')
          .text(stage.name);
        
        // Add count
        svg.append('text')
          .attr('x', barWidth + 10)
          .attr('y', i * (barHeight + 5) + barHeight / 2 + 5)
          .attr('fill', '#94a3b8')
          .attr('font-size', '12px')
          .text(`${stage.count} ($${(stage.value / 1000).toFixed(0)}K)`);
      });
    } else if (type === 'conversion') {
      // Conversion rate chart
      const barWidth = 40;
      const maxHeight = height - 30;
      
      // Set up scales
      const x = d3.scaleBand()
        .domain(data.map(d => d.name))
        .range([0, width])
        .padding(0.3);
      
      const y = d3.scaleLinear()
        .domain([0, 100])
        .range([maxHeight, 0]);
      
      // Draw bars
      svg.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.name)! + (x.bandwidth() - barWidth) / 2)
        .attr('width', barWidth)
        .attr('y', maxHeight)
        .attr('height', 0)
        .attr('fill', colorPalette.primary)
        .attr('rx', 4)
        .transition()
        .duration(800)
        .attr('y', d => y(d.count))
        .attr('height', d => maxHeight - y(d.count));
      
      // Add labels
      svg.selectAll('.label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', d => x(d.name)! + x.bandwidth() / 2)
        .attr('y', d => y(d.count) - 5)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-size', '10px')
        .text(d => `${d.count}%`);
      
      // Add x-axis labels
      svg.selectAll('.x-label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'x-label')
        .attr('x', d => x(d.name)! + x.bandwidth() / 2)
        .attr('y', maxHeight + 15)
        .attr('text-anchor', 'middle')
        .attr('fill', '#94a3b8')
        .attr('font-size', '10px')
        .text(d => d.name);
    } else {
      // Trend chart
      const maxValue = Math.max(...data.map(d => d.value));
      
      // Set up scales
      const x = d3.scaleBand()
        .domain(data.map(d => d.name))
        .range([0, width])
        .padding(0.3);
      
      const y = d3.scaleLinear()
        .domain([0, maxValue * 1.1])
        .range([height - 20, 0]);
      
      // Create line generator
      const line = d3.line<any>()
        .x(d => x(d.name)! + x.bandwidth() / 2)
        .y(d => y(d.value))
        .curve(d3.curveMonotoneX);
      
      // Draw line
      svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', colorPalette.primary)
        .attr('stroke-width', 2)
        .attr('d', line)
        .attr('opacity', 0)
        .transition()
        .duration(800)
        .attr('opacity', 1);
      
      // Add dots
      svg.selectAll('.dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', d => x(d.name)! + x.bandwidth() / 2)
        .attr('cy', d => y(d.value))
        .attr('r', 4)
        .attr('fill', colorPalette.primary)
        .attr('opacity', 0)
        .transition()
        .duration(800)
        .delay((d, i) => i * 100)
        .attr('opacity', 1);
      
      // Add labels
      svg.selectAll('.label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', d => x(d.name)! + x.bandwidth() / 2)
        .attr('y', d => y(d.value) - 10)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-size', '10px')
        .text(d => `$${(d.value / 1000).toFixed(0)}K`);
      
      // Add x-axis labels
      svg.selectAll('.x-label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'x-label')
        .attr('x', d => x(d.name)! + x.bandwidth() / 2)
        .attr('y', height - 5)
        .attr('text-anchor', 'middle')
        .attr('fill', '#94a3b8')
        .attr('font-size', '10px')
        .text(d => d.name);
    }
  };
  
  return (
    <Card className={`bg-white/10 backdrop-blur-md ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <Badge variant="secondary" size="sm">
            {type === 'pipeline' ? 'By Stage' : type === 'conversion' ? 'Success Rate' : 'Trend'}
          </Badge>
        </div>
        <button 
          onClick={() => navigate('/analytics')}
          className="text-primary-400 hover:text-primary-300 flex items-center space-x-1"
        >
          <span className="text-sm">Details</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      
      <div ref={chartRef} className="h-32"></div>
    </Card>
  );
};

export default AnalyticsWidget;