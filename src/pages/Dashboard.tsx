import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  Calendar,
  PieChart,
  Activity,
  Zap,
  Star,
  Award,
  CheckCircle,
  Building2,
  UserPlus,
  FileText,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { MiniChart } from '../components/dashboard/MiniChart';
import { 
  BrandBackground,
  BrandPageLayout,
  BrandStatsGrid,
  BrandStatCard,
  BrandCard,
  BrandButton,
  BrandBadge
} from '../contexts/BrandDesignContext';

// Sample data for demonstration
const dashboardData = {
  metrics: {
    totalDeals: 24,
    activeLeads: 12,
    totalRevenue: 45231,
    totalTasks: 8,
    conversionRate: 68.5,
    avgDealSize: 1884,
    pipelineValue: 125000,
    wonThisMonth: 8
  },
  charts: {
    deals: [18, 22, 19, 24, 21, 26, 24],
    leads: [8, 10, 9, 12, 11, 13, 12],
    revenue: [32000, 35000, 38000, 42000, 40000, 45000, 45231],
    tasks: [5, 6, 7, 8, 7, 9, 8]
  },
  recentActivity: [
    {
      id: 1,
      type: 'deal',
      title: 'New deal created',
      description: 'Acme Corp - $15,000',
      time: '2 hours ago',
      icon: 'D',
      color: 'blue',
      trend: 'up'
    },
    {
      id: 2,
      type: 'lead',
      title: 'Lead converted',
      description: 'TechStart Inc',
      time: '1 day ago',
      icon: 'L',
      color: 'green',
      trend: 'up'
    },
    {
      id: 3,
      type: 'task',
      title: 'Task completed',
      description: 'Follow up with client',
      time: '2 days ago',
      icon: 'T',
      color: 'purple',
      trend: 'neutral'
    },
    {
      id: 4,
      type: 'email',
      title: 'Email sent',
      description: 'Proposal to TechCorp',
      time: '3 days ago',
      icon: 'E',
      color: 'indigo',
      trend: 'neutral'
    }
  ],
  topDeals: [
    { id: 1, company: 'Acme Corp', value: 15000, stage: 'negotiation', probability: 85 },
    { id: 2, company: 'TechStart Inc', value: 12000, stage: 'proposal', probability: 70 },
    { id: 3, company: 'Global Solutions', value: 25000, stage: 'qualification', probability: 60 },
    { id: 4, company: 'Innovation Labs', value: 18000, stage: 'negotiation', probability: 80 }
  ],
  pipelineStages: [
    { stage: 'Lead', count: 8, value: 45000, color: '#6366f1' },
    { stage: 'Qualification', count: 6, value: 35000, color: '#8b5cf6' },
    { stage: 'Proposal', count: 4, value: 25000, color: '#f59e0b' },
    { stage: 'Negotiation', count: 3, value: 15000, color: '#ef4444' },
    { stage: 'Closed Won', count: 3, value: 5000, color: '#10b981' }
  ]
};

