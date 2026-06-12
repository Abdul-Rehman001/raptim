import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Job } from "@/models/Job";

export async function GET() {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const userId = session.user.id;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json([]);
  }

  try {
    const jobs = await Job.find({ userId }).sort({ createdAt: -1 });
    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const userId = session.user.id;
  
  try {
    const body = await req.json();
    const job = await Job.create({ ...body, userId });
    return NextResponse.json(job, { status: 201 });
  } catch (error) {
     console.error("Error creating job:", error);
     return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}
