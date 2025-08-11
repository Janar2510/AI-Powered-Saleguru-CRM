import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Save, 
  Send, 
  Download, 
  Eye, 
  Edit, 
  Copy,
  Trash2,
  Building,
  User,
  Calendar,
  DollarSign,
  Package,
  Settings,
  FileType,
  ShoppingCart,
  CheckCircle,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  ArrowRight,
  FileCheck,
  CreditCard
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useToastContext } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import { DocumentGenerationService, DocumentData, DocumentTemplate } from '../../services/documentGenerationService';

interface QuotationItem {
  id: string;
  product_id?: string;
  product_name: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  tax_rate: number;
  total: number;
  sku?: string;
  category?: string;
  is_upsell?: boolean;
  upsell_reason?: string;
  variant_attributes?: Record<string, string>;
}

interface UpsellSuggestion {
  id: string;
  product_name: string;
  description: string;
  unit_price: number;
  reason: string;
  discount_percent: number;
  urgency: 'low' | 'medium' | 'high';
}

interface ProductVariant {
  id: string;
  product_name: string;
  attributes: Record<string, string[]>;
  base_price: number;
  variants: Array<{
    id: string;
    combination: Record<string, string>;
    price_modifier: number;
    stock: number;
  }>;
}

interface Quotation {
  id: string;
  number: string;
  customer_name: string;
  customer_email: string;
  customer_address?: string;
  customer_phone?: string;
  company_name: string;
  company_address?: string;
  company_phone?: string;
  company_email?: string;
  company_website?: string;
  quotation_date: string;
  valid_until: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
  items: QuotationItem[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  notes?: string;
  terms_conditions?: string;
  template_id?: string;
  payment_terms?: string;
  payment_method?: string;
  shipping_method?: string;
  incoterms?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  signature_status: 'pending' | 'signed' | 'not_required';
  proforma_invoice_id?: string;
}

const QuotationBuilder: React.FC = () => {
  const [activeTab, setActiveTab] = useState('builder');
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCustomer, setFilterCustomer] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const { showToast } = useToastContext();
  const { user } = useAuth();

  // Form state for new quotation
  const [quotationData, setQuotationData] = useState({
    customer_name: '',
    customer_email: '',
    customer_address: '',
    customer_phone: '',
    company_name: 'SaleGuru CRM',
    company_address: '123 Business St, City, Country',
    company_phone: '+1-234-567-8900',
    company_email: 'hello@salesguru.com',
    company_website: 'www.salesguru.com',
    quotation_date: new Date().toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    terms_conditions: '',
    template_id: 'quotation-modern',
    payment_terms: 'Payment is required within 14 business days',
    payment_method: 'Bank Transfer',
    shipping_method: 'Standard Shipping',
    incoterms: 'FOB'
  });

  const [quotationItems, setQuotationItems] = useState<QuotationItem[]>([]);
  const [upsellSuggestions, setUpsellSuggestions] = useState<UpsellSuggestion[]>([]);
  const [showUpsellPanel, setShowUpsellPanel] = useState(false);
  const [selectedProductVariant, setSelectedProductVariant] = useState<ProductVariant | null>(null);
  const [showVariantGrid, setShowVariantGrid] = useState(false);
  const [esignatureEnabled, setEsignatureEnabled] = useState(false);
  const [signatureFields, setSignatureFields] = useState<Array<{id: string, x: number, y: number, type: 'signature' | 'date' | 'initial'}>>([]);

  useEffect(() => {
    loadQuotations();
    loadTemplates();
    loadUpsellSuggestions();
  }, []);

