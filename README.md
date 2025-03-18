# Supabase-Polaris Full-Stack Application

A web application with authentication and CRUD operations built with TypeScript, React, Remix, Shopify Polaris, Supabase, and Tailwind CSS.

## Deployment Guide

### Prerequisites

- GitHub account connected to Vercel
- Supabase project set up with the required schema

### Environment Variables

The following environment variables need to be set in your Vercel project:

```
SUPABASE_URL=https://ynawkrxgvijqxybczteu.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SESSION_SECRET=your-session-secret
```

### Deployment Steps

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Configure the project:
   - Framework Preset: Remix
   - Build Command: `npm run build` (should be auto-detected)
   - Output Directory: `build/client` (should be auto-detected)
   - Environment Variables: Add the ones listed above
5. Click "Deploy"

### Branch Strategy

- **Production**: `main` branch
  - Deploys to your primary domain (e.g., yourdomain.com)
  - Should only contain stable, tested code
  
- **Staging**: `staging` branch
  - Deploys to a preview URL
  - Used for testing before promoting to production
  
- **Development**: Feature branches (e.g., `feature/auth-improvements`)
  - Each gets a unique preview URL
  - Merge to staging when ready for testing

### Automatic Deployments

Vercel automatically deploys:
- When you push to any branch (creates preview deployments)
- When you merge to main (updates production)

You can configure additional settings like:
- Production branch name
- Preview deployment settings
- Build cache behavior

### Monitoring and Rollbacks

- Monitor deployments in the Vercel dashboard
- Use the "View Logs" feature to troubleshoot issues
- Easily roll back to previous deployments if needed

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## Project Structure

- `/app`: Main application code
  - `/components`: Reusable UI components
  - `/routes`: Application routes
  - `/utils`: Utility functions and server-side code
- `/public`: Static assets
- `/supabase`: Database schema and migrations
