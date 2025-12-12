"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/clientApi";
import { saveTokens, clearTokens, getTokens, getUserRole } from "@/lib/clientAuth";
import { useRouter } from "next/navigation";

const Difficulty = {
  EASY: "EASY",
  MEDIUM: "MEDIUM",
  HARD: "HARD",
} as const;

const PracticeType = {
  MCQ: "MCQ",
  SAQ: "SAQ",
  LA: "LA",
  HANDWRITTEN: "HANDWRITTEN",
} as const;

const AttemptMode = {
  PRACTICE: "PRACTICE",
  MOCK: "MOCK",
} as const;

type Course = { id: string; name: string };
type Semester = { id: string; number: number };
type Subject = { id: string; name: string };

type MCQ = {
  id: string;
  stem: string;
  options: string[];
  answer?: string;
  explanation?: string;
  difficulty?: string;
  topicRef?: string;
};

type FreeformQ = {
  id: string;
  prompt: string;
  idealPoints?: string[];
  marks?: number;
};

type GeneratedSet = MCQ[] | FreeformQ[];

export default function DashboardPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courseId, setCourseId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [type, setType] = useState<string>(PracticeType.MCQ);
  const [difficulty, setDifficulty] = useState<string | undefined>(undefined);
  const [count, setCount] = useState(5);
  const [questions, setQuestions] = useState<GeneratedSet>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [recentScores, setRecentScores] = useState<
    { subject: string; score: number; date: string }[]
  >([]);
  const [weakTopics, setWeakTopics] = useState<string[]>([
    "Linear Algebra - Eigenvalues",
    "Networking - TCP Congestion",
    "DBMS - Indexing",
  ]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([
    "Focus 30 minutes on indexing strategies this week.",
    "Redo 5 SAQs on TCP congestion control.",
    "Practice 10 MCQs on eigenvalues/eigenvectors.",
  ]);
  const currentQuestion =
    type === PracticeType.MCQ
      ? (questions as MCQ[])[currentIdx]
      : (questions as FreeformQ[])[currentIdx];
  const progress = questions.length ? Math.round(((currentIdx + 1) / questions.length) * 100) : 0;

  // Redirect to login if no token, or to admin if admin role
  useEffect(() => {
    const { accessToken } = getTokens();
    if (!accessToken) {
      router.push("/login");
      return;
    }
    
    const role = getUserRole();
    if (role === "ADMIN") {
      router.push("/admin");
    }
  }, [router]);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch<{ courses: any[] }>("/api/courses");
        setCourses(data.courses);
        // Mock recent scores placeholder
        setRecentScores([
          { subject: "Calculus", score: 82, date: "Today" },
          { subject: "Physics", score: 76, date: "2d ago" },
          { subject: "DBMS", score: 68, date: "4d ago" },
        ]);
      } catch (err: any) {
        setError(err.message);
      }
    })();
  }, []);

  useEffect(() => {
    if (!courseId) return;
    (async () => {
      try {
        const data = await apiFetch<{ semesters: any[] }>(
          `/api/semesters?courseId=${courseId}`
        );
        setSemesters(data.semesters);
      } catch (err: any) {
        setError(err.message);
      }
    })();
  }, [courseId]);

  useEffect(() => {
    if (!semesterId) return;
    (async () => {
      try {
        const data = await apiFetch<{ subjects: any[] }>(
          `/api/subjects?semesterId=${semesterId}`
        );
        setSubjects(data.subjects);
      } catch (err: any) {
        setError(err.message);
      }
    })();
  }, [semesterId]);

  const resetState = () => {
    setQuestions([]);
    setResponses({});
    setEvaluation(null);
    setMessage(null);
    setCurrentIdx(0);
  };

  const handleGenerate = async () => {
    if (!subjectId) {
      setError("Select a subject first");
      return;
    }
    if (!count || count < 1 || count > 20) {
      setError("Question count must be between 1 and 20");
      return;
    }
    
    setLoading(true);
    setError(null);
    setMessage("Generating new questions...");
    resetState();
    
    try {
      const data = await apiFetch<{ questions: GeneratedSet }>("/api/practice/generate", {
        method: "POST",
        body: JSON.stringify({
          subjectId,
          type,
          difficulty,
          count,
        }),
      });
      
      if (!data.questions || data.questions.length === 0) {
        throw new Error("No questions generated. Please try again.");
      }
      
      setQuestions(data.questions);
      setResponses({});
      setEvaluation(null);
      setMessage(`Generated ${data.questions.length} questions. Start practicing!`);
      setCurrentIdx(0);
    } catch (err: any) {
      console.error("Generation error:", err);
      const errorMessage = err.message || "Failed to generate questions";
      setError(errorMessage);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async () => {
    if (!questions.length) return;
    setLoading(true);
    setError(null);
    setMessage("Grading with AI...");
    try {
      const gradeRes = await apiFetch<{ evaluation: any; score: number }>(
        "/api/practice/grade",
        {
          method: "POST",
          body: JSON.stringify({
            subjectId,
            type,
            questions,
            responses,
          }),
        }
      );
      setEvaluation(gradeRes);
      setMessage(`Graded. Score: ${gradeRes.score ?? "n/a"}`);

      await apiFetch("/api/attempts", {
        method: "POST",
        body: JSON.stringify({
          subjectId,
          type,
          mode: AttemptMode.PRACTICE,
          questions,
          responses,
          evaluation: gradeRes.evaluation,
          score: gradeRes.score,
        }),
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderQuestions = useMemo(() => {
    if (!questions.length || !currentQuestion) return null;

    if (type === PracticeType.MCQ) {
      const q = currentQuestion as MCQ;
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>
              Question {currentIdx + 1} / {questions.length}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-border/50">
            <div
              className="h-2 rounded-full bg-primary"
              style={{ width: `${progress}%`, transition: "width 150ms ease" }}
            />
          </div>
          <div className="surface p-5 space-y-3">
            <p className="text-sm font-semibold text-foreground">{q.stem}</p>
            <div className="space-y-2">
              {q.options?.map((opt, idx) => (
                <label
                  key={idx}
                  className={`flex items-center gap-3 rounded-xl border border-border px-3 py-2 text-sm transition ${
                    responses[q.id] === opt ? "border-primary bg-primary/10" : "hover:border-primary"
                  }`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={opt}
                    checked={responses[q.id] === opt}
                    onChange={(e) => setResponses((prev) => ({ ...prev, [q.id]: e.target.value }))}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <button
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground hover:border-primary disabled:opacity-60"
            >
              ← Previous
            </button>
            <button
              onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
              disabled={currentIdx === questions.length - 1}
              className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground hover:border-primary disabled:opacity-60"
            >
              Next →
            </button>
          </div>
        </div>
      );
    }

    const q = currentQuestion as FreeformQ;
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>
            Question {currentIdx + 1} / {questions.length}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-border/50">
          <div
            className="h-2 rounded-full bg-primary"
            style={{ width: `${progress}%`, transition: "width 150ms ease" }}
          />
        </div>
        <div className="surface p-5 space-y-3">
          <p className="text-sm font-semibold text-foreground">{q.prompt}</p>
          <textarea
            className="input min-h-[180px]"
            value={responses[q.id] || ""}
            onChange={(e) => setResponses((prev) => ({ ...prev, [q.id]: e.target.value }))}
            placeholder="Type your answer..."
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <button
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground hover:border-primary disabled:opacity-60"
          >
            ← Previous
          </button>
          <button
            onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
            disabled={currentIdx === questions.length - 1}
            className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground hover:border-primary disabled:opacity-60"
          >
            Next →
          </button>
        </div>
      </div>
    );
  }, [questions, currentQuestion, type, responses, currentIdx, progress]);

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="surface sticky top-20 h-fit space-y-3 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Student</p>
        <nav className="space-y-2 text-sm font-semibold">
          {[
            { label: "Dashboard", icon: "🏠", href: "/dashboard" },
            { label: "Practice", icon: "🎯", href: "/dashboard" },
            { label: "Mock Exams", icon: "📝", href: "/mock-exams" },
            { label: "History", icon: "🕒", href: "/history" },
            { label: "Analytics", icon: "📈", href: "/dashboard" },
            { label: "Scorecard", icon: "📊", href: "/scorecard" },
          ].map((item) => (
            <div
              key={item.label}
              onClick={() => router.push(item.href)}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-border px-3 py-2 hover:border-primary hover:bg-primary/5"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
        <button
          onClick={() => {
            clearTokens();
            router.push("/login");
          }}
          className="w-full rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground hover:border-primary"
        >
          Logout
        </button>
      </aside>

      <div className="space-y-6">
        <div className="rounded-3xl border border-border bg-surface/80 p-6 shadow-lg shadow-primary/5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="badge mb-2 w-fit">Welcome back</p>
              <h1 className="text-3xl font-semibold text-foreground">Your practice cockpit</h1>
              <p className="text-sm text-muted">
                Start a new session, continue where you left off, or review insights from AI.
              </p>
            </div>
            <button onClick={handleGenerate} disabled={loading} className="btn-primary w-auto px-5">
              {loading ? "Working..." : "Start new practice"}
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="surface p-4">
              <p className="text-sm font-semibold text-foreground">Continue last attempt</p>
              <p className="text-xs text-muted mt-1">We’ll load your last graded set.</p>
              <button className="mt-3 rounded-xl border border-border px-3 py-2 text-sm font-semibold text-foreground hover:border-primary">
                Resume
              </button>
            </div>
            <div className="surface p-4">
              <p className="text-sm font-semibold text-foreground">Recent scores</p>
              <div className="mt-2 space-y-1 text-sm text-muted">
                {recentScores.map((r) => (
                  <div key={`${r.subject}-${r.date}`} className="flex justify-between">
                    <span>{r.subject}</span>
                    <span className="text-foreground font-semibold">{r.score}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="surface p-4">
              <p className="text-sm font-semibold text-foreground">Weak topics</p>
              <div className="mt-2 space-y-2 text-xs text-muted">
                {weakTopics.map((t) => (
                  <div key={t} className="rounded-lg border border-border px-2 py-1">
                    {t}
                  </div>
                ))}
              </div>
            </div>
            <div className="surface p-4 md:col-span-2">
              <p className="text-sm font-semibold text-foreground">AI suggestions</p>
              <ul className="mt-2 space-y-2 text-sm text-muted">
                {aiSuggestions.map((s, i) => (
                  <li key={i} className="rounded-lg border border-border px-3 py-2">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="surface space-y-3 p-5">
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Course</label>
                <select
                  className="input"
                  value={courseId}
                  onChange={(e) => {
                    setCourseId(e.target.value);
                    setSemesterId("");
                    setSubjectId("");
                    setSemesters([]);
                    setSubjects([]);
                    resetState();
                  }}
                >
                  <option value="">Select course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground">Semester</label>
                <select
                  className="input"
                  value={semesterId}
                  onChange={(e) => {
                    setSemesterId(e.target.value);
                    setSubjectId("");
                    setSubjects([]);
                    resetState();
                  }}
                >
                  <option value="">Select semester</option>
                  {semesters.map((s) => (
                    <option key={s.id} value={s.id}>
                      Semester {s.number}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground">Subject</label>
                <select
                  className="input"
                  value={subjectId}
                  onChange={(e) => {
                    setSubjectId(e.target.value);
                    resetState();
                  }}
                >
                  <option value="">Select subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              {[
                { label: "MCQ Practice", value: PracticeType.MCQ },
                { label: "SAQ Practice", value: PracticeType.SAQ },
                { label: "Long Answer", value: PracticeType.LA },
                { label: "Handwritten", value: PracticeType.HANDWRITTEN },
              ].map((m) => (
                <button
                  key={m.value}
                  onClick={() => {
                    setType(m.value);
                    resetState();
                  }}
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    type === m.value
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border hover:border-primary"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Difficulty</label>
                <select
                  className="input"
                  value={difficulty ?? ""}
                  onChange={(e) => setDifficulty(e.target.value || undefined)}
                >
                  <option value="">Mixed</option>
                  <option value={Difficulty.EASY}>Easy</option>
                  <option value={Difficulty.MEDIUM}>Medium</option>
                  <option value={Difficulty.HARD}>Hard</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground">Question count</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  className="input"
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                />
              </div>
              <div className="flex items-end gap-2">
                <button onClick={handleGenerate} disabled={loading} className="btn-primary">
                  {loading ? "Working..." : "Generate"}
                </button>
                {questions.length > 0 && (
                  <button
                    onClick={handleGrade}
                    disabled={loading}
                    className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground hover:border-primary"
                  >
                    Grade
                  </button>
                )}
              </div>
            </div>

            {message && <p className="text-sm text-muted">{message}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="mt-4">{renderQuestions}</div>
          </div>

          <div className="space-y-4">
            <div className="surface space-y-3 p-5">
              <p className="text-sm font-semibold text-foreground">Evaluation</p>
              {evaluation ? (
                <div className="space-y-3 text-sm text-foreground">
                  {"score" in evaluation && (
                    <p className="rounded-lg border border-border bg-surface px-3 py-2 font-semibold">
                      Score: {evaluation.score ?? "n/a"}
                    </p>
                  )}
                  {evaluation.evaluation && Array.isArray(evaluation.evaluation) && (
                    <div className="space-y-2">
                      {evaluation.evaluation.map((item: any) => (
                        <div key={item.id} className="rounded-lg border border-border bg-surface px-3 py-2">
                          <p className="font-semibold">Q: {item.id}</p>
                          <p className="text-xs text-muted">Score: {item.score ?? "n/a"}</p>
                          {item.strengths && (
                            <p className="text-xs text-emerald-500">
                              Strengths: {item.strengths.join(", ")}
                            </p>
                          )}
                          {item.weaknesses && (
                            <p className="text-xs text-amber-500">
                              Weaknesses: {item.weaknesses.join(", ")}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {evaluation.breakdown && Array.isArray(evaluation.breakdown) && (
                    <div className="space-y-1 text-xs">
                      {evaluation.breakdown.map((b: any) => (
                        <div key={b.id} className="flex items-center justify-between rounded border border-border px-2 py-1">
                          <span className="font-semibold">{b.id}</span>
                          <span className={b.correct ? "text-emerald-500" : "text-red-500"}>
                            {b.correct ? "Correct" : "Incorrect"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted">Generate and grade to see results.</p>
              )}
            </div>

            <div className="surface space-y-3 p-5">
              <p className="text-sm font-semibold text-foreground">AI-generated tips</p>
              <ul className="space-y-2 text-sm text-muted">
                {aiSuggestions.map((s, i) => (
                  <li key={i} className="rounded-lg border border-border px-3 py-2">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

