"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/clientApi";
import { getTokens, getUserRole } from "@/lib/clientAuth";

type Subject = { id: string; name: string };
type MockExam = { id: string; title: string; published: boolean };
type Section = { name: string; count: number; marks: number; type: string; difficulty?: string };

export default function AdminMockExamsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [mockExams, setMockExams] = useState<MockExam[]>([]);
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [sections, setSections] = useState<Section[]>([
    { name: "Section A", count: 5, marks: 1, type: "MCQ", difficulty: "MEDIUM" },
  ]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<string>("");
  const [publishing, setPublishing] = useState<string | null>(null);

  const load = async () => {
    try {
      const { accessToken } = getTokens();
      const role = getUserRole();
      setAuthStatus(`Token: ${accessToken ? "✓" : "✗"} | Role: ${role || "none"}`);
      
      const subRes = await apiFetch<{ subjects: Subject[] }>("/api/subjects");
      setSubjects(subRes.subjects);
      const mocks = await apiFetch<{ exams: MockExam[] }>("/api/mock-exams");
      setMockExams(mocks.exams);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const addSection = () => {
    setSections((prev) => [
      ...prev,
      { name: `Section ${String.fromCharCode(65 + prev.length)}`, count: 5, marks: 1, type: "MCQ" },
    ]);
  };

  const updateSection = (idx: number, patch: Partial<Section>) => {
    setSections((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  const createPattern = async () => {
    setMessage(null);
    setError(null);
    
    // Validation
    if (!title || title.trim().length < 3) {
      setError("Title must be at least 3 characters");
      return;
    }
    if (!subjectId) {
      setError("Please select a subject");
      return;
    }
    if (sections.length === 0) {
      setError("Add at least one section");
      return;
    }
    
    try {
      await apiFetch("/api/mock-exams", {
        method: "POST",
        body: JSON.stringify({ title, subjectId, sections }),
      });
      setTitle("");
      setSubjectId("");
      setSections([{ name: "Section A", count: 5, marks: 1, type: "MCQ", difficulty: "MEDIUM" }]);
      setMessage("Mock exam pattern created successfully!");
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const publish = async (id: string) => {
    setMessage(null);
    setError(null);
    setPublishing(id);
    try {
      await apiFetch("/api/mock-exams", { method: "PUT", body: JSON.stringify({ id }) });
      setMessage("✅ Mock exam published successfully! Questions have been generated with AI.");
      setPublishing(null);
      await load();
    } catch (err: any) {
      setError(err.message);
      setPublishing(null);
    }
  };

  return (
    <div className="space-y-4">
      {authStatus && <p className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded border">{authStatus}</p>}
      {message && <p className="text-sm text-emerald-500">{message}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="surface space-y-4 p-5">
        <h2 className="text-sm font-semibold text-foreground">Mock exam builder</h2>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Exam Title <span className="text-red-500">*</span>
          </label>
          <input
            className="input"
            placeholder="e.g., Mid-Term Exam 2024"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            minLength={3}
            required
          />
          <p className="text-xs text-gray-500 mt-1">Minimum 3 characters</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Subject <span className="text-red-500">*</span>
          </label>
          <select
            className="input"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            required
          >
            <option value="">Select subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          {sections.map((section, idx) => (
            <div key={idx} className="rounded-2xl border border-border bg-surface/80 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">{section.name}</p>
                <span className="text-xs text-muted">Section {idx + 1}</span>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-4">
                <input
                  className="input"
                  placeholder="Name"
                  value={section.name}
                  onChange={(e) => updateSection(idx, { name: e.target.value })}
                />
                <select
                  className="input"
                  value={section.type}
                  onChange={(e) => updateSection(idx, { type: e.target.value })}
                >
                  <option value="MCQ">MCQ</option>
                  <option value="SAQ">SAQ</option>
                  <option value="LA">Long Answer</option>
                </select>
                <input
                  type="number"
                  min={1}
                  className="input"
                  placeholder="Count"
                  value={section.count}
                  onChange={(e) => updateSection(idx, { count: Number(e.target.value) })}
                />
                <input
                  type="number"
                  min={1}
                  className="input"
                  placeholder="Marks"
                  value={section.marks}
                  onChange={(e) => updateSection(idx, { marks: Number(e.target.value) })}
                />
                <select
                  className="input md:col-span-2"
                  value={section.difficulty ?? ""}
                  onChange={(e) => updateSection(idx, { difficulty: e.target.value || undefined })}
                >
                  <option value="">Difficulty (mixed)</option>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
            </div>
          ))}
          <button
            onClick={addSection}
            className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground hover:border-primary"
          >
            + Add section
          </button>
        </div>

        <button 
          onClick={createPattern} 
          className="btn-primary"
          disabled={!title || title.trim().length < 3 || !subjectId}
        >
          Create exam pattern
        </button>
        <p className="text-xs text-gray-500">
          Note: After creating the pattern, click "Publish" to generate questions with AI
        </p>
      </div>

      <div className="surface space-y-3 p-5">
        <h2 className="text-sm font-semibold text-foreground">Mock exams</h2>
        <div className="space-y-2 text-sm text-foreground">
          {mockExams.length === 0 && <p className="text-muted">No mock exams yet.</p>}
          {mockExams.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between rounded border border-border px-3 py-2"
            >
              <div>
                <p className="font-semibold">{m.title}</p>
                <p className="text-xs text-muted">Status: {m.published ? "✓ Published" : "Draft"}</p>
              </div>
              {!m.published && (
                <button
                  onClick={() => publish(m.id)}
                  disabled={publishing === m.id}
                  className="rounded-lg bg-emerald-600 px-3 py-1 text-xs text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {publishing === m.id ? "Generating..." : "Publish & Generate"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

