import React, { useState, useEffect } from 'react';
import { Zap, User, Mail, Phone, Briefcase, MapPin, Award, FileText } from 'lucide-react';
import { useContactEnrichment } from '../../hooks/useContactEnrichment';
import { useEnrichmentStatus } from '../../hooks/useEnrichmentStatus';
import { ContactEnrichmentData } from '../../services/enrichmentService';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import EnrichmentButton from '../enrichment/EnrichmentButton';
import EnrichmentStatusBadge from '../enrichment/EnrichmentStatusBadge';
import EnrichmentPreviewModal from '../enrichment/EnrichmentPreviewModal';
import EnrichmentErrorModal from '../enrichment/EnrichmentErrorModal';
import EnrichmentDataCard from '../enrichment/EnrichmentDataCard';

interface ContactEnrichmentSectionProps {
  contactId: string;
  email: string;
  onEnrichmentComplete?: (data: ContactEnrichmentData) => void;
}

const ContactEnrichmentSection: React.FC<ContactEnrichmentSectionProps> = ({
  contactId,
  email,
  onEnrichmentComplete
}) => {
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Use the enrichment hooks
  const { 
    enrichContact,
    isEnriching,
    enrichmentStatus,
    enrichmentData,
    lastUpdated,
    error,
    refreshStatus
  } = useContactEnrichment({
    contactId,
    email,
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
    type: 'contact',
    id: contactId,
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
      await enrichContact();
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
    enrichContact();
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
          {enrichmentData.position && (
            <div className="flex items-center space-x-3 p-3 bg-secondary-700 rounded-lg">
              <Briefcase className="w-5 h-5 text-primary-500" />
              <div>
                <div className="text-sm text-secondary-400">Position</div>
                <div className="text-white">{enrichmentData.position}</div>
              </div>
            </div>
          )}
          
          {enrichmentData.phone && (
            <div className="flex items-center space-x-3 p-3 bg-secondary-700 rounded-lg">
              <Phone className="w-5 h-5 text-primary-500" />
              <div>
                <div className="text-sm text-secondary-400">Phone</div>
                <div className="text-white">{enrichmentData.phone}</div>
              </div>
            </div>
          )}
          
          {enrichmentData.location && (
            <div className="flex items-center space-x-3 p-3 bg-secondary-700 rounded-lg">
              <MapPin className="w-5 h-5 text-primary-500" />
              <div>
                <div className="text-sm text-secondary-400">Location</div>
                <div className="text-white">{enrichmentData.location}</div>
              </div>
            </div>
          )}
          
          {enrichmentData.skills && enrichmentData.skills.length > 0 && (
            <div className="flex items-start space-x-3 p-3 bg-secondary-700 rounded-lg">
              <Award className="w-5 h-5 text-primary-500 mt-1" />
              <div>
                <div className="text-sm text-secondary-400">Skills</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {enrichmentData.skills.slice(0, 5).map((skill, index) => (
                    <Badge key={index} variant="secondary" size="sm">
                      {skill}
                    </Badge>
                  ))}
                  {enrichmentData.skills.length > 5 && (
                    <Badge variant="secondary" size="sm">
                      +{enrichmentData.skills.length - 5} more
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
        title="Contact Enrichment"
        description="Automatically enhance contact data with additional information from LinkedIn and the web"
        status={enrichmentStatus}
        lastUpdated={lastUpdated}
        onEnrich={handleEnrich}
        isLoading={isEnriching}
        onViewDetails={() => setShowPreviewModal(true)}
        type="contact"
      />

      {showDetails && enrichmentStatus === 'completed' && renderEnrichmentDetails()}

      {/* Preview Modal */}
      <EnrichmentPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        type="contact"
        data={enrichmentData}
        onApply={handleApplyChanges}
      />

      {/* Error Modal */}
      <EnrichmentErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        error={error!}
        onRetry={handleRetry}
        type="contact"
      />
    </>
  );
};

export default ContactEnrichmentSection;