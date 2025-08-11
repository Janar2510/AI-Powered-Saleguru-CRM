const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Test Supabase connection
async function testConnection() {
  console.log('🔧 Testing Supabase connection...');
  
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in your .env file');
    return;
  }
  
  console.log('✅ Supabase URL:', SUPABASE_URL);
  console.log('✅ Supabase Service Key:', SUPABASE_SERVICE_KEY ? '***' + SUPABASE_SERVICE_KEY.slice(-4) : 'Not set');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  try {
    // Test connection by querying the contacts table
    const { data, error } = await supabase
      .from('contacts')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return;
    }
    
    console.log('✅ Supabase connection successful!');
    console.log('✅ Contacts table accessible');
    
    // Test if social_mentions table exists
    const { data: mentions, error: mentionsError } = await supabase
      .from('social_mentions')
      .select('count')
      .limit(1);
    
    if (mentionsError) {
      console.log('⚠️  social_mentions table not found - you need to run the migration');
      console.log('Run this SQL in your Supabase dashboard:');
      console.log(`
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
      `);
    } else {
      console.log('✅ social_mentions table exists and is accessible');
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

// Test Twitter API configuration
function testTwitterConfig() {
  console.log('\n🐦 Testing Twitter API configuration...');
  
  const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
  const SEARCH_QUERY = process.env.TWITTER_SEARCH_QUERY;
  
  if (!BEARER_TOKEN) {
    console.error('❌ TWITTER_BEARER_TOKEN not set');
    console.log('Please get your Bearer Token from the Twitter Developer Portal');
  } else {
    console.log('✅ Twitter Bearer Token:', '***' + BEARER_TOKEN.slice(-4));
  }
  
  if (!SEARCH_QUERY) {
    console.log('⚠️  TWITTER_SEARCH_QUERY not set, will use default');
  } else {
    console.log('✅ Search Query:', SEARCH_QUERY);
  }
}

// Test Slack configuration
function testSlackConfig() {
  console.log('\n💬 Testing Slack configuration...');
  
  const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
  
  if (!SLACK_WEBHOOK_URL) {
    console.log('⚠️  SLACK_WEBHOOK_URL not set - Slack notifications will be disabled');
  } else {
    console.log('✅ Slack Webhook URL configured');
  }
}

// Run all tests
async function runTests() {
  console.log('🧪 Running connection tests...\n');
  
  await testConnection();
  testTwitterConfig();
  testSlackConfig();
  
  console.log('\n🎉 Test completed!');
}

if (require.main === module) {
  runTests()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('💥 Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testConnection, testTwitterConfig, testSlackConfig }; 