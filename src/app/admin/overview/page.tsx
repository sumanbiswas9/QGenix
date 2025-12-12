"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/clientApi";

type AttemptStat = { totalAttempts: number; avgScore: number };

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AttemptStat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch<{ totalAttempts: number; avgScore: number }>("/api/analytics");
        setStats(res);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const metrics = [
    { label: "Total students", value: "—" },
    { label: "Exams published", value: "—" },
    { label: "Attempts", value: stats?.totalAttempts ?? "—" },
    { label: "Avg score", value: stats ? `${stats.avgScore.toFixed(1)}%` : "—" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="surface p-4">
            <p className="text-xs uppercase tracking-wide text-muted">{m.label}</p>
            <p className="text-2xl font-semibold text-foreground mt-2">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="surface p-5 space-y-3">
          <p className="text-sm font-semibold text-foreground">Usage trend</p>
          <div className="h-48 rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-indigo-200/20" />
          <p className="text-xs text-muted">Connect real analytics to render charts.</p>
        </div>
        <div className="surface p-5 space-y-3">
          <p className="text-sm font-semibold text-foreground">Performance by subject</p>
          <div className="h-48 rounded-2xl border border-border bg-gradient-to-br from-emerald-100/40 to-indigo-100/40" />
          <p className="text-xs text-muted">Hook to /api/analytics for subjectStats.</p>
        </div>
      </div>

      <div className="surface p-5">
        <p className="text-sm font-semibold text-foreground">Recent exams</p>
        <div className="mt-3 rounded-2xl border border-border p-4 text-sm text-muted">
          Add data table once exams and attempts list are wired.
        </div>
      </div>

      {loading && <p className="text-sm text-muted">Loading metrics…</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

