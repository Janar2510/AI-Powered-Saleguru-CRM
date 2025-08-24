import React, { useState, useEffect } from 'react';
import { TrendingUp, Download, Calendar, BarChart3, DollarSign, FileText, RefreshCw, Upload, Eye, Filter, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  BrandBackground, 
  BrandPageLayout, 
  BrandCard, 
  BrandButton, 
  BrandBadge 
} from '../../contexts/BrandDesignContext';
import { useFinancialReports, useAccountingPeriods } from '../../hooks/useAccounting';
import { useAuth } from '../../contexts/AuthContext';
import { BrandDropdown } from '../../components/ui/BrandDropdown';

const FinancialStatements: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { periods } = useAccountingPeriods();
  const { generateReport, loading } = useFinancialReports();
  
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [activeTab, setActiveTab] = useState<'pl' | 'balance' | 'cash'>('pl');
  const [financialData, setFinancialData] = useState<any>(null);

  useEffect(() => {
    if (periods.length > 0 && !selectedPeriod) {
      const currentPeriod = periods.find(p => p.status === 'open') || periods[0];
      setSelectedPeriod(currentPeriod.code);
    }
  }, [periods]);

  useEffect(() => {
    if (selectedPeriod && user?.org_id) {
      loadFinancialData();
    }
  }, [selectedPeriod, user?.org_id]);

  const loadFinancialData = async () => {
    if (!user?.org_id || !selectedPeriod) return;
    
    try {
      const data = await generateReport(user.org_id, 'all', selectedPeriod);
      setFinancialData(data);
    } catch (error) {
      console.error('Failed to load financial data:', error);
    }
  };

  const formatCurrency = (cents: number) => {
    return `€${(cents / 100).toLocaleString()}`;
  };

  const renderProfitLoss = () => {
    const pl = financialData?.profit_loss;
    if (!pl) {
      return (
        <div className="text-center py-8">
          <p className="text-[#b0b0d0]">No profit & loss data available for this period</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Revenue Section */}
        <div className="bg-white/5 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
            Revenue
          </h4>
          <div className="flex justify-between items-center">
            <span className="text-[#b0b0d0]">Total Revenue</span>
            <span className="text-2xl font-bold text-green-400">
              {formatCurrency(pl.revenue_cents || 0)}
            </span>
          </div>
        </div>

        {/* Expenses Section */}
        <div className="bg-white/5 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-red-400" />
            Expenses
          </h4>
          <div className="flex justify-between items-center">
            <span className="text-[#b0b0d0]">Total Expenses</span>
            <span className="text-2xl font-bold text-red-400">
              {formatCurrency(pl.expense_cents || 0)}
            </span>
          </div>
        </div>

        {/* Net Income */}
        <div className="bg-white/5 rounded-lg p-6 border-2 border-[#a259ff]/30">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-[#a259ff]" />
            Net Income
          </h4>
          <div className="flex justify-between items-center">
            <span className="text-[#b0b0d0]">Net Profit/Loss</span>
            <span className={`text-3xl font-bold ${
              (pl.profit_cents || 0) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {formatCurrency(pl.profit_cents || 0)}
            </span>
          </div>
          <div className="mt-2 text-sm text-[#b0b0d0]">
            Margin: {pl.revenue_cents > 0 ? 
              ((pl.profit_cents / pl.revenue_cents) * 100).toFixed(1) : '0'
            }%
          </div>
        </div>
      </div>
    );
  };

  const renderBalanceSheet = () => {
    const bs = financialData?.balance_sheet;
    if (!bs || bs.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-[#b0b0d0]">No balance sheet data available for this period</p>
        </div>
      );
    }

    const assets = bs.filter((item: any) => item.type === 'asset');
    const liabilities = bs.filter((item: any) => item.type === 'liability');
    const equity = bs.filter((item: any) => item.type === 'equity');

    const totalAssets = assets.reduce((sum: number, item: any) => sum + item.balance_cents, 0);
    const totalLiabilities = liabilities.reduce((sum: number, item: any) => sum + item.balance_cents, 0);
    const totalEquity = equity.reduce((sum: number, item: any) => sum + item.balance_cents, 0);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white mb-4">Assets</h4>
          <div className="bg-white/5 rounded-lg p-4">
            {assets.map((item: any) => (
              <div key={item.account_id} className="flex justify-between py-2">
                <span className="text-[#b0b0d0]">{item.account_name}</span>
                <span className="text-white">{formatCurrency(item.balance_cents)}</span>
              </div>
            ))}
            <div className="border-t border-white/20 mt-2 pt-2">
              <div className="flex justify-between font-bold">
                <span className="text-white">Total Assets</span>
                <span className="text-white">{formatCurrency(totalAssets)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Liabilities & Equity */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white mb-4">Liabilities & Equity</h4>
          
          {/* Liabilities */}
          <div className="bg-white/5 rounded-lg p-4">
            <h5 className="text-md font-medium text-white mb-2">Liabilities</h5>
            {liabilities.map((item: any) => (
              <div key={item.account_id} className="flex justify-between py-1">
                <span className="text-[#b0b0d0]">{item.account_name}</span>
                <span className="text-white">{formatCurrency(Math.abs(item.balance_cents))}</span>
              </div>
            ))}
            <div className="border-t border-white/20 mt-2 pt-2">
              <div className="flex justify-between font-medium">
                <span className="text-white">Total Liabilities</span>
                <span className="text-white">{formatCurrency(Math.abs(totalLiabilities))}</span>
              </div>
            </div>
          </div>

          {/* Equity */}
          <div className="bg-white/5 rounded-lg p-4">
            <h5 className="text-md font-medium text-white mb-2">Equity</h5>
            {equity.map((item: any) => (
              <div key={item.account_id} className="flex justify-between py-1">
                <span className="text-[#b0b0d0]">{item.account_name}</span>
                <span className="text-white">{formatCurrency(item.balance_cents)}</span>
              </div>
            ))}
            <div className="border-t border-white/20 mt-2 pt-2">
              <div className="flex justify-between font-medium">
                <span className="text-white">Total Equity</span>
                <span className="text-white">{formatCurrency(totalEquity)}</span>
              </div>
            </div>
          </div>

          {/* Balance Check */}
          <div className="bg-[#a259ff]/10 rounded-lg p-4 border border-[#a259ff]/30">
            <div className="flex justify-between font-bold">
              <span className="text-white">Total Liabilities + Equity</span>
              <span className="text-white">{formatCurrency(Math.abs(totalLiabilities) + totalEquity)}</span>
            </div>
            <div className="text-xs text-[#b0b0d0] mt-1">
              {Math.abs(totalAssets - (Math.abs(totalLiabilities) + totalEquity)) < 1 ? 
                '✓ Balance sheet balances' : 
                '⚠ Balance sheet does not balance'
              }
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCashFlow = () => {
    return (
      <div className="text-center py-8">
        <FileText className="w-16 h-16 text-[#a259ff] mx-auto mb-4" />
        <h3 className="text-xl font-medium text-white mb-2">Cash Flow Statement</h3>
        <p className="text-[#b0b0d0]">
          Cash flow statement functionality coming soon with operating, investing, and financing activities
        </p>
      </div>
    );
  };

  return (
    <BrandBackground>
      <BrandPageLayout
        title="Financial Statements"
        subtitle="Comprehensive financial reporting and analysis"
        actions={
          <div className="flex items-center space-x-3">
            {/* Navigation */}
            <BrandButton variant="secondary" onClick={() => navigate('/accounting')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </BrandButton>
            
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
              />
            </div>
            
            {/* View Options */}
            <BrandDropdown
              options={[
                { value: 'standard', label: 'Standard View' },
                { value: 'detailed', label: 'Detailed View' },
                { value: 'comparison', label: 'Period Comparison' }
              ]}
              value={'standard'}
              onChange={() => {}}
              placeholder="View Options"
            />
            
            {/* Import/Export */}
            <BrandButton 
              variant="secondary" 
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.xlsx,.csv';
                input.click();
              }}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </BrandButton>
            
            <BrandButton 
              variant="secondary"
              onClick={() => {
                const data = `Statement,Period,Amount\nRevenue,${selectedPeriod},${financialData?.profit_loss?.revenue_cents || 0}\nExpenses,${selectedPeriod},${financialData?.profit_loss?.expense_cents || 0}`;
                const blob = new Blob([data], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `financial-statements-${selectedPeriod}.csv`;
                a.click();
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </BrandButton>
            
            <BrandButton variant="secondary" onClick={loadFinancialData} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </BrandButton>
            
            <BrandButton variant="secondary" onClick={() => navigate('/accounting/trial-balance')}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Trial Balance
            </BrandButton>
          </div>
        }
      >
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('pl')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'pl'
                ? 'bg-[#a259ff] text-white'
                : 'text-[#b0b0d0] hover:text-white hover:bg-white/10'
            }`}
          >
            Profit & Loss
          </button>
          <button
            onClick={() => setActiveTab('balance')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'balance'
                ? 'bg-[#a259ff] text-white'
                : 'text-[#b0b0d0] hover:text-white hover:bg-white/10'
            }`}
          >
            Balance Sheet
          </button>
          <button
            onClick={() => setActiveTab('cash')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'cash'
                ? 'bg-[#a259ff] text-white'
                : 'text-[#b0b0d0] hover:text-white hover:bg-white/10'
            }`}
          >
            Cash Flow
          </button>
        </div>

        {/* Content */}
        <BrandCard borderGradient="primary" className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin text-[#a259ff] mx-auto mb-4" />
              <p className="text-[#b0b0d0]">Loading financial data...</p>
            </div>
          ) : (
            <>
              {activeTab === 'pl' && renderProfitLoss()}
              {activeTab === 'balance' && renderBalanceSheet()}
              {activeTab === 'cash' && renderCashFlow()}
            </>
          )}
        </BrandCard>
      </BrandPageLayout>
    </BrandBackground>
  );
};

export default FinancialStatements;
