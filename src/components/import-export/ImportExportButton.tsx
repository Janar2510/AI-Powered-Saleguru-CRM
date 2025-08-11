import React, { useState } from 'react';
import { Upload, Download, FileText, X } from 'lucide-react';
import { Card } from '../common/Card';
import Dropdown from '../ui/Dropdown';

interface ImportExportButtonProps {
  entityType: string;
  onImportComplete: () => void;
}

export const ImportExportButton: React.FC<ImportExportButtonProps> = ({
  entityType,
  onImportComplete
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleImport = () => {
    // In a real implementation, this would open a file picker
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Process the file
        console.log('Importing file:', file.name);
        onImportComplete();
      }
    };
    input.click();
    setShowDropdown(false);
  };

  const handleExport = () => {
    // In a real implementation, this would export data
    console.log('Exporting', entityType);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="bg-[#23233a]/60 hover:bg-[#23233a]/80 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors border border-[#23233a]/40"
      >
        <FileText className="w-4 h-4" />
        <span>Import/Export</span>
      </button>
      
      {showDropdown && (
        <div className="absolute right-0 top-10 w-48 bg-[#23233a]/90 border border-[#23233a]/60 rounded-lg shadow-xl backdrop-blur-md z-10">
          <div className="py-1">
            <button
              onClick={handleImport}
              className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#23233a]/60 flex items-center space-x-2 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Import {entityType}</span>
            </button>
            <button
              onClick={handleExport}
              className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#23233a]/60 flex items-center space-x-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export {entityType}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 