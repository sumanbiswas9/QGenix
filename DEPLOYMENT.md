# Deployment Guide: AI Exam Platform on Vercel

Complete step-by-step guide to deploy the AI Exam Platform on Vercel with Neon PostgreSQL.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup (Neon PostgreSQL)](#database-setup-neon-postgresql)
3. [Environment Variables](#environment-variables)
4. [Vercel Deployment](#vercel-deployment)
5. [Post-Deployment Configuration](#post-deployment-configuration)
6. [Troubleshooting](#troubleshooting)
7. [Production Checklist](#production-checklist)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ GitHub account
- ✅ Vercel account (sign up at [vercel.com](https://vercel.com))
- ✅ Neon account (sign up at [neon.tech](https://neon.tech))
- ✅ Mistral AI API key ([console.mistral.ai](https://console.mistral.ai))
- ✅ AWS account (for S3 storage) OR alternative storage provider
- ✅ OCR provider account (optional, for handwritten answers)

---

## Database Setup (Neon PostgreSQL)

### Step 1: Create Neon Database

1. Go to [Neon Console](https://console.neon.tech)
2. Click **"Create Project"**
3. Fill in:
   - **Project Name**: `exam-platform-prod`
   - **Region**: Choose closest to your users
   - **PostgreSQL Version**: 15 or 16
4. Click **"Create Project"**

### Step 2: Get Connection Strings

After creating the project:

1. Go to **"Connection Details"** tab
2. Copy the **Connection String** (looks like: `postgresql://user:password@host/dbname?sslmode=require`)
3. Save this as your `DATABASE_URL`

### Step 3: Create Shadow Database (for Prisma Migrations)

1. In Neon Console, create a **second database** in the same project
2. Name it: `exam-platform-shadow`
3. Copy its connection string as `SHADOW_DATABASE_URL`

**Alternative**: Neon automatically creates a shadow database if you enable branch creation, but it's safer to create one manually.

### Step 4: Run Prisma Migrations

```bash
# Set environment variables locally
export DATABASE_URL="your-neon-connection-string"
export SHADOW_DATABASE_URL="your-shadow-db-connection-string"

# Generate Prisma Client
npm run prisma:generate

# Push schema to database
npm run prisma:push
```

**Note**: For production, use Prisma migrations instead of `prisma:push`:

```bash
# Create migration
npx prisma migrate dev --name init

# Apply migrations
npx prisma migrate deploy
```

---

## Environment Variables

### Required Environment Variables

Create a `.env` file locally and add these to Vercel:

#### Database
```bash
DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"
SHADOW_DATABASE_URL="postgresql://user:password@host.neon.tech/shadow_db?sslmode=require"
```

#### Authentication
```bash
JWT_ACCESS_SECRET="generate-a-random-secret-min-32-chars"
JWT_REFRESH_SECRET="generate-another-random-secret-min-32-chars"
```

**Generate secrets:**
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### AI Service (Mistral)
```bash
MISTRAL_API_KEY="your-mistral-api-key"
MISTRAL_MODEL="mistral-large-latest"  # Optional, defaults to mistral-large-latest
```

**Get Mistral API Key:**
1. Go to [Mistral AI Console](https://console.mistral.ai)
2. Sign up/Login
3. Navigate to **API Keys**
4. Create new API key
5. Copy and save securely

#### Storage (AWS S3)
```bash
STORAGE_BUCKET="your-s3-bucket-name"
STORAGE_REGION="us-east-1"  # Your S3 bucket region
STORAGE_ACCESS_KEY="your-aws-access-key-id"
STORAGE_SECRET_KEY="your-aws-secret-access-key"
```

**Setup AWS S3:**
1. Go to [AWS Console](https://console.aws.amazon.com)
2. Create S3 bucket
3. Create IAM user with S3 permissions
4. Generate access keys

#### OCR (Optional)
```bash
OCR_PROVIDER_API_KEY="your-ocr-api-key"
OCR_PROVIDER_BASE_URL="https://your-ocr-endpoint.com/api"
```

---

## Vercel Deployment

### Step 1: Prepare Your Repository

1. **Push code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/exam-platform.git
   git push -u origin main
   ```

2. **Ensure `.gitignore` includes:**
   ```
   .env
   .env.local
   .env.production
   node_modules
   .next
   .vercel
   ```

### Step 2: Deploy to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install`

5. **Add Environment Variables:**
   - Click **"Environment Variables"**
   - Add all variables from [Environment Variables](#environment-variables) section
   - Set scope: **Production**, **Preview**, **Development**

6. Click **"Deploy"**

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: exam-platform
# - Directory: ./
# - Override settings? No

# Set environment variables
vercel env add DATABASE_URL
vercel env add SHADOW_DATABASE_URL
vercel env add JWT_ACCESS_SECRET
vercel env add JWT_REFRESH_SECRET
vercel env add MISTRAL_API_KEY
vercel env add STORAGE_BUCKET
vercel env add STORAGE_REGION
vercel env add STORAGE_ACCESS_KEY
vercel env add STORAGE_SECRET_KEY

# Deploy to production
vercel --prod
```

### Step 3: Configure Build Settings

In Vercel Dashboard → Project Settings → General:

1. **Build & Development Settings:**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

2. **Node.js Version:**
   - Set to **18.x** or **20.x** (recommended)

### Step 4: Configure Runtime Settings

In Vercel Dashboard → Project Settings → Functions:

1. **Function Region**: Choose closest to your database region
2. **Max Duration**: Set to **60s** (for AI API calls)
3. **Memory**: Set to **1024 MB** (for AI processing)

**Important**: AI routes (`/api/practice/*`, `/api/mock-exams`) should use Node.js runtime, not Edge runtime.

---

## Post-Deployment Configuration

### Step 1: Run Database Migrations

After first deployment, run migrations:

```bash
# Using Vercel CLI
vercel env pull .env.production
npx prisma migrate deploy

# Or via Vercel Functions
# Create a one-time migration script
```

**Alternative**: Use Vercel's Post-Deploy Hook:

1. Create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

### Step 2: Populate Initial Data (Optional)

If you want to populate syllabus data:

```bash
# Set production env vars
export DATABASE_URL="your-production-db-url"
export SHADOW_DATABASE_URL="your-shadow-db-url"

# Run population script
npm run populate:syllabus
```

### Step 3: Verify Deployment

1. **Check Build Logs:**
   - Go to Vercel Dashboard → Deployments
   - Click on latest deployment
   - Review build logs for errors

2. **Test Application:**
   - Visit your Vercel URL: `https://your-project.vercel.app`
   - Test registration/login
   - Test question generation
   - Check API routes

3. **Monitor Logs:**
   - Vercel Dashboard → Functions → View logs
   - Check for runtime errors

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors

**Error**: `P1001: Can't reach database server`

**Solutions:**
- Verify `DATABASE_URL` includes `?sslmode=require`
- Check Neon IP allowlist (should allow all IPs for serverless)
- Verify database is running in Neon console
- Check connection string format

#### 2. Prisma Client Not Found

**Error**: `@prisma/client did not initialize yet`

**Solutions:**
- Add `prisma:generate` to build command:
  ```json
  {
    "scripts": {
      "build": "prisma generate && next build"
    }
  }
  ```
- Or add to `package.json`:
  ```json
  {
    "scripts": {
      "postinstall": "prisma generate"
    }
  }
  ```

#### 3. AI API Errors

**Error**: `MISTRAL_API_KEY missing`

**Solutions:**
- Verify environment variable is set in Vercel
- Check variable name spelling (case-sensitive)
- Redeploy after adding env vars
- Check API key validity in Mistral console

#### 4. Build Failures

**Error**: Build timeout or memory issues

**Solutions:**
- Increase build timeout in Vercel settings
- Optimize dependencies (remove unused packages)
- Check for large files in repository
- Use `.vercelignore` to exclude unnecessary files

#### 5. Function Timeout

**Error**: Function execution timeout

**Solutions:**
- Increase function timeout (max 60s on Hobby plan)
- Optimize AI API calls (reduce retries)
- Consider upgrading to Pro plan for longer timeouts
- Implement request queuing for long operations

#### 6. CORS Errors

**Error**: CORS policy blocking requests

**Solutions:**
- Vercel handles CORS automatically for API routes
- If using custom domain, verify DNS settings
- Check `next.config.ts` for CORS configuration

---

## Production Checklist

### Pre-Deployment

- [ ] All environment variables set in Vercel
- [ ] Database migrations tested locally
- [ ] Prisma schema synced with database
- [ ] API keys validated and working
- [ ] Storage (S3) configured and accessible
- [ ] Error logging configured (optional: Sentry)
- [ ] Domain configured (if using custom domain)

### Security

- [ ] Strong JWT secrets (32+ characters, random)
- [ ] Database credentials secure (not in code)
- [ ] API keys stored in environment variables only
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Rate limiting considered (for AI endpoints)
- [ ] Input validation on all API routes

### Performance

- [ ] Database indexes created (Prisma handles this)
- [ ] Image optimization enabled (Next.js default)
- [ ] API routes optimized (no unnecessary processing)
- [ ] Caching strategy considered
- [ ] CDN enabled (automatic on Vercel)

### Monitoring

- [ ] Vercel Analytics enabled (optional)
- [ ] Error tracking setup (Sentry/LogRocket)
- [ ] Database monitoring (Neon dashboard)
- [ ] API usage monitoring (Mistral dashboard)
- [ ] Storage usage monitoring (AWS dashboard)

### Post-Deployment

- [ ] Test all critical user flows
- [ ] Verify question generation works
- [ ] Test mock exam creation
- [ ] Verify scorecard displays correctly
- [ ] Test file uploads (if implemented)
- [ ] Check error pages (404, 500)
- [ ] Verify email functionality (if added)

---

## Advanced Configuration

### Custom Domain

1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add your domain
3. Configure DNS records as shown
4. Wait for DNS propagation (up to 48 hours)

### Environment-Specific Configs

Create separate environments:

```bash
# Development
vercel env add DATABASE_URL development

# Preview (staging)
vercel env add DATABASE_URL preview

# Production
vercel env add DATABASE_URL production
```

### Database Migrations in Production

**Option 1: Manual Migration**
```bash
vercel env pull .env.production
npx prisma migrate deploy
```

**Option 2: Automated via GitHub Actions**

Create `.github/workflows/migrate.yml`:
```yaml
name: Database Migration
on:
  push:
    branches: [main]
jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### Optimizing Build Times

1. **Use Build Cache:**
   - Vercel caches `node_modules` automatically
   - Cache Prisma Client generation

2. **Reduce Dependencies:**
   - Remove unused packages
   - Use `npm ci` instead of `npm install`

3. **Optimize Images:**
   - Use Next.js Image component
   - Enable image optimization

---

## Cost Estimation

### Vercel Pricing

- **Hobby Plan (Free)**:
  - 100GB bandwidth/month
  - Unlimited deployments
  - 100 serverless function executions/day
  - Suitable for: Testing, small projects

- **Pro Plan ($20/month)**:
  - 1TB bandwidth/month
  - Unlimited function executions
  - Longer function timeouts (up to 300s)
  - Suitable for: Production apps

### Neon PostgreSQL

- **Free Tier**:
  - 0.5 GB storage
  - Shared CPU
  - Suitable for: Development, small projects

- **Launch Plan ($19/month)**:
  - 10 GB storage
  - Dedicated CPU
  - Suitable for: Production apps

### Mistral AI

- Pay-per-use pricing
- Check [Mistral Pricing](https://mistral.ai/pricing/)
- Estimate: $0.10-1.00 per 1000 questions generated

### AWS S3

- Pay-per-use pricing
- First 5 GB free
- Estimate: $0.023 per GB/month

---

## Support & Resources

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Neon Documentation**: [neon.tech/docs](https://neon.tech/docs)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **Prisma Documentation**: [prisma.io/docs](https://www.prisma.io/docs)
- **Mistral AI Docs**: [docs.mistral.ai](https://docs.mistral.ai)

---

## Quick Deploy Commands

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp env.example .env
# Edit .env with your values

# 3. Generate Prisma Client
npm run prisma:generate

# 4. Push database schema
npm run prisma:push

# 5. Deploy to Vercel
vercel --prod

# 6. Set environment variables in Vercel dashboard
# 7. Redeploy to apply env vars
vercel --prod
```

---

## Post-Deployment Verification

Run these checks after deployment:

```bash
# 1. Check deployment status
vercel ls

# 2. View logs
vercel logs

# 3. Test API endpoint
curl https://your-project.vercel.app/api/health

# 4. Check database connection
# (Test via admin panel login)
```

---

**Need Help?** Check the [Troubleshooting](#troubleshooting) section or open an issue on GitHub.

---

*Last Updated: 2024*
