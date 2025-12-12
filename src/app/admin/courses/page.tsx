"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/clientApi";

type Course = { id: string; name: string };

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await apiFetch<{ courses: Course[] }>("/api/courses");
      setCourses(res.courses);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const createCourse = async () => {
    setMessage(null);
    setError(null);
    try {
      await apiFetch("/api/courses", { method: "POST", body: JSON.stringify({ name }) });
      setName("");
      setMessage("Course created");
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
        <h2 className="text-sm font-semibold text-foreground">Courses</h2>
        <input
          className="input"
          placeholder="Course name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={createCourse} className="btn-primary">
          Add course
        </button>
      </div>

      <div className="surface p-5">
        <h3 className="text-sm font-semibold text-foreground">Existing courses</h3>
        <ul className="mt-2 space-y-1 text-sm text-muted">
          {courses.map((c) => (
            <li key={c.id}>• {c.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

