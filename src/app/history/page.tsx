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
    router.push(`/scorecard?attemptId=${attemptId}`);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Attempt History</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Mode</label>
              <select
                value={filters.mode}
                onChange={(e) => setFilters({ ...filters, mode: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">All</option>
                <option value="PRACTICE">Practice</option>
                <option value="MOCK">Mock Exam</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">All</option>
                <option value="MCQ">MCQ</option>
                <option value="SAQ">SAQ</option>
                <option value="LA">Long Answer</option>
                <option value="HANDWRITTEN">Handwritten</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Limit</label>
              <select
                value={filters.limit}
                onChange={(e) => setFilters({ ...filters, limit: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchAttempts}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Attempts List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading attempts...</p>
          </div>
        ) : attempts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">No attempts found</p>
            <p className="text-gray-400 mt-2">Start practicing to see your history here</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
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
                  <tr key={attempt.id} className="hover:bg-gray-50">
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
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          attempt.mode === "MOCK"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {attempt.mode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {attempt.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {attempt.score !== null ? (
                        <span className="text-sm font-semibold text-gray-900">
                          {attempt.score.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleViewScorecard(attempt.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
