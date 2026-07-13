import Groq from "groq-sdk";

const modelId = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
const maxRetries = 3;

export async function generateContent(prompt: string, temp: number = 0.3): Promise<string> {
  const client = new Groq({
    apiKey: process.env.GROQ_API_KEY ?? "",
  });
  
  let lastError: unknown;
  let currentModel = modelId;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model: currentModel,
        messages: [{ role: "user", content: prompt }],
        temperature: temp, 
        max_tokens: 1024,
      });

      const text = response.choices[0]?.message?.content ?? "";
      return text;

    } catch (error: unknown) {
      lastError = error;
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`Groq error (attempt ${attempt + 1}):`, msg);

      const isRateLimit =
        msg.includes("429") ||
        msg.includes("rate_limit") ||
        msg.includes("Too Many Requests");

      if (isRateLimit && attempt < maxRetries) {
        console.warn(`Rate limited on ${currentModel} — falling back to llama-3.1-8b-instant...`);
        currentModel = "llama-3.1-8b-instant";
        await new Promise((r) => setTimeout(r, 1000));
        continue; // Try again with the fallback model
      }

      const isQuotaDepleted =
        msg.includes("quota") ||
        msg.includes("exceeded your");

      if (isQuotaDepleted) {
        throw new Error("Groq daily quota exhausted. Try again tomorrow.");
      }

      throw error;
    }
  }

  throw lastError;
}