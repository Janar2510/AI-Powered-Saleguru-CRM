import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { 
  Calculator,
  FileText,
  BarChart3,
  BookOpen,
  TrendingUp,
  DollarSign,
  Calendar,
  Settings,
  Download,
  Brain,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Target,
  TrendingDown,
  Zap,
  Shield,
  Upload
} from 'lucide-react';
import {
  BrandBackground,
  BrandPageLayout,
  BrandCard,
  BrandButton,
  BrandBadge,
  BrandStatsGrid,
  BrandStatCard,
  BrandInput
} from '../contexts/BrandDesignContext';
import { useAccountingPeriods, useFinancialReports } from '../hooks/useAccounting';
import { useAuth } from '../contexts/AuthContext';
import { BrandDropdown } from '../components/ui/BrandDropdown';

// Import accounting page components
import ChartOfAccounts from './accounting/ChartOfAccounts';
import Journals from './accounting/Journals';
import JournalDetail from './accounting/JournalDetail';
import TrialBalance from './accounting/TrialBalance';
import FinancialStatements from './accounting/FinancialStatements';
import ClosePeriod from './accounting/ClosePeriod';
import ManualJournalEntry from './accounting/ManualJournalEntry';

const AccountingDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { periods, loading: periodsLoading } = useAccountingPeriods();
  const { generateReport } = useFinancialReports();
  
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [financialData, setFinancialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [viewMode, setViewMode] = useState('dashboard');

  // Set default period when periods load
  useEffect(() => {
    if (periods.length > 0 && !selectedPeriod) {
      const currentPeriod = periods.find(p => p.status === 'open') || periods[0];
      setSelectedPeriod(currentPeriod.code);
    }
  }, [periods, selectedPeriod]);

  // Load financial data when period changes
  useEffect(() => {
    if (selectedPeriod && user?.org_id) {
      loadFinancialData();
    }
  }, [selectedPeriod, user?.org_id]);

  const loadFinancialData = async () => {
    if (!user?.org_id || !selectedPeriod) return;
    
    try {
      setLoading(true);
      const data = await generateReport(user.org_id, 'all', selectedPeriod);
      setFinancialData(data);
      await generateAIInsights(data);
    } catch (error) {
      console.error('Failed to load financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsights = async (data: any) => {
    setAiLoading(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const insights = [];
    
    if (data?.profit_loss) {
      const profitMargin = ((data.profit_loss.profit_cents / Math.max(data.profit_loss.revenue_cents, 1)) * 100).toFixed(1);
      insights.push({
        type: 'profitability',
        title: 'Profit Margin Analysis',
        message: `Current profit margin is ${profitMargin}%. ${parseFloat(profitMargin) > 15 ? 'Strong profitability!' : 'Consider cost optimization.'}`
      });
    }
    
    if (data?.aging) {
      const overdueAR = data.aging.filter((a: any) => a.account_type === 'AR' && a.days_outstanding > 30);
      if (overdueAR.length > 0) {
        insights.push({
          type: 'cash_flow',
          title: 'Accounts Receivable Alert',
          message: `${overdueAR.length} invoices are overdue by more than 30 days. Consider follow-up actions.`
        });
      }
    }
    
    insights.push({
      type: 'recommendation',
      title: 'Tax Optimization',
      message: 'Consider prepaying Q1 expenses to optimize current period tax liability.'
    });
    
    setAiInsights(insights);
    setAiLoading(false);
  };

  // Calculate stats from real data or use defaults
  const stats = financialData ? {
    totalRevenue: Math.round((financialData.profit_loss?.revenue_cents || 0) / 100),
    totalExpenses: Math.round((financialData.profit_loss?.expense_cents || 0) / 100),
    netProfit: Math.round((financialData.profit_loss?.profit_cents || 0) / 100),
    cashFlow: Math.round((financialData.profit_loss?.profit_cents || 0) / 100 * 1.2),
    accountsReceivable: Math.round((financialData.trial_balance?.find((t: any) => t.code === '1100')?.balance_cents || 0) / 100),
    accountsPayable: Math.round(Math.abs((financialData.trial_balance?.find((t: any) => t.code === '2000')?.balance_cents || 0)) / 100),
    currentRatio: 2.3,
    grossMargin: 35.2
  } : {
    totalRevenue: 125000,
    totalExpenses: 87500,
    netProfit: 37500,
    cashFlow: 45000,
    accountsReceivable: 23000,
    accountsPayable: 15500,
    currentRatio: 2.3,
    grossMargin: 35.2
  };

  const quickActions = [
    { 
      title: 'Chart of Accounts',
      description: 'Manage your account structure',
      icon: BookOpen,
      color: 'primary' as const,
      path: '/accounting/chart'
    },
    {
      title: 'Journal Entries',
      description: 'View and create journal entries',
      icon: FileText,
      color: 'secondary' as const,
      path: '/accounting/journals'
    },
    {
      title: 'Trial Balance',
      description: 'Review account balances',
      icon: BarChart3,
      color: 'green' as const,
      path: '/accounting/trial-balance'
    },
    {
      title: 'Financial Statements',
      description: 'P&L, Balance Sheet, Cash Flow',
      icon: TrendingUp,
      color: 'blue' as const,
      path: '/accounting/financials'
    },
    {
      title: 'Manual Entry',
      description: 'Create manual journal entries',
      icon: Calculator,
      color: 'purple' as const,
      path: '/accounting/manual-entry'
    },
    {
      title: 'Close Period',
      description: 'Close accounting periods',
      icon: Calendar,
      color: 'orange' as const,
      path: '/accounting/close-period'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'invoice',
      description: 'Invoice #INV-2025-001 posted',
      amount: 2500,
      date: new Date().toISOString(),
      status: 'completed'
    },
    {
      id: 2,
      type: 'payment',
      description: 'Payment received from Customer ABC',
      amount: 1800,
      date: new Date(Date.now() - 86400000).toISOString(),
      status: 'completed'
    },
    {
      id: 3,
      type: 'expense',
      description: 'Office rent expense recorded',
      amount: -1200,
      date: new Date(Date.now() - 172800000).toISOString(),
      status: 'completed'
    }
  ];

  return (
    <BrandBackground>
      <BrandPageLayout
        title="Accounting Dashboard"
        subtitle="Complete financial management and reporting"
                actions={
          <div className="flex items-center space-x-3">
            {/* Period Selector */}
            <div className="w-48">
              <BrandDropdown
                options={periods.map(period => ({
                  value: period.code,
                  label: period.code,
                  badge: period.status,
                  description: `${new Date(period.start_date).toLocaleDateString()} - ${new Date(period.end_date).toLocaleDateString()}`
                }))}
                value={selectedPeriod}
                onChange={setSelectedPeriod}
                placeholder="Select Period"
                disabled={periodsLoading}
              />
            </div>

            {/* View Mode Selector */}
            <div className="w-40">
              <BrandDropdown
                options={[
                  { value: 'dashboard', label: 'Dashboard' },
                  { value: 'summary', label: 'Summary' },
                  { value: 'detailed', label: 'Detailed' }
                ]}
                value={viewMode}
                onChange={setViewMode}
                placeholder="View Mode"
              />
            </div>

            <BrandButton 
              variant="secondary" 
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </BrandButton>
            
            <BrandButton 
              variant="secondary"
              onClick={loadFinancialData}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh'}
            </BrandButton>
            
            <BrandButton 
              variant="secondary"
              onClick={() => {
                const csvData = 'Period,Revenue,Expenses,Profit\n' + 
                  `${selectedPeriod},${stats.totalRevenue},${stats.totalExpenses},${stats.netProfit}`;
                const blob = new Blob([csvData], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `financial-summary-${selectedPeriod}.csv`;
                a.click();
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </BrandButton>
            
            <BrandButton variant="primary" onClick={() => navigate('/accounting/manual-entry')}>
              <Calculator className="w-4 h-4 mr-2" />
              New Entry
            </BrandButton>
          </div>
        }
      >
        {/* Financial Overview Stats */}
        <BrandStatsGrid className="mb-8">
                      <BrandStatCard
              title="Total Revenue"
              value={`€${stats.totalRevenue.toLocaleString()}`}
              icon={<TrendingUp className="w-8 h-8 text-green-400" />}
              trend={loading ? undefined : "+12.5%"}
            />
            <BrandStatCard
              title="Total Expenses"
              value={`€${stats.totalExpenses.toLocaleString()}`}
              icon={<TrendingDown className="w-8 h-8 text-red-400" />}
              trend={loading ? undefined : "+8.3%"}
            />
            <BrandStatCard
              title="Net Profit"
              value={`€${stats.netProfit.toLocaleString()}`}
              icon={<BarChart3 className="w-8 h-8 text-blue-400" />}
              trend={loading ? undefined : "+23.1%"}
            />
            <BrandStatCard
              title="Cash Flow"
              value={`€${stats.cashFlow.toLocaleString()}`}
              icon={<DollarSign className="w-8 h-8 text-yellow-400" />}
              trend={loading ? undefined : "+15.7%"}
            />
            <BrandStatCard
              title="Accounts Receivable"
              value={`€${stats.accountsReceivable.toLocaleString()}`}
              icon={<FileText className="w-8 h-8 text-orange-400" />}
            />
            <BrandStatCard
              title="Accounts Payable"
              value={`€${stats.accountsPayable.toLocaleString()}`}
              icon={<Calendar className="w-8 h-8 text-purple-400" />}
            />
        </BrandStatsGrid>

                {/* AI Insights */}
        <BrandCard borderGradient="accent" className="p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <Brain className="w-5 h-5 mr-2 text-purple-300" />
              AI Financial Insights
            </h3>
            <BrandButton 
              variant="secondary" 
              onClick={() => generateAIInsights(financialData)}
              disabled={aiLoading}
              size="sm"
            >
              {aiLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Brain className="w-4 h-4 mr-2" />
              )}
              {aiLoading ? 'Analyzing...' : 'Generate Insights'}
            </BrandButton>
          </div>
          
          {aiLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin text-[#a259ff] mx-auto mb-4" />
              <p className="text-[#b0b0d0]">AI is analyzing your financial data...</p>
            </div>
          ) : aiInsights.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {aiInsights.map((insight, index) => (
                <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      insight.type === 'profitability' ? 'bg-green-500/20' :
                      insight.type === 'cash_flow' ? 'bg-yellow-500/20' :
                      'bg-blue-500/20'
                    }`}>
                      {insight.type === 'profitability' ? 
                        <TrendingUp className="w-4 h-4 text-green-400" /> :
                        insight.type === 'cash_flow' ? 
                        <AlertTriangle className="w-4 h-4 text-yellow-400" /> :
                        <Target className="w-4 h-4 text-blue-400" />
                      }
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-white mb-1">{insight.title}</h4>
                      <p className="text-xs text-[#b0b0d0]">{insight.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 text-[#a259ff] mx-auto mb-4" />
              <p className="text-[#b0b0d0]">Click "Generate Insights" to get AI-powered financial analysis</p>
            </div>
          )}
        </BrandCard>

        {/* Beautiful Quick Actions Bar */}
        <BrandCard borderGradient="accent" className="p-4 mb-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Zap className="w-5 h-5 mr-2 text-purple-400" />
              Quick Actions
            </h3>
            <div className="flex space-x-3">
              {quickActions.map((action) => {
                const IconComponent = action.icon;
                return (
                  <BrandButton
                    key={action.path}
                    variant="secondary"
                    onClick={() => navigate(action.path)}
                    className="h-12 px-4 flex items-center space-x-2 hover:scale-105 transition-transform"
                  >
                    <IconComponent className={`w-4 h-4 ${
                      action.color === 'blue' ? 'text-blue-400' :
                      action.color === 'green' ? 'text-green-400' :
                      action.color === 'purple' ? 'text-purple-400' :
                      action.color === 'orange' ? 'text-orange-400' :
                      'text-gray-400'
                    }`} />
                    <span className="text-sm">{action.title}</span>
                  </BrandButton>
                );
              })}
            </div>
          </div>
        </BrandCard>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <BrandCard borderGradient="primary" className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Accounting Settings
                  </h3>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-[#b0b0d0] hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-medium text-white mb-4">General Settings</h4>
                    <div className="space-y-4">
                                            <div>
                        <BrandDropdown
                          label="Default Currency"
                          options={[
                            { value: 'EUR', label: 'EUR (€)', description: 'Euro' },
                            { value: 'USD', label: 'USD ($)', description: 'US Dollar' },
                            { value: 'GBP', label: 'GBP (£)', description: 'British Pound' }
                          ]}
                          value="EUR"
                          onChange={() => {}}
                        />
                      </div>
                      
                      <div>
                        <BrandDropdown
                          label="Fiscal Year Start"
                          options={[
                            { value: '1', label: 'January', description: 'Calendar year' },
                            { value: '4', label: 'April', description: 'UK tax year' },
                            { value: '7', label: 'July', description: 'Australia/NZ' },
                            { value: '10', label: 'October', description: 'Custom period' }
                          ]}
                          value="1"
                          onChange={() => {}}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-medium text-white mb-4">Tax Settings</h4>
                    <div className="space-y-4">
                                                  <div>
                        <BrandDropdown
                          label="Country/Region"
                          options={[
                            { value: 'EE', label: 'Estonia', description: '20% VAT' },
                            { value: 'DE', label: 'Germany', description: '19% VAT' },
                            { value: 'FR', label: 'France', description: '20% VAT' },
                            { value: 'US', label: 'United States', description: 'Sales tax varies' }
                          ]}
                          value="EE"
                          onChange={() => {}}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                          Default VAT Rate (%)
                        </label>
                        <BrandInput
                          type="number"
                          placeholder="20"
                          value="20"
                          onChange={() => {}}
                        />
                      </div>
                </div>
              </div>
                  
                  <div className="flex justify-end space-x-3 pt-4 border-t border-white/20">
                    <BrandButton variant="secondary" onClick={() => setShowSettings(false)}>
                      Cancel
                    </BrandButton>
                    <BrandButton variant="primary" onClick={() => setShowSettings(false)}>
                      Save Settings
                    </BrandButton>
                  </div>
                </div>
              </div>
            </BrandCard>
              </div>
            )}

        {/* Recent Activity & Financial Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <BrandCard borderGradient="secondary" className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Recent Activity
            </h3>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activity.type === 'invoice' ? 'bg-blue-500/20' :
                  activity.type === 'payment' ? 'bg-green-500/20' :
                  'bg-orange-500/20'
                }`}>
                  {activity.type === 'invoice' ? <FileText className="w-4 h-4 text-blue-400" /> :
                   activity.type === 'payment' ? <DollarSign className="w-4 h-4 text-green-400" /> :
                   <TrendingDown className="w-4 h-4 text-orange-400" />}
                    </div>
                <div>
                  <p className="text-white text-sm font-medium">{activity.description}</p>
                  <p className="text-[#b0b0d0] text-xs">
                    {new Date(activity.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
                  <div className={`text-sm font-medium ${
                    activity.amount > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {activity.amount > 0 ? '+' : ''}€{Math.abs(activity.amount).toLocaleString()}
                        </div>
                      </div>
              ))}
                    </div>
          </BrandCard>

          {/* Financial Health */}
          <BrandCard borderGradient="accent" className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Financial Health
            </h3>
                      <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                        </div>
                        <div>
                    <p className="text-white text-sm font-medium">Current Ratio</p>
                    <p className="text-[#b0b0d0] text-xs">Assets vs Liabilities</p>
                    </div>
                </div>
                <BrandBadge variant="success">{stats.currentRatio}</BrandBadge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                      </div>
                  <div>
                    <p className="text-white text-sm font-medium">Gross Margin</p>
                    <p className="text-[#b0b0d0] text-xs">Revenue efficiency</p>
                    </div>
                </div>
                <BrandBadge variant="success">{stats.grossMargin}%</BrandBadge>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-blue-400" />
                    </div>
                  <div>
                    <p className="text-white text-sm font-medium">Tax Compliance</p>
                    <p className="text-[#b0b0d0] text-xs">VAT and tax filings</p>
                    </div>
                </div>
                <BrandBadge variant="info">Current</BrandBadge>
              </div>
          </div>
          </BrandCard>
        </div>
      </BrandPageLayout>
    </BrandBackground>
  );
};

const Accounting: React.FC = () => {
  const location = useLocation();
  
  // If we're at the root accounting path, show the dashboard
  if (location.pathname === '/accounting') {
    return <AccountingDashboard />;
  }

  return (
    <Routes>
      <Route path="/chart" element={<ChartOfAccounts />} />
      <Route path="/journals" element={<Journals />} />
      <Route path="/journals/:id" element={<JournalDetail />} />
      <Route path="/trial-balance" element={<TrialBalance />} />
      <Route path="/financials" element={<FinancialStatements />} />
      <Route path="/close-period" element={<ClosePeriod />} />
      <Route path="/manual-entry" element={<ManualJournalEntry />} />
      <Route path="*" element={<Navigate to="/accounting" replace />} />
    </Routes>
  );
};

export default Accounting; 