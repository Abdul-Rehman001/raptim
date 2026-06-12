import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import { Job } from "@/models/Job";
import { User } from "@/models/User";
import { AICoachClient } from "@/components/ai-coach/AICoachClient";

export const revalidate = 30;

async function getData(userId: string) {
  await dbConnect();
  const [jobs, user] = await Promise.all([
    Job.find({ userId }).sort({ createdAt: -1 }).lean(),
    User.findById(userId).lean()
  ]);
  
  // Serialize Mongo IDs
  const serializedJobs = JSON.parse(JSON.stringify(jobs));
  const serializedUser = JSON.parse(JSON.stringify(user));
  
  return { jobs: serializedJobs, user: serializedUser };
}

export default async function AICoachPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { jobs, user } = await getData(session.user.id);

  return <AICoachClient user={user} jobs={jobs} />;
}
