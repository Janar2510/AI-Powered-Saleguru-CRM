const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  console.log('🚀 Saleguru Social Media Integration Setup\n');
  console.log('This script will help you configure the social media integration.\n');

  const envPath = path.join(__dirname, '.env');
  
  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    const overwrite = await question('⚠️  .env file already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      rl.close();
      return;
    }
  }

  console.log('\n📝 Please provide the following information:\n');

  // Twitter API
  console.log('🐦 Twitter API Configuration:');
  console.log('1. Go to https://developer.twitter.com/en/portal/dashboard');
  console.log('2. Create a new app or use an existing one');
  console.log('3. Generate a Bearer Token (OAuth 2.0)');
  console.log('4. Copy the token below\n');
  
  const twitterToken = await question('Twitter Bearer Token: ');
  
  // Supabase
  console.log('\n🗄️  Supabase Configuration:');
  console.log('1. Go to your Supabase project dashboard');
  console.log('2. Navigate to Settings > API');
  console.log('3. Copy the Project URL and Service Role Key\n');
  
  const supabaseUrl = await question('Supabase Project URL: ');
  const supabaseKey = await question('Supabase Service Role Key: ');
  
  // Slack (Optional)
  console.log('\n💬 Slack Integration (Optional):');
  console.log('1. Go to https://your-workspace.slack.com/apps/A0F7XDUAZ-incoming-webhooks');
  console.log('2. Create a new webhook');
  console.log('3. Copy the webhook URL (or press Enter to skip)\n');
  
  const slackWebhook = await question('Slack Webhook URL (optional): ');
  
  // Search Query
  console.log('\n🔍 Search Configuration:');
  console.log('Customize the search query for your brand/product\n');
  
  const searchQuery = await question('Search Query (e.g., "YourProduct OR @YourCompany"): ') || 'YourProduct OR @YourCompany OR #YourHashtag';

  // Create .env file
  const envContent = `# Twitter API Configuration
TWITTER_BEARER_TOKEN=${twitterToken}

# Supabase Configuration
SUPABASE_URL=${supabaseUrl}
SUPABASE_SERVICE_KEY=${supabaseKey}

# Slack Integration (Optional)
${slackWebhook ? `SLACK_WEBHOOK_URL=${slackWebhook}` : '# SLACK_WEBHOOK_URL='}

# Search Configuration
TWITTER_SEARCH_QUERY=${searchQuery}

# Debug Mode (Optional)
DEBUG=false
`;

  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ Configuration saved to .env file!');
  console.log('\n📋 Next steps:');
  console.log('1. Run the database migration in your Supabase dashboard');
  console.log('2. Test the connection: node test-connection.js');
  console.log('3. Run the Twitter fetch script: npm run fetch-twitter');
  console.log('\n📚 For more information, see README.md');
  
  rl.close();
}

setup().catch(console.error); 