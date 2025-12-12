import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = await req.json();
    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token required" }, { status: 400 });
    }

    const payload = verifyRefreshToken(refreshToken);
    const tokens = await prisma.refreshToken.findMany({
      where: { userId: payload.sub },
    });

    const now = new Date();
    const valid = await Promise.all(
      tokens.map(async (t) => {
        const match = await bcrypt.compare(refreshToken, t.token);
        return match && t.expiresAt > now;
      })
    );

    if (!valid.some(Boolean)) {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
    }

    const accessToken = signAccessToken(payload);
    const newRefresh = signRefreshToken(payload);
    const refreshHash = await bcrypt.hash(newRefresh, 10);

    await prisma.refreshToken.create({
      data: {
        token: refreshHash,
        userId: payload.sub,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({
      accessToken,
      refreshToken: newRefresh,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to refresh token" }, { status: 400 });
  }
}

