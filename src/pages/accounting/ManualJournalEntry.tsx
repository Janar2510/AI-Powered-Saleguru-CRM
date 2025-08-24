import React, { useState, useEffect } from 'react';
import { Calculator, Plus, Trash2, Save, AlertCircle, CheckCircle, ArrowLeft, FileText, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  BrandBackground, 
  BrandPageLayout, 
  BrandCard, 
  BrandButton, 
  BrandInput, 
  BrandBadge 
} from '../../contexts/BrandDesignContext';
import { useChartOfAccounts, useManualJournalEntry } from '../../hooks/useAccounting';
import { useAuth } from '../../contexts/AuthContext';
import { BrandDropdown } from '../../components/ui/BrandDropdown';

interface JournalLine {
  id: string;
  account_id: string;
  account_name?: string;
  account_code?: string;
  description: string;
  debit_cents: number;
  credit_cents: number;
}

const ManualJournalEntry: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { accounts, loading: accountsLoading } = useChartOfAccounts();
  const { createManualJournal, loading: submitting } = useManualJournalEntry();
  
  const [memo, setMemo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [lines, setLines] = useState<JournalLine[]>([
    { id: '1', account_id: '', description: '', debit_cents: 0, credit_cents: 0 },
    { id: '2', account_id: '', description: '', debit_cents: 0, credit_cents: 0 }
  ]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const postableAccounts = accounts.filter(acc => acc.is_postable);

  const addLine = () => {
    const newLine: JournalLine = {
      id: Date.now().toString(),
      account_id: '',
      description: '',
      debit_cents: 0,
      credit_cents: 0
    };
    setLines([...lines, newLine]);
  };

  const removeLine = (id: string) => {
    if (lines.length > 2) {
      setLines(lines.filter(line => line.id !== id));
    }
  };

  const updateLine = (id: string, field: keyof JournalLine, value: any) => {
    setLines(lines.map(line => {
      if (line.id === id) {
        const updatedLine = { ...line, [field]: value };
        
        // Update account name and code when account_id changes
        if (field === 'account_id') {
          const account = accounts.find(acc => acc.id === value);
          if (account) {
            updatedLine.account_name = account.name;
            updatedLine.account_code = account.code;
          }
        }
        
        return updatedLine;
      }
      return line;
    }));
  };

  const getTotalDebits = () => {
    return lines.reduce((sum, line) => sum + line.debit_cents, 0);
  };

  const getTotalCredits = () => {
    return lines.reduce((sum, line) => sum + line.credit_cents, 0);
  };

  const isBalanced = () => {
    return getTotalDebits() === getTotalCredits() && getTotalDebits() > 0;
  };

  const validateEntry = () => {
    if (!memo.trim()) {
      return 'Memo/description is required';
    }
    
    if (!date) {
      return 'Date is required';
    }
    
    const validLines = lines.filter(line => 
      line.account_id && (line.debit_cents > 0 || line.credit_cents > 0)
    );
    
    if (validLines.length < 2) {
      return 'At least 2 lines with amounts are required';
    }
    
    if (!isBalanced()) {
      return 'Journal entry must be balanced (debits = credits)';
    }
    
    // Check for lines with both debit and credit
    const invalidLines = lines.filter(line => line.debit_cents > 0 && line.credit_cents > 0);
    if (invalidLines.length > 0) {
      return 'Each line can have either a debit or credit amount, not both';
    }
    
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateEntry();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    if (!user?.org_id) {
      setError('Organization ID not found');
      return;
    }
    
    try {
      setError(null);
      
      const validLines = lines
        .filter(line => line.account_id && (line.debit_cents > 0 || line.credit_cents > 0))
        .map(line => ({
          account_id: line.account_id,
          debit_cents: line.debit_cents,
          credit_cents: line.credit_cents,
          description: line.description || memo
        }));
      
      await createManualJournal(user.org_id, date, memo, validLines);
      
      setSuccess(true);
      
      // Reset form after success
      setTimeout(() => {
        setMemo('');
        setDate(new Date().toISOString().split('T')[0]);
        setLines([
          { id: '1', account_id: '', description: '', debit_cents: 0, credit_cents: 0 },
          { id: '2', account_id: '', description: '', debit_cents: 0, credit_cents: 0 }
        ]);
        setSuccess(false);
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to create journal entry');
    }
  };

  const formatCurrency = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  return (
    <BrandBackground>
      <BrandPageLayout
        title="Manual Journal Entry"
        subtitle="Create manual accounting journal entries with validation"
        actions={
          <div className="flex items-center space-x-3">
            <BrandButton variant="secondary" onClick={() => navigate('/accounting')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </BrandButton>
            
            <BrandButton variant="secondary" onClick={() => navigate('/accounting/journals')}>
              <FileText className="w-4 h-4 mr-2" />
              View Journals
            </BrandButton>
            
            <BrandBadge 
              variant={isBalanced() ? 'success' : 'warning'}
              className="px-3 py-1"
            >
              {isBalanced() ? 'Balanced' : 'Out of Balance'}
            </BrandBadge>
            
            <BrandButton 
              variant="primary" 
              onClick={handleSubmit}
              disabled={submitting || !isBalanced()}
            >
              <Save className="w-4 h-4 mr-2" />
              {submitting ? 'Saving...' : 'Save Entry'}
            </BrandButton>
          </div>
        }
      >
        {/* Entry Header */}
        <BrandCard borderGradient="primary" className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                Date *
              </label>
              <BrandInput
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                Reference/Memo *
              </label>
              <BrandInput
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="Enter journal entry description"
                required
              />
            </div>
          </div>
        </BrandCard>

        {/* Journal Lines */}
        <BrandCard borderGradient="secondary" className="overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Journal Lines</h3>
              <BrandButton variant="secondary" onClick={addLine}>
                <Plus className="w-4 h-4 mr-2" />
                Add Line
              </BrandButton>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#b0b0d0]">Account</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#b0b0d0]">Description</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-[#b0b0d0]">Debit</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-[#b0b0d0]">Credit</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-[#b0b0d0]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {lines.map((line) => (
                    <tr key={line.id}>
                      <td className="px-4 py-3">
                        <BrandDropdown
                          options={[
                            { value: '', label: 'Select Account', disabled: true },
                            ...postableAccounts.map(account => ({
                              value: account.id,
                              label: `${account.code} - ${account.name}`,
                              description: account.type
                            }))
                          ]}
                          value={line.account_id}
                          onChange={(value) => updateLine(line.id, 'account_id', value)}
                          placeholder="Select Account"
                        />
                      </td>
                      
                      <td className="px-4 py-3">
                        <BrandInput
                          type="text"
                          value={line.description}
                          onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                          placeholder="Line description"
                          className="text-sm"
                        />
                      </td>
                      
                      <td className="px-4 py-3">
                        <BrandInput
                          type="number"
                          step="0.01"
                          min="0"
                          value={formatCurrency(line.debit_cents)}
                          onChange={(e) => {
                            const value = Math.round(parseFloat(e.target.value || '0') * 100);
                            updateLine(line.id, 'debit_cents', value);
                            updateLine(line.id, 'credit_cents', 0); // Clear credit when debit is entered
                          }}
                          placeholder="0.00"
                          className="text-sm text-right"
                        />
                      </td>
                      
                      <td className="px-4 py-3">
                        <BrandInput
                          type="number"
                          step="0.01"
                          min="0"
                          value={formatCurrency(line.credit_cents)}
                          onChange={(e) => {
                            const value = Math.round(parseFloat(e.target.value || '0') * 100);
                            updateLine(line.id, 'credit_cents', value);
                            updateLine(line.id, 'debit_cents', 0); // Clear debit when credit is entered
                          }}
                          placeholder="0.00"
                          className="text-sm text-right"
                        />
                      </td>
                      
                      <td className="px-4 py-3 text-center">
                        {lines.length > 2 && (
                          <button
                            onClick={() => removeLine(line.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  
                  {/* Totals Row */}
                  <tr className="bg-white/10 font-semibold">
                    <td className="px-4 py-3 text-white">TOTALS</td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3 text-right text-white">
                      €{formatCurrency(getTotalDebits())}
                    </td>
                    <td className="px-4 py-3 text-right text-white">
                      €{formatCurrency(getTotalCredits())}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isBalanced() ? (
                        <CheckCircle className="w-5 h-5 text-green-400 mx-auto" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-400 mx-auto" />
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </BrandCard>

        {/* Status Messages */}
        {error && (
          <BrandCard borderGradient="error" className="p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400">{error}</p>
            </div>
          </BrandCard>
        )}
        
        {success && (
          <BrandCard borderGradient="success" className="p-4 mb-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <p className="text-green-400">Journal entry created successfully!</p>
            </div>
          </BrandCard>
        )}

        {/* Validation Info */}
        <BrandCard borderGradient="accent" className="p-4">
          <h4 className="text-sm font-medium text-white mb-2">Entry Rules:</h4>
          <ul className="text-xs text-[#b0b0d0] space-y-1">
            <li>• Total debits must equal total credits</li>
            <li>• At least 2 lines with amounts are required</li>
            <li>• Each line can have either a debit OR credit amount, not both</li>
            <li>• All lines must have an account selected</li>
            <li>• Date and memo are required</li>
          </ul>
        </BrandCard>
      </BrandPageLayout>
    </BrandBackground>
  );
};

export default ManualJournalEntry;
