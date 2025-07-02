# Export Guide - AI-Powered SaleGuru CRM

This guide shows you how to export your project for different deployment methods.

## 🚀 Quick Export Methods

### Method 1: Using the Export Scripts (Recommended)

#### On macOS/Linux:
```bash
./export-project.sh
```

#### On Windows:
```cmd
export-project.bat
```

### Method 2: Manual Export

## 📦 Manual Export Steps

### 1. Create Production Build

```bash
# Install dependencies (if not already installed)
npm install

# Create production build
npm run build
```

This creates a `dist` folder with your optimized production files.

### 2. Export for Different Platforms

#### A. Vercel Deployment

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Or deploy from existing project:**
   ```bash
   vercel --prod
   ```

#### B. Netlify Deployment

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy:**
   ```bash
   netlify deploy --prod --dir=dist
   ```

#### C. Docker Deployment

1. **Build Docker image:**
   ```bash
   docker build -t saleguru-crm:latest .
   ```

2. **Run container:**
   ```bash
   docker run -p 80:80 saleguru-crm:latest
   ```

3. **Using Docker Compose:**
   ```bash
   docker-compose up -d
   ```

#### D. Traditional Web Server

1. **Upload the `dist` folder** to your web server
2. **Configure your web server** to serve the SPA:
   - All routes should serve `index.html`
   - Configure proper caching headers

#### E. Static File Hosting (AWS S3, Google Cloud Storage, etc.)

1. **Upload the `dist` folder** to your cloud storage
2. **Configure static website hosting**
3. **Set up proper redirects** for SPA routing

## 📁 What Gets Exported

### Production Build (`dist` folder)
- Optimized HTML, CSS, and JavaScript files
- Minified and compressed assets
- Static assets (images, fonts, etc.)

### Configuration Files
- `package.json` - Dependencies and scripts
- `vercel.json` - Vercel configuration
- `netlify.toml` - Netlify configuration
- `Dockerfile` - Docker configuration
- `docker-compose.yml` - Docker Compose configuration
- `nginx.conf` - Nginx configuration

### Documentation
- `README.md` - Project documentation
- `DEPLOYMENT.md` - Deployment guide
- `DEPLOYMENT_CHECKLIST.md` - Production checklist
- `.env.example` - Environment variables template

## 🔧 Pre-Export Checklist

Before exporting, ensure:

- [ ] All TypeScript errors are resolved
- [ ] ESLint passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Environment variables are configured
- [ ] Supabase project is set up
- [ ] Edge Functions are deployed

## 🌐 Deployment Platforms

### Vercel (Recommended for beginners)
- **Pros:** Easy setup, automatic deployments, good performance
- **Cons:** Limited server-side functionality
- **Best for:** Frontend applications, static sites

### Netlify
- **Pros:** Easy setup, form handling, serverless functions
- **Cons:** Limited database integration
- **Best for:** Static sites, simple applications

### Docker
- **Pros:** Consistent environment, portable, scalable
- **Cons:** More complex setup, requires Docker knowledge
- **Best for:** Production deployments, microservices

### Traditional Hosting
- **Pros:** Full control, custom configurations
- **Cons:** Manual setup, server management
- **Best for:** Custom requirements, existing infrastructure

## 🔐 Environment Variables

### Required for All Deployments
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Edge Functions (Server-side)
```env
OPENAI_API_KEY=your_openai_api_key
SENDGRID_API_KEY=your_sendgrid_api_key (optional)
SENDGRID_FROM_EMAIL=your_email@example.com (optional)
```

## 📋 Post-Export Steps

1. **Configure environment variables** in your deployment platform
2. **Set up your domain** (if applicable)
3. **Configure SSL certificates**
4. **Set up monitoring and analytics**
5. **Test all functionality** in the deployed environment
6. **Follow the deployment checklist**

## 🚨 Common Issues

### Build Fails
- Check TypeScript errors: `npm run type-check`
- Check ESLint errors: `npm run lint`
- Ensure all dependencies are installed: `npm install`

### Environment Variables Not Loading
- Ensure variables are prefixed with `VITE_`
- Restart the development server
- Check deployment platform configuration

### Supabase Connection Issues
- Verify URL and API key
- Check CORS settings in Supabase
- Ensure Edge Functions are deployed

### Docker Build Fails
- Check Dockerfile syntax
- Ensure all required files are present
- Check Docker daemon is running

## 📞 Getting Help

If you encounter issues:

1. Check the browser console for errors
2. Review the deployment logs
3. Check the [Deployment Guide](DEPLOYMENT.md)
4. Review the [Deployment Checklist](DEPLOYMENT_CHECKLIST.md)
5. Check Supabase documentation
6. Create an issue in the repository

## 🎯 Next Steps

After successful export:

1. **Deploy to your chosen platform**
2. **Configure environment variables**
3. **Set up monitoring**
4. **Test all features**
5. **Go live!**

---

**Remember:** Always test your deployment in a staging environment before going to production! 