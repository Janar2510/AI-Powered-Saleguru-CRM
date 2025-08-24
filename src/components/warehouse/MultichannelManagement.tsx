import React, { useState } from 'react';
import {
  Globe,
  ShoppingBag,
  ExternalLink,
  RefreshCw,
  Settings,
  Plus,
  Edit,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Package,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Search,
  Filter,
  Download,
  Upload,
  Zap,
  Smartphone,
  Monitor,
  Store,
  X,
  Save,
  Link
} from 'lucide-react';
import {
  BrandCard,
  BrandButton,
  BrandBadge,
  BrandInput,
  BrandPageLayout,
  BrandStatsGrid,
  BrandStatCard
} from '../../contexts/BrandDesignContext';
import {
  useMultichannelListings,
  useCreateMultichannelListing,
  useSyncMultichannelInventory,
  type MultichannelListing
} from '../../hooks/useEnhancedInventory';

interface MultichannelManagementProps {
  orgId: string;
}

interface ChannelConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (connection: ChannelConnection) => void;
  channel?: string;
}

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (listing: Partial<MultichannelListing>) => void;
}

interface ChannelConnection {
  channel: string;
  apiKey: string;
  secretKey: string;
  sellerId: string;
  storeUrl: string;
  syncInventory: boolean;
  syncPrice: boolean;
  defaultShippingTemplate: string;
  defaultReturnPolicy: string;
}

const channelIcons = {
  amazon: '🛒',
  ebay: '🎯',
  shopify: '🛍️',
  walmart: '🏪',
  etsy: '🎨',
  facebook: '📘',
  instagram: '📷',
  google: '🔍',
  website: '🌐',
  marketplace: '🏬'
};

const channelColors = {
  amazon: 'orange',
  ebay: 'blue',
  shopify: 'green',
  walmart: 'blue',
  etsy: 'orange',
  facebook: 'blue',
  instagram: 'purple',
  google: 'red',
  website: 'primary',
  marketplace: 'secondary'
} as const;

