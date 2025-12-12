"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/clientApi";

export const dynamic = "force-dynamic";

type Attempt = {
  id: string;
  type: string;
  mode: string;
  score: number | null;
  createdAt: string;
  questions: any;
  responses: any;
  evaluation: any;
  subject: {
    name: string;
    semester: {
      number: number;
      course: {
        name: string;
      };
    };
  };
};

type Analytics = {
  totalAttempts: number;
  avgScore: number;
  recentAttempts: Array<{
    id: string;
    subject: string;
    type: string;
    mode: string;
    score: number | null;
    createdAt: string;
  }>;
};

function ScorecardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const attemptId = searchParams.get("attemptId");
  const showList = searchParams.get("list") === "true";

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [allAttempts, setAllAttempts] = useState<Attempt[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"practice" | "mock" | "all">("all");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch all attempts for list view
        const attemptsData = await apiFetch<{ attempts: Attempt[] }>(`/api/attempts`);
        setAllAttempts(attemptsData.attempts || []);

        // Fetch specific attempt if attemptId provided
        if (attemptId && !showList) {
          const found = attemptsData.attempts?.find((a: Attempt) => a.id === attemptId);
          if (found) setAttempt(found);
        } else if (!attemptId && !showList) {
          // Fetch latest attempt
          if (attemptsData.attempts?.[0]) setAttempt(attemptsData.attempts[0]);
        }

        // Fetch analytics
        const analyticsData = await apiFetch<Analytics>("/api/analytics");
        setAnalytics(analyticsData);
      } catch (error) {
        console.error("Failed to fetch scorecard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [attemptId, showList]);

  // Helper function to check if answer is correct
  const isCorrect = (question: any, response: any, index: number, evaluation: any): boolean | null => {
    // Handle different evaluation formats
    if (evaluation?.breakdown && Array.isArray(evaluation.breakdown)) {
      // Practice MCQ format: { breakdown: [{ id, correct, expected, got }] }
      // Try to find by question ID first (more reliable)
      const byId = evaluation.breakdown.find((b: any) => b.id === question.id);
      if (byId?.correct !== undefined) {
        return byId.correct;
      }
      // Fallback to index
      const breakdownItem = evaluation.breakdown[index];
      if (breakdownItem?.correct !== undefined) {
        return breakdownItem.correct;
      }
    }

    if (evaluation?.results && Array.isArray(evaluation.results)) {
      // Mock exam format: { results: [{ correct, feedback }] }
      const result = evaluation.results[index];
      if (result?.correct !== undefined) return result.correct;
    }

    // Fallback: compare directly with normalization
    if (question.answer || question.correctAnswer) {
      const correctAnswer = (question.answer || question.correctAnswer)?.trim() || "";
      const userAnswer = Array.isArray(response) 
        ? (response[index]?.trim() || "")
        : (response[question.id]?.trim() || response?.trim() || "");
      
      // Direct match
      if (userAnswer === correctAnswer) return true;
      
      // Handle letter-to-option mapping
      if (question.options && Array.isArray(question.options)) {
        const correctLetter = correctAnswer.toUpperCase();
        const userLetter = userAnswer.toUpperCase();
        
        // If correct answer is a letter (A-D), get the option text
        if (correctLetter.match(/^[A-D]$/)) {
          const correctIdx = correctLetter.charCodeAt(0) - 65;
          if (correctIdx >= 0 && correctIdx < question.options.length) {
            const correctOptionText = question.options[correctIdx]?.trim();
            if (userAnswer === correctOptionText) return true;
          }
        }
        
        // If user answer is a letter, compare option texts
        if (userLetter.match(/^[A-D]$/)) {
          const userIdx = userLetter.charCodeAt(0) - 65;
          const correctIdx = correctLetter.charCodeAt(0) - 65;
          if (userIdx >= 0 && userIdx < question.options.length &&
              correctIdx >= 0 && correctIdx < question.options.length) {
            const userOptionText = question.options[userIdx]?.trim();
            const correctOptionText = question.options[correctIdx]?.trim();
            if (userOptionText === correctOptionText) return true;
          }
        }
      }
      
      return false;
    }

    return null;
  };

  // Helper to get response value
  const getResponse = (question: any, responses: any, index: number): string => {
    if (Array.isArray(responses)) {
      return responses[index] || "";
    }
    return responses[question.id] || responses[index] || "";
  };

  // Filter attempts by tab
  const filteredAttempts = allAttempts.filter((a) => {
    if (activeTab === "practice") return a.mode === "PRACTICE";
    if (activeTab === "mock") return a.mode === "MOCK";
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  // List view - show all attempts
  if (showList || (!attemptId && allAttempts.length > 0)) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Attempts</h1>
            <p className="text-sm text-gray-600 mt-1">View your practice and mock exam scores</p>
          </div>
          <button
            onClick={() => router.push("/student/practice")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            New Practice
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 font-medium transition ${
              activeTab === "all"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            All ({allAttempts.length})
          </button>
          <button
            onClick={() => setActiveTab("practice")}
            className={`px-4 py-2 font-medium transition ${
              activeTab === "practice"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Practice ({allAttempts.filter((a) => a.mode === "PRACTICE").length})
          </button>
          <button
            onClick={() => setActiveTab("mock")}
            className={`px-4 py-2 font-medium transition ${
              activeTab === "mock"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Mock Exams ({allAttempts.filter((a) => a.mode === "MOCK").length})
          </button>
        </div>

        {/* Attempts List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAttempts.map((attempt) => (
            <div
              key={attempt.id}
              onClick={() => router.push(`/student/scorecard?attemptId=${attempt.id}`)}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    attempt.mode === "MOCK"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {attempt.mode}
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {attempt.score !== null ? Math.round(attempt.score) : "—"}%
                </span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{attempt.subject.name}</h3>
              <p className="text-sm text-gray-600 mb-2">
                {attempt.subject.semester.course.name} • {attempt.type}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(attempt.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          ))}
        </div>

        {filteredAttempts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No attempts yet</h3>
            <p className="text-gray-600 mb-4">Start practicing to see your scores here</p>
            <button
              onClick={() => router.push("/student/practice")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Start Practice
            </button>
          </div>
        )}
      </div>
    );
  }

  // Detail view - show specific attempt
  if (!attempt) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Attempt Found</h2>
        <p className="text-gray-600 mb-4">Start practicing to see your scorecard</p>
        <button
          onClick={() => router.push("/student/scorecard?list=true")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          View All Attempts
        </button>
      </div>
    );
  }

  const questions = Array.isArray(attempt.questions) ? attempt.questions : [];
  const responses = attempt.responses || {};
  const evaluation = attempt.evaluation || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => router.push("/student/scorecard?list=true")}
              className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-flex items-center gap-1"
            >
              ← Back to All Attempts
            </button>
            <span
              className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-2 ${
                attempt.mode === "MOCK"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {attempt.mode}
            </span>
            <h1 className="text-3xl font-bold text-gray-900">{attempt.subject.name}</h1>
            <p className="text-sm text-gray-600 mt-1">
              {attempt.subject.semester.course.name} - Semester {attempt.subject.semester.number} • {attempt.type}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Attempted on</p>
            <p className="text-lg font-medium text-gray-900">
              {new Date(attempt.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Score Overview */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-200">
            <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-blue-600 bg-blue-50 text-4xl font-bold text-blue-600 shadow-lg">
              {attempt.score !== null ? Math.round(attempt.score) : "—"}%
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">Overall Performance</p>
              <p className="text-sm text-gray-600 mt-1">
                {questions.length} questions • {attempt.type} format
              </p>
              {evaluation.feedback && (
                <p className="text-sm text-green-600 mt-2">{evaluation.feedback}</p>
              )}
            </div>
          </div>

          {/* Question-by-Question Breakdown */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Question Breakdown</h3>
            {questions.map((q: any, i: number) => {
              const response = getResponse(q, responses, i);
              const correct = isCorrect(q, responses, i, evaluation);
              const feedback = evaluation.results?.[i]?.feedback || 
                              evaluation.breakdown?.[i]?.feedback ||
                              (evaluation[i]?.feedback);
              const score = evaluation.results?.[i]?.score || 
                           evaluation[i]?.score ||
                           (q.marks || 1);

              return (
                <div key={i} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-900">Question {i + 1}</p>
                    {attempt.type === "MCQ" ? (
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          correct === true
                            ? "bg-green-100 text-green-800"
                            : correct === false
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {correct === true ? "✓ Correct" : correct === false ? "✗ Incorrect" : "—"}
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                        {score !== undefined ? `${score} pts` : "Graded"}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-800 mb-3 font-medium">
                    {q.stem || q.prompt || q.question || q.text || "Question text"}
                  </p>
                  <div className="text-sm text-gray-700 space-y-2">
                    <div className="bg-white rounded p-3 border border-gray-200">
                      <span className="font-semibold text-gray-900">Your answer:</span>
                      <p className="mt-1">{response || "No response provided"}</p>
                    </div>
                    {(q.correctAnswer || q.answer) && attempt.type === "MCQ" && (
                      <div className="bg-green-50 rounded p-3 border border-green-200">
                        <span className="font-semibold text-green-900">Correct answer:</span>
                        <p className="mt-1 text-green-800">{q.correctAnswer || q.answer}</p>
                      </div>
                    )}
                    {feedback && (
                      <div className="bg-blue-50 rounded p-3 border border-blue-200">
                        <span className="font-semibold text-blue-900">Feedback:</span>
                        <p className="mt-1 text-blue-800">{feedback}</p>
                      </div>
                    )}
                    {evaluation[i] && (
                      <div className="bg-purple-50 rounded p-3 border border-purple-200">
                        <div className="space-y-1">
                          {evaluation[i].strengths && evaluation[i].strengths.length > 0 && (
                            <div>
                              <span className="font-semibold text-purple-900">Strengths:</span>
                              <ul className="list-disc list-inside mt-1 text-purple-800">
                                {evaluation[i].strengths.map((s: string, idx: number) => (
                                  <li key={idx} className="text-xs">{s}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {evaluation[i].weaknesses && evaluation[i].weaknesses.length > 0 && (
                            <div>
                              <span className="font-semibold text-purple-900">Areas to improve:</span>
                              <ul className="list-disc list-inside mt-1 text-purple-800">
                                {evaluation[i].weaknesses.map((w: string, idx: number) => (
                                  <li key={idx} className="text-xs">{w}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Analytics Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Your Progress</h3>
            {analytics && (
              <div className="space-y-4">
                <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-4">
                  <p className="text-xs text-blue-700 font-medium">Total Attempts</p>
                  <p className="text-3xl font-bold text-blue-900 mt-1">{analytics.totalAttempts}</p>
                </div>
                <div className="bg-linear-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-4">
                  <p className="text-xs text-green-700 font-medium">Average Score</p>
                  <p className="text-3xl font-bold text-green-900 mt-1">
                    {analytics.avgScore.toFixed(1)}%
                  </p>
                </div>
              </div>
            )}
          </div>

          {analytics?.recentAttempts && analytics.recentAttempts.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Attempts</h3>
              <div className="space-y-3">
                {analytics.recentAttempts.slice(0, 5).map((a) => (
                  <div
                    key={a.id}
                    onClick={() => router.push(`/student/scorecard?attemptId=${a.id}`)}
                    className="bg-gray-50 rounded-lg border border-gray-200 p-3 cursor-pointer hover:bg-gray-100 transition"
                  >
                    <p className="font-semibold text-sm text-gray-900">{a.subject}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-600">{a.type} • {a.mode}</span>
                      <span className="text-sm font-bold text-blue-600">
                        {a.score !== null ? `${a.score.toFixed(0)}%` : "N/A"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-linear-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
            <div className="text-3xl mb-3">💡</div>
            <p className="font-bold text-gray-900 mb-2">Keep it up!</p>
            <p className="text-sm text-gray-700">
              Continue practicing regularly to improve your scores. Focus on understanding
              concepts rather than memorizing answers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ScorecardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ScorecardContent />
    </Suspense>
  );
}
