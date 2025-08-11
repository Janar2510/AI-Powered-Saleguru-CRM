import { useState, useCallback } from 'react';
import { workflowService, WorkflowLead, WorkflowContact, WorkflowCompany, WorkflowDeal, WorkflowQuote, WorkflowSalesOrder, WorkflowInvoice, WorkflowPayment } from '../lib/workflows';
import { useToastContext } from '../contexts/ToastContext';

// Hook for lead conversion workflow
export const useLeadConversion = () => {
  const [isConverting, setIsConverting] = useState(false);
  const { showToast } = useToastContext();

  const convertLeadToDeal = useCallback(async (
    leadId: string,
    conversionData: {
      dealTitle?: string;
      estimatedValue?: number;
      pipeline?: string;
      stage?: string;
      expectedCloseDate?: string;
      createContact?: boolean;
      createCompany?: boolean;
    }
  ) => {
    setIsConverting(true);
    try {
      workflowService.setToast({ showToast });
      const result = await workflowService.convertLeadToDeal(leadId, conversionData);
      return result;
    } catch (error) {
      console.error('Lead conversion failed:', error);
      throw error;
    } finally {
      setIsConverting(false);
    }
  }, [showToast]);

  return {
    convertLeadToDeal,
    isConverting
  };
};

// Hook for quote confirmation workflow
export const useQuoteConfirmation = () => {
  const [isConfirming, setIsConfirming] = useState(false);
  const { showToast } = useToastContext();

  const confirmQuoteToSalesOrder = useCallback(async (quoteId: string) => {
    setIsConfirming(true);
    try {
      workflowService.setToast({ showToast });
      const result = await workflowService.confirmQuoteToSalesOrder(quoteId);
      return result;
    } catch (error) {
      console.error('Quote confirmation failed:', error);
      throw error;
    } finally {
      setIsConfirming(false);
    }
  }, [showToast]);

  return {
    confirmQuoteToSalesOrder,
    isConfirming
  };
};

// Hook for invoice creation workflow
export const useInvoiceCreation = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { showToast } = useToastContext();

  const createInvoiceFromSalesOrder = useCallback(async (salesOrderId: string) => {
    setIsCreating(true);
    try {
      workflowService.setToast({ showToast });
      const result = await workflowService.createInvoiceFromSalesOrder(salesOrderId);
      return result;
    } catch (error) {
      console.error('Invoice creation failed:', error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, [showToast]);

  return {
    createInvoiceFromSalesOrder,
    isCreating
  };
};

// Hook for payment recording workflow
export const usePaymentRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const { showToast } = useToastContext();

  const recordPayment = useCallback(async (paymentData: {
    invoice_id: string;
    amount: number;
    currency: string;
    method: string;
    provider_ref?: string;
  }) => {
    setIsRecording(true);
    try {
      workflowService.setToast({ showToast });
      const result = await workflowService.recordPayment(paymentData);
      return result;
    } catch (error) {
      console.error('Payment recording failed:', error);
      throw error;
    } finally {
      setIsRecording(false);
    }
  }, [showToast]);

  return {
    recordPayment,
    isRecording
  };
};

// Combined workflow hook
export const useWorkflows = () => {
  const leadConversion = useLeadConversion();
  const quoteConfirmation = useQuoteConfirmation();
  const invoiceCreation = useInvoiceCreation();
  const paymentRecording = usePaymentRecording();

  return {
    // Lead conversion
    convertLeadToDeal: leadConversion.convertLeadToDeal,
    isConvertingLead: leadConversion.isConverting,
    
    // Quote confirmation
    confirmQuoteToSalesOrder: quoteConfirmation.confirmQuoteToSalesOrder,
    isConfirmingQuote: quoteConfirmation.isConfirming,
    
    // Invoice creation
    createInvoiceFromSalesOrder: invoiceCreation.createInvoiceFromSalesOrder,
    isCreatingInvoice: invoiceCreation.isCreating,
    
    // Payment recording
    recordPayment: paymentRecording.recordPayment,
    isRecordingPayment: paymentRecording.isRecording
  };
};