const ChannelConnectionModal: React.FC<ChannelConnectionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  channel = 'amazon'
}) => {
  const [formData, setFormData] = useState<ChannelConnection>({
    channel,
    apiKey: '',
    secretKey: '',
    sellerId: '',
    storeUrl: '',
    syncInventory: true,
    syncPrice: true,
    defaultShippingTemplate: '',
    defaultReturnPolicy: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <BrandCard borderGradient="primary" className="w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white flex items-center">
              <span className="text-2xl mr-2">{channelIcons[channel as keyof typeof channelIcons]}</span>
              Connect {channel.charAt(0).toUpperCase() + channel.slice(1)}
            </h2>
            <button onClick={onClose} className="text-[#b0b0d0] hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* API Credentials */}
            <BrandCard borderGradient="secondary" className="p-4">
              <h3 className="text-lg font-medium text-white mb-4">API Credentials</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    API Key *
                  </label>
                  <BrandInput
                    type="password"
                    value={formData.apiKey}
                    onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="Enter your API key"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Secret Key *
                  </label>
                  <BrandInput
                    type="password"
                    value={formData.secretKey}
                    onChange={(e) => setFormData(prev => ({ ...prev, secretKey: e.target.value }))}
                    placeholder="Enter your secret key"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Seller/Store ID
                  </label>
                  <BrandInput
                    value={formData.sellerId}
                    onChange={(e) => setFormData(prev => ({ ...prev, sellerId: e.target.value }))}
                    placeholder="Your seller or store ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Store URL
                  </label>
                  <BrandInput
                    value={formData.storeUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, storeUrl: e.target.value }))}
                    placeholder="https://yourstore.com"
                  />
                </div>
              </div>
            </BrandCard>

            {/* Sync Settings */}
            <BrandCard borderGradient="accent" className="p-4">
              <h3 className="text-lg font-medium text-white mb-4">Sync Settings</h3>
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.syncInventory}
                    onChange={(e) => setFormData(prev => ({ ...prev, syncInventory: e.target.checked }))}
                    className="w-4 h-4 text-[#a259ff] bg-[#23233a] border-[#23233a]/30 rounded focus:ring-[#a259ff] focus:ring-2"
                  />
                  <span className="text-white">Sync Inventory Levels</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.syncPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, syncPrice: e.target.checked }))}
                    className="w-4 h-4 text-[#a259ff] bg-[#23233a] border-[#23233a]/30 rounded focus:ring-[#a259ff] focus:ring-2"
                  />
                  <span className="text-white">Sync Pricing</span>
                </label>
              </div>
            </BrandCard>

            {/* Default Templates */}
            <BrandCard borderGradient="purple" className="p-4">
              <h3 className="text-lg font-medium text-white mb-4">Default Templates</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Shipping Template
                  </label>
                  <BrandInput
                    value={formData.defaultShippingTemplate}
                    onChange={(e) => setFormData(prev => ({ ...prev, defaultShippingTemplate: e.target.value }))}
                    placeholder="Default shipping template name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Return Policy
                  </label>
                  <textarea
                    value={formData.defaultReturnPolicy}
                    onChange={(e) => setFormData(prev => ({ ...prev, defaultReturnPolicy: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                    placeholder="Default return policy..."
                  />
                </div>
              </div>
            </BrandCard>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
              <BrandButton variant="secondary" onClick={onClose}>
                Cancel
              </BrandButton>
              <BrandButton variant="primary" type="submit">
                <Link className="w-4 h-4 mr-2" />
                Connect Channel
              </BrandButton>
            </div>
          </form>
        </div>
      </BrandCard>
    </div>
  );
};

const CreateListingModal: React.FC<CreateListingModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    product_id: '',
    channel: 'amazon',
    listing_title: '',
    listing_description: '',
    price: 0,
    quantity: 0,
    sync_inventory: true,
    sync_price: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      org_id: 'current-org-id', // Should be dynamic
      status: 'active'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <BrandCard borderGradient="primary" className="w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white flex items-center">
              <Package className="w-6 h-6 mr-2" />
              Create Channel Listing
            </h2>
            <button onClick={onClose} className="text-[#b0b0d0] hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Selection */}
            <BrandCard borderGradient="secondary" className="p-4">
              <h3 className="text-lg font-medium text-white mb-4">Product Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Product *
                  </label>
                  <select
                    value={formData.product_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, product_id: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                    required
                  >
                    <option value="">Select Product</option>
                    <option value="product-1">Laptop Stand Pro</option>
                    <option value="product-2">Wireless Mouse</option>
                    <option value="product-3">Gaming Keyboard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Sales Channel *
                  </label>
                  <select
                    value={formData.channel}
                    onChange={(e) => setFormData(prev => ({ ...prev, channel: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                  >
                    <option value="amazon">Amazon</option>
                    <option value="ebay">eBay</option>
                    <option value="shopify">Shopify</option>
                    <option value="walmart">Walmart</option>
                    <option value="etsy">Etsy</option>
                  </select>
                </div>
              </div>
            </BrandCard>

            {/* Listing Details */}
            <BrandCard borderGradient="accent" className="p-4">
              <h3 className="text-lg font-medium text-white mb-4">Listing Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Listing Title *
                  </label>
                  <BrandInput
                    value={formData.listing_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, listing_title: e.target.value }))}
                    placeholder="Product title for the channel"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.listing_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, listing_description: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                    placeholder="Product description for the channel..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                      Price *
                    </label>
                    <BrandInput
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#b0b0d0] mb-2">
                      Quantity *
                    </label>
                    <BrandInput
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>
            </BrandCard>

            {/* Sync Settings */}
            <BrandCard borderGradient="purple" className="p-4">
              <h3 className="text-lg font-medium text-white mb-4">Sync Settings</h3>
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.sync_inventory}
                    onChange={(e) => setFormData(prev => ({ ...prev, sync_inventory: e.target.checked }))}
                    className="w-4 h-4 text-[#a259ff] bg-[#23233a] border-[#23233a]/30 rounded focus:ring-[#a259ff] focus:ring-2"
                  />
                  <span className="text-white">Auto-sync inventory levels</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.sync_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, sync_price: e.target.checked }))}
                    className="w-4 h-4 text-[#a259ff] bg-[#23233a] border-[#23233a]/30 rounded focus:ring-[#a259ff] focus:ring-2"
                  />
                  <span className="text-white">Auto-sync pricing</span>
                </label>
              </div>
            </BrandCard>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
              <BrandButton variant="secondary" onClick={onClose}>
                Cancel
              </BrandButton>
              <BrandButton variant="primary" type="submit">
                <Save className="w-4 h-4 mr-2" />
                Create Listing
              </BrandButton>
            </div>
          </form>
        </div>
      </BrandCard>
    </div>
  );
};

