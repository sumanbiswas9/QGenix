"use client";

import { getTokens, saveTokens, clearTokens } from "./clientAuth";

const jsonHeaders = { "Content-Type": "application/json" };

async function refreshIfNeeded() {
  const { refreshToken } = getTokens();
  if (!refreshToken) return null;
  const res = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) {
    clearTokens();
    return null;
  }
  const data = await res.json();
  if (data.accessToken && data.refreshToken) {
    saveTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    return data.accessToken as string;
  }
  return null;
}

export async function apiFetch<T = any>(
  url: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const { accessToken } = getTokens();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", headers.get("Content-Type") ?? "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401 && retry) {
    const newToken = await refreshIfNeeded();
    if (newToken) {
      return apiFetch<T>(url, options, false);
    }
  }

  if (!res.ok) {
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      throw new Error(json.error || json.message || text || "Request failed");
    } catch (parseError) {
      throw new Error(text || "Request failed");
    }
  }
  return (await res.json()) as T;
}

export function authStatus() {
  const { accessToken } = getTokens();
  return Boolean(accessToken);
}

