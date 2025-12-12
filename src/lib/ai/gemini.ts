import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL_NAME = "gemini-2.0-flash-exp"; // Latest model with better capabilities

function getModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY missing");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: MODEL_NAME });
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runJsonPrompt(prompt: string, retries = 3) {
  const model = getModel();
  const start = Date.now();
  console.log("AI request start:", { length: prompt.length });
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { 
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const text = result.response.text();
      if (!text) {
        throw new Error("AI returned empty response");
      }
      
      try {
        const parsed = JSON.parse(text);
        console.log("AI request success:", { ms: Date.now() - start });
        return parsed;
      } catch (parseError) {
        console.error("JSON parse error:", text);
        throw new Error("AI did not return valid JSON format");
      }
    } catch (error: any) {
      console.error(`Gemini API error (attempt ${attempt + 1}/${retries + 1}):`, error);
      
      // Check if it's a rate limit error
      if (error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("quota")) {
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s, 4s
          console.log(`Rate limited. Retrying in ${delay}ms...`);
          await sleep(delay);
          continue; // Retry
        }
        throw new Error("AI service rate limit exceeded. Please try again in a few minutes.");
      }
      
      if (error?.message?.includes("API key")) {
        throw new Error("Invalid or missing GEMINI_API_KEY");
      }
      
      if (error?.status === 503) {
        if (attempt < retries) {
          await sleep(2000);
          continue;
        }
        throw new Error("AI service temporarily unavailable. Please try again.");
      }
      
      // If not retryable or last attempt, throw the error
      if (attempt === retries) {
        console.error("AI request failed after retries:", { ms: Date.now() - start });
        throw error;
      }
      
      // Wait a bit before retrying for other errors
      await sleep(1000);
    }
  }
  
  throw new Error("Failed after multiple retries");
}

