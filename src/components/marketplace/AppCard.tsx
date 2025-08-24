import React from 'react';
import { MarketplaceApp } from '../../types/Marketplace';
import { 
  BrandCard, 
  BrandButton, 
  BrandBadge 
} from '../../contexts/BrandDesignContext';
import { 
  Star, 
  Download, 
  Check, 
  Euro, 
  Eye,
  Shield,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AppCardProps {
  app: MarketplaceApp;
  onInstall: (app: MarketplaceApp) => void;
  onView: (app: MarketplaceApp) => void;
  onUninstall?: (app: MarketplaceApp) => void;
  variant?: 'grid' | 'list';
}

const AppCard: React.FC<AppCardProps> = ({ 
  app, 
  onInstall, 
  onView, 
  onUninstall,
  variant = 'grid' 
}) => {
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const formatInstalls = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}k`;
    }
    return count.toString();
  };

  const getPricingBadge = () => {
    switch (app.pricing_model) {
      case 'free':
        return <BrandBadge variant="green">Free</BrandBadge>;
      case 'freemium':
        return <BrandBadge variant="blue">Freemium</BrandBadge>;
      case 'paid':
        return <BrandBadge variant="purple">Paid</BrandBadge>;
      case 'subscription':
        return <BrandBadge variant="orange">Subscription</BrandBadge>;
      default:
        return null;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'automation': return 'purple';
      case 'communication': return 'blue';
      case 'marketing': return 'green';
      case 'finance': return 'yellow';
      case 'sales': return 'orange';
      case 'analytics': return 'red';
      default: return 'secondary';
    }
  };

  if (variant === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <BrandCard 
          className="p-4 hover:scale-[1.01] transition-all duration-200"
          borderGradient="primary"
        >
          <div className="flex items-center gap-4">
            {/* App Icon */}
            <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden">
              {app.icon_url ? (
                <img 
                  src={app.icon_url} 
                  alt={app.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling!.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl" style={{display: app.icon_url ? 'none' : 'flex'}}>
                {app.name.charAt(0)}
              </div>
            </div>

            {/* App Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-white truncate">{app.name}</h3>
                {app.verified && (
                  <Shield className="w-4 h-4 text-blue-400" title="Verified Developer" />
                )}
                {getPricingBadge()}
                <BrandBadge variant={getCategoryColor(app.category)}>
                  {app.category}
                </BrandBadge>
              </div>
              
              <p className="text-white/70 text-sm mb-2 line-clamp-2">{app.short_description}</p>
              
              <div className="flex items-center gap-4 text-xs text-white/50">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span>{app.rating}</span>
                  <span>({app.review_count})</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  <span>{formatInstalls(app.install_count)} installs</span>
                </div>
                <span>by {app.developer}</span>
              </div>
            </div>

            {/* Price & Actions */}
            <div className="text-right">
              {app.pricing_model !== 'free' && app.price_monthly && (
                <div className="text-white font-semibold mb-2">
                  {formatPrice(app.price_monthly)}/mo
                  {app.free_trial_days && (
                    <div className="text-xs text-green-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {app.free_trial_days} day trial
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <BrandButton 
                  size="sm" 
                  variant="ghost"
                  onClick={() => onView(app)}
                >
                  <Eye className="w-4 h-4" />
                </BrandButton>
                
                {app.is_installed ? (
                  <div className="flex items-center gap-2">
                    <BrandBadge variant="green" className="flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Installed
                    </BrandBadge>
                    {onUninstall && (
                      <BrandButton 
                        size="sm" 
                        variant="outline"
                        onClick={() => onUninstall(app)}
                      >
                        Remove
                      </BrandButton>
                    )}
                  </div>
                ) : (
                  <BrandButton 
                    size="sm"
                    onClick={() => onInstall(app)}
                  >
                    Install
                  </BrandButton>
                )}
              </div>
            </div>
          </div>
        </BrandCard>
      </motion.div>
    );
  }

  // Grid variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <BrandCard 
        className="p-6 h-full flex flex-col hover:shadow-2xl transition-all duration-300"
        borderGradient="primary"
      >
        {/* App Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
            {app.icon_url ? (
              <img 
                src={app.icon_url} 
                alt={app.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling!.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl" style={{display: app.icon_url ? 'none' : 'flex'}}>
              {app.name.charAt(0)}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-white truncate">{app.name}</h3>
              {app.verified && (
                <Shield className="w-4 h-4 text-blue-400" title="Verified Developer" />
              )}
            </div>
            <p className="text-white/60 text-sm">{app.developer}</p>
            <div className="flex items-center gap-2 mt-2">
              {getPricingBadge()}
              <BrandBadge variant={getCategoryColor(app.category)} className="text-xs">
                {app.category}
              </BrandBadge>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-white/70 text-sm mb-4 flex-1 line-clamp-3">{app.short_description}</p>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-white/50 mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span>{app.rating}</span>
            <span>({app.review_count})</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            <span>{formatInstalls(app.install_count)}</span>
          </div>
        </div>

        {/* Pricing */}
        {app.pricing_model !== 'free' && app.price_monthly && (
          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-white flex items-center justify-center gap-1">
              <Euro className="w-5 h-5" />
              {formatPrice(app.price_monthly)}
              <span className="text-sm font-normal text-white/60">/month</span>
            </div>
            {app.free_trial_days && (
              <div className="text-xs text-green-400 flex items-center justify-center gap-1 mt-1">
                <Clock className="w-3 h-3" />
                {app.free_trial_days} day free trial
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto">
          <BrandButton 
            size="sm" 
            variant="ghost" 
            className="flex-1"
            onClick={() => onView(app)}
          >
            <Eye className="w-4 h-4 mr-2" />
            Details
          </BrandButton>
          
          {app.is_installed ? (
            <div className="flex items-center gap-2 flex-1">
              <BrandBadge variant="green" className="flex items-center gap-1 flex-1 justify-center">
                <Check className="w-3 h-3" />
                Installed
              </BrandBadge>
              {onUninstall && (
                <BrandButton 
                  size="sm" 
                  variant="outline"
                  onClick={() => onUninstall(app)}
                >
                  Remove
                </BrandButton>
              )}
            </div>
          ) : (
            <BrandButton 
              size="sm" 
              className="flex-1"
              onClick={() => onInstall(app)}
            >
              <Download className="w-4 h-4 mr-2" />
              Install
            </BrandButton>
          )}
        </div>
      </BrandCard>
    </motion.div>
  );
};

export default AppCard;
