import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Target, 
  ArrowLeft, 
  Star, 
  Clock, 
  Mail, 
  TrendingUp,
  Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToastContext } from '../contexts/ToastContext';
import { supabase } from '../services/supabase';
import { 
  BrandBackground,
  BrandPageLayout,
  BrandCard,
  BrandButton,
  BrandBadge
} from '../contexts/BrandDesignContext';

interface Template {
  id: string;
  slug: string;
  name: string;
  description?: string;
  category?: string;
  recommended?: boolean;
  trigger: any;
  graph: any;
}

const AutomationTemplates: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToastContext();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [installingId, setInstallingId] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('automation-templates', { 
        method: 'GET' 
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      setTemplates(data || []);
    } catch (error: any) {
      console.error('Error loading templates:', error);
      showToast({ title: 'Failed to load templates', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const installTemplate = async (templateId: string) => {
    if (!user?.org_id) return;
    
    setInstallingId(templateId);
    try {
      const { data, error } = await supabase.functions.invoke('automation-templates', { 
        body: { org_id: user.org_id, template_id: templateId },
        method: 'POST'
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      showToast({ 
        title: 'Template installed successfully!', 
        type: 'success' 
      });
      
      navigate(`/automations/${data.automation_id}`);
    } catch (error: any) {
      console.error('Error installing template:', error);
      showToast({ 
        title: 'Failed to install template', 
        type: 'error' 
      });
    } finally {
      setInstallingId(null);
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'leads': return <Target className="w-4 h-4" />;
      case 'finance': return <TrendingUp className="w-4 h-4" />;
      case 'experiments': return <Activity className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'leads': return 'blue';
      case 'finance': return 'green';
      case 'experiments': return 'purple';
      default: return 'gray';
    }
  };

  return (
    <BrandBackground>
      <BrandPageLayout
        title="Automation Templates"
        subtitle="Pre-built workflows for instant productivity"
        actions={
          <BrandButton variant="secondary" onClick={() => navigate('/automations')}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Automations
          </BrandButton>
        }
      >
        {loading ? (
          <BrandCard variant="glass" className="p-8 text-center mx-5">
            <Activity className="w-8 h-8 text-white/60 mx-auto mb-4 animate-spin" />
            <p className="text-white/80">Loading templates...</p>
          </BrandCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-5">
            {templates.map((template) => (
              <BrandCard 
                key={template.id} 
                variant="glass" 
                borderGradient="blue"
                className="p-6 hover:scale-105 transition-transform duration-200"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(template.category)}
                      <h3 className="font-semibold text-white">{template.name}</h3>
                    </div>
                    {template.recommended && (
                      <BrandBadge variant="primary" className="text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        Recommended
                      </BrandBadge>
                    )}
                  </div>

                  <p className="text-sm text-white/70 line-clamp-3">
                    {template.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <BrandBadge 
                      variant="secondary" 
                      className={`text-xs bg-${getCategoryColor(template.category)}-500/20 text-${getCategoryColor(template.category)}-300`}
                    >
                      {template.category || 'General'}
                    </BrandBadge>
                    
                    <div className="flex items-center text-xs text-white/60">
                      <Clock className="w-3 h-3 mr-1" />
                      {template.graph?.nodes?.length || 0} steps
                    </div>
                  </div>

                  <BrandButton
                    variant="primary"
                    onClick={() => installTemplate(template.id)}
                    disabled={installingId === template.id}
                    className="w-full"
                  >
                    {installingId === template.id ? (
                      <>
                        <Activity className="w-4 h-4 mr-1 animate-spin" />
                        Installing...
                      </>
                    ) : (
                      'Install Template'
                    )}
                  </BrandButton>
                </div>
              </BrandCard>
            ))}
          </div>
        )}

        {!loading && templates.length === 0 && (
          <BrandCard variant="glass" className="p-8 text-center mx-5">
            <Target className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No templates available</h3>
            <p className="text-white/60">
              Check back later for new automation templates.
            </p>
          </BrandCard>
        )}

        {/* Templates Info Card */}
        <BrandCard variant="glass" borderGradient="purple" className="mx-5 p-6">
          <div className="flex items-start space-x-3">
            <Target className="w-5 h-5 text-purple-400 mt-0.5" />
            <div className="text-sm text-purple-200">
              <p className="font-medium mb-1">About Templates:</p>
              <ul className="list-disc list-inside space-y-1 text-purple-200/80">
                <li>**Pre-configured**: Ready-to-use workflows with sensible defaults</li>
                <li>**Customizable**: Install as drafts, then modify to fit your needs</li>
                <li>**Governance**: Templates require approval before activation</li>
                <li>**Best Practices**: Built using proven automation patterns</li>
              </ul>
            </div>
          </div>
        </BrandCard>
      </BrandPageLayout>
    </BrandBackground>
  );
};

export default AutomationTemplates;