const MultichannelManagement: React.FC<MultichannelManagementProps> = ({ orgId }) => {
  const [activeTab, setActiveTab] = useState<'listings' | 'channels' | 'sync' | 'analytics'>('listings');
  const [showChannelConnection, setShowChannelConnection] = useState(false);
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState('amazon');
  const [searchTerm, setSearchTerm] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: listings = [], isLoading } = useMultichannelListings(orgId);
  const createListingMutation = useCreateMultichannelListing();
  const syncInventoryMutation = useSyncMultichannelInventory();

  const handleConnectChannel = (channel: string) => {
    setSelectedChannel(channel);
    setShowChannelConnection(true);
  };

  const handleSaveConnection = (connection: ChannelConnection) => {
    // Save channel connection (would normally save to backend)
    localStorage.setItem(`channel_${connection.channel}`, JSON.stringify(connection));
    setShowChannelConnection(false);
  };

  const handleCreateListing = async (listing: Partial<MultichannelListing>) => {
    try {
      await createListingMutation.mutateAsync(listing);
      setShowCreateListing(false);
    } catch (error) {
      console.error('Error creating listing:', error);
    }
  };

  const handleSyncListing = async (listingId: string) => {
    try {
      await syncInventoryMutation.mutateAsync(listingId);
    } catch (error) {
      console.error('Error syncing listing:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'out_of_stock': return 'warning';
      case 'suspended': return 'error';
      default: return 'secondary';
    }
  };

  const filteredListings = listings.filter(listing =>
    (listing.listing_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     listing.channel.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (channelFilter === '' || listing.channel === channelFilter) &&
    (statusFilter === '' || listing.status === statusFilter)
  );

  // Mock connected channels data
  const connectedChannels = [
    { name: 'amazon', connected: true, lastSync: '2024-01-15T10:30:00Z', listings: 45, status: 'healthy' },
    { name: 'ebay', connected: true, lastSync: '2024-01-15T10:25:00Z', listings: 32, status: 'healthy' },
    { name: 'shopify', connected: true, lastSync: '2024-01-15T10:20:00Z', listings: 28, status: 'warning' },
    { name: 'walmart', connected: false, lastSync: null, listings: 0, status: 'disconnected' },
    { name: 'etsy', connected: false, lastSync: null, listings: 0, status: 'disconnected' }
  ];

  // Calculate stats
  const channelStats = {
    connectedChannels: connectedChannels.filter(c => c.connected).length,
    totalListings: listings.length,
    activeListings: listings.filter(l => l.status === 'active').length,
    totalRevenue: 125000 // Mock data
  };

  const listingStats = {
    amazon: listings.filter(l => l.channel === 'amazon').length,
    ebay: listings.filter(l => l.channel === 'ebay').length,
    shopify: listings.filter(l => l.channel === 'shopify').length,
    others: listings.filter(l => !['amazon', 'ebay', 'shopify'].includes(l.channel)).length
  };

  return (
    <BrandPageLayout
      title="Multichannel Management"
      subtitle="Manage product listings across all sales channels"
      actions={
        <div className="flex space-x-3">
          <BrandButton variant="secondary" onClick={() => setShowChannelConnection(true)}>
            <Link className="w-4 h-4 mr-2" />
            Connect Channel
          </BrandButton>
          <BrandButton variant="primary" onClick={() => setShowCreateListing(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Listing
          </BrandButton>
        </div>
      }
    >
      {/* Tabs */}
      <div className="flex space-x-1 border-b border-white/20 mb-6">
        {[
          { key: 'listings', label: 'Listings', icon: Package },
          { key: 'channels', label: 'Channels', icon: Globe },
          { key: 'sync', label: 'Sync Status', icon: RefreshCw },
          { key: 'analytics', label: 'Analytics', icon: BarChart3 }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`px-6 py-3 font-medium transition-colors flex items-center ${
              activeTab === key
                ? 'text-[#a259ff] border-b-2 border-[#a259ff]'
                : 'text-[#b0b0d0] hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4 mr-2" />
            {label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <BrandStatsGrid className="mb-6">
        {activeTab === 'listings' ? (
          <>
            <BrandStatCard
              title="Total Listings"
              value={channelStats.totalListings}
              icon={<Package className="w-8 h-8" />}
              color="primary"
            />
            <BrandStatCard
              title="Active Listings"
              value={channelStats.activeListings}
              icon={<CheckCircle className="w-8 h-8" />}
              color="green"
            />
            <BrandStatCard
              title="Amazon Listings"
              value={listingStats.amazon}
              icon={<span className="text-2xl">🛒</span>}
              color="orange"
            />
            <BrandStatCard
              title="Monthly Revenue"
              value={`$${channelStats.totalRevenue.toLocaleString()}`}
              icon={<DollarSign className="w-8 h-8" />}
              color="blue"
            />
          </>
        ) : (
          <>
            <BrandStatCard
              title="Connected Channels"
              value={channelStats.connectedChannels}
              icon={<Globe className="w-8 h-8" />}
              color="primary"
            />
            <BrandStatCard
              title="Total Listings"
              value={channelStats.totalListings}
              icon={<Package className="w-8 h-8" />}
              color="green"
            />
            <BrandStatCard
              title="Sync Health"
              value="98%"
              icon={<RefreshCw className="w-8 h-8" />}
              color="blue"
            />
            <BrandStatCard
              title="Monthly Revenue"
              value={`$${channelStats.totalRevenue.toLocaleString()}`}
              icon={<DollarSign className="w-8 h-8" />}
              color="purple"
            />
          </>
        )}
      </BrandStatsGrid>

      {/* Content based on active tab */}
      {activeTab === 'listings' && (
        <div className="space-y-6">
          {/* Filters */}
          <BrandCard borderGradient="primary" className="p-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b0b0d0] z-10" />
                  <BrandInput
                    placeholder="Search listings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={channelFilter}
                  onChange={(e) => setChannelFilter(e.target.value)}
                  className="bg-[#23233a]/50 border-2 border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                >
                  <option value="">All Channels</option>
                  <option value="amazon">Amazon</option>
                  <option value="ebay">eBay</option>
                  <option value="shopify">Shopify</option>
                  <option value="walmart">Walmart</option>
                  <option value="etsy">Etsy</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#23233a]/50 border-2 border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <BrandButton variant="secondary">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </BrandButton>
                <BrandButton variant="secondary">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync All
                </BrandButton>
              </div>
            </div>
          </BrandCard>

          {/* Listings */}
          <div className="space-y-4">
            {filteredListings.length > 0 ? (
              filteredListings.map((listing) => (
                <BrandCard key={listing.id} borderGradient="secondary" className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-${channelColors[listing.channel as keyof typeof channelColors]}-500/20`}>
                        {channelIcons[listing.channel as keyof typeof channelIcons]}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-white">
                            {listing.listing_title || 'Untitled Listing'}
                          </h3>
                          <BrandBadge variant={getStatusColor(listing.status)} size="sm">
                            {listing.status}
                          </BrandBadge>
                          <BrandBadge variant={channelColors[listing.channel as keyof typeof channelColors]} size="sm">
                            {listing.channel}
                          </BrandBadge>
                        </div>
                        <p className="text-[#b0b0d0]">
                          Price: ${listing.price?.toFixed(2) || '0.00'} • 
                          Quantity: {listing.quantity || 0} • 
                          Last Sync: {listing.last_sync_at ? new Date(listing.last_sync_at).toLocaleDateString() : 'Never'}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center space-x-1 text-sm">
                            <span className={`w-2 h-2 rounded-full ${listing.sync_inventory ? 'bg-green-400' : 'bg-gray-400'}`} />
                            <span className="text-[#b0b0d0]">Inventory Sync</span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm">
                            <span className={`w-2 h-2 rounded-full ${listing.sync_price ? 'bg-green-400' : 'bg-gray-400'}`} />
                            <span className="text-[#b0b0d0]">Price Sync</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <BrandButton
                        variant="secondary"
                        onClick={() => handleSyncListing(listing.id)}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Sync
                      </BrandButton>
                      <BrandButton variant="secondary">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </BrandButton>
                      <BrandButton variant="secondary">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </BrandButton>
                      <BrandButton variant="secondary">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open
                      </BrandButton>
                    </div>
                  </div>
                </BrandCard>
              ))
            ) : (
              <BrandCard borderGradient="accent" className="text-center py-12">
                <Package className="w-16 h-16 text-[#b0b0d0] mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No Listings Found</h3>
                <p className="text-[#b0b0d0] mb-6">
                  {searchTerm || channelFilter || statusFilter ? 
                    'Try adjusting your search criteria' : 
                    'Create your first multichannel listing to get started'}
                </p>
                <BrandButton variant="primary" onClick={() => setShowCreateListing(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Listing
                </BrandButton>
              </BrandCard>
            )}
          </div>
        </div>
      )}

      {activeTab === 'channels' && (
        <div className="space-y-4">
          {connectedChannels.map((channel) => (
            <BrandCard 
              key={channel.name} 
              borderGradient={channel.connected ? 'green' : 'secondary'} 
              className="p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-${channelColors[channel.name as keyof typeof channelColors]}-500/20`}>
                    {channelIcons[channel.name as keyof typeof channelIcons]}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-white capitalize">
                        {channel.name}
                      </h3>
                      <BrandBadge 
                        variant={channel.connected ? 'success' : 'secondary'} 
                        size="sm"
                      >
                        {channel.connected ? 'Connected' : 'Not Connected'}
                      </BrandBadge>
                      {channel.status === 'warning' && (
                        <BrandBadge variant="warning" size="sm">
                          Sync Issues
                        </BrandBadge>
                      )}
                    </div>
                    <p className="text-[#b0b0d0]">
                      {channel.connected ? (
                        <>
                          {channel.listings} listings • 
                          Last sync: {channel.lastSync ? new Date(channel.lastSync).toLocaleString() : 'Never'}
                        </>
                      ) : (
                        'Connect this channel to start listing products'
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {channel.connected ? (
                    <>
                      <BrandButton variant="secondary">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </BrandButton>
                      <BrandButton variant="green">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Sync Now
                      </BrandButton>
                    </>
                  ) : (
                    <BrandButton 
                      variant="primary" 
                      onClick={() => handleConnectChannel(channel.name)}
                    >
                      <Link className="w-4 h-4 mr-2" />
                      Connect
                    </BrandButton>
                  )}
                </div>
              </div>
            </BrandCard>
          ))}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Channel Performance */}
          <BrandCard borderGradient="primary" className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Channel Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(listingStats).map(([channel, count]) => (
                <div key={channel} className="text-center p-4 bg-white/5 rounded-lg">
                  <div className="text-2xl mb-2">
                    {channelIcons[channel as keyof typeof channelIcons]}
                  </div>
                  <div className="text-2xl font-bold text-white">{count}</div>
                  <div className="text-sm text-[#b0b0d0] capitalize">{channel} Listings</div>
                </div>
              ))}
            </div>
          </BrandCard>

          {/* Revenue by Channel */}
          <BrandCard borderGradient="secondary" className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Revenue by Channel</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">🛒</span>
                  <span className="text-white">Amazon</span>
                </div>
                <div className="text-white font-semibold">$65,000</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">🎯</span>
                  <span className="text-white">eBay</span>
                </div>
                <div className="text-white font-semibold">$35,000</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">🛍️</span>
                  <span className="text-white">Shopify</span>
                </div>
                <div className="text-white font-semibold">$25,000</div>
              </div>
            </div>
          </BrandCard>
        </div>
      )}

      {/* Modals */}
      <ChannelConnectionModal
        isOpen={showChannelConnection}
        onClose={() => setShowChannelConnection(false)}
        onSave={handleSaveConnection}
        channel={selectedChannel}
      />

      <CreateListingModal
        isOpen={showCreateListing}
        onClose={() => setShowCreateListing(false)}
        onSave={handleCreateListing}
      />
    </BrandPageLayout>
  );
};

export default MultichannelManagement;
