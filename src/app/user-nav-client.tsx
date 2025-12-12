"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getTokens, getUserRole, clearTokens } from "../lib/clientAuth";

export function UserNavClient() {
  const [authed, setAuthed] = useState(false);
  const [role, setRole] = useState<"ADMIN" | "STUDENT" | null>(null);

  const updateAuthState = () => {
    try {
      const tokens = getTokens();
      const isAuthed = !!tokens?.accessToken;
      setAuthed(isAuthed);
      if (isAuthed) {
        const userRole = getUserRole();
        if (userRole === "ADMIN" || userRole === "STUDENT") {
          setRole(userRole);
        } else {
          setRole(null);
        }
      } else {
        setRole(null);
      }
    } catch {
      setAuthed(false);
      setRole(null);
    }
  };

  useEffect(() => {
    updateAuthState();

    // Listen for storage changes (login/logout from other tabs)
    const handleStorageChange = () => {
      updateAuthState();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const homeHref = useMemo(() => {
    if (role === "ADMIN") return "/admin";
    if (role === "STUDENT") return "/student/dashboard";
    return "/dashboard";
  }, [role]);

  // When logged out: Show Login and Signup buttons
  if (!authed) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="text-sm font-medium text-foreground hover:text-primary transition-colors"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  // When logged in: Show user icon with dropdown menu
  return (
    <div className="flex items-center gap-4">
      <Link href={homeHref} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
        Home
      </Link>
      <div className="relative group">
        <button
          aria-label="User menu"
          className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 hover:bg-accent transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-foreground"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="hidden sm:inline text-sm font-medium text-foreground">{role ?? "User"}</span>
        </button>
        <div className="absolute right-0 z-50 mt-2 hidden w-48 rounded-lg border border-border bg-background p-2 shadow-lg group-hover:block">
          {role === "STUDENT" && (
            <Link
              href="/student/dashboard"
              className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
            >
              Student Portal
            </Link>
          )}
          {role === "ADMIN" && (
            <Link
              href="/admin"
              className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
            >
              Admin Portal
            </Link>
          )}
          <button
            onClick={() => {
              clearTokens();
              window.location.href = "/";
            }}
            className="mt-1 block w-full rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-accent transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
