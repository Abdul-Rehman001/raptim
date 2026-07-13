import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Job } from "@/models/Job";
import { generateContent } from "@/lib/grok";
import { z } from "zod";
import { mightBeGrounded } from "@/lib/groundingCheck";

const analysisSchema = z.object({
  matchScore: z.number().min(0).max(100),
  whatsStrong: z.string(),
  biggestGap: z.string(),
  biggestGapEvidence: z.string().optional(),
  actionToday: z.string(),
  missingKeywords: z.array(z.string()).max(5),
  interviewRisk: z.enum(["low", "medium", "high"]),
  aiCoachTips: z.array(z.string()),
  successStrategy: z.string(),
});

async function getValidatedAnalysis(prompt: string, maxRetries = 1) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const raw = await generateContent(prompt);
    const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    try {
      const json = JSON.parse(cleaned);
      return analysisSchema.parse(json);
    } catch (err) {
      if (attempt === maxRetries) throw err;
      console.warn(`Analysis parse/validation failed, retrying (attempt ${attempt + 1})`);
    }
  }
  throw new Error("Failed to get valid analysis after retries");
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const job = await Job.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check if a force re-analyze was requested (e.g., user explicitly clicked re-analyze)
    let forceReanalyze = false;
    try {
      const body = await req.json();
      forceReanalyze = body?.force === true;
    } catch {
      // No body or invalid JSON — that's fine, default to non-forced
    }

    // Get the user's current resume to check if it changed since last analysis
    const { User } = await import("@/models/User");
    const user = await User.findById(session.user.id);
    const resumeText = user?.resumeText ?? "";

    // Build a fingerprint of the current resume for comparison
    const currentResumeFingerprint = `${resumeText.length}:${resumeText.slice(0, 200)}`;

    // ✅ Cache check — return cached ONLY if:
    // 1. Not a forced re-analyze
    // 2. Job was previously analyzed
    // 3. Resume has NOT changed since the last analysis
    const resumeUnchanged = job.aiResumeFingerprint === currentResumeFingerprint;

    if (
      !forceReanalyze &&
      job.matchScore !== null &&
      job.matchScore !== undefined &&
      job.aiCoachTips?.length > 0 &&
      job.aiAnalyzedAt &&
      resumeUnchanged
    ) {
      console.log(`Returning cached AI analysis for job: ${job._id}`);
      return NextResponse.json({
        matchScore: job.matchScore,
        whatsStrong: job.whatsStrong,
        biggestGap: job.biggestGap,
        actionToday: job.actionToday,
        missingKeywords: job.missingKeywords ?? [],
        successStrategy: job.successStrategy ?? "",
        aiCoachTips: job.aiCoachTips ?? [],
        interviewRisk: job.interviewRisk ?? "medium",
        cached: true,
      });
    }

    // Validate we have enough data to analyze
    if (!job.jobDescription || job.jobDescription.trim().length < 50) {
      return NextResponse.json(
        { error: "Job description is too short for analysis. Add more details." },
        { status: 400 }
      );
    }

    // Resume text was already fetched above for the cache check

    if (!resumeText || resumeText.trim().length < 50) {
      return NextResponse.json(
        {
          error:
            "No resume found. Please upload your resume in Settings → Resume & AI first.",
        },
        { status: 400 }
      );
    }

    console.log(`Starting Grok analysis for job: ${job._id}`);

