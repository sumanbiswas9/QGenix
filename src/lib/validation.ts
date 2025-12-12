import { z } from "zod";

const RoleEnum = z.enum(["STUDENT", "ADMIN"]);
const PracticeTypeEnum = z.enum(["MCQ", "SAQ", "LA", "HANDWRITTEN"]);
const DifficultyEnum = z.enum(["EASY", "MEDIUM", "HARD"]);
const AttemptModeEnum = z.enum(["PRACTICE", "MOCK"]);

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: RoleEnum.optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const courseSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
});

export const semesterSchema = z.object({
  id: z.string().optional(),
  courseId: z.string(),
  number: z.number().int().min(1),
});

export const subjectSchema = z.object({
  id: z.string().optional(),
  semesterId: z.string(),
  name: z.string().min(2),
});

export const syllabusItemSchema = z.object({
  id: z.string().optional(),
  subjectId: z.string(),
  module: z.number().int().min(1),
  unit: z.number().int().min(1),
  topic: z.string().min(1),
  details: z.string().optional(),
});

export const mockExamPatternSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3),
  subjectId: z.string(),
  sections: z
    .array(
      z.object({
        name: z.string(),
        count: z.number().int().min(1),
        marks: z.number().int().min(1),
        type: PracticeTypeEnum,
        difficulty: DifficultyEnum.optional(),
      })
    )
    .min(1),
});

export const practiceGenerateSchema = z.object({
  subjectId: z.string(),
  type: PracticeTypeEnum,
  difficulty: DifficultyEnum.optional(),
  count: z.number().int().min(1).max(20).default(5),
});

export const practiceGradeSchema = z.object({
  subjectId: z.string(),
  type: PracticeTypeEnum,
  questions: z.any(),
  responses: z.any(),
  maxScore: z.number().optional(),
});

export const ocrGradeSchema = z.object({
  subjectId: z.string(),
  question: z.any(),
  imageUrl: z.string().url().optional(),
  fileKey: z.string().optional(),
});

export const attemptSchema = z.object({
  id: z.string().optional(),
  subjectId: z.string(),
  type: PracticeTypeEnum,
  mode: AttemptModeEnum,
  questions: z.any(),
  responses: z.any(),
  evaluation: z.any(),
  score: z.number().optional(),
});

