"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Attempt = {
  id: string;
  type: string;
  mode: string;
  score: number | null;
  createdAt: string;
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

export default function HistoryPage() {
  const router = useRouter();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    mode: "",
    type: "",
    limit: "20",
  });

  useEffect(() => {
    fetchAttempts();
  }, [filters]);

  async function fetchAttempts() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.mode) params.set("mode", filters.mode);
      if (filters.type) params.set("type", filters.type);
      if (filters.limit) params.set("limit", filters.limit);

      const res = await fetch(`/api/attempts?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAttempts(data.attempts || []);
      }
    } catch (error) {
      console.error("Failed to fetch attempts:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleViewScorecard(attemptId: string) {
    router.push(`/student/scorecard?attemptId=${attemptId}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Attempt History</h1>
        <p className="text-gray-600 mt-1">Review all your past practice sessions and mock exams</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
            <select
              value={filters.mode}
              onChange={(e) => setFilters({ ...filters, mode: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">All Modes</option>
              <option value="PRACTICE">Practice</option>
              <option value="MOCK">Mock Exam</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">All Types</option>
              <option value="MCQ">MCQ</option>
              <option value="SAQ">SAQ</option>
              <option value="LA">Long Answer</option>
              <option value="HANDWRITTEN">Handwritten</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Show</label>
            <select
              value={filters.limit}
              onChange={(e) => setFilters({ ...filters, limit: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="10">Last 10</option>
              <option value="20">Last 20</option>
              <option value="50">Last 50</option>
              <option value="100">Last 100</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchAttempts}
              className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Attempts List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your history...</p>
        </div>
      ) : attempts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-lg text-gray-600">No attempts found</p>
          <p className="text-gray-500 mt-2">Start practicing to build your history</p>
          <button
            onClick={() => router.push("/student/practice")}
            className="mt-6 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            Start Practice
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attempts.map((attempt) => (
                <tr key={attempt.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(attempt.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{attempt.subject.name}</div>
                    <div className="text-sm text-gray-500">
                      {attempt.subject.semester.course.name} - Sem {attempt.subject.semester.number}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                        attempt.mode === "MOCK"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {attempt.mode}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{attempt.type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {attempt.score !== null ? (
                      <span className="text-lg font-bold text-blue-600">
                        {attempt.score.toFixed(0)}%
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleViewScorecard(attempt.id)}
                      className="px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 font-medium rounded-lg transition"
                    >
                      View Details →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
