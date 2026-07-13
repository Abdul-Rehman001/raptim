import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Job } from "@/models/Job";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jobs = await Job.find({ userId: (session.user as any).id }).lean();
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalApplied = jobs.filter((j: any) => j.status !== 'saved').length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const interviews = jobs.filter((j: any) => j.status === 'interview').length;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const analyzedJobs = jobs.filter((j: any) => j.matchScore !== undefined && j.matchScore !== null);
    const avgScore = analyzedJobs.length > 0 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? Math.round(analyzedJobs.reduce((acc: number, j: any) => acc + j.matchScore, 0) / analyzedJobs.length)
      : 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let topMatch: any = null;
    if (analyzedJobs.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      topMatch = analyzedJobs.reduce((prev: any, current: any) => (prev.matchScore > current.matchScore) ? prev : current);
    }

    const platformMap: Record<string, number> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jobs.forEach((j: any) => {
      const p = j.platform || "Other";
      platformMap[p] = (platformMap[p] || 0) + 1;
    });
    const topPlatforms = Object.entries(platformMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => `${name} (${count})`)
      .join(", ");

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #09090b; color: white; padding: 32px 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">ApplyIQ Report</h1>
          <p style="margin: 8px 0 0 0; color: #a1a1aa; font-size: 14px;">Your personalized career progress summary</p>
        </div>
        <div style="padding: 32px 24px; background-color: #fafafa; color: #09090b;">
          <p style="font-size: 16px; margin-top: 0;">Hello <strong>${session.user.name || "there"}</strong>,</p>
          <p style="font-size: 16px; color: #52525b; line-height: 1.5;">Here is a quick overview of your job search progress and AI insights. Stay consistent, you're doing great!</p>
          
          <div style="display: flex; gap: 16px; margin-top: 32px;">
            <div style="flex: 1; background: white; padding: 20px 16px; border-radius: 10px; border: 1px solid #e4e4e7; text-align: center; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
              <p style="margin: 0; font-size: 11px; font-weight: bold; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em;">Total Applied</p>
              <p style="margin: 8px 0 0 0; font-size: 28px; font-weight: 900; letter-spacing: -0.025em;">${totalApplied}</p>
            </div>
            <div style="flex: 1; background: white; padding: 20px 16px; border-radius: 10px; border: 1px solid #e4e4e7; text-align: center; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
              <p style="margin: 0; font-size: 11px; font-weight: bold; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em;">Interviews</p>
              <p style="margin: 8px 0 0 0; font-size: 28px; font-weight: 900; color: #15803d; letter-spacing: -0.025em;">${interviews}</p>
            </div>
            <div style="flex: 1; background: white; padding: 20px 16px; border-radius: 10px; border: 1px solid #e4e4e7; text-align: center; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
              <p style="margin: 0; font-size: 11px; font-weight: bold; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em;">Avg AI Match</p>
              <p style="margin: 8px 0 0 0; font-size: 28px; font-weight: 900; letter-spacing: -0.025em;">${avgScore}%</p>
            </div>
          </div>

          <h2 style="margin-top: 40px; font-size: 18px; font-weight: bold; border-bottom: 2px solid #f4f4f5; padding-bottom: 8px; color: #18181b;">Top Opportunity</h2>
          ${topMatch ? `
            <div style="background: white; padding: 20px; border-radius: 10px; border: 1px solid #e4e4e7; margin-top: 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); border-left: 4px solid #09090b;">
              <p style="margin: 0; font-weight: 800; font-size: 18px; color: #09090b;">${topMatch.title}</p>
              <p style="margin: 4px 0 0 0; font-size: 14px; color: #52525b;">${topMatch.company}</p>
              <div style="margin-top: 12px; display: inline-block; background-color: #dcfce7; color: #15803d; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold;">
                ${topMatch.matchScore}% AI Match
              </div>
            </div>
          ` : '<p style="font-size: 14px; color: #71717a; margin-top: 16px; background: white; padding: 16px; border-radius: 8px; border: 1px dashed #d4d4d8; text-align: center;">Analyze some jobs to see your top matches!</p>'}

          <h2 style="margin-top: 40px; font-size: 18px; font-weight: bold; border-bottom: 2px solid #f4f4f5; padding-bottom: 8px; color: #18181b;">Most Active Platforms</h2>
          <p style="font-size: 15px; color: #52525b; margin-top: 16px;">${topPlatforms || "No platforms tracked yet."}</p>
          
          <div style="margin-top: 48px; text-align: center; margin-bottom: 16px;">
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; background-color: #09090b; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; letter-spacing: 0.025em; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              Open Command Center
            </a>
          </div>
        </div>
      </div>
    `;

    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      return NextResponse.json({ error: "Resend API key missing in environment." }, { status: 500 });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "ApplyIQ <onboarding@resend.dev>",
        // Resend sandbox only allows sending to the registered account email
        to: process.env.NODE_ENV === 'development' ? "abdul.rehman.tahir7377@gmail.com" : session.user.email,
        subject: "Your ApplyIQ Career Progress Report",
        html: htmlContent,
      }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Failed to send email via Resend");
    }

    return NextResponse.json({ success: true });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Report Email Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
