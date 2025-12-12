import { NextRequest, NextResponse } from "next/server";
import { PracticeType, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { practiceGradeSchema } from "@/lib/validation";
import { gradeMCQ, gradeFreeform } from "@/lib/ai/evaluation";
import { ensureRole, getUserFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!ensureRole(user, [Role.STUDENT, Role.ADMIN])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = practiceGradeSchema.parse(await req.json());
    const subject = await prisma.subject.findUnique({
      where: { id: parsed.subjectId },
      include: { semester: { include: { course: true } } },
    });

    if (!subject || !subject.semester) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    if (parsed.type === PracticeType.MCQ) {
      const result = gradeMCQ({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        questions: parsed.questions,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        responses: parsed.responses,
      });
      
      // Convert breakdown to results format for consistency
      const totalQuestions = parsed.questions.length;
      const correctCount = result.breakdown.filter((b: any) => b.correct === true).length;
      const percentageScore = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
      
      // Debug logging
      console.log("MCQ Grading:", {
        totalQuestions,
        correctCount,
        percentageScore,
        breakdown: result.breakdown.map((b: any) => ({
          id: b.id,
          correct: b.correct,
          expected: b.expected,
          got: b.got,
        })),
      });
      
      const evaluation = {
        breakdown: result.breakdown,
        results: result.breakdown.map((b: any) => ({
          correct: b.correct,
          feedback: b.correct ? "Correct!" : `Incorrect. Correct answer: ${b.expected}`,
        })),
        totalCorrect: correctCount,
        totalQuestions: totalQuestions,
      };
      
      return NextResponse.json({ evaluation, score: percentageScore });
    }

    // For SAQ / LA / Handwritten typed text after OCR
    const freeformResults = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      parsed.questions.map(async (q: any) => {
        const answer = parsed.responses[q.id] ?? "";
        const evalResult = await gradeFreeform({
          courseName: subject.semester!.course.name,
          subjectName: subject.name,
          question: q.prompt ?? q.stem ?? "",
          idealPoints: q.idealPoints ?? [],
          answer,
          maxScore: parsed.maxScore ?? q.marks ?? 10,
        });
        return { id: q.id, ...evalResult };
      })
    );

    const totalScore = freeformResults.reduce(
      (acc, curr) => acc + (Number(curr.score) || 0),
      0
    );

    return NextResponse.json({
      evaluation: freeformResults,
      score: totalScore,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to grade attempt" }, { status: 400 });
  }
}

