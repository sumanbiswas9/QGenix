import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { courseSchema } from "@/lib/validation";
import { ensureRole, getUserFromRequest } from "@/lib/auth";

export async function GET() {
  const courses = await prisma.course.findMany({
    include: {
      semesters: {
        include: {
          subjects: true,
        },
      },
    },
  });
  return NextResponse.json({ courses });
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!ensureRole(user, [Role.ADMIN])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const parsed = courseSchema.parse(await req.json());
    const course = await prisma.course.create({ data: { name: parsed.name } });
    return NextResponse.json({ course });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to create course" }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!ensureRole(user, [Role.ADMIN])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const parsed = courseSchema.required({ id: true }).parse(await req.json());
    const course = await prisma.course.update({
      where: { id: parsed.id },
      data: { name: parsed.name },
    });
    return NextResponse.json({ course });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to update course" }, { status: 400 });
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
    await prisma.course.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to delete course" }, { status: 400 });
  }
}

