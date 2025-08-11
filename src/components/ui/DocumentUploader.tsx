import React, { useState, useRef } from 'react';
import { Paperclip, X, File, Image, FileText, Upload, Eye, Download, Edit } from 'lucide-react';
import { useToastContext } from '../../contexts/ToastContext';
import clsx from 'clsx';

interface DocumentUploaderProps {
  onDocumentsChange: (files: File[]) => void;
  maxSize?: number; // in MB
  maxFiles?: number;
  currentFiles?: File[];
  acceptedTypes?: string[];
  showPreview?: boolean;
  showDownload?: boolean;
  showEdit?: boolean;
  title?: string;
  description?: string;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onDocumentsChange,
  maxSize = 10, // 10MB default
  maxFiles = 5,
  currentFiles = [],
  acceptedTypes = ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
  showPreview = true,
  showDownload = true,
  showEdit = false,
  title = "Upload Documents",
  description = "Drag and drop documents here or click to browse"
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
        description: `You can only upload up to ${maxFiles} files`,
        type: 'error'
      });
      return;
    }
    
    // Check file types
    const validFiles = files.filter(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!acceptedTypes.includes(extension)) {
        showToast({
          title: 'Invalid File Type',
          description: `${file.name} is not a supported file type`,
          type: 'error'
        });
        return false;
      }
      
      // Check file sizes
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
      onDocumentsChange([...currentFiles, ...validFiles]);
      showToast({
        title: 'Files Uploaded',
        description: `${validFiles.length} file(s) uploaded successfully`,
        type: 'success'
      });
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...currentFiles];
    newFiles.splice(index, 1);
    onDocumentsChange(newFiles);
  };

  const getFileIcon = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (['pdf'].includes(extension || '')) {
      return <FileText className="w-4 h-4 text-red-400" />;
    } else if (['doc', 'docx'].includes(extension || '')) {
      return <FileText className="w-4 h-4 text-blue-400" />;
    } else if (['txt', 'rtf'].includes(extension || '')) {
      return <FileText className="w-4 h-4 text-green-400" />;
    } else {
      return <File className="w-4 h-4 text-gray-400" />;
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

  const handleDownloadFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleEditFile = (file: File, index: number) => {
    // Trigger file input for replacement
    if (fileInputRef.current) {
      fileInputRef.current.accept = acceptedTypes.join(',');
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-3">
      {/* Drag & Drop Area */}
      <div
        className={clsx(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          isDragging
            ? "border-[#a259ff] bg-[#a259ff]/10"
            : "border-[#334155] hover:border-[#a259ff]"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Paperclip className="w-8 h-8 text-[#b0b0d0] mx-auto mb-2" />
        <p className="text-[#b0b0d0] text-sm mb-2">
          {title}
        </p>
        <p className="text-[#b0b0d0] text-xs mb-3">
          {description} (Max {maxSize}MB per file)
        </p>
        <p className="text-[#b0b0d0] text-xs mb-3">
          Accepted types: {acceptedTypes.join(', ')}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="bg-[#a259ff] hover:bg-[#8b4dff] text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2 mx-auto transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span>Select Files</span>
        </button>
      </div>
      
      {/* Uploaded Files */}
      {currentFiles.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-white">
              Uploaded Documents ({currentFiles.length}/{maxFiles})
            </h4>
            <span className="text-xs text-[#b0b0d0]">
              {currentFiles.reduce((total, file) => total + file.size, 0) / (1024 * 1024) < 1
                ? `${(currentFiles.reduce((total, file) => total + file.size, 0) / 1024).toFixed(1)} KB`
                : `${(currentFiles.reduce((total, file) => total + file.size, 0) / (1024 * 1024)).toFixed(1)} MB`}
            </span>
          </div>
          
          <div className="space-y-2">
            {currentFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-[#23233a] rounded-lg border border-[#334155]"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file)}
                  <div>
                    <div className="text-sm text-white truncate max-w-[200px]">{file.name}</div>
                    <div className="text-xs text-[#b0b0d0]">{formatFileSize(file.size)}</div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {showPreview && (
                    <button
                      type="button"
                      onClick={() => handlePreviewFile(file)}
                      className="p-1 text-[#b0b0d0] hover:text-white transition-colors"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  {showDownload && (
                    <button
                      type="button"
                      onClick={() => handleDownloadFile(file)}
                      className="p-1 text-[#b0b0d0] hover:text-[#a259ff] transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                  {showEdit && (
                    <button
                      type="button"
                      onClick={() => handleEditFile(file, index)}
                      className="p-1 text-[#b0b0d0] hover:text-[#10b981] transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="p-1 text-[#b0b0d0] hover:text-red-400 transition-colors"
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

export default DocumentUploader; 