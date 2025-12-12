# Vercel Deployment Checklist

Use this checklist to ensure a smooth deployment.

## Pre-Deployment

### Database Setup
- [ ] Created Neon PostgreSQL project
- [ ] Created shadow database for migrations
- [ ] Copied `DATABASE_URL` connection string
- [ ] Copied `SHADOW_DATABASE_URL` connection string
- [ ] Verified connection strings include `?sslmode=require`
- [ ] Tested database connection locally

### API Keys & Secrets
- [ ] Obtained Mistral AI API key from [console.mistral.ai](https://console.mistral.ai)
- [ ] Generated strong JWT secrets (32+ characters each)
- [ ] Set up AWS S3 bucket (or alternative storage)
- [ ] Created AWS IAM user with S3 permissions
- [ ] Obtained AWS access keys
- [ ] Set up OCR provider (optional)

### Code Preparation
- [ ] Code pushed to GitHub repository
- [ ] `.env` file added to `.gitignore`
- [ ] `.vercelignore` configured
- [ ] `vercel.json` configured
- [ ] `next.config.ts` optimized
- [ ] Build command includes `prisma generate`
- [ ] All dependencies installed

## Vercel Configuration

### Project Setup
- [ ] Created Vercel account
- [ ] Imported GitHub repository
- [ ] Framework preset: Next.js
- [ ] Root directory: `./`
- [ ] Build command: `npm run build`
- [ ] Output directory: `.next`

### Environment Variables
Add all these in Vercel Dashboard → Settings → Environment Variables:

- [ ] `DATABASE_URL` (Production, Preview, Development)
- [ ] `SHADOW_DATABASE_URL` (Production, Preview, Development)
- [ ] `JWT_ACCESS_SECRET` (Production, Preview, Development)
- [ ] `JWT_REFRESH_SECRET` (Production, Preview, Development)
- [ ] `MISTRAL_API_KEY` (Production, Preview, Development)
- [ ] `MISTRAL_MODEL` (optional, Production only)
- [ ] `STORAGE_BUCKET` (Production, Preview, Development)
- [ ] `STORAGE_REGION` (Production, Preview, Development)
- [ ] `STORAGE_ACCESS_KEY` (Production, Preview, Development)
- [ ] `STORAGE_SECRET_KEY` (Production, Preview, Development)
- [ ] `OCR_PROVIDER_API_KEY` (optional)
- [ ] `OCR_PROVIDER_BASE_URL` (optional)

### Function Configuration
- [ ] Function region selected (closest to database)
- [ ] Max duration: 60 seconds
- [ ] Memory: 1024 MB
- [ ] Runtime: Node.js (not Edge)

## Post-Deployment

### Database Initialization
- [ ] Ran Prisma migrations: `npx prisma migrate deploy`
- [ ] Verified tables created successfully
- [ ] Populated initial syllabus data (optional): `npm run populate:syllabus`

### Testing
- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Admin panel accessible
- [ ] Course/subject creation works
- [ ] Syllabus bulk import works
- [ ] Question generation works
- [ ] Mock exam creation works
- [ ] Scorecard displays correctly
- [ ] File uploads work (if implemented)

### Monitoring
- [ ] Vercel Analytics enabled (optional)
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Database monitoring active (Neon dashboard)
- [ ] API usage monitoring (Mistral dashboard)
- [ ] Storage monitoring (AWS dashboard)

## Security Checklist

- [ ] All secrets stored in environment variables (not in code)
- [ ] JWT secrets are strong and random
- [ ] Database credentials secure
- [ ] API keys not exposed in client-side code
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Rate limiting considered for AI endpoints
- [ ] Input validation on all API routes

## Performance Optimization

- [ ] Database indexes created (Prisma handles this)
- [ ] Image optimization enabled
- [ ] API routes optimized
- [ ] Caching strategy implemented
- [ ] CDN enabled (automatic on Vercel)

## Documentation

- [ ] Team members have access to Vercel dashboard
- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] Rollback procedure documented
- [ ] Support contacts documented

---

## Quick Commands Reference

```bash
# Deploy to Vercel
vercel --prod

# View logs
vercel logs

# Pull environment variables
vercel env pull .env.production

# Run migrations
npx prisma migrate deploy

# Populate syllabus
npm run populate:syllabus

# Check deployment status
vercel ls
```

---

**Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete

---

*Print this checklist and check off items as you complete them.*
