import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import { Job } from "@/models/Job";
import { User } from "@/models/User";
import { JobDetailClient } from "@/components/jobs/JobDetailClient";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

async function getJobAndUser(id: string, userId: string) {
  await dbConnect();
  const [job, user] = await Promise.all([
    Job.findOne({ _id: id, userId }),
    User.findById(userId).select("resumeText")
  ]);
  
  return {
    job: job ? JSON.parse(JSON.stringify(job)) : null,
    hasResume: !!user?.resumeText && user.resumeText.length > 50
  };
}

export default async function JobDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login");
  }

  const { job, hasResume } = await getJobAndUser(params.id, session.user.id);

  if (!job) {
    return <div>Job not found</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Breadcrumb items={[
        { label: "My Jobs", href: "/jobs" },
        { label: `${job.title} — ${job.company}` },
      ]} />

      <JobDetailClient job={job} hasResume={hasResume} />
    </div>
  );
}

