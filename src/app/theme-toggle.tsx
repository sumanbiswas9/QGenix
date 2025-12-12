"use client";

import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-foreground shadow-sm transition hover:border-primary hover:text-primary"
    >
      <span
        className={`h-2 w-2 rounded-full ${isDark ? "bg-amber-400" : "bg-indigo-500"}`}
        aria-hidden
      />
      {isDark ? "Dark" : "Light"}
    </button>
  );
}

