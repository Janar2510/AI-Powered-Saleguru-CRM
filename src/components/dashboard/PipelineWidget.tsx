import React, { useState, useEffect, useRef } from 'react';
import { Target, ArrowRight, Settings } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import Dropdown from '../ui/Dropdown';
import { useNavigate } from 'react-router-dom';
import * as d3 from 'd3';
import { supabase } from '../../services/supabase';

interface PipelineWidgetProps {
  stages?: {id: string, name: string, count: number, value: number}[];
  totalValue?: number;
  loading?: boolean;
}

const shimmerClass =
  'animate-pulse bg-gradient-to-r from-secondary-700/60 via-secondary-600/40 to-secondary-700/60';

const chartTypes = [
  { label: 'Funnel', value: 'funnel' },
  { label: 'Bar', value: 'bar' },
  { label: 'Donut', value: 'donut' },
];

const PipelineWidget: React.FC<PipelineWidgetProps> = ({ loading, ...props }) => {
  const navigate = useNavigate();
  const chartRef = useRef<HTMLDivElement>(null);
  const [stages, setStages] = useState(props.stages || []);
  const [totalValue, setTotalValue] = useState(props.totalValue || 0);
  const [isLoading, setIsLoading] = useState(!props.stages);
  const [pulse, setPulse] = useState(false);
  const [chartType, setChartType] = useState<'funnel' | 'bar' | 'donut'>('funnel');
  const [tickerIndex, setTickerIndex] = useState(0);
  const tickerInterval = useRef<NodeJS.Timeout | null>(null);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  
  // Animated number helper
  const AnimatedNumber = ({ value }: { value: number }) => {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
      let start = display;
      let end = value;
      if (start === end) return;
      let step = (end - start) / 20;
      let current = start;
      let frame = 0;
      const animate = () => {
        frame++;
        current += step;
        if ((step > 0 && current >= end) || (step < 0 && current <= end) || frame > 20) {
          setDisplay(end);
        } else {
          setDisplay(Math.round(current));
          requestAnimationFrame(animate);
        }
      };
      animate();
      // eslint-disable-next-line
    }, [value]);
    return <span>{display.toLocaleString()}</span>;
  };

  // Pulse effect when new data arrives
  useEffect(() => {
    if (!isLoading && stages.length > 0) {
      setPulse(true);
      const timeout = setTimeout(() => setPulse(false), 1200);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [isLoading, stages]);

  // Fetch pipeline data if not provided as props
  useEffect(() => {
    if (props.stages) return;
    
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
  }, [props.stages, props.totalValue]);
  
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
  
  // Simulate recent pipeline events (replace with real events if available)
  useEffect(() => {
    if (!stages || stages.length === 0) return;
    // Example: last 5 events (could be new deal, stage change, win/loss)
    const now = new Date();
    setRecentEvents([
      { id: 1, type: 'won', label: 'Deal Closed Won', value: 50000, time: new Date(now.getTime() - 1000 * 60 * 5) },
      { id: 2, type: 'new', label: 'New Deal Added', value: 20000, time: new Date(now.getTime() - 1000 * 60 * 15) },
      { id: 3, type: 'stage', label: 'Deal Moved to Proposal', value: 30000, time: new Date(now.getTime() - 1000 * 60 * 30) },
      { id: 4, type: 'lost', label: 'Deal Lost', value: 10000, time: new Date(now.getTime() - 1000 * 60 * 60) },
      { id: 5, type: 'won', label: 'Deal Closed Won', value: 75000, time: new Date(now.getTime() - 1000 * 60 * 90) },
    ]);
  }, [stages]);

  // Ticker logic for events
  useEffect(() => {
    if (recentEvents.length > 2) {
      tickerInterval.current = setInterval(() => {
        setTickerIndex((prev) => (prev + 1) % recentEvents.length);
      }, 3500);
      return () => {
        if (tickerInterval.current) clearInterval(tickerInterval.current);
      };
    } else {
      setTickerIndex(0);
      if (tickerInterval.current) clearInterval(tickerInterval.current);
    }
    return undefined;
  }, [recentEvents]);

  // Conversion rate, win/loss stats
  const totalDeals = stages.reduce((sum, s) => sum + s.count, 0);
  const wonStage = stages.find(s => s.id === 'closed-won');
  const lostStage = stages.find(s => s.id === 'closed-lost');
  const wonDeals = wonStage ? wonStage.count : 0;
  const lostDeals = lostStage ? lostStage.count : 0;
  const conversionRate = totalDeals > 0 ? Math.round((wonDeals / totalDeals) * 100) : 0;

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-[#23233a]/50 rounded w-1/3"></div>
          <div className="h-4 bg-[#23233a]/50 rounded w-1/2"></div>
          <div className="h-32 bg-[#23233a]/50 rounded"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 bg-[#23233a]/50 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-[#a259ff]" />
          <h3 className="text-lg font-semibold text-white">Pipeline Overview</h3>
          <Badge variant="secondary" size="sm">
            <AnimatedNumber value={totalDeals} /> Deals
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" size="sm">
            $<AnimatedNumber value={totalValue} />
          </Badge>
          {/* Chart type toggle */}
          <Dropdown
            options={chartTypes}
            value={chartType}
            onChange={(value) => setChartType(value as 'funnel' | 'bar' | 'donut')}
            className="w-24 ml-2"
          />
          <Button 
            onClick={() => navigate('/deals')}
            variant="secondary"
            size="sm"
            icon={ArrowRight}
            className="ml-2"
          />
          <button
            className="p-2 rounded-full hover:bg-[#23233a]/50 transition relative group ml-2"
            disabled
          >
            <Settings className="w-5 h-5 text-[#b0b0d0]" />
            <span className="absolute right-0 top-8 text-xs bg-[#23233a]/80 text-[#b0b0d0] px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity">Customize (coming soon)</span>
          </button>
        </div>
      </div>
      {/* Animated stats row */}
      <div className="flex items-center space-x-4 mb-2">
        <div className="flex items-center space-x-1">
          <span className="text-[#43e7ad] font-bold text-sm">Win Rate:</span>
          <span className="text-white font-semibold text-sm"><AnimatedNumber value={conversionRate} />%</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-[#43e7ad] font-bold text-sm">Won:</span>
          <span className="text-white font-semibold text-sm"><AnimatedNumber value={wonDeals} /></span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-[#ef4444] font-bold text-sm">Lost:</span>
          <span className="text-white font-semibold text-sm"><AnimatedNumber value={lostDeals} /></span>
        </div>
      </div>
      {isLoading ? (
        <div className={`flex items-center justify-center h-40 rounded-xl ${shimmerClass}`}></div>
      ) : (
        <div ref={chartRef} className="h-40"></div>
      )}
      {/* Mini live-feed/ticker */}
      <div className="mt-4">
        {recentEvents.length > 0 && (
          <div className="overflow-hidden h-12">
            <div className="transition-transform duration-700" style={{ transform: `translateY(-${tickerIndex * 48}px)` }}>
              {recentEvents.map((event, idx) => (
                <div key={event.id} className={`flex items-center space-x-3 px-2 py-2 rounded-lg mb-1 bg-[#23233a]/30 ${idx === tickerIndex ? 'animate-pulse border-l-4 border-[#a259ff]' : ''}`} style={{ minHeight: 48 }}>
                  <span className={`w-2 h-2 rounded-full ${event.type === 'won' ? 'bg-[#43e7ad]' : event.type === 'lost' ? 'bg-[#ef4444]' : 'bg-[#a259ff]'}`}></span>
                  <span className="text-white text-sm font-medium">{event.label}</span>
                  <span className="text-[#b0b0d0] text-xs ml-auto">${event.value.toLocaleString()} • {event.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PipelineWidget;