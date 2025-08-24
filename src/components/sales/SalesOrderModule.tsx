import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingCart, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Truck,
  Package,
  DollarSign,
  User,
  Building,
  Calendar,
  Mail,
  Phone,
  MapPin,
  PenTool,
  Download,
  Send,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  ArrowRight,
  FileCheck,
  CreditCard
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useToastContext } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';

interface SalesOrder {
  id: string;
  number: string;
  customer_name: string;
  customer_email: string;
  customer_address?: string;
  company_name: string;
  order_date: string;
  delivery_date?: string;
  status: 'draft' | 'confirmed' | 'in_production' | 'ready_for_delivery' | 'delivered' | 'cancelled';
  total_amount: number;
  tax_amount: number;
  shipping_amount: number;
  items: SalesOrderItem[];
  notes?: string;
  shipping_method?: string;
  payment_terms?: string;
  incoterms?: string;
  related_quote_id?: string;
  related_deal_id?: string;
  signature_required: boolean;
  signature_status: 'pending' | 'signed' | 'not_required';
  created_at: string;
  updated_at: string;
}

interface SalesOrderItem {
  id: string;
  product_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  delivered_quantity: number;
  shipping_method: 'dropship' | 'replenish' | 'standard';
  supplier?: string;
  estimated_delivery?: string;
  is_kit?: boolean;
  kit_items?: Array<{
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
  }>;
  invoiced_quantity: number;
  invoice_status: 'not_invoiced' | 'partially_invoiced' | 'fully_invoiced';
}

interface Invoice {
  id: string;
  number: string;
  sales_order_id: string;
  customer_name: string;
  customer_email: string;
  invoice_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  payment_terms: string;
  items: InvoiceItem[];
  notes?: string;
  aging_days: number;
  created_at: string;
  updated_at: string;
}

interface InvoiceItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  invoice_type: 'ordered' | 'delivered' | 'time_materials';
  description?: string;
}

interface PaymentTerm {
  id: string;
  name: string;
  days: number;
  discount_percent?: number;
  discount_days?: number;
}

interface Quote {
  id: string;
  number: string;
  customer_name: string;
  total_amount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  valid_until: string;
  items: any[];
  signature_status: 'pending' | 'signed' | 'not_required';
}

interface EmailCommunication {
  id: string;
  order_id: string;
  customer_email: string;
  subject: string;
  content: string;
  sent_at: string;
  email_type: 'order_confirmation' | 'invoice' | 'delivery_update' | 'payment_reminder';
  status: 'sent' | 'delivered' | 'opened' | 'clicked';
  attachments?: string[];
}

interface InterCompanyOrder {
  id: string;
  source_company_id: string;
  target_company_id: string;
  source_order_id: string;
  target_order_id: string;
  order_type: 'sales' | 'purchase';
  status: 'draft' | 'confirmed' | 'in_production' | 'delivered';
  created_at: string;
  updated_at: string;
}

interface Company {
  id: string;
  name: string;
  email: string;
  address: string;
  type: 'parent' | 'subsidiary' | 'branch';
  parent_company_id?: string;
}

