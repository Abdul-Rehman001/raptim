import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { User } from "@/models/User";
import { generateContent } from "@/lib/grok";
import { z } from "zod";

const atsScoreSchema = z.object({
  atsScore: z.number().min(0).max(100),
  subScores: z.object({
    parseability: z.number().min(0).max(20),
    contactCompleteness: z.number().min(0).max(10),
    quantifiedAchievements: z.number().min(0).max(25),
    actionVerbStrength: z.number().min(0).max(15),
    keywordCoverage: z.number().min(0).max(20),
    sectionCompleteness: z.number().min(0).max(10)
  }),
  verdict: z.string(),
  sectionScores: z.object({
    contact: z.number().min(0).max(100),
    summary: z.number().min(0).max(100),
    experience: z.number().min(0).max(100),
    skills: z.number().min(0).max(100),
    education: z.number().min(0).max(100)
  }),
  formatIssues: z.array(z.string()),
  missingSections: z.array(z.string()),
  keywordDensity: z.enum(["low", "medium", "high"]),
  topRecommendations: z.array(z.string()),
  quickWins: z.array(z.string())
});

async function getValidatedAnalysis(prompt: string, maxRetries = 1) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const raw = await generateContent(prompt, 0.2); // Low temperature for consistency
    const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    try {
      const json = JSON.parse(cleaned);
      return atsScoreSchema.parse(json);
    } catch (err) {
      if (attempt === maxRetries) throw err;
      console.warn(`Analysis parse/validation failed, retrying (attempt ${attempt + 1})`);
    }
  }
  throw new Error("Failed to get valid analysis after retries");
}

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

SCORING RUBRIC — atsScore MUST be the sum of these category scores. Do not invent a number outside this sum:
- parseability (0-20): standard fonts/layout, no tables or columns that break text extraction, clear section headers, consistent date formatting
- contactCompleteness (0-10): name, email, phone, and location present and easy to locate
- quantifiedAchievements (0-25): bullets contain numbers, metrics, or measurable outcomes rather than only responsibilities. A resume with zero quantified bullets should lose most of these 25 points regardless of how clean the formatting is.
- actionVerbStrength (0-15): bullets open with strong action verbs ("Built", "Led", "Reduced") rather than passive phrasing ("Responsible for", "Worked on")
- keywordCoverage (0-20): breadth and specificity of relevant hard skills explicitly named for the resume's apparent target role
- sectionCompleteness (0-10): summary/objective, experience, education, and skills are all present

Do NOT default to high scores. Most resumes should land in the 55-80 range. Reserve 85+ for resumes that have strong quantified metrics AND full section coverage AND broad, specific keyword coverage. A resume can be perfectly "structurally sound" (no formatting errors) and still score in the 60s if it lacks quantified achievements or specific keywords — formatting cleanliness alone does not earn a high score.

RESUME TEXT:
${user.resumeText}

Return ONLY valid JSON. No markdown backticks, no explanations.
{
  "atsScore": <integer 0-100, must equal the sum of the six sub-scores below>,
  "subScores": {
    "parseability": <0-20>,
    "contactCompleteness": <0-10>,
    "quantifiedAchievements": <0-25>,
    "actionVerbStrength": <0-15>,
    "keywordCoverage": <0-20>,
    "sectionCompleteness": <0-10>
  },
  "verdict": "<One clear sentence assessing overall ATS readability, referencing the weakest sub-score if any category scored notably low>",
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
    "<1-5 specific, actionable fixes tied to whichever sub-score is lowest>"
  ],
  "quickWins": [
    "<1-2 changes taking under 5 minutes to implement>"
  ]
}`;

    const atsDetails = await getValidatedAnalysis(prompt);
    
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
