import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, Download, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';
import { useToastContext } from '../../contexts/ToastContext';
import { Button } from '../ui/Button';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'import' | 'export';
  entityType: 'contacts' | 'companies' | 'leads' | 'deals' | 'products' | 'invoices' | 'sales_orders';
  onImport?: (data: any[]) => Promise<void>;
  onExport?: () => Promise<void>;
  sampleData?: any[];
}

const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  mode,
  entityType,
  onImport,
  onExport,
  sampleData = []
}) => {
  const { openModal, closeModal } = useModal();
  const { showToast } = useToastContext();
  
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx' | 'json'>('csv');

  useEffect(() => {
    if (isOpen) {
      openModal();
      return () => closeModal();
    }
  }, [isOpen, openModal, closeModal]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setErrors([]);
      setPreviewData([]);
      
      // Preview the file
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const lines = text.split('\n');
          const headers = lines[0].split(',');
          const preview = lines.slice(1, 6).map(line => {
            const values = line.split(',');
            const row: any = {};
            headers.forEach((header, index) => {
              row[header.trim()] = values[index]?.trim() || '';
            });
            return row;
          });
          setPreviewData(preview);
        } catch (error) {
          setErrors(['Invalid file format. Please upload a valid CSV file.']);
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file || !onImport) return;
    
    setIsProcessing(true);
    setProgress(0);
    
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const text = event.target?.result as string;
          const lines = text.split('\n');
          const headers = lines[0].split(',');
          const data = lines.slice(1).map(line => {
            const values = line.split(',');
            const row: any = {};
            headers.forEach((header, index) => {
              row[header.trim()] = values[index]?.trim() || '';
            });
            return row;
          }).filter(row => Object.values(row).some(val => val !== ''));
          
          setProgress(50);
          await onImport(data);
          setProgress(100);
          
          showToast({
            title: 'Import Successful',
            description: `Successfully imported ${data.length} ${entityType}`,
            type: 'success'
          });
          
          onClose();
        } catch (error) {
          setErrors(['Error processing file. Please check the format and try again.']);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      setErrors(['Error importing data. Please try again.']);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = async () => {
    if (!onExport) return;
    
    setIsProcessing(true);
    setProgress(0);
    
    try {
      setProgress(50);
      await onExport();
      setProgress(100);
      
      showToast({
        title: 'Export Successful',
        description: `${entityType} exported successfully`,
        type: 'success'
      });
      
      onClose();
    } catch (error) {
      setErrors(['Error exporting data. Please try again.']);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const headers = getTemplateHeaders();
    const csvContent = [headers.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entityType}_template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getTemplateHeaders = () => {
    const templates = {
      contacts: ['name', 'email', 'phone', 'company', 'position', 'address', 'city', 'state', 'postal_code', 'country'],
      companies: ['company_name', 'contact_name', 'email', 'phone', 'address', 'city', 'state', 'postal_code', 'country', 'industry'],
      leads: ['name', 'email', 'company', 'position', 'phone', 'source', 'industry', 'deal_value_estimate'],
      deals: ['title', 'value', 'stage', 'probability', 'expected_close_date', 'company_id', 'contact_id'],
      products: ['name', 'sku', 'description', 'price', 'cost', 'category', 'inventory_count'],
      invoices: ['invoice_number', 'customer_id', 'amount', 'status', 'due_date'],
      sales_orders: ['order_number', 'customer_id', 'total_amount', 'status', 'order_date']
    };
    return templates[entityType as keyof typeof templates] || [];
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999999] p-4">
      <div className="bg-[#23233a]/99 backdrop-blur-2xl rounded-xl border border-[#23233a]/60 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#23233a]/30">
          <div className="flex items-center space-x-3">
            {mode === 'import' ? (
              <Upload className="w-6 h-6 text-blue-400" />
            ) : (
              <Download className="w-6 h-6 text-green-400" />
            )}
            <h2 className="text-xl font-semibold text-white">
              {mode === 'import' ? 'Import' : 'Export'} {entityType.replace('_', ' ')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#b0b0d0] hover:text-white hover:bg-[#23233a]/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {mode === 'import' ? (
            <>
              {/* File Upload */}
              <div className="space-y-4">
                <div className="border-2 border-dashed border-[#23233a]/50 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 text-[#b0b0d0] mx-auto mb-4" />
                  <p className="text-[#b0b0d0] mb-2">Drop your CSV file here or click to browse</p>
                  <input
                    type="file"
                    accept=".csv,.xlsx"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors"
                  >
                    Choose File
                  </label>
                </div>

                {file && (
                  <div className="flex items-center space-x-2 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>{file.name}</span>
                  </div>
                )}

                {/* Template Download */}
                <div className="flex items-center justify-between p-4 bg-[#23233a]/30 rounded-lg">
                  <div>
                    <h3 className="text-white font-medium">Need a template?</h3>
                    <p className="text-[#b0b0d0] text-sm">Download our CSV template to ensure proper formatting</p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={downloadTemplate}>
                    <FileText className="w-4 h-4 mr-2" />
                    Download Template
                  </Button>
                </div>
              </div>

              {/* Preview */}
              {previewData.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-white font-medium">Preview (first 5 rows)</h3>
                  <div className="bg-[#23233a]/30 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-[#23233a]/50">
                          <tr>
                            {Object.keys(previewData[0] || {}).map(header => (
                              <th key={header} className="px-3 py-2 text-left text-[#b0b0d0] font-medium">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.map((row, index) => (
                            <tr key={index} className="border-t border-[#23233a]/20">
                              {Object.values(row).map((value, cellIndex) => (
                                <td key={cellIndex} className="px-3 py-2 text-white">
                                  {String(value)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Errors */}
              {errors.length > 0 && (
                <div className="space-y-2">
                  {errors.map((error, index) => (
                    <div key={index} className="flex items-center space-x-2 text-red-400">
                      <AlertCircle className="w-4 h-4" />
                      <span>{error}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Progress */}
              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                    <span className="text-white">Processing...</span>
                  </div>
                  <div className="w-full bg-[#23233a]/30 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Export Options */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-white font-medium mb-3">Export Format</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {(['csv', 'xlsx', 'json'] as const).map(format => (
                      <button
                        key={format}
                        onClick={() => setExportFormat(format)}
                        className={`p-3 rounded-lg border transition-colors ${
                          exportFormat === format
                            ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                            : 'border-[#23233a]/50 text-[#b0b0d0] hover:border-[#23233a]/70'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-lg font-medium">{format.toUpperCase()}</div>
                          <div className="text-xs opacity-75">
                            {format === 'csv' && 'Comma separated'}
                            {format === 'xlsx' && 'Excel format'}
                            {format === 'json' && 'JSON data'}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Export Options */}
                <div className="space-y-3">
                  <h3 className="text-white font-medium">Export Options</h3>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" defaultChecked className="rounded border-[#23233a]/50 bg-[#23233a]/30" />
                      <span className="text-[#b0b0d0]">Include all fields</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" defaultChecked className="rounded border-[#23233a]/50 bg-[#23233a]/30" />
                      <span className="text-[#b0b0d0]">Include related data</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded border-[#23233a]/50 bg-[#23233a]/30" />
                      <span className="text-[#b0b0d0]">Export only selected items</span>
                    </label>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-[#23233a]/30">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={mode === 'import' ? handleImport : handleExport}
            disabled={isProcessing || (mode === 'import' && !file)}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {mode === 'import' ? <Upload className="w-4 h-4 mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                {mode === 'import' ? 'Import' : 'Export'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ImportExportModal; 