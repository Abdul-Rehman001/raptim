import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Job } from "@/models/Job";
import { User } from "@/models/User";
import { generateContent } from "@/lib/grok";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    await dbConnect();

    const userId = session.user.id;
    const [job, user] = await Promise.all([
      Job.findOne({ _id: id, userId }),
      User.findById(userId).select("resumeText")
    ]);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (!user?.resumeText || user.resumeText.length < 100) {
      return NextResponse.json({ error: "Add your resume in Settings first" }, { status: 400 });
    }

    // Check cache
    if (job.coldEmail) {
      return NextResponse.json({ coldEmail: job.coldEmail });
    }

    const prompt = `Write a short, personalized cold outreach message to a hiring manager or recruiter at this company.
This is for LinkedIn InMail or cold email — NOT a formal cover letter.

Rules:
- Maximum 120 words — brevity is critical
- Do NOT start with 'I am writing to...' or 'My name is...'
- Open with a specific, genuine observation about the company or role that shows research
- Mention 1-2 specific skills from the resume that directly match the role requirements
- End with ONE clear, low-friction ask (e.g. a 15-minute call, not 'please consider me')
- Tone: confident, warm, human — not corporate
- Only use skills explicitly in the resume

RESUME (First 1500 chars):
${user.resumeText.substring(0, 1500)}

JOB DESCRIPTION (First 1000 chars):
${(job.jobDescription || "").substring(0, 1000)}

COMPANY: ${job.company}
ROLE: ${job.title}

Return ONLY the email text. No subject line. No JSON. Just the message body.`;

    const coldEmail = await generateContent(prompt);
    
    // Save to DB
    job.coldEmail = coldEmail.trim();
    await job.save();

    return NextResponse.json({ coldEmail: job.coldEmail });

  } catch (error: unknown) {
    console.error("Cold Email API Error:", error);
    return NextResponse.json({ error: "Generation failed. Try again." }, { status: 500 });
  }
}
