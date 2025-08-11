import React, { useState, useEffect } from 'react';
import { 
  Inbox, Send, FileText, AlertCircle, Trash, Archive, Star, Flag, Clock, 
  Calendar, Target, HelpCircle, Plus, Edit, Trash2, Folder, FolderOpen,
  Search, Filter, MoreHorizontal, Settings, RefreshCw, Download, Upload,
  Share2, Lock, Unlock, Eye, EyeOff, Bell, BellOff, Tag, Bookmark,
  Pin, Heart, ThumbsUp, ThumbsDown, MessageCircle, PhoneCall, Video,
  Camera, Mic, Headphones, Globe, MapPin, Phone, Mail, User, Users,
  Building, Home, ChevronDown
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import Dropdown from '../ui/Dropdown';
import Toggle from '../ui/Toggle';
import { BRAND } from '../../constants/theme';

interface Mailbox {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
  unread: number;
  color: string;
  type: 'system' | 'custom' | 'smart';
  rules?: MailboxRule[];
  isActive: boolean;
  isPrivate: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface MailboxRule {
  id: string;
  field: 'from' | 'to' | 'subject' | 'body' | 'category' | 'tags' | 'priority';
  operator: 'contains' | 'equals' | 'starts_with' | 'ends_with' | 'regex';
  value: string;
  isActive: boolean;
}

interface SmartMailboxManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onMailboxSelect: (mailboxId: string) => void;
  selectedMailbox: string;
}

const SmartMailboxManager: React.FC<SmartMailboxManagerProps> = ({
  isOpen,
  onClose,
  onMailboxSelect,
  selectedMailbox
}) => {
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([
    {
      id: 'inbox',
      name: 'Inbox',
      icon: <Inbox className="w-4 h-4" />,
      count: 1247,
      unread: 23,
      color: BRAND.COLORS.primary,
      type: 'system',
      isActive: true,
      isPrivate: false,
      description: 'All incoming emails',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'sent',
      name: 'Sent',
      icon: <Send className="w-4 h-4" />,
      count: 892,
      unread: 0,
      color: BRAND.COLORS.success,
      type: 'system',
      isActive: true,
      isPrivate: false,
      description: 'All sent emails',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'drafts',
      name: 'Drafts',
      icon: <FileText className="w-4 h-4" />,
      count: 12,
      unread: 0,
      color: BRAND.COLORS.warning,
      type: 'system',
      isActive: true,
      isPrivate: false,
      description: 'Draft emails',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'spam',
      name: 'Spam',
      icon: <AlertCircle className="w-4 h-4" />,
      count: 45,
      unread: 0,
      color: BRAND.COLORS.danger,
      type: 'system',
      isActive: true,
      isPrivate: false,
      description: 'Spam and junk emails',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'trash',
      name: 'Trash',
      icon: <Trash className="w-4 h-4" />,
      count: 156,
      unread: 0,
      color: BRAND.COLORS.secondary,
      type: 'system',
      isActive: true,
      isPrivate: false,
      description: 'Deleted emails',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'archive',
      name: 'Archive',
      icon: <Archive className="w-4 h-4" />,
      count: 234,
      unread: 0,
      color: BRAND.COLORS.info,
      type: 'system',
      isActive: true,
      isPrivate: false,
      description: 'Archived emails',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'starred',
      name: 'Starred',
      icon: <Star className="w-4 h-4" />,
      count: 67,
      unread: 0,
      color: BRAND.COLORS.warning,
      type: 'smart',
      isActive: true,
      isPrivate: false,
      description: 'Starred emails',
      rules: [
        {
          id: '1',
          field: 'tags',
          operator: 'contains',
          value: 'starred',
          isActive: true
        }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'important',
      name: 'Important',
      icon: <Flag className="w-4 h-4" />,
      count: 89,
      unread: 0,
      color: BRAND.COLORS.danger,
      type: 'smart',
      isActive: true,
      isPrivate: false,
      description: 'Important emails',
      rules: [
        {
          id: '2',
          field: 'priority',
          operator: 'equals',
          value: 'high',
          isActive: true
        }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'follow-up',
      name: 'Follow Up',
      icon: <Clock className="w-4 h-4" />,
      count: 34,
      unread: 0,
      color: BRAND.COLORS.info,
      type: 'smart',
      isActive: true,
      isPrivate: false,
      description: 'Emails requiring follow-up',
      rules: [
        {
          id: '3',
          field: 'tags',
          operator: 'contains',
          value: 'follow-up',
          isActive: true
        }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'meetings',
      name: 'Meetings',
      icon: <Calendar className="w-4 h-4" />,
      count: 123,
      unread: 0,
      color: BRAND.COLORS.success,
      type: 'smart',
      isActive: true,
      isPrivate: false,
      description: 'Meeting-related emails',
      rules: [
        {
          id: '4',
          field: 'subject',
          operator: 'contains',
          value: 'meeting',
          isActive: true
        },
        {
          id: '5',
          field: 'subject',
          operator: 'contains',
          value: 'calendar',
          isActive: true
        }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'deals',
      name: 'Deals',
      icon: <Target className="w-4 h-4" />,
      count: 56,
      unread: 0,
      color: BRAND.COLORS.primary,
      type: 'smart',
      isActive: true,
      isPrivate: false,
      description: 'Deal-related emails',
      rules: [
        {
          id: '6',
          field: 'category',
          operator: 'equals',
          value: 'deal',
          isActive: true
        }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'support',
      name: 'Support',
      icon: <HelpCircle className="w-4 h-4" />,
      count: 78,
      unread: 0,
      color: BRAND.COLORS.warning,
      type: 'smart',
      isActive: true,
      isPrivate: false,
      description: 'Support and help emails',
      rules: [
        {
          id: '7',
          field: 'category',
          operator: 'equals',
          value: 'support',
          isActive: true
        }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMailbox, setEditingMailbox] = useState<Mailbox | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'system' | 'custom' | 'smart'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'count' | 'unread' | 'created_at'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter and sort mailboxes
  const filteredMailboxes = mailboxes
    .filter(mailbox => {
      const matchesSearch = mailbox.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           mailbox.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || mailbox.type === filterType;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'count':
          comparison = a.count - b.count;
          break;
        case 'unread':
          comparison = a.unread - b.unread;
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleCreateMailbox = (mailboxData: Partial<Mailbox>) => {
    const newMailbox: Mailbox = {
      id: `mailbox-${Date.now()}`,
      name: mailboxData.name || 'New Mailbox',
      icon: mailboxData.icon || <Folder className="w-4 h-4" />,
      count: 0,
      unread: 0,
      color: mailboxData.color || BRAND.COLORS.primary,
      type: mailboxData.type || 'custom',
      isActive: true,
      isPrivate: mailboxData.isPrivate || false,
      description: mailboxData.description || '',
      rules: mailboxData.rules || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setMailboxes(prev => [...prev, newMailbox]);
    setShowCreateModal(false);
  };

  const handleEditMailbox = (mailboxId: string, updates: Partial<Mailbox>) => {
    setMailboxes(prev => prev.map(mailbox => 
      mailbox.id === mailboxId 
        ? { ...mailbox, ...updates, updated_at: new Date().toISOString() }
        : mailbox
    ));
    setShowEditModal(false);
    setEditingMailbox(null);
  };

  const handleDeleteMailbox = (mailboxId: string) => {
    setMailboxes(prev => prev.filter(mailbox => mailbox.id !== mailboxId));
  };

  const handleToggleMailbox = (mailboxId: string) => {
    setMailboxes(prev => prev.map(mailbox => 
      mailbox.id === mailboxId 
        ? { ...mailbox, isActive: !mailbox.isActive, updated_at: new Date().toISOString() }
        : mailbox
    ));
  };

  const handleRefreshMailbox = (mailboxId: string) => {
    // Simulate refreshing mailbox counts
    setMailboxes(prev => prev.map(mailbox => 
      mailbox.id === mailboxId 
        ? { 
            ...mailbox, 
            count: Math.floor(Math.random() * 1000) + 100,
            unread: Math.floor(Math.random() * 50),
            updated_at: new Date().toISOString() 
          }
        : mailbox
    ));
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Smart Mailbox Manager</h2>
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Mailbox
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#8a8a8a]" />
            <input
              type="text"
              placeholder="Search mailboxes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#23233a]/40 border border-[#23233a]/50 rounded-lg text-white placeholder-[#8a8a8a] focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
            />
          </div>
          
          <Dropdown
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'system', label: 'System' },
              { value: 'custom', label: 'Custom' },
              { value: 'smart', label: 'Smart' }
            ]}
            value={filterType}
            onChange={val => setFilterType(val)}
            className="w-36"
          />
          
          <Dropdown
            options={[
              { value: 'name', label: 'Name' },
              { value: 'count', label: 'Count' },
              { value: 'unread', label: 'Unread' },
              { value: 'created_at', label: 'Created' }
            ]}
            value={sortBy}
            onChange={val => setSortBy(val as 'name' | 'count' | 'unread' | 'created_at')}
            className="w-36"
          />
          
          <Button
            variant="secondary"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>
        </div>

        {/* Mailboxes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {filteredMailboxes.map((mailbox) => (
            <Card
              key={mailbox.id}
              className={`p-4 cursor-pointer transition-all hover:scale-105 ${
                selectedMailbox === mailbox.id ? 'ring-2 ring-[#a259ff]' : ''
              }`}
              onClick={() => onMailboxSelect(mailbox.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div style={{ color: mailbox.color }}>
                    {mailbox.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{mailbox.name}</h3>
                    <p className="text-xs text-[#8a8a8a]">{mailbox.description}</p>
                  </div>
                </div>
                
                <Dropdown
                  trigger={
                    <Button variant="secondary" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  }
                >
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => {
                        setEditingMailbox(mailbox);
                        setShowEditModal(true);
                      }}
                      className="w-full text-left px-2 py-1 rounded hover:bg-[#23233a]/50 text-sm flex items-center"
                    >
                      <Edit className="w-3 h-3 mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleRefreshMailbox(mailbox.id)}
                      className="w-full text-left px-2 py-1 rounded hover:bg-[#23233a]/50 text-sm flex items-center"
                    >
                      <RefreshCw className="w-3 h-3 mr-2" />
                      Refresh
                    </button>
                    <button
                      onClick={() => handleToggleMailbox(mailbox.id)}
                      className="w-full text-left px-2 py-1 rounded hover:bg-[#23233a]/50 text-sm flex items-center"
                    >
                      {mailbox.isActive ? (
                        <>
                          <EyeOff className="w-3 h-3 mr-2" />
                          Hide
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3 mr-2" />
                          Show
                        </>
                      )}
                    </button>
                    {mailbox.type !== 'system' && (
                      <button
                        onClick={() => handleDeleteMailbox(mailbox.id)}
                        className="w-full text-left px-2 py-1 rounded hover:bg-[#23233a]/50 text-sm flex items-center text-red-400"
                      >
                        <Trash2 className="w-3 h-3 mr-2" />
                        Delete
                      </button>
                    )}
                  </div>
                </Dropdown>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {mailbox.count} emails
                  </Badge>
                  {mailbox.unread > 0 && (
                    <Badge variant="primary" className="text-xs">
                      {mailbox.unread} unread
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center space-x-1">
                  <Badge 
                    variant={mailbox.type === 'system' ? 'primary' : mailbox.type === 'smart' ? 'success' : 'secondary'}
                    className="text-xs"
                  >
                    {mailbox.type}
                  </Badge>
                  {mailbox.isPrivate && (
                    <Lock className="w-3 h-3 text-[#8a8a8a]" />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Statistics */}
        <div className="mt-6 p-4 bg-[#23233a]/20 rounded-lg">
          <h3 className="text-sm font-medium text-white mb-3">Mailbox Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {mailboxes.length}
              </div>
              <div className="text-xs text-[#8a8a8a]">Total Mailboxes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {mailboxes.filter(m => m.isActive).length}
              </div>
              <div className="text-xs text-[#8a8a8a]">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {mailboxes.reduce((sum, m) => sum + m.count, 0)}
              </div>
              <div className="text-xs text-[#8a8a8a]">Total Emails</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {mailboxes.reduce((sum, m) => sum + m.unread, 0)}
              </div>
              <div className="text-xs text-[#8a8a8a]">Unread</div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SmartMailboxManager; 