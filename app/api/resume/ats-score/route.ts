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

    // Build a simple fingerprint of the current resume text
    // so we can detect when the resume has changed since the last scan
    const resumeFingerprint = `${user.resumeText.length}:${user.resumeText.slice(0, 200)}`;

    // Check cache — only use cached result if:
    // 1. Scan was done within 7 days AND
    // 2. Resume text has NOT changed since that scan
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const cacheIsRecent = user.atsLastChecked && (Date.now() - new Date(user.atsLastChecked).getTime() < SEVEN_DAYS_MS);
    const resumeUnchanged = user.atsResumeFingerprint === resumeFingerprint;

    if (cacheIsRecent && resumeUnchanged && user.atsDetails) {
      return NextResponse.json({ ...user.atsDetails, cached: true });
    }

    const prompt = `You are an elite ATS (Applicant Tracking System) parser and Senior Recruiter. Analyze this resume for ATS compatibility. Your analysis must apply universally across all industries (Tech, Marketing, Finance, Healthcare, Business, etc.).

CRITICAL DIRECTIVES:
1. ANTI-HALLUCINATION: Do NOT invent errors. If the resume is well-formatted, it is expected and perfectly fine to return empty arrays [] for formatIssues and missingSections. Do not flag things just to have something to flag.
2. SEMANTIC EQUIVALENCE: Recognize common acronyms and synonyms (e.g., MERN = MongoDB, Express, React, Node. B.Tech/B.S. = Bachelor's Degree). Do NOT penalize or claim something is missing if the semantic equivalent exists.
3. INDUSTRY AGNOSTIC: Recognize that different industries have different standard sections (e.g., "Projects" for Tech, "Publications" for Academia, "Campaigns" for Marketing). All are valid.
4. FORMAT TOLERANCE: Bullet points (•, -, *, ·) and pipes (|) are perfectly standard and are NOT special characters. Do NOT flag them.
5. TITLES & HEADERS: If a professional title (e.g., "Software Engineer", "Marketing Manager", "Financial Analyst") appears near the top, recognize it. It does NOT need a literal "Title:" label.
6. PENALTIES: Only penalize for genuine ATS parsing threats: complex tables, missing contact info, giant walls of text without bullets, or missing core timelines in experience.

RESUME TEXT:
${user.resumeText}

Return ONLY valid JSON. No markdown backticks, no explanations.
{
  "atsScore": <integer 0-100. Give 90+ if structurally sound, regardless of industry.>,
  "verdict": "<One clear sentence assessing overall ATS readability>",
  "sectionScores": {
    "contact": <0-100>,
    "summary": <0-100>,
    "experience": <0-100>,
    "skills": <0-100>,
    "education": <0-100>
  },
  "formatIssues": [
    "<Only list GENUINE ATS parsing blockers (e.g., missing dates, no clear headings). Return [] if none>"
  ],
  "missingSections": [
    "<Only list TRULY missing core sections. Return [] if none>"
  ],
  "keywordDensity": "<low | medium | high>",
  "topRecommendations": [
    "<1-5 specific, actionable fixes. If perfect, suggest minor strategic optimizations>"
  ],
  "quickWins": [
    "<1-2 changes taking under 5 minutes to implement>"
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
    
    // Update user record with results AND the fingerprint of the resume that was scanned
    user.atsScore = atsDetails.atsScore;
    user.atsLastChecked = new Date();
    user.atsDetails = atsDetails;
    user.atsResumeFingerprint = resumeFingerprint;
    await user.save();

    return NextResponse.json(atsDetails);

  } catch (error: unknown) {
    console.error("ATS Score API Error:", error);
    return NextResponse.json({ error: "Analysis failed. Try again." }, { status: 500 });
  }
}
