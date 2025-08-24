import React, { useState } from 'react';
import { X, Bot, Settings, Zap, AlertTriangle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useToastContext } from '../../contexts/ToastContext';

interface GuruAISettingsProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  usageCount: number;
  usageLimit: number;
}

const GuruAISettings: React.FC<GuruAISettingsProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  usageCount,
  usageLimit
}) => {
  const { showToast } = useToastContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary-800 rounded-lg w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-600/30 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">SaleToruGuru AI Settings</h3>
              <p className="text-sm text-secondary-400">Configure your AI assistant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* API Key - Updated to show server-side configuration */}
          <Card>
            <div className="flex items-center space-x-3 mb-4">
              <Zap className="w-5 h-5 text-primary-500" />
              <h4 className="font-medium text-white">OpenAI API Configuration</h4>
              <Badge variant="success" size="sm">Secure</Badge>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-green-900/20 border border-green-600/30 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Zap className="w-4 h-4 text-green-400 mt-0.5" />
                  <p className="text-sm text-green-300">
                    Your OpenAI API key is securely stored on the server. API calls are made through a secure edge function, protecting your API key.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Usage Stats */}
          <Card>
            <div className="flex items-center space-x-3 mb-4">
              <Zap className="w-5 h-5 text-primary-500" />
              <h4 className="font-medium text-white">Usage Statistics</h4>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-secondary-700 rounded-lg">
                  <div className="text-2xl font-bold text-white">{usageCount}</div>
                  <div className="text-sm text-secondary-400">Requests Today</div>
                </div>
                <div className="p-4 bg-secondary-700 rounded-lg">
                  <div className="text-2xl font-bold text-white">
                    {usageLimit === Infinity ? '∞' : usageLimit}
                  </div>
                  <div className="text-sm text-secondary-400">Daily Limit</div>
                </div>
              </div>
              
              <div className="w-full bg-secondary-700 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${usageLimit === Infinity ? 0 : (usageCount / usageLimit) * 100}%` }}
                ></div>
              </div>
              
              {usageCount >= usageLimit && usageLimit !== Infinity && (
                <div className="p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
                    <p className="text-sm text-yellow-300">
                      You've reached your daily limit. Upgrade your plan for unlimited access.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* AI Model Settings */}
          <Card>
            <div className="flex items-center space-x-3 mb-4">
              <Settings className="w-5 h-5 text-primary-500" />
              <h4 className="font-medium text-white">AI Model Settings</h4>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-2">
                  OpenAI Model
                </label>
                <select
                  className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  defaultValue="gpt-4o"
                >
                  <option value="gpt-4o">GPT-4o (Recommended)</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </select>
                <p className="text-xs text-secondary-500 mt-1">
                  GPT-4o provides the best performance for sales-related tasks.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-2">
                  Temperature
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  defaultValue="0.7"
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-secondary-500 mt-1">
                  <span>More Focused</span>
                  <span>More Creative</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GuruAISettings;