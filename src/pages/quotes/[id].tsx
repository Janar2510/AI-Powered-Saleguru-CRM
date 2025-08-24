import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '../../components/layout/Container';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { WorkflowActions } from '../../components/workflows/WorkflowActions';
import Spline from '@splinetool/react-spline';
import { 
  FileText, 
  Download, 
  Send, 
  Edit, 
  Trash2, 
  ArrowLeft,
  DollarSign,
  User,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Zap
} from 'lucide-react';

interface Quote {
  id: string;
  quote_number: string;
  client_name: string;
  total: number;
  status: string;
  created_at: string;
  items: Array<{
    name: string;
    qty: number;
    price: number;
  }>;
}

const QuoteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock quote data - in real app, fetch from Supabase
    const mockQuote: Quote = {
      id: id || '1',
      quote_number: 'Q-001',
      client_name: 'Acme Corporation',
      total: 2500,
      status: 'sent',
      created_at: '2024-01-15',
      items: [
        { name: 'Web Development Services', qty: 1, price: 2000 },
        { name: 'SEO Optimization', qty: 1, price: 500 }
      ]
    };
    
    setQuote(mockQuote);
    setLoading(false);
  }, [id]);

  const handleGenerateDocument = (type: 'invoice' | 'proforma' | 'receipt') => {
    navigate(`/documents/new?fromQuote=${id}&type=${type}`);
  };

  const handleBack = () => {
    navigate('/quotation-builder');
  };

  if (loading) {
    return (
      <Container>
        <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a259ff]"></div>
        </div>
      </Container>
    );
  }

  if (!quote) {
    return (
      <Container>
        <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Quote Not Found</h2>
            <p className="text-[#b0b0d0]">The quote you're looking for doesn't exist.</p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="min-h-screen bg-[#0f172a] text-white relative overflow-hidden">
        {/* Spline Background */}
        <div className="fixed inset-0 z-0">
          <Spline
            scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode"
            className="w-full h-full"
          />
        </div>
        
        {/* Gradient Overlay */}
        <div className="fixed inset-0 bg-gradient-to-b from-[#18182c]/50 to-[#18182c]/70 z-0"></div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="secondary" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white">Quote #{quote.quote_number}</h1>
                  <p className="text-[#b0b0d0] mt-1">Quote details and document generation</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="secondary">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="secondary">
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>

            {/* Quote Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Quote Details */}
              <div className="lg:col-span-2">
                <Card className="bg-[#23233a]/40 backdrop-blur-sm border-[#23233a]/50">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-white">Quote Details</h2>
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        quote.status === 'sent' ? 'bg-green-500 text-black' :
                        quote.status === 'draft' ? 'bg-yellow-500 text-black' :
                        'bg-gray-500 text-white'
                      }`}>
                        {quote.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <p className="text-sm text-[#b0b0d0] mb-1">Client</p>
                        <p className="font-semibold text-white flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          {quote.client_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-[#b0b0d0] mb-1">Date</p>
                        <p className="font-semibold text-white flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {quote.created_at}
                        </p>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Items</h3>
                      <div className="space-y-3">
                        {quote.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-[#23233a]/60 rounded-lg">
                            <div>
                              <p className="font-semibold text-white">{item.name}</p>
                              <p className="text-sm text-[#b0b0d0]">Qty: {item.qty}</p>
                            </div>
                            <p className="font-semibold text-white">€{item.price.toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Total */}
                    <div className="border-t border-[#23233a] pt-4">
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-semibold text-white">Total</p>
                        <p className="text-2xl font-bold text-white flex items-center">
                          <DollarSign className="w-5 h-5 mr-1" />
                          €{quote.total.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Document Generation */}
              <div>
                <Card className="bg-[#23233a]/40 backdrop-blur-sm border-[#23233a]/50">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-[#a259ff]" />
                      Workflow Actions
                    </h3>
                    <WorkflowActions
                      quoteId={quote.id}
                      quoteNumber={quote.quote_number}
                      quoteStatus={quote.status}
                      onQuoteConfirmed={(result) => {
                        // Update quote status locally
                        setQuote(prev => prev ? { ...prev, status: 'confirmed' } : null);
                        // Navigate to the new sales order
                        navigate(`/sales-orders/${result.salesOrderId}`);
                      }}
                    />
                  </div>
                </Card>

                <Card className="bg-[#23233a]/40 backdrop-blur-sm border-[#23233a]/50 mt-6">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-[#a259ff]" />
                      Generate Documents
                    </h3>
                    <p className="text-sm text-[#b0b0d0] mb-6">
                      Create professional documents from this quote
                    </p>
                    
                    <div className="space-y-3">
                      <Button 
                        variant="gradient" 
                        className="w-full"
                        onClick={() => handleGenerateDocument('invoice')}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Generate Invoice
                      </Button>
                      
                      <Button 
                        variant="secondary" 
                        className="w-full"
                        onClick={() => handleGenerateDocument('proforma')}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Generate Pro Forma
                      </Button>
                      
                      <Button 
                        variant="secondary" 
                        className="w-full"
                        onClick={() => handleGenerateDocument('receipt')}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Generate Receipt
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default QuoteDetail; 