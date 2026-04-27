# Deployment Guide

This guide covers deploying the Pokemon Dashboard to Vercel.

## Prerequisites

- [Vercel CLI](https://vercel.com/docs/cli) installed: `npm i -g vercel`
- Vercel account (free tier works)
- Bun installed: `npm i -g bun`

## Environment Setup

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Link Project (First Time Only)

```bash
cd pokemon-dashboard-app
vercel link
```

Select your team/project or create a new one.

## Pre-Deployment Checklist

Before deploying, ensure:

1. **pokemon.db exists in public/**

   ```bash
   ls -la pokemon-dashboard-app/public/pokemon.db
   ```

2. **Build passes locally**

   ```bash
   just build
   # or
   cd pokemon-dashboard-app && bun run build
   ```

3. **All data is fresh** (optional)
   ```bash
   just data  # Re-run pipeline, transform, export
   ```

## Configuration

The deployment uses these configuration files:

- **vercel.json** - Build settings, caching, headers
- **.vercelignore** - Files excluded from deployment
- **next.config.ts** - Static export configuration

### Key Settings

- **Build Command**: `bun run build`
- **Output Directory**: `dist/`
- **Install Command**: `bun install`
- **Framework**: Next.js (static export)

## Post-Deployment Verification

1. **Check deployment URL**
   - Vercel will output the production URL
   - Format: `https://your-project.vercel.app`

2. **Verify pokemon.db loads**
   - Visit `https://your-project.vercel.app/pokemon.db`
   - Should download the SQLite database file

3. **Test dashboard functionality**
   - Load the main page
   - Check Pokemon list loads
   - Test search/filter features
   - Verify charts render

## Troubleshooting

### Build Failures

**Error: "Cannot find module"**

```bash
# Clean and reinstall
cd pokemon-dashboard-app
rm -rf node_modules bun.lockb
bun install
```

**Error: "Build failed"**

```bash
# Check build locally first
cd pokemon-dashboard-app
bun run build
# Fix any TypeScript errors
```

### Deployment Stuck

```bash
# Cancel and retry
vercel --prod --force
```

## Performance Tips

1. **Cache Headers**: pokemon.db has 1-hour cache in vercel.json
2. **Static Assets**: ".next/static/" has 1-year immutable cache
3. **Database Size**: pokemon.db is ~4MB - ensure it deploys fully

## Rollback

If deployment fails:

```bash
# List deployments
vercel list

# Rollback to previous
vercel rollback
```

Or use the [Vercel Dashboard](https://vercel.com/dashboard) → Deployments → Promote.

## Custom Domain

To use a custom domain:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Settings → Domains
4. Add your domain and follow DNS instructions

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
