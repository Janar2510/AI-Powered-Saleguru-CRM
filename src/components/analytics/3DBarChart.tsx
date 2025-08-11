import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import Card from '../ui/Card';

interface Bar3DProps {
  data: Array<{ name: string; value: number; color?: string }>;
  title: string;
  height?: number;
  className?: string;
}

const Bar3DChart: React.FC<Bar3DProps> = ({
  data,
  title,
  height = 400,
  className = ''
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  // Vibrant 3D color palette
  const vibrantColors = [
    '#FF6B6B', // Coral Red
    '#4ECDC4', // Turquoise
    '#45B7D1', // Sky Blue
    '#96CEB4', // Mint Green
    '#FFEAA7', // Golden Yellow
    '#DDA0DD', // Plum
    '#98D8C8', // Seafoam
    '#F7DC6F', // Sunflower
    '#BB8FCE', // Lavender
    '#85C1E9', // Light Blue
  ];

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return;

    // Clear previous chart
    d3.select(chartRef.current).selectAll('*').remove();

    const margin = { top: 30, right: 40, bottom: 60, left: 80 };
    const width = chartRef.current.clientWidth - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3.select(chartRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add gradient definitions for 3D effects
    const defs = svg.append('defs');
    
    // Create 3D gradients for each bar
    data.forEach((d, i) => {
      const color = d.color || vibrantColors[i % vibrantColors.length];
      
      // Main gradient
      const mainGradient = defs.append('linearGradient')
        .attr('id', `main-gradient-${i}`)
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%');

      mainGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', d3.color(color)?.darker(0.3).toString() || color);

      mainGradient.append('stop')
        .attr('offset', '50%')
        .attr('stop-color', color);

      mainGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', d3.color(color)?.brighter(0.3).toString() || color);

      // Top face gradient
      const topGradient = defs.append('linearGradient')
        .attr('id', `top-gradient-${i}`)
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%');

      topGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', d3.color(color)?.brighter(0.5).toString() || color);

      topGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', d3.color(color)?.brighter(0.2).toString() || color);

      // Side face gradient
      const sideGradient = defs.append('linearGradient')
        .attr('id', `side-gradient-${i}`)
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');

      sideGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', d3.color(color)?.darker(0.5).toString() || color);

      sideGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', d3.color(color)?.darker(0.2).toString() || color);
    });

    // Scales
    const x = d3.scaleBand()
      .range([0, width])
      .domain(data.map(d => d.name))
      .padding(0.4);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) || 0])
      .range([chartHeight, 0]);

    // 3D depth
    const depth = 20;

    // Add subtle grid lines
    svg.selectAll('.grid-line')
      .data(y.ticks(5))
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', d => y(d))
      .attr('y2', d => y(d))
      .attr('stroke', '#374151')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.2);

    // Create 3D bars
    data.forEach((d, i) => {
      const barGroup = svg.append('g')
        .attr('class', 'bar-3d')
        .attr('transform', `translate(${x(d.name)!}, 0)`);

      const barWidth = x.bandwidth();
      const barHeight = chartHeight - y(d.value);

      // Main face (front)
      barGroup.append('rect')
        .attr('x', 0)
        .attr('y', y(d.value))
        .attr('width', barWidth)
        .attr('height', 0)
        .attr('fill', `url(#main-gradient-${i})`)
        .attr('rx', 3)
        .attr('ry', 3)
        .style('filter', 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))')
        .transition()
        .duration(800)
        .delay(i * 100)
        .attr('height', barHeight);

      // Top face
      barGroup.append('rect')
        .attr('x', 0)
        .attr('y', y(d.value))
        .attr('width', barWidth)
        .attr('height', 0)
        .attr('fill', `url(#top-gradient-${i})`)
        .attr('rx', 3)
        .attr('ry', 3)
        .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))')
        .transition()
        .duration(800)
        .delay(i * 100)
        .attr('height', depth)
        .attr('transform', `translate(0, -${depth})`);

      // Side face
      barGroup.append('rect')
        .attr('x', barWidth)
        .attr('y', y(d.value))
        .attr('width', 0)
        .attr('height', barHeight)
        .attr('fill', `url(#side-gradient-${i})`)
        .attr('rx', 3)
        .attr('ry', 3)
        .style('filter', 'drop-shadow(2px 0 4px rgba(0,0,0,0.2))')
        .transition()
        .duration(800)
        .delay(i * 100)
        .attr('width', depth);

      // Add value label
      barGroup.append('text')
        .attr('x', barWidth / 2)
        .attr('y', y(d.value) - 15)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-weight', 'bold')
        .attr('font-size', '12px')
        .style('text-shadow', '0 2px 4px rgba(0,0,0,0.7)')
        .style('opacity', 0)
        .text(d.value.toLocaleString())
        .transition()
        .duration(800)
        .delay(i * 100 + 400)
        .style('opacity', 1);

      // Add hover effects
      barGroup.on('mouseover', function() {
        d3.select(this).selectAll('rect')
          .transition()
          .duration(200)
          .style('filter', 'drop-shadow(0 8px 16px rgba(0,0,0,0.4)) brightness(1.1)');
      })
      .on('mouseout', function() {
        d3.select(this).selectAll('rect')
          .transition()
          .duration(200)
          .style('filter', 'drop-shadow(0 4px 8px rgba(0,0,0,0.3)) brightness(1)');
      });
    });

    // X-axis with enhanced styling
    svg.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('fill', '#9CA3AF')
      .attr('font-size', '12px')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    // Y-axis with enhanced styling
    svg.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .attr('fill', '#9CA3AF')
      .attr('font-size', '12px');

    // Add axis labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', chartHeight + margin.bottom - 10)
      .attr('text-anchor', 'middle')
      .attr('fill', '#9CA3AF')
      .attr('font-size', '14px')
      .text('Categories');

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -chartHeight / 2)
      .attr('y', -margin.left + 20)
      .attr('text-anchor', 'middle')
      .attr('fill', '#9CA3AF')
      .attr('font-size', '14px')
      .text('Values');

  }, [data, height]);

  return (
    <Card className={`bg-white/10 backdrop-blur-md border border-primary-700/20 shadow-xl ${className}`}>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div 
          ref={chartRef} 
          className="w-full"
          style={{ height: `${height}px` }}
        />
      </div>
    </Card>
  );
};

export default Bar3DChart;