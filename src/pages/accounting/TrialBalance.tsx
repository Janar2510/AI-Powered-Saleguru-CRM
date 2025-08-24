import React, { useState, useEffect } from 'react';
import { BarChart3, Download, RefreshCw, Calendar, Filter, Upload, ArrowLeft, Home, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  BrandBackground,
  BrandPageLayout,
  BrandCard,
  BrandButton,
  BrandBadge,
  BrandStatsGrid,
  BrandStatCard
} from '../../contexts/BrandDesignContext';
import { useFinancialReports, useAccountingPeriods, TrialBalanceItem } from '../../hooks/useAccounting';
import { useAuth } from '../../contexts/AuthContext';
import { BrandDropdown } from '../../components/ui/BrandDropdown';
import { QuickActionsBar } from '../../components/accounting/QuickActionsBar';

const TrialBalance: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { periods, loading: periodsLoading } = useAccountingPeriods();
  const { loading: reportLoading, error, generateReport } = useFinancialReports();
  
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [trialBalance, setTrialBalance] = useState<TrialBalanceItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (periods.length > 0 && !selectedPeriod) {
      // Select the most recent open period by default
      const openPeriod = periods.find(p => p.status === 'open');
      if (openPeriod) {
        setSelectedPeriod(openPeriod.code);
      }
    }
  }, [periods, selectedPeriod]);

  const loadTrialBalance = async () => {
    if (!user?.org_id || !selectedPeriod) return;

    try {
      const data = await generateReport(user.org_id, 'trial_balance', selectedPeriod);
      setTrialBalance(data.trial_balance || []);
      setLastUpdated(new Date());
    } catch (err) {
      // Error is handled by the hook
    }
  };

  useEffect(() => {
    if (selectedPeriod) {
      loadTrialBalance();
    }
  }, [selectedPeriod, user?.org_id]);

  // Calculate totals
  const totals = trialBalance.reduce(
    (acc, item) => ({
      debit: acc.debit + item.total_debit_cents,
      credit: acc.credit + item.total_credit_cents
    }),
    { debit: 0, credit: 0 }
  );

  const isBalanced = totals.debit === totals.credit;

  // Group accounts by type
  const groupedAccounts = trialBalance.reduce((groups, account) => {
    const type = account.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(account);
    return groups;
  }, {} as Record<string, TrialBalanceItem[]>);

  const accountTypeOrder = ['asset', 'liability', 'equity', 'income', 'expense', 'contra-asset', 'contra-liability'];

  const exportToCSV = () => {
    const headers = ['Account Code', 'Account Name', 'Type', 'Debit', 'Credit', 'Balance'];
    const rows = trialBalance.map(item => [
      item.code,
      item.name,
      item.type,
      (item.total_debit_cents / 100).toFixed(2),
      (item.total_credit_cents / 100).toFixed(2),
      (item.balance_cents / 100).toFixed(2)
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `trial-balance-${selectedPeriod}.csv`;
    link.click();
  };

  return (
    <BrandBackground>
      <BrandPageLayout
        title="Trial Balance"
        subtitle="Review account balances and ensure books are balanced"
        actions={
          <div className="flex space-x-3">
            {/* Navigation */}
            <BrandButton variant="secondary" onClick={() => navigate('/accounting')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </BrandButton>
            
            {/* View Options */}
            <BrandDropdown
              options={[
                { value: 'grouped', label: 'Grouped View' },
                { value: 'flat', label: 'Flat View' },
                { value: 'summary', label: 'Summary Only' }
              ]}
              value={'grouped'}
              onChange={() => {}}
              placeholder="View Options"
            />
            
            {/* Import/Export */}
            <BrandButton 
              variant="secondary" 
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.csv';
                input.click();
              }}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </BrandButton>
            
            <BrandButton variant="secondary" onClick={exportToCSV} disabled={trialBalance.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </BrandButton>
            
            <BrandButton variant="secondary" onClick={loadTrialBalance} disabled={reportLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${reportLoading ? 'animate-spin' : ''}`} />
              Refresh
            </BrandButton>
            
            <BrandButton variant="secondary" onClick={() => navigate('/accounting/financial-statements')}>
              <FileText className="w-4 h-4 mr-2" />
              Financial Statements
            </BrandButton>
          </div>
        }
      >
        <QuickActionsBar currentPage="/accounting/trial-balance" />
        
        {/* Period Selection and Summary */}
        <BrandCard borderGradient="primary" className="p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Calendar className="w-5 h-5 text-[#a259ff]" />
              <div>
                <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                  Accounting Period
                </label>
                <BrandDropdown
                  options={[
                    { value: '', label: 'Select period...', disabled: true },
                    ...periods.map(period => ({
                      value: period.code,
                      label: period.code,
                      badge: period.status,
                      description: `${new Date(period.start_date).toLocaleDateString()} - ${new Date(period.end_date).toLocaleDateString()}`
                    }))
                  ]}
                  value={selectedPeriod}
                  onChange={setSelectedPeriod}
                  disabled={periodsLoading}
                  placeholder="Select period..."
                />
              </div>
            </div>

            {lastUpdated && (
              <div className="text-right">
                <p className="text-sm text-[#b0b0d0]">Last updated</p>
                <p className="text-white font-medium">{lastUpdated.toLocaleString()}</p>
              </div>
            )}
          </div>
        </BrandCard>

        {/* Balance Summary */}
        <BrandStatsGrid className="mb-6">
          <BrandStatCard
            title="Total Debits"
            value={`€${(totals.debit / 100).toLocaleString()}`}
            icon={<BarChart3 className="w-8 h-8 text-red-400" />}
          />
          <BrandStatCard
            title="Total Credits"
            value={`€${(totals.credit / 100).toLocaleString()}`}
            icon={<BarChart3 className="w-8 h-8 text-green-400" />}
          />
          <BrandStatCard
            title="Balance Status"
            value={isBalanced ? "Balanced" : "Out of Balance"}
            icon={<Filter className="w-8 h-8 text-blue-400" />}
          />
          <BrandStatCard
            title="Account Count"
            value={trialBalance.length.toString()}
            icon={<BarChart3 className="w-8 h-8 text-purple-400" />}
          />
        </BrandStatsGrid>

        {/* Balance Alert */}
        {trialBalance.length > 0 && (
          <BrandCard borderGradient={isBalanced ? "success" : "error"} className="p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${isBalanced ? 'bg-green-400' : 'bg-red-400'}`} />
              <p className="text-white font-medium">
                {isBalanced 
                  ? "✓ Trial balance is balanced - debits equal credits"
                  : `⚠ Trial balance is out of balance by €${Math.abs(totals.debit - totals.credit) / 100}`
                }
              </p>
            </div>
          </BrandCard>
        )}

        {/* Trial Balance Table */}
        <BrandCard borderGradient="secondary" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#23233a]/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#b0b0d0]">Account</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#b0b0d0]">Type</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-[#b0b0d0]">Debit</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-[#b0b0d0]">Credit</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-[#b0b0d0]">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#23233a]/30">
                {reportLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-[#b0b0d0]">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                      Loading trial balance...
                    </td>
                  </tr>
                ) : trialBalance.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-[#b0b0d0]">
                      {selectedPeriod ? 'No account balances found for this period' : 'Please select a period to view trial balance'}
                    </td>
                  </tr>
                ) : (
                  <>
                    {accountTypeOrder.map(type => {
                      const accounts = groupedAccounts[type];
                      if (!accounts || accounts.length === 0) return null;

                      return (
                        <React.Fragment key={type}>
                          {/* Type Header */}
                          <tr className="bg-[#a259ff]/10">
                            <td colSpan={5} className="px-6 py-3">
                              <BrandBadge variant="primary" size="sm">
                                {type.toUpperCase().replace('-', ' ')}
                              </BrandBadge>
                            </td>
                          </tr>
                          
                          {/* Accounts in this type */}
                          {accounts.map((account) => (
                            <tr key={account.account_id} className="hover:bg-white/5">
                              <td className="px-6 py-4">
                                <div>
                                  <p className="text-white font-medium">{account.code}</p>
                                  <p className="text-[#b0b0d0] text-sm">{account.name}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <BrandBadge variant="secondary" size="sm">
                                  {account.type}
                                </BrandBadge>
                              </td>
                              <td className="px-6 py-4 text-right text-white font-mono">
                                {account.total_debit_cents > 0 ? `€${(account.total_debit_cents / 100).toLocaleString()}` : '-'}
                              </td>
                              <td className="px-6 py-4 text-right text-white font-mono">
                                {account.total_credit_cents > 0 ? `€${(account.total_credit_cents / 100).toLocaleString()}` : '-'}
                              </td>
                              <td className={`px-6 py-4 text-right font-mono ${
                                account.balance_cents > 0 ? 'text-green-400' : 
                                account.balance_cents < 0 ? 'text-red-400' : 'text-[#b0b0d0]'
                              }`}>
                                {account.balance_cents !== 0 ? `€${(account.balance_cents / 100).toLocaleString()}` : '-'}
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      );
                    })}

                    {/* Totals Row */}
                    <tr className="bg-[#23233a]/80 font-bold border-t-2 border-[#a259ff]">
                      <td className="px-6 py-4 text-white">TOTALS</td>
                      <td className="px-6 py-4"></td>
                      <td className="px-6 py-4 text-right text-white font-mono">
                        €{(totals.debit / 100).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-white font-mono">
                        €{(totals.credit / 100).toLocaleString()}
                      </td>
                      <td className={`px-6 py-4 text-right font-mono ${
                        isBalanced ? 'text-green-400' : 'text-red-400'
                      }`}>
                        €{Math.abs(totals.debit - totals.credit) / 100}
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </BrandCard>

        {error && (
          <BrandCard borderGradient="error" className="p-4 mt-6">
            <p className="text-red-400">{error}</p>
          </BrandCard>
        )}
      </BrandPageLayout>
    </BrandBackground>
  );
};

export default TrialBalance;

