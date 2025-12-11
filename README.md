## AI Exam Platform (Next.js + Neon + Prisma)

 AI-powered multi-course practice and mock exam system:
- Students: endless unique MCQ/SAQ/Long/handwritten sets, AI grading, analytics.
- Admins: manage course → semester → subject → syllabus, define mock exam patterns, publish AI-generated fixed exams, view analytics.
- Backend: Next.js App Router API + Prisma + Neon PostgreSQL, JWT auth (access + refresh), Mistral AI for generation/evaluation, OCR hook for handwritten answers, storage hook for uploads.

### Stack
- Next.js (App Router, TypeScript, Tailwind)
- Neon PostgreSQL + Prisma
- JWT auth with bcrypt
- Mistral AI (`@mistralai/mistralai`) for question gen + grading
- OCR provider hook (configure your service: Textract/Vision/etc.)
- Storage hook for uploads (S3/UploadThing/Supabase)

### Project layout
- `src/app/api/*` — API routes for auth, CRUD, practice, mock exams, analytics, OCR.
- `src/lib/*` — Prisma client, auth helpers, validation (zod), AI prompts/wrappers, OCR/storage stubs.
- `prisma/schema.prisma` — data model for users, courses, syllabus, mock exams, attempts.
- `env.example` — required environment variables.

### Setup
1) Install deps  
```bash
npm install
```

2) Copy envs  
```bash
cp env.example .env
```
Fill in Neon connection URLs, JWT secrets, `MISTRAL_API_KEY` (and optional `MISTRAL_MODEL`), OCR + storage keys.

3) Prisma  
```bash
npm run prisma:generate
npm run prisma:push  # creates tables in Neon
```

4) Dev server  
```bash
npm run dev
```
Visit http://localhost:3000.

### Key API routes (summary)
- `POST /api/auth/register|login|refresh` — JWT auth.
- `GET/POST/PATCH/DELETE /api/courses|semesters|subjects|syllabus` — admin CRUD.
- `POST /api/mock-exams` (create pattern), `PUT /api/mock-exams` (publish AI-fixed set), `GET /api/mock-exams`.
- `POST /api/practice/generate` — AI question sets per subject/type.
- `POST /api/practice/grade` — MCQ auto-grade or Mistral AI evaluation for SAQ/LA.
- `POST /api/practice/ocr` — OCR → Mistral AI evaluation for handwritten answers.
- `POST/GET /api/attempts` — store attempts and feedback.
- `GET /api/analytics` — student or admin analytics.

### Deployment

**Quick Start:** See [QUICK_START.md](./QUICK_START.md) for 5-minute deployment guide.

**Full Guide:** See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment instructions.

**Key Points:**
- Deploy to Vercel with Neon PostgreSQL
- Set `MISTRAL_API_KEY` environment variable (get one at https://console.mistral.ai)
- Configure AWS S3 for file storage (or use alternative provider)
- Database migrations run automatically via `postinstall` script
- AI routes configured for Node.js runtime (60s timeout, 1024MB memory)

### Environment Variables

Required environment variables (see `env.example`):
- `DATABASE_URL` - Neon PostgreSQL connection string
- `SHADOW_DATABASE_URL` - Shadow database for Prisma migrations
- `JWT_ACCESS_SECRET` - JWT access token secret (32+ chars)
- `JWT_REFRESH_SECRET` - JWT refresh token secret (32+ chars)
- `MISTRAL_API_KEY` - Mistral AI API key
- `MISTRAL_MODEL` - Optional, defaults to "mistral-large-latest"
- `STORAGE_BUCKET`, `STORAGE_REGION`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY` - AWS S3 credentials
- `OCR_PROVIDER_API_KEY`, `OCR_PROVIDER_BASE_URL` - Optional, for handwritten answer OCR
# QGenix
# QGenix
