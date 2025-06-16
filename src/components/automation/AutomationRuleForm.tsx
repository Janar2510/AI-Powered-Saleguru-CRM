import React, { useState, useEffect } from 'react';
import { Save, AlertTriangle, HelpCircle } from 'lucide-react';
import Card from '../ui/Card';
import { AutomationRule } from '../../types/automation';

interface AutomationRuleFormProps {
  rule: AutomationRule | null;
  isValid: boolean;
  onSave: (rule: Partial<AutomationRule>) => void;
}

const AutomationRuleForm: React.FC<AutomationRuleFormProps> = ({ 
  rule, 
  isValid,
  onSave 
}) => {
  const [formData, setFormData] = useState<Partial<AutomationRule>>({
    name: '',
    description: '',
    is_active: true
  });
  
  // Initialize form with rule data if provided
  useEffect(() => {
    if (rule) {
      setFormData({
        name: rule.name || '',
        description: rule.description || '',
        is_active: rule.is_active !== undefined ? rule.is_active : true
      });
    }
  }, [rule]);
  
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      // Show validation error
      return;
    }
    
    onSave(formData);
  };
  
  return (
    <Card className="bg-white/10 backdrop-blur-md">
      <h3 className="text-lg font-semibold text-white mb-4">Rule Details</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-secondary-300 mb-2">
            Rule Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter a descriptive name for this rule"
            className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-secondary-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe what this automation rule does"
            rows={3}
            className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600 resize-none"
          />
        </div>
        
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 cursor-pointer">
            <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={formData.is_active}
                onChange={(e) => handleInputChange('is_active', e.target.checked)}
              />
              <span className={`absolute inset-0 rounded-full transition-colors ${
                formData.is_active ? 'bg-primary-600' : 'bg-secondary-600'
              }`}></span>
              <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                formData.is_active ? 'translate-x-5' : 'translate-x-0'
              }`}></span>
            </div>
            <span className="text-white">Activate rule immediately</span>
          </label>
          
          <div className="relative group">
            <HelpCircle className="w-4 h-4 text-secondary-400 cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-secondary-800 rounded-lg shadow-lg text-xs text-secondary-300 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
              When active, this rule will automatically run whenever the trigger conditions are met.
            </div>
          </div>
        </div>
        
        {!isValid && (
          <div className="p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-200">Incomplete Rule</h4>
              <p className="text-yellow-300/80 text-sm mt-1">
                Your automation rule must have at least one trigger and one action to be saved.
              </p>
            </div>
          </div>
        )}
        
        <div className="flex justify-end pt-4 border-t border-secondary-700">
          <button
            type="submit"
            className="btn-primary flex items-center space-x-2"
            disabled={!isValid}
          >
            <Save className="w-4 h-4" />
            <span>{rule?.id ? 'Update Rule' : 'Save Rule'}</span>
          </button>
        </div>
      </form>
    </Card>
  );
};

export default AutomationRuleForm;