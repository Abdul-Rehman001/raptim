import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Job } from "@/models/Job";
import mongoose from "mongoose";
import Groq from "groq-sdk";
import { revalidatePath } from "next/cache";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const userId = session.user.id as string;

    // Use native MongoDB driver to bypass Mongoose model cache for resumeJson
    const db = mongoose.connection.db;
    const user = await db!.collection("users").findOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { projection: { resumeJson: 1 } }
    );

    if (!user || !user.resumeJson) {
      return NextResponse.json({ error: "No structured resume found. Please upload a resume first." }, { status: 400 });
    }

    const { id } = await params;
    const job = await Job.findOne({ _id: id, userId });
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Build improvement context from existing analysis
    const improvementContext = [
      job.whatsStrong ? `Strengths to emphasize: ${job.whatsStrong}` : '',
      job.biggestGap ? `Gap to address in bullets: ${job.biggestGap}` : '',
      job.aiCoachTips?.length ? `Specific improvements to make:\n${job.aiCoachTips.map((t: string) => `- ${t}`).join('\n')}` : '',
    ].filter(Boolean).join('\n\n');

    const prompt = `
You are an expert career coach and resume writer.
I have a structured JSON resume and a Job Description.
Your goal is to tailor the resume content to maximize the ATS match score for this specific job.

WHAT TO TAILOR:
1. Rewrite the "objective" in "basics" to directly target this specific role and company.
2. Rewrite "bullets" in each "work" entry to emphasize skills, keywords, and metrics from the Job Description.
3. Rewrite "description" in each "projects" entry to highlight relevant tech and impact.
4. Reorder skills within each category to prioritize JD-relevant ones. Add JD-mentioned skills ONLY if the candidate plausibly has them.
5. Keep "education" and "certifications" unchanged.

CRITICAL RULES:
1. ANTI-HALLUCINATION: Do NOT invent new jobs, projects, education, or skills the candidate does not have. Do NOT invent fake metrics.
2. PROTECT ORIGINAL CONTENT: When tailoring the "objective/summary", DO NOT delete the candidate's existing core message. Only ENHANCE it by adding or weaving in the job-specific keywords.
3. INDUSTRY AGNOSTIC: Adapt your phrasing to match the industry of the Job Description.
4. DO rewrite and rephrase bullet points to better align with the JD keywords, but keep the underlying truth identical.
5. PRESERVE the EXACT SAME JSON STRUCTURE — all keys and sections must remain.
6. Keep the resume content realistic and single-page worthy (concise bullets).
7. Output MUST be valid JSON only — no markdown, no explanation.

${improvementContext ? `\nANALYSIS FEEDBACK TO INCORPORATE:\n${improvementContext}\n` : ''}
BASE RESUME JSON:
${JSON.stringify(user.resumeJson, null, 2)}

JOB TO TAILOR FOR:
Company: ${job.company}
Title: ${job.title}
Description:
${job.jobDescription || "No description provided."}
`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.5,
      response_format: { type: "json_object" },
    });

    const tailoredJsonContent = completion.choices[0]?.message?.content || "{}";
    const tailoredJson = JSON.parse(tailoredJsonContent);

    // Deep merge to ensure AI doesn't drop sections
    const mergedJson = {
      ...user.resumeJson,
      ...tailoredJson,
      basics: {
        ...(user.resumeJson.basics || {}),
        ...(tailoredJson.basics || {}),
      },
      skills: tailoredJson.skills && Object.keys(tailoredJson.skills).length > 0 ? tailoredJson.skills : user.resumeJson.skills,
      work: tailoredJson.work?.length ? tailoredJson.work : user.resumeJson.work,
      projects: tailoredJson.projects?.length ? tailoredJson.projects : user.resumeJson.projects,
      education: tailoredJson.education?.length ? tailoredJson.education : user.resumeJson.education,
      certifications: tailoredJson.certifications?.length ? tailoredJson.certifications : user.resumeJson.certifications,
    };

    // 2. Perform a re-analysis on the newly tailored JSON to get the updated match score
    const reAnalysisPrompt = `
      You are an expert ATS (Applicant Tracking System).
      I have a Job Description and a TAILORED Candidate Resume JSON.
      Your task is to analyze the tailored resume against the JD and return a JSON object with:
      - matchScore: A number from 0 to 100 (it should be higher than the original since it was tailored).
      - whatsStrong: A 1-2 sentence string explaining what makes this a good match now.
      - biggestGap: A 1-2 sentence string explaining what is STILL missing.
      - improvementTips: An array of 2-3 strings with highly specific, actionable advice to further improve.
      
      Job Title: ${job.title}
      Job Company: ${job.company}
      Job Description: ${job.jobDescription}
      Tailored Resume JSON: ${JSON.stringify(mergedJson)}
      
      Return ONLY valid JSON.
    `;

    const reAnalysisCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: reAnalysisPrompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const reAnalysisJson = JSON.parse(reAnalysisCompletion.choices[0]?.message?.content || "{}");

    // --- SAVE HISTORY ---
    const newVersionId = `Tailored_v${(job.resumeHistory?.length || 0) + 1}`;

    // If there is no history yet, push the original baseline first!
    if (!job.resumeHistory) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      job.resumeHistory = [] as any;
    }
    if (job.resumeHistory.length === 0) {
      job.resumeHistory.push({
        version: "Original Baseline",
        createdAt: new Date(),
        resumeJson: user.resumeJson,
        analysis: {
          matchScore: job.matchScore,
          whatsStrong: job.whatsStrong,
          biggestGap: job.biggestGap,
          improvementTips: job.aiCoachTips
        }
      });
    }

    // Push the new tailored version
    const newHistoryEntry = {
      version: newVersionId,
      createdAt: new Date(),
      resumeJson: mergedJson,
      analysis: {
        matchScore: reAnalysisJson.matchScore || job.matchScore,
        whatsStrong: reAnalysisJson.whatsStrong || job.whatsStrong,
        biggestGap: reAnalysisJson.biggestGap || job.biggestGap,
        improvementTips: reAnalysisJson.improvementTips || []
      }
    };
    
    job.resumeHistory.push(newHistoryEntry);
    job.tailoredResume = mergedJson; // Keep top-level for backward compatibility
    
    // Update the top-level scores so the main dashboard reflects the new higher score!
    if (newHistoryEntry.analysis.matchScore > (job.matchScore || 0)) {
      job.matchScore = newHistoryEntry.analysis.matchScore;
      job.whatsStrong = newHistoryEntry.analysis.whatsStrong;
      job.biggestGap = newHistoryEntry.analysis.biggestGap;
    }

    // BYPASS MONGOOSE SCHEMA CACHING (which drops new fields on hot-reload)
    await db!.collection("jobs").updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        $set: {
          tailoredResume: mergedJson,
          resumeHistory: job.resumeHistory,
          matchScore: job.matchScore,
          whatsStrong: job.whatsStrong,
          biggestGap: job.biggestGap
        }
      }
    );

    revalidatePath('/ai-coach');
    revalidatePath(`/jobs/${job._id}`);

    return NextResponse.json({ 
      success: true, 
      tailoredJson: mergedJson,
      newAnalysis: newHistoryEntry.analysis,
      history: job.resumeHistory
    });
  } catch (error) {
    console.error("Tailor Error:", error);
    return NextResponse.json({ error: "Failed to tailor resume" }, { status: 500 });
  }
}