const prompt = `
You are a senior career coach and ATS (Applicant Tracking System) expert with 15 years of experience 
helping candidates land jobs at top companies. Your analysis is honest, specific, and never generic.

Analyze the match between the resume and job description below.

STRICT RULES:
- Only reference skills, tools, and experiences EXPLICITLY written in the resume.
- SEMANTIC EQUIVALENCE: Recognize common acronyms and synonyms. For example, "MERN" implies MongoDB, Express, React, and Node.js. "B.Tech" or "B.S." implies a Bachelor's Degree. Do NOT penalize the candidate if they have the semantic equivalent of a requirement.
- Before claiming something is missing in biggestGap or missingKeywords, re-read the ENTIRE resume text provided above, including the Education and Skills sections. Do not claim a degree, certification, or skill is missing if any semantic equivalent of it appears anywhere in the resume text.
- Never assume, infer, or hallucinate skills not present in the resume text (unless covered by standard semantic equivalence).
- Be brutally honest — a low score with clear guidance is more valuable than false hope.
- All tips must be specific to THIS job and THIS resume, not generic career advice.
- Missing keywords must come directly from the job description text.
- Return ONLY valid JSON — no markdown, no backticks, no explanation outside the JSON.

RESUME:
${resumeText.slice(0, 12000)}

JOB DESCRIPTION:
${job.jobDescription.slice(0, 6000)}

Analyze thoroughly and return this exact JSON:
{
  "matchScore": <integer 0-100. Be realistic: 90+ means near-perfect match, 70-89 means strong with minor gaps, 50-69 means moderate with real gaps, below 50 means significant mismatch>,

  "whatsStrong": "<One specific sentence about what in the resume directly matches this JD. Name the actual skill or experience. Never be vague.>",

  "biggestGap": "<One sentence about the single most critical requirement in the JD that is missing or weak in the resume. Be specific about what's missing.>",
  "biggestGapEvidence": "<A short exact phrase (3-8 words) describing the specific requirement or skill you searched for in the resume and could not find. This will be verified programmatically against the resume text, so be precise about what you were looking for.>",

  "actionToday": "<One concrete action the candidate can take TODAY to improve their chances. Must be specific to this job — e.g. 'Add a bullet point in your experience section mentioning X' not 'improve your resume'.>",

  "missingKeywords": ["<exact keyword from JD not in resume>", "<max 5 keywords>"],

  "interviewRisk": "<low | medium | high — based on how well resume matches the core requirements>",

  "aiCoachTips": [
    "<Tip 1: Specific resume change to make — mention exact section and what to add/change>",
    "<Tip 2: Something to prepare for in the interview based on gaps identified>",
    "<Tip 3: One strategic angle to highlight in cover letter or application that bridges the gap>"
  ],

  "successStrategy": "<2-3 sentence paragraph on the strongest angle this candidate should take when applying. What should they lead with? What story should they tell?>"
}
`.trim();

    let parsed;
    try {
      parsed = await getValidatedAnalysis(prompt);
    } catch (error) {
      console.error("Failed to parse/validate Grok response:", error);
      return NextResponse.json(
        { error: "AI returned an unexpected format. Please try again." },
        { status: 500 }
      );
    }

    // Server-side grounding check for hallucinations
    let biggestGap = parsed.biggestGap ?? "";
    if (parsed.biggestGapEvidence && mightBeGrounded(parsed.biggestGapEvidence, resumeText)) {
      console.warn(`Discarded likely-hallucinated gap for job ${job._id}: "${biggestGap}"`);
      biggestGap = "No major gaps identified — resume covers the core requirements well.";
    }

    const missingKeywords = (parsed.missingKeywords ?? []).filter(
      (kw: string) => !mightBeGrounded(kw, resumeText)
    );

    // Validate matchScore is a real number
    const matchScore = Math.min(100, Math.max(0, Number(parsed.matchScore) || 0));

    // ✅ Save results to DB so next call hits cache, not Grok
    // Also save the resume fingerprint so we know which resume version was analyzed
    await Job.findByIdAndUpdate(job._id, {
      matchScore,
      whatsStrong: parsed.whatsStrong ?? "",
      biggestGap,
      actionToday: parsed.actionToday ?? "",
      successStrategy:  parsed.successStrategy ?? "",
      missingKeywords,
      interviewRisk: parsed.interviewRisk ?? "medium",
      aiCoachTips: parsed.aiCoachTips ?? [],
      aiAnalyzedAt: new Date(),
      aiResumeFingerprint: currentResumeFingerprint,
    });

    console.log(`AI analysis complete for job: ${job._id}, score: ${matchScore}`);

    return NextResponse.json({
      matchScore,
      whatsStrong: parsed.whatsStrong,
      biggestGap,
      actionToday: parsed.actionToday,
      missingKeywords,
      interviewRisk: parsed.interviewRisk ?? "medium",
      aiCoachTips: parsed.aiCoachTips ?? [],
      successStrategy: parsed.successStrategy ?? "",
      cached: false,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("AI Analysis Error:", error);

    // Return a user-friendly error message
    return NextResponse.json(
      {
        error: msg.includes("quota")
          ? "AI quota exhausted for today. Results will be available again tomorrow, or you can add your resume text manually."
          : "Analysis failed. Please try again in a moment.",
      },
      { status: 500 }
    );
  }
}