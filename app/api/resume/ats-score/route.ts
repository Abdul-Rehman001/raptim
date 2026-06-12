import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { User } from "@/models/User";
import { generateContent } from "@/lib/grok";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    await dbConnect();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.resumeText || user.resumeText.length < 100) {
      return NextResponse.json({ error: "Add your resume text first (min 100 chars)" }, { status: 400 });
    }

    // Check cache (7 days)
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    if (user.atsLastChecked && (Date.now() - new Date(user.atsLastChecked).getTime() < SEVEN_DAYS_MS)) {
      if (user.atsDetails) {
        return NextResponse.json(user.atsDetails);
      }
    }

    const prompt = `You are an expert ATS (Applicant Tracking System) consultant. Analyze this resume for ATS compatibility.
ATS systems parse resumes automatically — formatting issues, missing sections, and poor keyword density cause good candidates to be filtered out.

RESUME:
${user.resumeText}

Return ONLY valid JSON, no markdown, no explanation:
{
  "atsScore": <integer 0-100>,
  "verdict": "<one sentence overall assessment>",
  "sectionScores": {
    "contact": <0-100>,
    "summary": <0-100>,
    "experience": <0-100>,
    "skills": <0-100>,
    "education": <0-100>
  },
  "formatIssues": [
    "<specific issue found, e.g. 'Using tables which ATS cannot parse'>"
  ],
  "missingSections": [
    "<section name that is absent or weak>"
  ],
  "keywordDensity": "<low | medium | high>",
  "topRecommendations": [
    "<specific actionable fix 1>",
    "<specific actionable fix 2>",
    "<specific actionable fix 3>",
    "<specific actionable fix 4>",
    "<specific actionable fix 5>"
  ],
  "quickWins": [
    "<change that takes under 5 minutes to implement>"
  ]
}`;

    const responseText = await generateContent(prompt);
    
    // Clean JSON response (sometimes LLMs wrap in code blocks)
    let cleanJson = responseText.trim();
    if (cleanJson.startsWith("```json")) {
      cleanJson = cleanJson.replace(/^```json\n/, "").replace(/\n```$/, "");
    } else if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```\n/, "").replace(/\n```$/, "");
    }
    
    const atsDetails = JSON.parse(cleanJson);
    
    // Update user record
    user.atsScore = atsDetails.atsScore;
    user.atsLastChecked = new Date();
    user.atsDetails = atsDetails;
    await user.save();

    return NextResponse.json(atsDetails);

  } catch (error: unknown) {
    console.error("ATS Score API Error:", error);
    return NextResponse.json({ error: "Analysis failed. Try again." }, { status: 500 });
  }
}
