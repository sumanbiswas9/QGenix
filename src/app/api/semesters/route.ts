import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ensureRole, getUserFromRequest } from "@/lib/auth";
import { semesterSchema } from "@/lib/validation";

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!ensureRole(user, [Role.STUDENT, Role.ADMIN])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const courseId = req.nextUrl.searchParams.get("courseId");
  const where = courseId ? { courseId } : {};
  const semesters = await prisma.semester.findMany({
    where,
    include: { subjects: true },
  });
  return NextResponse.json({ semesters });
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!ensureRole(user, [Role.ADMIN])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const parsed = semesterSchema.parse(await req.json());
    const semester = await prisma.semester.create({
      data: {
        number: parsed.number,
        courseId: parsed.courseId,
      },
    });
    return NextResponse.json({ semester });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to create semester" }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!ensureRole(user, [Role.ADMIN])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const parsed = semesterSchema.required({ id: true }).parse(await req.json());
    const semester = await prisma.semester.update({
      where: { id: parsed.id },
      data: {
        number: parsed.number,
      },
    });
    return NextResponse.json({ semester });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to update semester" }, { status: 400 });
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
    await prisma.semester.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to delete semester" }, { status: 400 });
  }
}

