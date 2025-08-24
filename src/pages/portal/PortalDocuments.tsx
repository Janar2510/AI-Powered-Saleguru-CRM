import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, PenTool } from 'lucide-react';
import { 
  BrandCard, 
  BrandButton 
} from '../../contexts/BrandDesignContext';

const PortalDocuments: React.FC = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Your Documents</h1>
        <p className="text-white/70">View, sign, and manage your documents</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <BrandCard borderGradient="green" className="text-center py-12">
          <FileText className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Coming Soon</h3>
          <p className="text-white/70 text-lg mb-4">Document management coming soon...</p>
          <p className="text-white/50 text-sm mb-6">
            This feature will allow you to view, sign, and download documents
          </p>
          <div className="flex items-center justify-center space-x-4">
            <BrandButton variant="primary">
              <PenTool className="w-4 h-4 mr-2" />
              Request Signing Access
            </BrandButton>
            <BrandButton variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </BrandButton>
          </div>
        </BrandCard>
      </motion.div>
    </div>
  );
};

export default PortalDocuments;
