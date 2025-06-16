import React, { useState, useRef } from 'react';
import { Paperclip, X, File, Image, FileText, Upload, Eye } from 'lucide-react';
import { useToastContext } from '../../contexts/ToastContext';
import clsx from 'clsx';

interface EmailAttachmentUploaderProps {
  onAttachmentsChange: (files: File[]) => void;
  maxSize?: number; // in MB
  maxFiles?: number;
  currentFiles?: File[];
}

const EmailAttachmentUploader: React.FC<EmailAttachmentUploaderProps> = ({
  onAttachmentsChange,
  maxSize = 10, // 10MB default
  maxFiles = 5,
  currentFiles = []
}) => {
  const { showToast } = useToastContext();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      processFiles(files);
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const processFiles = (files: File[]) => {
    // Check if adding these files would exceed the max number
    if (currentFiles.length + files.length > maxFiles) {
      showToast({
        title: 'Too Many Files',
        description: `You can only attach up to ${maxFiles} files`,
        type: 'error'
      });
      return;
    }
    
    // Check file sizes
    const validFiles = files.filter(file => {
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSize) {
        showToast({
          title: 'File Too Large',
          description: `${file.name} exceeds the ${maxSize}MB limit`,
          type: 'error'
        });
        return false;
      }
      return true;
    });
    
    if (validFiles.length > 0) {
      onAttachmentsChange([...currentFiles, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...currentFiles];
    newFiles.splice(index, 1);
    onAttachmentsChange(newFiles);
  };

  const getFileIcon = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension || '')) {
      return <Image className="w-4 h-4 text-blue-400" />;
    } else if (['pdf'].includes(extension || '')) {
      return <FileText className="w-4 h-4 text-red-400" />;
    } else if (['doc', 'docx', 'txt', 'rtf'].includes(extension || '')) {
      return <FileText className="w-4 h-4 text-blue-400" />;
    } else if (['xls', 'xlsx', 'csv'].includes(extension || '')) {
      return <FileText className="w-4 h-4 text-green-400" />;
    } else if (['ppt', 'pptx'].includes(extension || '')) {
      return <FileText className="w-4 h-4 text-orange-400" />;
    } else {
      return <File className="w-4 h-4 text-secondary-400" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handlePreviewFile = (file: File) => {
    // Create a URL for the file
    const url = URL.createObjectURL(file);
    
    // Open the URL in a new tab
    window.open(url, '_blank');
    
    // Clean up the URL object
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      {/* Drag & Drop Area */}
      <div
        className={clsx(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          isDragging
            ? "border-primary-600 bg-primary-600/10"
            : "border-secondary-600 hover:border-secondary-500"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Paperclip className="w-8 h-8 text-secondary-400 mx-auto mb-2" />
        <p className="text-secondary-400 text-sm mb-2">
          Drag and drop files here
        </p>
        <p className="text-secondary-500 text-xs mb-3">
          or click to browse (Max {maxSize}MB per file)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="btn-secondary text-sm flex items-center space-x-2 mx-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Select Files</span>
        </button>
      </div>
      
      {/* Attached Files */}
      {currentFiles.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-secondary-300">
              Attachments ({currentFiles.length}/{maxFiles})
            </h4>
            <span className="text-xs text-secondary-500">
              {currentFiles.reduce((total, file) => total + file.size, 0) / (1024 * 1024) < 1
                ? `${(currentFiles.reduce((total, file) => total + file.size, 0) / 1024).toFixed(1)} KB`
                : `${(currentFiles.reduce((total, file) => total + file.size, 0) / (1024 * 1024)).toFixed(1)} MB`}
            </span>
          </div>
          
          <div className="space-y-2">
            {currentFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-secondary-700 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  {getFileIcon(file)}
                  <div>
                    <div className="text-sm text-white truncate max-w-[200px]">{file.name}</div>
                    <div className="text-xs text-secondary-400">{formatFileSize(file.size)}</div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handlePreviewFile(file)}
                    className="p-1 text-secondary-400 hover:text-white transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="p-1 text-secondary-400 hover:text-red-400 transition-colors"
                    title="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailAttachmentUploader;