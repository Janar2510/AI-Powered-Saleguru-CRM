// Deployment configuration for various platforms
export default {
  // Vercel configuration
  vercel: {
    buildCommand: 'npm run build',
    outputDirectory: 'dist',
    installCommand: 'npm install',
    framework: 'vite',
    functions: {
      'supabase/functions/**/*.ts': {
        runtime: 'nodejs18.x',
      },
    },
  },

  // Netlify configuration
  netlify: {
    buildCommand: 'npm run build',
    publishDirectory: 'dist',
    functionsDirectory: 'supabase/functions',
    redirects: [
      {
        from: '/*',
        to: '/index.html',
        status: 200,
      },
    ],
    headers: [
      {
        for: '/assets/*',
        values: {
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      },
    ],
  },

  // Docker configuration
  docker: {
    baseImage: 'node:18-alpine',
    buildArgs: {
      NODE_ENV: 'production',
    },
    ports: ['4173'],
    volumes: ['./dist:/app/dist'],
  },

  // Environment variables for deployment
  env: {
    production: {
      NODE_ENV: 'production',
      VITE_SUPABASE_URL: '${SUPABASE_URL}',
      VITE_SUPABASE_ANON_KEY: '${SUPABASE_ANON_KEY}',
    },
    staging: {
      NODE_ENV: 'staging',
      VITE_SUPABASE_URL: '${STAGING_SUPABASE_URL}',
      VITE_SUPABASE_ANON_KEY: '${STAGING_SUPABASE_ANON_KEY}',
    },
  },
}; 