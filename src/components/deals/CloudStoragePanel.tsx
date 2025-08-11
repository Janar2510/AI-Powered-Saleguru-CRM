import React, { useState, useEffect } from 'react';
import { Cloud, Plus, ExternalLink, RefreshCw, FolderPlus, Link, Check, X } from 'lucide-react';
import { DealsAPI } from '../../lib/deals-api';
import { Card } from '../common/Card';
import { DealFolder, CloudStorageConnection } from '../../types/deals';
import { formatDistanceToNow } from 'date-fns';

interface CloudStoragePanelProps {
  dealId: string;
  onFolderCreated: () => void;
}

const CloudStoragePanel: React.FC<CloudStoragePanelProps> = ({ 
  dealId, 
  onFolderCreated 
}) => {
  const [folders, setFolders] = useState<DealFolder[]>([]);
  const [connections, setConnections] = useState<CloudStorageConnection[]>([]);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'google_drive' | 'onedrive' | 'dropbox' | 'box'>('google_drive');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [dealId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [foldersData, connectionsData] = await Promise.all([
        DealsAPI.getDealFolders(dealId),
        DealsAPI.getCloudStorageConnections()
      ]);
      setFolders(foldersData);
      setConnections(connectionsData);
    } catch (err) {
      console.error('Error loading cloud storage data:', err);
      setError('Failed to load cloud storage data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectStorage = async () => {
    try {
      setSyncing(true);
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockConnection = {
        provider: selectedProvider,
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh-token',
        expiresAt: new Date(Date.now() + 3600 * 1000),
        providerUserId: 'mock-user-id'
      };
      const connection = await DealsAPI.createCloudStorageConnection(
        mockConnection.provider,
        mockConnection.accessToken,
        mockConnection.refreshToken,
        mockConnection.expiresAt,
        mockConnection.providerUserId
      );
      await createDealFolder(connection.id);
      setShowConnectModal(false);
      onFolderCreated();
    } catch (err) {
      console.error('Error connecting storage:', err);
      setError('Failed to connect storage. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const createDealFolder = async (connectionId: string) => {
    try {
      const deal = await DealsAPI.getDealById(dealId);
      if (!deal) throw new Error('Deal not found');
      const folderName = `${deal.title} (${deal.deal_id})`;
      await DealsAPI.createDealFolder(
        dealId,
        connectionId,
        folderName,
        `/SaleToru CRM/Deals/${folderName}`
      );
      loadData();
    } catch (err) {
      console.error('Error creating deal folder:', err);
      throw err;
    }
  };

  const handleSyncFolder = async (folderId: string) => {
    try {
      setSyncing(true);
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 1500));
      await DealsAPI.updateDealFolder(folderId, {
        last_synced_at: new Date().toISOString()
      });
      loadData();
    } catch (err) {
      console.error('Error syncing folder:', err);
      setError('Failed to sync folder. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'google_drive':
        return <GoogleDriveIcon className="w-5 h-5" />;
      case 'onedrive':
        return <OneDriveIcon className="w-5 h-5" />;
      case 'dropbox':
        return <DropboxIcon className="w-5 h-5" />;
      case 'box':
        return <BoxIcon className="w-5 h-5" />;
      default:
        return <Cloud className="w-5 h-5 text-blue-400" />;
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'google_drive':
        return 'Google Drive';
      case 'onedrive':
        return 'OneDrive';
      case 'dropbox':
        return 'Dropbox';
      case 'box':
        return 'Box';
      default:
        return provider;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Cloud Storage</h3>
        <button
          onClick={() => setShowConnectModal(true)}
          className="bg-accent hover:bg-accent/80 text-white px-3 py-1.5 rounded-lg flex items-center space-x-1 text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Connect Storage</span>
        </button>
      </div>
      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-3 rounded-lg flex items-center space-x-2">
          <X className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      {/* Folders List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : folders.length > 0 ? (
          folders.map(folder => (
            <Card key={folder.id} className="p-4 hover:shadow-md transition-all" hover>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    {getProviderIcon(folder.storage_connection?.provider || 'cloud')}
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{folder.folder_name}</h4>
                    <div className="flex items-center space-x-2 text-xs text-dark-400 mt-1">
                      <span>{getProviderName(folder.storage_connection?.provider || 'cloud')}</span>
                      <span>•</span>
                      <span className="flex items-center">
                        <RefreshCw className="w-3 h-3 mr-1" />
                        {folder.last_synced_at 
                          ? formatDistanceToNow(new Date(folder.last_synced_at), { addSuffix: true })
                          : 'Never synced'
                        }
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {folder.folder_url && (
                    <a 
                      href={folder.folder_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <button 
                    className="p-1.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
                    onClick={() => handleSyncFolder(folder.id)}
                    disabled={syncing}
                  >
                    <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <Cloud className="w-12 h-12 text-dark-400 mx-auto mb-3" />
            <p className="text-dark-400 mb-4">No cloud folders connected</p>
            <button
              onClick={() => setShowConnectModal(true)}
              className="bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Connect Cloud Storage
            </button>
          </div>
        )}
      </div>
      {/* Connect Storage Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Connect Cloud Storage</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Select Provider
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'google_drive', name: 'Google Drive', icon: GoogleDriveIcon },
                    { id: 'onedrive', name: 'OneDrive', icon: OneDriveIcon },
                    { id: 'dropbox', name: 'Dropbox', icon: DropboxIcon },
                    { id: 'box', name: 'Box', icon: BoxIcon }
                  ].map(provider => {
                    const Icon = provider.icon;
                    return (
                      <button
                        key={provider.id}
                        onClick={() => setSelectedProvider(provider.id as any)}
                        className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-colors ${
                          selectedProvider === provider.id
                            ? 'border-accent bg-accent/10'
                            : 'border-dark-300 hover:border-dark-200'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-white">{provider.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="bg-dark-200/50 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <FolderPlus className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white text-sm font-medium">What happens next?</p>
                    <p className="text-dark-400 text-sm mt-1">
                      After connecting, we'll create a folder for this deal in your {getProviderName(selectedProvider)} account.
                      All files uploaded to this deal will be automatically synced to the cloud folder.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowConnectModal(false)}
                  className="px-4 py-2 text-dark-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConnectStorage}
                  disabled={syncing}
                  className="bg-accent hover:bg-accent/80 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  {syncing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <Link className="w-4 h-4" />
                      <span>Connect</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// Cloud provider icons
const GoogleDriveIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor" style={{ color: '#4285F4' }}>
    <path d="M4.5 14.7l-.7 1.2L0 21.8h5.8l3.8-7.1z" fill="#0066DA"/>
    <path d="M14.7 14.7l3.8 7.1H24l-4.5-7.1z" fill="#00AC47"/>
    <path d="M9.2 14.7h5.5l-3.8 7.1H5.8z" fill="#EA4335"/>
    <path d="M12 7.6l3.8-7.1h-5.5L6.5 7.6z" fill="#00832D"/>
    <path d="M14.7 14.7h5.5l-3.8-7.1h-5.5z" fill="#2684FC"/>
    <path d="M6.5 7.6h5.5l3.8-7.1H9.2z" fill="#FFBA00"/>
  </svg>
);

const OneDriveIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor" style={{ color: '#0078D4' }}>
    <path d="M10.146 1.248a5.53 5.53 0 0 1 6.773 2.675l.142.251-3.321 1.385a2.309 2.309 0 0 0-2.88-1.082l-.153.061-4.236 1.82a2.308 2.308 0 0 0-1.075 3.035l.062.152.066.139-3.293 1.411a5.53 5.53 0 0 1 7.915-9.847zm6.914 3.131a5.516 5.516 0 0 1 1.17 2.563l.062.302.033.302a5.53 5.53 0 0 1-3.308 5.63L7.94 15.985a3.709 3.709 0 0 0 .376-5.983l-.145-.119-.137-.099 3.29-1.411a2.31 2.31 0 0 0 2.893 1.093l.153-.06 3.321-1.386a5.494 5.494 0 0 1-.63-3.641zM7.663 10.57a2.31 2.31 0 0 1 .76 2.84l-.062.152-1.533 3.35a.772.772 0 0 1-.453.41l-.12.035H3.323a3.708 3.708 0 0 1 4.34-6.787zm9.654.573a3.707 3.707 0 0 1-1.147 5.095l-.182.123-7.143 3.034a.774.774 0 0 1-.21.066l-.127.017h14.169a3.708 3.708 0 0 0-5.36-8.335z" fill="#0078D4"/>
  </svg>
);

const DropboxIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor" style={{ color: '#0061FF' }}>
    <path d="M6 2l6 4-6 4 6 4-6 4 6-4 6 4-6-4 6-4-6-4 6 4-6-4z" fill="#0061FF"/>
  </svg>
);

const BoxIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor" style={{ color: '#0061D5' }}>
    <path d="M12 2L2 8.5l10 6.5 10-6.5L12 2zM2 15.5L12 22l10-6.5V8.5L12 15 2 8.5v7z" fill="#0061D5"/>
  </svg>
);

export default CloudStoragePanel; 