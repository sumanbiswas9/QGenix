import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./theme-provider";
import { ThemeToggle } from "./theme-toggle";
import { UserNavClient } from "./user-nav-client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Exam Platform",
  description: "AI-powered practice and mock exams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <div className="min-h-screen">
            <header className="sticky top-0 z-30 border-b border-border bg-surface/80 backdrop-blur">
              <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                <a href="/" className="text-lg font-semibold text-foreground">
                  QGenix
                </a>
                <nav className="flex items-center gap-4 text-sm text-foreground">
                  <UserNavClient />
                  <ThemeToggle />
                </nav>
              </div>
            </header>
            <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
