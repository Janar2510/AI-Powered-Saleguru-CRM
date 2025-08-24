import React, { useState } from 'react';
import { useMarketplace } from '../hooks/useMarketplace';
import { usePayments } from '../hooks/usePayments';
import AppCard from '../components/marketplace/AppCard';
import { MarketplaceApp } from '../types/Marketplace';
import { 
  BrandPageLayout,
  BrandCard, 
  BrandButton, 
  BrandInput, 
  BrandDropdown,
  BrandBadge
} from '../contexts/BrandDesignContext';
import { 
  Store, 
  Search, 
  Grid3X3, 
  List, 
  TrendingUp,
  Download,
  DollarSign,
  Zap,
  MessageSquare,
  Mail,
  BarChart3,
  Plus,
  CreditCard,
  Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Marketplace: React.FC = () => {
  const { 
    apps, 
    categories, 
    loading, 
    installApp, 
    uninstallApp,
    getStats 
  } = useMarketplace();
  
  const { processOneTimePayment } = usePayments();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPricing, setSelectedPricing] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedApp, setSelectedApp] = useState<MarketplaceApp | null>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);

  const stats = getStats();

  // Filter and sort apps
  const filteredApps = apps.filter(app => {
    if (selectedCategory !== 'all' && app.category !== selectedCategory) return false;
    if (selectedPricing !== 'all' && app.pricing_model !== selectedPricing) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (!app.name.toLowerCase().includes(term) && 
          !app.description.toLowerCase().includes(term) &&
          !app.developer.toLowerCase().includes(term)) {
        return false;
      }
    }
    return true;
  });

  const sortedApps = [...filteredApps].sort((a, b) => {
    switch (sortBy) {
      case 'popular': return b.install_count - a.install_count;
      case 'newest': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'rating': return b.rating - a.rating;
      case 'name': return a.name.localeCompare(b.name);
      default: return 0;
    }
  });

  const handleInstallApp = async (app: MarketplaceApp) => {
    setSelectedApp(app);
    
    if (app.pricing_model === 'free') {
      const success = await installApp({
        app_id: app.id,
        trial_mode: false
      });
      
      if (success) {
        console.log(`Successfully installed ${app.name}`);
      }
    } else {
      setShowInstallModal(true);
    }
  };

  const handleUninstallApp = async (app: MarketplaceApp) => {
    const success = await uninstallApp(app.id);
    if (success) {
      console.log(`Successfully uninstalled ${app.name}`);
    }
  };

  const handleViewApp = (app: MarketplaceApp) => {
    console.log('Viewing app:', app.name);
  };

  const handlePayAndInstall = async (app: MarketplaceApp, useFreeTrial: boolean = false) => {
    if (useFreeTrial && app.free_trial_days) {
      const success = await installApp({
        app_id: app.id,
        trial_mode: true
      });
      
      if (success) {
        setShowInstallModal(false);
        console.log(`Started free trial for ${app.name}`);
      }
    } else if (app.price_monthly) {
      const success = await processOneTimePayment(app.id, app.price_monthly, 'pm_default');
      
      if (success) {
        await installApp({
          app_id: app.id,
          trial_mode: false
        });
        setShowInstallModal(false);
        console.log(`Successfully purchased and installed ${app.name}`);
      }
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'automation': return Zap;
      case 'communication': return MessageSquare;
      case 'marketing': return Mail;
      case 'finance': return DollarSign;
      case 'sales': return TrendingUp;
      case 'analytics': return BarChart3;
      default: return Package;
    }
  };

  return (
    <BrandPageLayout
      title="Marketplace"
      subtitle="Discover and install powerful integrations to extend your CRM"
      actions={
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-black/20 rounded-lg p-1">
            <BrandButton 
              size="sm"
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </BrandButton>
            <BrandButton 
              size="sm"
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </BrandButton>
          </div>
          
          <BrandButton>
            <Plus className="w-4 h-4 mr-2" />
            Submit App
          </BrandButton>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Statistics and Categories - Same Row */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Statistics - 4 columns */}
          <div className="xl:col-span-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-2 gap-4">
              <BrandCard className="p-4" borderGradient="primary">
                <div className="flex items-center gap-3">
                  <Store className="w-8 h-8 text-blue-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-2xl font-bold text-white">{stats.total_apps}</div>
                    <div className="text-sm text-white/60 truncate">Total Apps</div>
                  </div>
                </div>
              </BrandCard>

              <BrandCard className="p-4" borderGradient="secondary">
                <div className="flex items-center gap-3">
                  <Download className="w-8 h-8 text-green-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-2xl font-bold text-white">{stats.installed_apps}</div>
                    <div className="text-sm text-white/60 truncate">Installed</div>
                  </div>
                </div>
              </BrandCard>

              <BrandCard className="p-4" borderGradient="accent">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-purple-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-2xl font-bold text-white">{stats.popular_categories.length}</div>
                    <div className="text-sm text-white/60 truncate">Categories</div>
                  </div>
                </div>
              </BrandCard>

              <BrandCard className="p-4" borderGradient="logo">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-yellow-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-2xl font-bold text-white">€{stats.total_spent / 100}</div>
                    <div className="text-sm text-white/60 truncate">Monthly Spend</div>
                  </div>
                </div>
              </BrandCard>
            </div>
          </div>

          {/* Categories - 8 columns */}
          <div className="xl:col-span-8">
            <BrandCard className="p-6 h-full" borderGradient="secondary">
              <h3 className="text-lg font-semibold text-white mb-4">Browse by Category</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-4">
                {/* All Categories Button */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <BrandButton
                    variant={selectedCategory === 'all' ? 'primary' : 'ghost'}
                    className={`w-full p-4 h-auto flex flex-col items-center gap-2 ${
                      selectedCategory === 'all' ? 'bg-blue-600/20 border-blue-500/50' : ''
                    }`}
                    onClick={() => setSelectedCategory('all')}
                  >
                    <Package className="w-6 h-6" />
                    <div className="text-center">
                      <div className="font-medium text-sm">All</div>
                      <div className="text-xs opacity-70">{stats.total_apps} apps</div>
                    </div>
                  </BrandButton>
                </motion.div>

                {categories.map((category) => {
                  const Icon = getCategoryIcon(category.id);
                  const isSelected = selectedCategory === category.id;
                  
                  return (
                    <motion.div
                      key={category.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <BrandButton
                        variant={isSelected ? 'primary' : 'ghost'}
                        className={`w-full p-4 h-auto flex flex-col items-center gap-2 ${
                          isSelected ? 'bg-blue-600/20 border-blue-500/50' : ''
                        }`}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <Icon className="w-6 h-6" />
                        <div className="text-center">
                          <div className="font-medium text-sm">{category.name}</div>
                          <div className="text-xs opacity-70">{category.app_count} apps</div>
                        </div>
                      </BrandButton>
                    </motion.div>
                  );
                })}
              </div>
            </BrandCard>
          </div>
        </div>

        {/* Search and Filters */}
        <BrandCard className="p-4 md:p-6" borderGradient="primary">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
              <BrandInput
                placeholder="Search apps by name, description, or developer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            
            <div className="flex flex-wrap gap-2 md:gap-3">
              <BrandDropdown
                value={selectedPricing}
                onChange={setSelectedPricing}
                options={[
                  { value: 'all', label: 'All Pricing' },
                  { value: 'free', label: 'Free' },
                  { value: 'freemium', label: 'Freemium' },
                  { value: 'paid', label: 'Paid' }
                ]}
              />
              
              <BrandDropdown
                value={sortBy}
                onChange={setSortBy}
                options={[
                  { value: 'popular', label: 'Most Popular' },
                  { value: 'newest', label: 'Newest' },
                  { value: 'rating', label: 'Highest Rated' },
                  { value: 'name', label: 'Name A-Z' }
                ]}
              />
              
              <BrandButton
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedPricing('all');
                  setSortBy('popular');
                }}
                className="px-4"
              >
                Clear All
              </BrandButton>
            </div>
          </div>
        </BrandCard>

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {searchTerm ? `Search results for "${searchTerm}"` : 
               selectedCategory !== 'all' ? `${categories.find(c => c.id === selectedCategory)?.name} Apps` : 
               'All Apps'}
            </h2>
            <p className="text-white/60">{sortedApps.length} apps found</p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {selectedCategory !== 'all' && (
              <BrandBadge variant="blue" className="text-xs">
                {categories.find(c => c.id === selectedCategory)?.name}
              </BrandBadge>
            )}
            {selectedPricing !== 'all' && (
              <BrandBadge variant="green" className="text-xs">
                {selectedPricing}
              </BrandBadge>
            )}
            {searchTerm && (
              <BrandBadge variant="purple" className="text-xs">
                Search: "{searchTerm.length > 20 ? searchTerm.substring(0, 20) + '...' : searchTerm}"
              </BrandBadge>
            )}
          </div>
        </div>

        {/* Apps Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : sortedApps.length === 0 ? (
          <BrandCard className="p-12 text-center" borderGradient="secondary">
            <Store className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No apps found</h3>
            <p className="text-white/60">
              Try adjusting your search criteria or browse different categories
            </p>
          </BrandCard>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6'
              : 'space-y-4'
          }>
            <AnimatePresence>
              {sortedApps.map((app) => (
                <AppCard
                  key={app.id}
                  app={app}
                  variant={viewMode}
                  onInstall={handleInstallApp}
                  onView={handleViewApp}
                  onUninstall={handleUninstallApp}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Install/Payment Modal */}
        {showInstallModal && selectedApp && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <BrandCard className="max-w-md w-full p-6" borderGradient="primary">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-4">
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                    {selectedApp.name.charAt(0)}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{selectedApp.name}</h3>
                <p className="text-white/60">{selectedApp.short_description}</p>
              </div>

              {selectedApp.price_monthly && (
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-white mb-2">
                    €{selectedApp.price_monthly / 100}/month
                  </div>
                  {selectedApp.free_trial_days && (
                    <div className="text-green-400">
                      {selectedApp.free_trial_days} day free trial available
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3">
                {selectedApp.free_trial_days && (
                  <BrandButton 
                    className="w-full"
                    onClick={() => handlePayAndInstall(selectedApp, true)}
                  >
                    Start Free Trial
                  </BrandButton>
                )}
                
                <BrandButton 
                  variant={selectedApp.free_trial_days ? 'outline' : 'primary'}
                  className="w-full"
                  onClick={() => handlePayAndInstall(selectedApp, false)}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {selectedApp.price_monthly ? `Pay €${selectedApp.price_monthly / 100}` : 'Install'}
                </BrandButton>
                
                <BrandButton 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => setShowInstallModal(false)}
                >
                  Cancel
                </BrandButton>
              </div>
            </BrandCard>
          </div>
        )}
      </div>
    </BrandPageLayout>
  );
};

export default Marketplace;