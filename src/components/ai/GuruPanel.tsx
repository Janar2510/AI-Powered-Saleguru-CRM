import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Minimize2, Sparkles, Bot, Zap, Lightbulb, Clock, Target, CheckSquare, Calendar, Mail } from 'lucide-react';
import clsx from 'clsx';
import { useGuru } from '../../contexts/GuruContext';
import { useToastContext } from '../../contexts/ToastContext';
import Badge from '../ui/Badge';

const GuruPanel: React.FC = () => {
  const { 
    isOpen, 
    messages, 
    pageTitle, 
    suggestedQueries, 
    closeGuru, 
    sendMessage,
    isLoading,
    usageCount,
    usageLimit
  } = useGuru();
  
  const { showToast } = useToastContext();
  
  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current && !isMinimized) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    
    // Check for @ mentions
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const textAfterAt = value.substring(lastAtIndex + 1);
      if (!textAfterAt.includes(' ') && textAfterAt.length > 0) {
        setMentionQuery(textAfterAt);
        setShowMentions(true);
        setCursorPosition(lastAtIndex);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Check if user has reached their limit
    if (usageCount >= usageLimit) {
      showToast({
        title: 'AI Usage Limit Reached',
        description: `You've reached your daily limit of ${usageLimit} AI requests.`,
        type: 'error'
      });
      return;
    }

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
    switch (pageTitle.toLowerCase()) {
      case 'deals':
        return <Target className="w-5 h-5 text-primary-500" />;
      case 'contacts':
      case 'companies':
        return <User className="w-5 h-5 text-green-500" />;
      case 'tasks':
        return <CheckSquare className="w-5 h-5 text-orange-500" />;
      case 'calendar':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'emails':
      case 'email templates':
        return <Mail className="w-5 h-5 text-purple-500" />;
      default:
        return <Bot className="w-5 h-5 text-primary-500" />;
    }
  };

  // Entities for mentions (deals, contacts, etc.)
  const entities = [
    { id: 'deal-1', name: 'TechCorp Enterprise Deal', type: 'deal' },
    { id: 'deal-2', name: 'StartupXYZ Cloud Setup', type: 'deal' },
    { id: 'contact-1', name: 'John Smith', type: 'contact' },
    { id: 'contact-2', name: 'Sarah Johnson', type: 'contact' },
  ];

  const filteredEntities = entities.filter(entity =>
    entity.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const insertMention = (entity: typeof entities[0]) => {
    const beforeAt = input.substring(0, cursorPosition);
    const afterMention = input.substring(cursorPosition + mentionQuery.length + 1);
    const newText = `${beforeAt}@${entity.name}${afterMention}`;
    
    setInput(newText);
    setShowMentions(false);
    setMentionQuery('');
    
    // Focus back to input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  if (!isOpen) return null;

  return (
    <div className={clsx(
      'fixed right-0 top-0 h-full bg-secondary-800/95 backdrop-blur-sm border-l border-secondary-700 shadow-2xl transition-all duration-300 z-50',
      isMinimized ? 'w-16' : 'w-[400px] max-w-full',
      'flex flex-col'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-secondary-700 bg-gradient-to-r from-primary-600 to-purple-700">
        {!isMinimized && (
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img 
                src="https://i.imgur.com/Zylpdjy.png" 
                alt="SaleToruGuru" 
                className="w-6 h-6 object-contain"
              />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">SaleToruGuru</h2>
              <p className="text-xs text-purple-200">{pageTitle} Assistant</p>
            </div>
          </div>
        )}
        {!isMinimized && (
          <div className="flex items-center space-x-1">
            <div className="text-xs text-purple-200 px-2 py-1 bg-purple-900/30 rounded-full">
              {usageCount}/{usageLimit === Infinity ? '∞' : usageLimit} today
            </div>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors touch-target"
            aria-label={isMinimized ? "Expand" : "Minimize"}
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={closeGuru}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors touch-target"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Context Suggestions */}
          {messages.length <= 1 && (
            <div className="p-4 border-b border-secondary-700 bg-secondary-750">
              <h3 className="text-sm font-medium text-secondary-300 mb-3">Try asking about {pageTitle}:</h3>
              <div className="space-y-2">
                {suggestedQueries.slice(0, 3).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(suggestion)}
                    className="w-full text-left px-3 py-2 bg-secondary-600 hover:bg-secondary-500 rounded-lg text-xs text-secondary-200 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Usage Limit Alert */}
          {usageCount >= usageLimit && (
            <div className="p-3 bg-yellow-900/20 border-b border-yellow-600/30">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-200">Usage Limit Reached</p>
                  <p className="text-xs text-yellow-300/80 mt-1">
                    You've reached your daily limit of {usageLimit} AI requests. 
                    Upgrade your plan for unlimited access.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={clsx(
                  'flex',
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={clsx(
                    'max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
                    message.type === 'user'
                      ? 'bg-primary-600 text-white rounded-br-md'
                      : 'bg-secondary-700 text-secondary-100 rounded-bl-md'
                  )}
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
                  
                  <div className={clsx(
                    'text-xs mt-2 opacity-70',
                    message.type === 'user' ? 'text-purple-200' : 'text-secondary-400'
                  )}>
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
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Ask about ${pageTitle.toLowerCase()}...`}
                  className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-xl text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
                  disabled={isLoading || usageCount >= usageLimit}
                />
                
                {/* Mention Dropdown */}
                {showMentions && filteredEntities.length > 0 && (
                  <div className="absolute bottom-full left-0 mb-2 w-64 bg-secondary-700 border border-secondary-600 rounded-lg shadow-lg z-10">
                    <div className="p-2">
                      <div className="text-xs text-secondary-400 mb-2">Mention entity:</div>
                      {filteredEntities.map((entity) => (
                        <button
                          key={entity.id}
                          type="button"
                          onClick={() => insertMention(entity)}
                          className="w-full text-left p-2 hover:bg-secondary-600 rounded-lg transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            {entity.type === 'deal' ? (
                              <Target className="w-4 h-4 text-primary-400" />
                            ) : (
                              <User className="w-4 h-4 text-primary-400" />
                            )}
                            <div>
                              <div className="font-medium text-white">{entity.name}</div>
                              <div className="text-xs text-secondary-400 capitalize">{entity.type}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || usageCount >= usageLimit}
                className="px-4 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-secondary-600 disabled:cursor-not-allowed rounded-xl text-white transition-colors touch-target"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center justify-between mt-2 text-xs text-secondary-500">
              <span>Cmd+K to open • Context: {pageTitle}</span>
              <span>AI-powered assistance</span>
            </div>
          </div>
        </>
      )}

      {/* Minimized State */}
      {isMinimized && (
        <div className="flex flex-col items-center py-4 space-y-4">
          <img 
            src="https://i.imgur.com/Zylpdjy.png" 
            alt="SaleToruGuru" 
            className="w-8 h-8 object-contain"
          />
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

export default GuruPanel;