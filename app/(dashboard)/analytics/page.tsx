import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Job } from "@/models/Job";
import mongoose from "mongoose";
import { AnalyticsClient } from "./AnalyticsClient";

export const revalidate = 0;

async function getAnalyticsData(userId: string) {
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) return { jobs: [] };
  await dbConnect();
  const jobs = await Job.find({ userId }).lean();
  return { jobs: JSON.parse(JSON.stringify(jobs)) };
}

export default async function AnalyticsPage() {
  const session = await auth();
  const { jobs } = await getAnalyticsData(session?.user?.id || "");

  return <AnalyticsClient jobs={jobs} />;
}
