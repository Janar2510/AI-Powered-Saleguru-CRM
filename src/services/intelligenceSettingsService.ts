// Intelligence Hub Settings Service
// Handles storage and management of user preferences for AI transcription and analysis

interface IntelligenceSettings {
  // AI Configuration
  transcriptionLanguage: string;
  analysisModel: 'gpt-4' | 'gpt-3.5-turbo' | 'claude';
  confidenceThreshold: number;
  realTimeProcessing: boolean;
  speakerIdentification: boolean;
  sentimentAnalysis: boolean;
  
  // Privacy & Security
  dataRetention: number; // days
  encryptionLevel: 'aes256' | 'aes128';
  shareAnonymizedInsights: boolean;
  teamAccessToSummaries: boolean;
  gdprCompliance: boolean;
  
  // CRM Integration
  autoLinkContacts: boolean;
  autoLinkDeals: boolean;
  autoCreateContacts: boolean;
  createActionItemsAutomatically: boolean;
  updateDealProbabilities: boolean;
  sendTeamNotifications: boolean;
  
  // Notifications
  emailNotifications: {
    transcriptionComplete: boolean;
    negativeSentimentDetected: boolean;
    highPriorityActionItems: boolean;
  };
  inAppNotifications: {
    realTimeAnalysisUpdates: boolean;
    weeklyAnalyticsSummary: boolean;
  };
  
  // Storage & Performance
  audioQuality: 'high' | 'medium' | 'low';
  storageLocation: 'cloud' | 'local' | 'hybrid';
  processingPriority: 'realtime' | 'fast' | 'standard' | 'batch';
  cacheDuration: number; // hours
}

const DEFAULT_SETTINGS: IntelligenceSettings = {
  // AI Configuration
  transcriptionLanguage: 'en',
  analysisModel: 'gpt-4',
  confidenceThreshold: 70,
  realTimeProcessing: true,
  speakerIdentification: true,
  sentimentAnalysis: true,
  
  // Privacy & Security
  dataRetention: 90,
  encryptionLevel: 'aes256',
  shareAnonymizedInsights: false,
  teamAccessToSummaries: true,
  gdprCompliance: false,
  
  // CRM Integration
  autoLinkContacts: true,
  autoLinkDeals: true,
  autoCreateContacts: false,
  createActionItemsAutomatically: true,
  updateDealProbabilities: false,
  sendTeamNotifications: false,
  
  // Notifications
  emailNotifications: {
    transcriptionComplete: true,
    negativeSentimentDetected: false,
    highPriorityActionItems: false,
  },
  inAppNotifications: {
    realTimeAnalysisUpdates: true,
    weeklyAnalyticsSummary: true,
  },
  
  // Storage & Performance
  audioQuality: 'high',
  storageLocation: 'cloud',
  processingPriority: 'realtime',
  cacheDuration: 24,
};

class IntelligenceSettingsService {
  private static readonly STORAGE_KEY = 'intelligence_hub_settings';
  private settings: IntelligenceSettings;
  private listeners: Set<(settings: IntelligenceSettings) => void> = new Set();

  constructor() {
    this.settings = this.loadSettings();
  }

  /**
   * Get current settings
   */
  getSettings(): IntelligenceSettings {
    return { ...this.settings };
  }

  /**
   * Update specific setting
   */
  updateSetting<K extends keyof IntelligenceSettings>(
    key: K,
    value: IntelligenceSettings[K]
  ): void {
    this.settings = {
      ...this.settings,
      [key]: value,
    };
    this.saveSettings();
    this.notifyListeners();
  }

  /**
   * Update multiple settings at once
   */
  updateSettings(updates: Partial<IntelligenceSettings>): void {
    this.settings = {
      ...this.settings,
      ...updates,
    };
    this.saveSettings();
    this.notifyListeners();
  }

  /**
   * Reset to default settings
   */
  resetToDefaults(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    this.saveSettings();
    this.notifyListeners();
  }

