import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Receipt, 
  FileText, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,

} from 'lucide-react';
import { 
  BrandStatsGrid,
  BrandStatCard,
  BrandCard, 
  BrandButton, 
  BrandBadge 
} from '../../contexts/BrandDesignContext';
import { 
  fetchPortalOrders, 
  fetchPortalInvoices, 
  fetchPortalQuotes, 
  fetchPortalDocuments 
} from '../../lib/portalFetch';

interface PortalStats {
  orders: {
    total: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
  };
  invoices: {
    total: number;
    open: number;
    paid: number;
    overdue: number;
  };
  quotes: {
    total: number;
    active: number;
    expired: number;
  };
  documents: {
    total: number;
    signed: number;
    pending: number;
  };
}

const PortalDashboard: React.FC = () => {
  const [stats, setStats] = useState<PortalStats>({
    orders: { total: 0, confirmed: 0, processing: 0, shipped: 0, delivered: 0 },
    invoices: { total: 0, open: 0, paid: 0, overdue: 0 },
    quotes: { total: 0, active: 0, expired: 0 },
    documents: { total: 0, signed: 0, pending: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [ordersResult, invoicesResult, quotesResult, documentsResult] = await Promise.all([
        fetchPortalOrders(),
        fetchPortalInvoices(),
        fetchPortalQuotes(),
        fetchPortalDocuments()
      ]);

      // Process orders data
      const orders = ordersResult.data || [];
      const orderStats = {
        total: orders.length,
        confirmed: orders.filter((o: any) => o.status === 'confirmed').length,
        processing: orders.filter((o: any) => o.status === 'processing').length,
        shipped: orders.filter((o: any) => o.status === 'shipped').length,
        delivered: orders.filter((o: any) => o.status === 'delivered').length,
      };

      // Process invoices data
      const invoices = invoicesResult.data || [];
      const invoiceStats = {
        total: invoices.length,
        open: invoices.filter((i: any) => i.status === 'open' || i.status === 'sent').length,
        paid: invoices.filter((i: any) => i.status === 'paid').length,
        overdue: invoices.filter((i: any) => {
          if (i.status === 'paid') return false;
          const dueDate = new Date(i.due_date);
          return dueDate < new Date();
        }).length,
      };

      // Process quotes data
      const quotes = quotesResult.data || [];
      const quoteStats = {
        total: quotes.length,
        active: quotes.filter((q: any) => {
          if (!q.valid_until) return true;
          const validUntil = new Date(q.valid_until);
          return validUntil > new Date();
        }).length,
        expired: quotes.filter((q: any) => {
          if (!q.valid_until) return false;
          const validUntil = new Date(q.valid_until);
          return validUntil <= new Date();
        }).length,
      };

      // Process documents data
      const documents = documentsResult.data || [];
      const documentStats = {
        total: documents.length,
        signed: documents.filter((d: any) => d.esign_status === 'signed').length,
        pending: documents.filter((d: any) => d.esign_status !== 'signed').length,
      };

      setStats({
        orders: orderStats,
        invoices: invoiceStats,
        quotes: quoteStats,
        documents: documentStats
      });

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white/70">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
        <p className="text-red-400">{error}</p>
        <BrandButton onClick={loadDashboardData} variant="outline">
          Try Again
        </BrandButton>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <motion.h1 
          className="text-5xl font-bold mb-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <motion.span
            className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 3,
              ease: "linear",
              repeat: Infinity,
            }}
            style={{
              backgroundSize: "200% 200%",
            }}
          >
            Welcome to Your Portal
          </motion.span>
        </motion.h1>
        <motion.p 
          className="text-white/80 text-xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Manage your orders, invoices, quotes, and documents in one secure place
        </motion.p>
      </motion.div>
      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
      >
        <motion.div
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <BrandButton
            variant="primary"
            className="h-24 w-full flex flex-col items-center justify-center space-y-2 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:via-blue-400 hover:to-cyan-400 border-2 border-blue-400/30 shadow-lg shadow-blue-500/25 backdrop-blur-sm"
            onClick={() => window.location.href = '/portal/orders'}
          >
            <ShoppingCart className="w-6 h-6 text-white drop-shadow-lg" />
            <span className="text-white font-medium">View Orders</span>
          </BrandButton>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <BrandButton
            variant="primary"
            className="h-24 w-full flex flex-col items-center justify-center space-y-2 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 hover:from-purple-500 hover:via-purple-400 hover:to-pink-400 border-2 border-purple-400/30 shadow-lg shadow-purple-500/25 backdrop-blur-sm"
            onClick={() => window.location.href = '/portal/invoices'}
          >
            <Receipt className="w-6 h-6 text-white drop-shadow-lg" />
            <span className="text-white font-medium">Pay Invoices</span>
          </BrandButton>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <BrandButton
            variant="primary"
            className="h-24 w-full flex flex-col items-center justify-center space-y-2 bg-gradient-to-br from-indigo-600 via-indigo-500 to-blue-500 hover:from-indigo-500 hover:via-indigo-400 hover:to-blue-400 border-2 border-indigo-400/30 shadow-lg shadow-indigo-500/25 backdrop-blur-sm"
            onClick={() => window.location.href = '/portal/quotes'}
          >
            <FileText className="w-6 h-6 text-white drop-shadow-lg" />
            <span className="text-white font-medium">Review Quotes</span>
          </BrandButton>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <BrandButton
            variant="primary"
            className="h-24 w-full flex flex-col items-center justify-center space-y-2 bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-500 hover:from-teal-500 hover:via-teal-400 hover:to-emerald-400 border-2 border-teal-400/30 shadow-lg shadow-teal-500/25 backdrop-blur-sm"
            onClick={() => window.location.href = '/portal/documents'}
          >
            <FileText className="w-6 h-6 text-white drop-shadow-lg" />
            <span className="text-white font-medium">Documents</span>
          </BrandButton>
        </motion.div>
      </motion.div>

      {/* Statistics Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <BrandStatCard
            icon={<ShoppingCart className="w-6 h-6 text-blue-400" />}
            title="Total Orders"
            value={stats.orders.total.toString()}
            trend={`${stats.orders.confirmed} confirmed`}
            borderGradient="blue"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <BrandStatCard
            icon={<Receipt className="w-6 h-6 text-yellow-400" />}
            title="Open Invoices"
            value={stats.invoices.open.toString()}
            trend={`${stats.invoices.overdue} overdue`}
            borderGradient="yellow"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <BrandStatCard
            icon={<FileText className="w-6 h-6 text-green-400" />}
            title="Active Quotes"
            value={stats.quotes.active.toString()}
            trend={`${stats.quotes.expired} expired`}
            borderGradient="green"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <BrandStatCard
            icon={<FileText className="w-6 h-6 text-purple-400" />}
            title="Documents"
            value={stats.documents.total.toString()}
            trend={`${stats.documents.signed} signed`}
            borderGradient="purple"
          />
        </motion.div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <BrandCard borderGradient="logo" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
            <BrandButton variant="outline" size="sm">
              View All
            </BrandButton>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">Order #SO-2025-001 confirmed</p>
                <p className="text-white/60 text-sm">2 hours ago</p>
              </div>
              <div className="flex-shrink-0">
                <BrandBadge variant="success">Confirmed</BrandBadge>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex-shrink-0">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">Invoice #INV-2025-001 due soon</p>
                <p className="text-white/60 text-sm">1 day ago</p>
              </div>
              <div className="flex-shrink-0">
                <BrandBadge variant="warning">Due Soon</BrandBadge>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">Quote #Q-2025-001 viewed</p>
                <p className="text-white/60 text-sm">3 days ago</p>
              </div>
              <div className="flex-shrink-0">
                <BrandBadge variant="info">Viewed</BrandBadge>
              </div>
            </div>
          </div>
        </BrandCard>
      </motion.div>
    </div>
  );
};

export default PortalDashboard;
