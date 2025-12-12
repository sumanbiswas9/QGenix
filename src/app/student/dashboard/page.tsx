"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/clientApi";

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
  subjectStats: Array<{
    subject: string;
    subjectId: string;
    count: number;
    avgScore: number;
  }>;
};

export default function StudentDashboard() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const data = await apiFetch<Analytics>("/api/analytics");
        setAnalytics(data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your learning overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Attempts</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {analytics?.totalAttempts || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
              📝
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Score</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {analytics?.avgScore.toFixed(1) || 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
              📊
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Subjects</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {analytics?.subjectStats.length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
              📚
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Practice</h3>
          <p className="text-sm text-gray-600 mb-4">
            Generate AI-powered questions for any subject
          </p>
          <button
            onClick={() => router.push("/student/practice")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Go to Practice →
          </button>
        </div>

        <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Take Mock Exam</h3>
          <p className="text-sm text-gray-600 mb-4">
            Test yourself with timed mock exams
          </p>
          <button
            onClick={() => router.push("/student/mock-exams")}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
          >
            View Exams →
          </button>
        </div>
      </div>

      {/* Recent Attempts */}
      {analytics?.recentAttempts && analytics.recentAttempts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Attempts</h3>
          <div className="space-y-3">
            {analytics.recentAttempts.map((attempt) => (
              <div
                key={attempt.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition"
                onClick={() => router.push(`/student/scorecard?attemptId=${attempt.id}`)}
              >
                <div>
                  <p className="font-medium text-gray-900">{attempt.subject}</p>
                  <p className="text-sm text-gray-600">
                    {attempt.type} • {attempt.mode}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">
                    {attempt.score !== null ? `${attempt.score.toFixed(0)}%` : "N/A"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(attempt.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subject Performance */}
      {analytics?.subjectStats && analytics.subjectStats.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Performance</h3>
          <div className="space-y-4">
            {analytics.subjectStats.map((stat) => (
              <div key={stat.subjectId}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{stat.subject}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {stat.avgScore.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${stat.avgScore}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{stat.count} attempts</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
