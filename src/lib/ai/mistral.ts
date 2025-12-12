import { Mistral } from "@mistralai/mistralai";

const MODEL_NAME = process.env.MISTRAL_MODEL ?? "mistral-large-latest";

function getClient() {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    throw new Error("Missing MISTRAL_API_KEY in environment");
  }
  return new Mistral({ apiKey });
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runJsonPrompt(prompt: string, retries = 3): Promise<any> {
  const client = getClient();
  const start = Date.now();
  let attempt = 0;
  let lastErr: any;

  while (attempt < retries) {
    attempt += 1;
    try {
      const response = await client.chat.complete({
        model: MODEL_NAME,
        messages: [
          {
            role: "system",
            content: "You are a strict JSON generator. Return ONLY valid JSON without commentary. Do not include any markdown formatting or code blocks.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        responseFormat: { type: "json_object" },
        temperature: 0.7,
      });

      const choice = response.choices?.[0];
      const message = choice?.message;
      if (!message || !message.content) {
        throw new Error("Empty Mistral AI response");
      }

      const content = message.content;
      const text = typeof content === "string" ? content : Array.isArray(content) ? content.map((c: any) => c.text || "").join("") : String(content);
      
      // Remove markdown code blocks if present
      const cleanedText = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();

      try {
        const parsed = JSON.parse(cleanedText);
        const took = Date.now() - start;
        console.log(`[mistral.runJsonPrompt] success in ${took}ms`);
        return parsed;
      } catch (parseError) {
        console.error("JSON parse error. Raw response:", cleanedText);
        throw new Error("Mistral AI did not return valid JSON format");
      }
    } catch (err: any) {
      lastErr = err;
      const took = Date.now() - start;
      console.warn(
        `[mistral.runJsonPrompt] attempt ${attempt} failed in ${took}ms: ${err?.message ?? err}`
      );

      // Check for rate limiting
      if (err?.status === 429 || err?.message?.includes("429") || err?.message?.includes("rate limit")) {
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s, 4s
          console.log(`Rate limited. Retrying in ${delay}ms...`);
          await sleep(delay);
          continue;
        }
        throw new Error("Mistral AI service rate limit exceeded. Please try again in a few minutes.");
      }

      // Check for API key errors
      if (err?.status === 401 || err?.message?.includes("API key") || err?.message?.includes("authentication")) {
        throw new Error("Invalid or missing MISTRAL_API_KEY");
      }

      // Check for service unavailable
      if (err?.status === 503 || err?.status === 502) {
        if (attempt < retries) {
          await sleep(2000);
          continue;
        }
        throw new Error("Mistral AI service temporarily unavailable. Please try again.");
      }

      // Wait before retrying for other errors
      if (attempt < retries) {
        await sleep(500 * attempt);
      }
    }
  }

  throw new Error(
    `Mistral AI runJsonPrompt failed after ${retries} retries: ${lastErr?.message ?? lastErr}`
  );
}
