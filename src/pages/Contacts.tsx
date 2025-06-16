import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Grid, List, User, Bot, Download, Upload } from 'lucide-react';
import Container from '../components/layout/Container';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/common/EmptyState';
import ContactList from '../components/contacts/ContactList';
import ContactDetail from '../components/contacts/ContactDetail';
import CreateContactModal from '../components/contacts/CreateContactModal';
import { useContacts } from '../hooks/useContacts';
import { Contact, ContactFilter } from '../types/contact';
import { useGuru } from '../contexts/GuruContext';
import { useToastContext } from '../contexts/ToastContext';

const Contacts: React.FC = () => {
  const { openGuru } = useGuru();
  const { showToast } = useToastContext();
  
  // State for UI
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Initialize contacts hook
  const { 
    contacts, 
    isLoading, 
    error, 
    filter, 
    setFilter,
    createContact,
    updateContact,
    deleteContact
  } = useContacts();

  // Apply search filter when searchTerm changes
  useEffect(() => {
    setFilter(prev => ({ ...prev, search: searchTerm }));
  }, [searchTerm, setFilter]);

  const handleViewContact = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
      setSelectedContact(contact);
    }
  };

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsEditing(true);
    setShowCreateModal(true);
  };

  const handleDeleteContact = async (contactId: string) => {
    const success = await deleteContact(contactId);
    if (success && selectedContact?.id === contactId) {
      setSelectedContact(null);
    }
  };

  const handleContactCreated = async (contact: Contact) => {
    if (isEditing && selectedContact) {
      await updateContact(selectedContact.id, contact);
      // Update the selected contact if it's currently being viewed
      setSelectedContact(prev => prev && prev.id === selectedContact.id ? { ...prev, ...contact } : prev);
    } else {
      await createContact(contact);
    }
    setShowCreateModal(false);
    setIsEditing(false);
  };

  const handleImportContacts = () => {
    showToast({
      title: 'Import Contacts',
      description: 'Opening contact import wizard...',
      type: 'info'
    });
    // In a real app, this would open an import wizard
  };

  const handleExportContacts = () => {
    showToast({
      title: 'Export Contacts',
      description: 'Exporting contacts to CSV...',
      type: 'info'
    });
    // In a real app, this would export contacts to CSV
  };

  // Filter options
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'lead', label: 'Lead' },
    { value: 'customer', label: 'Customer' }
  ];

  // Render the contact detail view if a contact is selected
  if (selectedContact) {
    return (
      <Container>
        <ContactDetail
          contact={selectedContact}
          onBack={() => setSelectedContact(null)}
          onEdit={() => handleEditContact(selectedContact)}
          onDelete={() => handleDeleteContact(selectedContact.id)}
        />
      </Container>
    );
  }

  return (
    <Container>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Contacts</h1>
            <p className="text-secondary-400 mt-1">Manage your contact database</p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={openGuru}
              className="btn-secondary flex items-center space-x-2"
            >
              <Bot className="w-4 h-4" />
              <span>Ask Guru</span>
            </button>
            <button 
              onClick={() => {
                setIsEditing(false);
                setShowCreateModal(true);
              }}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Contact</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={handleImportContacts}
                className="btn-secondary flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Import</span>
              </button>
              <button 
                onClick={handleExportContacts}
                className="btn-secondary flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={filter.status || 'all'}
              onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value !== 'all' ? e.target.value : undefined }))}
              className="bg-secondary-700 border border-secondary-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <div className="flex space-x-1 bg-secondary-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-primary-600 text-white'
                    : 'text-secondary-400 hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'table'
                    ? 'bg-primary-600 text-white'
                    : 'text-secondary-400 hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            
            <button className="btn-secondary flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>More Filters</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/10 backdrop-blur-md">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{contacts.length}</div>
              <div className="text-secondary-400 text-sm">Total Contacts</div>
            </div>
          </Card>
          <Card className="bg-white/10 backdrop-blur-md">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {contacts.filter(c => c.status === 'active').length}
              </div>
              <div className="text-secondary-400 text-sm">Active</div>
            </div>
          </Card>
          <Card className="bg-white/10 backdrop-blur-md">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">
                {contacts.filter(c => c.status === 'lead').length}
              </div>
              <div className="text-secondary-400 text-sm">Leads</div>
            </div>
          </Card>
          <Card className="bg-white/10 backdrop-blur-md">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-500">
                {contacts.filter(c => c.status === 'customer').length}
              </div>
              <div className="text-secondary-400 text-sm">Customers</div>
            </div>
          </Card>
        </div>

        {/* Contacts List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-secondary-400">Loading contacts...</p>
            </div>
          </div>
        ) : error ? (
          <Card className="bg-red-900/20 border border-red-600/30 text-center py-8">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Error Loading Contacts</h3>
            <p className="text-red-300">{error}</p>
          </Card>
        ) : contacts.length > 0 ? (
          <ContactList
            contacts={contacts}
            onView={handleViewContact}
            onEdit={handleEditContact}
            onDelete={handleDeleteContact}
            viewMode={viewMode}
          />
        ) : (
          <EmptyState
            icon={User}
            title="No contacts found"
            description={searchTerm ? 'Try adjusting your search criteria' : 'Add your first contact to get started'}
            guruSuggestion="Help me import contacts from my email"
            actionLabel="Add Contact"
            onAction={() => {
              setIsEditing(false);
              setShowCreateModal(true);
            }}
          />
        )}

        {/* Create/Edit Contact Modal */}
        <CreateContactModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setIsEditing(false);
          }}
          onContactCreated={handleContactCreated}
          initialData={isEditing ? selectedContact : undefined}
          isEditing={isEditing}
        />
      </div>
    </Container>
  );
};

export default Contacts;