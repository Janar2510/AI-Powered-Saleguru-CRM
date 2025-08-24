import React from 'react';
import { motion } from 'framer-motion';
import { User, Settings, Bell } from 'lucide-react';
import { 
  BrandCard, 
  BrandButton 
} from '../../contexts/BrandDesignContext';

const PortalProfile: React.FC = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Your Profile</h1>
        <p className="text-white/70">Manage your portal account and preferences</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <BrandCard borderGradient="purple" className="text-center py-12">
          <User className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Coming Soon</h3>
          <p className="text-white/70 text-lg mb-4">Profile management coming soon...</p>
          <p className="text-white/50 text-sm mb-6">
            This feature will allow you to update your profile and preferences
          </p>
          <div className="flex items-center justify-center space-x-4">
            <BrandButton variant="primary">
              <Settings className="w-4 h-4 mr-2" />
              Edit Profile
            </BrandButton>
            <BrandButton variant="outline">
              <Bell className="w-4 h-4 mr-2" />
              Notification Settings
            </BrandButton>
          </div>
        </BrandCard>
      </motion.div>
    </div>
  );
};

export default PortalProfile;
