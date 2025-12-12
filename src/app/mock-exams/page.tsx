"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/clientApi";

type Section = { name: string; questions: any[] };
type Exam = { 
  id: string; 
  title: string; 
  published: boolean; 
  questions?: Section[];
  subjectId: string;
};

export default function MockExamPage() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [flatQuestions, setFlatQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [timer, setTimer] = useState(45 * 60); // 45 min
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await apiFetch<{ exams: Exam[] }>("/api/mock-exams");
      setExams(res.exams);
    })();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTimer((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!activeExam?.questions) return;
    const all = activeExam.questions.flatMap((s) =>
      (s.questions ?? []).map((q: any) => ({ ...q, section: s.name }))
    );
    setFlatQuestions(all);
    setCurrentIdx(0);
    setResponses({});
  }, [activeExam]);

  const current = flatQuestions[currentIdx];
  const progress = flatQuestions.length
    ? Math.round(((currentIdx + 1) / flatQuestions.length) * 100)
    : 0;
  const formattedTimer = useMemo(() => {
    const m = Math.floor(timer / 60)
      .toString()
      .padStart(2, "0");
    const s = String(timer % 60).padStart(2, "0");
    return `${m}:${s}`;
  }, [timer]);

  async function handleFinish() {
    if (!activeExam || flatQuestions.length === 0) return;
    
    setIsSubmitting(true);
    try {
      // Prepare responses array matching question order
      const responsesArray = flatQuestions.map((q) => responses[q.id] || "");
      
      // Determine question type (assume first question's type or default to MCQ)
      const questionType = flatQuestions[0]?.options ? "MCQ" : "SAQ";
      
      // For MCQ, auto-grade
      let evaluation: any = { results: [] };
      let totalScore = 0;
      
      if (questionType === "MCQ") {
        const results = flatQuestions.map((q, i) => {
          const userAnswer = responsesArray[i];
          const correctAnswer = q.correctAnswer || q.answer;
          const isCorrect = userAnswer === correctAnswer;
          
          return {
            correct: isCorrect,
            feedback: isCorrect ? "Correct!" : `Incorrect. Correct answer: ${correctAnswer}`,
          };
        });
        
        const correctCount = results.filter((r) => r.correct).length;
        totalScore = (correctCount / flatQuestions.length) * 100;
        evaluation = { results, totalCorrect: correctCount };
      } else {
        // For SAQ/LA, would need AI grading - for now, store without evaluation
        evaluation = { results: [], pending: true, feedback: "Subjective answers require manual review" };
        totalScore = 0;
      }

      // Save attempt
      const attemptData = {
        subjectId: activeExam.subjectId,
        type: questionType,
        mode: "MOCK",
        questions: flatQuestions,
        responses: responsesArray,
        evaluation,
        score: totalScore,
      };

      const result = await apiFetch<{ attempt: { id: string } }>("/api/attempts", {
        method: "POST",
        body: JSON.stringify(attemptData),
      });

      // Redirect to scorecard with attempt ID
      router.push(`/scorecard?attemptId=${result.attempt.id}`);
    } catch (error) {
      console.error("Failed to submit exam:", error);
      alert("Failed to submit exam. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="surface flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Mock exam</p>
          <h1 className="text-lg font-semibold text-foreground">
            {activeExam ? activeExam.title : "Choose a published exam"}
          </h1>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border px-3 py-1 text-sm">
          <span className="font-semibold text-primary">⏱ {formattedTimer}</span>
          <span className="text-muted">Remaining</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <aside className="surface space-y-3 p-4">
          <p className="text-sm font-semibold text-foreground">Published exams</p>
          <div className="space-y-2 text-sm text-foreground">
            {exams.map((e) => (
              <button
                key={e.id}
                onClick={() => setActiveExam(e)}
                disabled={isSubmitting}
                className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                  activeExam?.id === e.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary"
                } disabled:opacity-50`}
              >
                <p className="font-semibold">{e.title}</p>
                <p className="text-xs text-muted">{e.published ? "Published" : "Draft"}</p>
              </button>
            ))}
            {exams.length === 0 && <p className="text-xs text-muted">No published exams.</p>}
          </div>
        </aside>

        <div className="surface relative min-h-[420px] p-5">
          {!current ? (
            <p className="text-sm text-muted">Select an exam to begin.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted">
                <span>
                  Question {currentIdx + 1} / {flatQuestions.length}
                </span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-border/50">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${progress}%`, transition: "width 150ms ease" }}
                />
              </div>
              <div className="rounded-2xl border border-border bg-surface/70 p-5 shadow-inner">
                <p className="text-xs text-muted">{current.section}</p>
                <p className="mt-2 text-sm font-semibold text-foreground">{current.prompt ?? current.stem}</p>
                {current.options && (
                  <div className="mt-3 space-y-2">
                    {current.options.map((opt: string, idx: number) => (
                      <label
                        key={idx}
                        className={`flex items-center gap-3 rounded-xl border border-border px-3 py-2 text-sm transition ${
                          responses[current.id] === opt
                            ? "border-primary bg-primary/10"
                            : "hover:border-primary"
                        }`}
                      >
                        <input
                          type="radio"
                          name={current.id}
                          value={opt}
                          checked={responses[current.id] === opt}
                          disabled={isSubmitting}
                          onChange={(e) =>
                            setResponses((prev) => ({ ...prev, [current.id]: e.target.value }))
                          }
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}
                {!current.options && (
                  <textarea
                    className="mt-3 input min-h-[180px]"
                    placeholder="Type your answer..."
                    value={responses[current.id] || ""}
                    disabled={isSubmitting}
                    onChange={(e) =>
                      setResponses((prev) => ({ ...prev, [current.id]: e.target.value }))
                    }
                  />
                )}
              </div>
              <div className="sticky bottom-0 flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface/90 px-4 py-3 shadow-lg shadow-primary/5">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span>
                    Answered: {Object.keys(responses).length} / {flatQuestions.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentIdx === 0 || isSubmitting}
                    onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                    className="rounded-xl border border-border px-3 py-2 text-sm font-semibold text-foreground hover:border-primary disabled:opacity-60"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={() => setCurrentIdx((i) => Math.min(flatQuestions.length - 1, i + 1))}
                    disabled={currentIdx === flatQuestions.length - 1 || isSubmitting}
                    className="rounded-xl border border-border px-3 py-2 text-sm font-semibold text-foreground hover:border-primary disabled:opacity-60"
                  >
                    Next →
                  </button>
                  <button 
                    onClick={handleFinish}
                    disabled={isSubmitting}
                    className="btn-primary w-auto px-4 disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting..." : "Finish"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

