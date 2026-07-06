import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Job } from "@/models/Job";
import { generateContent } from "@/lib/grok";
import { User } from "@/models/User";

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

    // The user can optionally pass { forceRegenerate: true } to skip cache
    const body = await req.json().catch(() => ({}));
    const forceRegenerate = body?.forceRegenerate === true;

    const job = await Job.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Checking if we already have a cached outreach message
    if (!forceRegenerate && job.coldEmail && job.coldEmail.length > 20) {
      console.log(`Returning cached outreach message for job: ${job._id}`);
      return NextResponse.json({
        outreachMessage: job.coldEmail,
        cached: true,
      });
    }

    // Need Job Description
    if (!job.jobDescription || job.jobDescription.trim().length < 50) {
      return NextResponse.json(
        { error: "Job description is too short to generate a custom outreach message." },
        { status: 400 }
      );
    }

    // Ensure we have a resume
    const user = await User.findById(session.user.id);
    const resumeText = user?.resumeText ?? "";

    if (!resumeText || resumeText.trim().length < 50) {
      return NextResponse.json(
        { error: "No resume found. Please upload your resume in Settings." },
        { status: 400 }
      );
    }

    console.log(`Generating AI Outreach Message for job: ${job._id}`);

    const prompt = `
You are an expert career coach. Write a highly personalized networking outreach message (e.g. for LinkedIn or email) to a recruiter or hiring manager at the company.

STRICT INSTRUCTIONS:
- You MUST follow this exact format template, keeping it concise and punchy.
- Replace the bracketed information with relevant, actual facts from the provided RESUME and JOB DESCRIPTION. 
- Leave [Hiring Manager Name] exactly as written so the user can fill it in.
- Highlight 1 or 2 achievements from the resume that PERFECTLY MATCH the job description. Do NOT hallucinate skills or achievements.
- Extract ONLY the primary portfolio link from the resume to include at the bottom. Do NOT include GitHub links.

TEMPLATE FORMAT:
Hi [Hiring Manager Name], I recently applied for the ${job.title} role at ${job.company} and wanted to reach out directly.
I'm a [Current Title from Resume] with [X] years of experience in [1-3 Key Skills matched from JD]. At [Previous Company/Project] I built [Achievement 1 that matches JD]. I also built [Achievement 2 or relevant metric].
Would love to connect and discuss if there's a fit.
Portfolio: [Portfolio Link from Resume]

COMPANY: ${job.company}
ROLE: ${job.title}

MATCH CONTEXT:
What's Strong: ${job.whatsStrong || "Not specified."}
Success Strategy: ${job.successStrategy || "Not specified."}

RESUME:
${resumeText.slice(0, 3000)}

JOB DESCRIPTION:
${job.jobDescription.slice(0, 2000)}
`.trim();

    const rawMessage = await generateContent(prompt);

    // Clean up potential markdown code blocks returned automatically
    const cleanedMessage = rawMessage
      .replace(/^```[a-z]*\n/gi, "")
      .replace(/```$/g, "")
      .trim();

    // Save to DB
    job.coldEmail = cleanedMessage;
    await job.save();

    console.log(`AI Outreach Message generated for job: ${job._id}`);

    return NextResponse.json({
      outreachMessage: cleanedMessage,
      cached: false,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Outreach Message Error:", error);
    return NextResponse.json(
      {
        error: msg.includes("quota")
          ? "AI quota exhausted for today."
          : "Outreach message generation failed. Please try again in a moment.",
      },
      { status: 500 }
    );
  }
}
