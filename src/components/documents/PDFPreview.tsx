import React, { useState, useEffect } from 'react';
import { BrandCard, BrandButton } from '../../contexts/BrandDesignContext';
import { 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Fullscreen, 
  Eye,
  FileText,
  ExternalLink,
  Share2,
  Printer
} from 'lucide-react';

interface PDFPreviewProps {
  documentId: string;
  fileUrl?: string;
  fileName?: string;
  title: string;
  className?: string;
  showControls?: boolean;
  height?: string;
}

const PDFPreview: React.FC<PDFPreviewProps> = ({
  documentId,
  fileUrl,
  fileName,
  title,
  className = '',
  showControls = true,
  height = '600px'
}) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock PDF URL for demonstration
  const previewUrl = fileUrl || `https://example.com/documents/${documentId}/preview.pdf`;
  
  // Check if file is PDF
  const isPDF = fileName?.toLowerCase().endsWith('.pdf') || fileUrl?.includes('.pdf');
  
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = () => {
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName || `document-${documentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        url: fileUrl || window.location.href
      });
    } else {
      navigator.clipboard.writeText(fileUrl || window.location.href);
    }
  };

  const handlePrint = () => {
    if (fileUrl) {
      const printWindow = window.open(fileUrl, '_blank');
      printWindow?.print();
    }
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const openInNewTab = () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  return (
    <BrandCard 
      className={`overflow-hidden ${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
      borderGradient="primary"
    >
      {/* Controls */}
      {showControls && (
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-medium text-white truncate max-w-64">{title}</h3>
              {fileName && (
                <p className="text-xs text-white/60">{fileName}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
              <BrandButton 
                size="sm" 
                variant="ghost"
                onClick={handleZoomOut}
                disabled={zoom <= 50}
              >
                <ZoomOut className="w-4 h-4" />
              </BrandButton>
              
              <span className="text-xs text-white/60 px-2 min-w-16 text-center">
                {zoom}%
              </span>
              
              <BrandButton 
                size="sm" 
                variant="ghost"
                onClick={handleZoomIn}
                disabled={zoom >= 200}
              >
                <ZoomIn className="w-4 h-4" />
              </BrandButton>
            </div>

            {/* Action Controls */}
            <div className="flex items-center gap-1">
              <BrandButton 
                size="sm" 
                variant="ghost"
                onClick={handleRotate}
                title="Rotate"
              >
                <RotateCw className="w-4 h-4" />
              </BrandButton>

              <BrandButton 
                size="sm" 
                variant="ghost"
                onClick={handleShare}
                title="Share"
              >
                <Share2 className="w-4 h-4" />
              </BrandButton>

              <BrandButton 
                size="sm" 
                variant="ghost"
                onClick={handlePrint}
                title="Print"
              >
                <Printer className="w-4 h-4" />
              </BrandButton>

              <BrandButton 
                size="sm" 
                variant="ghost"
                onClick={openInNewTab}
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </BrandButton>

              <BrandButton 
                size="sm" 
                variant="ghost"
                onClick={handleDownload}
                title="Download"
              >
                <Download className="w-4 h-4" />
              </BrandButton>

              <BrandButton 
                size="sm" 
                variant="ghost"
                onClick={handleFullscreen}
                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                <Fullscreen className="w-4 h-4" />
              </BrandButton>
            </div>
          </div>
        </div>
      )}

      {/* Preview Area */}
      <div 
        className="relative bg-gray-900 overflow-auto"
        style={{ height: isFullscreen ? 'calc(100vh - 80px)' : height }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Preview not available</h3>
              <p className="text-white/60 mb-4">{error}</p>
              <BrandButton onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download to view
              </BrandButton>
            </div>
          </div>
        ) : isPDF && fileUrl ? (
          <div 
            className="w-full h-full"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease'
            }}
          >
            <iframe
              src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              className="w-full h-full border-0"
              title={title}
              onLoad={() => setLoading(false)}
              onError={() => setError('Failed to load PDF preview')}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Document Preview</h3>
              <p className="text-white/60 mb-4">
                {isPDF ? 'PDF preview will be available when uploaded' : 'Preview not available for this file type'}
              </p>
              <div className="flex gap-2 justify-center">
                <BrandButton onClick={openInNewTab} disabled={!fileUrl}>
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </BrandButton>
                <BrandButton onClick={handleDownload} disabled={!fileUrl}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </BrandButton>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      {showControls && (
        <div className="flex items-center justify-between px-4 py-2 bg-black/20 border-t border-white/10 text-xs text-white/60">
          <div className="flex items-center gap-4">
            <span>Document ID: {documentId}</span>
            {fileName && <span>File: {fileName}</span>}
          </div>
          <div className="flex items-center gap-4">
            <span>Zoom: {zoom}%</span>
            {rotation > 0 && <span>Rotation: {rotation}°</span>}
          </div>
        </div>
      )}
    </BrandCard>
  );
};

export default PDFPreview;

