import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface AccountingPeriod {
  id: string;
  org_id: string;
  code: string;
  start_date: string;
  end_date: string;
  status: 'open' | 'closing' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  org_id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'income' | 'expense' | 'contra-asset' | 'contra-liability';
  is_postable: boolean;
  parent_id?: string;
  currency: string;
  tax_code?: string;
  created_at: string;
  updated_at: string;
}

export interface Journal {
  id: string;
  org_id: string;
  period_id: string;
  jdate: string;
  source: string;
  source_table?: string;
  source_id?: string;
  memo?: string;
  posted: boolean;
  created_at: string;
  updated_at: string;
}

export interface JournalLine {
  id: string;
  journal_id: string;
  org_id: string;
  account_id: string;
  debit_cents: number;
  credit_cents: number;
  currency: string;
  description?: string;
  created_at: string;
}

export interface TrialBalanceItem {
  org_id: string;
  account_id: string;
  code: string;
  name: string;
  type: string;
  total_debit_cents: number;
  total_credit_cents: number;
  balance_cents: number;
}

export interface ProfitLossData {
  org_id: string;
  period_id: string;
  code: string;
  start_date: string;
  end_date: string;
  status: string;
  revenue_cents: number;
  expense_cents: number;
  profit_cents: number;
}

export interface BalanceSheetItem {
  org_id: string;
  period_id: string;
  code: string;
  account_id: string;
  account_code: string;
  account_name: string;
  type: string;
  balance_cents: number;
}

// Hook for managing accounting periods
export const useAccountingPeriods = () => {
  const { user } = useAuth();
  const [periods, setPeriods] = useState<AccountingPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPeriods = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('acc_periods')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      setPeriods(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createPeriod = async (period: Omit<AccountingPeriod, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('acc_periods')
        .insert(period)
        .select()
        .single();

      if (error) throw error;
      
      setPeriods(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const closePeriod = async (periodId: string, orgId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('accounting-close-period', {
        body: { org_id: orgId, period_id: periodId }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      // Refresh periods after closing
      await fetchPeriods();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    if (user) {
      fetchPeriods();
    }
  }, [user]);

  return {
    periods,
    loading,
    error,
    fetchPeriods,
    createPeriod,
    closePeriod,
    setError
  };
};

// Hook for managing chart of accounts
export const useChartOfAccounts = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('acc_accounts')
        .select('*')
        .order('code');

      if (error) throw error;
      setAccounts(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async (account: Omit<Account, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('acc_accounts')
        .insert(account)
        .select()
        .single();

      if (error) throw error;
      
      setAccounts(prev => [...prev, data].sort((a, b) => a.code.localeCompare(b.code)));
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    try {
      const { data, error } = await supabase
        .from('acc_accounts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setAccounts(prev => 
        prev.map(acc => acc.id === id ? data : acc).sort((a, b) => a.code.localeCompare(b.code))
      );
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      const { error } = await supabase
        .from('acc_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setAccounts(prev => prev.filter(acc => acc.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    if (user) {
      fetchAccounts();
    }
  }, [user]);

  return {
    accounts,
    loading,
    error,
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    setError
  };
};

// Hook for journal management
export const useJournals = () => {
  const { user } = useAuth();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJournals = async (limit = 100) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('acc_journals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setJournals(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchJournalDetail = async (journalId: string) => {
    try {
      const [journalResult, linesResult] = await Promise.all([
        supabase
          .from('acc_journals')
          .select('*')
          .eq('id', journalId)
          .single(),
        supabase
          .from('acc_journal_lines')
          .select(`
            *,
            account:account_id(code, name, type)
          `)
          .eq('journal_id', journalId)
      ]);

      if (journalResult.error) throw journalResult.error;
      if (linesResult.error) throw linesResult.error;

      return {
        journal: journalResult.data,
        lines: linesResult.data || []
      };
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    if (user) {
      fetchJournals();
    }
  }, [user]);

  return {
    journals,
    loading,
    error,
    fetchJournals,
    fetchJournalDetail,
    setError
  };
};

// Hook for financial reports
export const useFinancialReports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async (
    orgId: string,
    reportType: 'trial_balance' | 'profit_loss' | 'balance_sheet' | 'general_ledger' | 'aging' | 'vat_summary' | 'all',
    periodCode?: string,
    startDate?: string,
    endDate?: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('accounting-report', {
        body: {
          org_id: orgId,
          period_code: periodCode,
          report_type: reportType,
          start_date: startDate,
          end_date: endDate
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    generateReport,
    setError
  };
};

// Hook for manual journal entries
export const useManualJournalEntry = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createManualJournal = async (
    orgId: string,
    date: string,
    memo: string,
    lines: Array<{
      account_id: string;
      debit_cents: number;
      credit_cents: number;
      description: string;
    }>
  ) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .rpc('acc_post_journal', {
          p_org: orgId,
          p_date: date,
          p_source: 'Manual',
          p_source_table: null,
          p_source_id: null,
          p_memo: memo,
          p_lines: JSON.stringify(lines)
        });

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createManualJournal,
    setError
  };
};


