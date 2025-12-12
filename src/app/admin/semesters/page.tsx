"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/clientApi";

type Course = { id: string; name: string };
type Semester = { id: string; number: number; courseId: string };

export default function AdminSemestersPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [courseId, setCourseId] = useState("");
  const [number, setNumber] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const courseRes = await apiFetch<{ courses: Course[] }>("/api/courses");
      setCourses(courseRes.courses);
      const semRes = await apiFetch<{ semesters: Semester[] }>("/api/semesters");
      setSemesters(semRes.semesters);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const createSemester = async () => {
    setMessage(null);
    setError(null);
    try {
      await apiFetch("/api/semesters", {
        method: "POST",
        body: JSON.stringify({ courseId, number }),
      });
      setMessage("Semester created");
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-4">
      {message && <p className="text-sm text-emerald-500">{message}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="surface space-y-3 p-5">
        <h2 className="text-sm font-semibold text-foreground">Semesters</h2>
        <select className="input" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
          <option value="">Select course</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={1}
          className="input"
          value={number}
          onChange={(e) => setNumber(Number(e.target.value))}
        />
        <button onClick={createSemester} className="btn-primary">
          Add semester
        </button>
      </div>

      <div className="surface p-5">
        <h3 className="text-sm font-semibold text-foreground">Existing semesters</h3>
        <ul className="mt-2 space-y-1 text-sm text-muted">
          {semesters.map((s) => (
            <li key={s.id}>
              • {s.courseId} — Semester {s.number}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

