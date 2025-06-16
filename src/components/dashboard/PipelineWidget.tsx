import React, { useState, useEffect, useRef } from 'react';
import { Target, ArrowRight } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { useNavigate } from 'react-router-dom';
import * as d3 from 'd3';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface PipelineWidgetProps {
  stages?: {id: string, name: string, count: number, value: number}[];
  totalValue?: number;
}

const PipelineWidget: React.FC<PipelineWidgetProps> = ({ 
  stages: propStages, 
  totalValue: propTotalValue 
}) => {
  const navigate = useNavigate();
  const chartRef = useRef<HTMLDivElement>(null);
  const [stages, setStages] = useState(propStages || []);
  const [totalValue, setTotalValue] = useState(propTotalValue || 0);
  const [isLoading, setIsLoading] = useState(!propStages);
  
  // Fetch pipeline data if not provided as props
  useEffect(() => {
    if (propStages) return;
    
    const fetchPipelineData = async () => {
      setIsLoading(true);
      try {
        // Fetch stages
        const { data: stagesData, error: stagesError } = await supabase
          .from('stages')
          .select('*')
          .order('sort_order');
        
        if (stagesError) throw stagesError;
        
        // Fetch deals
        const { data: dealsData, error: dealsError } = await supabase
          .from('deals')
          .select('*');
        
        if (dealsError) throw dealsError;
        
        // Calculate deals by stage
        const stagesList = stagesData || [];
        const dealsList = dealsData || [];
        
        const dealsByStage = stagesList.map(stage => {
          const stageDeals = dealsList.filter(deal => deal.stage_id === stage.id);
          return {
            id: stage.id,
            name: stage.name,
            count: stageDeals.length,
            value: stageDeals.reduce((sum, deal) => sum + (deal.value || 0), 0)
          };
        });
        
        const total = dealsList.reduce((sum, deal) => sum + (deal.value || 0), 0);
        
        setStages(dealsByStage);
        setTotalValue(total);
      } catch (error) {
        console.error('Error fetching pipeline data:', error);
        
        // Fallback to sample data
        const sampleStages = [
          { id: 'lead', name: 'Lead', count: 3, value: 75000 },
          { id: 'qualified', name: 'Qualified', count: 2, value: 50000 },
          { id: 'proposal', name: 'Proposal', count: 2, value: 100000 },
          { id: 'negotiation', name: 'Negotiation', count: 1, value: 45000 },
          { id: 'closed-won', name: 'Closed Won', count: 0, value: 0 }
        ];
        
        setStages(sampleStages);
        setTotalValue(sampleStages.reduce((sum, stage) => sum + stage.value, 0));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPipelineData();
  }, [propStages, propTotalValue]);
  
  // CRM color palette from the screenshot
  const colorPalette = {
    lead: '#6b7280',         // Gray
    qualified: '#3b82f6',    // Blue
    proposal: '#eab308',     // Yellow
    negotiation: '#f97316',  // Orange
    'closed-won': '#22c55e', // Green
    'closed-lost': '#ef4444',// Red
    default: '#7c3aed'       // Purple (primary)
  };
  
  useEffect(() => {
    if (chartRef.current && stages.length > 0 && !isLoading) {
      drawChart();
    }
  }, [stages, totalValue, isLoading]);
  
  const drawChart = () => {
    if (!chartRef.current) return;
    
    // Clear previous chart
    d3.select(chartRef.current).selectAll('*').remove();
    
    const container = chartRef.current;
    const width = container.clientWidth;
    const height = 150;
    
    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(0, 20)`);
    
    // Filter out stages with 0 deals
    const activeStages = stages.filter(stage => stage.count > 0);
    
    if (activeStages.length === 0) {
      // No data to display
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#94a3b8')
        .text('No deals in pipeline');
      return;
    }
    
    // Calculate funnel dimensions
    const funnelWidth = width;
    const stageHeight = 25;
    const stageGap = 10;
    const totalHeight = activeStages.length * stageHeight + (activeStages.length - 1) * stageGap;
    
    // Calculate max count for scaling
    const maxCount = Math.max(...activeStages.map(d => d.count));
    
    // Draw funnel segments
    activeStages.forEach((stage, i) => {
      // Calculate width based on count
      const stageWidth = (stage.count / maxCount) * (funnelWidth - 150);
      
      // Determine color based on stage
      const color = colorPalette[stage.id as keyof typeof colorPalette] || colorPalette.default;
      
      // Draw rectangle
      svg.append('rect')
        .attr('x', 0)
        .attr('y', i * (stageHeight + stageGap))
        .attr('width', 0)
        .attr('height', stageHeight)
        .attr('fill', color)
        .attr('opacity', 0.8)
        .attr('rx', 4)
        .attr('ry', 4)
        .transition()
        .duration(800)
        .delay(i * 100)
        .attr('width', stageWidth);
      
      // Add stage name
      svg.append('text')
        .attr('x', 10)
        .attr('y', i * (stageHeight + stageGap) + stageHeight / 2 + 5)
        .attr('fill', 'white')
        .attr('font-size', '12px')
        .text(stage.name);
      
      // Add count and value
      svg.append('text')
        .attr('x', stageWidth + 10)
        .attr('y', i * (stageHeight + stageGap) + stageHeight / 2 + 5)
        .attr('fill', '#94a3b8')
        .attr('font-size', '12px')
        .text(`${stage.count} ($${(stage.value / 1000).toFixed(0)}K)`);
    });
    
    // Add total value
    svg.append('text')
      .attr('x', width - 10)
      .attr('y', totalHeight + 20)
      .attr('text-anchor', 'end')
      .attr('fill', '#94a3b8')
      .attr('font-size', '12px')
      .text(`Total: $${(totalValue / 1000).toFixed(0)}K`);
  };
  
  return (
    <Card className="bg-white/10 backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-white">Pipeline Overview</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" size="sm">
            {isLoading ? '...' : stages.reduce((sum, stage) => sum + stage.count, 0)} Deals
          </Badge>
          <button 
            onClick={() => navigate('/deals')}
            className="text-primary-400 hover:text-primary-300"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div ref={chartRef} className="h-40"></div>
      )}
    </Card>
  );
};

export default PipelineWidget;