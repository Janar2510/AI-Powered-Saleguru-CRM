import React, { useState } from 'react';
import { User, Mail, Phone, Building, Edit, Trash2, Eye, Star, Check, X, Zap } from 'lucide-react';
import { Contact } from '../../types/contact';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { useToastContext } from '../../contexts/ToastContext';
import EnrichmentStatusBadge from '../enrichment/EnrichmentStatusBadge';

interface ContactListProps {
  contacts: Contact[];
  onView: (contactId: string) => void;
  onEdit: (contact: Contact) => void;
  onDelete: (contactId: string) => void;
  viewMode: 'table' | 'cards';
}

const ContactList: React.FC<ContactListProps> = ({ 
  contacts, 
  onView, 
  onEdit, 
  onDelete,
  viewMode
}) => {
  const { showToast } = useToastContext();
  const [deletingContactId, setDeletingContactId] = useState<string | null>(null);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" size="sm">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary" size="sm">Inactive</Badge>;
      case 'lead':
        return <Badge variant="warning" size="sm">Lead</Badge>;
      case 'customer':
        return <Badge variant="primary" size="sm">Customer</Badge>;
      default:
        return <Badge variant="secondary" size="sm">{status}</Badge>;
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      onDelete(contactId);
      setDeletingContactId(null);
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to delete contact',
        type: 'error'
      });
    }
  };

  if (viewMode === 'table') {
    return (
      <Card className="bg-white/10 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-700">
                <th className="text-left py-3 px-4 font-medium text-secondary-300">Name</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-300">Email</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-300">Phone</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-300">Company</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-300">Status</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-300">Data</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id} className="border-b border-secondary-700 hover:bg-secondary-700/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                        {contact.avatar_url ? (
                          <img 
                            src={contact.avatar_url} 
                            alt={contact.name} 
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <div className="font-medium text-white">{contact.name}</div>
                          {contact.enrichment_status === 'completed' && (
                            <Zap className="w-4 h-4 text-primary-400" title="Data Enriched" />
                          )}
                        </div>
                        <div className="text-sm text-secondary-400">{contact.position}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-secondary-400" />
                      <span className="text-secondary-300">{contact.email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {contact.phone ? (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-secondary-400" />
                        <span className="text-secondary-300">{contact.phone}</span>
                      </div>
                    ) : (
                      <span className="text-secondary-500">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {contact.company ? (
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-secondary-400" />
                        <span className="text-secondary-300">{contact.company}</span>
                      </div>
                    ) : (
                      <span className="text-secondary-500">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(contact.status)}
                  </td>
                  <td className="py-3 px-4">
                    {contact.enrichment_status && (
                      <EnrichmentStatusBadge 
                        status={contact.enrichment_status} 
                        lastUpdated={contact.enriched_at}
                        showTimestamp={false}
                      />
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => onView(contact.id)}
                        className="p-1 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors"
                        title="View Contact"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onEdit(contact)}
                        className="p-1 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors"
                        title="Edit Contact"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {deletingContactId === contact.id ? (
                        <div className="flex space-x-1 bg-red-900/20 rounded-lg p-1">
                          <button 
                            onClick={() => setDeletingContactId(null)}
                            className="p-1 text-secondary-400 hover:text-white transition-colors"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteContact(contact.id)}
                            className="p-1 text-red-400 hover:text-red-300 transition-colors"
                            title="Confirm Delete"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setDeletingContactId(contact.id)}
                          className="p-1 text-secondary-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete Contact"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {contacts.map((contact) => (
        <Card 
          key={contact.id} 
          className="bg-white/10 backdrop-blur-md hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onView(contact.id)}
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                  {contact.avatar_url ? (
                    <img 
                      src={contact.avatar_url} 
                      alt={contact.name} 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-white">{contact.name}</h3>
                    {contact.enrichment_status === 'completed' && (
                      <Zap className="w-4 h-4 text-primary-400" title="Data Enriched" />
                    )}
                  </div>
                  <p className="text-secondary-400 text-sm">{contact.position}</p>
                  {contact.company && (
                    <p className="text-secondary-500 text-sm">{contact.company}</p>
                  )}
                </div>
              </div>
              {contact.lead_score && (
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    contact.lead_score >= 80 ? 'text-green-500' :
                    contact.lead_score >= 60 ? 'text-yellow-500' :
                    'text-red-500'
                  }`}>
                    {contact.lead_score}
                  </div>
                  <div className="text-xs text-secondary-400">Lead Score</div>
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-secondary-400" />
                <span className="text-secondary-300">{contact.email}</span>
              </div>
              {contact.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-secondary-400" />
                  <span className="text-secondary-300">{contact.phone}</span>
                </div>
              )}
              {contact.last_contacted_at && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-secondary-400" />
                  <span className="text-secondary-300">
                    Last contacted: {contact.last_contacted_at.toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {contact.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" size="sm">
                  {tag}
                </Badge>
              ))}
              {contact.tags.length > 3 && (
                <Badge variant="secondary" size="sm">
                  +{contact.tags.length - 3}
                </Badge>
              )}
              {getStatusBadge(contact.status)}
            </div>

            <div className="flex space-x-2 pt-2 border-t border-secondary-700">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(contact);
                }}
                className="flex-1 btn-secondary text-sm flex items-center justify-center space-x-1"
              >
                <Edit className="w-3 h-3" />
                <span>Edit</span>
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onView(contact.id);
                }}
                className="flex-1 btn-primary text-sm flex items-center justify-center space-x-1"
              >
                <Eye className="w-3 h-3" />
                <span>View</span>
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ContactList;