import React, { useState } from 'react';
import { 
  ArrowRight, 
  DollarSign, 
  FileText, 
  CreditCard, 
  CheckCircle, 
  AlertTriangle,
  Users,
  Building2,
  Target,
  Calendar,
  Zap
} from 'lucide-react';
import { useWorkflows } from '../../hooks/useWorkflows';
import { useToastContext } from '../../contexts/ToastContext';

interface WorkflowActionsProps {
  // Lead conversion props
  leadId?: string;
  leadName?: string;
  leadCompany?: string;
  leadEmail?: string;
  
  // Quote confirmation props
  quoteId?: string;
  quoteNumber?: string;
  quoteStatus?: string;
  
  // Sales order props
  salesOrderId?: string;
  salesOrderNumber?: string;
  salesOrderStatus?: string;
  
  // Invoice props
  invoiceId?: string;
  invoiceNumber?: string;
  invoiceAmount?: number;
  invoiceStatus?: string;
  
  // Payment props
  paymentAmount?: number;
  paymentMethod?: string;
  
  // Callbacks
  onLeadConverted?: (result: { dealId: string; contactId?: string; companyId?: string }) => void;
  onQuoteConfirmed?: (result: { salesOrderId: string }) => void;
  onInvoiceCreated?: (result: { invoiceId: string }) => void;
  onPaymentRecorded?: (result: { paymentId: string }) => void;
  
  // UI props
  variant?: 'default' | 'compact' | 'card';
  className?: string;
}

