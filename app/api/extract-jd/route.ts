import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateContent } from "@/lib/grok";
import { z } from "zod";

const extractSchema = z.object({
  title: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  salaryMin: z.number().nullable().optional(),
  salaryMax: z.number().nullable().optional()
});

async function getValidatedExtraction(prompt: string, maxRetries = 1) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const raw = await generateContent(prompt);
    const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    try {
      const json = JSON.parse(cleaned);
      return extractSchema.parse(json);
    } catch (err) {
      if (attempt === maxRetries) throw err;
      console.warn(`Extraction parse/validation failed, retrying (attempt ${attempt + 1})`);
    }
  }
  throw new Error("Failed to get valid extraction after retries");
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const prompt = `
      Extract the following details from the job description text below and return ONLY a JSON object.
      Do not include markdown formatting like \`\`\`json.
      
      Fields to extract:
      - title (Job Title)
      - company (Company Name)
      - location (Location)
      - salaryMin (Minimum Salary as number, null if not found)
      - salaryMax (Maximum Salary as number, null if not found)
      
      Job Description:
      ${text.substring(0, 10000)} // Limit text length to avoid token limits
    `;

    const data = await getValidatedExtraction(prompt);

    return NextResponse.json(data);
  } catch (error) {
    console.error("AI Extraction Error:", error);
    return NextResponse.json({ error: "Failed to extract data" }, { status: 500 });
  }
}
