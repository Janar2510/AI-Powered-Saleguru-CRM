# Social Media Integration Setup Guide

This guide will help you set up the social media integration feature for your Saleguru CRM.

## 🚀 Quick Start

### 1. Database Setup

Since the Supabase CLI is having SSL issues, run this SQL manually in your Supabase dashboard:

```sql
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
```

### 2. Script Setup

```bash
cd scripts
npm install
npm run setup
```

Follow the interactive prompts to configure your API keys.

### 3. Test Configuration

```bash
npm run test-connection
```

### 4. Run Twitter Fetch

```bash
npm run fetch-twitter
```

## 🔧 Manual Configuration

If you prefer to configure manually, create a `.env` file in the `scripts` directory:

```env
# Twitter API Configuration
TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_role_key_here

# Slack Integration (Optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Search Configuration
TWITTER_SEARCH_QUERY=YourProduct OR @YourCompany OR #YourHashtag

# Debug Mode (Optional)
DEBUG=false
```

## 🐦 Twitter API Setup

1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new app or use an existing one
3. Navigate to "Keys and Tokens"
4. Generate a Bearer Token (OAuth 2.0)
5. Copy the token to your `.env` file

## 🗄️ Supabase Configuration

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the Project URL
4. Copy the Service Role Key (not the anon key)
5. Add both to your `.env` file

## 💬 Slack Integration (Optional)

1. Go to your Slack workspace
2. Navigate to Apps > Incoming Webhooks
3. Create a new webhook
4. Copy the webhook URL to your `.env` file

## 📊 What's Included

### Database Schema
- `social_mentions` table for storing mentions
- Social media fields added to `contacts` table
- Indexes for optimal performance
- Automatic timestamp updates

### Scripts
- `fetchTwitterMentions.js` - Main Twitter fetching script
- `test-connection.js` - Test your configuration
- `setup.js` - Interactive setup wizard

### Supabase Edge Function
- `social-mentions` function for API endpoints
- RESTful API for fetching mentions
- Statistics and filtering capabilities

### TypeScript Types
- Complete type definitions for social mentions
- Integration with existing CRM types

## 🔄 Automation

### Cron Job (Linux/Mac)
```bash
# Run every 15 minutes
*/15 * * * * cd /path/to/your/project/scripts && npm run fetch-twitter
```

### GitHub Actions
Create `.github/workflows/social-mentions.yml`:
```yaml
name: Fetch Social Mentions
on:
  schedule:
    - cron: '*/15 * * * *'
jobs:
  fetch-mentions:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd scripts && npm install
      - run: cd scripts && npm run fetch-twitter
        env:
          TWITTER_BEARER_TOKEN: ${{ secrets.TWITTER_BEARER_TOKEN }}
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
```

## 🎯 Features

- **Real-time Mention Tracking**: Automatically fetch and store social mentions
- **Contact Matching**: Link mentions to existing contacts
- **Slack Notifications**: Get notified of new mentions in Slack
- **Sentiment Analysis**: Ready for future AI-powered sentiment analysis
- **Multi-platform Support**: Extensible to LinkedIn, Facebook, etc.
- **API Endpoints**: RESTful API for frontend integration

## 🔮 Next Steps

1. **UI Integration**: Add social feed components to contact/company pages
2. **Sentiment Analysis**: Integrate AI for automatic sentiment detection
3. **Multi-platform**: Add support for LinkedIn, Facebook, Instagram
4. **Lead Generation**: Auto-create leads from social mentions
5. **Analytics**: Social media performance dashboards

## 🛠️ Troubleshooting

### Common Issues

1. **Twitter API Rate Limits**
   - Twitter API v2 has rate limits
   - Script handles this gracefully
   - Consider implementing exponential backoff

2. **Supabase Connection Issues**
   - Verify your Supabase URL and service key
   - Ensure the `social_mentions` table exists
   - Check RLS policies if applicable

3. **Slack Notifications Not Working**
   - Verify your webhook URL is correct
   - Check Slack app permissions
   - Ensure the webhook is active

### Debug Mode

Add `DEBUG=true` to your `.env` file for detailed logging.

## 📚 API Reference

### Supabase Edge Function Endpoints

- `GET /social-mentions` - Fetch mentions with filters
- `GET /social-mentions/stats` - Get mention statistics
- `GET /social-mentions/contact-mentions?contact_id=xxx` - Get mentions for a contact
- `POST /social-mentions/process-mention` - Process a new mention
- `POST /social-mentions/link-contact` - Link mentions to a contact

### Query Parameters

- `limit` - Number of mentions to return (default: 50)
- `source` - Filter by platform (twitter, linkedin, etc.)
- `sentiment` - Filter by sentiment (positive, negative, neutral)
- `contact_id` - Filter by contact
- `date_from` - Filter by start date
- `date_to` - Filter by end date

## 🎉 Success!

Once configured, your CRM will automatically:
- Fetch Twitter mentions every time you run the script
- Store them in your Supabase database
- Match authors to existing contacts
- Send Slack notifications for new mentions
- Provide API endpoints for frontend integration

The foundation is now ready for the UI components and additional social platforms! 