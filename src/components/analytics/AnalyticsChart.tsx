import React, { useEffect, useRef, useState } from 'react';
import { BarChart, PieChart, LineChart, Target, RefreshCw, Settings, ChevronDown } from 'lucide-react';
import * as d3 from 'd3';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useResizeObserver } from '../../hooks/useResizeObserver';
import { BRAND } from '../../constants/theme';
import ChartLegend from './ChartLegend';

interface ChartData {
  id: string;
  name: string;
  value: number;
  color?: string;
}

interface AreaSeries {
  name: string;
  color: string;
  values: number[];
}

interface AnalyticsChartProps {
  title?: string;
  description?: string;
  data: ChartData[] | AreaSeries[];
  type: 'bar' | 'pie' | 'line' | 'funnel' | '3d' | 'area';
  height?: number;
  className?: string;
  isLoading?: boolean;
  showControls?: boolean;
  disableCardStyling?: boolean;
  onTypeChange?: (type: 'bar' | 'pie' | 'line' | 'funnel' | '3d' | 'area') => void;
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
  disableCardStyling = false,
  onTypeChange
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartType, setChartType] = useState(type);
  const [showSettings, setShowSettings] = useState(false);
  const dimensions = useResizeObserver(chartRef);
  
  // Vibrant color palette inspired by modern dashboards
  const brandColors = BRAND.CHART_COLORS;
  const brandGradients = BRAND.CHART_GRADIENTS;
  
  // Color palette object for compatibility
  const colorPalette = {
    primary: BRAND.COLORS.primary,
    secondary: BRAND.COLORS.secondary,
    accent: BRAND.COLORS.info,
    success: BRAND.COLORS.success,
    warning: BRAND.COLORS.warning,
    error: BRAND.COLORS.error,
    info: BRAND.COLORS.info,
    ...brandColors.reduce((acc, color, index) => {
      acc[`color${index + 1}`] = color;
      return acc;
    }, {} as Record<string, string>)
  };
  
  // Update chart type when prop changes
  useEffect(() => {
    setChartType(type);
  }, [type]);
  
  // Draw chart when data, dimensions, or chart type changes
  useEffect(() => {
    if (chartRef.current && data.length > 0 && !isLoading && dimensions) {
      d3.select(chartRef.current).selectAll('*').remove(); // Always clear before drawing
      drawChart();
    }
    return () => {
      if (chartRef.current) {
        d3.select(chartRef.current).selectAll('*').remove();
      }
    };
  }, [data, chartType, isLoading, dimensions]);
  
  const handleTypeChange = (newType: 'bar' | 'pie' | 'line' | 'funnel' | '3d' | 'area') => {
    setChartType(newType);
    if (onTypeChange) {
      onTypeChange(newType);
    }
  };
  
  const isAreaChart = chartType === 'area';
  const chartDataToUse: ChartData[] = React.useMemo(() => {
    return !isAreaChart ? (data as ChartData[]) : [];
  }, [data, isAreaChart]);
  const areaSeriesToUse: AreaSeries[] = React.useMemo(() => {
    if (!isAreaChart) return [];
    if (isAreaSeriesArray(data)) {
      return data as AreaSeries[];
    } else {
      const single = data as ChartData[];
      return single.map((d: ChartData, i: number) => ({
        name: d.name,
        color: brandColors[i % brandColors.length],
        values: [d.value],
      }));
    }
  }, [data, isAreaChart, brandColors]);

  const drawChart = () => {
    if (!chartRef.current || !dimensions) return;
    
    const container = chartRef.current;
    const width = dimensions.width;
    
    if (chartType === 'bar') {
      drawBarChart(container, width, height, chartDataToUse);
    } else if (chartType === 'pie') {
      drawPieChart(container, width, height, chartDataToUse);
    } else if (chartType === 'line') {
      drawLineChart(container, width, height, chartDataToUse);
    } else if (chartType === 'funnel') {
      drawFunnelChart(container, width, height, chartDataToUse);
    } else if (chartType === '3d') {
      draw3DChart(container, width, height);
    } else if (chartType === 'area') {
      drawAreaChart(container, width, height, areaSeriesToUse);
    }
  };
  
  const getColorForIndex = (index: number, defaultColor?: string) => {
    if (defaultColor) return defaultColor;
    return brandColors[index % brandColors.length];
  };
  
  const drawBarChart = (container: HTMLDivElement, width: number, height: number, data: ChartData[]) => {
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
    
    // Add gradient definitions for 3D effects
    const defs = svg.append('defs');
    
    // Create gradients for each data point
    data.forEach((d, i) => {
      const grad = brandGradients[i % brandGradients.length];
      // Create a unique gradient for each bar
      const gradId = `gradient-bar-${i}`;
      const svgDefs = d3.select(container).select('svg').select('defs');
      if (svgDefs.empty()) {
        d3.select(container).select('svg').append('defs');
      }
      const gradient = d3.select(container).select('svg').select('defs')
        .append('linearGradient')
        .attr('id', gradId)
        .attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
      gradient.append('stop').attr('offset', '0%').attr('stop-color', grad[0]);
      gradient.append('stop').attr('offset', '100%').attr('stop-color', grad[1]);
    });
    
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
      .attr('fill', (d, i) => getColorForIndex(i))
      .attr('rx', 4)
      .attr('ry', 4)
      .style('filter', 'drop-shadow(0 4px 16px #a259ff66)')
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
    svg.selectAll('.bar-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('x', d => x(d.name)! + x.bandwidth() / 2)
      .attr('y', d => y(d.value) - 10)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-weight', 'bold')
      .attr('font-size', '12px')
      .style('text-shadow', '0 1px 2px rgba(0,0,0,0.5)')
      .text(d => d.value.toLocaleString());
    
    // Add x-axis
    svg.append('g')
      .attr('transform', `translate(0, ${height - 60})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('transform', 'rotate(-30)')
      .attr('text-anchor', 'end')
      .attr('dx', '-.6em')
      .attr('dy', '.15em')
      .style('font-family', 'Inter, sans-serif');
    
    // Add y-axis
    svg.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px');
  };
  
  const drawPieChart = (container: HTMLDivElement, width: number, height: number, data: ChartData[]) => {
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
      .attr('fill', (d, i) => getColorForIndex(i))
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 2)
      .attr('opacity', 0.8)
      .transition()
      .duration(800)
      .attrTween('d', function(d) {
        const interpolate = d3.interpolate({startAngle: 0, endAngle: 0}, d);
        return function(t) {
          const path = arc(interpolate(t));
          return path || '';
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
        const pointsArr = [arc.centroid(d), outerArc.centroid(d), pos];
        return pointsArr.map(p => p.join(',')).join(' ');
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
  
  const drawLineChart = (container: HTMLDivElement, width: number, height: number, data: ChartData[]) => {
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
  
  const drawFunnelChart = (container: HTMLDivElement, width: number, height: number, data: ChartData[]) => {
    if (!data || data.length === 0) return;
    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, 20)`);

    // Calculate max value for scaling
    const maxValue = Math.max(...data.map(d => d.value));
    const safeMaxValue = isNaN(maxValue) || maxValue === 0 ? 1 : maxValue;

    // Calculate funnel dimensions
    const funnelWidth = width * 0.8;
    const stageHeight = (height - 40) / data.length;

    // Draw funnel segments
    data.forEach((stage, i) => {
      // Calculate width based on value
      const stageWidth = (stage.value / safeMaxValue) * funnelWidth;
      if (!isFinite(stageWidth) || isNaN(stageWidth)) return;
      // Get color from data or use color palette
      const color = stage.color || getColorForIndex(i);
      
      // Draw trapezoid
      svg.append('rect')
        .attr('x', -stageWidth / 2)
        .attr('y', i * stageHeight)
        .attr('width', stageWidth)
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

  function isAreaSeriesArray(data: any[]): data is AreaSeries[] {
    return data.length > 0 && typeof data[0] === 'object' && 'values' in data[0];
  }

  const drawAreaChart = (container: HTMLDivElement, width: number, height: number, data: AreaSeries[]) => {
    // Use string categories for x-axis
    const categories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height);
    const margin = { top: 30, right: 30, bottom: 40, left: 50 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    const x = d3.scalePoint()
      .domain(categories)
      .range([0, chartWidth]);
    const maxY = d3.max(data.flatMap(s => s.values)) || 60;
    const y = d3.scaleLinear()
      .domain([0, maxY])
      .range([chartHeight, 0]);
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    // Draw grid
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y).ticks(6).tickSize(-chartWidth))
      .selectAll('line')
      .attr('stroke', '#333')
      .attr('stroke-opacity', 0.2);
    // Draw areas and lines
    data.forEach((s, i) => {
      const color = brandColors[i % brandColors.length];
      // Area gradient
      const gradId = `area-gradient-${i}`;
      const defs = svg.append('defs');
      const grad = defs.append('linearGradient')
        .attr('id', gradId)
        .attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
      grad.append('stop').attr('offset', '0%').attr('stop-color', color).attr('stop-opacity', 0.7);
      grad.append('stop').attr('offset', '100%').attr('stop-color', color).attr('stop-opacity', 0.2);
      // Area
      const area = d3.area<number>()
        .x((d, j) => x(categories[j])!)
        .y0(chartHeight)
        .y1((d) => y(d))
        .curve(d3.curveMonotoneX);
      g.append('path')
        .datum(s.values)
        .attr('fill', `url(#${gradId})`)
        .attr('d', area)
        .attr('opacity', 0.8);
      // Line
      const line = d3.line<number>()
        .x((d, j) => x(categories[j])!)
        .y((d) => y(d))
        .curve(d3.curveMonotoneX);
      g.append('path')
        .datum(s.values)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2.5)
        .attr('filter', 'drop-shadow(0 0 8px #fff8)')
        .attr('d', line);
      // Dots
      g.selectAll(`.dot-${i}`)
        .data(s.values)
        .enter()
        .append('circle')
        .attr('class', `dot-${i}`)
        .attr('cx', (d, j) => x(categories[j])!)
        .attr('cy', (d) => y(d))
        .attr('r', 4)
        .attr('fill', color)
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)
        .attr('filter', 'drop-shadow(0 0 6px #fff8)');
    });
    // X axis
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '12px');
    // Y axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(6))
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '12px');
  };
  
  return (
    <div className={`${disableCardStyling ? '' : `${BRAND.DASHBOARD_LAYOUT.cardPadding} ${BRAND.DASHBOARD_LAYOUT.cardRadius} ${BRAND.DASHBOARD_LAYOUT.cardBorder} ${BRAND.DASHBOARD_LAYOUT.cardBg} ${BRAND.DASHBOARD_LAYOUT.cardShadow}`} ${className}`}>
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
                        onClick={() => handleTypeChange('area')}
                        className={`flex items-center space-x-2 w-full p-2 rounded-lg text-left text-sm ${
                          chartType === 'area' ? 'bg-primary-600 text-white' : 'text-secondary-300 hover:bg-secondary-700'
                        }`}
                      >
                        <LineChart className="w-4 h-4" />
                        <span>Area Chart</span>
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
        <>
          <div ref={chartRef} style={{ height: `${height}px` }} className="transition-all duration-500"></div>
          {chartType === 'bar' && (
            <ChartLegend
              items={(data as ChartData[]).map((d, i) => ({
                id: d.id,
                name: d.name,
                color: brandColors[i % brandColors.length],
                value: d.value,
              }))}
              className="mt-4"
              showValues={true}
              orientation="horizontal"
            />
          )}
          {chartType === 'area' && (
            <ChartLegend
              items={areaSeriesToUse.map((s: AreaSeries, i: number) => ({
                id: s.name,
                name: s.name,
                color: brandColors[i % brandColors.length],
                value: s.values[0],
              }))}
              className="mt-4"
              showValues={true}
              orientation="horizontal"
            />
          )}
        </>
      )}
    </div>
  );
};

export default AnalyticsChart;