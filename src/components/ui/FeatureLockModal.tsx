import React from 'react';
import { XCircle } from 'lucide-react';

interface FeatureLockModalProps {
  featureName: string;
  requiredPlan: 'pro' | 'team';
  onClose: () => void;
}

export const FeatureLockModal: React.FC<FeatureLockModalProps> = ({
  featureName,
  requiredPlan,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-secondary-800 border border-secondary-700 rounded-lg shadow-lg p-8 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
          aria-label="Close"
        >
          <XCircle className="w-6 h-6" />
        </button>
        <div className="text-center">
          <div className="mb-4">
            <XCircle className="w-12 h-12 text-accent mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {featureName} is locked
          </h2>
          <p className="text-dark-400 mb-4">
            This feature is available on the <span className="text-accent font-semibold">{requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)} Plan</span>.<br />
            Upgrade your plan to unlock {featureName}.
          </p>
          <button
            onClick={onClose}
            className="bg-accent hover:bg-accent/80 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeatureLockModal; 