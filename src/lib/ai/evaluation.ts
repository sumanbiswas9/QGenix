import { buildEvaluationPrompt } from "./prompts";
import { runJsonPrompt } from "./mistral";

type MCQQuestion = {
  id: string;
  stem: string;
  options: string[];
  answer: string;
  marks?: number;
};

type MCQResponse = Record<string, string>;

export function gradeMCQ(params: {
  questions: MCQQuestion[];
  responses: MCQResponse;
}) {
  let score = 0;
  const breakdown = params.questions.map((q) => {
    const userResponse = params.responses[q.id]?.trim() || "";
    const correctAnswer = q.answer?.trim() || "";
    
    // Normalize comparison - handle multiple formats
    let isCorrect = false;
    
    // Direct match
    if (userResponse === correctAnswer) {
      isCorrect = true;
    } else {
      // Check if answer is a letter (A, B, C, D) and match by index
      const answerLetter = correctAnswer.toUpperCase();
      if (answerLetter.match(/^[A-D]$/) && q.options) {
        const answerIndex = answerLetter.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
        if (answerIndex >= 0 && answerIndex < q.options.length) {
          const correctOptionText = q.options[answerIndex]?.trim();
          if (userResponse === correctOptionText) {
            isCorrect = true;
          }
        }
      }
      
      // Check if user response is a letter and match by index
      const responseLetter = userResponse.toUpperCase();
      if (!isCorrect && responseLetter.match(/^[A-D]$/) && q.options) {
        const responseIndex = responseLetter.charCodeAt(0) - 65;
        if (responseIndex >= 0 && responseIndex < q.options.length) {
          const selectedOptionText = q.options[responseIndex]?.trim();
          const correctOptionIndex = correctAnswer.toUpperCase().charCodeAt(0) - 65;
          if (correctOptionIndex >= 0 && correctOptionIndex < q.options.length) {
            const correctOptionText = q.options[correctOptionIndex]?.trim();
            if (selectedOptionText === correctOptionText) {
              isCorrect = true;
            }
          }
        }
      }
      
      // Check if both are option texts (full text match)
      if (!isCorrect && q.options) {
        const correctOptionIndex = correctAnswer.toUpperCase().charCodeAt(0) - 65;
        if (correctOptionIndex >= 0 && correctOptionIndex < q.options.length) {
          const correctOptionText = q.options[correctOptionIndex]?.trim();
          if (userResponse === correctOptionText) {
            isCorrect = true;
          }
        }
      }
    }
    
    score += isCorrect ? q.marks ?? 1 : 0;
    
    // Get the display format of correct answer
    let expectedDisplay = correctAnswer;
    if (correctAnswer.match(/^[A-D]$/i) && q.options) {
      const idx = correctAnswer.toUpperCase().charCodeAt(0) - 65;
      if (idx >= 0 && idx < q.options.length) {
        expectedDisplay = q.options[idx];
      }
    }
    
    return { 
      id: q.id, 
      correct: isCorrect, 
      expected: expectedDisplay, 
      got: userResponse 
    };
  });
  return { score, breakdown };
}

export async function gradeFreeform(params: {
  courseName: string;
  subjectName: string;
  question: string;
  idealPoints: string[];
  answer: string;
  maxScore: number;
}) {
  const prompt = buildEvaluationPrompt({
    courseName: params.courseName,
    subjectName: params.subjectName,
    question: params.question,
    idealPoints: params.idealPoints,
    studentAnswer: params.answer,
    maxScore: params.maxScore,
  });

  const result = await runJsonPrompt(prompt);
  return result;
}

