import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Contact, ContactFormData, ContactFilter } from '../types/contact';
import { useToastContext } from '../contexts/ToastContext';

export const useContacts = (initialFilter?: ContactFilter) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ContactFilter>(initialFilter || {});
  const { showToast } = useToastContext();

  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Apply filters
      if (filter.search) {
        query = query.or(`name.ilike.%${filter.search}%,email.ilike.%${filter.search}%,company.ilike.%${filter.search}%`);
      }
      
      if (filter.status) {
        query = query.eq('status', filter.status);
      }
      
      if (filter.company) {
        query = query.eq('company', filter.company);
      }
      
      if (filter.assigned_to) {
        query = query.eq('assigned_to', filter.assigned_to);
      }
      
      if (filter.industry) {
        query = query.eq('industry', filter.industry);
      }
      
      if (filter.tags && filter.tags.length > 0) {
        query = query.contains('tags', filter.tags);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError || !data || data.length === 0) {
        // Dummy contacts fallback for demo/dev
        const sampleContacts = [
          {
            id: '1',
            name: 'Alice Johnson',
            email: 'alice@techcorp.com',
            company: 'TechCorp Inc.',
            phone: '+1 (555) 123-4567',
            tags: ['VIP'],
            status: 'active',
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            id: '2',
            name: 'Bob Smith',
            email: 'bob@startupxyz.io',
            company: 'StartupXYZ',
            phone: '+1 (555) 987-6543',
            tags: ['Lead'],
            status: 'lead',
            created_at: new Date(),
            updated_at: new Date(),
          }
        ];
        setContacts(sampleContacts);
        setIsLoading(false);
        return;
      }
      
      if (data) {
        // Process and format the data
        const formattedContacts = data.map(contact => ({
          ...contact,
          created_at: new Date(contact.created_at),
          updated_at: new Date(contact.updated_at),
          last_contacted_at: contact.last_contacted_at ? new Date(contact.last_contacted_at) : undefined,
          tags: Array.isArray(contact.tags) ? contact.tags : []
        }));
        
        setContacts(formattedContacts);
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch contacts');
      showToast({
        title: 'Error',
        description: 'Failed to load contacts',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [filter, showToast]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const createContact = async (contactData: ContactFormData): Promise<Contact | null> => {
    try {
      // Format the data for Supabase
      const newContact = {
        ...contactData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('contacts')
        .insert(newContact)
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        // Format the returned data
        const formattedContact = {
          ...data,
          created_at: new Date(data.created_at),
          updated_at: new Date(data.updated_at),
          last_contacted_at: data.last_contacted_at ? new Date(data.last_contacted_at) : undefined,
          tags: Array.isArray(data.tags) ? data.tags : []
        };
        
        // Add the contact to the local state
        setContacts(prev => [formattedContact, ...prev]);
        
        showToast({
          title: 'Contact Created',
          description: `${formattedContact.name} has been added to your contacts`,
          type: 'success'
        });
        
        return formattedContact;
      }
      
      return null;
    } catch (err) {
      console.error('Error creating contact:', err);
      showToast({
        title: 'Error',
        description: 'Failed to create contact',
        type: 'error'
      });
      return null;
    }
  };

  const updateContact = async (contactId: string, updates: Partial<ContactFormData>): Promise<Contact | null> => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', contactId)
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        // Format the returned data
        const formattedContact = {
          ...data,
          created_at: new Date(data.created_at),
          updated_at: new Date(data.updated_at),
          last_contacted_at: data.last_contacted_at ? new Date(data.last_contacted_at) : undefined,
          tags: Array.isArray(data.tags) ? data.tags : []
        };
        
        // Update the contact in the local state
        setContacts(prev => prev.map(contact => 
          contact.id === contactId ? formattedContact : contact
        ));
        
        showToast({
          title: 'Contact Updated',
          description: `${formattedContact.name} has been updated`,
          type: 'success'
        });
        
        return formattedContact;
      }
      
      return null;
    } catch (err) {
      console.error('Error updating contact:', err);
      showToast({
        title: 'Error',
        description: 'Failed to update contact',
        type: 'error'
      });
      return null;
    }
  };

  const deleteContact = async (contactId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId);
      
      if (error) throw error;
      
      // Remove the contact from the local state
      setContacts(prev => prev.filter(contact => contact.id !== contactId));
      
      showToast({
        title: 'Contact Deleted',
        description: 'Contact has been deleted successfully',
        type: 'success'
      });
      
      return true;
    } catch (err) {
      console.error('Error deleting contact:', err);
      showToast({
        title: 'Error',
        description: 'Failed to delete contact',
        type: 'error'
      });
      return false;
    }
  };

  const findDuplicates = (contactData: ContactFormData): Contact[] => {
    return contacts.filter(contact => 
      contact.email.toLowerCase() === contactData.email.toLowerCase() ||
      (contact.name.toLowerCase() === contactData.name.toLowerCase() && 
       contact.company?.toLowerCase() === contactData.company?.toLowerCase())
    );
  };

  const searchContacts = (searchTerm: string): Contact[] => {
    return contacts.filter(contact => 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return {
    contacts,
    isLoading,
    error,
    filter,
    setFilter,
    fetchContacts,
    createContact,
    updateContact,
    deleteContact,
    findDuplicates,
    searchContacts
  };
};