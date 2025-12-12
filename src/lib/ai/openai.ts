import OpenAI from "openai";

const MODEL_NAME = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY in environment");
  }
  return new OpenAI({ apiKey });
}

export async function runJsonPrompt(prompt: string, retries = 3): Promise<any> {
  const client = getClient();
  const start = Date.now();
  let attempt = 0;
  let lastErr: any;

  while (attempt < retries) {
    attempt += 1;
    try {
      const resp = await client.chat.completions.create({
        model: MODEL_NAME,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a strict JSON generator. Return ONLY valid JSON without commentary.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const choice = resp.choices?.[0];
      const message = choice?.message;
      if (!message) {
        throw new Error("Empty OpenAI response");
      }

      const content = message.content as any;
      const text = Array.isArray(content)
        ? content.find((c: any) => c?.type === "text")?.text ?? ""
        : (content as string) ?? "";

      const parsed = JSON.parse(text);
      const took = Date.now() - start;
      console.log(`[openai.runJsonPrompt] success in ${took}ms`);
      return parsed;
    } catch (err: any) {
      lastErr = err;
      const took = Date.now() - start;
      console.warn(
        `[openai.runJsonPrompt] attempt ${attempt} failed in ${took}ms: ${err?.message ?? err}`
      );
      await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }

  throw new Error(
    `OpenAI runJsonPrompt failed after ${retries} retries: ${lastErr?.message ?? lastErr}`
  );
}
