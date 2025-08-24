import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  FileText, 
  Edit, 
  Copy, 
  Trash2, 
  Eye, 
  Send, 
  CheckCircle, 
  XCircle, 
  Clock,
  Calculator,
  Search,
  Filter,
  Download,
  RefreshCw,
  ShoppingCart
} from 'lucide-react';
import {
  BrandBackground,
  BrandPageLayout,
  BrandCard,
  BrandButton,
  BrandInput,
  BrandBadge,
  BrandStatCard,
  BrandStatsGrid
} from '../contexts/BrandDesignContext';
import { useQuotes, Quote } from '../hooks/useQuotes';
import { QuickActionsBar } from '../components/accounting/QuickActionsBar';

const Quotes: React.FC = () => {
  const navigate = useNavigate();
  const { quotes, loading, error, fetchQuotes, deleteQuote, duplicateQuote, convertToInvoice } = useQuotes();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filter quotes based on search and status
  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.quote_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || quote.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    totalQuotes: quotes.length,
    draftQuotes: quotes.filter(q => q.status === 'draft').length,
    sentQuotes: quotes.filter(q => q.status === 'sent').length,
    acceptedQuotes: quotes.filter(q => q.status === 'accepted').length,
    totalValue: quotes.reduce((sum, q) => sum + q.total_cents, 0)
  };

  const getStatusBadge = (status: Quote['status']) => {
    switch (status) {
      case 'draft':
        return <BrandBadge variant="secondary" size="sm">Draft</BrandBadge>;
      case 'sent':
        return <BrandBadge variant="warning" size="sm">Sent</BrandBadge>;
      case 'accepted':
        return <BrandBadge variant="success" size="sm">Accepted</BrandBadge>;
      case 'declined':
        return <BrandBadge variant="danger" size="sm">Declined</BrandBadge>;
      case 'expired':
        return <BrandBadge variant="error" size="sm">Expired</BrandBadge>;
      default:
        return <BrandBadge variant="secondary" size="sm">{status}</BrandBadge>;
    }
  };

  const getStatusIcon = (status: Quote['status']) => {
    switch (status) {
      case 'draft':
        return <Edit className="w-4 h-4 text-gray-400" />;
      case 'sent':
        return <Send className="w-4 h-4 text-yellow-400" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'declined':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'expired':
        return <Clock className="w-4 h-4 text-orange-400" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatCurrency = (cents: number) => {
    return `€${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const handleQuoteAction = async (action: string, quoteId: string) => {
    switch (action) {
      case 'edit':
        navigate(`/quotes/${quoteId}/edit`);
        break;
      case 'view':
        navigate(`/quotes/${quoteId}`);
        break;
      case 'duplicate':
        await duplicateQuote(quoteId);
        break;
      case 'delete':
        if (window.confirm('Are you sure you want to delete this quote?')) {
          await deleteQuote(quoteId);
        }
        break;
      case 'convert':
        await convertToInvoice(quoteId);
        break;
      case 'convert-order':
        const quote = quotes.find(q => q.id === quoteId);
        if (quote) {
          navigate('/sales-orders/create', { state: { fromQuote: quote } });
        }
        break;
    }
  };

  const exportQuotes = () => {
    const csvData = [
      ['Quote Number', 'Customer', 'Date', 'Valid Until', 'Status', 'Total'],
      ...filteredQuotes.map(quote => [
        quote.quote_number,
        quote.customer_name,
        new Date(quote.quote_date).toLocaleDateString(),
        new Date(quote.valid_until).toLocaleDateString(),
        quote.status,
        formatCurrency(quote.total_cents)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quotes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (error && quotes.length === 0) {
    return (
      <BrandBackground>
        <BrandPageLayout title="Quotes" subtitle="Quote management system">
          <BrandCard borderGradient="error" className="p-6 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <BrandButton variant="secondary" onClick={fetchQuotes}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </BrandButton>
          </BrandCard>
        </BrandPageLayout>
      </BrandBackground>
    );
  }

  return (
    <BrandBackground>
      <BrandPageLayout
        title="Quotes"
        subtitle="Create and manage customer quotes with automated calculations"
        actions={
          <div className="flex space-x-3">
            <BrandButton 
              variant="secondary" 
              onClick={exportQuotes}
              disabled={filteredQuotes.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </BrandButton>
            
            <BrandButton variant="secondary" onClick={fetchQuotes} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </BrandButton>
            
            <BrandButton variant="primary" onClick={() => navigate('/quotes/create')}>
              <Plus className="w-4 h-4 mr-2" />
              New Quote
            </BrandButton>
          </div>
        }
      >
        <QuickActionsBar currentPage="/quotes" />

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <BrandStatCard
            title="Total Quotes"
            value={stats.totalQuotes.toString()}
            icon={<FileText className="w-8 h-8 text-blue-400" />}
            borderGradient="primary"
          />
          
          <BrandStatCard
            title="Draft Quotes"
            value={stats.draftQuotes.toString()}
            icon={<Edit className="w-8 h-8 text-gray-400" />}
            borderGradient="secondary"
          />
          
          <BrandStatCard
            title="Sent Quotes"
            value={stats.sentQuotes.toString()}
            icon={<Send className="w-8 h-8 text-yellow-400" />}
            borderGradient="yellow"
          />
          
          <BrandStatCard
            title="Total Value"
            value={formatCurrency(stats.totalValue)}
            icon={<Calculator className="w-8 h-8 text-green-400" />}
            borderGradient="success"
          />
        </div>

        {/* Filters */}
        <BrandCard borderGradient="primary" className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b0b0d0] z-10" />
              <BrandInput
                type="text"
                placeholder="Search quotes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b0b0d0] z-10" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/10 backdrop-blur-xl border-2 border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-transparent transition-all duration-300"
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-[#b0b0d0]">
                {filteredQuotes.length} of {quotes.length} quotes
              </span>
            </div>
          </div>
        </BrandCard>

        {/* Quotes List */}
        <BrandCard borderGradient="secondary" className="overflow-hidden">
          {loading && quotes.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-[#a259ff] animate-spin mr-3" />
              <span className="text-[#b0b0d0]">Loading quotes...</span>
            </div>
          ) : filteredQuotes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-[#b0b0d0] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                {searchTerm || statusFilter ? 'No quotes found' : 'No quotes yet'}
              </h3>
              <p className="text-[#b0b0d0] mb-6">
                {searchTerm || statusFilter 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Create your first quote to get started'
                }
              </p>
              {(!searchTerm && !statusFilter) && (
                <BrandButton variant="primary" onClick={() => navigate('/quotes/create')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Quote
                </BrandButton>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-6 text-[#b0b0d0] font-medium">Quote #</th>
                    <th className="text-left py-4 px-6 text-[#b0b0d0] font-medium">Customer</th>
                    <th className="text-left py-4 px-6 text-[#b0b0d0] font-medium">Date</th>
                    <th className="text-left py-4 px-6 text-[#b0b0d0] font-medium">Valid Until</th>
                    <th className="text-left py-4 px-6 text-[#b0b0d0] font-medium">Status</th>
                    <th className="text-right py-4 px-6 text-[#b0b0d0] font-medium">Total</th>
                    <th className="text-center py-4 px-6 text-[#b0b0d0] font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuotes.map((quote) => (
                    <tr key={quote.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(quote.status)}
                          <span className="font-mono text-white">{quote.quote_number}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="text-white font-medium">{quote.customer_name}</p>
                          <p className="text-sm text-[#b0b0d0]">{quote.customer_email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-[#b0b0d0]">
                        {new Date(quote.quote_date).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-[#b0b0d0]">
                        {new Date(quote.valid_until).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(quote.status)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="text-white font-semibold">
                          {formatCurrency(quote.total_cents)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center space-x-1">
                          <BrandButton
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuoteAction('view', quote.id)}
                            title="View Quote"
                          >
                            <Eye className="w-4 h-4" />
                          </BrandButton>
                          
                          <BrandButton
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuoteAction('edit', quote.id)}
                            title="Edit Quote"
                          >
                            <Edit className="w-4 h-4" />
                          </BrandButton>
                          
                          <BrandButton
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuoteAction('duplicate', quote.id)}
                            title="Duplicate Quote"
                          >
                            <Copy className="w-4 h-4" />
                          </BrandButton>
                          
                          <BrandButton
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuoteAction('convert-order', quote.id)}
                            title="Convert to Sales Order"
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </BrandButton>
                          
                          {quote.status === 'accepted' && (
                            <BrandButton
                              variant="ghost"
                              size="sm"
                              onClick={() => handleQuoteAction('convert', quote.id)}
                              title="Convert to Invoice"
                              className="text-green-400 hover:text-green-300"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </BrandButton>
                          )}
                          
                          <BrandButton
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuoteAction('delete', quote.id)}
                            title="Delete Quote"
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </BrandButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </BrandCard>
      </BrandPageLayout>
    </BrandBackground>
  );
};

export default Quotes;