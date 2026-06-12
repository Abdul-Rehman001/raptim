import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Job } from "@/models/Job";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const userId = session.user.id;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({
        totalApplications: 0,
        interviews: 0,
        offers: 0,
        responseRate: 0
      });
  }

  try {
    const jobs = await Job.find({ userId });

    const totalApplications = jobs.length;
    const interviews = jobs.filter(j => j.status === "interview").length;
    const offers = jobs.filter(j => j.status === "offer").length;
    
    // Calculate response rate (interviews + offers + rejected) / total applied (excluding saved)
    // "applied", "interview", "offer", "rejected" imply an application was sent. "saved" does not.
    const appliedJobs = jobs.filter(j => j.status !== "saved");
    const responses = jobs.filter(j => ["interview", "offer", "rejected"].includes(j.status));
    
    const responseRate = appliedJobs.length > 0 
      ? Math.round((responses.length / appliedJobs.length) * 100) 
      : 0;

    return NextResponse.json({
      totalApplications,
      interviews,
      offers,
      responseRate
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
