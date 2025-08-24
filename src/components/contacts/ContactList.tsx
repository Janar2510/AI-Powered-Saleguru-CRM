import React, { useState } from 'react';
import { User, Mail, Phone, Building, Edit, Trash2, Eye, Star, Check, X, Zap, Clock } from 'lucide-react';
import { Contact } from '../../types/contact';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useToastContext } from '../../contexts/ToastContext';
import EnrichmentStatusBadge from '../enrichment/EnrichmentStatusBadge';

interface ContactListProps {
  contacts: Contact[];
  onView: (contactId: string) => void;
  onEdit: (contact: Contact) => void;
  onDelete: (contactId: string) => void;
  viewMode: 'table' | 'cards' | 'kanban';
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
      <Card className="bg-[#23233a]/50 backdrop-blur-md border border-[#23233a]/30">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#23233a]/30">
                <th className="text-left py-3 px-4 font-medium text-[#b0b0d0]">Name</th>
                <th className="text-left py-3 px-4 font-medium text-[#b0b0d0]">Email</th>
                <th className="text-left py-3 px-4 font-medium text-[#b0b0d0]">Phone</th>
                <th className="text-left py-3 px-4 font-medium text-[#b0b0d0]">Company</th>
                <th className="text-left py-3 px-4 font-medium text-[#b0b0d0]">Status</th>
                <th className="text-left py-3 px-4 font-medium text-[#b0b0d0]">Data</th>
                <th className="text-left py-3 px-4 font-medium text-[#b0b0d0]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id} className="border-b border-[#23233a]/30 hover:bg-[#23233a]/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#a259ff] rounded-full flex items-center justify-center">
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
                            <Zap className="w-4 h-4 text-[#a259ff]" title="Data Enriched" />
                          )}
                        </div>
                        <div className="text-sm text-[#b0b0d0]">{contact.position}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-[#b0b0d0]" />
                      <span className="text-white">{contact.email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {contact.phone ? (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-[#b0b0d0]" />
                        <span className="text-white">{contact.phone}</span>
                      </div>
                    ) : (
                      <span className="text-[#b0b0d0]">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {contact.company ? (
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-[#b0b0d0]" />
                        <span className="text-white">{contact.company}</span>
                      </div>
                    ) : (
                      <span className="text-[#b0b0d0]">—</span>
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
                      <Button
                        onClick={() => onView(contact.id)}
                        variant="ghost"
                        size="sm"
                        icon={Eye}
                        title="View Contact"
                      />
                      <Button
                        onClick={() => onEdit(contact)}
                        variant="ghost"
                        size="sm"
                        icon={Edit}
                        title="Edit Contact"
                      />
                      {deletingContactId === contact.id ? (
                        <div className="flex space-x-1 bg-[#ef4444]/20 rounded-lg p-1">
                          <Button
                            onClick={() => setDeletingContactId(null)}
                            variant="ghost"
                            size="sm"
                            icon={X}
                            title="Cancel"
                          />
                          <Button
                            onClick={() => handleDeleteContact(contact.id)}
                            variant="ghost"
                            size="sm"
                            icon={Check}
                            title="Confirm Delete"
                            className="text-[#ef4444] hover:text-[#ef4444]"
                          />
                        </div>
                      ) : (
                        <Button
                          onClick={() => setDeletingContactId(contact.id)}
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          title="Delete Contact"
                          className="text-[#b0b0d0] hover:text-[#ef4444] hover:bg-[#ef4444]/20"
                        />
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

  if (viewMode === 'kanban') {
    // Group contacts by status for Kanban view
    const statusGroups = {
      'lead': contacts.filter(c => c.status === 'lead'),
      'active': contacts.filter(c => c.status === 'active'),
      'customer': contacts.filter(c => c.status === 'customer'),
      'inactive': contacts.filter(c => c.status === 'inactive')
    };

    const columns = [
      { id: 'lead', title: 'Leads', contacts: statusGroups.lead, color: 'border-[#f59e0b]' },
      { id: 'active', title: 'Active', contacts: statusGroups.active, color: 'border-[#43e7ad]' },
      { id: 'customer', title: 'Customers', contacts: statusGroups.customer, color: 'border-[#a259ff]' },
      { id: 'inactive', title: 'Inactive', contacts: statusGroups.inactive, color: 'border-[#6b7280]' }
    ];

    return (
      <div className="flex space-x-6 overflow-x-auto pb-6">
        {columns.map((column) => (
          <div key={column.id} className="flex-1 min-w-[320px]">
            <Card className={`bg-[#23233a]/50 backdrop-blur-md border ${column.color}/30 h-full`}>
              <div className="flex items-center justify-between mb-4 p-4 border-b border-[#23233a]/30">
                <h3 className="text-lg font-bold text-white">{column.title}</h3>
                <Badge variant="secondary" size="sm">{column.contacts.length}</Badge>
              </div>
              <div className="p-4 space-y-3">
                {column.contacts.length > 0 ? (
                  column.contacts.map((contact) => (
                    <Card 
                      key={contact.id} 
                      className="bg-[#23233a]/30 backdrop-blur-md border border-[#23233a]/30 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => onView(contact.id)}
                    >
                      <div className="p-3 space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-[#a259ff] rounded-full flex items-center justify-center">
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
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-white text-sm">{contact.name}</h4>
                              {contact.enrichment_status === 'completed' && (
                                <Zap className="w-3 h-3 text-[#a259ff]" title="Data Enriched" />
                              )}
                            </div>
                            <p className="text-[#b0b0d0] text-xs">{contact.position}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-3 h-3 text-[#b0b0d0]" />
                            <span className="text-white truncate">{contact.email}</span>
                          </div>
                          {contact.company && (
                            <div className="flex items-center space-x-2">
                              <Building className="w-3 h-3 text-[#b0b0d0]" />
                              <span className="text-[#b0b0d0] truncate">{contact.company}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#23233a]/30">
                          <div className="flex space-x-1">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(contact);
                              }}
                              variant="ghost"
                              size="sm"
                              icon={Edit}
                              className="w-6 h-6 p-0"
                            />
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                onView(contact.id);
                              }}
                              variant="ghost"
                              size="sm"
                              icon={Eye}
                              className="w-6 h-6 p-0"
                            />
                          </div>
                          {contact.lead_score && (
                            <div className="text-xs">
                              <span className="text-[#b0b0d0]">Score: </span>
                              <span className={`font-bold ${
                                contact.lead_score >= 80 ? 'text-[#43e7ad]' :
                                contact.lead_score >= 60 ? 'text-[#f59e0b]' :
                                'text-[#ef4444]'
                              }`}>
                                {contact.lead_score}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <User className="w-8 h-8 text-[#b0b0d0] mx-auto mb-2" />
                    <p className="text-[#b0b0d0] text-sm">No contacts</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {contacts.map((contact) => (
        <Card 
          key={contact.id} 
          className="bg-[#23233a]/50 backdrop-blur-md border border-[#23233a]/30 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onView(contact.id)}
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-[#a259ff] rounded-full flex items-center justify-center">
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
                      <Zap className="w-4 h-4 text-[#a259ff]" title="Data Enriched" />
                    )}
                  </div>
                  <p className="text-[#b0b0d0] text-sm">{contact.position}</p>
                  {contact.company && (
                    <p className="text-[#b0b0d0] text-sm">{contact.company}</p>
                  )}
                </div>
              </div>
              {contact.lead_score && (
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    contact.lead_score >= 80 ? 'text-[#43e7ad]' :
                    contact.lead_score >= 60 ? 'text-[#f59e0b]' :
                    'text-[#ef4444]'
                  }`}>
                    {contact.lead_score}
                  </div>
                  <div className="text-xs text-[#b0b0d0]">Lead Score</div>
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-[#b0b0d0]" />
                <span className="text-white">{contact.email}</span>
              </div>
              {contact.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-[#b0b0d0]" />
                  <span className="text-white">{contact.phone}</span>
                </div>
              )}
              {contact.last_contacted_at && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-[#b0b0d0]" />
                  <span className="text-white">
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

            <div className="flex gap-2 pt-2 border-t border-[#23233a]/30">
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(contact);
                }}
                variant="secondary"
                size="sm"
                icon={Edit}
                className="flex-1"
              >
                Edit
              </Button>
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  onView(contact.id);
                }}
                variant="gradient"
                size="sm"
                icon={Eye}
                className="flex-1"
              >
                View
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ContactList;