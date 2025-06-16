import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Zap, Paperclip, Sparkles, Target, User, Calendar, CheckSquare } from 'lucide-react';
import { useGuru } from '../../contexts/GuruContext';
import Badge from '../ui/Badge';

interface GuruChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  contextType?: 'deal' | 'contact' | 'task' | 'general';
  contextId?: string;
}

const GuruChatModal: React.FC<GuruChatModalProps> = ({
  isOpen,
  onClose,
  initialPrompt,
  contextType = 'general',
  contextId
}) => {
  const { messages, sendMessage, clearMessages, isLoading, usageCount, usageLimit } = useGuru();
  const [input, setInput] = useState(initialPrompt || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    
    // Clear messages when modal opens
    if (isOpen) {
      clearMessages();
      
      // If there's an initial prompt, send it automatically
      if (initialPrompt) {
        sendMessage(initialPrompt);
        setInput('');
      }
    }
  }, [isOpen, initialPrompt, clearMessages, sendMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput('');

    try {
      await sendMessage(message);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getContextIcon = () => {
    switch (contextType) {
      case 'deal':
        return <Target className="w-5 h-5 text-primary-500" />;
      case 'contact':
        return <User className="w-5 h-5 text-green-500" />;
      case 'task':
        return <CheckSquare className="w-5 h-5 text-orange-500" />;
      case 'general':
      default:
        return <Bot className="w-5 h-5 text-primary-500" />;
    }
  };

  const getContextTitle = () => {
    switch (contextType) {
      case 'deal':
        return 'Deal Assistant';
      case 'contact':
        return 'Contact Insights';
      case 'task':
        return 'Task Helper';
      case 'general':
      default:
        return 'SaleToruGuru';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary-800 rounded-xl w-full max-w-3xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-secondary-700 bg-gradient-to-r from-primary-600/80 to-purple-700/80 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-600/50 backdrop-blur-sm rounded-full flex items-center justify-center">
              {getContextIcon()}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{getContextTitle()}</h2>
              <p className="text-xs text-purple-200">
                {contextId ? `Context: ${contextType} #${contextId}` : 'AI-powered assistance'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-xs text-purple-200 px-2 py-1 bg-purple-900/30 rounded-full">
              {usageCount}/{usageLimit === Infinity ? '∞' : usageLimit} today
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Welcome Message */}
          {messages.length === 0 && !isLoading && (
            <div className="flex justify-start">
              <div className="bg-secondary-700 px-4 py-3 rounded-2xl rounded-bl-md max-w-[85%]">
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary-400" />
                  <span className="text-xs font-medium text-primary-400">SaleToruGuru</span>
                </div>
                <div className="text-sm text-secondary-100">
                  {contextType === 'general' ? (
                    <>
                      Hi! I'm SaleToruGuru, your AI sales assistant. How can I help you today?
                    </>
                  ) : contextType === 'deal' ? (
                    <>
                      I'm analyzing this deal for you. You can ask me about:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Deal history and activity</li>
                        <li>Next steps and recommendations</li>
                        <li>Risk assessment and win probability</li>
                        <li>Competitive analysis</li>
                      </ul>
                    </>
                  ) : contextType === 'contact' ? (
                    <>
                      I'm analyzing this contact for you. You can ask me about:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Engagement history and activity</li>
                        <li>Lead scoring factors</li>
                        <li>Personalized outreach suggestions</li>
                        <li>Related deals and opportunities</li>
                      </ul>
                    </>
                  ) : (
                    <>
                      I'm analyzing this task for you. You can ask me about:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Task priority and dependencies</li>
                        <li>Related contacts and deals</li>
                        <li>Suggested follow-up actions</li>
                        <li>Time management recommendations</li>
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  message.type === 'user'
                    ? 'bg-primary-600 text-white rounded-br-md'
                    : 'bg-secondary-700 text-secondary-100 rounded-bl-md'
                }`}
              >
                {message.type === 'guru' && (
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary-400" />
                    <span className="text-xs font-medium text-primary-400">SaleToruGuru</span>
                    {message.metadata?.confidence && (
                      <Badge variant="secondary" size="sm">
                        {message.metadata.confidence}% confident
                      </Badge>
                    )}
                  </div>
                )}
                <div className="whitespace-pre-wrap">{message.content}</div>
                
                {/* Action Buttons */}
                {message.metadata?.actions && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {message.metadata.actions.map((action, index) => (
                      <button
                        key={index}
                        className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white text-xs rounded-lg transition-colors"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
                
                <div className={`text-xs mt-2 opacity-70 ${
                  message.type === 'user' ? 'text-purple-200' : 'text-secondary-400'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-secondary-700 px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-primary-400" />
                  <span className="text-xs font-medium text-primary-400">Analyzing...</span>
                </div>
                <div className="flex space-x-1 mt-2">
                  <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-secondary-700 bg-secondary-750">
          <div className="flex space-x-3">
            <div className="relative flex-1">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask SaleToruGuru..."
                className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-xl text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600 resize-none h-20"
                disabled={isLoading || usageCount >= usageLimit}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-2">
              <button
                className="p-2 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors"
                disabled={isLoading || usageCount >= usageLimit}
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                className="p-2 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors"
                disabled={isLoading || usageCount >= usageLimit}
              >
                <Calendar className="w-4 h-4" />
              </button>
            </div>
            
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || usageCount >= usageLimit}
              className="btn-primary flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </>
              )}
            </button>
          </div>
          
          {usageCount >= usageLimit && (
            <div className="mt-3 p-2 bg-yellow-900/20 border border-yellow-600/30 rounded-lg text-xs text-yellow-300 text-center">
              You've reached your daily limit. Upgrade your plan for unlimited access.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuruChatModal;