import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { 
  Upload, 
  Palette, 
  Save, 
  Image as ImageIcon,
  Building,
  Mail,
  Phone,
  Globe,
  Trash2,
  Eye
} from 'lucide-react';

interface BrandSettings {
  logo_url: string;
  primary_color: string;
  company_name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  template_style: 'classic' | 'modern' | 'minimal';
}

const BrandSettings: React.FC = () => {
  const [brandSettings, setBrandSettings] = useState<BrandSettings>({
    logo_url: '',
    primary_color: '#6366f1',
    company_name: 'SaleToru CRM',
    address: '',
    phone: '',
    email: '',
    website: '',
    template_style: 'classic'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    loadBrandSettings();
  }, []);

  const loadBrandSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('branding')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data && !error) {
        setBrandSettings(data);
        if (data.logo_url) {
          setPreviewUrl(data.logo_url);
        }
      }
    } catch (error) {
      console.error('Failed to load brand settings:', error);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Upload to Supabase Storage
      const fileName = `logos/${user.id}/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('branding')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('branding')
        .getPublicUrl(fileName);

      setBrandSettings(prev => ({ ...prev, logo_url: urlData.publicUrl }));
      setPreviewUrl(urlData.publicUrl);
    } catch (error) {
      console.error('Failed to upload logo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('branding')
        .upsert({
          user_id: user.id,
          ...brandSettings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to save brand settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveLogo = () => {
    setBrandSettings(prev => ({ ...prev, logo_url: '' }));
    setPreviewUrl('');
  };

  const generatePreview = () => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #ddd;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid ${brandSettings.primary_color}; padding-bottom: 20px;">
          <div>
            ${brandSettings.logo_url ? `<img src="${brandSettings.logo_url}" alt="Logo" style="max-height: 60px; margin-bottom: 10px;" />` : ''}
            <h1 style="color: ${brandSettings.primary_color}; margin: 0;">${brandSettings.company_name}</h1>
            <p style="color: #666; margin: 5px 0;">${brandSettings.address}</p>
            <p style="color: #666; margin: 5px 0;">${brandSettings.phone}</p>
            <p style="color: #666; margin: 5px 0;">${brandSettings.email}</p>
          </div>
          <div style="text-align: right;">
            <h2 style="color: ${brandSettings.primary_color}; margin: 0;">INVOICE</h2>
            <p style="color: #666; margin: 5px 0;">Invoice #: INV-001</p>
            <p style="color: #666; margin: 5px 0;">Date: ${new Date().toLocaleDateString()}</p>
          </div>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #333; margin-bottom: 10px;">Bill To:</h3>
          <p style="margin: 5px 0;">Customer Name</p>
          <p style="margin: 5px 0;">customer@example.com</p>
          <p style="margin: 5px 0;">Customer Address</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">Description</th>
              <th style="padding: 12px; text-align: right; border-bottom: 1px solid #ddd;">Quantity</th>
              <th style="padding: 12px; text-align: right; border-bottom: 1px solid #ddd;">Price</th>
              <th style="padding: 12px; text-align: right; border-bottom: 1px solid #ddd;">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee;">Sample Item</td>
              <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee;">1</td>
              <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee;">$100.00</td>
              <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee;">$100.00</td>
            </tr>
          </tbody>
        </table>
        
        <div style="text-align: right;">
          <div style="font-size: 18px; font-weight: bold; color: ${brandSettings.primary_color};">
            Total: $100.00
          </div>
        </div>
      </div>
    `;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Brand Settings</h2>
        <Button variant="primary" onClick={handleSaveSettings} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Brand Settings Form */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Company Information</h3>
            
            <div className="space-y-4">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Company Logo</label>
                <div className="flex items-center space-x-3">
                  {previewUrl && (
                    <img 
                      src={previewUrl} 
                      alt="Logo" 
                      className="w-16 h-16 object-contain border rounded bg-white"
                    />
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={loading}
                      className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                    {previewUrl && (
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={handleRemoveLogo}
                        className="mt-2"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Remove Logo
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Primary Color */}
              <div>
                <label className="block text-sm font-medium mb-2">Primary Color</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={brandSettings.primary_color}
                    onChange={(e) => setBrandSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                    className="w-12 h-10 rounded border border-gray-600"
                  />
                  <span className="text-sm text-gray-400">{brandSettings.primary_color}</span>
                </div>
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Company Name</label>
                <input
                  type="text"
                  value={brandSettings.company_name}
                  onChange={(e) => setBrandSettings(prev => ({ ...prev, company_name: e.target.value }))}
                  className="w-full p-2 bg-[#1e293b] border border-gray-600 rounded text-white"
                  placeholder="Enter company name"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <textarea
                  value={brandSettings.address}
                  onChange={(e) => setBrandSettings(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full p-2 bg-[#1e293b] border border-gray-600 rounded text-white"
                  rows={3}
                  placeholder="Enter company address"
                />
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    value={brandSettings.phone}
                    onChange={(e) => setBrandSettings(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full p-2 bg-[#1e293b] border border-gray-600 rounded text-white"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={brandSettings.email}
                    onChange={(e) => setBrandSettings(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-2 bg-[#1e293b] border border-gray-600 rounded text-white"
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium mb-2">Website</label>
                <input
                  type="url"
                  value={brandSettings.website}
                  onChange={(e) => setBrandSettings(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full p-2 bg-[#1e293b] border border-gray-600 rounded text-white"
                  placeholder="Enter website URL"
                />
              </div>

              {/* Template Style */}
              <div>
                <label className="block text-sm font-medium mb-2">Template Style</label>
                <select
                  value={brandSettings.template_style}
                  onChange={(e) => setBrandSettings(prev => ({ ...prev, template_style: e.target.value as any }))}
                  className="w-full p-2 bg-[#1e293b] border border-gray-600 rounded text-white"
                >
                  <option value="classic">Classic</option>
                  <option value="modern">Modern</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Preview */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Document Preview</h3>
            <div className="bg-white rounded-lg p-4 border border-gray-300">
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: generatePreview() }}
              />
            </div>
            <div className="mt-4 text-center">
              <Button variant="secondary" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View Full Preview
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BrandSettings; 