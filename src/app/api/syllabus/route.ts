import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ensureRole, getUserFromRequest } from "@/lib/auth";
import { syllabusItemSchema } from "@/lib/validation";

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!ensureRole(user, [Role.STUDENT, Role.ADMIN])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subjectId = req.nextUrl.searchParams.get("subjectId");
  if (!subjectId) {
    return NextResponse.json({ error: "subjectId required" }, { status: 400 });
  }
  const items = await prisma.syllabusItem.findMany({
    where: { subjectId },
    orderBy: [{ module: "asc" }, { unit: "asc" }],
  });
  return NextResponse.json({ syllabus: items });
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!ensureRole(user, [Role.ADMIN])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    
    // Handle both single item and array of items
    const items = Array.isArray(body) ? body : [body];
    const parsed = syllabusItemSchema.array().parse(items);
    
    const created = await prisma.$transaction(
      parsed.map((item) =>
        prisma.syllabusItem.create({
          data: {
            subjectId: item.subjectId,
            module: item.module,
            unit: item.unit,
            topic: item.topic,
            details: item.details,
          },
        })
      )
    );
    return NextResponse.json({ syllabus: created });
  } catch (error: any) {
    console.error("Syllabus creation error:", error);
    const message = error?.issues?.[0]?.message || error?.message || "Unable to create syllabus";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!ensureRole(user, [Role.ADMIN])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const parsed = syllabusItemSchema.required({ id: true }).parse(await req.json());
    const item = await prisma.syllabusItem.update({
      where: { id: parsed.id },
      data: {
        module: parsed.module,
        unit: parsed.unit,
        topic: parsed.topic,
        details: parsed.details,
      },
    });
    return NextResponse.json({ syllabusItem: item });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to update syllabus item" }, { status: 400 });
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
    await prisma.syllabusItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to delete syllabus item" }, { status: 400 });
  }
}

