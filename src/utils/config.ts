// Environment configuration utility
export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;

// Validate required environment variables
export const validateEnvironment = (): void => {
  const requiredVars = [
    { name: 'VITE_SUPABASE_URL', value: config.supabase.url },
    { name: 'VITE_SUPABASE_ANON_KEY', value: config.supabase.anonKey },
  ];

  const missingVars = requiredVars.filter(({ value }) => !value);

  if (missingVars.length > 0) {
    const missingVarNames = missingVars.map(({ name }) => name).join(', ');
    throw new Error(
      `Missing required environment variables: ${missingVarNames}. Please check your .env file.`
    );
  }
};

// Check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return !!(config.supabase.url && config.supabase.anonKey);
};

// Get environment-specific configuration
export const getEnvironmentConfig = () => {
  return {
    ...config,
    api: {
      baseUrl: config.isDevelopment ? 'http://localhost:54321' : config.supabase.url,
      timeout: config.isDevelopment ? 10000 : 5000,
    },
    features: {
      enableDebugLogging: config.isDevelopment,
      enableErrorReporting: config.isProduction,
      enableAnalytics: config.isProduction,
    },
  };
}; 