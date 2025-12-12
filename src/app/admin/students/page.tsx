"use client";

export default function AdminStudentsPage() {
  const rows = [
    { email: "student1@example.com", attempts: 12, avg: 78 },
    { email: "student2@example.com", attempts: 7, avg: 71 },
    { email: "student3@example.com", attempts: 5, avg: 83 },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Placeholder list. Wire this to your users/attempts data when available.
      </p>
      <div className="surface p-4">
        <div className="grid grid-cols-3 text-xs font-semibold uppercase tracking-wide text-muted">
          <span>Email</span>
          <span>Attempts</span>
          <span>Avg Score</span>
        </div>
        <div className="mt-3 space-y-2 text-sm text-foreground">
          {rows.map((r) => (
            <div
              key={r.email}
              className="grid grid-cols-3 items-center rounded-xl border border-border px-3 py-2"
            >
              <span>{r.email}</span>
              <span>{r.attempts}</span>
              <span>{r.avg}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

