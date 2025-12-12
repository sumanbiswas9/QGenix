"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/clientApi";

export const dynamic = "force-dynamic";

function ScorecardContent() {
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attemptId");

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch specific attempt if attemptId provided
        if (attemptId) {
          const data = await apiFetch<{ attempts: Attempt[] }>(`/api/attempts?id=${attemptId}`);
          const found = data.attempts?.find((a: Attempt) => a.id === attemptId);
          if (found) setAttempt(found);
        } else {
          // Fetch latest attempt
          const data = await apiFetch<{ attempts: Attempt[] }>(`/api/attempts?limit=1`);
          if (data.attempts?.[0]) setAttempt(data.attempts[0]);
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
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Attempt Found</h2>
          <p className="text-gray-600">Start practicing to see your scorecard</p>
        </div>
      </div>
    );
  }

  const questions = Array.isArray(attempt.questions) ? attempt.questions : [];
  const responses = Array.isArray(attempt.responses) ? attempt.responses : [];
  const evaluation = attempt.evaluation || {};

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full mb-2">
                {attempt.mode}
              </span>
              <h1 className="text-3xl font-semibold text-gray-900">{attempt.subject.name}</h1>
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
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Score Overview */}
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-blue-600 bg-blue-50 text-3xl font-bold text-blue-600 shadow-lg">
                {attempt.score !== null ? Math.round(attempt.score) : "—"}%
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Overall Performance</p>
                <p className="text-sm text-gray-600">
                  {questions.length} questions • {attempt.type} format
                </p>
                {evaluation.feedback && (
                  <p className="text-xs text-emerald-600 mt-1">{evaluation.feedback}</p>
                )}
              </div>
            </div>

            {/* Question-by-Question Breakdown */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-900">Question Breakdown</p>
              {questions.map((q: any, i: number) => {
                const response = responses[i];
                const isCorrect = evaluation.results?.[i]?.correct;
                const feedback = evaluation.results?.[i]?.feedback;
                const score = evaluation.results?.[i]?.score;

                return (
                  <div key={i} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900">Question {i + 1}</p>
                      {attempt.type === "MCQ" ? (
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${
                            isCorrect
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {isCorrect ? "Correct" : "Incorrect"}
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
                          {score !== undefined ? `${score} pts` : "Graded"}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{q.question || q.text || "Question text"}</p>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">Your answer:</span> {response || "No response"}
                      </p>
                      {q.correctAnswer && (
                        <p>
                          <span className="font-medium">Correct answer:</span> {q.correctAnswer}
                        </p>
                      )}
                      {feedback && (
                        <p className="text-blue-600">
                          <span className="font-medium">Feedback:</span> {feedback}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Analytics Sidebar */}
          <div className="bg-white rounded-lg p-6 shadow space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-3">Your Progress</p>
              {analytics && (
                <div className="space-y-3">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <p className="text-xs text-gray-600">Total Attempts</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalAttempts}</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <p className="text-xs text-gray-600">Average Score</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.avgScore.toFixed(1)}%
                    </p>
                  </div>
                </div>
              )}
            </div>

            {analytics?.recentAttempts && analytics.recentAttempts.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-3">Recent Attempts</p>
                <div className="space-y-2">
                  {analytics.recentAttempts.slice(0, 5).map((a) => (
                    <div key={a.id} className="text-xs bg-gray-50 rounded p-2">
                      <p className="font-medium text-gray-900">{a.subject}</p>
                      <div className="flex justify-between mt-1 text-gray-600">
                        <span>{a.type}</span>
                        <span className="font-semibold">
                          {a.score !== null ? `${a.score.toFixed(0)}%` : "N/A"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
              <p className="font-semibold mb-1">💡 Keep it up!</p>
              <p className="text-xs">
                Continue practicing regularly to improve your scores. Focus on understanding
                concepts rather than memorizing answers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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

export default function ScorecardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ScorecardContent />
    </Suspense>
  );
}

