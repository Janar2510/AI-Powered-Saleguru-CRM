import React from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Users, DollarSign } from 'lucide-react';

import {
  BrandBackground,
  BrandPageLayout
} from '../contexts/BrandDesignContext';

import { DealsKanbanBoard } from '../components/deals/DealsKanbanBoard';

const DealsImproved: React.FC = () => {
  return (
    <BrandBackground>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-white mb-2">Deals Pipeline</h1>
            <p className="text-white/70 text-lg">Manage your sales opportunities and track deal progress</p>
          </motion.div>
        </div>

        {/* Main Content - Full Screen */}
        <div className="flex-1 px-8 py-6 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="h-full"
          >
            <DealsKanbanBoard />
          </motion.div>
        </div>
      </div>
    </BrandBackground>
  );
};

export default DealsImproved;
