/*
  # Create AI logs table for SaleToruGuru

  1. New Tables
    - `ai_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `prompt` (text, required)
      - `response` (text, required)
      - `context` (text, required)
      - `metadata` (jsonb)
      - `timestamp` (timestamp with time zone)
      - `tokens_used` (integer)
      - `model` (text)

  2. Security
    - Enable RLS on `ai_logs` table
    - Add policy for owner access and admin access
    - Create indexes for performance

  3. Functions
    - Create function to log AI interactions
*/

-- Create ai_logs table
CREATE TABLE IF NOT EXISTS ai_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  response text NOT NULL,
  context text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  timestamp timestamptz DEFAULT now(),
  tokens_used integer,
  model text DEFAULT 'gpt-4'
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ai_logs_user_id ON ai_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_timestamp ON ai_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_ai_logs_context ON ai_logs(context);

-- Enable Row Level Security
ALTER TABLE ai_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for owner access
CREATE POLICY "users_can_view_own_ai_logs" ON ai_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy for admin access
CREATE POLICY "admins_can_view_all_ai_logs" ON ai_logs
  FOR SELECT
  USING (has_admin_access());

-- Create function to log AI interactions
CREATE OR REPLACE FUNCTION log_ai_interaction(
  p_user_id uuid,
  p_prompt text,
  p_response text,
  p_context text,
  p_metadata jsonb DEFAULT '{}'::jsonb,
  p_tokens_used integer DEFAULT NULL,
  p_model text DEFAULT 'gpt-4'
)
RETURNS uuid AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO ai_logs (
    user_id, prompt, response, context, metadata, tokens_used, model
  ) VALUES (
    p_user_id, p_prompt, p_response, p_context, p_metadata, p_tokens_used, p_model
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user's daily AI usage
CREATE OR REPLACE FUNCTION get_daily_ai_usage(p_user_id uuid)
RETURNS integer AS $$
DECLARE
  usage_count integer;
BEGIN
  SELECT COUNT(*)
  INTO usage_count
  FROM ai_logs
  WHERE user_id = p_user_id
    AND timestamp >= CURRENT_DATE
    AND timestamp < CURRENT_DATE + INTERVAL '1 day';
    
  RETURN usage_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user has reached their daily limit
CREATE OR REPLACE FUNCTION has_reached_ai_limit(p_user_id uuid, p_limit integer)
RETURNS boolean AS $$
DECLARE
  usage_count integer;
BEGIN
  SELECT get_daily_ai_usage(p_user_id) INTO usage_count;
  RETURN usage_count >= p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;