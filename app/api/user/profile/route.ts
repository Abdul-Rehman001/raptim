import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { User } from "@/models/User";
import { Job } from "@/models/Job";

export async function PUT(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    await dbConnect();

    // Only allow updating safe fields to prevent privilege escalation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allowedUpdates: Record<string, any> = {};
    const safeFields = ["name", "phone", "jobTitle", "resumeUrl", "resumeText", "resumeJson", "completedOnboarding"];
    
    for (const field of safeFields) {
      if (body[field] !== undefined) {
        allowedUpdates[field] = body[field];
      }
    }

    // If resume text is being updated, invalidate ALL cached AI analyses
    // so the next scan/analysis uses the fresh resume data
    if (allowedUpdates.resumeText !== undefined) {
      // Clear the user's ATS cache (score, details, timestamp)
      allowedUpdates.atsScore = null;
      allowedUpdates.atsLastChecked = null;
      allowedUpdates.atsDetails = null;

      // Mark ALL job analyses for this user as stale
      // by clearing aiAnalyzedAt — next "Analyze" click will re-run AI
      await Job.updateMany(
        { userId: session.user.id },
        {
          $set: {
            matchScore: null,
            whatsStrong: "",
            biggestGap: "",
            actionToday: "",
            successStrategy: "",
            missingKeywords: [],
            interviewRisk: "medium",
            aiCoachTips: [],
            aiAnalyzedAt: null,
            aiResumeFingerprint: null,
          },
        }
      );

      console.log("Resume updated — cleared all cached AI analyses");
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: allowedUpdates },
      { new: true }
    ).select("-passwordHash -otp -otpExpiresAt"); // Do not leak sensitive data

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Profile Update Error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
