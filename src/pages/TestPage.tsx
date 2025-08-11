import React, { useState } from 'react';
import { accountingService } from '../services/accountingService';
import { warehouseService } from '../services/warehouseService';
import { documentTemplatesService } from '../services/documentTemplatesService';
import { eSignatureService } from '../services/eSignatureService';
import { salesOrdersService } from '../services/salesOrdersService';
import { quotationBuilderService } from '../services/quotationBuilderService';
import { paymentsService } from '../services/paymentsService';
import { customerPortalService } from '../services/customerPortalService';
import { useToastContext } from '../contexts/ToastContext';

const TestPage: React.FC = () => {
  const { showToast } = useToastContext();
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState<string | null>(null);

  const testService = async (serviceName: string, testFunction: () => Promise<any>) => {
    setLoading(serviceName);
    try {
      const result = await testFunction();
      setResults((prev: any) => ({ ...prev, [serviceName]: { success: true, data: result } }));
      showToast({ title: `${serviceName} test successful`, type: 'success' });
    } catch (error: any) {
      console.error(`${serviceName} test failed:`, error);
      setResults((prev: any) => ({ ...prev, [serviceName]: { success: false, error: error.message } }));
      showToast({ title: `${serviceName} test failed: ${error.message}`, type: 'error' });
    } finally {
      setLoading(null);
    }
  };

  const testAccounting = () => testService('Accounting', () => accountingService.getInvoices());
  const testWarehouse = () => testService('Warehouse', () => warehouseService.getProducts());
  const testDocumentTemplates = () => testService('DocumentTemplates', () => documentTemplatesService.getTemplates());
  const testESignature = () => testService('ESignature', () => eSignatureService.getDocuments());
  const testSalesOrders = () => testService('SalesOrders', () => salesOrdersService.getSalesOrders());
  const testQuotationBuilder = () => testService('QuotationBuilder', () => quotationBuilderService.getQuotations());
  const testPayments = () => testService('Payments', () => paymentsService.getPayments());
  const testCustomerPortal = () => testService('CustomerPortal', () => customerPortalService.getCustomers());

  const testAllServices = async () => {
    await Promise.all([
      testAccounting(),
      testWarehouse(),
      testDocumentTemplates(),
      testESignature(),
      testSalesOrders(),
      testQuotationBuilder(),
      testPayments(),
      testCustomerPortal()
    ]);
  };

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Service Test Page</h1>
      
      <div className="mb-8">
        <button 
          onClick={testAllServices}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold"
        >
          Test All Services
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <button 
            onClick={testAccounting}
            disabled={loading === 'Accounting'}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded"
          >
            {loading === 'Accounting' ? 'Testing...' : 'Test Accounting'}
          </button>
          
          <button 
            onClick={testWarehouse}
            disabled={loading === 'Warehouse'}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded"
          >
            {loading === 'Warehouse' ? 'Testing...' : 'Test Warehouse'}
          </button>
          
          <button 
            onClick={testDocumentTemplates}
            disabled={loading === 'DocumentTemplates'}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-4 py-2 rounded"
          >
            {loading === 'DocumentTemplates' ? 'Testing...' : 'Test Document Templates'}
          </button>
          
          <button 
            onClick={testESignature}
            disabled={loading === 'ESignature'}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 px-4 py-2 rounded"
          >
            {loading === 'ESignature' ? 'Testing...' : 'Test eSignature'}
          </button>
        </div>

        <div className="space-y-4">
          <button 
            onClick={testSalesOrders}
            disabled={loading === 'SalesOrders'}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 px-4 py-2 rounded"
          >
            {loading === 'SalesOrders' ? 'Testing...' : 'Test Sales Orders'}
          </button>
          
          <button 
            onClick={testQuotationBuilder}
            disabled={loading === 'QuotationBuilder'}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 px-4 py-2 rounded"
          >
            {loading === 'QuotationBuilder' ? 'Testing...' : 'Test Quotation Builder'}
          </button>
          
          <button 
            onClick={testPayments}
            disabled={loading === 'Payments'}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-4 py-2 rounded"
          >
            {loading === 'Payments' ? 'Testing...' : 'Test Payments'}
          </button>
          
          <button 
            onClick={testCustomerPortal}
            disabled={loading === 'CustomerPortal'}
            className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 px-4 py-2 rounded"
          >
            {loading === 'CustomerPortal' ? 'Testing...' : 'Test Customer Portal'}
          </button>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Test Results:</h2>
        <div className="space-y-4">
          {Object.entries(results).map(([service, result]: [string, any]) => (
            <div key={service} className={`p-4 rounded-lg ${result.success ? 'bg-green-900' : 'bg-red-900'}`}>
              <h3 className="font-semibold">{service}</h3>
              <p className="text-sm">
                {result.success ? (
                  <span className="text-green-400">✅ Success - {Array.isArray(result.data) ? `${result.data.length} items` : 'Data loaded'}</span>
                ) : (
                  <span className="text-red-400">❌ Error: {result.error}</span>
                )}
              </p>
              {result.data && (
                <pre className="text-xs mt-2 bg-gray-800 p-2 rounded overflow-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestPage; 