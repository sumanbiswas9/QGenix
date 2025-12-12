"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { clearTokens, getTokens, getUserRole } from "@/lib/clientAuth";

const navigation = [
  { label: "Dashboard", icon: "🏠", href: "/student/dashboard" },
  { label: "Practice", icon: "🎯", href: "/student/practice" },
  { label: "Mock Exams", icon: "📝", href: "/student/mock-exams" },
  { label: "History", icon: "🕒", href: "/student/history" },
  { label: "Scorecard", icon: "📊", href: "/student/scorecard" },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const { accessToken } = getTokens();
    if (!accessToken) {
      router.replace("/login");
      return;
    }

    const role = getUserRole();
    if (role === "ADMIN") {
      router.replace("/admin");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex bg-linear-to-br from-slate-50 to-blue-50/20">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Student Portal</h1>
          <p className="text-sm text-gray-600 mt-1">Practice & Learn</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              clearTokens();
              router.push("/login");
            }}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
