"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/clientApi";

export default function HandwrittenPage() {
  const [imageUrl, setImageUrl] = useState("");
  const [questionJson, setQuestionJson] = useState('{"prompt":"Explain photosynthesis","idealPoints":["Light","Chlorophyll"]}');
  const [ocrText, setOcrText] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEvaluate = async () => {
    setError(null);
    setLoading(true);
    try {
      const question = JSON.parse(questionJson);
      const res = await apiFetch<{ ocrText: string; evaluation: any }>("/api/practice/ocr", {
        method: "POST",
        body: JSON.stringify({ subjectId: "subject-id", question, imageUrl }),
      });
      setOcrText(res.ocrText);
      setEvaluation(res.evaluation);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-surface/80 p-6 shadow-lg shadow-primary/5">
        <p className="badge mb-2 w-fit">Handwritten Upload</p>
        <h1 className="text-3xl font-semibold text-foreground">Upload & evaluate</h1>
        <p className="text-sm text-muted">Paste an image URL and a question payload to extract and grade.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="surface space-y-4 p-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Image URL</label>
            <input
              className="input"
              placeholder="https://example.com/answer.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Question JSON</label>
            <textarea
              className="input text-xs"
              rows={6}
              value={questionJson}
              onChange={(e) => setQuestionJson(e.target.value)}
            />
          </div>
          <div className="rounded-2xl border border-dashed border-border bg-surface/60 p-6 text-center text-sm text-muted">
            Drag & drop area (wire to storage upload) — currently accepts image URL only.
          </div>
          <button onClick={handleEvaluate} disabled={loading} className="btn-primary w-auto px-5">
            {loading ? "Extracting..." : "Extract & Evaluate"}
          </button>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="space-y-3">
          <div className="surface p-4">
            <p className="text-sm font-semibold text-foreground">OCR text</p>
            <p className="text-sm text-muted mt-2 min-h-[80px]">{ocrText ?? "Waiting for upload..."}</p>
          </div>
          <div className="surface p-4">
            <p className="text-sm font-semibold text-foreground">AI evaluation</p>
            {evaluation ? (
              <pre className="mt-2 rounded-xl border border-border bg-surface/60 p-3 text-xs text-muted whitespace-pre-wrap">
                {JSON.stringify(evaluation, null, 2)}
              </pre>
            ) : (
              <p className="text-sm text-muted mt-2">No evaluation yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

