import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateContent } from "@/lib/grok";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bullet } = await req.json();
    if (!bullet || bullet.trim().length < 5) {
      return NextResponse.json({ error: "Please enter a bullet point to improve" }, { status: 400 });
    }

    const prompt = `You are an expert resume writer specializing in helping software developers and tech professionals.
Rewrite this resume bullet point into 3 stronger versions using the XYZ formula: 
'Accomplished [X] as measured by [Y] by doing [Z]'

Rules:
- Start each with a strong action verb (never 'Worked on', 'Helped with', 'Was responsible for')
- Add specific metrics where possible (%, time saved, users impacted, revenue). If no real metrics given, use realistic placeholder format like [X%] to show where candidate should add their real number
- Keep each under 20 words
- Make them ATS-friendly with relevant tech keywords
- Only use information from the original bullet — do not invent experience that wasn't implied

ORIGINAL BULLET:
${bullet}

Return ONLY valid JSON:
{
  "original": "${bullet.replace(/"/g, '\\"')}",
  "improved": [
    { 
      "version": 1, 
      "text": "<improved bullet>",
      "whyBetter": "<one sentence explaining the improvement>"
    },
    { "version": 2, "text": "...", "whyBetter": "..." },
    { "version": 3, "text": "...", "whyBetter": "..." }
  ],
  "actionVerbUsed": ["verb1", "verb2", "verb3"],
  "tip": "<one general tip about this bullet>"
}`;

    const responseText = await generateContent(prompt);
    
    // Clean JSON response
    let cleanJson = responseText.trim();
    if (cleanJson.startsWith("```json")) {
      cleanJson = cleanJson.replace(/^```json\n/, "").replace(/\n```$/, "");
    } else if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```\n/, "").replace(/\n```$/, "");
    }
    
    const result = JSON.parse(cleanJson);
    return NextResponse.json(result);

  } catch (error: unknown) {
    console.error("Improve Bullet API Error:", error);
    return NextResponse.json({ error: "Failed to improve bullet. Try again." }, { status: 500 });
  }
}
