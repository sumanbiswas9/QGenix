import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ensureRole, getUserFromRequest } from "@/lib/auth";
import { subjectSchema } from "@/lib/validation";

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!ensureRole(user, [Role.STUDENT, Role.ADMIN])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const semesterId = req.nextUrl.searchParams.get("semesterId");
  const where = semesterId ? { semesterId } : {};
  const subjects = await prisma.subject.findMany({
    where,
    include: { syllabus: true },
  });
  return NextResponse.json({ subjects });
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!ensureRole(user, [Role.ADMIN])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const parsed = subjectSchema.parse(await req.json());
    const subject = await prisma.subject.create({
      data: {
        name: parsed.name,
        semesterId: parsed.semesterId,
      },
    });
    return NextResponse.json({ subject });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to create subject" }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!ensureRole(user, [Role.ADMIN])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const parsed = subjectSchema.required({ id: true }).parse(await req.json());
    const subject = await prisma.subject.update({
      where: { id: parsed.id },
      data: { name: parsed.name },
    });
    return NextResponse.json({ subject });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to update subject" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!ensureRole(user, [Role.ADMIN])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await req.json();
    if (!id) throw new Error("id required");
    await prisma.subject.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to delete subject" }, { status: 400 });
  }
}