  const loadQuotations = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotations(data || []);
    } catch (error) {
      console.error('Error loading quotations:', error);
      showToast({ title: 'Error loading quotations', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const templates = await DocumentGenerationService.getTemplates('quotation');
      setTemplates(templates);
      
      // Set default template
      const defaultTemplate = templates.find(t => t.id === 'quotation-modern');
      if (defaultTemplate) {
        setSelectedTemplate(defaultTemplate);
        setQuotationData(prev => ({ ...prev, template_id: defaultTemplate.id }));
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const loadUpsellSuggestions = async () => {
    // Simulated upsell suggestions based on current items
    const suggestions: UpsellSuggestion[] = [
      {
        id: 'upsell-1',
        product_name: 'Extended Warranty',
        description: '3-year extended warranty coverage',
        unit_price: 299.99,
        reason: 'Protect your investment with extended coverage',
        discount_percent: 10,
        urgency: 'medium'
      },
      {
        id: 'upsell-2',
        product_name: 'Premium Support Package',
        description: '24/7 priority support and maintenance',
        unit_price: 199.99,
        reason: 'Get priority support and faster issue resolution',
        discount_percent: 15,
        urgency: 'high'
      },
      {
        id: 'upsell-3',
        product_name: 'Training Session',
        description: '2-hour personalized training session',
        unit_price: 150.00,
        reason: 'Maximize your ROI with expert training',
        discount_percent: 20,
        urgency: 'low'
      }
    ];
    setUpsellSuggestions(suggestions);

    // Sample product variant for demonstration
    const sampleProductVariant: ProductVariant = {
      id: 'product-1',
      product_name: 'Premium T-Shirt',
      attributes: {
        'Size': ['S', 'M', 'L', 'XL'],
        'Color': ['Red', 'Blue', 'Green', 'Black'],
        'Material': ['Cotton', 'Polyester']
      },
      base_price: 25.00,
      variants: [
        { id: 'v1', combination: { 'Size': 'S', 'Color': 'Red', 'Material': 'Cotton' }, price_modifier: 0, stock: 50 },
        { id: 'v2', combination: { 'Size': 'M', 'Color': 'Red', 'Material': 'Cotton' }, price_modifier: 0, stock: 75 },
        { id: 'v3', combination: { 'Size': 'L', 'Color': 'Red', 'Material': 'Cotton' }, price_modifier: 2, stock: 60 },
        { id: 'v4', combination: { 'Size': 'XL', 'Color': 'Red', 'Material': 'Cotton' }, price_modifier: 3, stock: 40 },
        { id: 'v5', combination: { 'Size': 'S', 'Color': 'Blue', 'Material': 'Cotton' }, price_modifier: 0, stock: 45 },
        { id: 'v6', combination: { 'Size': 'M', 'Color': 'Blue', 'Material': 'Cotton' }, price_modifier: 0, stock: 80 },
        { id: 'v7', combination: { 'Size': 'L', 'Color': 'Blue', 'Material': 'Cotton' }, price_modifier: 2, stock: 65 },
        { id: 'v8', combination: { 'Size': 'XL', 'Color': 'Blue', 'Material': 'Cotton' }, price_modifier: 3, stock: 35 },
        { id: 'v9', combination: { 'Size': 'S', 'Color': 'Green', 'Material': 'Polyester' }, price_modifier: -2, stock: 30 },
        { id: 'v10', combination: { 'Size': 'M', 'Color': 'Green', 'Material': 'Polyester' }, price_modifier: -2, stock: 55 },
        { id: 'v11', combination: { 'Size': 'L', 'Color': 'Green', 'Material': 'Polyester' }, price_modifier: 0, stock: 40 },
        { id: 'v12', combination: { 'Size': 'XL', 'Color': 'Green', 'Material': 'Polyester' }, price_modifier: 1, stock: 25 },
        { id: 'v13', combination: { 'Size': 'S', 'Color': 'Black', 'Material': 'Polyester' }, price_modifier: 1, stock: 35 },
        { id: 'v14', combination: { 'Size': 'M', 'Color': 'Black', 'Material': 'Polyester' }, price_modifier: 1, stock: 70 },
        { id: 'v15', combination: { 'Size': 'L', 'Color': 'Black', 'Material': 'Polyester' }, price_modifier: 3, stock: 55 },
        { id: 'v16', combination: { 'Size': 'XL', 'Color': 'Black', 'Material': 'Polyester' }, price_modifier: 4, stock: 30 }
      ]
    };
    setSelectedProductVariant(sampleProductVariant);
  };

  const createQuotation = async () => {
    try {
      setIsLoading(true);
      
      // Generate quotation number
      const quotationNumber = `QT-${new Date().getFullYear()}-${String(quotations.length + 1).padStart(3, '0')}`;
      
      const newQuotation: Omit<Quotation, 'id' | 'created_at' | 'updated_at'> = {
        number: quotationNumber,
        customer_name: quotationData.customer_name,
        customer_email: quotationData.customer_email,
        customer_address: quotationData.customer_address,
        customer_phone: quotationData.customer_phone,
        company_name: quotationData.company_name,
        company_address: quotationData.company_address,
        company_phone: quotationData.company_phone,
        company_email: quotationData.company_email,
        company_website: quotationData.company_website,
        quotation_date: quotationData.quotation_date,
        valid_until: quotationData.valid_until,
        status: 'draft',
        items: quotationItems,
        subtotal: calculateSubtotal(),
        tax_amount: calculateTaxAmount(),
        discount_amount: calculateDiscountAmount(),
        total_amount: calculateTotalAmount(),
        notes: quotationData.notes,
        terms_conditions: quotationData.terms_conditions,
        template_id: quotationData.template_id,
        payment_terms: quotationData.payment_terms,
        payment_method: quotationData.payment_method,
        shipping_method: quotationData.shipping_method,
        incoterms: quotationData.incoterms,
        created_by: user?.id || '',
        signature_status: 'pending'
      };

      const { data, error } = await supabase
        .from('quotations')
        .insert([newQuotation])
        .select()
        .single();

      if (error) throw error;

      showToast({ title: 'Quotation created successfully', type: 'success' });
      setShowCreateModal(false);
      resetForm();
      loadQuotations();
    } catch (error) {
      console.error('Error creating quotation:', error);
      showToast({ title: 'Error creating quotation', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const convertToProForma = async (quotation: Quotation) => {
    try {
      setIsLoading(true);
      
      // Generate pro forma number
      const proformaNumber = `PF-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      
      const proformaData: DocumentData = {
        number: proformaNumber,
        customer_name: quotation.customer_name,
        customer_email: quotation.customer_email,
        customer_address: quotation.customer_address,
        customer_phone: quotation.customer_phone,
        company_name: quotation.company_name,
        company_address: quotation.company_address,
        company_phone: quotation.company_phone,
        company_email: quotation.company_email,
        company_website: quotation.company_website,
        issue_date: new Date().toISOString().split('T')[0],
        items: quotation.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_percent: item.discount_percent,
          tax_rate: item.tax_rate,
          total: item.total,
          sku: item.sku,
          category: item.category
        })),
        subtotal: quotation.subtotal,
        tax_rate: 20,
        tax_amount: quotation.tax_amount,
        discount_amount: quotation.discount_amount,
        total: quotation.total_amount,
        notes: quotation.notes,
        terms_conditions: quotation.terms_conditions,
        payment_terms: quotation.payment_terms,
        payment_method: quotation.payment_method,
        shipping_method: quotation.shipping_method,
        incoterms: quotation.incoterms,
        status: 'draft'
      };

      // Generate pro forma document
      const html = await DocumentGenerationService.generateDocument('proforma-modern', proformaData);
      
      // Save pro forma to database
      const { data, error } = await supabase
        .from('generated_documents')
        .insert({
          template_id: 'proforma-modern',
          document_data: proformaData,
          html_content: html,
          generated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Update quotation with pro forma reference
      await supabase
        .from('quotations')
        .update({ proforma_invoice_id: data.id })
        .eq('id', quotation.id);

      showToast({ title: 'Pro Forma Invoice created successfully', type: 'success' });
      loadQuotations();
    } catch (error) {
      console.error('Error creating pro forma:', error);
      showToast({ title: 'Error creating pro forma invoice', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const convertToSalesOrder = async (quotation: Quotation) => {
    try {
      setIsLoading(true);
      
      // Generate sales order number
      const orderNumber = `SO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      
      const salesOrder = {
        number: orderNumber,
        customer_name: quotation.customer_name,
        customer_email: quotation.customer_email,
        customer_address: quotation.customer_address,
        customer_phone: quotation.customer_phone,
        company_name: quotation.company_name,
        order_date: new Date().toISOString().split('T')[0],
        status: 'confirmed',
        total_amount: quotation.total_amount,
        tax_amount: quotation.tax_amount,
        shipping_amount: 0,
        items: quotation.items,
        notes: `Converted from quotation ${quotation.number}`,
        shipping_method: quotation.shipping_method,
        payment_terms: quotation.payment_terms,
        incoterms: quotation.incoterms,
        signature_required: true,
        signature_status: 'pending',
        created_by: user?.id || '',
        related_quote_id: quotation.id
      };

      const { data, error } = await supabase
        .from('sales_orders')
        .insert([salesOrder])
        .select()
        .single();

      if (error) throw error;

      // Update quotation status
      await supabase
        .from('quotations')
        .update({ status: 'converted' })
        .eq('id', quotation.id);

      showToast({ title: 'Sales Order created successfully', type: 'success' });
      loadQuotations();
    } catch (error) {
      console.error('Error creating sales order:', error);
      showToast({ title: 'Error creating sales order', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return quotationItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const calculateTaxAmount = () => {
    return quotationItems.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unit_price;
      return sum + (itemTotal * (item.tax_rate / 100));
    }, 0);
  };

  const calculateDiscountAmount = () => {
    return quotationItems.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unit_price;
      return sum + (itemTotal * (item.discount_percent / 100));
    }, 0);
  };

  const calculateTotalAmount = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTaxAmount();
    const discount = calculateDiscountAmount();
    return subtotal + tax - discount;
  };

  const addQuotationItem = () => {
    const newItem: QuotationItem = {
      id: Date.now().toString(),
      product_name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      discount_percent: 0,
      tax_rate: 20, // Default tax rate
      total: 0
    };
    setQuotationItems([...quotationItems, newItem]);
  };

  const updateQuotationItem = (id: string, updates: Partial<QuotationItem>) => {
    setQuotationItems(items => 
      items.map(item => 
        item.id === id 
          ? { ...item, ...updates, total: (item.quantity * item.unit_price) * (1 - (updates.discount_percent || item.discount_percent) / 100) }
          : item
      )
    );
  };

  const removeQuotationItem = (id: string) => {
    setQuotationItems(items => items.filter(item => item.id !== id));
  };

  const resetForm = () => {
    setQuotationData({
      customer_name: '',
      customer_email: '',
      customer_address: '',
      customer_phone: '',
      company_name: 'SaleGuru CRM',
      company_address: '123 Business St, City, Country',
      company_phone: '+1-234-567-8900',
      company_email: 'hello@salesguru.com',
      company_website: 'www.salesguru.com',
      quotation_date: new Date().toISOString().split('T')[0],
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: '',
      terms_conditions: '',
      template_id: quotationData.template_id,
      payment_terms: 'Payment is required within 14 business days',
      payment_method: 'Bank Transfer',
      shipping_method: 'Standard Shipping',
      incoterms: 'FOB'
    });
    setQuotationItems([]);
    setSignatureFields([]);
    setEsignatureEnabled(false);
  };

  // Upselling functions
  const addUpsellItem = (suggestion: UpsellSuggestion) => {
    const newItem: QuotationItem = {
      id: `item-${Date.now()}`,
      product_name: suggestion.product_name,
      description: suggestion.description,
      quantity: 1,
      unit_price: suggestion.unit_price,
      discount_percent: suggestion.discount_percent,
      tax_rate: 0,
      total: suggestion.unit_price * (1 - suggestion.discount_percent / 100),
      is_upsell: true,
      upsell_reason: suggestion.reason
    };
    setQuotationItems(prev => [...prev, newItem]);
    showToast({ title: 'Upsell item added', type: 'success' });
  };

  const removeUpsellItem = (itemId: string) => {
    setQuotationItems(prev => prev.filter(item => item.id !== itemId));
    showToast({ title: 'Upsell item removed', type: 'info' });
  };

  // Variant Grid functions
  const openVariantGrid = (product: ProductVariant) => {
    setSelectedProductVariant(product);
    setShowVariantGrid(true);
  };

  const addVariantToQuotation = (variant: any) => {
    const newItem: QuotationItem = {
      id: `item-${Date.now()}`,
      product_name: `${selectedProductVariant?.product_name} - ${Object.values(variant.combination).join(' ')}`,
      description: `Variant: ${Object.entries(variant.combination).map(([key, value]) => `${key}: ${value}`).join(', ')}`,
      quantity: 1,
      unit_price: (selectedProductVariant?.base_price || 0) + variant.price_modifier,
      discount_percent: 0,
      tax_rate: 0,
      total: (selectedProductVariant?.base_price || 0) + variant.price_modifier,
      variant_attributes: variant.combination
    };
    setQuotationItems(prev => [...prev, newItem]);
    setShowVariantGrid(false);
    showToast({ title: 'Variant added to quotation', type: 'success' });
  };

  // eSignature functions
  const toggleEsignature = () => {
    setEsignatureEnabled(!esignatureEnabled);
    if (!esignatureEnabled) {
      // Add default signature fields
      setSignatureFields([
        { id: 'customer-signature', x: 100, y: 500, type: 'signature' },
        { id: 'customer-date', x: 100, y: 520, type: 'date' },
        { id: 'company-signature', x: 400, y: 500, type: 'signature' },
        { id: 'company-date', x: 400, y: 520, type: 'date' }
      ]);
    } else {
      setSignatureFields([]);
    }
  };

  const addSignatureField = (type: 'signature' | 'date' | 'initial') => {
    const newField = {
      id: `${type}-${Date.now()}`,
      x: 100,
      y: 100,
      type
    };
    setSignatureFields(prev => [...prev, newField]);
  };

  const updateSignatureField = (id: string, updates: Partial<{x: number, y: number}>) => {
    setSignatureFields(prev => 
      prev.map(field => 
        field.id === id ? { ...field, ...updates } : field
      )
    );
  };

  const removeSignatureField = (id: string) => {
    setSignatureFields(prev => prev.filter(field => field.id !== id));
  };

  const previewQuotation = async () => {
    try {
      setIsLoading(true);
      
      const documentData: DocumentData = {
        number: `QT-${new Date().getFullYear()}-${String(quotations.length + 1).padStart(3, '0')}`,
        customer_name: quotationData.customer_name,
        customer_email: quotationData.customer_email,
        customer_address: quotationData.customer_address,
        customer_phone: quotationData.customer_phone,
        company_name: quotationData.company_name,
        company_address: quotationData.company_address,
        company_phone: quotationData.company_phone,
        company_email: quotationData.company_email,
        company_website: quotationData.company_website,
        issue_date: quotationData.quotation_date,
        valid_until: quotationData.valid_until,
        items: quotationItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_percent: item.discount_percent,
          tax_rate: item.tax_rate,
          total: item.total,
          sku: item.sku,
          category: item.category
        })),
        subtotal: calculateSubtotal(),
        tax_rate: 20,
        tax_amount: calculateTaxAmount(),
        discount_amount: calculateDiscountAmount(),
        total: calculateTotalAmount(),
        notes: quotationData.notes,
        terms_conditions: quotationData.terms_conditions,
        payment_terms: quotationData.payment_terms,
        payment_method: quotationData.payment_method,
        shipping_method: quotationData.shipping_method,
        incoterms: quotationData.incoterms,
        status: 'draft'
      };

      const html = await DocumentGenerationService.generateDocument(quotationData.template_id, documentData);
      setPreviewHtml(html);
      setShowPreviewModal(true);
    } catch (error) {
      console.error('Error previewing quotation:', error);
      showToast({ title: 'Error previewing quotation', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'sent': return 'primary';
      case 'accepted': return 'success';
      case 'rejected': return 'danger';
      case 'expired': return 'warning';
      case 'converted': return 'outline';
      default: return 'secondary';
    }
  };

  const filterAndSortQuotations = () => {
    let filtered = quotations;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(q => q.status === filterStatus);
    }

    if (filterCustomer) {
      filtered = filtered.filter(q => 
        q.customer_name.toLowerCase().includes(filterCustomer.toLowerCase()) ||
        q.customer_email.toLowerCase().includes(filterCustomer.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof Quotation];
      const bValue = b[sortBy as keyof Quotation];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

    return filtered;
  };

  const renderQuotationCards = () => {
    const filteredQuotations = filterAndSortQuotations();
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuotations.map((quotation) => (
          <Card key={quotation.id} className="hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{quotation.number}</h3>
                  <p className="text-[#b0b0d0] text-sm">{quotation.customer_name}</p>
                </div>
                <Badge variant={getStatusColor(quotation.status)}>
                  {quotation.status}
                </Badge>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[#b0b0d0]">Date:</span>
                  <span className="text-white">{new Date(quotation.quotation_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#b0b0d0]">Valid Until:</span>
                  <span className="text-white">{new Date(quotation.valid_until).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#b0b0d0]">Total:</span>
                  <span className="text-white font-semibold">${quotation.total_amount.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="secondary" onClick={() => setSelectedQuotation(quotation)}>
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="secondary" onClick={() => convertToProForma(quotation)}>
                  <FileCheck className="w-4 h-4 mr-1" />
                  Pro Forma
                </Button>
                <Button size="sm" variant="secondary" onClick={() => convertToSalesOrder(quotation)}>
                  <ArrowRight className="w-4 h-4 mr-1" />
                  Convert
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Quotation Builder</h1>
          <p className="text-[#b0b0d0] mt-2">Create polished quotes in seconds with templates and price lists</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            variant={showUpsellPanel ? "primary" : "secondary"}
            onClick={() => setShowUpsellPanel(!showUpsellPanel)}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Upselling
          </Button>
          <Button 
            variant={esignatureEnabled ? "success" : "secondary"}
            onClick={toggleEsignature}
          >
            <FileCheck className="w-4 h-4 mr-2" />
            eSignature
          </Button>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Quotation
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-[#23233a] p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('builder')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'builder'
              ? 'bg-[#0ea5e9] text-white'
              : 'text-[#b0b0d0] hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4 mr-2 inline" />
          Builder
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'templates'
              ? 'bg-[#0ea5e9] text-white'
              : 'text-[#b0b0d0] hover:text-white'
          }`}
        >
          <FileType className="w-4 h-4 mr-2 inline" />
          Templates
        </button>
        <button
          onClick={() => setActiveTab('quotations')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'quotations'
              ? 'bg-[#0ea5e9] text-white'
              : 'text-[#b0b0d0] hover:text-white'
          }`}
        >
          <ShoppingCart className="w-4 h-4 mr-2 inline" />
          Quotations
        </button>
        <button
          onClick={() => setActiveTab('proforma')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'proforma'
              ? 'bg-[#0ea5e9] text-white'
              : 'text-[#b0b0d0] hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4 mr-2 inline" />
          Pro Forma
        </button>
      </div>

      {/* Upselling Panel */}
      {showUpsellPanel && (
        <div className="bg-[#1e293b] rounded-lg p-6 border border-[#334155]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Upselling Suggestions</h3>
            <Badge variant="primary">{upsellSuggestions.length} suggestions</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upsellSuggestions.map((suggestion) => (
              <div key={suggestion.id} className="bg-[#23233a] rounded-lg p-4 border border-[#334155]">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white">{suggestion.product_name}</h4>
                  <Badge 
                    variant={
                      suggestion.urgency === 'high' ? 'danger' : 
                      suggestion.urgency === 'medium' ? 'warning' : 'secondary'
                    }
                  >
                    {suggestion.urgency}
                  </Badge>
                </div>
                <p className="text-[#b0b0d0] text-sm mb-3">{suggestion.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-semibold">${suggestion.unit_price}</span>
                  <span className="text-[#10b981] text-sm">{suggestion.discount_percent}% off</span>
                </div>
                <p className="text-[#b0b0d0] text-xs mb-3 italic">"{suggestion.reason}"</p>
                <Button 
                  size="sm" 
                  variant="primary" 
                  onClick={() => addUpsellItem(suggestion)}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add to Quotation
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* eSignature Status */}
      {esignatureEnabled && (
        <div className="bg-[#10b981] bg-opacity-10 border border-[#10b981] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileCheck className="w-5 h-5 text-[#10b981] mr-2" />
              <span className="text-[#10b981] font-medium">eSignature Enabled</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="secondary" onClick={() => addSignatureField('signature')}>
                Add Signature
              </Button>
              <Button size="sm" variant="secondary" onClick={() => addSignatureField('date')}>
                Add Date
              </Button>
              <Button size="sm" variant="secondary" onClick={() => addSignatureField('initial')}>
                Add Initial
              </Button>
            </div>
          </div>
          {signatureFields.length > 0 && (
            <div className="mt-3 text-sm text-[#b0b0d0]">
              {signatureFields.length} signature field(s) configured
            </div>
          )}
        </div>
      )}

      {/* Builder Tab */}
      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Quotation Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Quotation Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#b0b0d0] text-sm mb-2">Customer Name</label>
                    <input
                      type="text"
                      value={quotationData.customer_name}
                      onChange={(e) => setQuotationData({...quotationData, customer_name: e.target.value})}
                      className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                      placeholder="Customer name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[#b0b0d0] text-sm mb-2">Customer Email</label>
                    <input
                      type="email"
                      value={quotationData.customer_email}
                      onChange={(e) => setQuotationData({...quotationData, customer_email: e.target.value})}
                      className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                      placeholder="customer@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[#b0b0d0] text-sm mb-2">Customer Phone</label>
                    <input
                      type="tel"
                      value={quotationData.customer_phone}
                      onChange={(e) => setQuotationData({...quotationData, customer_phone: e.target.value})}
                      className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                      placeholder="+1-234-567-8900"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[#b0b0d0] text-sm mb-2">Template</label>
                    <select
                      value={quotationData.template_id}
                      onChange={(e) => setQuotationData({...quotationData, template_id: e.target.value})}
                      className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                    >
                      {templates.map(template => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-[#b0b0d0] text-sm mb-2">Quotation Date</label>
                    <input
                      type="date"
                      value={quotationData.quotation_date}
                      onChange={(e) => setQuotationData({...quotationData, quotation_date: e.target.value})}
                      className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[#b0b0d0] text-sm mb-2">Valid Until</label>
                    <input
                      type="date"
                      value={quotationData.valid_until}
                      onChange={(e) => setQuotationData({...quotationData, valid_until: e.target.value})}
                      className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-[#b0b0d0] text-sm mb-2">Customer Address</label>
                    <textarea
                      value={quotationData.customer_address}
                      onChange={(e) => setQuotationData({...quotationData, customer_address: e.target.value})}
                      className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                      rows={3}
                      placeholder="Customer address"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Items Section */}
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Items</h3>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="secondary" onClick={() => openVariantGrid(selectedProductVariant!)}>
                      <Package className="w-4 h-4 mr-2" />
                      Variant Grid
                    </Button>
                    <Button size="sm" variant="secondary" onClick={addQuotationItem}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {quotationItems.map((item, index) => (
                    <div key={item.id} className={`border rounded-lg p-4 ${
                      item.is_upsell 
                        ? 'border-[#10b981] bg-[#10b981] bg-opacity-5' 
                        : 'border-[#23233a]'
                    }`}>
                      {item.is_upsell && (
                        <div className="flex items-center mb-2">
                          <Badge variant="success" className="mr-2">Upsell</Badge>
                          <span className="text-[#10b981] text-sm italic">"{item.upsell_reason}"</span>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-[#b0b0d0] text-sm mb-1">Product</label>
                          <input
                            type="text"
                            value={item.product_name}
                            onChange={(e) => updateQuotationItem(item.id, { product_name: e.target.value })}
                            className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                            placeholder="Product name"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-[#b0b0d0] text-sm mb-1">Qty</label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuotationItem(item.id, { quantity: parseInt(e.target.value) || 0 })}
                            className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                            min="1"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-[#b0b0d0] text-sm mb-1">Price</label>
                          <input
                            type="number"
                            value={item.unit_price}
                            onChange={(e) => updateQuotationItem(item.id, { unit_price: parseFloat(e.target.value) || 0 })}
                            className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                            step="0.01"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-[#b0b0d0] text-sm mb-1">Discount %</label>
                          <input
                            type="number"
                            value={item.discount_percent}
                            onChange={(e) => updateQuotationItem(item.id, { discount_percent: parseFloat(e.target.value) || 0 })}
                            className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                            step="0.1"
                            max="100"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-[#b0b0d0] text-sm mb-1">Total</label>
                          <div className="p-2 bg-[#16213e] border border-gray-600 rounded text-white font-semibold">
                            ${item.total.toFixed(2)}
                          </div>
                        </div>
                        
                        <div className="flex items-end">
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => removeQuotationItem(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Panel - Summary & Actions */}
          <div className="space-y-6">
            <Card>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[#b0b0d0]">Subtotal:</span>
                    <span className="text-white">${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#b0b0d0]">Tax:</span>
                    <span className="text-white">${calculateTaxAmount().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#b0b0d0]">Discount:</span>
                    <span className="text-white">-${calculateDiscountAmount().toFixed(2)}</span>
                  </div>
                  <div className="border-t border-[#23233a] pt-3">
                    <div className="flex justify-between">
                      <span className="text-white font-semibold">Total:</span>
                      <span className="text-white font-semibold text-lg">${calculateTotalAmount().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Actions</h3>
                
                <div className="space-y-3">
                  <Button variant="primary" className="w-full" onClick={createQuotation} disabled={isLoading}>
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Creating...' : 'Create Quotation'}
                  </Button>
                  
                  <Button variant="secondary" className="w-full" onClick={previewQuotation} disabled={isLoading}>
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  
                  <Button variant="secondary" className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    Send to Customer
                  </Button>
                  
                  <Button variant="secondary" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Quotation Templates</h2>
            <Button variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                    <Badge variant="primary">{template.style}</Badge>
                  </div>
                  <p className="text-[#b0b0d0] mb-4">Professional {template.style} design for quotations</p>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="secondary">
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                    <Button size="sm" variant="secondary">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="secondary">
                      <Copy className="w-4 h-4 mr-1" />
                      Duplicate
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Quotations Tab */}
      {activeTab === 'quotations' && (
        <div className="space-y-6">
          {/* Filters and Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4">
              <div>
                <label className="block text-[#b0b0d0] text-sm mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="expired">Expired</option>
                  <option value="converted">Converted</option>
                </select>
              </div>
              
              <div>
                <label className="block text-[#b0b0d0] text-sm mb-1">Customer</label>
                <input
                  type="text"
                  value={filterCustomer}
                  onChange={(e) => setFilterCustomer(e.target.value)}
                  placeholder="Search customer..."
                  className="p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                />
              </div>
              
              <div>
                <label className="block text-[#b0b0d0] text-sm mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                >
                  <option value="created_at">Date Created</option>
                  <option value="quotation_date">Quotation Date</option>
                  <option value="customer_name">Customer Name</option>
                  <option value="total_amount">Total Amount</option>
                  <option value="status">Status</option>
                </select>
              </div>
              
              <div>
                <label className="block text-[#b0b0d0] text-sm mb-1">Order</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  className="p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant={viewMode === 'grid' ? 'primary' : 'secondary'}
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'table' ? 'primary' : 'secondary'}
                onClick={() => setViewMode('table')}
              >
                Table
              </Button>
            </div>
          </div>

          {/* Quotations List */}
          {renderQuotationCards()}
        </div>
      )}

      {/* Pro Forma Tab */}
      {activeTab === 'proforma' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Pro Forma Invoices</h2>
            <Button variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Pro Forma
            </Button>
          </div>
          
          <Card>
            <div className="p-6">
              <p className="text-[#b0b0d0]">Pro forma invoices are automatically generated from quotations.</p>
              <p className="text-[#b0b0d0] mt-2">Use the "Pro Forma" button on any quotation to create a pro forma invoice.</p>
            </div>
          </Card>
        </div>
      )}

      {/* Create Quotation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#1a1a2e] p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Quotation</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#b0b0d0] text-sm mb-2">Customer Name</label>
                  <input
                    type="text"
                    value={quotationData.customer_name}
                    onChange={(e) => setQuotationData({...quotationData, customer_name: e.target.value})}
                    className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                    placeholder="Customer name"
                  />
                </div>
                
                <div>
                  <label className="block text-[#b0b0d0] text-sm mb-2">Customer Email</label>
                  <input
                    type="email"
                    value={quotationData.customer_email}
                    onChange={(e) => setQuotationData({...quotationData, customer_email: e.target.value})}
                    className="w-full p-2 bg-[#16213e] border border-gray-600 rounded text-white"
                    placeholder="customer@example.com"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-3 pt-4 border-t border-[#23233a]/30">
                <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={createQuotation} disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Creating...' : 'Create Quotation'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#1a1a2e] p-6 rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Quotation Preview</h3>
              <div className="flex items-center space-x-2">
                <Button variant="secondary" onClick={() => setShowPreviewModal(false)}>
                  Close
                </Button>
                <Button variant="primary">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg overflow-hidden">
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          </div>
        </div>
      )}

      {/* Variant Grid Modal */}
      {showVariantGrid && selectedProductVariant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1e293b] rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">
                Variant Grid - {selectedProductVariant.product_name}
              </h3>
              <Button variant="secondary" onClick={() => setShowVariantGrid(false)}>
                Close
              </Button>
            </div>
            
            <div className="mb-4">
              <p className="text-[#b0b0d0]">Base Price: ${selectedProductVariant.base_price}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-[#334155]">
                <thead>
                  <tr className="bg-[#23233a]">
                    {Object.keys(selectedProductVariant.attributes).map((attr) => (
                      <th key={attr} className="border border-[#334155] p-2 text-left text-white">
                        {attr}
                      </th>
                    ))}
                    <th className="border border-[#334155] p-2 text-left text-white">Price</th>
                    <th className="border border-[#334155] p-2 text-left text-white">Stock</th>
                    <th className="border border-[#334155] p-2 text-left text-white">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProductVariant.variants.map((variant) => (
                    <tr key={variant.id} className="border-b border-[#334155]">
                      {Object.keys(selectedProductVariant.attributes).map((attr) => (
                        <td key={attr} className="border border-[#334155] p-2 text-[#b0b0d0]">
                          {variant.combination[attr]}
                        </td>
                      ))}
                      <td className="border border-[#334155] p-2 text-white">
                        ${(selectedProductVariant.base_price + variant.price_modifier).toFixed(2)}
                      </td>
                      <td className="border border-[#334155] p-2 text-[#b0b0d0]">
                        {variant.stock}
                      </td>
                      <td className="border border-[#334155] p-2">
                        <Button 
                          size="sm" 
                          variant="primary" 
                          onClick={() => addVariantToQuotation(variant)}
                          disabled={variant.stock === 0}
                        >
                          Add
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationBuilder; 