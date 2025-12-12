import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { Role } from "@prisma/client";

export type AuthTokenPayload = {
  sub: string;
  role: Role;
};

const ACCESS_EXPIRES_IN = "15m";
const REFRESH_EXPIRES_IN = "7d";

function getEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signAccessToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, getEnv("JWT_ACCESS_SECRET"), {
    expiresIn: ACCESS_EXPIRES_IN,
  });
}

export function signRefreshToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, getEnv("JWT_REFRESH_SECRET"), {
    expiresIn: REFRESH_EXPIRES_IN,
  });
}

export function verifyAccessToken(token: string): AuthTokenPayload {
  return jwt.verify(token, getEnv("JWT_ACCESS_SECRET")) as AuthTokenPayload;
}

export function verifyRefreshToken(token: string): AuthTokenPayload {
  return jwt.verify(token, getEnv("JWT_REFRESH_SECRET")) as AuthTokenPayload;
}

export function parseAuthHeader(req: NextRequest): string | null {
  const header = req.headers.get("authorization");
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

export function getUserFromRequest(req: NextRequest): AuthTokenPayload | null {
  try {
    const token = parseAuthHeader(req);
    if (!token) return null;
    return verifyAccessToken(token);
  } catch (error) {
    return null;
  }
}

export function ensureRole(
  payload: AuthTokenPayload | null,
  allowed: Role[] = [Role.STUDENT, Role.ADMIN]
): payload is AuthTokenPayload {
  if (!payload) return false;
  return allowed.includes(payload.role);
}

