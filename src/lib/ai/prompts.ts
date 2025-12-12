type BaseContext = {
  courseName: string;
  semester: number | null;
  subjectName: string;
  syllabusTopics: string[];
  syllabusContent?: string; // Full syllabus with modules, units, and details
  difficulty?: string;
};

type MCQConfig = BaseContext & {
  count: number;
};

type QAConfig = BaseContext & {
  count: number;
  typeLabel: string;
};

export function buildMCQPrompt(config: MCQConfig) {
  const topics = config.syllabusTopics.length
    ? config.syllabusTopics.join(", ")
    : "the provided syllabus";
  
  const syllabusSection = config.syllabusContent
    ? `\n\nComplete Syllabus:\n${config.syllabusContent}\n`
    : `\n\nSyllabus topics: ${topics}\n`;
  
  return `
You are an expert examiner for ${config.courseName}.
Create ${config.count} unique, non-repeated MCQs for ${config.subjectName}${
    config.semester ? ` (semester ${config.semester})` : ""
  }.
Difficulty: ${config.difficulty ?? "mixed"}.${syllabusSection}
Return JSON: [{ "id", "stem", "options": ["A","B","C","D"], "answer", "explanation", "difficulty", "topicRef" }]
Ensure the questions are new and not reformulations of each other. Each question should test understanding of the syllabus content.`;
}

export function buildQASetPrompt(config: QAConfig) {
  const topics = config.syllabusTopics.length
    ? config.syllabusTopics.join(", ")
    : "the provided syllabus";
  
  const syllabusSection = config.syllabusContent
    ? `\n\nComplete Syllabus:\n${config.syllabusContent}\n`
    : `\n\nSyllabus topics: ${topics}\n`;
  
  return `
Generate ${config.count} unique ${config.typeLabel} questions for ${config.subjectName}${
    config.semester ? ` (semester ${config.semester})` : ""
  } in the ${config.courseName} program.
Difficulty: ${config.difficulty ?? "mixed"}.${syllabusSection}
Return JSON: [{ "id", "prompt", "idealPoints": ["point1", ...], "difficulty", "topicRef" }].
Each question should test understanding of the syllabus content. The idealPoints should align with the syllabus modules and units.`;
}

export function buildEvaluationPrompt(params: {
  courseName: string;
  subjectName: string;
  question: string;
  idealPoints: string[];
  studentAnswer: string;
  maxScore: number;
}) {
  return `
You are grading answers for ${params.courseName} - ${params.subjectName}.
Question: ${params.question}
Ideal points: ${params.idealPoints.join("; ")}
Student answer: ${params.studentAnswer}
Provide JSON: {
  "score": 0 to ${params.maxScore},
  "strengths": ["..."],
  "weaknesses": ["..."],
  "suggestions": ["..."],
  "rubricBreakdown": [{"point": "topic", "achieved": true/false}]
}
Be concise, fair, and align with the syllabus emphasis.`;
}