const SalesOrderModule: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('orders');
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showAgingModal, setShowAgingModal] = useState(false);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<SalesOrder | null>(null);
  const [invoiceType, setInvoiceType] = useState<'ordered' | 'delivered' | 'time_materials'>('ordered');
  const [showKitBuilder, setShowKitBuilder] = useState(false);
  const [selectedItemForKit, setSelectedItemForKit] = useState<SalesOrderItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
  const [showEditOrderModal, setShowEditOrderModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [emailCommunications, setEmailCommunications] = useState<EmailCommunication[]>([]);
  const [interCompanyOrders, setInterCompanyOrders] = useState<InterCompanyOrder[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showInterCompanyModal, setShowInterCompanyModal] = useState(false);
  const [selectedOrderForEmail, setSelectedOrderForEmail] = useState<SalesOrder | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'list' | 'grid'>('cards');
  const { showToast } = useToastContext();
  const { user } = useAuth();

  // Load data on component mount
  useEffect(() => {
    loadSalesOrders();
    loadQuotes();
    loadInvoices();
    loadPaymentTerms();
  }, []);

  const loadSalesOrders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('sales_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // If no orders in database, create sample data
      if (!data || data.length === 0) {
        const sampleOrders: SalesOrder[] = [
          {
            id: 'so-1',
            number: 'SO-2024-001',
            customer_name: 'ABC Corporation',
            customer_email: 'orders@abccorp.com',
            customer_address: '123 Business St, City, State 12345',
            company_name: 'ABC Corp',
            order_date: '2024-08-01',
            delivery_date: '2024-08-15',
            status: 'confirmed',
            total_amount: 15000.00,
            tax_amount: 3000.00,
            shipping_amount: 500.00,
            items: [
              {
                id: 'item-1',
                product_name: 'Premium Software License',
                description: 'Annual software license',
                quantity: 5,
                unit_price: 2500.00,
                total_price: 12500.00,
                delivered_quantity: 0,
                shipping_method: 'standard',
                invoiced_quantity: 0,
                invoice_status: 'not_invoiced'
              }
            ],
            notes: 'Standard delivery',
            shipping_method: 'standard',
            payment_terms: 'Net 30',
            incoterms: 'FOB',
            signature_required: true,
            signature_status: 'signed',
            created_at: '2024-08-01T00:00:00Z',
            updated_at: '2024-08-01T00:00:00Z'
          },
          {
            id: 'so-2',
            number: 'SO-2024-002',
            customer_name: 'Tech Startup Inc',
            customer_email: 'procurement@techstartup.com',
            customer_address: '456 Innovation Ave, Tech City, TC 67890',
            company_name: 'Tech Startup Inc',
            order_date: '2024-07-15',
            delivery_date: '2024-08-30',
            status: 'in_production',
            total_amount: 8500.00,
            tax_amount: 1700.00,
            shipping_amount: 200.00,
            items: [
              {
                id: 'item-2',
                product_name: 'Cloud Infrastructure',
                description: 'Monthly cloud services',
                quantity: 1,
                unit_price: 7083.33,
                total_price: 7083.33,
                delivered_quantity: 0,
                shipping_method: 'dropship',
                invoiced_quantity: 0,
                invoice_status: 'not_invoiced'
              }
            ],
            notes: 'Dropship from supplier',
            shipping_method: 'dropship',
            payment_terms: 'Net 30',
            incoterms: 'CIF',
            signature_required: true,
            signature_status: 'pending',
            created_at: '2024-07-15T00:00:00Z',
            updated_at: '2024-07-15T00:00:00Z'
          },
          {
            id: 'so-3',
            number: 'SO-2024-003',
            customer_name: 'Manufacturing Co',
            customer_email: 'purchasing@manufacturing.com',
            customer_address: '789 Industrial Blvd, Factory Town, FT 11111',
            company_name: 'Manufacturing Co',
            order_date: '2024-08-05',
            delivery_date: '2024-09-05',
            status: 'ready_for_delivery',
            total_amount: 25000.00,
            tax_amount: 5000.00,
            shipping_amount: 800.00,
            items: [
              {
                id: 'item-3',
                product_name: 'Enterprise Support Package',
                description: 'Annual enterprise support',
                quantity: 1,
                unit_price: 20833.33,
                total_price: 20833.33,
                delivered_quantity: 0,
                shipping_method: 'standard',
                invoiced_quantity: 0,
                invoice_status: 'not_invoiced'
              }
            ],
            notes: 'Priority delivery requested',
            shipping_method: 'standard',
            payment_terms: 'Net 30',
            incoterms: 'FOB',
            signature_required: true,
            signature_status: 'signed',
            created_at: '2024-08-05T00:00:00Z',
            updated_at: '2024-08-05T00:00:00Z'
          }
        ];
        setSalesOrders(sampleOrders);
      } else {
        setSalesOrders(data);
      }
    } catch (error) {
      showToast({ title: 'Error loading sales orders', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const loadQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .eq('status', 'sent')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
    } catch (error) {
      showToast({ title: 'Error loading quotes', type: 'error' });
    }
  };

  const loadInvoices = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // If no invoices in database, create sample data
      if (!data || data.length === 0) {
        const sampleInvoices: Invoice[] = [
          {
            id: 'inv-1',
            number: 'INV-2024-001',
            sales_order_id: 'so-1',
            customer_name: 'ABC Corporation',
            customer_email: 'accounts@abccorp.com',
            invoice_date: '2024-08-01',
            due_date: '2024-08-31',
            status: 'sent',
            subtotal: 12500.00,
            tax_amount: 2500.00,
            total_amount: 15000.00,
            paid_amount: 0,
            payment_terms: 'Net 30',
            items: [
              {
                id: 'item-1',
                product_name: 'Premium Software License',
                quantity: 5,
                unit_price: 2500.00,
                total_price: 12500.00,
                invoice_type: 'ordered',
                description: 'Annual software license'
              }
            ],
            notes: 'Invoice for software licenses',
            aging_days: 5,
            created_at: '2024-08-01T00:00:00Z',
            updated_at: '2024-08-01T00:00:00Z'
          },
          {
            id: 'inv-2',
            number: 'INV-2024-002',
            sales_order_id: 'so-2',
            customer_name: 'Tech Startup Inc',
            customer_email: 'finance@techstartup.com',
            invoice_date: '2024-07-15',
            due_date: '2024-08-14',
            status: 'overdue',
            subtotal: 7083.33,
            tax_amount: 1416.67,
            total_amount: 8500.00,
            paid_amount: 0,
            payment_terms: 'Net 30',
            items: [
              {
                id: 'item-2',
                product_name: 'Cloud Infrastructure',
                quantity: 1,
                unit_price: 7083.33,
                total_price: 7083.33,
                invoice_type: 'ordered',
                description: 'Monthly cloud services'
              }
            ],
            notes: 'Monthly cloud infrastructure invoice',
            aging_days: 22,
            created_at: '2024-07-15T00:00:00Z',
            updated_at: '2024-07-15T00:00:00Z'
          },
          {
            id: 'inv-3',
            number: 'INV-2024-003',
            sales_order_id: 'so-3',
            customer_name: 'Manufacturing Co',
            customer_email: 'purchasing@manufacturing.com',
            invoice_date: '2024-08-05',
            due_date: '2024-09-04',
            status: 'draft',
            subtotal: 20833.33,
            tax_amount: 4166.67,
            total_amount: 25000.00,
            paid_amount: 0,
            payment_terms: 'Net 30',
            items: [
              {
                id: 'item-3',
                product_name: 'Enterprise Support Package',
                quantity: 1,
                unit_price: 20833.33,
                total_price: 20833.33,
                invoice_type: 'ordered',
                description: 'Annual enterprise support'
              }
            ],
            notes: 'Enterprise support package invoice',
            aging_days: -5,
            created_at: '2024-08-05T00:00:00Z',
            updated_at: '2024-08-05T00:00:00Z'
          }
        ];
        setInvoices(sampleInvoices);
      } else {
        setInvoices(data);
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
      showToast({ title: 'Error loading invoices', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const loadPaymentTerms = async () => {
    // Simulated payment terms
    const terms: PaymentTerm[] = [
      { id: '1', name: 'Net 30', days: 30 },
      { id: '2', name: 'Net 15', days: 15 },
      { id: '3', name: '2/10 Net 30', days: 30, discount_percent: 2, discount_days: 10 },
      { id: '4', name: 'Due on Receipt', days: 0 },
      { id: '5', name: 'Net 60', days: 60 }
    ];
    setPaymentTerms(terms);
  };

  // Invoice Management Functions
  const createInvoice = async (order: SalesOrder, type: 'ordered' | 'delivered' | 'time_materials') => {
    try {
      setIsLoading(true);
      
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`;
      const invoiceDate = new Date().toISOString().split('T')[0];
      const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      let invoiceItems: InvoiceItem[] = [];
      let subtotal = 0;

      if (type === 'ordered') {
        invoiceItems = order.items.map(item => ({
          id: `item-${Date.now()}`,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price,
          invoice_type: 'ordered',
          description: item.description
        }));
        subtotal = order.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
      } else if (type === 'delivered') {
        invoiceItems = order.items
          .filter(item => item.delivered_quantity > 0)
          .map(item => ({
            id: `item-${Date.now()}`,
            product_name: item.product_name,
            quantity: item.delivered_quantity,
            unit_price: item.unit_price,
            total_price: item.delivered_quantity * item.unit_price,
            invoice_type: 'delivered',
            description: item.description
          }));
        subtotal = order.items.reduce((sum, item) => sum + (item.delivered_quantity * item.unit_price), 0);
      } else if (type === 'time_materials') {
        // For service-based orders
        invoiceItems = order.items.map(item => ({
          id: `item-${Date.now()}`,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price,
          invoice_type: 'time_materials',
          description: item.description
        }));
        subtotal = order.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
      }

      const taxAmount = subtotal * 0.2; // 20% tax
      const totalAmount = subtotal + taxAmount;

      const newInvoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'> = {
        number: invoiceNumber,
        sales_order_id: order.id,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        invoice_date: invoiceDate,
        due_date: dueDate,
        status: 'draft',
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        paid_amount: 0,
        payment_terms: 'Net 30',
        items: invoiceItems,
        notes: `Invoice for ${order.number}`,
        aging_days: 0
      };

      const { data, error } = await supabase
        .from('invoices')
        .insert([newInvoice])
        .select()
        .single();

      if (error) throw error;

      showToast({ title: 'Invoice created successfully', type: 'success' });
      setShowInvoiceModal(false);
      loadInvoices();
    } catch (error) {
      console.error('Error creating invoice:', error);
      showToast({ title: 'Error creating invoice', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Kit Management Functions
  const createProductKit = (item: SalesOrderItem) => {
    setSelectedItemForKit(item);
    setShowKitBuilder(true);
  };

  const addKitItem = (kitItem: SalesOrderItem, newItem: { product_name: string; quantity: number; unit_price: number }) => {
    const updatedKitItems = [
      ...(kitItem.kit_items || []),
      {
        id: `kit-${Date.now()}`,
        product_name: newItem.product_name,
        quantity: newItem.quantity,
        unit_price: newItem.unit_price
      }
    ];

    const updatedItems = salesOrders
      .find(order => order.items.some(item => item.id === kitItem.id))
      ?.items.map(item => 
        item.id === kitItem.id 
          ? { ...item, kit_items: updatedKitItems, is_kit: true }
          : item
      );

    if (updatedItems) {
      // Update the sales order with kit items
      showToast({ title: 'Kit items added successfully', type: 'success' });
    }
  };

  // Invoice Aging Report
  const getInvoiceAgingReport = () => {
    const now = new Date();
    return invoices.map(invoice => {
      const dueDate = new Date(invoice.due_date);
      const agingDays = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      return {
        ...invoice,
        aging_days: agingDays
      };
    }).filter(invoice => invoice.status === 'sent' || invoice.status === 'overdue');
  };

  // Button Action Functions
  const handleExport = () => {
    setShowExportModal(true);
    showToast({ title: 'Export functionality', type: 'info' });
  };

  const handleCreateNewOrder = () => {
    navigate('/quotation-builder');
    showToast({ title: 'Redirecting to Quotation Builder', type: 'info' });
  };

  const handleViewOrder = (order: SalesOrder) => {
    setSelectedOrder(order);
    setShowOrderDetailModal(true);
  };

  const handleEditOrder = (order: SalesOrder) => {
    setSelectedOrder(order);
    setShowEditOrderModal(true);
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('sales_orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;

      showToast({ title: 'Order deleted successfully', type: 'success' });
      loadSalesOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      showToast({ title: 'Error deleting order', type: 'error' });
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterStatus = (status: string) => {
    setFilterStatus(status);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Update URL for routing
    navigate(`/sales-orders?tab=${tab}`);
  };

  const handleCreateInvoice = (order: SalesOrder) => {
    setSelectedOrderForInvoice(order);
    setShowInvoiceModal(true);
  };

  const handleSendInvoice = async (invoice: Invoice) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'sent' })
        .eq('id', invoice.id);

      if (error) throw error;

      showToast({ title: 'Invoice sent successfully', type: 'success' });
      loadInvoices();
    } catch (error) {
      console.error('Error sending invoice:', error);
      showToast({ title: 'Error sending invoice', type: 'error' });
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    // Navigate to invoice detail or open modal
    showToast({ title: `Viewing invoice ${invoice.number}`, type: 'info' });
  };

  // Filter and search functions
  const getFilteredOrders = () => {
    let filtered = salesOrders;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(order => order.status === filterStatus);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const getFilteredInvoices = () => {
    let filtered = invoices;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(invoice => 
        invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  // Email Gateway Functions
  const loadEmailCommunications = async (orderId: string) => {
    try {
      // Simulate loading email communications
      const sampleEmails: EmailCommunication[] = [
        {
          id: 'email-1',
          order_id: orderId,
          customer_email: 'orders@abccorp.com',
          subject: 'Order Confirmation - SO-2024-001',
          content: 'Thank you for your order. We have received your order and will begin processing immediately.',
          sent_at: '2024-08-01T10:30:00Z',
          email_type: 'order_confirmation',
          status: 'opened',
          attachments: ['order_confirmation.pdf']
        },
        {
          id: 'email-2',
          order_id: orderId,
          customer_email: 'orders@abccorp.com',
          subject: 'Invoice - INV-2024-001',
          content: 'Your invoice is ready for payment. Please review the attached invoice.',
          sent_at: '2024-08-02T14:15:00Z',
          email_type: 'invoice',
          status: 'delivered',
          attachments: ['invoice_2024_001.pdf']
        }
      ];
      setEmailCommunications(sampleEmails);
    } catch (error) {
      console.error('Error loading email communications:', error);
    }
  };

  const sendEmail = async (order: SalesOrder, emailType: EmailCommunication['email_type']) => {
    try {
      const newEmail: EmailCommunication = {
        id: `email-${Date.now()}`,
        order_id: order.id,
        customer_email: order.customer_email,
        subject: `${emailType.replace('_', ' ').toUpperCase()} - ${order.number}`,
        content: `This is a ${emailType} email for order ${order.number}`,
        sent_at: new Date().toISOString(),
        email_type: emailType,
        status: 'sent'
      };

      setEmailCommunications(prev => [...prev, newEmail]);
      showToast({ title: 'Email sent successfully', type: 'success' });
    } catch (error) {
      console.error('Error sending email:', error);
      showToast({ title: 'Error sending email', type: 'error' });
    }
  };

  // Inter-Company Rules Functions
  const loadCompanies = async () => {
    try {
      const sampleCompanies: Company[] = [
        {
          id: 'comp-1',
          name: 'SaleToru Global',
          email: 'global@saletoru.com',
          address: '123 Global St, International City',
          type: 'parent'
        },
        {
          id: 'comp-2',
          name: 'SaleToru Europe',
          email: 'europe@saletoru.com',
          address: '456 European Ave, Brussels',
          type: 'subsidiary',
          parent_company_id: 'comp-1'
        },
        {
          id: 'comp-3',
          name: 'SaleToru Asia',
          email: 'asia@saletoru.com',
          address: '789 Asian Blvd, Singapore',
          type: 'subsidiary',
          parent_company_id: 'comp-1'
        }
      ];
      setCompanies(sampleCompanies);
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  };

  const createInterCompanyOrder = async (sourceOrder: SalesOrder, targetCompany: Company) => {
    try {
      const interCompanyOrder: InterCompanyOrder = {
        id: `ico-${Date.now()}`,
        source_company_id: 'comp-1', // Current company
        target_company_id: targetCompany.id,
        source_order_id: sourceOrder.id,
        target_order_id: `target-${Date.now()}`,
        order_type: 'sales',
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setInterCompanyOrders(prev => [...prev, interCompanyOrder]);
      showToast({ title: 'Inter-company order created', type: 'success' });
    } catch (error) {
      console.error('Error creating inter-company order:', error);
      showToast({ title: 'Error creating inter-company order', type: 'error' });
    }
  };

  const handleViewEmailCommunications = (order: SalesOrder) => {
    setSelectedOrderForEmail(order);
    loadEmailCommunications(order.id);
    setShowEmailModal(true);
  };

  const handleCreateInterCompanyOrder = (order: SalesOrder) => {
    setSelectedOrderForEmail(order);
    loadCompanies();
    setShowInterCompanyModal(true);
  };

  const convertQuoteToOrder = async (quote: Quote) => {
    try {
      // Create sales order from quote
      const { data: orderData, error } = await supabase
        .from('sales_orders')
        .insert({
          number: `SO-${Date.now()}`,
          customer_name: quote.customer_name,
          order_date: new Date().toISOString().split('T')[0],
          status: 'draft',
          total_amount: quote.total_amount,
          tax_amount: quote.total_amount * 0.2, // 20% tax
          shipping_amount: 0,
          items: quote.items.map((item: any) => ({
            product_name: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total,
            delivered_quantity: 0,
            shipping_method: 'standard'
          })),
          related_quote_id: quote.id,
          signature_required: true,
          signature_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Update quote status
      await supabase
        .from('quotations')
        .update({ status: 'accepted' })
        .eq('id', quote.id);

      showToast({ title: 'Quote converted to sales order', type: 'success' });
      loadSalesOrders();
      loadQuotes();
    } catch (error) {
      showToast({ title: 'Error converting quote', type: 'error' });
    }
  };

  const updateOrderStatus = async (orderId: string, status: SalesOrder['status']) => {
    try {
      const { error } = await supabase
        .from('sales_orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      showToast({ title: 'Order status updated', type: 'success' });
      loadSalesOrders();
    } catch (error) {
      showToast({ title: 'Error updating order status', type: 'error' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'ready_for_delivery': return 'warning';
      case 'in_production': return 'primary';
      case 'confirmed': return 'secondary';
      case 'draft': return 'secondary';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  const getSignatureStatusColor = (status: string) => {
    switch (status) {
      case 'signed': return 'success';
      case 'pending': return 'warning';
      case 'not_required': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Sales Orders
          </h1>
          <p className="text-[#b0b0d0]">
            Manage sales orders, convert quotes, and track deliveries
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#b0b0d0]" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#23233a] border border-[#334155] rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:border-[#a259ff]"
              />
            </div>
            
            {/* View Chooser */}
            <div className="flex items-center bg-[#23233a] rounded-lg p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-[#a259ff] text-white'
                    : 'text-[#b0b0d0] hover:text-white'
                }`}
                title="Card View"
              >
                <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                  <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                </div>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'table'
                    ? 'bg-[#a259ff] text-white'
                    : 'text-[#b0b0d0] hover:text-white'
                }`}
                title="Table View"
              >
                <div className="w-4 h-4 grid grid-cols-3 gap-0.5">
                  <div className="w-1 h-1 bg-current rounded-sm"></div>
                  <div className="w-1 h-1 bg-current rounded-sm"></div>
                  <div className="w-1 h-1 bg-current rounded-sm"></div>
                  <div className="w-1 h-1 bg-current rounded-sm"></div>
                  <div className="w-1 h-1 bg-current rounded-sm"></div>
                  <div className="w-1 h-1 bg-current rounded-sm"></div>
                </div>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[#a259ff] text-white'
                    : 'text-[#b0b0d0] hover:text-white'
                }`}
                title="List View"
              >
                <div className="w-4 h-4 flex flex-col gap-0.5">
                  <div className="w-full h-0.5 bg-current rounded-sm"></div>
                  <div className="w-full h-0.5 bg-current rounded-sm"></div>
                  <div className="w-full h-0.5 bg-current rounded-sm"></div>
                </div>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[#a259ff] text-white'
                    : 'text-[#b0b0d0] hover:text-white'
                }`}
                title="Grid View"
              >
                <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                  <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                </div>
              </button>
            </div>
            
            <Button variant="secondary" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateNewOrder}>
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </Button>
          </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-[#23233a]/30 rounded-lg p-1">
        {[
          { id: 'orders', label: 'Orders', icon: ShoppingCart },
          { id: 'quotes', label: 'Quotes', icon: FileText },
          { id: 'invoices', label: 'Invoices', icon: DollarSign },
          { id: 'deliveries', label: 'Deliveries', icon: Truck },
          { id: 'analytics', label: 'Analytics', icon: DollarSign }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-[#a259ff] text-white'
                : 'text-[#b0b0d0] hover:text-white hover:bg-[#23233a]/50'
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Order Filters */}
          <div className="flex items-center space-x-4">
            <span className="text-[#b0b0d0]">Filter by:</span>
            <div className="flex space-x-2">
              {['all', 'draft', 'confirmed', 'in_production', 'ready_for_delivery', 'delivered'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleFilterStatus(status)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    filterStatus === status
                      ? 'bg-[#a259ff] text-white'
                      : 'bg-[#23233a]/50 text-[#b0b0d0] hover:text-white'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Display */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredOrders().map((order) => (
              <Card key={order.id} className="hover:bg-[#23233a]/50 transition-colors">
                <div className="relative">
                  {/* Order Preview */}
                  <div className="h-48 bg-gradient-to-br from-[#a259ff]/20 to-[#764ba2]/20 rounded-lg mb-4 flex items-center justify-center">
                    <div className="text-center">
                      <ShoppingCart className="w-12 h-12 text-[#a259ff] mx-auto mb-2" />
                      <h3 className="text-white font-medium">{order.number}</h3>
                      <div className="flex items-center justify-center space-x-2 mt-2">
                        <Badge variant={getStatusColor(order.status) as any} size="sm">
                          {order.status.replace('_', ' ')}
                        </Badge>
                        {order.signature_required && (
                          <Badge variant={getSignatureStatusColor(order.signature_status) as any} size="sm">
                            {order.signature_status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Info */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-medium">{order.customer_name}</h3>
                      <span className="text-white font-bold">${order.total_amount.toFixed(2)}</span>
                    </div>
                    
                    <p className="text-[#b0b0d0] text-sm">
                      {order.items.length} items • {new Date(order.order_date).toLocaleDateString()}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 pt-3 border-t border-[#23233a]/30">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="flex-1"
                        onClick={() => handleViewOrder(order)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="primary" 
                        className="flex-1"
                        onClick={() => handleEditOrder(order)}
                        disabled={order.status === 'delivered'}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                    
                    {/* Email & Inter-Company Actions */}
                    <div className="flex items-center space-x-2 pt-2">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="flex-1"
                        onClick={() => handleViewEmailCommunications(order)}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Emails
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="flex-1"
                        onClick={() => handleCreateInterCompanyOrder(order)}
                      >
                        <Building className="w-4 h-4 mr-2" />
                        Inter-Co
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          )}

          {viewMode === 'table' && (
            <div className="bg-[#23233a] rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#1a1a2e]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#b0b0d0] uppercase tracking-wider">Order</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#b0b0d0] uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#b0b0d0] uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#b0b0d0] uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#b0b0d0] uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#b0b0d0] uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#334155]">
                    {getFilteredOrders().map((order) => (
                      <tr key={order.id} className="hover:bg-[#1a1a2e]/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{order.number}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">{order.customer_name}</div>
                          <div className="text-sm text-[#b0b0d0]">{order.customer_email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getStatusColor(order.status) as any} size="sm">
                            {order.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          ${order.total_amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#b0b0d0]">
                          {new Date(order.order_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="secondary" onClick={() => handleViewOrder(order)}>
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="primary" onClick={() => handleEditOrder(order)}>
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => handleViewEmailCommunications(order)}>
                              <Mail className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {viewMode === 'list' && (
            <div className="space-y-3">
              {getFilteredOrders().map((order) => (
                <Card key={order.id} className="hover:bg-[#23233a]/50 transition-colors">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <ShoppingCart className="w-8 h-8 text-[#a259ff]" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{order.number}</h3>
                        <p className="text-[#b0b0d0] text-sm">{order.customer_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-white font-medium">${order.total_amount.toFixed(2)}</p>
                        <p className="text-[#b0b0d0] text-sm">{new Date(order.order_date).toLocaleDateString()}</p>
                      </div>
                      <Badge variant={getStatusColor(order.status) as any} size="sm">
                        {order.status.replace('_', ' ')}
                      </Badge>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="secondary" onClick={() => handleViewOrder(order)}>
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="primary" onClick={() => handleEditOrder(order)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => handleViewEmailCommunications(order)}>
                          <Mail className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {getFilteredOrders().map((order) => (
                <Card key={order.id} className="hover:bg-[#23233a]/50 transition-colors">
                  <div className="p-4">
                    <div className="text-center mb-3">
                      <ShoppingCart className="w-8 h-8 text-[#a259ff] mx-auto mb-2" />
                      <h3 className="text-white font-medium text-sm">{order.number}</h3>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-[#b0b0d0] text-xs">{order.customer_name}</p>
                      <p className="text-white font-bold text-sm">${order.total_amount.toFixed(2)}</p>
                      <Badge variant={getStatusColor(order.status) as any} size="sm">
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-center space-x-2 mt-3 pt-3 border-t border-[#334155]">
                      <Button size="sm" variant="secondary" onClick={() => handleViewOrder(order)}>
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="primary" onClick={() => handleEditOrder(order)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quotes Tab */}
      {activeTab === 'quotes' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Convert Quotes to Orders</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quotes.map((quote) => (
              <Card key={quote.id} className="hover:bg-[#23233a]/50 transition-colors">
                <div className="relative">
                  {/* Quote Preview */}
                  <div className="h-48 bg-gradient-to-br from-[#377dff]/20 to-[#764ba2]/20 rounded-lg mb-4 flex items-center justify-center">
                    <div className="text-center">
                      <FileText className="w-12 h-12 text-[#377dff] mx-auto mb-2" />
                      <h3 className="text-white font-medium">{quote.number}</h3>
                      <Badge variant={getSignatureStatusColor(quote.signature_status) as any} size="sm" className="mt-2">
                        {quote.signature_status}
                      </Badge>
                    </div>
                  </div>

                  {/* Quote Info */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-medium">{quote.customer_name}</h3>
                      <span className="text-white font-bold">${quote.total_amount.toFixed(2)}</span>
                    </div>
                    
                    <p className="text-[#b0b0d0] text-sm">
                      {quote.items.length} items • Valid until {new Date(quote.valid_until).toLocaleDateString()}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 pt-3 border-t border-[#23233a]/30">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedQuote(quote);
                          setShowQuoteModal(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="primary" 
                        className="flex-1"
                        onClick={() => convertQuoteToOrder(quote)}
                        disabled={quote.signature_status !== 'signed'}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Convert to Order
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Invoices</h2>
            <div className="flex items-center space-x-2">
              <Button variant="secondary" size="sm" onClick={() => setShowAgingModal(true)}>
                <DollarSign className="w-4 h-4 mr-2" />
                Aging Report
              </Button>
            </div>
          </div>

                      {/* Invoice Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredInvoices().length > 0 ? getFilteredInvoices().map((invoice) => (
                <Card key={invoice.id} className="hover:bg-[#23233a]/50 transition-colors">
                  <div className="relative">
                    <div className="h-48 bg-gradient-to-br from-[#10b981]/20 to-[#059669]/20 rounded-lg mb-4 flex items-center justify-center">
                      <div className="text-center">
                        <DollarSign className="w-12 h-12 text-[#10b981] mx-auto mb-2" />
                        <h3 className="text-white font-medium">{invoice.number}</h3>
                        <div className="flex items-center justify-center space-x-2 mt-2">
                          <Badge variant={invoice.status === 'paid' ? 'success' : invoice.status === 'overdue' ? 'danger' : 'secondary'} size="sm">
                            {invoice.status}
                          </Badge>
                          {invoice.aging_days > 0 && (
                            <Badge variant="warning" size="sm">
                              {invoice.aging_days} days
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-medium">{invoice.customer_name}</h3>
                        <span className="text-white font-bold">${(invoice.total_amount || 0).toFixed(2)}</span>
                      </div>
                      
                      <p className="text-[#b0b0d0] text-sm">
                        Due: {new Date(invoice.due_date).toLocaleDateString()}
                      </p>

                                          <div className="flex items-center space-x-2 pt-3 border-t border-[#23233a]/30">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="flex-1"
                        onClick={() => handleViewInvoice(invoice)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => handleSendInvoice(invoice)}
                        disabled={invoice.status === 'sent' || invoice.status === 'paid'}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                    </div>
                  </div>
                </Card>
              )) : (
                <div className="col-span-full text-center py-8">
                  <DollarSign className="w-12 h-12 text-[#b0b0d0] mx-auto mb-4" />
                  <p className="text-[#b0b0d0]">No invoices found</p>
                </div>
              )}
            </div>
        </div>
      )}

      {/* Deliveries Tab */}
      {activeTab === 'deliveries' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Delivery Management</h2>
          <Card>
            <div className="p-6">
              <p className="text-[#b0b0d0]">Delivery tracking and management will be implemented here.</p>
            </div>
          </Card>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Sales Analytics</h2>
          <Card>
            <div className="p-6">
              <p className="text-[#b0b0d0]">Sales analytics and reporting will be implemented here.</p>
            </div>
          </Card>
        </div>
      )}

      {/* Quote Modal */}
      {showQuoteModal && selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#1a1a2e] p-6 rounded-lg max-w-2xl w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Quote Details: {selectedQuote.number}</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#b0b0d0] text-sm mb-2">Customer</label>
                  <p className="text-white">{selectedQuote.customer_name}</p>
                </div>
                <div>
                  <label className="block text-[#b0b0d0] text-sm mb-2">Total Amount</label>
                  <p className="text-white font-bold">${(selectedQuote.total_amount || 0).toFixed(2)}</p>
                </div>
                <div>
                  <label className="block text-[#b0b0d0] text-sm mb-2">Status</label>
                  <Badge variant={getSignatureStatusColor(selectedQuote.signature_status) as any}>
                    {selectedQuote.signature_status}
                  </Badge>
                </div>
                <div>
                  <label className="block text-[#b0b0d0] text-sm mb-2">Valid Until</label>
                  <p className="text-white">{new Date(selectedQuote.valid_until).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <label className="block text-[#b0b0d0] text-sm mb-2">Items</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedQuote.items.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-[#23233a]/30 rounded">
                      <div>
                        <span className="text-white text-sm">{item.description}</span>
                        <span className="text-[#b0b0d0] text-xs ml-2">Qty: {item.quantity}</span>
                      </div>
                      <span className="text-white font-medium">${(item.total || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <Button variant="secondary" onClick={() => setShowQuoteModal(false)}>
                Close
              </Button>
              <Button 
                variant="primary" 
                onClick={() => {
                  convertQuoteToOrder(selectedQuote);
                  setShowQuoteModal(false);
                }}
                disabled={selectedQuote.signature_status !== 'signed'}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Convert to Order
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && selectedOrderForInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#1a1a2e] p-6 rounded-lg max-w-2xl w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Create Invoice for {selectedOrderForInvoice.number}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[#b0b0d0] text-sm mb-2">Invoice Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setInvoiceType('ordered')}
                    className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                      invoiceType === 'ordered'
                        ? 'bg-[#0ea5e9] text-white'
                        : 'bg-[#23233a] text-[#b0b0d0] hover:text-white'
                    }`}
                  >
                    Ordered Quantity
                  </button>
                  <button
                    onClick={() => setInvoiceType('delivered')}
                    className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                      invoiceType === 'delivered'
                        ? 'bg-[#0ea5e9] text-white'
                        : 'bg-[#23233a] text-[#b0b0d0] hover:text-white'
                    }`}
                  >
                    Delivered Quantity
                  </button>
                  <button
                    onClick={() => setInvoiceType('time_materials')}
                    className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                      invoiceType === 'time_materials'
                        ? 'bg-[#0ea5e9] text-white'
                        : 'bg-[#23233a] text-[#b0b0d0] hover:text-white'
                    }`}
                  >
                    Time & Materials
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <Button 
                  variant="primary" 
                  onClick={() => createInvoice(selectedOrderForInvoice, invoiceType)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create Invoice'}
                </Button>
                <Button variant="secondary" onClick={() => setShowInvoiceModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kit Builder Modal */}
      {showKitBuilder && selectedItemForKit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#1a1a2e] p-6 rounded-lg max-w-2xl w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Build Product Kit: {selectedItemForKit.product_name}</h3>
            
            <div className="space-y-4">
              <div className="bg-[#23233a] rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Kit Components</h4>
                {selectedItemForKit.kit_items?.map((kitItem) => (
                  <div key={kitItem.id} className="flex items-center justify-between py-2 border-b border-[#334155]">
                    <span className="text-white">{kitItem.product_name}</span>
                    <span className="text-[#b0b0d0]">Qty: {kitItem.quantity} × ${kitItem.unit_price}</span>
                  </div>
                )) || (
                  <p className="text-[#b0b0d0] text-sm">No kit components added yet.</p>
                )}
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <Button variant="primary" onClick={() => setShowKitBuilder(false)}>
                  Done
                </Button>
                <Button variant="secondary" onClick={() => setShowKitBuilder(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#1a1a2e] p-6 rounded-lg max-w-2xl w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Export Data</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 bg-[#23233a] rounded-lg hover:bg-[#334155] transition-colors">
                  <Download className="w-8 h-8 text-[#a259ff] mx-auto mb-2" />
                  <span className="text-white font-medium">Export Orders</span>
                  <span className="text-[#b0b0d0] text-sm">CSV Format</span>
                </button>
                <button className="p-4 bg-[#23233a] rounded-lg hover:bg-[#334155] transition-colors">
                  <Download className="w-8 h-8 text-[#10b981] mx-auto mb-2" />
                  <span className="text-white font-medium">Export Invoices</span>
                  <span className="text-[#b0b0d0] text-sm">PDF Format</span>
                </button>
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <Button variant="primary" onClick={() => setShowExportModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {showOrderDetailModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#1a1a2e] p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Order Details: {selectedOrder.number}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[#b0b0d0] text-sm mb-2">Customer Information</label>
                  <div className="bg-[#23233a] rounded-lg p-4">
                    <p className="text-white font-medium">{selectedOrder.customer_name}</p>
                    <p className="text-[#b0b0d0] text-sm">{selectedOrder.customer_email}</p>
                    <p className="text-[#b0b0d0] text-sm">{selectedOrder.customer_address}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-[#b0b0d0] text-sm mb-2">Order Information</label>
                  <div className="bg-[#23233a] rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[#b0b0d0] text-sm">Order Date</p>
                        <p className="text-white">{new Date(selectedOrder.order_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-[#b0b0d0] text-sm">Delivery Date</p>
                        <p className="text-white">{selectedOrder.delivery_date ? new Date(selectedOrder.delivery_date).toLocaleDateString() : 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-[#b0b0d0] text-sm">Status</p>
                        <Badge variant={getStatusColor(selectedOrder.status) as any}>
                          {selectedOrder.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-[#b0b0d0] text-sm">Total Amount</p>
                        <p className="text-white font-bold">${selectedOrder.total_amount.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[#b0b0d0] text-sm mb-2">Order Items</label>
                  <div className="bg-[#23233a] rounded-lg p-4">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2 border-b border-[#334155] last:border-b-0">
                        <div>
                          <p className="text-white font-medium">{item.product_name}</p>
                          <p className="text-[#b0b0d0] text-sm">{item.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white">Qty: {item.quantity}</p>
                          <p className="text-[#b0b0d0] text-sm">${item.unit_price.toFixed(2)} each</p>
                          <p className="text-white font-bold">${item.total_price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[#b0b0d0] text-sm mb-2">Notes</label>
                  <div className="bg-[#23233a] rounded-lg p-4">
                    <p className="text-white">{selectedOrder.notes || 'No notes available'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-4">
              <Button variant="primary" onClick={() => setShowOrderDetailModal(false)}>
                Close
              </Button>
              <Button variant="secondary" onClick={() => handleEditOrder(selectedOrder)}>
                Edit Order
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {showEditOrderModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#1a1a2e] p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Edit Order: {selectedOrder.number}</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#b0b0d0] text-sm mb-2">Order Status</label>
                  <select 
                    className="w-full bg-[#23233a] border border-[#334155] rounded-lg px-3 py-2 text-white"
                    value={selectedOrder.status}
                    onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value as SalesOrder['status'])}
                  >
                    <option value="draft">Draft</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in_production">In Production</option>
                    <option value="ready_for_delivery">Ready for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#b0b0d0] text-sm mb-2">Delivery Date</label>
                  <input 
                    type="date"
                    className="w-full bg-[#23233a] border border-[#334155] rounded-lg px-3 py-2 text-white"
                    value={selectedOrder.delivery_date || ''}
                    onChange={(e) => {
                      // Update delivery date logic here
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <Button variant="primary" onClick={() => setShowEditOrderModal(false)}>
                  Save Changes
                </Button>
                <Button variant="secondary" onClick={() => setShowEditOrderModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Aging Report Modal */}
      {showAgingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#1a1a2e] p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Invoice Aging Report</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-[#23233a] rounded-lg p-4">
                  <h4 className="text-white font-medium">Current</h4>
                  <p className="text-2xl font-bold text-[#10b981]">
                    ${getInvoiceAgingReport().filter(inv => inv.aging_days <= 30).reduce((sum, inv) => sum + (inv.total_amount || 0), 0).toFixed(2)}
                  </p>
                  <p className="text-[#b0b0d0] text-sm">0-30 days</p>
                </div>
                <div className="bg-[#23233a] rounded-lg p-4">
                  <h4 className="text-white font-medium">31-60 Days</h4>
                  <p className="text-2xl font-bold text-[#f59e0b]">
                    ${getInvoiceAgingReport().filter(inv => inv.aging_days > 30 && inv.aging_days <= 60).reduce((sum, inv) => sum + (inv.total_amount || 0), 0).toFixed(2)}
                  </p>
                  <p className="text-[#b0b0d0] text-sm">31-60 days</p>
                </div>
                <div className="bg-[#23233a] rounded-lg p-4">
                  <h4 className="text-white font-medium">61-90 Days</h4>
                  <p className="text-2xl font-bold text-[#ef4444]">
                    ${getInvoiceAgingReport().filter(inv => inv.aging_days > 60 && inv.aging_days <= 90).reduce((sum, inv) => sum + (inv.total_amount || 0), 0).toFixed(2)}
                  </p>
                  <p className="text-[#b0b0d0] text-sm">61-90 days</p>
                </div>
                <div className="bg-[#23233a] rounded-lg p-4">
                  <h4 className="text-white font-medium">Over 90 Days</h4>
                  <p className="text-2xl font-bold text-[#dc2626]">
                    ${getInvoiceAgingReport().filter(inv => inv.aging_days > 90).reduce((sum, inv) => sum + (inv.total_amount || 0), 0).toFixed(2)}
                  </p>
                  <p className="text-[#b0b0d0] text-sm">90+ days</p>
                </div>
              </div>

              <div className="bg-[#23233a] rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#334155]">
                    <tr>
                      <th className="text-left p-3 text-white">Invoice</th>
                      <th className="text-left p-3 text-white">Customer</th>
                      <th className="text-left p-3 text-white">Amount</th>
                      <th className="text-left p-3 text-white">Due Date</th>
                      <th className="text-left p-3 text-white">Aging</th>
                      <th className="text-left p-3 text-white">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getInvoiceAgingReport().map((invoice) => (
                      <tr key={invoice.id} className="border-b border-[#334155]">
                        <td className="p-3 text-white">{invoice.number}</td>
                        <td className="p-3 text-[#b0b0d0]">{invoice.customer_name}</td>
                        <td className="p-3 text-white">${(invoice.total_amount || 0).toFixed(2)}</td>
                        <td className="p-3 text-[#b0b0d0]">{new Date(invoice.due_date).toLocaleDateString()}</td>
                        <td className="p-3">
                          <Badge 
                            variant={
                              invoice.aging_days <= 30 ? 'success' : 
                              invoice.aging_days <= 60 ? 'warning' : 'danger'
                            }
                          >
                            {invoice.aging_days} days
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant={invoice.status === 'paid' ? 'success' : 'secondary'}>
                            {invoice.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-4">
                <Button variant="secondary" onClick={() => setShowAgingModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Communications Modal */}
      {showEmailModal && selectedOrderForEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#1a1a2e] p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Email Communications - {selectedOrderForEmail.number}</h3>
            
            <div className="space-y-4">
              {/* Email Actions */}
              <div className="flex items-center space-x-2 mb-4">
                <Button 
                  size="sm" 
                  variant="primary"
                  onClick={() => sendEmail(selectedOrderForEmail, 'order_confirmation')}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Order Confirmation
                </Button>
                <Button 
                  size="sm" 
                  variant="primary"
                  onClick={() => sendEmail(selectedOrderForEmail, 'invoice')}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Invoice
                </Button>
                <Button 
                  size="sm" 
                  variant="primary"
                  onClick={() => sendEmail(selectedOrderForEmail, 'delivery_update')}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Delivery Update
                </Button>
                <Button 
                  size="sm" 
                  variant="primary"
                  onClick={() => sendEmail(selectedOrderForEmail, 'payment_reminder')}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Payment Reminder
                </Button>
              </div>

              {/* Email History */}
              <div className="bg-[#23233a] rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Email History</h4>
                {emailCommunications.length > 0 ? (
                  <div className="space-y-3">
                    {emailCommunications.map((email) => (
                      <div key={email.id} className="border border-[#334155] rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">{email.subject}</span>
                          <Badge variant={email.status === 'opened' ? 'success' : email.status === 'delivered' ? 'primary' : 'secondary'} size="sm">
                            {email.status}
                          </Badge>
                        </div>
                        <p className="text-[#b0b0d0] text-sm mb-2">{email.content}</p>
                        <div className="flex items-center justify-between text-xs text-[#b0b0d0]">
                          <span>To: {email.customer_email}</span>
                          <span>{new Date(email.sent_at).toLocaleString()}</span>
                        </div>
                        {email.attachments && email.attachments.length > 0 && (
                          <div className="mt-2">
                            <span className="text-[#b0b0d0] text-xs">Attachments: {email.attachments.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#b0b0d0] text-sm">No email communications found.</p>
                )}
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <Button variant="primary" onClick={() => setShowEmailModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inter-Company Order Modal */}
      {showInterCompanyModal && selectedOrderForEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#1a1a2e] p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Create Inter-Company Order - {selectedOrderForEmail.number}</h3>
            
            <div className="space-y-4">
              <div className="bg-[#23233a] rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Available Companies</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {companies.map((company) => (
                    <div key={company.id} className="border border-[#334155] rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{company.name}</span>
                        <Badge variant={company.type === 'parent' ? 'primary' : 'secondary'} size="sm">
                          {company.type}
                        </Badge>
                      </div>
                      <p className="text-[#b0b0d0] text-sm mb-2">{company.email}</p>
                      <p className="text-[#b0b0d0] text-sm mb-3">{company.address}</p>
                      <Button 
                        size="sm" 
                        variant="primary"
                        onClick={() => createInterCompanyOrder(selectedOrderForEmail, company)}
                      >
                        <Building className="w-4 h-4 mr-2" />
                        Create Order
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inter-Company Orders History */}
              <div className="bg-[#23233a] rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Inter-Company Orders</h4>
                {interCompanyOrders.length > 0 ? (
                  <div className="space-y-3">
                    {interCompanyOrders.map((ico) => (
                      <div key={ico.id} className="border border-[#334155] rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">ICO-{ico.id}</span>
                          <Badge variant={ico.status === 'confirmed' ? 'success' : ico.status === 'in_production' ? 'primary' : 'secondary'} size="sm">
                            {ico.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-[#b0b0d0] text-sm">Type: {ico.order_type}</p>
                        <p className="text-[#b0b0d0] text-sm">Created: {new Date(ico.created_at).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#b0b0d0] text-sm">No inter-company orders found.</p>
                )}
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <Button variant="primary" onClick={() => setShowInterCompanyModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesOrderModule; 