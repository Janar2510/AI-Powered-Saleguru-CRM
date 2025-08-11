-- Add points and badges columns to users table for gamification
ALTER TABLE users ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]'; 