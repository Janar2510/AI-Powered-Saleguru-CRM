import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  BarChart3,
  Calculator,
  Receipt,
  CreditCard,
  Banknote,
  Settings,
  RefreshCw,
  Zap,
  Brain,
  Bot,
  Sparkles,
  List
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useToastContext } from '../../contexts/ToastContext';
import { usePermissions } from '../../contexts/PermissionContext';
import { supabase } from '../../services/supabase';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';

interface Invoice {
  id: string;
  number: string;
  customer_name: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  created_at: string;
  items?: InvoiceItem[];
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface Quotation {
  id: string;
  number: string;
  customer_name: string;
  amount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  valid_until: string;
  created_at: string;
  items?: QuotationItem[];
  notes?: string;
  terms_conditions?: string;
}

interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface Order {
  id: string;
  number: string;
  quotation_id?: string;
  quotation_number?: string;
  customer_name: string;
  amount: number;
  status: 'draft' | 'confirmed' | 'in_production' | 'ready_for_delivery' | 'delivered' | 'cancelled';
  delivery_date: string;
  created_at: string;
  items?: OrderItem[];
  notes?: string;
  delivery_address?: string;
}

interface OrderItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface ProformaInvoice {
  id: string;
  number: string;
  order_id?: string;
  order_number?: string;
  quotation_id?: string;
  quotation_number?: string;
  customer_name: string;
  amount: number;
  status: 'draft' | 'sent' | 'accepted' | 'converted_to_invoice' | 'cancelled';
  valid_until: string;
  created_at: string;
  items?: ProformaItem[];
  notes?: string;
  payment_terms?: string;
}

interface ProformaItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface AccountingRule {
  id: string;
  name: string;
  type: 'automation' | 'alert' | 'calculation';
  description: string;
  is_active: boolean;
  created_at: string;
}

const AIAccountingModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [proformaInvoices, setProformaInvoices] = useState<ProformaInvoice[]>([]);
  const [rules, setRules] = useState<AccountingRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [showNewQuotation, setShowNewQuotation] = useState(false);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [showNewProforma, setShowNewProforma] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCustomer, setFilterCustomer] = useState<string>('all');
  const [filterAmount, setFilterAmount] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'list'>('cards');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{ type: 'invoice' | 'quotation' | 'order' | 'proforma'; item: any } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToastContext();
  const { canDelete, canEdit, canCreate } = usePermissions();

  // Form states
  const [newInvoice, setNewInvoice] = useState({
    customer_name: '',
    due_date: '',
    items: [{ description: '', quantity: 1, unit_price: 0, total: 0 }]
  });

  const [newQuotation, setNewQuotation] = useState({
    customer_name: '',
    valid_until: '',
    notes: '',
    terms_conditions: '',
    items: [{ description: '', quantity: 1, unit_price: 0, total: 0 }]
  });

  const [newOrder, setNewOrder] = useState({
    quotation_id: '',
    quotation_number: '',
    customer_name: '',
    delivery_date: '',
    notes: '',
    delivery_address: '',
    items: [{ description: '', quantity: 1, unit_price: 0, total: 0 }]
  });

  const [newProforma, setNewProforma] = useState({
    order_id: '',
    order_number: '',
    quotation_id: '',
    quotation_number: '',
    customer_name: '',
    valid_until: '',
    notes: '',
    payment_terms: '',
    items: [{ description: '', quantity: 1, unit_price: 0, total: 0 }]
  });

  const [aiAnalysis, setAiAnalysis] = useState({
    analysis_type: 'cash_flow',
    period: '30_days',
    insights: ''
  });

  useEffect(() => {
    loadAccountingData();
  }, []);

  const loadAccountingData = async () => {
    setIsLoading(true);
    try {
      // Load invoices
      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (invoicesData) {
        setInvoices(invoicesData);
      }

      // Load quotations
      const { data: quotationsData } = await supabase
        .from('quotations')
        .select('*')
        .order('created_at', { ascending: false });

      if (quotationsData) {
        setQuotations(quotationsData);
      }

      // Load orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersData) {
        setOrders(ordersData);
      }

      // Load proforma invoices
      const { data: proformaData } = await supabase
        .from('proforma_invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (proformaData) {
        setProformaInvoices(proformaData);
      }

      // Load automation rules
      const { data: rulesData } = await supabase
        .from('accounting_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (rulesData) {
        setRules(rulesData);
      }
    } catch (error) {
      showToast({ title: 'Error loading accounting data', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const createInvoice = async () => {
    try {
      // Calculate total
      const total = newInvoice.items.reduce((sum, item) => sum + item.total, 0);
      
      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}`;
      
      const { data, error } = await supabase
        .from('invoices')
        .insert([{
          number: invoiceNumber,
          customer_name: newInvoice.customer_name,
          amount: total,
          status: 'draft',
          due_date: newInvoice.due_date,
          items: newInvoice.items
        }])
        .select()
        .single();

      if (error) throw error;

      setInvoices(prev => [data, ...prev]);
      setShowNewInvoice(false);
      setNewInvoice({
        customer_name: '',
        due_date: '',
        items: [{ description: '', quantity: 1, unit_price: 0, total: 0 }]
      });
      showToast({ title: 'Invoice created successfully', type: 'success' });
    } catch (error) {
      showToast({ title: 'Error creating invoice', type: 'error' });
    }
  };

  const createQuotation = async () => {
    try {
      // Calculate total
      const total = newQuotation.items.reduce((sum, item) => sum + item.total, 0);
      
      // Generate quotation number
      const quotationNumber = `QT-${Date.now()}`;
      
      const { data, error } = await supabase
        .from('quotations')
        .insert([{
          number: quotationNumber,
          customer_name: newQuotation.customer_name,
          amount: total,
          status: 'draft',
          valid_until: newQuotation.valid_until,
          notes: newQuotation.notes,
          terms_conditions: newQuotation.terms_conditions,
          items: newQuotation.items
        }])
        .select()
        .single();

      if (error) throw error;

      setQuotations(prev => [data, ...prev]);
      setShowNewQuotation(false);
      setNewQuotation({
        customer_name: '',
        valid_until: '',
        notes: '',
        terms_conditions: '',
        items: [{ description: '', quantity: 1, unit_price: 0, total: 0 }]
      });
      showToast({ title: 'Quotation created successfully', type: 'success' });
    } catch (error) {
      showToast({ title: 'Error creating quotation', type: 'error' });
    }
  };

  const createOrder = async () => {
    try {
      // Calculate total
      const total = newOrder.items.reduce((sum, item) => sum + item.total, 0);
      
      // Generate order number
      const orderNumber = `ORD-${Date.now()}`;
      
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          number: orderNumber,
          quotation_id: newOrder.quotation_id,
          quotation_number: newOrder.quotation_number,
          customer_name: newOrder.customer_name,
          amount: total,
          status: 'draft',
          delivery_date: newOrder.delivery_date,
          notes: newOrder.notes,
          delivery_address: newOrder.delivery_address,
          items: newOrder.items
        }])
        .select()
        .single();

      if (error) throw error;

      setOrders(prev => [data, ...prev]);
      setShowNewOrder(false);
      setNewOrder({
        quotation_id: '',
        quotation_number: '',
        customer_name: '',
        delivery_date: '',
        notes: '',
        delivery_address: '',
        items: [{ description: '', quantity: 1, unit_price: 0, total: 0 }]
      });
      showToast({ title: 'Order created successfully', type: 'success' });
    } catch (error) {
      showToast({ title: 'Error creating order', type: 'error' });
    }
  };

  const createProforma = async () => {
    try {
      // Calculate total
      const total = newProforma.items.reduce((sum, item) => sum + item.total, 0);
      
      // Generate proforma number
      const proformaNumber = `PRO-${Date.now()}`;
      
      const { data, error } = await supabase
        .from('proforma_invoices')
        .insert([{
          number: proformaNumber,
          order_id: newProforma.order_id,
          order_number: newProforma.order_number,
          quotation_id: newProforma.quotation_id,
          quotation_number: newProforma.quotation_number,
          customer_name: newProforma.customer_name,
          amount: total,
          status: 'draft',
          valid_until: newProforma.valid_until,
          notes: newProforma.notes,
          payment_terms: newProforma.payment_terms,
          items: newProforma.items
        }])
        .select()
        .single();

      if (error) throw error;

      setProformaInvoices(prev => [data, ...prev]);
      setShowNewProforma(false);
      setNewProforma({
        order_id: '',
        order_number: '',
        quotation_id: '',
        quotation_number: '',
        customer_name: '',
        valid_until: '',
        notes: '',
        payment_terms: '',
        items: [{ description: '', quantity: 1, unit_price: 0, total: 0 }]
      });
      showToast({ title: 'Proforma invoice created successfully', type: 'success' });
    } catch (error) {
      showToast({ title: 'Error creating proforma invoice', type: 'error' });
    }
  };

  const runAIAnalysis = async () => {
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const insights = {
        cash_flow: 'Cash flow is healthy with 15% increase in receivables. Consider early payment discounts.',
        profitability: 'Gross margin improved by 8% this quarter. Focus on high-margin products.',
        expenses: 'Operating expenses are 12% below budget. Opportunity to invest in growth.',
        receivables: 'Average collection period is 28 days, which is optimal for your industry.'
      };

      setAiAnalysis(prev => ({
        ...prev,
        insights: insights[aiAnalysis.analysis_type as keyof typeof insights] || 'Analysis completed successfully.'
      }));

      showToast({ title: 'AI analysis completed', type: 'success' });
    } catch (error) {
      showToast({ title: 'Error running AI analysis', type: 'error' });
    }
  };

  const updateItemTotal = (index: number) => {
    const updatedItems = [...newInvoice.items];
    updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unit_price;
    setNewInvoice({ ...newInvoice, items: updatedItems });
  };

  const addItem = () => {
    setNewInvoice({
      ...newInvoice,
      items: [...newInvoice.items, { description: '', quantity: 1, unit_price: 0, total: 0 }]
    });
  };

  const removeItem = (index: number) => {
    const updatedItems = newInvoice.items.filter((_, i) => i !== index);
    setNewInvoice({ ...newInvoice, items: updatedItems });
  };

  // Quotation helper functions
  const updateQuotationItemTotal = (index: number) => {
    const updatedItems = [...newQuotation.items];
    updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unit_price;
    setNewQuotation({ ...newQuotation, items: updatedItems });
  };

  const addQuotationItem = () => {
    setNewQuotation({
      ...newQuotation,
      items: [...newQuotation.items, { description: '', quantity: 1, unit_price: 0, total: 0 }]
    });
  };

  const removeQuotationItem = (index: number) => {
    const updatedItems = newQuotation.items.filter((_, i) => i !== index);
    setNewQuotation({ ...newQuotation, items: updatedItems });
  };

  // Order helper functions
  const updateOrderItemTotal = (index: number) => {
    const updatedItems = [...newOrder.items];
    updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unit_price;
    setNewOrder({ ...newOrder, items: updatedItems });
  };

  const addOrderItem = () => {
    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, { description: '', quantity: 1, unit_price: 0, total: 0 }]
    });
  };

  const removeOrderItem = (index: number) => {
    const updatedItems = newOrder.items.filter((_, i) => i !== index);
    setNewOrder({ ...newOrder, items: updatedItems });
  };

  // Proforma helper functions
  const updateProformaItemTotal = (index: number) => {
    const updatedItems = [...newProforma.items];
    updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unit_price;
    setNewProforma({ ...newProforma, items: updatedItems });
  };

  const addProformaItem = () => {
    setNewProforma({
      ...newProforma,
      items: [...newProforma.items, { description: '', quantity: 1, unit_price: 0, total: 0 }]
    });
  };

  const removeProformaItem = (index: number) => {
    const updatedItems = newProforma.items.filter((_, i) => i !== index);
    setNewProforma({ ...newProforma, items: updatedItems });
  };

  // Delete functions
  const handleDeleteInvoice = (invoice: Invoice) => {
    setDeleteItem({ type: 'invoice', item: invoice });
    setShowDeleteModal(true);
  };

  const handleDeleteQuotation = (quotation: Quotation) => {
    setDeleteItem({ type: 'quotation', item: quotation });
    setShowDeleteModal(true);
  };

  const handleDeleteOrder = (order: Order) => {
    setDeleteItem({ type: 'order', item: order });
    setShowDeleteModal(true);
  };

  const handleDeleteProforma = (proforma: ProformaInvoice) => {
    setDeleteItem({ type: 'proforma', item: proforma });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;

    setIsDeleting(true);
    try {
      if (deleteItem.type === 'invoice') {
        const { error } = await supabase
          .from('invoices')
          .delete()
          .eq('id', deleteItem.item.id);

        if (error) throw error;

        setInvoices(prev => prev.filter(i => i.id !== deleteItem.item.id));
        showToast({ title: 'Invoice deleted successfully', type: 'success' });
      } else if (deleteItem.type === 'quotation') {
        const { error } = await supabase
          .from('quotations')
          .delete()
          .eq('id', deleteItem.item.id);

        if (error) throw error;

        setQuotations(prev => prev.filter(q => q.id !== deleteItem.item.id));
        showToast({ title: 'Quotation deleted successfully', type: 'success' });
      } else if (deleteItem.type === 'order') {
        const { error } = await supabase
          .from('orders')
          .delete()
          .eq('id', deleteItem.item.id);

        if (error) throw error;

        setOrders(prev => prev.filter(o => o.id !== deleteItem.item.id));
        showToast({ title: 'Order deleted successfully', type: 'success' });
      } else if (deleteItem.type === 'proforma') {
        const { error } = await supabase
          .from('proforma_invoices')
          .delete()
          .eq('id', deleteItem.item.id);

        if (error) throw error;

        setProformaInvoices(prev => prev.filter(p => p.id !== deleteItem.item.id));
        showToast({ title: 'Proforma invoice deleted successfully', type: 'success' });
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      showToast({ title: 'Error deleting item', type: 'error' });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeleteItem(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'sent': return 'warning';
      case 'draft': return 'secondary';
      case 'overdue': return 'danger';
      case 'cancelled': return 'secondary';
      default: return 'secondary';
    }
  };

  const getRuleTypeColor = (type: string) => {
    switch (type) {
      case 'automation': return 'primary';
      case 'alert': return 'warning';
      case 'calculation': return 'success';
      default: return 'secondary';
    }
  };

  // Filter and sort functions
  const filterAndSortDocuments = <T extends { customer_name: string; number: string; amount: number; status: string; created_at: string }>(
    documents: T[],
    searchTerm: string,
    filterStatus: string,
    filterCustomer: string,
    filterAmount: string,
    sortBy: string,
    sortOrder: 'asc' | 'desc'
  ) => {
    let filtered = documents.filter(doc => {
      const matchesSearch = doc.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.number.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
      const matchesCustomer = filterCustomer === 'all' || doc.customer_name === filterCustomer;
      
      let matchesAmount = true;
      if (filterAmount !== 'all') {
        const amount = doc.amount;
        switch (filterAmount) {
          case '0-1000':
            matchesAmount = amount >= 0 && amount <= 1000;
            break;
          case '1000-5000':
            matchesAmount = amount > 1000 && amount <= 5000;
            break;
          case '5000-10000':
            matchesAmount = amount > 5000 && amount <= 10000;
            break;
          case '10000+':
            matchesAmount = amount > 10000;
            break;
        }
      }
      
      return matchesSearch && matchesStatus && matchesCustomer && matchesAmount;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof T];
      let bValue: any = b[sortBy as keyof T];
      
      if (sortBy === 'created_at' || sortBy === 'due_date' || sortBy === 'valid_until' || sortBy === 'delivery_date') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const filteredInvoices = filterAndSortDocuments(
    invoices, searchTerm, filterStatus, filterCustomer, filterAmount, sortBy, sortOrder
  );

  const filteredQuotations = filterAndSortDocuments(
    quotations, searchTerm, filterStatus, filterCustomer, filterAmount, sortBy, sortOrder
  );

  const filteredOrders = filterAndSortDocuments(
    orders, searchTerm, filterStatus, filterCustomer, filterAmount, sortBy, sortOrder
  );

  const filteredProformaInvoices = filterAndSortDocuments(
    proformaInvoices, searchTerm, filterStatus, filterCustomer, filterAmount, sortBy, sortOrder
  );

  // Get unique customers for filter dropdowns
  const getUniqueCustomers = (documents: any[]) => {
    const customers = [...new Set(documents.map(doc => doc.customer_name))];
    return customers.sort();
  };

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const outstandingAmount = invoices.filter(i => ['sent', 'overdue'].includes(i.status)).reduce((sum, i) => sum + i.amount, 0);
  const overdueInvoices = invoices.filter(i => i.status === 'overdue').length;

  // View Components
  const renderDocumentCards = (documents: any[], documentType: string) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {documents.map((doc) => (
        <Card key={doc.id} className="hover:bg-[#23233a]/50 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 ${
                documentType === 'quotation' ? 'bg-[#377dff]/20' :
                documentType === 'order' ? 'bg-[#43e7ad]/20' :
                documentType === 'proforma' ? 'bg-[#ff6b6b]/20' :
                'bg-[#a259ff]/20'
              } rounded-lg`}>
                {documentType === 'quotation' ? <FileText className="w-5 h-5 text-[#377dff]" /> :
                 documentType === 'order' ? <Receipt className="w-5 h-5 text-[#43e7ad]" /> :
                 documentType === 'proforma' ? <CreditCard className="w-5 h-5 text-[#ff6b6b]" /> :
                 <Banknote className="w-5 h-5 text-[#a259ff]" />}
              </div>
              <div>
                <h3 className="text-white font-medium">{doc.number}</h3>
                <p className="text-[#b0b0d0] text-sm">{doc.customer_name}</p>
                {doc.quotation_number && (
                  <p className="text-[#b0b0d0] text-xs">From: {doc.quotation_number}</p>
                )}
                {doc.order_number && (
                  <p className="text-[#b0b0d0] text-xs">From: {doc.order_number}</p>
                )}
              </div>
            </div>
            <Badge variant={getStatusColor(doc.status)} size="sm">
              {doc.status.replace('_', ' ')}
            </Badge>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-[#b0b0d0] text-sm">Amount</span>
              <span className="text-white font-medium">${doc.amount.toFixed(2)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-[#b0b0d0] text-sm">
                {documentType === 'quotation' || documentType === 'proforma' ? 'Valid Until' :
                 documentType === 'order' ? 'Delivery Date' : 'Due Date'}
              </span>
              <span className="text-white text-sm">
                {documentType === 'quotation' || documentType === 'proforma' ? doc.valid_until :
                 documentType === 'order' ? doc.delivery_date : doc.due_date}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-[#b0b0d0] text-sm">Created</span>
              <span className="text-white text-sm">
                {new Date(doc.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-3 border-t border-[#23233a]/30">
            <Button size="sm" variant="secondary" className="flex-1">
              <Eye className="w-4 h-4 mr-2" />
              View
            </Button>
            <Button size="sm" variant="secondary" className="flex-1">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderDocumentTable = (documents: any[], documentType: string) => (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-[#23233a]/30">
          <tr>
            <th className="px-4 py-3 text-[#b0b0d0] font-medium">Number</th>
            <th className="px-4 py-3 text-[#b0b0d0] font-medium">Customer</th>
            <th className="px-4 py-3 text-[#b0b0d0] font-medium">Amount</th>
            <th className="px-4 py-3 text-[#b0b0d0] font-medium">Status</th>
            <th className="px-4 py-3 text-[#b0b0d0] font-medium">
              {documentType === 'quotation' || documentType === 'proforma' ? 'Valid Until' :
               documentType === 'order' ? 'Delivery Date' : 'Due Date'}
            </th>
            <th className="px-4 py-3 text-[#b0b0d0] font-medium">Created</th>
            <th className="px-4 py-3 text-[#b0b0d0] font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#23233a]/30">
          {documents.map((doc) => (
            <tr key={doc.id} className="hover:bg-[#23233a]/20">
              <td className="px-4 py-3 text-white font-medium">{doc.number}</td>
              <td className="px-4 py-3 text-white">{doc.customer_name}</td>
              <td className="px-4 py-3 text-white">${doc.amount.toFixed(2)}</td>
              <td className="px-4 py-3">
                <Badge variant={getStatusColor(doc.status)} size="sm">
                  {doc.status.replace('_', ' ')}
                </Badge>
              </td>
              <td className="px-4 py-3 text-white">
                {documentType === 'quotation' || documentType === 'proforma' ? doc.valid_until :
                 documentType === 'order' ? doc.delivery_date : doc.due_date}
              </td>
              <td className="px-4 py-3 text-white">
                {new Date(doc.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="secondary">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="secondary">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderDocumentList = (documents: any[], documentType: string) => (
    <div className="space-y-3">
      {documents.map((doc) => (
        <Card key={doc.id} className="hover:bg-[#23233a]/50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-2 ${
                documentType === 'quotation' ? 'bg-[#377dff]/20' :
                documentType === 'order' ? 'bg-[#43e7ad]/20' :
                documentType === 'proforma' ? 'bg-[#ff6b6b]/20' :
                'bg-[#a259ff]/20'
              } rounded-lg`}>
                {documentType === 'quotation' ? <FileText className="w-5 h-5 text-[#377dff]" /> :
                 documentType === 'order' ? <Receipt className="w-5 h-5 text-[#43e7ad]" /> :
                 documentType === 'proforma' ? <CreditCard className="w-5 h-5 text-[#ff6b6b]" /> :
                 <Banknote className="w-5 h-5 text-[#a259ff]" />}
              </div>
              <div>
                <h3 className="text-white font-medium">{doc.number}</h3>
                <p className="text-[#b0b0d0] text-sm">{doc.customer_name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white font-medium">${doc.amount.toFixed(2)}</p>
                <p className="text-[#b0b0d0] text-sm">
                  {new Date(doc.created_at).toLocaleDateString()}
                </p>
              </div>
              <Badge variant={getStatusColor(doc.status)} size="sm">
                {doc.status.replace('_', ' ')}
              </Badge>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="secondary">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="secondary">
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            AI-Powered Accounting
          </h1>
          <p className="text-[#b0b0d0]">
            Intelligent financial management with AI insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => setShowNewQuotation(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Quotation
          </Button>
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => setShowNewOrder(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Order
          </Button>
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => setShowNewProforma(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Proforma
          </Button>
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => setShowNewInvoice(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </Button>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => setShowAIAnalysis(true)}
          >
            <Brain className="w-4 h-4 mr-2" />
            AI Analysis
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-[#23233a]/30 rounded-lg p-1">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'quotations', label: 'Quotations', icon: FileText },
          { id: 'orders', label: 'Orders', icon: Receipt },
          { id: 'proforma', label: 'Proforma', icon: CreditCard },
          { id: 'invoices', label: 'Invoices', icon: Banknote },
          { id: 'automation', label: 'Automation', icon: Zap },
          { id: 'ai_insights', label: 'AI Insights', icon: Brain }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
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

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#b0b0d0] text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">${totalRevenue.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-[#43e7ad]/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-[#43e7ad]" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#b0b0d0] text-sm">Outstanding</p>
                  <p className="text-2xl font-bold text-white">${outstandingAmount.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-[#ff6b6b]/20 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-[#ff6b6b]" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#b0b0d0] text-sm">Total Invoices</p>
                  <p className="text-2xl font-bold text-white">{invoices.length}</p>
                </div>
                <div className="p-3 bg-[#a259ff]/20 rounded-lg">
                  <FileText className="w-6 h-6 text-[#a259ff]" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#b0b0d0] text-sm">Overdue</p>
                  <p className="text-2xl font-bold text-white">{overdueInvoices}</p>
                </div>
                <div className="p-3 bg-[#ff6b6b]/20 rounded-lg">
                  <Clock className="w-6 h-6 text-[#ff6b6b]" />
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Invoices */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Recent Invoices</h3>
              <Button variant="secondary" size="sm">
                View All
              </Button>
            </div>
            
            <div className="space-y-4">
              {invoices.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 bg-[#23233a]/30 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-[#a259ff]/20 rounded-lg">
                      <FileText className="w-5 h-5 text-[#a259ff]" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{invoice.number}</p>
                      <p className="text-[#b0b0d0] text-sm">{invoice.customer_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-medium">${invoice.amount.toFixed(2)}</span>
                    <Badge variant={getStatusColor(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Invoices</h2>
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-1 bg-[#23233a]/30 rounded-lg p-1">
                {[
                  { id: 'cards', icon: BarChart3, label: 'Cards' },
                  { id: 'table', icon: FileText, label: 'Table' },
                  { id: 'list', icon: List, label: 'List' }
                ].map((view) => (
                  <button
                    key={view.id}
                    onClick={() => setViewMode(view.id as 'cards' | 'table' | 'list')}
                    className={`flex items-center px-3 py-1 rounded-md transition-colors ${
                      viewMode === view.id
                        ? 'bg-[#a259ff] text-white'
                        : 'text-[#b0b0d0] hover:text-white hover:bg-[#23233a]/50'
                    }`}
                  >
                    <view.icon className="w-4 h-4 mr-1" />
                    {view.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#b0b0d0]" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] w-full"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={filterCustomer}
              onChange={(e) => setFilterCustomer(e.target.value)}
              className="px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
            >
              <option value="all">All Customers</option>
              {getUniqueCustomers(invoices).map(customer => (
                <option key={customer} value={customer}>{customer}</option>
              ))}
            </select>

            <select
              value={filterAmount}
              onChange={(e) => setFilterAmount(e.target.value)}
              className="px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
            >
              <option value="all">All Amounts</option>
              <option value="0-1000">$0 - $1,000</option>
              <option value="1000-5000">$1,000 - $5,000</option>
              <option value="5000-10000">$5,000 - $10,000</option>
              <option value="10000+">$10,000+</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
            >
              <option value="created_at">Sort by Date</option>
              <option value="number">Sort by Number</option>
              <option value="customer_name">Sort by Customer</option>
              <option value="amount">Sort by Amount</option>
              <option value="due_date">Sort by Due Date</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-[#b0b0d0] text-sm">
              Showing {filteredInvoices.length} of {invoices.length} invoices
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setFilterCustomer('all');
                setFilterAmount('all');
                setSortBy('created_at');
                setSortOrder('desc');
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>

          {/* Invoices Content */}
          {viewMode === 'cards' && renderDocumentCards(filteredInvoices, 'invoice')}
          {viewMode === 'table' && renderDocumentTable(filteredInvoices, 'invoice')}
          {viewMode === 'list' && renderDocumentList(filteredInvoices, 'invoice')}
        </div>
      )}

      {/* Quotations Tab */}
      {activeTab === 'quotations' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Quotations</h2>
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-1 bg-[#23233a]/30 rounded-lg p-1">
                {[
                  { id: 'cards', icon: BarChart3, label: 'Cards' },
                  { id: 'table', icon: FileText, label: 'Table' },
                  { id: 'list', icon: List, label: 'List' }
                ].map((view) => (
                  <button
                    key={view.id}
                    onClick={() => setViewMode(view.id as 'cards' | 'table' | 'list')}
                    className={`flex items-center px-3 py-1 rounded-md transition-colors ${
                      viewMode === view.id
                        ? 'bg-[#a259ff] text-white'
                        : 'text-[#b0b0d0] hover:text-white hover:bg-[#23233a]/50'
                    }`}
                  >
                    <view.icon className="w-4 h-4 mr-1" />
                    {view.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#b0b0d0]" />
              <input
                type="text"
                placeholder="Search quotations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] w-full"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>

            <select
              value={filterCustomer}
              onChange={(e) => setFilterCustomer(e.target.value)}
              className="px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
            >
              <option value="all">All Customers</option>
              {getUniqueCustomers(quotations).map(customer => (
                <option key={customer} value={customer}>{customer}</option>
              ))}
            </select>

            <select
              value={filterAmount}
              onChange={(e) => setFilterAmount(e.target.value)}
              className="px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
            >
              <option value="all">All Amounts</option>
              <option value="0-1000">$0 - $1,000</option>
              <option value="1000-5000">$1,000 - $5,000</option>
              <option value="5000-10000">$5,000 - $10,000</option>
              <option value="10000+">$10,000+</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
            >
              <option value="created_at">Sort by Date</option>
              <option value="number">Sort by Number</option>
              <option value="customer_name">Sort by Customer</option>
              <option value="amount">Sort by Amount</option>
              <option value="valid_until">Sort by Valid Until</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-[#b0b0d0] text-sm">
              Showing {filteredQuotations.length} of {quotations.length} quotations
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setFilterCustomer('all');
                setFilterAmount('all');
                setSortBy('created_at');
                setSortOrder('desc');
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>

          {/* Quotations Content */}
          {viewMode === 'cards' && renderDocumentCards(filteredQuotations, 'quotation')}
          {viewMode === 'table' && renderDocumentTable(filteredQuotations, 'quotation')}
          {viewMode === 'list' && renderDocumentList(filteredQuotations, 'quotation')}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Orders</h2>
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-1 bg-[#23233a]/30 rounded-lg p-1">
                {[
                  { id: 'cards', icon: BarChart3, label: 'Cards' },
                  { id: 'table', icon: FileText, label: 'Table' },
                  { id: 'list', icon: List, label: 'List' }
                ].map((view) => (
                  <button
                    key={view.id}
                    onClick={() => setViewMode(view.id as 'cards' | 'table' | 'list')}
                    className={`flex items-center px-3 py-1 rounded-md transition-colors ${
                      viewMode === view.id
                        ? 'bg-[#a259ff] text-white'
                        : 'text-[#b0b0d0] hover:text-white hover:bg-[#23233a]/50'
                    }`}
                  >
                    <view.icon className="w-4 h-4 mr-1" />
                    {view.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#b0b0d0]" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] w-full"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_production">In Production</option>
              <option value="ready_for_delivery">Ready for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={filterCustomer}
              onChange={(e) => setFilterCustomer(e.target.value)}
              className="px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
            >
              <option value="all">All Customers</option>
              {getUniqueCustomers(orders).map(customer => (
                <option key={customer} value={customer}>{customer}</option>
              ))}
            </select>

            <select
              value={filterAmount}
              onChange={(e) => setFilterAmount(e.target.value)}
              className="px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
            >
              <option value="all">All Amounts</option>
              <option value="0-1000">$0 - $1,000</option>
              <option value="1000-5000">$1,000 - $5,000</option>
              <option value="5000-10000">$5,000 - $10,000</option>
              <option value="10000+">$10,000+</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
            >
              <option value="created_at">Sort by Date</option>
              <option value="number">Sort by Number</option>
              <option value="customer_name">Sort by Customer</option>
              <option value="amount">Sort by Amount</option>
              <option value="delivery_date">Sort by Delivery Date</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-[#b0b0d0] text-sm">
              Showing {filteredOrders.length} of {orders.length} orders
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setFilterCustomer('all');
                setFilterAmount('all');
                setSortBy('created_at');
                setSortOrder('desc');
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>

          {/* Orders Content */}
          {viewMode === 'cards' && renderDocumentCards(filteredOrders, 'order')}
          {viewMode === 'table' && renderDocumentTable(filteredOrders, 'order')}
          {viewMode === 'list' && renderDocumentList(filteredOrders, 'order')}
        </div>
      )}

      {/* Proforma Tab */}
      {activeTab === 'proforma' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Proforma Invoices</h2>
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-1 bg-[#23233a]/30 rounded-lg p-1">
                {[
                  { id: 'cards', icon: BarChart3, label: 'Cards' },
                  { id: 'table', icon: FileText, label: 'Table' },
                  { id: 'list', icon: List, label: 'List' }
                ].map((view) => (
                  <button
                    key={view.id}
                    onClick={() => setViewMode(view.id as 'cards' | 'table' | 'list')}
                    className={`flex items-center px-3 py-1 rounded-md transition-colors ${
                      viewMode === view.id
                        ? 'bg-[#a259ff] text-white'
                        : 'text-[#b0b0d0] hover:text-white hover:bg-[#23233a]/50'
                    }`}
                  >
                    <view.icon className="w-4 h-4 mr-1" />
                    {view.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#b0b0d0]" />
              <input
                type="text"
                placeholder="Search proforma invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white placeholder-[#b0b0d0] focus:outline-none focus:ring-2 focus:ring-[#a259ff] w-full"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="converted_to_invoice">Converted to Invoice</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={filterCustomer}
              onChange={(e) => setFilterCustomer(e.target.value)}
              className="px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
            >
              <option value="all">All Customers</option>
              {getUniqueCustomers(proformaInvoices).map(customer => (
                <option key={customer} value={customer}>{customer}</option>
              ))}
            </select>

            <select
              value={filterAmount}
              onChange={(e) => setFilterAmount(e.target.value)}
              className="px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
            >
              <option value="all">All Amounts</option>
              <option value="0-1000">$0 - $1,000</option>
              <option value="1000-5000">$1,000 - $5,000</option>
              <option value="5000-10000">$5,000 - $10,000</option>
              <option value="10000+">$10,000+</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
            >
              <option value="created_at">Sort by Date</option>
              <option value="number">Sort by Number</option>
              <option value="customer_name">Sort by Customer</option>
              <option value="amount">Sort by Amount</option>
              <option value="valid_until">Sort by Valid Until</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-[#b0b0d0] text-sm">
              Showing {filteredProformaInvoices.length} of {proformaInvoices.length} proforma invoices
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setFilterCustomer('all');
                setFilterAmount('all');
                setSortBy('created_at');
                setSortOrder('desc');
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>

          {/* Proforma Content */}
          {viewMode === 'cards' && renderDocumentCards(filteredProformaInvoices, 'proforma')}
          {viewMode === 'table' && renderDocumentTable(filteredProformaInvoices, 'proforma')}
          {viewMode === 'list' && renderDocumentList(filteredProformaInvoices, 'proforma')}
        </div>
      )}

      {/* Automation Tab */}
      {activeTab === 'automation' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white">Automation Rules</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rules.map((rule) => (
              <Card key={rule.id} className="hover:bg-[#23233a]/50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#a259ff]/20 rounded-lg">
                      <Zap className="w-5 h-5 text-[#a259ff]" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{rule.name}</h3>
                      <p className="text-[#b0b0d0] text-sm">{rule.description}</p>
                    </div>
                  </div>
                  <Badge variant={getRuleTypeColor(rule.type)} size="sm">
                    {rule.type}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[#b0b0d0] text-sm">Status</span>
                    <Badge variant={rule.is_active ? 'success' : 'secondary'} size="sm">
                      {rule.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-3 border-t border-[#23233a]/30">
                  <Button size="sm" variant="secondary" className="flex-1">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button size="sm" variant="secondary" className="flex-1">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* AI Insights Tab */}
      {activeTab === 'ai_insights' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white">AI-Powered Insights</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-[#a259ff]/20 rounded-lg">
                  <Brain className="w-5 h-5 text-[#a259ff]" />
                </div>
                <h3 className="text-lg font-semibold text-white">Cash Flow Analysis</h3>
              </div>
              <p className="text-[#b0b0d0]">
                Your cash flow is healthy with a 15% increase in receivables. 
                Consider implementing early payment discounts to improve cash flow further.
              </p>
            </Card>

            <Card>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-[#43e7ad]/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-[#43e7ad]" />
                </div>
                <h3 className="text-lg font-semibold text-white">Profitability Insights</h3>
              </div>
              <p className="text-[#b0b0d0]">
                Gross margin improved by 8% this quarter. Focus on high-margin products 
                and consider price optimization strategies.
              </p>
            </Card>

            <Card>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-[#ff6b6b]/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-[#ff6b6b]" />
                </div>
                <h3 className="text-lg font-semibold text-white">Risk Alerts</h3>
              </div>
              <p className="text-[#b0b0d0]">
                3 invoices are overdue by more than 30 days. Implement stricter 
                credit policies and automated payment reminders.
              </p>
            </Card>

            <Card>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-[#377dff]/20 rounded-lg">
                  <Sparkles className="w-5 h-5 text-[#377dff]" />
                </div>
                <h3 className="text-lg font-semibold text-white">Optimization Opportunities</h3>
              </div>
              <p className="text-[#b0b0d0]">
                Operating expenses are 12% below budget. Consider reinvesting 
                savings into growth initiatives or technology upgrades.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* New Invoice Modal */}
      {showNewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#1a1a2e] p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Invoice</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#b0b0d0] text-sm mb-2">Customer Name</label>
                  <input
                    type="text"
                    value={newInvoice.customer_name}
                    onChange={(e) => setNewInvoice({...newInvoice, customer_name: e.target.value})}
                    className="w-full px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                  />
                </div>
                
                <div>
                  <label className="block text-[#b0b0d0] text-sm mb-2">Due Date</label>
                  <input
                    type="date"
                    value={newInvoice.due_date}
                    onChange={(e) => setNewInvoice({...newInvoice, due_date: e.target.value})}
                    className="w-full px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[#b0b0d0] text-sm mb-2">Invoice Items</label>
                <div className="space-y-3">
                  {newInvoice.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <input
                          type="text"
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) => {
                            const updatedItems = [...newInvoice.items];
                            updatedItems[index].description = e.target.value;
                            setNewInvoice({...newInvoice, items: updatedItems});
                          }}
                          className="w-full px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => {
                            const updatedItems = [...newInvoice.items];
                            updatedItems[index].quantity = parseInt(e.target.value) || 0;
                            updateItemTotal(index);
                          }}
                          className="w-full px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Price"
                          value={item.unit_price}
                          onChange={(e) => {
                            const updatedItems = [...newInvoice.items];
                            updatedItems[index].unit_price = parseFloat(e.target.value) || 0;
                            updateItemTotal(index);
                          }}
                          className="w-full px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Total"
                          value={item.total}
                          readOnly
                          className="w-full px-3 py-2 bg-[#23233a]/30 border border-[#23233a] rounded-lg text-white"
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => removeItem(index)}
                          disabled={newInvoice.items.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={addItem}
                  className="mt-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowNewInvoice(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={createInvoice}
              >
                Create Invoice
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* AI Analysis Modal */}
      {showAIAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#1a1a2e] p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">AI Financial Analysis</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[#b0b0d0] text-sm mb-2">Analysis Type</label>
                <select
                  value={aiAnalysis.analysis_type}
                  onChange={(e) => setAiAnalysis({...aiAnalysis, analysis_type: e.target.value})}
                  className="w-full px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                >
                  <option value="cash_flow">Cash Flow Analysis</option>
                  <option value="profitability">Profitability Analysis</option>
                  <option value="expenses">Expense Analysis</option>
                  <option value="receivables">Receivables Analysis</option>
                </select>
              </div>
              
              <div>
                <label className="block text-[#b0b0d0] text-sm mb-2">Time Period</label>
                <select
                  value={aiAnalysis.period}
                  onChange={(e) => setAiAnalysis({...aiAnalysis, period: e.target.value})}
                  className="w-full px-3 py-2 bg-[#23233a]/50 border border-[#23233a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
                >
                  <option value="30_days">Last 30 Days</option>
                  <option value="90_days">Last 90 Days</option>
                  <option value="6_months">Last 6 Months</option>
                  <option value="1_year">Last Year</option>
                </select>
              </div>
              
              {aiAnalysis.insights && (
                <div className="p-4 bg-[#23233a]/30 rounded-lg">
                  <h4 className="text-white font-medium mb-2">AI Insights</h4>
                  <p className="text-[#b0b0d0] text-sm">{aiAnalysis.insights}</p>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowAIAnalysis(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={runAIAnalysis}
              >
                <Brain className="w-4 h-4 mr-2" />
                Run Analysis
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title={deleteItem?.type === 'invoice' ? 'Delete Invoice' : 
               deleteItem?.type === 'quotation' ? 'Delete Quotation' :
               deleteItem?.type === 'order' ? 'Delete Order' : 'Delete Proforma Invoice'}
        message={
          deleteItem?.type === 'invoice' 
            ? `Are you sure you want to delete invoice "${deleteItem?.item?.number}"? This action cannot be undone.`
            : deleteItem?.type === 'quotation'
            ? `Are you sure you want to delete quotation "${deleteItem?.item?.number}"? This action cannot be undone.`
            : deleteItem?.type === 'order'
            ? `Are you sure you want to delete order "${deleteItem?.item?.number}"? This action cannot be undone.`
            : `Are you sure you want to delete proforma invoice "${deleteItem?.item?.number}"? This action cannot be undone.`
        }
        itemName={deleteItem?.item?.number || ''}
        module="accounting"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AIAccountingModule; 