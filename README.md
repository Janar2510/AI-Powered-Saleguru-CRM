# AI-Powered SaleGuru CRM

A modern, AI-powered CRM system built with React, TypeScript, and Supabase. Features include contact management, deal tracking, automation workflows, and AI-powered insights.

## 🚀 Features

- **Contact & Company Management** - Comprehensive contact and company profiles with enrichment
- **Deal Pipeline** - Visual kanban board for deal tracking
- **AI-Powered Insights** - GPT-powered analytics and recommendations
- **Automation Workflows** - Custom automation rules and triggers
- **Email Integration** - Email templates and tracking
- **Task Management** - Task creation and tracking
- **Analytics Dashboard** - Performance metrics and visualizations
- **Lead Scoring** - AI-powered lead qualification
- **Calendar Integration** - Event scheduling and management

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **AI**: OpenAI GPT-4
- **Charts**: D3.js
- **UI Components**: Lucide React Icons
- **State Management**: React Query, Context API

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AI-Powered-Saleguru-CRM
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your credentials
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🗄️ Database Setup

### Required Tables

The application requires the following Supabase tables:

1. **contacts** - Contact information
2. **companies** - Company information  
3. **deals** - Deal/pipeline management
4. **tasks** - Task management
5. **leads** - Lead management
6. **enrichment_status** - Enrichment status tracking
7. **enrichment_data** - Enriched data storage

### Supabase Edge Functions

Deploy the required Edge Functions:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy all functions
supabase functions deploy
```

Required functions:
- `enrich-lead` - Contact and company enrichment
- `openai-proxy` - OpenAI API proxy
- `send-email` - Email sending
- `execute-automation` - Automation execution
- `create-deal-folder` - Deal folder creation

## 🚀 Deployment

### Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Configure environment variables in Vercel dashboard**

### Netlify

1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables

### Docker

```bash
# Build and run
docker-compose up -d

# Development mode
docker-compose --profile dev up -d
```

### Traditional Hosting

```bash
# Build for production
npm run build

# Upload dist folder to your web server
```

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
npm run clean        # Clean build directory
```

### Project Structure

```
src/
├── components/      # React components
│   ├── ai/         # AI-related components
│   ├── analytics/  # Analytics and charts
│   ├── automation/ # Automation components
│   ├── calendar/   # Calendar components
│   ├── companies/  # Company management
│   ├── contacts/   # Contact management
│   ├── dashboard/  # Dashboard widgets
│   ├── deals/      # Deal management
│   ├── emails/     # Email components
│   ├── enrichment/ # Data enrichment
│   ├── layout/     # Layout components
│   ├── leads/      # Lead management
│   ├── settings/   # Settings components
│   ├── tasks/      # Task management
│   └── ui/         # Reusable UI components
├── contexts/       # React contexts
├── hooks/          # Custom React hooks
├── pages/          # Page components
├── services/       # API services
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

## 🔐 Environment Variables

### Client-Side (Vite)
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

### Server-Side (Supabase Edge Functions)
- `OPENAI_API_KEY` - OpenAI API key
- `SENDGRID_API_KEY` - SendGrid API key (optional)
- `SENDGRID_FROM_EMAIL` - Verified sender email (optional)
- `GOOGLE_SERVICE_ACCOUNT_KEY` - Google service account JSON (optional)
- `GOOGLE_DRIVE_PARENT_FOLDER_ID` - Google Drive folder ID (optional)

## 🎨 Customization

### Styling
The application uses Tailwind CSS for styling. Customize the design system in `tailwind.config.js`.

### Components
All components are modular and can be easily customized or extended.

### AI Features
Modify AI prompts and behavior in the `src/services/openaiService.ts` file.

## 🔍 Troubleshooting

### Common Issues

1. **Environment variables not loading**
   - Ensure variables are prefixed with `VITE_`
   - Restart the development server

2. **Supabase connection issues**
   - Verify URL and API key
   - Check CORS settings in Supabase

3. **Build failures**
   - Clear node_modules and reinstall
   - Check TypeScript errors

### Getting Help

- Check the [Deployment Guide](DEPLOYMENT.md) for detailed deployment instructions
- Review Supabase documentation
- Check browser console for errors

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the troubleshooting guide

---

Built with ❤️ using React, TypeScript, and Supabase