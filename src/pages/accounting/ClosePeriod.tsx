import React, { useState, useEffect } from 'react';
import { Calendar, Lock, AlertTriangle, CheckCircle, TrendingUp, DollarSign, ArrowLeft, Home, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  BrandBackground, 
  BrandPageLayout, 
  BrandCard, 
  BrandButton, 
  BrandBadge 
} from '../../contexts/BrandDesignContext';
import { useAccountingPeriods, useFinancialReports } from '../../hooks/useAccounting';
import { useAuth } from '../../contexts/AuthContext';

const ClosePeriod: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { periods, loading: periodsLoading, closePeriod } = useAccountingPeriods();
  const { generateReport } = useFinancialReports();
  
  const [selectedPeriod, setSelectedPeriod] = useState<any>(null);
  const [closing, setClosing] = useState(false);
  const [financialSummary, setFinancialSummary] = useState<any>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const openPeriods = periods.filter(p => p.status === 'open');

  useEffect(() => {
    if (selectedPeriod && user?.org_id) {
      loadPeriodSummary();
    }
  }, [selectedPeriod, user?.org_id]);

  const loadPeriodSummary = async () => {
    if (!user?.org_id || !selectedPeriod) return;
    
    try {
      const data = await generateReport(user.org_id, 'profit_loss', selectedPeriod.code);
      setFinancialSummary(data.profit_loss);
    } catch (error) {
      console.error('Failed to load period summary:', error);
    }
  };

  const handleClosePeriod = async () => {
    if (!selectedPeriod || !user?.org_id) return;
    
    try {
      setClosing(true);
      await closePeriod(selectedPeriod.id, user.org_id);
      setShowConfirmation(false);
      setSelectedPeriod(null);
      setFinancialSummary(null);
    } catch (error) {
      console.error('Failed to close period:', error);
    } finally {
      setClosing(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return `€${(cents / 100).toLocaleString()}`;
  };

  return (
    <BrandBackground>
      <BrandPageLayout
        title="Close Period"
        subtitle="Close accounting periods and generate automated closing entries"
        actions={
          <div className="flex items-center space-x-3">
            <BrandButton variant="secondary" onClick={() => navigate('/accounting')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </BrandButton>
            
            <BrandButton variant="secondary" onClick={() => navigate('/accounting/trial-balance')}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Trial Balance
            </BrandButton>
            
            <BrandButton variant="secondary" onClick={() => navigate('/dashboard')}>
              <Home className="w-4 h-4 mr-2" />
              Main Dashboard
            </BrandButton>
          </div>
        }
      >
        {/* Period Selection */}
        <BrandCard borderGradient="primary" className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Select Period to Close</h3>
          
          {openPeriods.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <p className="text-white font-medium mb-2">All periods are closed</p>
              <p className="text-[#b0b0d0] text-sm">No open periods available to close</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {openPeriods.map((period) => (
                <button
                  key={period.id}
                  onClick={() => setSelectedPeriod(period)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedPeriod?.id === period.id
                      ? 'border-[#a259ff] bg-[#a259ff]/10'
                      : 'border-white/20 bg-white/5 hover:border-white/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">{period.code}</h4>
                    <BrandBadge variant="success" size="sm">
                      {period.status}
                    </BrandBadge>
                  </div>
                  <div className="text-sm text-[#b0b0d0]">
                    <p>{new Date(period.start_date).toLocaleDateString()} - {new Date(period.end_date).toLocaleDateString()}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </BrandCard>

        {/* Period Summary */}
        {selectedPeriod && (
          <BrandCard borderGradient="secondary" className="p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Period Summary: {selectedPeriod.code}</h3>
            
            {financialSummary ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <h4 className="text-white font-medium">Revenue</h4>
                  </div>
                  <p className="text-2xl font-bold text-green-400">
                    {formatCurrency(financialSummary.revenue_cents || 0)}
                  </p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <DollarSign className="w-5 h-5 text-red-400" />
                    <h4 className="text-white font-medium">Expenses</h4>
                  </div>
                  <p className="text-2xl font-bold text-red-400">
                    {formatCurrency(financialSummary.expense_cents || 0)}
                  </p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <CheckCircle className="w-5 h-5 text-[#a259ff]" />
                    <h4 className="text-white font-medium">Net Income</h4>
                  </div>
                  <p className={`text-2xl font-bold ${
                    (financialSummary.profit_cents || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatCurrency(financialSummary.profit_cents || 0)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-[#b0b0d0]">Loading period summary...</p>
              </div>
            )}
          </BrandCard>
        )}

        {/* Closing Process */}
        {selectedPeriod && (
          <BrandCard borderGradient="warning" className="p-6">
            <div className="flex items-start space-x-4">
              <AlertTriangle className="w-6 h-6 text-yellow-400 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Close Period: {selectedPeriod.code}</h3>
                
                <div className="bg-yellow-500/10 rounded-lg p-4 mb-4">
                  <h4 className="text-yellow-400 font-medium mb-2">What happens when you close this period:</h4>
                  <ul className="text-sm text-[#b0b0d0] space-y-1">
                    <li>• All revenue accounts will be closed to Retained Earnings</li>
                    <li>• All expense accounts will be closed to Retained Earnings</li>
                    <li>• Net income/loss will be transferred to Retained Earnings</li>
                    <li>• The period will be locked and no further entries can be posted</li>
                    <li>• Closing journal entries will be automatically generated</li>
                  </ul>
                </div>
                
                <div className="bg-red-500/10 rounded-lg p-4 mb-6">
                  <h4 className="text-red-400 font-medium mb-2">⚠️ Warning:</h4>
                  <p className="text-sm text-[#b0b0d0]">
                    Once a period is closed, it cannot be reopened. Make sure all transactions 
                    for this period have been recorded and reviewed before proceeding.
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <BrandButton 
                    variant="primary" 
                    onClick={() => setShowConfirmation(true)}
                    disabled={!financialSummary}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Close Period
                  </BrandButton>
                  
                  <BrandButton 
                    variant="secondary" 
                    onClick={() => {
                      setSelectedPeriod(null);
                      setFinancialSummary(null);
                    }}
                  >
                    Cancel
                  </BrandButton>
                </div>
              </div>
            </div>
          </BrandCard>
        )}

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <BrandCard borderGradient="error" className="w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                  <h3 className="text-lg font-semibold text-white">Confirm Period Close</h3>
                </div>
                
                <p className="text-[#b0b0d0] mb-6">
                  Are you sure you want to close period <strong className="text-white">{selectedPeriod?.code}</strong>? 
                  This action cannot be undone.
                </p>
                
                <div className="flex space-x-3">
                  <BrandButton 
                    variant="secondary" 
                    onClick={() => setShowConfirmation(false)}
                    disabled={closing}
                    className="flex-1"
                  >
                    Cancel
                  </BrandButton>
                  
                  <BrandButton 
                    variant="primary" 
                    onClick={handleClosePeriod}
                    disabled={closing}
                    className="flex-1"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    {closing ? 'Closing...' : 'Close Period'}
                  </BrandButton>
                </div>
              </div>
            </BrandCard>
          </div>
        )}
      </BrandPageLayout>
    </BrandBackground>
  );
};

export default ClosePeriod;
