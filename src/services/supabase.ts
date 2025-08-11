import { createClient } from '@supabase/supabase-js';

// Debug environment variables
console.log('🔧 Supabase Configuration:');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing');

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bsgqtbiyhqwzwzzsadkg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzZ3F0Yml5aHF3end6enNhZGtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MjAwMDUsImV4cCI6MjA2NTI5NjAwNX0.BGgcuf_9WT01NyG3BlRGHd79d6VO8k1I_EFG9EZjOk8';

console.log('🔧 Using Supabase URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Database types
export interface Profile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  is_owner?: boolean;
  trial_ends_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  lead_score?: number;
  status: 'lead' | 'prospect' | 'customer';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  user_id: string;
  contact_id: string;
  title: string;
  value: number;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number;
  expected_close_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  contact_id?: string;
  deal_id?: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}
