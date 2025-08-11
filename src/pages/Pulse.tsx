import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Target, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Calendar,
  Zap,
  Eye,
  Filter,
  Download,
  Share2,
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Circle,
  Star,
  Heart,
  MessageSquare,
  Phone,
  Mail,
  User,
  Building,
  Tag
} from 'lucide-react';
import { Card } from '../components/common/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { useToastContext } from '../contexts/ToastContext';
import { useGuru } from '../contexts/GuruContext';
import Container from '../components/layout/Container';
import Spline from '@splinetool/react-spline';

interface PulseMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<any>;
  color: string;
  description: string;
  target?: number;
  unit?: string;
}

interface PulseActivity {
  id: string;
  type: 'deal' | 'task' | 'email' | 'call' | 'meeting';
  title: string;
  description: string;
  timestamp: string;
  user: string;
  status: 'completed' | 'pending' | 'overdue';
  priority: 'low' | 'medium' | 'high';
}

const Pulse: React.FC = () => {
  const { showToast } = useToastContext();
  const { openGuru } = useGuru();
  
  const [metrics, setMetrics] = useState<PulseMetric[]>([]);
  const [activities, setActivities] = useState<PulseActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('week');
  const [filter, setFilter] = useState<'all' | 'deals' | 'tasks' | 'emails' | 'calls'>('all');

  useEffect(() => {
    loadPulseData();
  }, [timeRange]);

  const loadPulseData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Demo metrics data
      const demoMetrics: PulseMetric[] = [
        {
          id: 'deals-created',
          name: 'Deals Created',
          value: 24,
          change: 12.5,
          changeType: 'increase',
          trend: 'up',
          icon: Target,
          color: '#a259ff',
          description: 'New deals added this period',
          target: 30
        },
        {
          id: 'revenue',
          name: 'Revenue Generated',
          value: 125000,
          change: 8.3,
          changeType: 'increase',
          trend: 'up',
          icon: DollarSign,
          color: '#43e7ad',
          description: 'Total revenue this period',
          unit: 'USD'
        },
        {
          id: 'conversion-rate',
          name: 'Conversion Rate',
          value: 68.5,
          change: -2.1,
          changeType: 'decrease',
          trend: 'down',
          icon: TrendingUp,
          color: '#f59e0b',
          description: 'Lead to deal conversion',
          unit: '%'
        },
        {
          id: 'active-users',
          name: 'Active Users',
          value: 156,
          change: 15.2,
          changeType: 'increase',
          trend: 'up',
          icon: Users,
          color: '#377dff',
          description: 'Users active this period'
        },
        {
          id: 'avg-deal-size',
          name: 'Avg Deal Size',
          value: 5200,
          change: 5.8,
          changeType: 'increase',
          trend: 'up',
          icon: BarChart3,
          color: '#ef4444',
          description: 'Average deal value',
          unit: 'USD'
        },
        {
          id: 'response-time',
          name: 'Response Time',
          value: 2.4,
          change: -12.5,
          changeType: 'decrease',
          trend: 'up',
          icon: Clock,
          color: '#8b5cf6',
          description: 'Average response time',
          unit: 'hours'
        }
      ];

      // Demo activities data
      const demoActivities: PulseActivity[] = [
        {
          id: '1',
          type: 'deal',
          title: 'Enterprise Deal Closed',
          description: 'TechCorp software package deal worth $50,000 closed successfully',
          timestamp: '2 hours ago',
          user: 'Sarah Johnson',
          status: 'completed',
          priority: 'high'
        },
        {
          id: '2',
          type: 'task',
          title: 'Follow-up Call Scheduled',
          description: 'Follow-up call with StartupXYZ CEO scheduled for tomorrow',
          timestamp: '4 hours ago',
          user: 'Mike Chen',
          status: 'pending',
          priority: 'medium'
        },
        {
          id: '3',
          type: 'email',
          title: 'Proposal Sent',
          description: 'Custom proposal sent to Demo Company Inc. for cloud migration',
          timestamp: '6 hours ago',
          user: 'Alex Rodriguez',
          status: 'completed',
          priority: 'high'
        },
        {
          id: '4',
          type: 'call',
          title: 'Discovery Call Completed',
          description: 'Initial discovery call with NewTech Solutions completed',
          timestamp: '8 hours ago',
          user: 'Emily Davis',
          status: 'completed',
          priority: 'medium'
        },
        {
          id: '5',
          type: 'meeting',
          title: 'Team Standup',
          description: 'Daily team standup meeting completed with 8 participants',
          timestamp: '1 day ago',
          user: 'David Wilson',
          status: 'completed',
          priority: 'low'
        },
        {
          id: '6',
          type: 'deal',
          title: 'Qualification Meeting',
          description: 'Qualification meeting with potential client scheduled',
          timestamp: '1 day ago',
          user: 'Lisa Thompson',
          status: 'pending',
          priority: 'high'
        }
      ];

      setMetrics(demoMetrics);
      setActivities(demoActivities);
    } catch (error) {
      console.error('Error loading pulse data:', error);
      showToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to load pulse data'
      });
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'deal': return Target;
      case 'task': return CheckCircle;
      case 'email': return Mail;
      case 'call': return Phone;
      case 'meeting': return Users;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'deal': return '#a259ff';
      case 'task': return '#43e7ad';
      case 'email': return '#377dff';
      case 'call': return '#f59e0b';
      case 'meeting': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'overdue': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const formatValue = (value: number, unit?: string) => {
    if (unit === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      }).format(value);
    }
    if (unit === '%') {
      return `${value.toFixed(1)}%`;
    }
    if (unit === 'hours') {
      return `${value.toFixed(1)}h`;
    }
    return value.toLocaleString();
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return activity.type === filter;
  });

  return (
    <div className="relative z-10 min-h-screen">
      {/* 3D Background */}
      <div className="fixed inset-0 z-0">
        <Spline
          scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode"
          className="w-full h-full"
        />
      </div>
      
      {/* Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#18182c]/50 to-[#18182c]/70 z-0"></div>
      
      {/* Content */}
      <div className="relative z-10">
        <Container>
          <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-[#a259ff] to-[#377dff] rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Pulse</h1>
                  <p className="text-[#b0b0d0]">Real-time insights and activity monitoring</p>
                </div>
              </div>
              <p className="text-[#b0b0d0] max-w-2xl mx-auto">
                Monitor your sales pipeline health, track team performance, and stay on top of all activities 
                with real-time metrics and intelligent insights powered by AI.
              </p>
            </div>

            {/* Controls */}
            <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => openGuru()}
                    variant="gradient"
                    size="sm"
                    icon={Zap}
                  >
                    Ask Guru
                  </Button>
                  <Button
                    onClick={loadPulseData}
                    variant="secondary"
                    size="sm"
                    icon={RefreshCw}
                    disabled={loading}
                  >
                    Refresh
                  </Button>
                </div>
                
                <div className="flex items-center gap-3">
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value as any)}
                    className="px-3 py-2 rounded-lg bg-[#23233a]/60 text-white border border-[#23233a]/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  >
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                  
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                    className="px-3 py-2 rounded-lg bg-[#23233a]/60 text-white border border-[#23233a]/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  >
                    <option value="all">All Activities</option>
                    <option value="deals">Deals</option>
                    <option value="tasks">Tasks</option>
                    <option value="emails">Emails</option>
                    <option value="calls">Calls</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {metrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <div
                    key={metric.id}
                    className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6 hover:bg-[#23233a]/60 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${metric.color}20` }}
                        >
                          <Icon className="w-5 h-5" style={{ color: metric.color }} />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-[#b0b0d0]">{metric.name}</h3>
                          <p className="text-xs text-[#8a8a8a]">{metric.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {metric.trend === 'up' ? (
                          <ArrowUp className="w-4 h-4 text-green-400" />
                        ) : metric.trend === 'down' ? (
                          <ArrowDown className="w-4 h-4 text-red-400" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-400" />
                        )}
                        <span className={`text-xs font-medium ${
                          metric.changeType === 'increase' ? 'text-green-400' : 
                          metric.changeType === 'decrease' ? 'text-red-400' : 'text-gray-400'
                        }`}>
                          {metric.change > 0 ? '+' : ''}{metric.change}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-baseline space-x-2">
                        <span className="text-2xl font-bold text-white">
                          {formatValue(metric.value, metric.unit)}
                        </span>
                        {metric.target && (
                          <span className="text-sm text-[#8a8a8a]">
                            / {formatValue(metric.target, metric.unit)}
                          </span>
                        )}
                      </div>
                      
                      {metric.target && (
                        <div className="w-full bg-[#23233a]/60 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ 
                              backgroundColor: metric.color,
                              width: `${Math.min((metric.value / metric.target) * 100, 100)}%`
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Activities Feed */}
            <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Recent Activities</h2>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Download}
                  >
                    Export
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Share2}
                  >
                    Share
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                {filteredActivities.map((activity) => {
                  const ActivityIcon = getActivityIcon(activity.type);
                  const activityColor = getActivityColor(activity.type);
                  
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-4 p-4 bg-[#23233a]/30 rounded-lg hover:bg-[#23233a]/50 transition-all duration-200"
                    >
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${activityColor}20` }}
                      >
                        <ActivityIcon className="w-5 h-5" style={{ color: activityColor }} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-white mb-1">{activity.title}</h3>
                            <p className="text-sm text-[#b0b0d0] mb-2">{activity.description}</p>
                            
                            <div className="flex items-center space-x-4 text-xs">
                              <span className="text-[#8a8a8a]">{activity.timestamp}</span>
                              <span className="text-[#8a8a8a]">by {activity.user}</span>
                              <Badge 
                                variant={activity.status === 'completed' ? 'success' : 
                                        activity.status === 'pending' ? 'warning' : 'danger'}
                                size="sm"
                              >
                                {activity.status}
                              </Badge>
                              <span className={getPriorityColor(activity.priority)}>
                                {activity.priority} priority
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {filteredActivities.length === 0 && (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-[#8a8a8a] mx-auto mb-4" />
                  <p className="text-[#b0b0d0]">No activities found for the selected filters</p>
                </div>
              )}
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default Pulse; 