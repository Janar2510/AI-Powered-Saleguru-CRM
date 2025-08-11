import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';

const DatabaseStatus: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        console.log('=== DatabaseStatus: Starting connection check ===');
        console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
        console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing');
        
        // Test basic connection
        console.log('Testing Supabase connection...');
        const { data, error: testError } = await supabase
          .from('user_profiles')
          .select('id')
          .limit(1);
        
        console.log('Supabase response:', { data, error: testError });
        
        if (testError) {
          console.error('❌ Supabase connection test error:', testError);
          setError(testError.message);
          setStatus('error');
        } else {
          console.log('✅ Supabase connection successful:', data);
          setStatus('connected');
          setDetails({
            url: import.meta.env.VITE_SUPABASE_URL,
            hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
            timestamp: new Date().toISOString(),
            userCount: data?.[0]?.count || 0
          });
        }
      } catch (err) {
        console.error('❌ Database status check error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setStatus('error');
      }
    };

    checkConnection();
  }, []);

  if (status === 'checking') {
    return (
      <div className="fixed top-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Checking database connection...</span>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 max-w-md">
        <div className="flex items-center space-x-2">
          <span className="font-semibold">Database Connection Error</span>
        </div>
        <div className="mt-2 text-sm">
          <p>{error}</p>
          <p className="mt-1 text-xs opacity-75">
            URL: {import.meta.env.VITE_SUPABASE_URL || 'Not set'}
          </p>
          <p className="text-xs opacity-75">
            Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-white rounded-full"></div>
        <span>Database Connected</span>
        {details?.userCount !== undefined && (
          <span className="text-xs opacity-75">({details.userCount} users)</span>
        )}
      </div>
    </div>
  );
};

export default DatabaseStatus; 