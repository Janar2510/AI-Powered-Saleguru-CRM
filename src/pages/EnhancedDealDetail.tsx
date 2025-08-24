import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Edit,
  CheckCircle,
  X,
  Star,
  Clock,
  DollarSign,
  Calendar,
  User,
  Building2,
  Phone,
  Mail,
  Target,
  TrendingUp,
  Activity,
  History,
  Receipt,
  Paperclip,
  PinIcon as Pin,
  AlertTriangle,
  Zap,
  BarChart3
} from 'lucide-react';
import { BrandBackground, BrandPageLayout, BrandCard, BrandButton, BrandBadge } from '../contexts/BrandDesignContext';
import { useDealData } from '../hooks/useDealData';
import { useDealActions } from '../hooks/useDealActions';
import { useDealFinance } from '../hooks/useDealFinance';
import AnimatedQuickActions from '../components/deal/AnimatedQuickActions';
import QuoteToInvoicePanel from '../components/deal/QuoteToInvoicePanel';

const EnhancedDealDetail: React.FC = () => {
  const { dealId } = useParams<{ dealId: string }>();
  const navigate = useNavigate();
  
  const {
    deal,
    activities,
    files,
    changelog,
    isLoading,
    error,
    updateDeal,
    addActivity,
    togglePinActivity,
    pinnedActivities,
    recentActivities,
    changesSummary,
  } = useDealData(dealId);

  const {
    addNote,
    logCall,
    sendEmail,
    scheduleMeeting,
    uploadFile,
    createTask,
    isLoading: actionsLoading,
  } = useDealActions(dealId || '');

  const [activeTab, setActiveTab] = useState('focus');
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);

  // Deal stages configuration
  const dealStages = [
    { id: 'lead', name: 'Lead', color: 'blue', probability: 10 },
    { id: 'qualified', name: 'Qualified', color: 'green', probability: 25 },
    { id: 'proposal', name: 'Proposal', color: 'orange', probability: 50 },
    { id: 'negotiation', name: 'Negotiation', color: 'purple', probability: 75 },
    { id: 'closed_won', name: 'Closed Won', color: 'green', probability: 100 },
    { id: 'closed_lost', name: 'Closed Lost', color: 'red', probability: 0 }
  ];

  const getCurrentStage = () => {
    return dealStages.find(stage => stage.id === deal?.stage);
  };

  const getStageProgress = () => {
    if (!deal) return 0;
    const currentStageIndex = dealStages.findIndex(stage => stage.id === deal.stage);
    return ((currentStageIndex + 1) / (dealStages.length - 1)) * 100;
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type: string) => {
    const icons = {
      note: PinIcon,
      call: Phone,
      email: Mail,
      meeting: Calendar,
      task: CheckCircle,
      stage_change: TrendingUp,
      value_change: DollarSign,
      file_upload: Paperclip,
    };
    return icons[type as keyof typeof icons] || Activity;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'blue';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const handleStageChange = async (newStage: string) => {
    if (!deal) return;
    
    const oldStage = deal.stage;
    const result = await updateDeal({ stage: newStage });
    
    if (result) {
      // Add stage change activity
      await addActivity({
        type: 'stage_change',
        title: 'Stage Updated',
        description: `Deal moved from ${dealStages.find(s => s.id === oldStage)?.name} to ${dealStages.find(s => s.id === newStage)?.name}`,
        metadata: { old_stage: oldStage, new_stage: newStage },
      });
      setShowStageModal(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    const result = await addNote({
      content: newNote,
      is_private: false,
    });
    
    if (result) {
      setNewNote('');
      setIsAddingNote(false);
    }
  };

  const tabs = [
    { key: 'focus', label: 'Focus', icon: Target },
    { key: 'history', label: 'History', icon: History },
    { key: 'quote-to-invoice', label: 'Quote → Invoice', icon: Receipt },
    { key: 'files', label: 'Files', icon: Paperclip }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  if (isLoading) {
    return (
      <BrandBackground>
        <BrandPageLayout title="Deal Details" subtitle="Loading...">
          <div className="flex items-center justify-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
            />
          </div>
        </BrandPageLayout>
      </BrandBackground>
    );
  }

  if (error || !deal) {
    return (
      <BrandBackground>
        <BrandPageLayout title="Deal Details" subtitle="Error loading deal">
          <BrandCard>
            <div className="p-6 text-center">
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Deal Not Found</h3>
              <p className="text-white/70 mb-6">{error || 'The requested deal could not be loaded.'}</p>
              <BrandButton variant="secondary" onClick={() => navigate('/deals')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Deals
              </BrandButton>
            </div>
          </BrandCard>
        </BrandPageLayout>
      </BrandBackground>
    );
  }

  const currentStage = getCurrentStage();

  return (
    <BrandBackground>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <BrandPageLayout
          title={deal.title}
          subtitle={`${formatCurrency(deal.value)} • ${currentStage?.name} • ${deal.probability}% probability`}
          actions={
            <div className="flex items-center space-x-3">
              <BrandButton variant="secondary" onClick={() => navigate('/deals')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Deals
              </BrandButton>
              <BrandButton variant="secondary">
                <Edit className="w-4 h-4 mr-2" />
                Edit Deal
              </BrandButton>
              <BrandButton variant="green">
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark Won
              </BrandButton>
              <BrandButton variant="red">
                <X className="w-4 h-4 mr-2" />
                Mark Lost
              </BrandButton>
            </div>
          }
        >
          {/* Animated Deal Progress */}
          <motion.div variants={cardVariants}>
            <BrandCard className="mb-6">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Deal Progress</h3>
                  <div className="flex items-center space-x-3">
                    <BrandBadge variant={getPriorityColor(deal.priority)}>
                      {deal.priority} priority
                    </BrandBadge>
                    <BrandButton size="sm" variant="secondary" onClick={() => setShowStageModal(true)}>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Update Stage
                    </BrandButton>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    {dealStages.slice(0, -1).map((stage, index) => {
                      const isCompleted = dealStages.findIndex(s => s.id === deal.stage) > index;
                      const isCurrent = stage.id === deal.stage;
                      
                      return (
                        <motion.div 
                          key={stage.id} 
                          className="flex flex-col items-center flex-1"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <motion.button
                            onClick={() => handleStageChange(stage.id)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                              isCurrent
                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                                : isCompleted
                                ? 'bg-green-500 text-white'
                                : 'bg-white/10 text-white/50 hover:bg-white/20'
                            }`}
                            disabled={actionsLoading}
                            animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            {isCompleted ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              index + 1
                            )}
                          </motion.button>
                          <span className={`text-xs mt-1 ${
                            isCurrent ? 'text-white font-medium' : 'text-white/70'
                          }`}>
                            {stage.name}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                  
                  <div className="relative mt-4">
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${getStageProgress()}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </BrandCard>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={cardVariants}>
            <AnimatedQuickActions
              dealId={deal.id}
              onAddNote={() => setIsAddingNote(true)}
              onCreateQuote={() => setActiveTab('quote-to-invoice')}
              onScheduleMeeting={() => console.log('Schedule meeting')}
              onSendEmail={() => console.log('Send email')}
              onCreateTask={() => console.log('Create task')}
              className="mb-6"
            />
          </motion.div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar */}
            <motion.div variants={cardVariants} className="space-y-6">
              {/* Deal Summary */}
              <BrandCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Deal Summary</h3>
                  
                  <div className="space-y-4">
                    <motion.div 
                      className="flex items-center space-x-3"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <DollarSign className="w-5 h-5 text-green-400" />
                      <div>
                        <div className="text-white font-medium">{formatCurrency(deal.value)}</div>
                        <div className="text-white/70 text-sm">Deal Value</div>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="flex items-center space-x-3"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Target className="w-5 h-5 text-blue-400" />
                      <div>
                        <div className="text-white font-medium">{deal.probability}%</div>
                        <div className="text-white/70 text-sm">Win Probability</div>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="flex items-center space-x-3"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Calendar className="w-5 h-5 text-orange-400" />
                      <div>
                        <div className="text-white font-medium">{formatDate(deal.expected_close_date)}</div>
                        <div className="text-white/70 text-sm">Expected Close</div>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="flex items-center space-x-3"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Clock className="w-5 h-5 text-purple-400" />
                      <div>
                        <div className="text-white font-medium">
                          {Math.ceil((new Date(deal.expected_close_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                        </div>
                        <div className="text-white/70 text-sm">Days to Close</div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </BrandCard>

              {/* Contact & Organization */}
              <BrandCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Key Contacts</h3>
                  
                  {/* Primary Contact */}
                  {deal.contact && (
                    <motion.div 
                      className="p-3 rounded-xl bg-white/5 mb-4"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium">{deal.contact.name}</div>
                          <div className="text-white/70 text-sm">{deal.contact.title}</div>
                          <div className="flex items-center space-x-4 mt-1">
                            <motion.a 
                              href={`mailto:${deal.contact.email}`} 
                              className="text-blue-400 hover:text-blue-300"
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Mail className="w-4 h-4" />
                            </motion.a>
                            {deal.contact.phone && (
                              <motion.a 
                                href={`tel:${deal.contact.phone}`} 
                                className="text-green-400 hover:text-green-300"
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Phone className="w-4 h-4" />
                              </motion.a>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Organization */}
                  {deal.organization && (
                    <motion.div 
                      className="p-3 rounded-xl bg-white/5"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium">{deal.organization.name}</div>
                          <div className="text-white/70 text-sm">{deal.organization.industry}</div>
                          <div className="text-white/70 text-sm">{deal.organization.size} employees</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </BrandCard>

              {/* Quick Stats */}
              <BrandCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded-xl bg-blue-500/10">
                      <Activity className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                      <div className="text-white font-bold">{activities.length}</div>
                      <div className="text-white/70 text-xs">Activities</div>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-green-500/10">
                      <Paperclip className="w-6 h-6 text-green-400 mx-auto mb-2" />
                      <div className="text-white font-bold">{files.length}</div>
                      <div className="text-white/70 text-xs">Files</div>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-purple-500/10">
                      <Pin className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                      <div className="text-white font-bold">{pinnedActivities.length}</div>
                      <div className="text-white/70 text-xs">Pinned</div>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-orange-500/10">
                      <BarChart3 className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                      <div className="text-white font-bold">{changesSummary.length}</div>
                      <div className="text-white/70 text-xs">Changes</div>
                    </div>
                  </div>
                </div>
              </BrandCard>
            </motion.div>

            {/* Main Content */}
            <motion.div variants={cardVariants} className="lg:col-span-2 space-y-6">
              {/* Tab Navigation */}
              <BrandCard>
                <div className="p-6">
                  <div className="flex space-x-1 bg-white/5 rounded-xl p-1">
                    {tabs.map((tab) => (
                      <motion.button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                          activeTab === tab.key
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <tab.icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </BrandCard>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeTab === 'focus' && (
                    <div className="space-y-4">
                      {/* Pinned Items */}
                      <BrandCard>
                        <div className="p-6">
                          <h3 className="text-lg font-semibold text-white mb-4">Pinned Items</h3>
                          {pinnedActivities.length > 0 ? (
                            <div className="space-y-3">
                              {pinnedActivities.map((item) => {
                                const ActivityIcon = getActivityIcon(item.type);
                                return (
                                  <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20"
                                  >
                                    <div className="flex items-start space-x-3">
                                      <div className="p-1 rounded bg-yellow-500/20">
                                        <ActivityIcon className="w-4 h-4 text-yellow-400" />
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="font-medium text-white text-sm">{item.title}</h4>
                                        <p className="text-white/70 text-xs">{item.description}</p>
                                      </div>
                                      <motion.button 
                                        className="text-yellow-400 hover:text-yellow-300"
                                        onClick={() => togglePinActivity(item.id)}
                                        whileHover={{ scale: 1.2 }}
                                        whileTap={{ scale: 0.9 }}
                                      >
                                        <X className="w-4 h-4" />
                                      </motion.button>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <Pin className="w-12 h-12 text-white/30 mx-auto mb-3" />
                              <p className="text-white/70">No pinned items. Pin important activities to keep them visible.</p>
                            </div>
                          )}
                        </div>
                      </BrandCard>

                      {/* Recent Activities */}
                      <BrandCard>
                        <div className="p-6">
                          <h3 className="text-lg font-semibold text-white mb-4">Recent Activities</h3>
                          <div className="space-y-3">
                            {recentActivities.map((activity) => {
                              const ActivityIcon = getActivityIcon(activity.type);
                              return (
                                <motion.div
                                  key={activity.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className="flex items-start space-x-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                  <div className="p-1 rounded bg-blue-500/20">
                                    <ActivityIcon className="w-4 h-4 text-blue-400" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-medium text-white text-sm">{activity.title}</h4>
                                    <p className="text-white/70 text-xs">{formatDateTime(activity.created_at)}</p>
                                  </div>
                                  <motion.button 
                                    className="text-white/50 hover:text-yellow-400"
                                    onClick={() => togglePinActivity(activity.id)}
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Pin className="w-4 h-4" />
                                  </motion.button>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      </BrandCard>
                    </div>
                  )}

                  {activeTab === 'history' && (
                    <div className="space-y-4">
                      <BrandCard>
                        <div className="p-6">
                          <h3 className="text-lg font-semibold text-white mb-4">Deal History</h3>
                          <div className="space-y-3">
                            {activities.map((activity) => {
                              const ActivityIcon = getActivityIcon(activity.type);
                              return (
                                <motion.div
                                  key={activity.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="flex items-start space-x-4 p-4 rounded-xl bg-white/5"
                                >
                                  <div className="p-2 rounded-lg bg-blue-500/20">
                                    <ActivityIcon className="w-5 h-5 text-blue-400" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                      <h4 className="font-medium text-white">{activity.title}</h4>
                                      <span className="text-xs text-white/50">{formatDateTime(activity.created_at)}</span>
                                    </div>
                                    <p className="text-white/80 text-sm">{activity.description}</p>
                                    <p className="text-white/50 text-xs mt-2">by {activity.created_by}</p>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      </BrandCard>
                    </div>
                  )}

                  {activeTab === 'quote-to-invoice' && (
                    <QuoteToInvoicePanel dealId={deal.id} />
                  )}

                  {activeTab === 'files' && (
                    <BrandCard>
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Files & Documents</h3>
                        {files.length > 0 ? (
                          <div className="space-y-3">
                            {files.map((file) => (
                              <motion.div
                                key={file.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center justify-between p-4 rounded-xl bg-white/5"
                              >
                                <div className="flex items-center space-x-4">
                                  <div className="p-2 rounded-lg bg-purple-500/20">
                                    <Paperclip className="w-5 h-5 text-purple-400" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-white">{file.name}</h4>
                                    <p className="text-white/70 text-sm">
                                      {(file.size / 1024 / 1024).toFixed(2)} MB • {formatDate(file.uploaded_at)}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <BrandButton size="sm" variant="secondary">
                                    <Eye className="w-4 h-4" />
                                  </BrandButton>
                                  <BrandButton size="sm" variant="secondary">
                                    <Download className="w-4 h-4" />
                                  </BrandButton>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Paperclip className="w-16 h-16 text-white/30 mx-auto mb-4" />
                            <h4 className="text-xl font-semibold text-white mb-2">No Files</h4>
                            <p className="text-white/70 mb-6">Upload files related to this deal.</p>
                            <BrandButton variant="primary">
                              <Plus className="w-4 h-4 mr-2" />
                              Upload First File
                            </BrandButton>
                          </div>
                        )}
                      </div>
                    </BrandCard>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </BrandPageLayout>
      </motion.div>
    </BrandBackground>
  );
};

export default EnhancedDealDetail;

