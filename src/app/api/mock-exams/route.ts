import { NextRequest, NextResponse } from "next/server";
import { PracticeType, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ensureRole, getUserFromRequest } from "@/lib/auth";
import { mockExamPatternSchema } from "@/lib/validation";
import { buildMCQPrompt, buildQASetPrompt } from "@/lib/ai/prompts";
import { runJsonPrompt } from "@/lib/ai/mistral";

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!ensureRole(user, [Role.STUDENT, Role.ADMIN])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Admins see all exams (draft + published), students only see published
  const where = user.role === Role.ADMIN ? {} : { published: true };
  
  const exams = await prisma.mockExamPattern.findMany({
    where,
    include: { subject: { include: { semester: { include: { course: true } } } } },
    orderBy: { createdAt: 'desc' },
  });
  
  // Map to include subjectId at top level for easier access
  const mappedExams = exams.map((exam) => ({
    id: exam.id,
    title: exam.title,
    published: exam.published,
    questions: exam.questions,
    subjectId: exam.subjectId,
    subject: exam.subject,
  }));
  
  return NextResponse.json({ exams: mappedExams });
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!ensureRole(user, [Role.ADMIN])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    console.log("POST /api/mock-exams body:", body);
    
    const parsed = mockExamPatternSchema.parse(body);
    console.log("Validation passed:", parsed);
    
    const pattern = await prisma.mockExamPattern.create({
      data: {
        title: parsed.title,
        subjectId: parsed.subjectId,
        sections: parsed.sections,
        createdById: user.sub,
      },
    });
    console.log("Pattern created:", pattern.id);
    
    return NextResponse.json({ pattern });
  } catch (error) {
    console.error("POST /api/mock-exams error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unable to create mock exam pattern";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!ensureRole(user, [Role.ADMIN])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id } = body;
    console.log("PUT /api/mock-exams body:", body);
    
    if (!id) throw new Error("id required");

    const pattern = await prisma.mockExamPattern.findUnique({
      where: { id },
      include: { subject: { include: { semester: { include: { course: true } }, syllabus: true } } },
    });

    console.log("Pattern found:", pattern?.id, "Syllabus items:", pattern?.subject.syllabus.length);

    if (!pattern || !pattern.subject.semester) {
      return NextResponse.json({ error: "Pattern not found" }, { status: 404 });
    }

    const syllabusTopics = pattern.subject.syllabus.map((s) => s.topic);
    const syllabusContent = pattern.subject.syllabus.map((s) => {
      const moduleUnit = `Module ${s.module}, Unit ${s.unit}`;
      const topic = s.topic;
      const details = s.details ? ` (${s.details})` : "";
      return `${moduleUnit}: ${topic}${details}`;
    }).join("\n");
    
    if (syllabusTopics.length === 0) {
      return NextResponse.json({ 
        error: "No syllabus items found for this subject. Please add syllabus items before publishing." 
      }, { status: 400 });
    }

    const questionsBySection = [];

    for (const section of pattern.sections as any[]) {
      console.log("Generating questions for section:", section.name, section.count, "questions");
      
      let prompt = "";
      if (section.type === PracticeType.MCQ) {
        prompt = buildMCQPrompt({
          courseName: pattern.subject.semester.course.name,
          semester: pattern.subject.semester.number,
          subjectName: pattern.subject.name,
          syllabusTopics,
          syllabusContent,
          difficulty: section.difficulty,
          count: section.count,
        });
      } else {
        prompt = buildQASetPrompt({
          courseName: pattern.subject.semester.course.name,
          semester: pattern.subject.semester.number,
          subjectName: pattern.subject.name,
          syllabusTopics,
          syllabusContent,
          difficulty: section.difficulty,
          count: section.count,
          typeLabel:
            section.type === PracticeType.SAQ
              ? "short answer questions"
              : "long answer/essay questions",
        });
      }
      
      console.log("Calling AI for section:", section.name);
      const generated = await runJsonPrompt(prompt);
      console.log("Generated questions:", generated?.length || 0);
      questionsBySection.push({ ...section, questions: generated });
    }

    console.log("Updating pattern with generated questions");
    const updated = await prisma.mockExamPattern.update({
      where: { id },
      data: {
        questions: questionsBySection,
        published: true,
      },
    });

    console.log("Pattern published successfully:", updated.id);
    return NextResponse.json({ exam: updated });
  } catch (error) {
    console.error("PUT /api/mock-exams error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unable to publish mock exam";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}

