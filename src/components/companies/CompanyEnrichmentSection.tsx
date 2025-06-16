import React, { useState, useEffect } from 'react';
import { Zap, Building, Globe, Users, MapPin, DollarSign, Calendar, Code } from 'lucide-react';
import { useCompanyEnrichment } from '../../hooks/useCompanyEnrichment';
import { useEnrichmentStatus } from '../../hooks/useEnrichmentStatus';
import { CompanyEnrichmentData } from '../../services/enrichmentService';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import EnrichmentButton from '../enrichment/EnrichmentButton';
import EnrichmentStatusBadge from '../enrichment/EnrichmentStatusBadge';
import EnrichmentPreviewModal from '../enrichment/EnrichmentPreviewModal';
import EnrichmentErrorModal from '../enrichment/EnrichmentErrorModal';
import EnrichmentDataCard from '../enrichment/EnrichmentDataCard';

interface CompanyEnrichmentSectionProps {
  companyId: string;
  website: string;
  onEnrichmentComplete?: (data: CompanyEnrichmentData) => void;
}

const CompanyEnrichmentSection: React.FC<CompanyEnrichmentSectionProps> = ({
  companyId,
  website,
  onEnrichmentComplete
}) => {
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Use the enrichment hooks
  const { 
    enrichCompany,
    isEnriching,
    enrichmentStatus,
    enrichmentData,
    lastUpdated,
    error,
    refreshStatus
  } = useCompanyEnrichment({
    companyId,
    website,
    onSuccess: (data) => {
      if (onEnrichmentComplete) {
        onEnrichmentComplete(data);
      }
    }
  });

  // Use the status hook to poll for updates if status is pending
  const { 
    status: polledStatus,
    lastUpdated: polledLastUpdated,
    startPolling,
    stopPolling
  } = useEnrichmentStatus({
    type: 'company',
    id: companyId,
    autoRefresh: enrichmentStatus === 'pending'
  });

  // Start polling when enrichment status becomes pending
  useEffect(() => {
    if (enrichmentStatus === 'pending') {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [enrichmentStatus, startPolling, stopPolling]);

  // Update local state when polled status changes
  useEffect(() => {
    if (polledStatus !== enrichmentStatus) {
      refreshStatus();
    }
  }, [polledStatus, enrichmentStatus, refreshStatus]);

  const handleEnrich = async () => {
    if (enrichmentStatus === 'completed' && enrichmentData) {
      setShowPreviewModal(true);
    } else {
      await enrichCompany();
    }
  };

  const handleApplyChanges = () => {
    setShowPreviewModal(false);
    if (onEnrichmentComplete && enrichmentData) {
      onEnrichmentComplete(enrichmentData);
    }
  };

  const handleRetry = () => {
    setShowErrorModal(false);
    enrichCompany();
  };

  // If there's an error, show the error modal
  useEffect(() => {
    if (error) {
      setShowErrorModal(true);
    }
  }, [error]);

  const renderEnrichmentDetails = () => {
    if (!enrichmentData) return null;

    return (
      <div className="space-y-4 mt-4 pt-4 border-t border-secondary-700">
        <h4 className="font-medium text-white">Enriched Data</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {enrichmentData.industry && (
            <div className="flex items-center space-x-3 p-3 bg-secondary-700 rounded-lg">
              <Building className="w-5 h-5 text-primary-500" />
              <div>
                <div className="text-sm text-secondary-400">Industry</div>
                <div className="text-white">{enrichmentData.industry}</div>
              </div>
            </div>
          )}
          
          {enrichmentData.size && (
            <div className="flex items-center space-x-3 p-3 bg-secondary-700 rounded-lg">
              <Users className="w-5 h-5 text-primary-500" />
              <div>
                <div className="text-sm text-secondary-400">Company Size</div>
                <div className="text-white">{enrichmentData.size}</div>
              </div>
            </div>
          )}
          
          {enrichmentData.headquarters && (
            <div className="flex items-center space-x-3 p-3 bg-secondary-700 rounded-lg">
              <MapPin className="w-5 h-5 text-primary-500" />
              <div>
                <div className="text-sm text-secondary-400">Headquarters</div>
                <div className="text-white">{enrichmentData.headquarters}</div>
              </div>
            </div>
          )}
          
          {enrichmentData.revenue && (
            <div className="flex items-center space-x-3 p-3 bg-secondary-700 rounded-lg">
              <DollarSign className="w-5 h-5 text-primary-500" />
              <div>
                <div className="text-sm text-secondary-400">Revenue</div>
                <div className="text-white">{enrichmentData.revenue}</div>
              </div>
            </div>
          )}
          
          {enrichmentData.founded && (
            <div className="flex items-center space-x-3 p-3 bg-secondary-700 rounded-lg">
              <Calendar className="w-5 h-5 text-primary-500" />
              <div>
                <div className="text-sm text-secondary-400">Founded</div>
                <div className="text-white">{enrichmentData.founded}</div>
              </div>
            </div>
          )}
          
          {enrichmentData.technologies && enrichmentData.technologies.length > 0 && (
            <div className="flex items-start space-x-3 p-3 bg-secondary-700 rounded-lg">
              <Code className="w-5 h-5 text-primary-500 mt-1" />
              <div>
                <div className="text-sm text-secondary-400">Technologies</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {enrichmentData.technologies.slice(0, 5).map((tech, index) => (
                    <Badge key={index} variant="secondary" size="sm">
                      {tech}
                    </Badge>
                  ))}
                  {enrichmentData.technologies.length > 5 && (
                    <Badge variant="secondary" size="sm">
                      +{enrichmentData.technologies.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <button
          onClick={() => setShowPreviewModal(true)}
          className="text-primary-400 hover:text-primary-300 text-sm"
        >
          View all enriched data
        </button>
      </div>
    );
  };

  return (
    <>
      <EnrichmentDataCard
        title="Company Enrichment"
        description="Automatically enhance company data with additional information from LinkedIn and the web"
        status={enrichmentStatus}
        lastUpdated={lastUpdated}
        onEnrich={handleEnrich}
        isLoading={isEnriching}
        onViewDetails={() => setShowPreviewModal(true)}
        type="company"
      />

      {showDetails && enrichmentStatus === 'completed' && renderEnrichmentDetails()}

      {/* Preview Modal */}
      <EnrichmentPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        type="company"
        data={enrichmentData}
        onApply={handleApplyChanges}
      />

      {/* Error Modal */}
      <EnrichmentErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        error={error!}
        onRetry={handleRetry}
        type="company"
      />
    </>
  );
};

export default CompanyEnrichmentSection;