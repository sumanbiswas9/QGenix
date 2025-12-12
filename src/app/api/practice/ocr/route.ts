import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ocrGradeSchema } from "@/lib/validation";
import { extractTextFromImage } from "@/lib/ocr/client";
import { gradeFreeform } from "@/lib/ai/evaluation";

export async function POST(req: NextRequest) {
  try {
    const parsed = ocrGradeSchema.parse(await req.json());
    const subject = await prisma.subject.findUnique({
      where: { id: parsed.subjectId },
      include: { semester: { include: { course: true } } },
    });

    if (!subject || !subject.semester) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    const ocrResult = await extractTextFromImage({
      imageUrl: parsed.imageUrl,
      fileKey: parsed.fileKey,
    });

    const question = parsed.question as any;
    const evaluation = await gradeFreeform({
      courseName: subject.semester.course.name,
      subjectName: subject.name,
      question: question.prompt ?? question.stem ?? "",
      idealPoints: question.idealPoints ?? [],
      answer: ocrResult.text,
      maxScore: question.marks ?? 10,
    });

    return NextResponse.json({
      ocrText: ocrResult.text,
      evaluation,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to process OCR grading" }, { status: 400 });
  }
}

