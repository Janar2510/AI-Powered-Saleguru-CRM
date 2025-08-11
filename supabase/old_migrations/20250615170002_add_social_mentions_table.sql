-- Create social_mentions table for storing social media mentions
CREATE TABLE IF NOT EXISTS social_mentions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL, -- 'twitter', 'linkedin', 'facebook', etc.
  mention_id TEXT NOT NULL UNIQUE, -- unique ID from the platform
  author TEXT NOT NULL, -- username or user ID from the platform
  content TEXT NOT NULL, -- the actual post content
  mention_time TIMESTAMPTZ NOT NULL, -- when the mention was posted
  contact_id UUID REFERENCES contacts(id), -- link to contact if found
  url TEXT, -- link to the original post
  sentiment TEXT, -- 'positive', 'negative', 'neutral' (for future AI analysis)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add social media fields to contacts table
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS twitter_handle TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS facebook_url TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS instagram_handle TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_social_mentions_source ON social_mentions(source);
CREATE INDEX IF NOT EXISTS idx_social_mentions_contact_id ON social_mentions(contact_id);
CREATE INDEX IF NOT EXISTS idx_social_mentions_mention_time ON social_mentions(mention_time);
CREATE INDEX IF NOT EXISTS idx_contacts_twitter_handle ON contacts(twitter_handle);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_social_mentions_updated_at 
    BEFORE UPDATE ON social_mentions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 