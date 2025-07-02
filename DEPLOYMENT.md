# Deployment Guide

This guide covers deploying the AI-Powered SaleGuru CRM to various platforms.

## Prerequisites

1. **Node.js 18+** installed on your system
2. **Supabase project** set up with the required tables and functions
3. **Environment variables** configured

## Environment Setup

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Configure your environment variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Set up Supabase Edge Functions environment variables:
   - Go to your Supabase dashboard
   - Navigate to Settings > Edge Functions
   - Add the following environment variables:
     - `OPENAI_API_KEY`
     - `SENDGRID_API_KEY` (optional)
     - `SENDGRID_FROM_EMAIL` (optional)

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment Options

### 1. Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Configure environment variables in Vercel dashboard:**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. **Deploy Supabase Edge Functions:**
   ```bash
   supabase functions deploy
   ```

### 2. Netlify

1. **Connect your repository to Netlify**

2. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Set environment variables in Netlify dashboard**

4. **Deploy Supabase Edge Functions:**
   ```bash
   supabase functions deploy
   ```

### 3. Docker

1. **Build the Docker image:**
   ```bash
   docker build -t saleguru-crm .
   ```

2. **Run the container:**
   ```bash
   docker run -p 80:80 saleguru-crm
   ```

3. **Using Docker Compose:**
   ```bash
   docker-compose up -d
   ```

### 4. Traditional Hosting

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Upload the `dist` folder to your web server**

3. **Configure your web server to serve the SPA:**
   - All routes should serve `index.html`
   - Configure proper caching headers

## Supabase Setup

### Required Tables

The application expects the following tables in your Supabase database:

1. **contacts** - Contact information
2. **companies** - Company information
3. **deals** - Deal/pipeline management
4. **tasks** - Task management
5. **leads** - Lead management
6. **enrichment_status** - Enrichment status tracking
7. **enrichment_data** - Enriched data storage

### Required Edge Functions

Deploy the following Edge Functions:

1. **enrich-lead** - Contact and company enrichment
2. **openai-proxy** - OpenAI API proxy
3. **send-email** - Email sending functionality
4. **execute-automation** - Automation rule execution
5. **create-deal-folder** - Deal folder creation

### Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy enrich-lead
```

## Environment Variables

### Client-Side (Vite)
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### Server-Side (Supabase Edge Functions)
- `OPENAI_API_KEY` - Your OpenAI API key
- `SENDGRID_API_KEY` - SendGrid API key (optional)
- `SENDGRID_FROM_EMAIL` - Verified sender email (optional)
- `GOOGLE_SERVICE_ACCOUNT_KEY` - Google service account JSON (optional)
- `GOOGLE_DRIVE_PARENT_FOLDER_ID` - Google Drive folder ID (optional)

## Security Considerations

1. **Never expose API keys in client-side code**
2. **Use environment variables for sensitive data**
3. **Enable Row Level Security (RLS) in Supabase**
4. **Configure proper CORS settings**
5. **Use HTTPS in production**

## Performance Optimization

1. **Enable gzip compression**
2. **Configure proper caching headers**
3. **Use CDN for static assets**
4. **Optimize images and assets**
5. **Enable Supabase connection pooling**

## Monitoring and Analytics

1. **Set up error tracking (Sentry, LogRocket)**
2. **Configure performance monitoring**
3. **Set up uptime monitoring**
4. **Configure Supabase analytics**

## Troubleshooting

### Common Issues

1. **Environment variables not loading:**
   - Ensure variables are prefixed with `VITE_`
   - Restart the development server

2. **Supabase connection issues:**
   - Verify URL and API key
   - Check CORS settings in Supabase

3. **Build failures:**
   - Clear node_modules and reinstall
   - Check TypeScript errors
   - Verify all dependencies are installed

4. **Edge Function deployment issues:**
   - Check function syntax
   - Verify environment variables
   - Check Supabase CLI version

### Support

For additional support:
1. Check the Supabase documentation
2. Review the application logs
3. Check browser console for errors
4. Verify network connectivity

## Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Supabase tables created
- [ ] Edge Functions deployed
- [ ] Domain configured (if applicable)
- [ ] SSL certificate installed
- [ ] Monitoring configured
- [ ] Backup strategy implemented
- [ ] Performance tested
- [ ] Security audit completed 