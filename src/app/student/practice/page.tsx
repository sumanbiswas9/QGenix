"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/clientApi";
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
} as const;

const AttemptMode = {
  PRACTICE: "PRACTICE",
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

export default function PracticePage() {
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

  const currentQuestion =
    type === PracticeType.MCQ
      ? (questions as MCQ[])[currentIdx]
      : (questions as FreeformQ[])[currentIdx];
  const progress = questions.length ? Math.round(((currentIdx + 1) / questions.length) * 100) : 0;

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch<{ courses: any[] }>("/api/courses");
        setCourses(data.courses);
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

      const attemptResult = await apiFetch<{ attempt: { id: string } }>("/api/attempts", {
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
      
      setMessage("Practice saved! Redirecting to scorecard...");
      setTimeout(() => {
        router.push(`/student/scorecard?attemptId=${attemptResult.attempt.id}`);
      }, 1500);
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
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Question {currentIdx + 1} / {questions.length}</span>
            <span>{progress}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <p className="text-lg font-semibold text-gray-900">{q.stem}</p>
            <div className="space-y-3">
              {q.options?.map((opt, idx) => (
                <label
                  key={idx}
                  className={`flex items-center gap-3 rounded-lg border p-4 text-sm transition cursor-pointer ${
                    responses[q.id] === opt
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-blue-400"
                  }`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={opt}
                    checked={responses[q.id] === opt}
                    onChange={(e) => setResponses((prev) => ({ ...prev, [q.id]: e.target.value }))}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="flex-1">{opt}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <button
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <button
              onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
              disabled={currentIdx === questions.length - 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>
      );
    }

    const q = currentQuestion as FreeformQ;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Question {currentIdx + 1} / {questions.length}</span>
          <span>{progress}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <p className="text-lg font-semibold text-gray-900">{q.prompt}</p>
          <textarea
            className="w-full min-h-[200px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            value={responses[q.id] || ""}
            onChange={(e) => setResponses((prev) => ({ ...prev, [q.id]: e.target.value }))}
            placeholder="Type your answer here..."
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <button
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <button
            onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
            disabled={currentIdx === questions.length - 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      </div>
    );
  }, [questions, currentQuestion, type, responses, currentIdx, progress]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Practice Questions</h1>
        <p className="text-gray-600 mt-1">Generate AI-powered questions to test your knowledge</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Question Type</label>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { label: "Multiple Choice", value: PracticeType.MCQ },
              { label: "Short Answer", value: PracticeType.SAQ },
              { label: "Long Answer", value: PracticeType.LA },
            ].map((m) => (
              <button
                key={m.value}
                onClick={() => {
                  setType(m.value);
                  resetState();
                }}
                className={`px-4 py-3 text-sm font-medium rounded-lg border transition ${
                  type === m.value
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-300 hover:border-blue-400"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Question Count</label>
            <input
              type="number"
              min={1}
              max={20}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Generating..." : "Generate Questions"}
            </button>
          </div>
        </div>

        {message && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">{message}</p>
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>

      {questions.length > 0 && (
        <>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {renderQuestions}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleGrade}
              disabled={loading}
              className="px-8 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Grading..." : "Submit & Grade"}
            </button>
          </div>
        </>
      )}

      {evaluation && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Results</h2>
          {"score" in evaluation && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
              <p className="text-2xl font-bold text-green-700">
                Score: {evaluation.score}%
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
