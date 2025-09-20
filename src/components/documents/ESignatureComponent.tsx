import React, { useState, useRef, useCallback } from 'react';
import { BrandCard, BrandButton, BrandInput } from '../../contexts/BrandDesignContext';
import { 
  PenTool, 
  Type, 
  Upload, 
  Download,
  RotateCcw,
  Check,
  X,
  Mouse,
  Smartphone,
  Camera
} from 'lucide-react';

interface ESignatureComponentProps {
  documentId: string;
  signerName: string;
  signerEmail: string;
  onSignatureComplete: (signatureData: any) => void;
  onCancel: () => void;
  className?: string;
}

interface SignatureField {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'signature' | 'initial' | 'date' | 'text';
  required: boolean;
  value?: string;
}

const ESignatureComponent: React.FC<ESignatureComponentProps> = ({
  documentId,
  signerName,
  signerEmail,
  onSignatureComplete,
  onCancel,
  className = ''
}) => {
  const [signatureMode, setSignatureMode] = useState<'draw' | 'type' | 'upload'>('draw');
  const [isDrawing, setIsDrawing] = useState(false);
  const [typedSignature, setTypedSignature] = useState(signerName);
  const [signatureDataURL, setSignatureDataURL] = useState<string>('');
  const [uploadedSignature, setUploadedSignature] = useState<string>('');
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState('cursive');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drawing functions
  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }, []);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  }, [isDrawing]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL();
    setSignatureDataURL(dataURL);
  }, [isDrawing]);

  // Clear canvas
  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureDataURL('');
  };

  // Initialize canvas
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas properties
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Set canvas size
    canvas.width = 400;
    canvas.height = 150;
  }, []);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedSignature(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate typed signature
  const generateTypedSignature = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return '';

    // Set font
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw text
    ctx.fillText(typedSignature, canvas.width / 2, canvas.height / 2);

    return canvas.toDataURL();
  };

  // Handle signature completion
  const handleCompleteSignature = () => {
    let finalSignature = '';

    switch (signatureMode) {
      case 'draw':
        finalSignature = signatureDataURL;
        break;
      case 'type':
        finalSignature = generateTypedSignature();
        break;
      case 'upload':
        finalSignature = uploadedSignature;
        break;
    }

    if (!finalSignature) {
      alert('Please create a signature before proceeding.');
      return;
    }

    const signatureData = {
      documentId,
      signerName,
      signerEmail,
      signatureType: signatureMode,
      signatureImage: finalSignature,
      timestamp: new Date().toISOString(),
      ipAddress: 'client-ip', // Would be captured server-side
      userAgent: navigator.userAgent,
      location: {
        // Would be captured if user permits location access
      }
    };

    onSignatureComplete(signatureData);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <BrandCard className="p-6" borderGradient="primary">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Electronic Signature</h2>
          <p className="text-white/60">
            Please review and sign the document
          </p>
          <div className="text-sm text-white/50 mt-2">
            Signer: {signerName} ({signerEmail})
          </div>
        </div>

        {/* Signature Mode Selector */}
        <div className="flex justify-center gap-2 mb-6">
          <BrandButton
            variant={signatureMode === 'draw' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setSignatureMode('draw')}
          >
            <PenTool className="w-4 h-4 mr-2" />
            Draw
          </BrandButton>
          <BrandButton
            variant={signatureMode === 'type' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setSignatureMode('type')}
          >
            <Type className="w-4 h-4 mr-2" />
            Type
          </BrandButton>
          <BrandButton
            variant={signatureMode === 'upload' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setSignatureMode('upload')}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </BrandButton>
        </div>

        {/* Drawing Mode */}
        {signatureMode === 'draw' && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-white/60 mb-4">
                <Mouse className="w-4 h-4 inline mr-1" />
                Draw your signature in the box below
              </p>
            </div>
            
            <div className="flex justify-center">
              <div className="border-2 border-dashed border-white/20 rounded-lg p-4 bg-white">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="cursor-crosshair border border-gray-300 rounded"
                  style={{ background: 'white' }}
                />
              </div>
            </div>

            <div className="flex justify-center">
              <BrandButton variant="ghost" size="sm" onClick={clearSignature}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear
              </BrandButton>
            </div>
          </div>
        )}

        {/* Typing Mode */}
        {signatureMode === 'type' && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-white/60 mb-4">
                <Type className="w-4 h-4 inline mr-1" />
                Type your signature
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <BrandInput
                value={typedSignature}
                onChange={(e) => setTypedSignature(e.target.value)}
                placeholder="Enter your full name"
                className="text-center"
              />

              <div className="flex gap-2">
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="cursive">Cursive</option>
                  <option value="serif">Serif</option>
                  <option value="sans-serif">Sans Serif</option>
                  <option value="monospace">Monospace</option>
                </select>

                <input
                  type="range"
                  min="16"
                  max="48"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="flex-1"
                />
              </div>

              <div className="text-center p-4 bg-white rounded-lg">
                <div
                  style={{
                    fontFamily: fontFamily,
                    fontSize: `${fontSize}px`,
                    color: '#000'
                  }}
                >
                  {typedSignature || 'Your signature will appear here'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Mode */}
        {signatureMode === 'upload' && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-white/60 mb-4">
                <Upload className="w-4 h-4 inline mr-1" />
                Upload an image of your signature
              </p>
              <p className="text-xs text-white/40">
                Supported formats: PNG, JPG, GIF
              </p>
            </div>

            <div className="flex justify-center">
              <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center bg-white/5">
                {uploadedSignature ? (
                  <div className="space-y-4">
                    <img
                      src={uploadedSignature}
                      alt="Uploaded signature"
                      className="max-w-sm max-h-32 mx-auto bg-white p-2 rounded"
                    />
                    <BrandButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setUploadedSignature('')}
                    >
                      Remove
                    </BrandButton>
                  </div>
                ) : (
                  <div>
                    <Camera className="w-12 h-12 text-white/40 mx-auto mb-4" />
                    <BrandButton onClick={() => fileInputRef.current?.click()}>
                      Choose File
                    </BrandButton>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Legal Notice */}
        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-xs text-yellow-200">
            <strong>Legal Notice:</strong> By clicking "Complete Signature", you agree that your electronic signature 
            is the legal equivalent of your manual signature and that you accept the terms and conditions of this document.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between gap-4 mt-6">
          <BrandButton variant="ghost" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </BrandButton>

          <BrandButton onClick={handleCompleteSignature}>
            <Check className="w-4 h-4 mr-2" />
            Complete Signature
          </BrandButton>
        </div>
      </BrandCard>
    </div>
  );
};

export default ESignatureComponent;

