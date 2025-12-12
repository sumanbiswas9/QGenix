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
      const responsesArray = flatQuestions.map((q) => responses[q.id] || "");
      const questionType = flatQuestions[0]?.options ? "MCQ" : "SAQ";
      
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
        evaluation = { results: [], pending: true, feedback: "Subjective answers require manual review" };
        totalScore = 0;
      }

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

      router.push(`/student/scorecard?attemptId=${result.attempt.id}`);
    } catch (error) {
      console.error("Failed to submit exam:", error);
      alert("Failed to submit exam. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mock Exams</h1>
          <p className="text-gray-600 mt-1">
            {activeExam ? activeExam.title : "Select a published exam to begin"}
          </p>
        </div>
        {activeExam && (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-2xl">⏱</span>
            <div className="text-left">
              <p className="text-xs text-gray-600">Time Remaining</p>
              <p className="text-lg font-bold text-blue-600">{formattedTimer}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="bg-white rounded-xl border border-gray-200 p-4 h-fit">
          <h3 className="font-semibold text-gray-900 mb-3">Available Exams</h3>
          <div className="space-y-2">
            {exams.map((e) => (
              <button
                key={e.id}
                onClick={() => setActiveExam(e)}
                disabled={isSubmitting}
                className={`w-full text-left px-4 py-3 rounded-lg border transition ${
                  activeExam?.id === e.id
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-blue-400 hover:bg-gray-50"
                } disabled:opacity-50`}
              >
                <p className="font-semibold text-gray-900">{e.title}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {e.published ? "Published" : "Draft"}
                </p>
              </button>
            ))}
            {exams.length === 0 && (
              <p className="text-sm text-gray-500 py-4 text-center">No exams available</p>
            )}
          </div>
        </aside>

        <div className="bg-white rounded-xl border border-gray-200 p-6 min-h-[500px]">
          {!current ? (
            <div className="flex flex-col items-center justify-center h-96">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-lg text-gray-600">Select an exam from the sidebar to start</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Question {currentIdx + 1} of {flatQuestions.length}</span>
                <span>{progress}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <p className="text-xs text-gray-500 mb-2">{current.section}</p>
                <p className="text-lg font-semibold text-gray-900">
                  {current.prompt ?? current.stem}
                </p>
                
                {current.options && (
                  <div className="mt-4 space-y-3">
                    {current.options.map((opt: string, idx: number) => (
                      <label
                        key={idx}
                        className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition ${
                          responses[current.id] === opt
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 hover:border-blue-400"
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
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="flex-1">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
                
                {!current.options && (
                  <textarea
                    className="mt-4 w-full min-h-[200px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Type your answer here..."
                    value={responses[current.id] || ""}
                    disabled={isSubmitting}
                    onChange={(e) =>
                      setResponses((prev) => ({ ...prev, [current.id]: e.target.value }))
                    }
                  />
                )}
              </div>

              <div className="flex items-center justify-between border-t pt-4">
                <div className="text-sm text-gray-600">
                  Answered: {Object.keys(responses).length} / {flatQuestions.length}
                </div>
                <div className="flex gap-3">
                  <button
                    disabled={currentIdx === 0 || isSubmitting}
                    onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={() => setCurrentIdx((i) => Math.min(flatQuestions.length - 1, i + 1))}
                    disabled={currentIdx === flatQuestions.length - 1 || isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                  <button 
                    onClick={handleFinish}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Submitting..." : "Finish Exam"}
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
