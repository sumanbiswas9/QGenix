# Quick Start: Deploy to Vercel in 5 Minutes

## Prerequisites Checklist

- [ ] GitHub account
- [ ] Vercel account ([sign up](https://vercel.com))
- [ ] Neon account ([sign up](https://neon.tech))
- [ ] Mistral AI API key ([get one](https://console.mistral.ai))

---

## Step 1: Database Setup (2 minutes)

1. **Create Neon Database:**
   - Go to [Neon Console](https://console.neon.tech)
   - Click "Create Project"
   - Name: `exam-platform`
   - Copy the connection string

2. **Create Shadow Database:**
   - In same project, create another database
   - Name: `exam-platform-shadow`
   - Copy its connection string

---

## Step 2: Push Code to GitHub (1 minute)

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/exam-platform.git
git push -u origin main
```

---

## Step 3: Deploy to Vercel (2 minutes)

1. **Import Project:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository
   - Framework: Next.js (auto-detected)

2. **Add Environment Variables:**
   Click "Environment Variables" and add:

   ```
   DATABASE_URL=your-neon-connection-string?sslmode=require
   SHADOW_DATABASE_URL=your-shadow-db-connection-string?sslmode=require
   JWT_ACCESS_SECRET=generate-random-32-chars
   JWT_REFRESH_SECRET=generate-random-32-chars
   MISTRAL_API_KEY=your-mistral-api-key
   STORAGE_BUCKET=your-s3-bucket
   STORAGE_REGION=us-east-1
   STORAGE_ACCESS_KEY=your-aws-key
   STORAGE_SECRET_KEY=your-aws-secret
   ```

   **Generate secrets:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)

---

## Step 4: Initialize Database (1 minute)

After deployment:

1. **Run migrations:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login
   vercel login
   
   # Pull env vars
   vercel env pull .env.production
   
   # Run migrations
   npx prisma migrate deploy
   ```

2. **Populate syllabus (optional):**
   ```bash
   npm run populate:syllabus
   ```

---

## Step 5: Verify Deployment

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Test registration: `/register`
3. Test login: `/login`
4. Test question generation: `/student/practice`

---

## Troubleshooting

**Build fails?**
- Check build logs in Vercel dashboard
- Ensure all env vars are set
- Verify `DATABASE_URL` includes `?sslmode=require`

**Database connection error?**
- Verify Neon database is running
- Check connection string format
- Ensure IP allowlist allows all (for serverless)

**AI not working?**
- Verify `MISTRAL_API_KEY` is set correctly
- Check Mistral API dashboard for usage/quota
- Review function logs in Vercel

---

## Next Steps

- [ ] Set up custom domain (optional)
- [ ] Configure monitoring (Sentry, etc.)
- [ ] Set up CI/CD (GitHub Actions)
- [ ] Review [Full Deployment Guide](./DEPLOYMENT.md)

---

**Need help?** See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.
