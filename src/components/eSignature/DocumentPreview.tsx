import React from 'react';
import { FileText } from 'lucide-react';

interface DocumentPreviewProps {
  document: any;
  signatureFields: any[];
  onFieldUpdate: (id: string, updates: any) => void;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ 
  document, 
  signatureFields, 
  onFieldUpdate 
}) => {
  return (
    <div className="relative w-full h-96 bg-white rounded border-2 border-dashed border-gray-300">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">{document?.name}</h3>
          <p className="text-sm text-gray-500">PDF Preview</p>
          <p className="text-xs text-gray-400 mt-2">
            {signatureFields.length} signature field(s) added
          </p>
        </div>
      </div>
      
      {/* Signature Fields Overlay */}
      {signatureFields.map((field) => (
        <div
          key={field.id}
          className="absolute border-2 border-blue-500 bg-blue-50 bg-opacity-50 cursor-move"
          style={{
            left: field.x,
            top: field.y,
            width: field.width,
            height: field.height
          }}
        >
          <div className="text-xs text-blue-600 p-1">
            {field.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentPreview; 