"use client";

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

type TokenPayload = {
  sub: string;
  role: "STUDENT" | "ADMIN";
};

const ACCESS_KEY = "app.accessToken";
const REFRESH_KEY = "app.refreshToken";

export function saveTokens(tokens: AuthTokens) {
  localStorage.setItem(ACCESS_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function getTokens(): Partial<AuthTokens> {
  return {
    accessToken: localStorage.getItem(ACCESS_KEY) ?? undefined,
    refreshToken: localStorage.getItem(REFRESH_KEY) ?? undefined,
  };
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

export function getUserRole(): "STUDENT" | "ADMIN" | null {
  const { accessToken } = getTokens();
  if (!accessToken) return null;
  const payload = decodeToken(accessToken);
  return payload?.role ?? null;
}

