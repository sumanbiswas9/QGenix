"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { saveTokens, clearTokens } from "@/lib/clientAuth";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"STUDENT" | "ADMIN">("STUDENT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    clearTokens();
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      saveTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Unable to register");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="surface relative overflow-hidden p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(79,70,229,0.12),transparent_45%),radial-gradient(circle_at_90%_0%,rgba(14,165,233,0.12),transparent_40%)]" />
        <div className="relative space-y-3">
          <p className="badge w-fit">Create your account</p>
          <h1 className="text-3xl font-semibold text-foreground">Get started</h1>
          <p className="text-sm text-muted">
            Join as a student or admin to generate questions, manage mock exams, and track analytics.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li>• AI generation + grading ready</li>
            <li>• OCR and storage hooks configurable</li>
            <li>• Secure access/refresh tokens</li>
          </ul>
        </div>
      </div>

      <form onSubmit={onSubmit} className="surface space-y-5 p-8">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Email</label>
          <input
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Password</label>
          <input
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
          <p className="text-xs text-muted">Minimum 8 characters.</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Role</label>
          <select
            className="input"
            value={role}
            onChange={(e) => setRole(e.target.value as "STUDENT" | "ADMIN")}
          >
            <option value="STUDENT">Student</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Creating..." : "Register"}
        </button>
        <p className="text-xs text-muted">
          Already have an account?{" "}
          <a className="text-primary hover:underline" href="/login">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}

