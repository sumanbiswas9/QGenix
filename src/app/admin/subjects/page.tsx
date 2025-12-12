"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/clientApi";

type Semester = { id: string; number: number; courseId: string };
type Subject = { id: string; name: string; semesterId: string };

export default function AdminSubjectsPage() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [semesterId, setSemesterId] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const semRes = await apiFetch<{ semesters: Semester[] }>("/api/semesters");
      setSemesters(semRes.semesters);
      const subRes = await apiFetch<{ subjects: Subject[] }>("/api/subjects");
      setSubjects(subRes.subjects);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const createSubject = async () => {
    setMessage(null);
    setError(null);
    try {
      await apiFetch("/api/subjects", {
        method: "POST",
        body: JSON.stringify({ semesterId, name }),
      });
      setName("");
      setMessage("Subject created");
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
        <h2 className="text-sm font-semibold text-foreground">Subjects</h2>
        <select
          className="input"
          value={semesterId}
          onChange={(e) => setSemesterId(e.target.value)}
        >
          <option value="">Select semester</option>
          {semesters.map((s) => (
            <option key={s.id} value={s.id}>
              Semester {s.number} ({s.courseId})
            </option>
          ))}
        </select>
        <input
          className="input"
          placeholder="Subject name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={createSubject} className="btn-primary">
          Add subject
        </button>
      </div>

      <div className="surface p-5">
        <h3 className="text-sm font-semibold text-foreground">Existing subjects</h3>
        <ul className="mt-2 space-y-1 text-sm text-muted">
          {subjects.map((s) => (
            <li key={s.id}>
              • {s.name} — semester {s.semesterId}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

