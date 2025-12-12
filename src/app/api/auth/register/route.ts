import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  signAccessToken,
  signRefreshToken,
} from "@/lib/auth";
import { registerSchema } from "@/lib/validation";
import bcrypt from "bcryptjs";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = registerSchema.parse(json);

    const existing = await prisma.user.findUnique({
      where: { email: parsed.email },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(parsed.password);
    const user = await prisma.user.create({
      data: {
        email: parsed.email,
        passwordHash,
        role: parsed.role ?? Role.STUDENT,
      },
    });

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
    return NextResponse.json({ error: "Unable to register" }, { status: 400 });
  }
}

