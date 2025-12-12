import { NextRequest, NextResponse } from "next/server";
import { PracticeType, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { practiceGenerateSchema } from "@/lib/validation";
import { buildMCQPrompt, buildQASetPrompt } from "@/lib/ai/prompts";
import { runJsonPrompt } from "@/lib/ai/mistral";
import { ensureRole, getUserFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!ensureRole(user, [Role.STUDENT, Role.ADMIN])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = practiceGenerateSchema.parse(body);

    const subject = await prisma.subject.findUnique({
      where: { id: parsed.subjectId },
      include: {
        semester: { include: { course: true } },
        syllabus: true,
      },
    });

    if (!subject || !subject.semester) {
      return NextResponse.json({ error: "Subject not found or has no semester" }, { status: 404 });
    }

    if (!subject.syllabus || subject.syllabus.length === 0) {
      return NextResponse.json(
        { error: "No syllabus items found. Please add syllabus items first." },
        { status: 400 }
      );
    }

    // Build comprehensive syllabus content for better question generation
    const syllabusContent = subject.syllabus.map((s) => {
      const moduleUnit = `Module ${s.module}, Unit ${s.unit}`;
      const topic = s.topic;
      const details = s.details ? ` (${s.details})` : "";
      return `${moduleUnit}: ${topic}${details}`;
    }).join("\n");
    
    const syllabusTopics = subject.syllabus.map((s) => s.topic);
    let prompt = "";

    if (parsed.type === PracticeType.MCQ) {
      prompt = buildMCQPrompt({
        courseName: subject.semester.course.name,
        semester: subject.semester.number,
        subjectName: subject.name,
        syllabusTopics,
        syllabusContent,
        difficulty: parsed.difficulty,
        count: parsed.count,
      });
    } else {
      prompt = buildQASetPrompt({
        courseName: subject.semester.course.name,
        semester: subject.semester.number,
        subjectName: subject.name,
        syllabusTopics,
        syllabusContent,
        difficulty: parsed.difficulty,
        count: parsed.count,
        typeLabel:
          parsed.type === PracticeType.SAQ
            ? "short answer questions"
            : "long answer/essay questions",
      });
    }

    const questions = await runJsonPrompt(prompt);
    return NextResponse.json({ questions });
  } catch (error: any) {
    console.error("Practice generation error:", error);
    
    // More specific error messages
    if (error?.issues) {
      return NextResponse.json(
        { error: `Validation error: ${error.issues[0]?.message || "Invalid input"}` },
        { status: 400 }
      );
    }
    
    if (error?.message?.includes("MISTRAL_API_KEY")) {
      return NextResponse.json(
        { error: "AI service not configured. Please set MISTRAL_API_KEY." },
        { status: 500 }
      );
    }
    
    if (error?.message?.includes("JSON")) {
      return NextResponse.json(
        { error: "AI returned invalid response. Please try again." },
        { status: 500 }
      );
    }

    const message = error?.message || "Unable to generate questions";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

