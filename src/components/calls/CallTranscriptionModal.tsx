import React, { useState, useRef } from 'react';
import { CallTranscriptionService } from '../../services/callTranscriptionService';
import { CallAnalysis } from '../../types/call';
import { useToastContext } from '../../contexts/ToastContext';

interface CallTranscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactId?: string;
  dealId?: string;
  onTranscriptionComplete?: (callId: string) => void;
}

const CallTranscriptionModal: React.FC<CallTranscriptionModalProps> = ({
  isOpen,
  onClose,
  contactId,
  dealId,
  onTranscriptionComplete
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [callType, setCallType] = useState('sales_call');
  const [duration, setDuration] = useState('');
  const [analysis, setAnalysis] = useState<CallAnalysis | null>(null);
  const [transcript, setTranscript] = useState('');
  const [callId, setCallId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToastContext();

  const callTypes = [
    { value: 'sales_call', label: 'Sales Call' },
    { value: 'discovery_call', label: 'Discovery Call' },
    { value: 'demo_call', label: 'Demo Call' },
    { value: 'negotiation_call', label: 'Negotiation Call' },
    { value: 'follow_up', label: 'Follow-up Call' }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('audio/') && !file.name.endsWith('.mp3')) {
        showToast('Please select a valid audio file', 'error');
        return;
      }
      
      // Validate file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        showToast('File size must be less than 100MB', 'error');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showToast('Please select an audio file', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const audioUrl = await CallTranscriptionService.uploadAudioFile(selectedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Start transcription
      setIsTranscribing(true);
      
      const result = await CallTranscriptionService.transcribeCall({
        audioUrl,
        contactId,
        dealId,
        callType,
        duration: duration ? parseInt(duration) : undefined
      });

      if (result.success && result.analysis) {
        setAnalysis(result.analysis);
        setTranscript(result.transcript || '');
        setCallId(result.callId || null);
        
        if (onTranscriptionComplete && result.callId) {
          onTranscriptionComplete(result.callId);
        }
        
        showToast('Call transcribed successfully!', 'success');
      } else {
        throw new Error(result.error || 'Transcription failed');
      }
    } catch (error) {
      console.error('Error uploading/transcribing:', error);
      showToast(error instanceof Error ? error.message : 'Failed to process call', 'error');
    } finally {
      setIsUploading(false);
      setIsTranscribing(false);
      setUploadProgress(0);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getDealStageColor = (stage: string) => {
    switch (stage) {
      case 'qualification': return 'text-blue-600 bg-blue-100';
      case 'discovery': return 'text-purple-600 bg-purple-100';
      case 'proposal': return 'text-orange-600 bg-orange-100';
      case 'negotiation': return 'text-yellow-600 bg-yellow-100';
      case 'closing': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary-800 border border-secondary-700 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-700">
          <h2 className="text-2xl font-bold text-white">AI Call Transcription</h2>
          <button
            onClick={onClose}
            className="text-secondary-400 hover:text-white transition-colors rounded-full p-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          {!analysis ? (
            /* Upload Section */
            <div className="space-y-6">
              {/* File Upload */}
              <div className="border-2 border-dashed border-secondary-700 rounded-lg p-8 text-center">
                <div className="space-y-4">
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  
                  <div>
                    <p className="text-lg font-medium text-white">
                      {selectedFile ? selectedFile.name : 'Upload Call Recording'}
                    </p>
                    <p className="text-sm text-secondary-400 mt-1">
                      {selectedFile 
                        ? `Size: ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                        : 'Drag and drop an audio file, or click to browse'
                      }
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*,.mp3,.wav,.m4a"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-colors"
                  >
                    {selectedFile ? 'Change File' : 'Select Audio File'}
                  </button>
                </div>
              </div>

              {/* Call Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-400 mb-2">
                    Call Type
                  </label>
                  <select
                    value={callType}
                    onChange={(e) => setCallType(e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-secondary-900 text-white"
                  >
                    {callTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-400 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g., 15"
                    className="w-full px-3 py-2 border border-secondary-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-secondary-900 text-white"
                  />
                </div>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-secondary-400">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-secondary-700 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Transcribing Status */}
              {isTranscribing && (
                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-blue-800 font-medium">
                    Transcribing call with AI... This may take a few minutes.
                  </span>
                </div>
              )}

              {/* Upload Button */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-secondary-400 bg-secondary-700 rounded-lg hover:bg-secondary-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading || isTranscribing}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isTranscribing ? 'Transcribing...' : 'Transcribe Call'}
                </button>
              </div>
            </div>
          ) : (
            /* Results Section */
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">AI Call Summary</h3>
                <p className="text-secondary-400 leading-relaxed">{analysis.summary}</p>
              </div>

              {/* Analysis Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-secondary-400">Sentiment</span>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSentimentColor(analysis.sentiment)}`}>
                    {analysis.sentiment.charAt(0).toUpperCase() + analysis.sentiment.slice(1)}
                  </span>
                </div>

                <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-secondary-400">Deal Stage</span>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getDealStageColor(analysis.dealStage)}`}>
                    {analysis.dealStage.charAt(0).toUpperCase() + analysis.dealStage.slice(1)}
                  </span>
                </div>

                <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-secondary-400">Risk Level</span>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(analysis.riskLevel)}`}>
                    {analysis.riskLevel.charAt(0).toUpperCase() + analysis.riskLevel.slice(1)}
                  </span>
                </div>

                <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-secondary-400">Confidence</span>
                  </div>
                  <span className="text-lg font-semibold text-white">
                    {(analysis.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Key Points & Action Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Key Points</h4>
                  <ul className="space-y-2">
                    {analysis.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span className="text-secondary-400">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Action Items</h4>
                  <ul className="space-y-2">
                    {analysis.actionItems.map((item, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span className="text-secondary-400">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* AI Recommendations */}
              <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-white mb-4">AI Recommendations</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-secondary-400">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Full Transcript */}
              <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Full Transcript</h4>
                <div className="bg-secondary-900 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <p className="text-secondary-400 whitespace-pre-wrap text-sm">{transcript}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setAnalysis(null);
                    setTranscript('');
                    setSelectedFile(null);
                    setCallId(null);
                  }}
                  className="px-4 py-2 text-secondary-400 bg-secondary-700 rounded-lg hover:bg-secondary-600 transition-colors"
                >
                  Transcribe Another Call
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallTranscriptionModal; 