  /**
   * Export settings as JSON
   */
  exportSettings(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  /**
   * Import settings from JSON
   */
  importSettings(jsonSettings: string): boolean {
    try {
      const imported = JSON.parse(jsonSettings);
      
      // Validate imported settings
      if (this.validateSettings(imported)) {
        this.settings = { ...DEFAULT_SETTINGS, ...imported };
        this.saveSettings();
        this.notifyListeners();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  }

  /**
   * Subscribe to settings changes
   */
  subscribe(listener: (settings: IntelligenceSettings) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get settings for AI transcription service
   */
  getTranscriptionConfig() {
    return {
      language: this.settings.transcriptionLanguage,
      model: this.getWhisperModel(),
      realTime: this.settings.realTimeProcessing,
      speakerDiarization: this.settings.speakerIdentification,
      confidenceThreshold: this.settings.confidenceThreshold / 100,
    };
  }

  /**
   * Get settings for AI analysis service
   */
  getAnalysisConfig() {
    return {
      model: this.settings.analysisModel,
      sentimentAnalysis: this.settings.sentimentAnalysis,
      confidenceThreshold: this.settings.confidenceThreshold / 100,
      language: this.settings.transcriptionLanguage,
    };
  }

  /**
   * Get settings for CRM integration
   */
  getCRMIntegrationConfig() {
    return {
      autoLinkContacts: this.settings.autoLinkContacts,
      autoLinkDeals: this.settings.autoLinkDeals,
      autoCreateContacts: this.settings.autoCreateContacts,
      autoCreateActionItems: this.settings.createActionItemsAutomatically,
      autoUpdateDealProbability: this.settings.updateDealProbabilities,
      autoNotifyTeam: this.settings.sendTeamNotifications,
      minimumConfidence: this.settings.confidenceThreshold / 100,
    };
  }

  /**
   * Get audio recording configuration
   */
  getAudioConfig() {
    const qualityMap = {
      high: { sampleRate: 44100, bitrate: 128 },
      medium: { sampleRate: 22050, bitrate: 96 },
      low: { sampleRate: 16000, bitrate: 64 },
    };

    return {
      ...qualityMap[this.settings.audioQuality],
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    };
  }

  /**
   * Check if feature is enabled
   */
  isFeatureEnabled(feature: keyof IntelligenceSettings): boolean {
    const value = this.settings[feature];
    return typeof value === 'boolean' ? value : false;
  }

  /**
   * Get notification preferences
   */
  getNotificationPreferences() {
    return {
      email: this.settings.emailNotifications,
      inApp: this.settings.inAppNotifications,
    };
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings(): IntelligenceSettings {
    try {
      const stored = localStorage.getItem(IntelligenceSettingsService.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    return { ...DEFAULT_SETTINGS };
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    try {
      localStorage.setItem(
        IntelligenceSettingsService.STORAGE_KEY,
        JSON.stringify(this.settings)
      );
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  /**
   * Notify all listeners of settings changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getSettings());
      } catch (error) {
        console.error('Settings listener error:', error);
      }
    });
  }

  /**
   * Validate imported settings
   */
  private validateSettings(settings: any): boolean {
    if (!settings || typeof settings !== 'object') return false;

    // Basic validation - check that critical fields exist and have correct types
    const requiredStringFields = ['transcriptionLanguage', 'analysisModel'];
    const requiredNumberFields = ['confidenceThreshold', 'dataRetention'];
    const requiredBooleanFields = ['realTimeProcessing', 'sentimentAnalysis'];

    for (const field of requiredStringFields) {
      if (settings[field] && typeof settings[field] !== 'string') return false;
    }

    for (const field of requiredNumberFields) {
      if (settings[field] && typeof settings[field] !== 'number') return false;
    }

    for (const field of requiredBooleanFields) {
      if (settings[field] && typeof settings[field] !== 'boolean') return false;
    }

    return true;
  }

  /**
   * Get appropriate Whisper model based on settings
   */
  private getWhisperModel(): string {
    // Map analysis model to appropriate Whisper model
    return 'whisper-1'; // OpenAI only has one Whisper model currently
  }

  /**
   * Get privacy compliance settings
   */
  getPrivacySettings() {
    return {
      dataRetention: this.settings.dataRetention,
      encryption: this.settings.encryptionLevel,
      gdprCompliance: this.settings.gdprCompliance,
      shareAnonymized: this.settings.shareAnonymizedInsights,
      teamAccess: this.settings.teamAccessToSummaries,
    };
  }

  /**
   * Check if data retention period has expired for a given date
   */
  isDataExpired(createdAt: Date): boolean {
    const now = new Date();
    const expiryDate = new Date(createdAt);
    expiryDate.setDate(expiryDate.getDate() + this.settings.dataRetention);
    return now > expiryDate;
  }

  /**
   * Get performance settings
   */
  getPerformanceSettings() {
    return {
      audioQuality: this.settings.audioQuality,
      storageLocation: this.settings.storageLocation,
      processingPriority: this.settings.processingPriority,
      cacheDuration: this.settings.cacheDuration,
    };
  }
}

// Singleton instance
export const intelligenceSettingsService = new IntelligenceSettingsService();

// Export types
export type { IntelligenceSettings };

export default IntelligenceSettingsService;

