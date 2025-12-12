import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  signAccessToken,
  signRefreshToken,
  verifyPassword,
} from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = loginSchema.parse(json);

    const user = await prisma.user.findUnique({
      where: { email: parsed.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await verifyPassword(parsed.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const payload = { sub: user.id, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    const refreshHash = await bcrypt.hash(refreshToken, 10);

    await prisma.refreshToken.create({
      data: {
        token: refreshHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({
      user: { id: user.id, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Unable to login" }, { status: 400 });
  }
}

