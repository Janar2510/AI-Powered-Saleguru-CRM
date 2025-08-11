import React, { useState } from 'react';
import { X, Send, Paperclip, User, Building, DollarSign, TrendingUp } from 'lucide-react';
import { Deal } from '../../types/deals';
import { useToastContext } from '../../contexts/ToastContext';
import { supabase } from '../../services/supabase';

interface DealEmailComposerProps {
  deal: Deal;
  onClose: () => void;
  onEmailSent: () => void;
}

export const DealEmailComposer: React.FC<DealEmailComposerProps> = ({ deal, onClose, onEmailSent }) => {
  const { showToast } = useToastContext();
  const [emailData, setEmailData] = useState({
    subject: '',
    body: '',
    to: deal.contact?.email || '',
    cc: '',
    bcc: ''
  });
  const [isSending, setIsSending] = useState(false);

  const handleSendEmail = async () => {
    if (!emailData.subject.trim() || !emailData.body.trim()) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        description: 'Subject and body are required'
      });
      return;
    }

    setIsSending(true);
    try {
      // Save email to database
      const { data, error } = await supabase
        .from('deal_emails')
        .insert([{
          deal_id: deal.id,
          subject: emailData.subject,
          body: emailData.body,
          to_email: emailData.to,
          cc_email: emailData.cc || null,
          bcc_email: emailData.bcc || null,
          status: 'sent',
          sent_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;

      showToast({
        type: 'success',
        title: 'Email Sent',
        description: 'Email has been sent successfully'
      });

      onEmailSent();
      onClose();
    } catch (error) {
      console.error('Error sending email:', error);
      showToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to send email'
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#23233a]/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col relative border border-[#23233a]/50" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#23233a]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Send Email</h2>
              <p className="text-[#b0b0d0] text-sm">Deal: {deal.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Email Form */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          {/* Recipients */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-white">To</label>
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={emailData.to}
                onChange={(e) => setEmailData(prev => ({ ...prev, to: e.target.value }))}
                placeholder="recipient@example.com"
                className="flex-1 px-4 py-2 rounded-lg bg-[#23233a]/60 text-white border border-[#23233a]/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {deal.contact && (
                <div className="flex items-center gap-1 px-3 py-2 bg-blue-500/20 text-blue-300 rounded-lg text-sm">
                  <User className="w-4 h-4" />
                  {deal.contact.name}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white">CC</label>
              <input
                type="email"
                value={emailData.cc}
                onChange={(e) => setEmailData(prev => ({ ...prev, cc: e.target.value }))}
                placeholder="cc@example.com"
                className="w-full px-4 py-2 rounded-lg bg-[#23233a]/60 text-white border border-[#23233a]/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white">BCC</label>
              <input
                type="email"
                value={emailData.bcc}
                onChange={(e) => setEmailData(prev => ({ ...prev, bcc: e.target.value }))}
                placeholder="bcc@example.com"
                className="w-full px-4 py-2 rounded-lg bg-[#23233a]/60 text-white border border-[#23233a]/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-white">Subject</label>
            <input
              type="text"
              value={emailData.subject}
              onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Email subject..."
              className="w-full px-4 py-2 rounded-lg bg-[#23233a]/60 text-white border border-[#23233a]/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Body */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-white mb-2">Message</label>
            <textarea
              value={emailData.body}
              onChange={(e) => setEmailData(prev => ({ ...prev, body: e.target.value }))}
              placeholder="Write your message here..."
              className="w-full h-64 px-4 py-3 rounded-lg bg-[#23233a]/60 text-white border border-[#23233a]/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          {/* Deal Context */}
          <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-lg border border-[#23233a]/50 p-4">
            <h4 className="text-sm font-medium text-white mb-2">Deal Context</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-[#b0b0d0]">Value:</span>
                <span className="text-white font-medium">${deal.value.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-[#b0b0d0]">Probability:</span>
                <span className="text-white font-medium">{deal.probability}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-purple-400" />
                <span className="text-[#b0b0d0]">Company:</span>
                <span className="text-white font-medium">{deal.company?.name || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-[#23233a]/50">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#23233a]/60 text-[#b0b0d0] hover:bg-[#23233a]/80 transition-all duration-200">
              <Paperclip className="w-4 h-4" />
              Attach Files
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#23233a]/60 text-[#b0b0d0] hover:bg-[#23233a]/80 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSendEmail}
              disabled={isSending || !emailData.subject.trim() || !emailData.body.trim()}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Email
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 