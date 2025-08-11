import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Grid, List, User, Bot, Download, Upload, AlertTriangle, Kanban } from 'lucide-react';
import Spline from '@splinetool/react-spline';
import Container from '../components/layout/Container';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Dropdown from '../components/ui/Dropdown';
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
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'kanban'>('table');
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
    // Only set selectedContact if we're not already viewing this contact
    if (!selectedContact || selectedContact.id !== contact.id) {
      setSelectedContact(contact);
    }
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
        
        {/* Create/Edit Contact Modal - also render when in detail view */}
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
      </Container>
    );
  }

  return (
    <Container>
      {/* Spline 3D Background */}
      <div className="fixed inset-0 -z-10">
        <Spline scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode" />
      </div>

      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Contacts</h1>
            <p className="text-[#b0b0d0] mt-1">Manage your contact database</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={openGuru}
              variant="secondary"
              size="lg"
              icon={Bot}
            >
              Ask Guru
            </Button>
            <Button 
              onClick={() => {
                setIsEditing(false);
                setShowCreateModal(true);
              }}
              variant="gradient"
              size="lg"
              icon={Plus}
            >
              Add Contact
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b0b0d0]" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#23233a]/50 border-2 border-white/20 rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] focus:border-[#a259ff]"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleImportContacts}
                variant="secondary"
                size="sm"
                icon={Upload}
              >
                Import
              </Button>
              <Button 
                onClick={handleExportContacts}
                variant="secondary"
                size="sm"
                icon={Download}
              >
                Export
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Dropdown
              options={statusOptions}
              value={filter.status || 'all'}
              onChange={(value) => setFilter(prev => ({ ...prev, status: value !== 'all' ? value : undefined }))}
              className="w-36"
            />
            
            <div className="flex space-x-1 bg-[#23233a]/50 border-2 border-white/20 rounded-lg p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-[#a259ff] text-white'
                    : 'text-[#b0b0d0] hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-[#a259ff] text-white'
                    : 'text-[#b0b0d0] hover:text-white'
                }`}
              >
                <Kanban className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'table'
                    ? 'bg-[#a259ff] text-white'
                    : 'text-[#b0b0d0] hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            
            <Button 
              variant="secondary"
              size="sm"
              icon={Filter}
            >
              More Filters
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-[#23233a]/50 backdrop-blur-md border border-[#23233a]/30">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{contacts.length}</div>
              <div className="text-[#b0b0d0] text-sm">Total Contacts</div>
            </div>
          </Card>
          <Card className="bg-[#23233a]/50 backdrop-blur-md border border-[#23233a]/30">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#43e7ad]">
                {contacts.filter(c => c.status === 'active').length}
              </div>
              <div className="text-[#b0b0d0] text-sm">Active</div>
            </div>
          </Card>
          <Card className="bg-[#23233a]/50 backdrop-blur-md border border-[#23233a]/30">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#f59e0b]">
                {contacts.filter(c => c.status === 'lead').length}
              </div>
              <div className="text-[#b0b0d0] text-sm">Leads</div>
            </div>
          </Card>
          <Card className="bg-[#23233a]/50 backdrop-blur-md border border-[#23233a]/30">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#a259ff]">
                {contacts.filter(c => c.status === 'customer').length}
              </div>
              <div className="text-[#b0b0d0] text-sm">Customers</div>
            </div>
          </Card>
        </div>

        {/* Contacts List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-[#a259ff] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#b0b0d0]">Loading contacts...</p>
            </div>
          </div>
        ) : error ? (
          <Card className="bg-[#ef4444]/10 border border-[#ef4444]/30 text-center py-8">
            <AlertTriangle className="w-12 h-12 text-[#ef4444] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Error Loading Contacts</h3>
            <p className="text-[#ef4444]">{error}</p>
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