const Dashboard: React.FC = () => {
  console.log('🔄 Spline Background Dashboard rendering...');
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getActivityColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-600',
      green: 'bg-green-600',
      purple: 'bg-purple-600',
      indigo: 'bg-indigo-600',
      orange: 'bg-orange-600'
    };
    return colors[color as keyof typeof colors] || 'bg-gray-600';
  };

  return (
    <BrandBackground>
      <BrandPageLayout
        title="Dashboard"
        subtitle="Your sales performance overview"
        logoGradient={true}
        actions={
          <BrandButton variant="purple" className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Quick Actions</span>
          </BrandButton>
        }
      >

        {/* Brand Stats Grid */}
        <BrandStatsGrid>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <BrandStatCard
              icon={<TrendingUp className="h-6 w-6 text-white" />}
              title="Total Pipeline"
              value={formatCurrency(dashboardData.metrics.pipelineValue)}
              borderGradient="primary"
              animation="scaleIn"
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <BrandStatCard
              icon={<Award className="h-6 w-6 text-white" />}
              title="Won This Month"
              value={dashboardData.metrics.wonThisMonth}
              borderGradient="green"
              animation="scaleIn"
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <BrandStatCard
              icon={<Star className="h-6 w-6 text-white" />}
              title="Conversion Rate"
              value={`${dashboardData.metrics.conversionRate}%`}
              borderGradient="purple"
              animation="scaleIn"
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <BrandStatCard
              icon={<Target className="h-6 w-6 text-white" />}
              title="Avg Deal Size"
              value={formatCurrency(dashboardData.metrics.avgDealSize)}
              borderGradient="blue"
              animation="scaleIn"
            />
          </motion.div>
        </BrandStatsGrid>

        {/* Main Dashboard Content */}
      <div className="relative z-10 px-5 py-5">
        {/* Core Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <BrandCard variant="glass" borderGradient="primary" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-600/20 rounded-xl">
                    <Target className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-300">Total Deals</p>
                    <p className="text-2xl font-bold text-white">{dashboardData.metrics.totalDeals}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-green-400">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  +12% from last month
                </div>
                <div className="w-20 h-12">
                  {dashboardData.charts.deals && dashboardData.charts.deals.length > 0 ? (
                    <MiniChart data={dashboardData.charts.deals} color="#6366f1" height={48} />
                  ) : (
                    <div className="w-full h-full bg-gray-700/50 rounded animate-pulse" />
                  )}
                </div>
              </div>
            </BrandCard>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <BrandCard variant="glass" borderGradient="primary" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-3 bg-green-600/20 rounded-xl">
                    <Users className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-300">Active Leads</p>
                    <p className="text-2xl font-bold text-white">{dashboardData.metrics.activeLeads}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-green-400">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  +8% from last month
                </div>
                <div className="w-20 h-12">
                  {dashboardData.charts.leads && dashboardData.charts.leads.length > 0 ? (
                    <MiniChart data={dashboardData.charts.leads} color="#10b981" height={48} />
                  ) : (
                    <div className="w-full h-full bg-gray-700/50 rounded animate-pulse" />
                  )}
                </div>
              </div>
            </BrandCard>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <BrandCard variant="glass" borderGradient="primary" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-600/20 rounded-xl">
                    <DollarSign className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-300">Total Revenue</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(dashboardData.metrics.totalRevenue)}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-green-400">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  +23% from last month
                </div>
                <div className="w-20 h-12">
                  {dashboardData.charts.revenue && dashboardData.charts.revenue.length > 0 ? (
                    <MiniChart data={dashboardData.charts.revenue} color="#8b5cf6" height={48} />
                  ) : (
                    <div className="w-full h-full bg-gray-700/50 rounded animate-pulse" />
                  )}
                </div>
              </div>
            </BrandCard>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <BrandCard variant="glass" borderGradient="primary" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-600/20 rounded-xl">
                    <CheckCircle className="h-6 w-6 text-orange-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-300">Completed Tasks</p>
                    <p className="text-2xl font-bold text-white">{dashboardData.metrics.totalTasks}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-green-400">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  +15% from last month
                </div>
                <div className="w-20 h-12">
                  {dashboardData.charts.tasks && dashboardData.charts.tasks.length > 0 ? (
                    <MiniChart data={dashboardData.charts.tasks} color="#f59e0b" height={48} />
                  ) : (
                    <div className="w-full h-full bg-gray-700/50 rounded animate-pulse" />
                  )}
                </div>
              </div>
            </BrandCard>
          </motion.div>
        </div>

        {/* Charts and Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          {/* Pipeline Overview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <BrandCard variant="glass" borderGradient="secondary" className="p-6">
              <div className="mb-4">
                <h3 className="flex items-center space-x-2 text-white font-semibold">
                  <PieChart className="h-5 w-5 text-blue-400" />
                  <span>Pipeline Overview</span>
                </h3>
              </div>
              <div>
                <div className="space-y-4">
                  {dashboardData.pipelineStages.map((stage, index) => (
                    <div key={stage.stage} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-300">{stage.stage}</span>
                        <span className="text-sm text-gray-400">{stage.count} deals • {formatCurrency(stage.value)}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                          className="h-3 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${(stage.count / dashboardData.metrics.totalDeals) * 100}%`, 
                            backgroundColor: stage.color 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </BrandCard>
          </motion.div>

          {/* Top Deals */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <BrandCard variant="glass" borderGradient="secondary" className="p-6">
              <div className="mb-4">
                <h3 className="flex items-center space-x-2 text-white font-semibold">
                  <Award className="h-5 w-5 text-green-400" />
                  <span>Top Deals</span>
                </h3>
              </div>
              <div>
                <div className="space-y-4">
                  {dashboardData.topDeals.map((deal) => (
                    <div key={deal.id} className="flex items-center justify-between p-3 bg-[#2d2d44]/60 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{deal.company}</p>
                          <p className="text-xs text-gray-400">{deal.stage}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">{formatCurrency(deal.value)}</p>
                        <BrandBadge variant="default" size="sm">
                          {deal.probability}%
                        </BrandBadge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </BrandCard>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <BrandCard variant="glass" borderGradient="accent" className="p-6">
            <div className="mb-4">
              <h3 className="flex items-center space-x-2 text-white font-semibold">
                <Activity className="h-5 w-5 text-indigo-400" />
                <span>Recent Activity</span>
              </h3>
            </div>
            <div>
              <div className="space-y-4">
                {dashboardData.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 bg-[#2d2d44]/60 rounded-xl hover:bg-[#374151]/80 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 ${getActivityColor(activity.color)} rounded-xl flex items-center justify-center text-white text-sm font-bold`}>
                        {activity.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{activity.title}</p>
                        <p className="text-sm text-gray-400">{activity.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <BrandBadge variant="default" size="sm">
                        {activity.time}
                      </BrandBadge>
                      {activity.trend === 'up' && (
                        <div className="w-6 h-6 bg-green-600/20 rounded-full flex items-center justify-center">
                          <ArrowUpRight className="h-3 w-3 text-green-400" />
                        </div>
                      )}
                      {activity.trend === 'down' && (
                        <div className="w-6 h-6 bg-red-600/20 rounded-full flex items-center justify-center">
                          <ArrowDownRight className="h-3 w-3 text-red-400" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </BrandCard>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <BrandCard variant="gradient" borderGradient="logo" className="p-6">
            <div className="mb-4">
              <h3 className="text-center text-white font-semibold">Quick Actions</h3>
            </div>
            <div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <BrandButton variant="secondary" className="h-20 flex-col space-y-2">
                  <UserPlus className="h-6 w-6 text-blue-400" />
                  <span className="text-sm">Add Lead</span>
                </BrandButton>
                <BrandButton variant="secondary" className="h-20 flex-col space-y-2">
                  <Target className="h-6 w-6 text-green-400" />
                  <span className="text-sm">Create Deal</span>
                </BrandButton>
                <BrandButton variant="secondary" className="h-20 flex-col space-y-2">
                  <FileText className="h-6 w-6 text-purple-400" />
                  <span className="text-sm">New Quote</span>
                </BrandButton>
                <BrandButton variant="secondary" className="h-20 flex-col space-y-2">
                  <Calendar className="h-6 w-6 text-orange-400" />
                  <span className="text-sm">Schedule</span>
                </BrandButton>
              </div>
            </div>
          </BrandCard>
        </motion.div>
      </div>
      </BrandPageLayout>
    </BrandBackground>
  );
};

export default Dashboard;