import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit, Trash2, Search, Filter, ArrowLeft, Home, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  BrandBackground,
  BrandPageLayout,
  BrandCard,
  BrandButton,
  BrandInput,
  BrandBadge
} from '../../contexts/BrandDesignContext';
import { useChartOfAccounts, Account } from '../../hooks/useAccounting';
import { useAuth } from '../../contexts/AuthContext';
import { BrandDropdown } from '../../components/ui/BrandDropdown';

const ACCOUNT_TYPES = [
  { value: 'asset', label: 'Asset', color: 'success' },
  { value: 'liability', label: 'Liability', color: 'error' },
  { value: 'equity', label: 'Equity', color: 'purple' },
  { value: 'income', label: 'Income', color: 'success' },
  { value: 'expense', label: 'Expense', color: 'warning' },
  { value: 'contra-asset', label: 'Contra-Asset', color: 'secondary' },
  { value: 'contra-liability', label: 'Contra-Liability', color: 'secondary' }
] as const;

interface AccountFormData {
  code: string;
  name: string;
  type: Account['type'];
  is_postable: boolean;
  currency: string;
  tax_code: string;
}

const ChartOfAccounts: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { accounts, loading, error, createAccount, updateAccount, deleteAccount, setError } = useChartOfAccounts();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState<AccountFormData>({
    code: '',
    name: '',
    type: 'asset',
    is_postable: true,
    currency: 'EUR',
    tax_code: ''
  });

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = 
      account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || account.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    const typeConfig = ACCOUNT_TYPES.find(t => t.value === type);
    return typeConfig?.color || 'secondary';
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      type: 'asset',
      is_postable: true,
      currency: 'EUR',
      tax_code: ''
    });
    setEditingAccount(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.org_id) {
      setError('Organization ID not found');
      return;
    }

    try {
      if (editingAccount) {
        await updateAccount(editingAccount.id, formData);
      } else {
        await createAccount({
          ...formData,
          org_id: user.org_id
        });
      }
      resetForm();
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleEdit = (account: Account) => {
    setFormData({
      code: account.code,
      name: account.name,
      type: account.type,
      is_postable: account.is_postable,
      currency: account.currency,
      tax_code: account.tax_code || ''
    });
    setEditingAccount(account);
    setShowForm(true);
  };

  const handleDelete = async (account: Account) => {
    if (window.confirm(`Are you sure you want to delete account ${account.code} - ${account.name}?`)) {
      try {
        await deleteAccount(account.id);
      } catch (err) {
        // Error is handled by the hook
      }
    }
  };

  return (
    <BrandBackground>
      <BrandPageLayout
        title="Chart of Accounts"
        subtitle="Manage your accounting structure and account hierarchy"
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
            
            <BrandButton variant="primary" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Account
            </BrandButton>
          </div>
        }
      >
        {/* Filters */}
        <BrandCard borderGradient="primary" className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b0b0d0] z-10" />
              <BrandInput
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <BrandDropdown
              options={[
                { value: '', label: 'All Types' },
                ...ACCOUNT_TYPES.map(type => ({
                  value: type.value,
                  label: type.label,
                  description: `${type.value} accounts`
                }))
              ]}
              value={typeFilter}
              onChange={setTypeFilter}
              placeholder="Filter by type"
            />
          </div>
        </BrandCard>

        {/* Account Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <BrandCard borderGradient="primary" className="w-full max-w-md">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-6">
                  {editingAccount ? 'Edit Account' : 'Add New Account'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                      Account Code *
                    </label>
                    <BrandInput
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                      placeholder="e.g., 1000"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                      Account Name *
                    </label>
                    <BrandInput
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Cash"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                      Account Type *
                    </label>
                    <BrandDropdown
                      label=""
                      options={ACCOUNT_TYPES.map(type => ({
                        value: type.value,
                        label: type.label,
                        description: `${type.value.replace('-', ' ')} account type`
                      }))}
                      value={formData.type}
                      onChange={(value) => setFormData(prev => ({ ...prev, type: value as Account['type'] }))}
                      placeholder="Select account type"
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="is_postable"
                      checked={formData.is_postable}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_postable: e.target.checked }))}
                      className="w-4 h-4 text-[#a259ff] bg-[#23233a] border-[#23233a]/30 rounded focus:ring-[#a259ff] focus:ring-2"
                    />
                    <label htmlFor="is_postable" className="text-white text-sm">
                      Allow posting (uncheck for header accounts)
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                        Currency
                      </label>
                      <BrandInput
                        value={formData.currency}
                        onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                        placeholder="EUR"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                        Tax Code
                      </label>
                      <BrandInput
                        value={formData.tax_code}
                        onChange={(e) => setFormData(prev => ({ ...prev, tax_code: e.target.value }))}
                        placeholder="VAT20"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4">
                    <BrandButton variant="secondary" onClick={resetForm}>
                      Cancel
                    </BrandButton>
                    <BrandButton variant="primary" type="submit">
                      {editingAccount ? 'Update' : 'Create'} Account
                    </BrandButton>
                  </div>
                </form>
              </div>
            </BrandCard>
          </div>
        )}

        {/* Accounts Table */}
        <BrandCard borderGradient="secondary" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#23233a]/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#b0b0d0]">Code</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#b0b0d0]">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#b0b0d0]">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#b0b0d0]">Currency</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#b0b0d0]">Tax Code</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#b0b0d0]">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-[#b0b0d0]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#23233a]/30">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-[#b0b0d0]">
                      Loading accounts...
                    </td>
                  </tr>
                ) : filteredAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-[#b0b0d0]">
                      {searchTerm || typeFilter ? 'No accounts match your filters' : 'No accounts found'}
                    </td>
                  </tr>
                ) : (
                  filteredAccounts.map((account) => (
                    <tr key={account.id} className="hover:bg-white/5">
                      <td className="px-6 py-4 text-white font-mono">{account.code}</td>
                      <td className="px-6 py-4 text-white">{account.name}</td>
                      <td className="px-6 py-4">
                        <BrandBadge variant={getTypeColor(account.type)} size="sm">
                          {ACCOUNT_TYPES.find(t => t.value === account.type)?.label}
                        </BrandBadge>
                      </td>
                      <td className="px-6 py-4 text-[#b0b0d0]">{account.currency}</td>
                      <td className="px-6 py-4 text-[#b0b0d0]">{account.tax_code || '-'}</td>
                      <td className="px-6 py-4">
                        <BrandBadge variant={account.is_postable ? 'success' : 'secondary'} size="sm">
                          {account.is_postable ? 'Postable' : 'Header'}
                        </BrandBadge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(account)}
                            className="p-2 text-[#b0b0d0] hover:text-white hover:bg-white/10 rounded"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(account)}
                            className="p-2 text-[#b0b0d0] hover:text-red-400 hover:bg-red-500/10 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </BrandCard>
      </BrandPageLayout>
    </BrandBackground>
  );
};

export default ChartOfAccounts;

