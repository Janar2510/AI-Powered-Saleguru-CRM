# Social Media Integration Scripts

This directory contains scripts for integrating social media platforms with the Saleguru CRM.

## Setup

### 1. Install Dependencies

```bash
cd scripts
npm install
```

### 2. Environment Variables

Create a `.env` file in the `scripts` directory with the following variables:

```env
# Twitter API (Required)
TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here

# Supabase (Required)
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key

# Slack Integration (Optional)
SLACK_WEBHOOK_URL=your_slack_webhook_url

# Search Configuration (Optional)
TWITTER_SEARCH_QUERY=YourProduct OR @YourCompany OR #YourHashtag
```

### 3. Twitter API Setup

1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new app or use an existing one
3. Generate a Bearer Token (OAuth 2.0)
4. Add the token to your `.env` file

### 4. Supabase Setup

1. Run the migration to create the `social_mentions` table:
   ```bash
   supabase db push
   ```

2. Ensure your Supabase service role key has the necessary permissions

### 5. Slack Setup (Optional)

1. Create a Slack app in your workspace
2. Add an Incoming Webhook integration
3. Copy the webhook URL to your `.env` file

## Usage

### Fetch Twitter Mentions

```bash
npm run fetch-twitter
```

This script will:
- Search Twitter for mentions of your configured keywords
- Store new mentions in the `social_mentions` table
- Try to match authors to existing contacts
- Send Slack notifications for new mentions (if configured)

### Manual Execution

```bash
node fetchTwitterMentions.js
```

## Configuration

### Search Query

Customize the search query in your `.env` file:

```env
TWITTER_SEARCH_QUERY=YourProduct OR @YourCompany OR #YourHashtag OR "your product name"
```

### Scheduling

To run this automatically, you can:

1. **Cron Job (Linux/Mac):**
   ```bash
   # Run every 15 minutes
   */15 * * * * cd /path/to/your/project/scripts && npm run fetch-twitter
   ```

2. **GitHub Actions:**
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

3. **Vercel Cron Jobs:**
   Create `vercel.json`:
   ```json
   {
     "crons": [{
       "path": "/api/fetch-twitter-mentions",
       "schedule": "*/15 * * * *"
     }]
   }
   ```

## Database Schema

The `social_mentions` table structure:

```sql
CREATE TABLE social_mentions (
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
```

## Extending to Other Platforms

To add support for other social media platforms:

1. Create a new script (e.g., `fetchLinkedInPosts.js`)
2. Follow the same pattern as the Twitter script
3. Use the same `social_mentions` table structure
4. Update the `source` field to identify the platform

## Troubleshooting

### Common Issues

1. **Twitter API Rate Limits:**
   - Twitter API v2 has rate limits
   - The script handles this gracefully
   - Consider implementing exponential backoff for production

2. **Supabase Connection Issues:**
   - Verify your Supabase URL and service key
   - Ensure the `social_mentions` table exists
   - Check RLS policies if applicable

3. **Slack Notifications Not Working:**
   - Verify your webhook URL is correct
   - Check Slack app permissions
   - Ensure the webhook is active

### Debug Mode

Add debug logging by setting:

```env
DEBUG=true
```

This will provide more detailed console output.

## Security Notes

- Never commit your `.env` file to version control
- Use environment variables for all sensitive data
- Regularly rotate your API keys
- Monitor your API usage to stay within limits 