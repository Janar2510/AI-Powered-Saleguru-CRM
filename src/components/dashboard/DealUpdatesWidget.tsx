import React, { useEffect, useRef, useState } from 'react';
import { TrendingUp, Target, ChevronRight, Settings } from 'lucide-react';
import { Card } from '../ui/Card';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface Deal {
  id: string;
  title: string;
  company?: string;
  value: number;
  stage_id: string | number; // Updated to handle both string and numeric stage IDs
  stage_name?: string; // Added stage_name field
  contact: string;
  updated_at: string;
}

interface DealUpdatesWidgetProps {
  recentlyUpdated: Deal[];
  loading?: boolean;
}

const shimmerClass =
  'animate-pulse bg-gradient-to-r from-secondary-700/60 via-secondary-600/40 to-secondary-700/60';

const DealUpdatesWidget: React.FC<DealUpdatesWidgetProps> = ({ loading, recentlyUpdated }) => {
  const navigate = useNavigate();
  const [tickerIndex, setTickerIndex] = useState(0);
  const tickerInterval = useRef<NodeJS.Timeout | null>(null);
  const [pulseId, setPulseId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-[#23233a]/50 rounded w-1/3"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-[#23233a]/50 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Ticker logic for >3 updates
  useEffect(() => {
    if (recentlyUpdated.length > 3) {
      tickerInterval.current = setInterval(() => {
        setTickerIndex((prev) => (prev + 1) % recentlyUpdated.length);
      }, 3500);
      return () => {
        if (tickerInterval.current) clearInterval(tickerInterval.current);
      };
    } else {
      setTickerIndex(0);
      if (tickerInterval.current) clearInterval(tickerInterval.current);
    }
    return undefined;
  }, [recentlyUpdated]);

  // Pulse animation for new updates (simulate on mount)
  useEffect(() => {
    if (recentlyUpdated.length > 0) {
      setPulseId(recentlyUpdated[0].id);
      const timeout = setTimeout(() => setPulseId(null), 1200);
      return () => {
        clearTimeout(timeout);
      };
    }
    return undefined;
  }, [recentlyUpdated]);

  // Helper: format stage name - handle both string and numeric stage IDs
  const formatStage = (stage: string | number) => {
    // Convert to string if it's a number
    const stageStr = String(stage);
    
    // If it's a numeric ID, return a generic stage name
    if (!isNaN(Number(stageStr))) {
      return 'Active Stage';
    }
    
    // Otherwise, format the string stage name
    return stageStr.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Helper: animated number (simple, for now)
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

  // Render ticker or static list
  const renderUpdates = () => {
    if (recentlyUpdated.length === 0) return null;
    if (recentlyUpdated.length > 3) {
      // Ticker: show 3 at a time, auto-scroll
      const items = [];
      for (let i = 0; i < 3; i++) {
        const idx = (tickerIndex + i) % recentlyUpdated.length;
        const deal = recentlyUpdated[idx];
        items.push(
          <div
            key={deal.id}
            className={`flex items-center justify-between p-3 bg-[#23233a]/30 backdrop-blur-sm rounded-lg mb-2 hover:bg-[#23233a]/50 transition-colors ${pulseId === deal.id ? 'animate-pulse border-l-4 border-[#a259ff]' : ''}`}
            style={{ minHeight: 64 }}
          >
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-5 h-5 text-[#a259ff] animate-bounce" />
              <div>
                <h4 className="font-medium text-white">{deal.title}</h4>
                <p className="text-sm text-[#b0b0d0]">{deal.stage_name || formatStage(deal.stage_id)}</p>
                <p className="text-xs text-[#b0b0d0]">{deal.contact} • {new Date(deal.updated_at).toLocaleString()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-[#a259ff]">
                $<AnimatedNumber value={deal.value} />
              </p>
              <Button 
                onClick={() => navigate('/deals')}
                variant="gradient"
                size="sm"
              >
                View Deal
              </Button>
            </div>
          </div>
        );
      }
      return (
        <div className="overflow-hidden" style={{ height: 210 }}>
          <div className="transition-transform duration-700" style={{ transform: `translateY(-${tickerIndex * 72}px)` }}>
            {items}
          </div>
        </div>
      );
    } else {
      // Static list
      return recentlyUpdated.map((deal) => (
        <div
          key={deal.id}
          className={`flex items-center justify-between p-3 bg-[#23233a]/30 backdrop-blur-sm rounded-lg hover:bg-[#23233a]/50 transition-colors ${pulseId === deal.id ? 'animate-pulse border-l-4 border-[#a259ff]' : ''}`}
          style={{ minHeight: 64 }}
        >
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-5 h-5 text-[#a259ff]" />
            <div>
              <h4 className="font-medium text-white">{deal.title}</h4>
              <p className="text-sm text-[#b0b0d0]">{deal.stage_name || formatStage(deal.stage_id)}</p>
              <p className="text-xs text-[#b0b0d0]">{deal.contact} • {new Date(deal.updated_at).toLocaleString()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-[#a259ff]">
              $<AnimatedNumber value={deal.value} />
            </p>
            <Button 
              onClick={() => navigate('/deals')}
              variant="gradient"
              size="sm"
            >
              View Deal
            </Button>
          </div>
        </div>
      ));
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-white">Deal Updates</h3>
          <Badge variant="secondary" size="sm">
            {recentlyUpdated.length} Updates
          </Badge>
        </div>
        <button
          className="p-2 rounded-full hover:bg-[#23233a]/50 transition relative group"
          disabled
        >
          <Settings className="w-5 h-5 text-[#b0b0d0]" />
          <span className="absolute right-0 top-8 text-xs bg-[#23233a]/80 text-[#b0b0d0] px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity">Customize (coming soon)</span>
        </button>
      </div>
      <div className="space-y-4 min-h-[220px] flex-1">
        {recentlyUpdated.length === 0 ? (
          <div className="text-center py-8 rounded-xl bg-[#23233a]/30" style={{ minHeight: 120 }}>
            <Target className="w-12 h-12 text-[#b0b0d0] mx-auto mb-2 animate-pulse" />
            <p className="text-[#b0b0d0]">No recent deal updates</p>
            <Button
              onClick={() => navigate('/deals')}
              variant="gradient"
              size="sm"
              className="mt-3"
            >
              View All Deals
            </Button>
          </div>
        ) : (
          renderUpdates()
        )}
      </div>
    </div>
  );
};

export default DealUpdatesWidget; 