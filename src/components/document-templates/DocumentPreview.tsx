import React from 'react';
import { Document, DocumentItem } from '../../services/enhancedDocumentService';

interface DocumentPreviewProps {
  document: Document;
  branding?: any;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ document, branding }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return new Date().toLocaleDateString();
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-purple-100 text-purple-800';
      case 'paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'quote': return 'bg-blue-500';
      case 'invoice': return 'bg-green-500';
      case 'proforma': return 'bg-orange-500';
      case 'receipt': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
      {/* Document Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              {branding?.logo_url && (
                <img 
                  src={branding.logo_url} 
                  alt="Company Logo" 
                  className="h-12 w-auto"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {document.title || `${document.type.charAt(0).toUpperCase() + document.type.slice(1)}`}
                </h1>
                <p className="text-gray-600">
                  {branding?.company_name || 'Your Company Name'}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Document #:</span>
                <span className="ml-2 text-gray-900">{document.document_number || 'DRAFT'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Date:</span>
                <span className="ml-2 text-gray-900">{formatDate(document.created_at)}</span>
              </div>
              {document.due_date && (
                <div>
                  <span className="font-medium text-gray-700">Due Date:</span>
                  <span className="ml-2 text-gray-900">{formatDate(document.due_date)}</span>
                </div>
              )}
              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                  {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`inline-block px-4 py-2 rounded-lg text-white font-bold text-lg ${getDocumentTypeColor(document.type)}`}>
              {document.type.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To</h3>
            {document.contact && (
              <div className="space-y-1">
                <p className="font-medium text-gray-900">
                  {document.contact.first_name} {document.contact.last_name}
                </p>
                {document.contact.email && (
                  <p className="text-gray-600">{document.contact.email}</p>
                )}
                {document.contact.phone && (
                  <p className="text-gray-600">{document.contact.phone}</p>
                )}
                {document.contact.address && (
                  <div className="text-gray-600">
                    <p>{document.contact.address}</p>
                    {document.contact.city && document.contact.postal_code && (
                      <p>{document.contact.postal_code} {document.contact.city}</p>
                    )}
                    {document.contact.country && (
                      <p>{document.contact.country}</p>
                    )}
                  </div>
                )}
              </div>
            )}
            {document.company && (
              <div className="space-y-1 mt-4">
                <p className="font-medium text-gray-900">{document.company.name}</p>
                {document.company.email && (
                  <p className="text-gray-600">{document.company.email}</p>
                )}
                {document.company.phone && (
                  <p className="text-gray-600">{document.company.phone}</p>
                )}
                {document.company.address && (
                  <div className="text-gray-600">
                    <p>{document.company.address}</p>
                    {document.company.city && document.company.postal_code && (
                      <p>{document.company.postal_code} {document.company.city}</p>
                    )}
                    {document.company.country && (
                      <p>{document.company.country}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">From</h3>
            <div className="space-y-1">
              <p className="font-medium text-gray-900">
                {branding?.company_name || 'Your Company Name'}
              </p>
              <p className="text-gray-600">contact@yourcompany.com</p>
              <p className="text-gray-600">+1 (555) 123-4567</p>
              <div className="text-gray-600">
                <p>123 Business Street</p>
                <p>City, State 12345</p>
                <p>Country</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Item</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">Quantity</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">Unit Price</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">Total</th>
              </tr>
            </thead>
            <tbody>
              {document.items && document.items.map((item: DocumentItem, index: number) => (
                <tr key={item.id || index} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{item.product_name}</p>
                      {item.description && (
                        <p className="text-sm text-gray-600">{item.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900">{item.quantity}</td>
                  <td className="py-3 px-4 text-right text-gray-900">{formatCurrency(item.unit_price)}</td>
                  <td className="py-3 px-4 text-right font-medium text-gray-900">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="p-6 bg-gray-50">
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatCurrency(document.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax ({document.tax_rate}%):</span>
              <span className="font-medium">{formatCurrency(document.tax_amount)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span>{formatCurrency(document.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes and Terms */}
      {(document.notes || document.terms) && (
        <div className="p-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {document.notes && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{document.notes}</p>
              </div>
            )}
            {document.terms && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Terms & Conditions</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{document.terms}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-6 bg-gray-50 border-t border-gray-200">
        <div className="text-center text-gray-500 text-sm">
          <p>Thank you for your business!</p>
          <p className="mt-1">
            Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;
