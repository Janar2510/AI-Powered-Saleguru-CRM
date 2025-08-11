const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

// Search query - customize these keywords for your brand
const SEARCH_QUERY = process.env.TWITTER_SEARCH_QUERY || 'YourProduct OR @YourCompany OR #YourHashtag';

if (!BEARER_TOKEN) {
  console.error('❌ TWITTER_BEARER_TOKEN environment variable is required');
  process.exit(1);
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables are required');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Twitter API v2 endpoint for recent search
const TWITTER_API_URL = 'https://api.twitter.com/2/tweets/search/recent';

async function fetchTwitterMentions() {
  try {
    console.log('🔍 Fetching Twitter mentions...');
    
    const query = encodeURIComponent(SEARCH_QUERY);
    const url = `${TWITTER_API_URL}?query=${query}&tweet.fields=author_id,created_at,text,id&max_results=100`;
    
    const response = await axios.get(url, {
      headers: { 
        'Authorization': `Bearer ${BEARER_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const tweets = response.data.data || [];
    
    if (tweets.length === 0) {
      console.log('📭 No new mentions found.');
      return;
    }

    console.log(`📥 Found ${tweets.length} mentions to process...`);

    // Process each tweet
    for (const tweet of tweets) {
      await processTweet(tweet);
    }

    console.log('✅ Twitter mentions processing completed!');

  } catch (error) {
    console.error('❌ Error fetching Twitter mentions:', error.response?.data || error.message);
  }
}

async function processTweet(tweet) {
  try {
    // Check if mention already exists
    const { data: existingMention } = await supabase
      .from('social_mentions')
      .select('id')
      .eq('mention_id', tweet.id)
      .eq('source', 'twitter')
      .maybeSingle();

    if (existingMention) {
      console.log(`⏭️  Mention ${tweet.id} already exists, skipping...`);
      return;
    }

    // Try to match author to a contact by twitter_handle
    let contact_id = null;
    const { data: contact } = await supabase
      .from('contacts')
      .select('id')
      .eq('twitter_handle', tweet.author_id)
      .maybeSingle();

    if (contact) {
      contact_id = contact.id;
      console.log(`👤 Matched tweet author ${tweet.author_id} to contact ${contact_id}`);
    }

    // Prepare mention data
    const mentionData = {
      source: 'twitter',
      mention_id: tweet.id,
      author: tweet.author_id,
      content: tweet.text,
      mention_time: tweet.created_at,
      contact_id,
      url: `https://twitter.com/i/web/status/${tweet.id}`,
      sentiment: null // Will be filled by AI analysis later
    };

    // Insert into Supabase
    const { error } = await supabase
      .from('social_mentions')
      .insert([mentionData]);

    if (error) {
      console.error(`❌ Error storing mention ${tweet.id}:`, error);
      return;
    }

    console.log(`✅ Stored mention ${tweet.id} from ${tweet.author_id}`);

    // Send Slack notification for new mentions
    if (SLACK_WEBHOOK_URL) {
      await sendSlackNotification(mentionData);
    }

  } catch (error) {
    console.error(`❌ Error processing tweet ${tweet.id}:`, error);
  }
}

async function sendSlackNotification(mentionData) {
  try {
    const message = {
      text: `🐦 New Twitter mention detected!`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*New Twitter Mention*\n\n*Author:* @${mentionData.author}\n*Content:* ${mentionData.content.substring(0, 200)}${mentionData.content.length > 200 ? '...' : ''}\n*Time:* ${new Date(mentionData.mention_time).toLocaleString()}\n*URL:* ${mentionData.url}`
          }
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "View Tweet"
              },
              url: mentionData.url,
              style: "primary"
            }
          ]
        }
      ]
    };

    await axios.post(SLACK_WEBHOOK_URL, message);
    console.log(`📢 Slack notification sent for mention ${mentionData.mention_id}`);

  } catch (error) {
    console.error('❌ Error sending Slack notification:', error);
  }
}

// Run the script
if (require.main === module) {
  fetchTwitterMentions()
    .then(() => {
      console.log('🎉 Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { fetchTwitterMentions, processTweet }; 