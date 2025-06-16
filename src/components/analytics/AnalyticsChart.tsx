import React, { useEffect, useRef, useState } from 'react';
import { BarChart, PieChart, LineChart, Target, RefreshCw, Settings, ChevronDown } from 'lucide-react';
import * as d3 from 'd3';
import * as THREE from 'three';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { useResizeObserver } from '../../hooks/useResizeObserver';

interface ChartData {
  id: string;
  name: string;
  value: number;
  color?: string;
}

interface AnalyticsChartProps {
  title?: string;
  description?: string;
  data: ChartData[];
  type: 'bar' | 'pie' | 'line' | 'funnel' | '3d';
  height?: number;
  className?: string;
  isLoading?: boolean;
  showControls?: boolean;
  onTypeChange?: (type: 'bar' | 'pie' | 'line' | 'funnel' | '3d') => void;
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  title,
  description,
  data,
  type,
  height = 300,
  className = '',
  isLoading = false,
  showControls = true,
  onTypeChange
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartType, setChartType] = useState(type);
  const [showSettings, setShowSettings] = useState(false);
  const dimensions = useResizeObserver(chartRef);
  
  // CRM color palette from the screenshot
  const colorPalette = {
    primary: '#7c3aed',      // Purple
    secondary: '#22c55e',    // Green
    accent: '#3b82f6',       // Blue
    warning: '#eab308',      // Yellow
    danger: '#ef4444',       // Red
    orange: '#f97316',       // Orange
    gray: '#6b7280',         // Gray
    teal: '#14b8a6',         // Teal
    pink: '#ec4899',         // Pink
    indigo: '#6366f1'        // Indigo
  };
  
  // Update chart type when prop changes
  useEffect(() => {
    setChartType(type);
  }, [type]);
  
  // Draw chart when data, dimensions, or chart type changes
  useEffect(() => {
    if (chartRef.current && data.length > 0 && !isLoading && dimensions) {
      drawChart();
    }
  }, [data, chartType, isLoading, dimensions]);
  
  const handleTypeChange = (newType: 'bar' | 'pie' | 'line' | 'funnel' | '3d') => {
    setChartType(newType);
    if (onTypeChange) {
      onTypeChange(newType);
    }
  };
  
  const drawChart = () => {
    if (!chartRef.current || !dimensions) return;
    
    // Clear previous chart
    d3.select(chartRef.current).selectAll('*').remove();
    
    const container = chartRef.current;
    const width = dimensions.width;
    
    if (chartType === 'bar') {
      drawBarChart(container, width, height);
    } else if (chartType === 'pie') {
      drawPieChart(container, width, height);
    } else if (chartType === 'line') {
      drawLineChart(container, width, height);
    } else if (chartType === 'funnel') {
      drawFunnelChart(container, width, height);
    } else if (chartType === '3d') {
      draw3DChart(container, width, height);
    }
  };
  
  const getColorForIndex = (index: number, defaultColor?: string) => {
    if (defaultColor) return defaultColor;
    
    const colors = Object.values(colorPalette);
    return colors[index % colors.length];
  };
  
  const drawBarChart = (container: HTMLDivElement, width: number, height: number) => {
    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(40, 20)`);
    
    // Set up scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([0, width - 80])
      .padding(0.3);
    
    const maxValue = Math.max(...data.map(d => d.value));
    const y = d3.scaleLinear()
      .domain([0, maxValue * 1.1])
      .range([height - 60, 0]);
    
    // Draw bars
    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.name)!)
      .attr('width', x.bandwidth())
      .attr('y', height - 60)
      .attr('height', 0)
      .attr('fill', (d, i) => d.color || getColorForIndex(i))
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('opacity', 0.8)
      .transition()
      .duration(800)
      .delay((d, i) => i * 100)
      .attr('y', d => y(d.value))
      .attr('height', d => height - 60 - y(d.value));
    
    // Add hover effects
    svg.selectAll('.bar')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 1)
          .attr('transform', 'scale(1.05)');
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 0.8)
          .attr('transform', 'scale(1)');
      });
    
    // Add labels
    svg.selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => x(d.name)! + x.bandwidth() / 2)
      .attr('y', d => y(d.value) - 5)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '12px')
      .attr('opacity', 0)
      .transition()
      .duration(800)
      .delay((d, i) => i * 100 + 400)
      .attr('opacity', 1)
      .text(d => d.value);
    
    // Add x-axis
    svg.append('g')
      .attr('transform', `translate(0, ${height - 60})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('transform', 'rotate(-45)')
      .attr('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em');
    
    // Add y-axis
    svg.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px');
  };
  
  const drawPieChart = (container: HTMLDivElement, width: number, height: number) => {
    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);
    
    const radius = Math.min(width, height) / 2 - 40;
    
    // Calculate total value
    const totalValue = data.reduce((sum, d) => sum + d.value, 0);
    
    // Set up pie chart
    const pie = d3.pie<ChartData>()
      .value(d => d.value)
      .sort(null);
    
    const arc = d3.arc<d3.PieArcDatum<ChartData>>()
      .innerRadius(0)
      .outerRadius(radius);
    
    const outerArc = d3.arc<d3.PieArcDatum<ChartData>>()
      .innerRadius(radius * 1.1)
      .outerRadius(radius * 1.1);
    
    // Draw pie slices
    const slices = svg.selectAll('.slice')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'slice');
    
    slices.append('path')
      .attr('d', arc)
      .attr('fill', (d, i) => d.data.color || getColorForIndex(i))
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 2)
      .attr('opacity', 0.8)
      .transition()
      .duration(800)
      .attrTween('d', function(d) {
        const interpolate = d3.interpolate({startAngle: 0, endAngle: 0}, d);
        return function(t) {
          return arc(interpolate(t));
        };
      });
    
    // Add hover effects
    slices.on('mouseover', function(event, d) {
      d3.select(this).select('path')
        .transition()
        .duration(200)
        .attr('opacity', 1)
        .attr('transform', 'scale(1.05)');
    })
    .on('mouseout', function(event, d) {
      d3.select(this).select('path')
        .transition()
        .duration(200)
        .attr('opacity', 0.8)
        .attr('transform', 'scale(1)');
    });
    
    // Add labels
    const labels = svg.selectAll('.label')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'label');
    
    labels.append('text')
      .attr('transform', d => {
        const pos = outerArc.centroid(d);
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        pos[0] = radius * 0.8 * (midAngle < Math.PI ? 1 : -1);
        return `translate(${pos})`;
      })
      .attr('text-anchor', d => {
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        return midAngle < Math.PI ? 'start' : 'end';
      })
      .attr('dy', '.35em')
      .attr('fill', 'white')
      .attr('font-size', '12px')
      .text(d => {
        const percentage = Math.round((d.data.value / totalValue) * 100);
        return `${d.data.name} (${percentage}%)`;
      })
      .style('opacity', 0)
      .transition()
      .duration(800)
      .delay((d, i) => 800 + i * 100)
      .style('opacity', 1);
    
    // Add polylines
    labels.append('polyline')
      .attr('points', d => {
        const pos = outerArc.centroid(d);
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        pos[0] = radius * 0.8 * (midAngle < Math.PI ? 1 : -1);
        return [arc.centroid(d), outerArc.centroid(d), pos];
      })
      .attr('stroke', 'white')
      .attr('stroke-width', 1)
      .attr('fill', 'none')
      .attr('opacity', 0.5)
      .style('opacity', 0)
      .transition()
      .duration(800)
      .delay((d, i) => 800 + i * 100)
      .style('opacity', 1);
    
    // Add center text
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0em')
      .attr('fill', 'white')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .text(`${totalValue}`);
    
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.5em')
      .attr('fill', '#94a3b8')
      .attr('font-size', '12px')
      .text('Total');
  };
  
  const drawLineChart = (container: HTMLDivElement, width: number, height: number) => {
    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(40, 20)`);
    
    // Set up scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([0, width - 80])
      .padding(0.3);
    
    const maxValue = Math.max(...data.map(d => d.value));
    const y = d3.scaleLinear()
      .domain([0, maxValue * 1.1])
      .range([height - 60, 0]);
    
    // Create line generator
    const line = d3.line<ChartData>()
      .x(d => x(d.name)! + x.bandwidth() / 2)
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);
    
    // Add gradient
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "line-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0)
      .attr("y1", y(0))
      .attr("x2", 0)
      .attr("y2", y(maxValue * 1.1));
      
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", colorPalette.primary)
      .attr("stop-opacity", 0.1);
      
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", colorPalette.primary)
      .attr("stop-opacity", 0.8);
    
    // Add area
    const area = d3.area<ChartData>()
      .x(d => x(d.name)! + x.bandwidth() / 2)
      .y0(height - 60)
      .y1(d => y(d.value))
      .curve(d3.curveMonotoneX);
    
    svg.append("path")
      .datum(data)
      .attr("fill", "url(#line-gradient)")
      .attr("d", area)
      .attr("opacity", 0)
      .transition()
      .duration(800)
      .attr("opacity", 0.3);
    
    // Draw line
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', colorPalette.primary)
      .attr('stroke-width', 3)
      .attr('d', line)
      .attr('opacity', 0)
      .attr('stroke-dasharray', function() { return this.getTotalLength(); })
      .attr('stroke-dashoffset', function() { return this.getTotalLength(); })
      .transition()
      .duration(1000)
      .attr('stroke-dashoffset', 0)
      .attr('opacity', 1);
    
    // Add dots
    svg.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(d.name)! + x.bandwidth() / 2)
      .attr('cy', d => y(d.value))
      .attr('r', 0)
      .attr('fill', colorPalette.primary)
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .transition()
      .duration(800)
      .delay((d, i) => 1000 + i * 100)
      .attr('r', 5);
    
    // Add hover effects
    svg.selectAll('.dot')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 8);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 5);
      });
    
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
      .attr('font-size', '12px')
      .text(d => d.value)
      .attr('opacity', 0)
      .transition()
      .duration(800)
      .delay((d, i) => 1200 + i * 100)
      .attr('opacity', 1);
    
    // Add x-axis
    svg.append('g')
      .attr('transform', `translate(0, ${height - 60})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px');
    
    // Add y-axis
    svg.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px');
  };
  
  const drawFunnelChart = (container: HTMLDivElement, width: number, height: number) => {
    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, 20)`);
    
    // Calculate max value for scaling
    const maxValue = Math.max(...data.map(d => d.value));
    
    // Calculate funnel dimensions
    const funnelWidth = width * 0.8;
    const stageHeight = (height - 40) / data.length;
    
    // Draw funnel segments
    data.forEach((stage, i) => {
      // Calculate width based on value
      const stageWidth = (stage.value / maxValue) * funnelWidth;
      
      // Get color from data or use color palette
      const color = stage.color || getColorForIndex(i);
      
      // Draw trapezoid
      svg.append('rect')
        .attr('x', -stageWidth / 2)
        .attr('y', i * stageHeight)
        .attr('width', 0)
        .attr('height', stageHeight * 0.8)
        .attr('fill', color)
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('opacity', 0.8)
        .transition()
        .duration(800)
        .delay(i * 100)
        .attr('width', stageWidth);
      
      // Add hover effects
      svg.selectAll('rect')
        .on('mouseover', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 1)
            .attr('transform', 'scale(1.02)');
        })
        .on('mouseout', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 0.8)
            .attr('transform', 'scale(1)');
        });
      
      // Add stage name
      svg.append('text')
        .attr('x', 0)
        .attr('y', i * stageHeight + stageHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', 'white')
        .attr('font-size', '12px')
        .attr('opacity', 0)
        .transition()
        .duration(800)
        .delay(i * 100 + 400)
        .attr('opacity', 1)
        .text(`${stage.name} (${stage.value})`);
    });
  };
  
  const draw3DChart = (container: HTMLDivElement, width: number, height: number) => {
    // Create a message indicating 3D chart would be rendered
    const message = document.createElement('div');
    message.style.width = `${width}px`;
    message.style.height = `${height}px`;
    message.style.display = 'flex';
    message.style.alignItems = 'center';
    message.style.justifyContent = 'center';
    message.style.color = '#94a3b8';
    message.style.fontSize = '14px';
    message.textContent = '3D Chart Visualization (WebGL)';
    
    container.appendChild(message);
    
    // In a real implementation, this would use Three.js to render a 3D chart
    // For demonstration purposes, we're just showing a placeholder
  };
  
  return (
    <div className={className}>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            {description && <p className="text-sm text-secondary-400 mt-1">{description}</p>}
          </div>
          {showControls && (
            <div className="flex items-center space-x-2">
              <div className="relative">
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
                        onClick={() => handleTypeChange('bar')}
                        className={`flex items-center space-x-2 w-full p-2 rounded-lg text-left text-sm ${
                          chartType === 'bar' ? 'bg-primary-600 text-white' : 'text-secondary-300 hover:bg-secondary-700'
                        }`}
                      >
                        <BarChart className="w-4 h-4" />
                        <span>Bar Chart</span>
                      </button>
                      <button 
                        onClick={() => handleTypeChange('pie')}
                        className={`flex items-center space-x-2 w-full p-2 rounded-lg text-left text-sm ${
                          chartType === 'pie' ? 'bg-primary-600 text-white' : 'text-secondary-300 hover:bg-secondary-700'
                        }`}
                      >
                        <PieChart className="w-4 h-4" />
                        <span>Pie Chart</span>
                      </button>
                      <button 
                        onClick={() => handleTypeChange('line')}
                        className={`flex items-center space-x-2 w-full p-2 rounded-lg text-left text-sm ${
                          chartType === 'line' ? 'bg-primary-600 text-white' : 'text-secondary-300 hover:bg-secondary-700'
                        }`}
                      >
                        <LineChart className="w-4 h-4" />
                        <span>Line Chart</span>
                      </button>
                      <button 
                        onClick={() => handleTypeChange('funnel')}
                        className={`flex items-center space-x-2 w-full p-2 rounded-lg text-left text-sm ${
                          chartType === 'funnel' ? 'bg-primary-600 text-white' : 'text-secondary-300 hover:bg-secondary-700'
                        }`}
                      >
                        <Target className="w-4 h-4" />
                        <span>Funnel Chart</span>
                      </button>
                      <button 
                        onClick={() => handleTypeChange('3d')}
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
            </div>
          )}
        </div>
      )}
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <RefreshCw className="w-8 h-8 text-primary-500 animate-spin mb-2" />
            <p className="text-secondary-400">Loading chart data...</p>
          </div>
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Target className="w-12 h-12 text-secondary-600 mx-auto mb-2" />
            <p className="text-secondary-400">No data available</p>
          </div>
        </div>
      ) : (
        <div ref={chartRef} style={{ height: `${height}px` }} className="transition-all duration-500"></div>
      )}
    </div>
  );
};

export default AnalyticsChart;