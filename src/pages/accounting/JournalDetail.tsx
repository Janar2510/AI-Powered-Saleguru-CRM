import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, RefreshCw } from 'lucide-react';
import {
  BrandBackground,
  BrandPageLayout,
  BrandCard,
  BrandButton,
  BrandBadge
} from '../../contexts/BrandDesignContext';
import { useJournals } from '../../hooks/useAccounting';

const JournalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchJournalDetail } = useJournals();
  
  const [journal, setJournal] = useState<any>(null);
  const [lines, setLines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadJournalDetail();
    }
  }, [id]);

  const loadJournalDetail = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await fetchJournalDetail(id);
      setJournal(data.journal);
      setLines(data.lines);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalDebit = lines.reduce((sum, line) => sum + (line.debit_cents || 0), 0);
  const totalCredit = lines.reduce((sum, line) => sum + (line.credit_cents || 0), 0);
  const isBalanced = totalDebit === totalCredit;

  if (loading) {
    return (
      <BrandBackground>
        <BrandPageLayout title="Loading..." subtitle="Loading journal details...">
          <BrandCard className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-[#a259ff]" />
            <p className="text-[#b0b0d0]">Loading journal entry...</p>
          </BrandCard>
        </BrandPageLayout>
      </BrandBackground>
    );
  }

  if (error || !journal) {
    return (
      <BrandBackground>
        <BrandPageLayout title="Error" subtitle="Failed to load journal details">
          <BrandCard borderGradient="error" className="p-6">
            <p className="text-red-400">{error || 'Journal not found'}</p>
            <BrandButton variant="secondary" onClick={() => navigate('/accounting/journals')} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Journals
            </BrandButton>
          </BrandCard>
        </BrandPageLayout>
      </BrandBackground>
    );
  }

  return (
    <BrandBackground>
      <BrandPageLayout
        title={`Journal Entry #${journal.id.slice(-8)}`}
        subtitle={`${journal.source} • ${new Date(journal.jdate).toLocaleDateString()}`}
        actions={
          <BrandButton variant="secondary" onClick={() => navigate('/accounting/journals')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Journals
          </BrandButton>
        }
      >
        {/* Journal Header */}
        <BrandCard borderGradient="primary" className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Date</label>
              <p className="text-white">{new Date(journal.jdate).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Source</label>
              <BrandBadge variant="primary">{journal.source}</BrandBadge>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Status</label>
              <BrandBadge variant={journal.posted ? 'success' : 'warning'}>
                {journal.posted ? 'Posted' : 'Unposted'}
              </BrandBadge>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Reference</label>
              <p className="text-white font-mono text-sm">
                {journal.source_id ? `${journal.source_table}:${journal.source_id.slice(-8)}` : 'Manual'}
              </p>
            </div>
          </div>
          
          {journal.memo && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-[#b0b0d0] mb-1">Description</label>
              <p className="text-white">{journal.memo}</p>
            </div>
          )}
        </BrandCard>

        {/* Balance Status */}
        <BrandCard borderGradient={isBalanced ? "success" : "error"} className="p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${isBalanced ? 'bg-green-400' : 'bg-red-400'}`} />
              <p className="text-white font-medium">
                {isBalanced 
                  ? "✓ Entry is balanced" 
                  : `⚠ Entry is out of balance by €${Math.abs(totalDebit - totalCredit) / 100}`
                }
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#b0b0d0]">Total: €{totalDebit / 100}</p>
            </div>
          </div>
        </BrandCard>

        {/* Journal Lines */}
        <BrandCard borderGradient="secondary" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#23233a]/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#b0b0d0]">Account</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#b0b0d0]">Description</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-[#b0b0d0]">Debit</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-[#b0b0d0]">Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#23233a]/30">
                {lines.map((line, index) => (
                  <tr key={line.id} className="hover:bg-white/5">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{(line as any).account?.code}</p>
                        <p className="text-[#b0b0d0] text-sm">{(line as any).account?.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white">
                      {line.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-right text-white font-mono">
                      {line.debit_cents > 0 ? `€${(line.debit_cents / 100).toLocaleString()}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-right text-white font-mono">
                      {line.credit_cents > 0 ? `€${(line.credit_cents / 100).toLocaleString()}` : '-'}
                    </td>
                  </tr>
                ))}
                
                {/* Totals Row */}
                <tr className="bg-[#23233a]/80 font-bold border-t-2 border-[#a259ff]">
                  <td className="px-6 py-4 text-white">TOTALS</td>
                  <td className="px-6 py-4"></td>
                  <td className="px-6 py-4 text-right text-white font-mono">
                    €{(totalDebit / 100).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-white font-mono">
                    €{(totalCredit / 100).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </BrandCard>
      </BrandPageLayout>
    </BrandBackground>
  );
};

export default JournalDetail;

