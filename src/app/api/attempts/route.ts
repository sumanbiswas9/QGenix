import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { attemptSchema } from "@/lib/validation";
import { ensureRole, getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const attemptIdParam = req.nextUrl.searchParams.get("id");
  const userIdParam = req.nextUrl.searchParams.get("userId");
  const subjectIdParam = req.nextUrl.searchParams.get("subjectId");
  const modeParam = req.nextUrl.searchParams.get("mode");
  const typeParam = req.nextUrl.searchParams.get("type");
  const limitParam = req.nextUrl.searchParams.get("limit");

  const isAdmin = user.role === Role.ADMIN;
  const userId = isAdmin && userIdParam ? userIdParam : user.sub;

  const where: any = { userId };
  
  // If fetching by specific attempt ID, use that
  if (attemptIdParam) {
    where.id = attemptIdParam;
  } else {
    // Otherwise use other filters
    if (subjectIdParam) where.subjectId = subjectIdParam;
    if (modeParam) where.mode = modeParam;
    if (typeParam) where.type = typeParam;
  }

  const attempts = await prisma.attempt.findMany({
    where,
    include: {
      subject: { include: { semester: { include: { course: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: limitParam ? parseInt(limitParam, 10) : undefined,
  });

  return NextResponse.json({ attempts });
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const parsed = attemptSchema.parse(await req.json());
    const attempt = await prisma.attempt.create({
      data: {
        userId: user.sub,
        subjectId: parsed.subjectId,
        type: parsed.type,
        mode: parsed.mode,
        questions: parsed.questions,
        responses: parsed.responses,
        evaluation: parsed.evaluation,
        score: parsed.score,
      },
    });
    return NextResponse.json({ attempt });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to record attempt" }, { status: 400 });
  }
}