export const WorkflowActions: React.FC<WorkflowActionsProps> = ({
  leadId,
  leadName,
  leadCompany,
  leadEmail,
  quoteId,
  quoteNumber,
  quoteStatus,
  salesOrderId,
  salesOrderNumber,
  salesOrderStatus,
  invoiceId,
  invoiceNumber,
  invoiceAmount,
  invoiceStatus,
  paymentAmount,
  paymentMethod,
  onLeadConverted,
  onQuoteConfirmed,
  onInvoiceCreated,
  onPaymentRecorded,
  variant = 'default',
  className = ''
}) => {
  const {
    convertLeadToDeal,
    isConvertingLead,
    confirmQuoteToSalesOrder,
    isConfirmingQuote,
    createInvoiceFromSalesOrder,
    isCreatingInvoice,
    recordPayment,
    isRecordingPayment
  } = useWorkflows();

  const { showToast } = useToastContext();
  const [showConversionModal, setShowConversionModal] = useState(false);
  const [conversionData, setConversionData] = useState({
    dealTitle: '',
    estimatedValue: 50000,
    pipeline: 'sales-pipeline',
    stage: 'qualified',
    expectedCloseDate: '',
    createContact: true,
    createCompany: true
  });

  // Lead conversion handlers
  const handleLeadConversion = async () => {
    if (!leadId) return;

    try {
      const result = await convertLeadToDeal(leadId, {
        dealTitle: conversionData.dealTitle || `${leadCompany} - ${leadName}`,
        estimatedValue: conversionData.estimatedValue,
        pipeline: conversionData.pipeline,
        stage: conversionData.stage,
        expectedCloseDate: conversionData.expectedCloseDate,
        createContact: conversionData.createContact,
        createCompany: conversionData.createCompany
      });

      onLeadConverted?.(result);
      setShowConversionModal(false);
    } catch (error) {
      console.error('Lead conversion failed:', error);
    }
  };

  // Quote confirmation handlers
  const handleQuoteConfirmation = async () => {
    if (!quoteId) return;

    try {
      const result = await confirmQuoteToSalesOrder(quoteId);
      onQuoteConfirmed?.(result);
    } catch (error) {
      console.error('Quote confirmation failed:', error);
    }
  };

  // Invoice creation handlers
  const handleInvoiceCreation = async () => {
    if (!salesOrderId) return;

    try {
      const result = await createInvoiceFromSalesOrder(salesOrderId);
      onInvoiceCreated?.(result);
    } catch (error) {
      console.error('Invoice creation failed:', error);
    }
  };

  // Payment recording handlers
  const handlePaymentRecording = async () => {
    if (!invoiceId || !paymentAmount) return;

    try {
      const result = await recordPayment({
        invoice_id: invoiceId,
        amount: paymentAmount,
        currency: 'EUR',
        method: paymentMethod || 'bank_transfer',
        provider_ref: `manual-${Date.now()}`
      });
      onPaymentRecorded?.(result);
    } catch (error) {
      console.error('Payment recording failed:', error);
    }
  };

  // Render lead conversion action
  const renderLeadConversion = () => {
    if (!leadId || !leadName) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Convert Lead to Deal</h3>
              <p className="text-sm text-gray-300">
                Convert {leadName} from {leadCompany} to a deal
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowConversionModal(true)}
            disabled={isConvertingLead}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50"
          >
            {isConvertingLead ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Converting...</span>
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4" />
                <span>Convert to Deal</span>
              </>
            )}
          </button>
        </div>

        {/* Conversion Modal */}
        {showConversionModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-white mb-4">Convert Lead to Deal</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Deal Title
                  </label>
                  <input
                    type="text"
                    value={conversionData.dealTitle}
                    onChange={(e) => setConversionData(prev => ({ ...prev, dealTitle: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    placeholder={`${leadCompany} - ${leadName}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Estimated Value
                  </label>
                  <input
                    type="number"
                    value={conversionData.estimatedValue}
                    onChange={(e) => setConversionData(prev => ({ ...prev, estimatedValue: Number(e.target.value) }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Expected Close Date
                    </label>
                    <input
                      type="date"
                      value={conversionData.expectedCloseDate}
                      onChange={(e) => setConversionData(prev => ({ ...prev, expectedCloseDate: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={conversionData.createContact}
                      onChange={(e) => setConversionData(prev => ({ ...prev, createContact: e.target.checked }))}
                      className="rounded border-gray-600 bg-gray-700"
                    />
                    <span className="text-sm text-gray-300">Create Contact</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={conversionData.createCompany}
                      onChange={(e) => setConversionData(prev => ({ ...prev, createCompany: e.target.checked }))}
                      className="rounded border-gray-600 bg-gray-700"
                    />
                    <span className="text-sm text-gray-300">Create Company</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowConversionModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLeadConversion}
                  disabled={isConvertingLead}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {isConvertingLead ? 'Converting...' : 'Convert'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render quote confirmation action
  const renderQuoteConfirmation = () => {
    if (!quoteId || !quoteNumber || quoteStatus === 'confirmed') return null;

    return (
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <FileText className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Confirm Quote</h3>
            <p className="text-sm text-gray-300">
              Convert quote {quoteNumber} to sales order
            </p>
          </div>
        </div>
        <button
          onClick={handleQuoteConfirmation}
          disabled={isConfirmingQuote}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50"
        >
          {isConfirmingQuote ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Confirming...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Confirm Quote</span>
            </>
          )}
        </button>
      </div>
    );
  };

  // Render invoice creation action
  const renderInvoiceCreation = () => {
    if (!salesOrderId || !salesOrderNumber || salesOrderStatus === 'fulfilled') return null;

    return (
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-500/20 rounded-lg">
            <DollarSign className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Create Invoice</h3>
            <p className="text-sm text-gray-300">
              Create invoice from sales order {salesOrderNumber}
            </p>
          </div>
        </div>
        <button
          onClick={handleInvoiceCreation}
          disabled={isCreatingInvoice}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50"
        >
          {isCreatingInvoice ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Creating...</span>
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              <span>Create Invoice</span>
            </>
          )}
        </button>
      </div>
    );
  };

  // Render payment recording action
  const renderPaymentRecording = () => {
    if (!invoiceId || !invoiceNumber || invoiceStatus === 'paid') return null;

    return (
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <CreditCard className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Record Payment</h3>
            <p className="text-sm text-gray-300">
              Record payment for invoice {invoiceNumber}
            </p>
          </div>
        </div>
        <button
          onClick={handlePaymentRecording}
          disabled={isRecordingPayment}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
        >
          {isRecordingPayment ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Recording...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              <span>Record Payment</span>
            </>
          )}
        </button>
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {renderLeadConversion()}
      {renderQuoteConfirmation()}
      {renderInvoiceCreation()}
      {renderPaymentRecording()}
    </div>
  );
};


