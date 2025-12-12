import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ensureRole, getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userIdParam = req.nextUrl.searchParams.get("userId");
  const subjectIdParam = req.nextUrl.searchParams.get("subjectId");
  
  const isAdmin = user.role === Role.ADMIN;
  const userId = isAdmin && userIdParam ? userIdParam : user.sub;
  
  const where: any = { userId };
  if (subjectIdParam) where.subjectId = subjectIdParam;

  const attempts = await prisma.attempt.findMany({
    where,
    include: { subject: { include: { semester: { include: { course: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  const totalAttempts = attempts.length;
  const avgScore =
    attempts.reduce((acc, a) => acc + (a.score ?? 0), 0) / (attempts.length || 1);

  // By subject
  const bySubject = attempts.reduce<Record<string, { count: number; total: number; subjectId: string }>>(
    (acc, attempt) => {
      const key = attempt.subject.name;
      if (!acc[key]) acc[key] = { count: 0, total: 0, subjectId: attempt.subjectId };
      acc[key].count += 1;
      acc[key].total += attempt.score ?? 0;
      return acc;
    },
    {}
  );

  const subjectStats = Object.entries(bySubject).map(([subject, value]) => ({
    subject,
    subjectId: value.subjectId,
    count: value.count,
    avgScore: value.total / value.count,
  }));

  // By type
  const byType = attempts.reduce<Record<string, { count: number; total: number }>>(
    (acc, attempt) => {
      const key = attempt.type;
      if (!acc[key]) acc[key] = { count: 0, total: 0 };
      acc[key].count += 1;
      acc[key].total += attempt.score ?? 0;
      return acc;
    },
    {}
  );

  const typeStats = Object.entries(byType).map(([type, value]) => ({
    type,
    count: value.count,
    avgScore: value.total / value.count,
  }));

  // Recent attempts
  const recentAttempts = attempts.slice(0, 5).map((a) => ({
    id: a.id,
    subject: a.subject.name,
    type: a.type,
    mode: a.mode,
    score: a.score,
    createdAt: a.createdAt,
  }));

  return NextResponse.json({
    totalAttempts,
    avgScore,
    subjectStats,
    typeStats,
    recentAttempts,
  });
}

