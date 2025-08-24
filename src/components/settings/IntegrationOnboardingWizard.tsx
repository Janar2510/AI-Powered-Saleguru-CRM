import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Mail, Calendar, Cloud, Smartphone, Zap, Settings, ArrowRight, Sparkles } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface IntegrationOnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: string;
  popular: boolean;
  selected: boolean;
}

const IntegrationOnboardingWizard: React.FC<IntegrationOnboardingWizardProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<Record<string, 'pending' | 'connecting' | 'connected' | 'error'>>({});

  const steps = [
    { id: 'welcome', title: 'Welcome', description: 'Get started with integrations' },
    { id: 'select', title: 'Choose Integrations', description: 'Select the services you want to connect' },
    { id: 'connect', title: 'Connect Services', description: 'Authorize and connect your accounts' },
    { id: 'configure', title: 'Configure Settings', description: 'Customize your integration settings' },
    { id: 'complete', title: 'All Set!', description: 'Your integrations are ready to use' }
  ];

  const integrations: Integration[] = [
    { id: 'gmail', name: 'Gmail', description: 'Sync emails and calendar', icon: Mail, category: 'Email & Calendar', popular: true, selected: false },
    { id: 'outlook', name: 'Microsoft Outlook', description: 'Connect your Outlook account', icon: Mail, category: 'Email & Calendar', popular: true, selected: false },
    { id: 'calendly', name: 'Calendly', description: 'Schedule meetings automatically', icon: Calendar, category: 'Email & Calendar', popular: true, selected: false },
    { id: 'google-drive', name: 'Google Drive', description: 'Store and share files', icon: Cloud, category: 'Cloud Storage', popular: true, selected: false },
    { id: 'slack', name: 'Slack', description: 'Team communication', icon: Smartphone, category: 'Communication', popular: true, selected: false },
    { id: 'whatsapp', name: 'WhatsApp', description: 'Business messaging', icon: Smartphone, category: 'Messaging', popular: false, selected: false },
    { id: 'zoom', name: 'Zoom', description: 'Video meetings', icon: Smartphone, category: 'Calls', popular: false, selected: false },
  ];

  const handleIntegrationToggle = (integrationId: string) => {
    setSelectedIntegrations(prev => 
      prev.includes(integrationId) 
        ? prev.filter(id => id !== integrationId)
        : [...prev, integrationId]
    );
  };

  const handleConnect = async (integrationId: string) => {
    setConnectionStatus(prev => ({ ...prev, [integrationId]: 'connecting' }));
    
    // Simulate OAuth connection
    setTimeout(() => {
      setConnectionStatus(prev => ({ ...prev, [integrationId]: 'connected' }));
    }, 2000);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    onClose();
    setCurrentStep(0);
    setSelectedIntegrations([]);
    setConnectionStatus({});
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-primary-600/20 rounded-full">
                <Sparkles className="w-12 h-12 text-primary-400" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Welcome to Integrations!</h2>
              <p className="text-secondary-300 mb-6">
                Connect your favorite tools and services to streamline your workflow and boost productivity.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-secondary-700/50 rounded-lg border border-secondary-600">
                <Mail className="w-8 h-8 text-primary-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Email & Calendar</h3>
                <p className="text-sm text-secondary-400">Sync emails, calendar events, and contacts</p>
              </div>
              <div className="p-4 bg-secondary-700/50 rounded-lg border border-secondary-600">
                <Cloud className="w-8 h-8 text-primary-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">File Storage</h3>
                <p className="text-sm text-secondary-400">Access and share files from cloud storage</p>
              </div>
              <div className="p-4 bg-secondary-700/50 rounded-lg border border-secondary-600">
                <Smartphone className="w-8 h-8 text-primary-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Communication</h3>
                <p className="text-sm text-secondary-400">Connect messaging and calling apps</p>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Choose Your Integrations</h2>
              <p className="text-secondary-300">Select the services you want to connect with SaleToru CRM</p>
            </div>
            <div className="space-y-4">
              {Object.entries(
                integrations.reduce((acc, integration) => {
                  if (!acc[integration.category]) acc[integration.category] = [];
                  acc[integration.category].push(integration);
                  return acc;
                }, {} as Record<string, Integration[]>)
              ).map(([category, categoryIntegrations]) => (
                <div key={category}>
                  <h3 className="font-semibold text-white mb-3">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categoryIntegrations.map(integration => (
                      <div
                        key={integration.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedIntegrations.includes(integration.id)
                            ? 'bg-primary-600/20 border-primary-600'
                            : 'bg-secondary-700/50 border-secondary-600 hover:border-secondary-500'
                        }`}
                        onClick={() => handleIntegrationToggle(integration.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-secondary-600 rounded-lg">
                            <integration.icon className="w-5 h-5 text-primary-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-white">{integration.name}</h4>
                              {integration.popular && <Badge variant="primary" size="sm">Popular</Badge>}
                            </div>
                            <p className="text-sm text-secondary-400">{integration.description}</p>
                          </div>
                          {selectedIntegrations.includes(integration.id) && (
                            <Check className="w-5 h-5 text-primary-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Connect Your Services</h2>
              <p className="text-secondary-300">Authorize SaleToru CRM to access your accounts</p>
            </div>
            <div className="space-y-4">
              {selectedIntegrations.map(integrationId => {
                const integration = integrations.find(i => i.id === integrationId);
                const status = connectionStatus[integrationId] || 'pending';
                
                if (!integration) return null;

                return (
                  <div key={integrationId} className="p-4 bg-secondary-700/50 rounded-lg border border-secondary-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-secondary-600 rounded-lg">
                          <integration.icon className="w-5 h-5 text-primary-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{integration.name}</h4>
                          <p className="text-sm text-secondary-400">{integration.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {status === 'pending' && (
                          <Button
                            variant="gradient"
                            size="sm"
                            onClick={() => handleConnect(integrationId)}
                          >
                            Connect
                          </Button>
                        )}
                        {status === 'connecting' && (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-400"></div>
                            <span className="text-sm text-secondary-400">Connecting...</span>
                          </div>
                        )}
                        {status === 'connected' && (
                          <div className="flex items-center space-x-2">
                            <Check className="w-5 h-5 text-green-500" />
                            <Badge variant="success" size="sm">Connected</Badge>
                          </div>
                        )}
                        {status === 'error' && (
                          <div className="flex items-center space-x-2">
                            <Badge variant="danger" size="sm">Error</Badge>
                            <Button variant="secondary" size="sm">Retry</Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Configure Settings</h2>
              <p className="text-secondary-300">Customize how your integrations work</p>
            </div>
            <div className="space-y-4">
              {selectedIntegrations.map(integrationId => {
                const integration = integrations.find(i => i.id === integrationId);
                if (!integration) return null;

                return (
                  <Card key={integrationId}>
                    <div className="flex items-center space-x-3 mb-4">
                      <integration.icon className="w-5 h-5 text-primary-400" />
                      <h4 className="font-medium text-white">{integration.name}</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white">Sync frequency</span>
                        <select className="px-3 py-1 bg-secondary-700 border border-secondary-600 rounded text-white text-sm">
                          <option>Every 15 minutes</option>
                          <option>Every hour</option>
                          <option>Every 6 hours</option>
                          <option>Daily</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white">Auto-sync</span>
                        <button className="w-10 h-5 bg-primary-600 rounded-full relative">
                          <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-green-600/20 rounded-full">
                <Check className="w-12 h-12 text-green-400" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">All Set!</h2>
              <p className="text-secondary-300 mb-6">
                Your integrations are now connected and ready to use. You can manage them anytime from the Settings page.
              </p>
            </div>
            <div className="bg-secondary-700/50 rounded-lg p-4 border border-secondary-600">
              <h3 className="font-semibold text-white mb-3">What's Next?</h3>
              <div className="space-y-2 text-sm text-secondary-400">
                <div className="flex items-center space-x-2">
                  <ArrowRight className="w-4 h-4 text-primary-400" />
                  <span>Start syncing your data automatically</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ArrowRight className="w-4 h-4 text-primary-400" />
                  <span>Configure notification preferences</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ArrowRight className="w-4 h-4 text-primary-400" />
                  <span>Explore automation features</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Integration Setup</h1>
            <p className="text-secondary-300">Step {currentStep + 1} of {steps.length}</p>
          </div>
          <button
            onClick={onClose}
            className="text-secondary-400 hover:text-white text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  index <= currentStep 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-secondary-700 text-secondary-400'
                }`}>
                  {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${
                    index < currentStep ? 'bg-primary-600' : 'bg-secondary-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h3 className="text-white font-medium">{steps[currentStep].title}</h3>
            <p className="text-sm text-secondary-400">{steps[currentStep].description}</p>
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            size="md"
            icon={ChevronLeft}
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          
          {currentStep === steps.length - 1 ? (
            <Button
              variant="gradient"
              size="md"
              onClick={handleComplete}
            >
              Get Started
            </Button>
          ) : (
            <Button
              variant="gradient"
              size="md"
              icon={ChevronRight}
              iconPosition="right"
              onClick={handleNext}
              disabled={currentStep === 1 && selectedIntegrations.length === 0}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default IntegrationOnboardingWizard; 