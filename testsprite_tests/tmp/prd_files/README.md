# SaleToru CRM

An AI-powered CRM system built with React, TypeScript, and Supabase.

## Environment Setup

1. Copy `.env.example` to `.env`:
   ```
   cp .env.example .env
   ```

2. Update the `.env` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Set up the OpenAI API key in Supabase Edge Functions:
   - Go to your Supabase dashboard
   - Navigate to Edge Functions
   - Add an environment variable named `OPENAI_API_KEY` with your OpenAI API key
   - This keeps your API key secure and never exposed to the client

## Development

```bash
npm install
npm run dev
```

## Deployment

```bash
npm run build
```

## Security Notes

- The OpenAI API key is stored securely on the server side in Supabase Edge Functions
- All OpenAI API calls are proxied through a secure Edge Function
- No API keys are stored or used on the client side