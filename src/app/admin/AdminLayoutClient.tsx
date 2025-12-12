"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { clearTokens, getTokens, getUserRole } from "@/lib/clientAuth";

const nav = [
  { href: "/admin/overview", label: "Overview" },
  { href: "/admin/courses", label: "Courses" },
  { href: "/admin/semesters", label: "Semesters" },
  { href: "/admin/subjects", label: "Subjects" },
  { href: "/admin/syllabus", label: "Syllabus" },
  { href: "/admin/mock-exams", label: "Mock Exams" },
  { href: "/admin/students", label: "Students" },
];

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const { accessToken } = getTokens();
    if (!accessToken) {
      router.replace("/login");
      return;
    }
    
    const role = getUserRole();
    if (role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="badge mb-2 w-fit">Admin workspace</p>
          <h1 className="text-3xl font-semibold text-foreground">QGenix Admin</h1>
          <p className="text-sm text-muted">Manage catalog, syllabus, and mock exams.</p>
        </div>
        <button
          onClick={() => {
            clearTokens();
            router.push("/login");
          }}
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground hover:border-primary"
        >
          Logout
        </button>
      </div>

      <nav className="flex flex-wrap gap-2 rounded-2xl border border-border bg-surface p-3">
        {nav.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                active
                  ? "bg-primary text-white shadow-sm"
                  : "text-foreground hover:bg-border/40"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div>{children}</div>
    </div>
  );
}

