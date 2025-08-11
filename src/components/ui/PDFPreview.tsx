import React, { useState, useRef } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Download, 
  X, 
  ChevronLeft, 
  ChevronRight,
  RotateCw,
  FileText
} from 'lucide-react';
import { useToastContext } from '../../contexts/ToastContext';

interface PDFPreviewProps {
  file: File | string; // File object or URL string
  onClose: () => void;
  title?: string;
  showDownload?: boolean;
  showNavigation?: boolean;
}

const PDFPreview: React.FC<PDFPreviewProps> = ({
  file,
  onClose,
  title = "PDF Preview",
  showDownload = true,
  showNavigation = true
}) => {
  const { showToast } = useToastContext();
  const [zoom, setZoom] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const getPDFUrl = () => {
    if (typeof file === 'string') {
      return file;
    } else {
      return URL.createObjectURL(file);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleDownload = () => {
    if (typeof file === 'string') {
      // If it's a URL, download it
      const link = document.createElement('a');
      link.href = file;
      link.download = title || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // If it's a File object, download it
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    showToast({
      title: 'Download Started',
      description: 'PDF download has begun',
      type: 'success'
    });
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleError = () => {
    setIsLoading(false);
    setError('Failed to load PDF. Please try again.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-[#1a1a2e] rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#334155]">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-[#a259ff]" />
            <h3 className="text-white font-medium">{title}</h3>
            {error && (
              <span className="text-red-400 text-sm">{error}</span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Zoom Controls */}
            <button
              onClick={handleZoomOut}
              className="p-2 text-[#b0b0d0] hover:text-white transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[#b0b0d0] text-sm min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-2 text-[#b0b0d0] hover:text-white transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            
            {/* Navigation Controls */}
            {showNavigation && totalPages > 1 && (
              <>
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage <= 1}
                  className="p-2 text-[#b0b0d0] hover:text-white transition-colors disabled:opacity-50"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[#b0b0d0] text-sm">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages}
                  className="p-2 text-[#b0b0d0] hover:text-white transition-colors disabled:opacity-50"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
            
            {/* Download Button */}
            {showDownload && (
              <button
                onClick={handleDownload}
                className="p-2 text-[#b0b0d0] hover:text-[#a259ff] transition-colors"
                title="Download PDF"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-[#b0b0d0] hover:text-red-400 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* PDF Content */}
        <div className="flex-1 p-4 overflow-hidden">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <RotateCw className="w-8 h-8 text-[#a259ff] animate-spin mx-auto mb-2" />
                <p className="text-[#b0b0d0]">Loading PDF...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-red-400">{error}</p>
                <button
                  onClick={() => {
                    setIsLoading(true);
                    setError(null);
                    // Reload iframe
                    if (iframeRef.current) {
                      iframeRef.current.src = iframeRef.current.src;
                    }
                  }}
                  className="mt-2 px-4 py-2 bg-[#a259ff] text-white rounded-lg hover:bg-[#8b4dff] transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
          
          {!isLoading && !error && (
            <div className="h-full overflow-auto bg-white rounded-lg">
              <iframe
                ref={iframeRef}
                src={`${getPDFUrl()}#toolbar=0&navpanes=0&scrollbar=0&view=FitH&zoom=${zoom}`}
                className="w-full h-full border-0"
                onLoad={handleLoad}
                onError={handleError}
                title="PDF Preview"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFPreview; 