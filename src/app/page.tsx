export default function Home() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-surface px-8 py-14 shadow-2xl shadow-indigo-500/10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.12),transparent_30%)]" />
      <div className="relative grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6">
          <span className="badge">AI-Powered Exam Platform</span>
          <h1 className="text-4xl font-semibold leading-tight text-foreground lg:text-5xl">
            Practice, mock exams, and AI grading in one clean workspace.
          </h1>
          <p className="text-lg text-muted">
            Generate fresh MCQ, short and long answers, publish AI-built mock exams, and get
            instant feedback with OCR + Mistral AI. Built on Next.js, Prisma, and Neon.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="/register" className="btn-primary w-auto px-5">
              Get started
            </a>
            <a
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-foreground hover:border-primary"
            >
              Sign in
            </a>
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-muted">
            <span className="rounded-full border border-border px-3 py-1">Next.js App Router</span>
            <span className="rounded-full border border-border px-3 py-1">Neon + Prisma</span>
            <span className="rounded-full border border-border px-3 py-1">JWT Auth</span>
            <span className="rounded-full border border-border px-3 py-1">Mistral AI</span>
            <span className="rounded-full border border-border px-3 py-1">OCR-ready</span>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-border bg-surface/60 p-6 shadow-lg">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="surface p-4 shadow-none">
              <p className="text-sm font-semibold text-foreground">Students</p>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                <li>• Course → semester → subject</li>
                <li>• Fresh MCQ/SAQ/LA/handwritten sets</li>
                <li>• AI grading with feedback</li>
                <li>• History & analytics</li>
              </ul>
            </div>
            <div className="surface p-4 shadow-none">
              <p className="text-sm font-semibold text-foreground">Admins</p>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                <li>• Manage catalog & syllabus</li>
                <li>• Define mock exam patterns</li>
                <li>• Publish AI-fixed papers</li>
                <li>• Review analytics</li>
              </ul>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4 text-sm text-muted shadow-inner">
            <p className="text-foreground font-semibold">Stack highlights</p>
            <p className="mt-2">
              Next.js (App Router) · Prisma + Neon · JWT auth · Mistral AI generation & grading · OCR +
              storage hooks ready to plug in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
