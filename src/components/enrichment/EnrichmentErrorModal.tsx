import React from 'react';
import { X, AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';
import { EnrichmentError } from '../../services/enrichmentService';

interface EnrichmentErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: EnrichmentError;
  onRetry: () => void;
  type: 'contact' | 'company';
}

const EnrichmentErrorModal: React.FC<EnrichmentErrorModalProps> = ({
  isOpen,
  onClose,
  error,
  onRetry,
  type
}) => {
  if (!isOpen) return null;

  const getErrorTitle = () => {
    switch (error.code) {
      case 'missing_email':
        return 'Email Required';
      case 'missing_domain':
      case 'missing_website':
        return 'Website Required';
      case 'invalid_website':
        return 'Invalid Website';
      case 'rate_limit_exceeded':
        return 'Rate Limit Exceeded';
      case 'api_error':
        return 'API Error';
      case 'network_error':
        return 'Network Error';
      case 'enrichment_failed':
        return 'Enrichment Failed';
      default:
        return 'Error';
    }
  };

  const getErrorDescription = () => {
    switch (error.code) {
      case 'missing_email':
        return 'An email address is required to enrich contact data from LinkedIn and web sources. Please add an email address and try again.';
      case 'missing_domain':
      case 'missing_website':
        return 'A website URL is required to enrich company data from LinkedIn and web sources. Please add a website and try again.';
      case 'invalid_website':
        return 'The website URL format is invalid. Please enter a valid URL (e.g., https://example.com).';
      case 'rate_limit_exceeded':
        return 'You have exceeded the rate limit for enrichment requests. Please try again later.';
      case 'api_error':
        return 'There was an error with the LinkedIn or web scraping API. Our team has been notified.';
      case 'network_error':
        return 'A network error occurred while connecting to LinkedIn or web sources. Please check your internet connection and try again.';
      default:
        return error.message || 'An unexpected error occurred during the enrichment process.';
    }
  };

  const getErrorSolution = () => {
    switch (error.code) {
      case 'missing_email':
        return 'Add an email address to the contact profile before enriching.';
      case 'missing_domain':
      case 'missing_website':
        return 'Add a website URL to the company profile before enriching.';
      case 'invalid_website':
        return 'Enter a valid website URL in the format: https://example.com';
      case 'rate_limit_exceeded':
        return 'Wait a few minutes before trying again, or upgrade your plan for higher limits.';
      case 'api_error':
      case 'network_error':
        return 'Try again later, or contact support if the issue persists.';
      default:
        return 'Try again or contact support if the issue persists.';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary-800 rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-600/30 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-white">{getErrorTitle()}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-secondary-300 mb-4">
            {getErrorDescription()}
          </p>
          
          <div className="p-4 bg-secondary-700 rounded-lg mb-4">
            <h4 className="font-medium text-white mb-2">Suggested Solution</h4>
            <p className="text-secondary-400 text-sm">
              {getErrorSolution()}
            </p>
          </div>
          
          {error.details && (
            <div className="p-4 bg-red-900/20 border border-red-600/30 rounded-lg mb-4">
              <h4 className="font-medium text-red-300 mb-2">Technical Details</h4>
              <pre className="text-red-400 text-xs overflow-x-auto">
                {typeof error.details === 'object' 
                  ? JSON.stringify(error.details, null, 2)
                  : String(error.details)
                }
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-secondary-700">
          <a 
            href="#" 
            className="text-primary-400 hover:text-primary-300 text-sm flex items-center space-x-1"
            onClick={(e) => {
              e.preventDefault();
              // In a real app, this would link to documentation
              console.log('Open documentation');
            }}
          >
            <ExternalLink className="w-4 h-4" />
            <span>View Documentation</span>
          </a>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Close
            </button>
            <button
              onClick={onRetry}
              className="btn-primary flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrichmentErrorModal;