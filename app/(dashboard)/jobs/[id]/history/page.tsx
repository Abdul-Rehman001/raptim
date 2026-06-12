import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import { Job } from "@/models/Job";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import Link from "next/link";
import { ArrowLeft, TrendingUp, CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";

async function getJobHistory(id: string, userId: string) {
  await dbConnect();
  const job = await Job.findOne({ _id: id, userId });
  return job ? JSON.parse(JSON.stringify(job)) : null;
}

export default async function ResumeHistoryPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const job = await getJobHistory(params.id, session.user.id);
  if (!job) {
    redirect("/jobs");
  }

  const history = job.resumeHistory || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Breadcrumb
        items={[
          { label: "AI Coach", href: "/ai-coach" },
          { label: job.company, href: `/jobs/${job._id}` },
          { label: "Tailoring History" },
        ]}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary">Resume Tailoring History</h1>
          <p className="text-sm text-text-secondary mt-1">Track how your resume improved for {job.title} at {job.company}</p>
        </div>
        <Link 
          href="/ai-coach"
          className="px-4 py-2 bg-bg-surface border border-border-default hover:bg-bg-surface-hover text-text-primary text-sm font-bold rounded-xl transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Coach
        </Link>
      </div>

      {history.length === 0 ? (
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-12 text-center">
          <TrendingUp className="w-12 h-12 text-border-default mx-auto mb-4" />
          <h3 className="text-lg font-bold text-text-primary">No History Yet</h3>
          <p className="text-sm text-text-secondary mt-2">Go to the AI Coach and tailor your resume for this job to start tracking improvements.</p>
          <Link href="/ai-coach" className="inline-block mt-6 px-6 py-2 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary-hover">
            Go to AI Coach
          </Link>
        </div>
      ) : (
        <div className="relative border-l-2 border-border-default ml-4 md:ml-8 space-y-12 pb-12">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {history.map((entry: any, index: number) => {
            const isOriginal = index === 0;
            const score = entry.analysis?.matchScore || 0;
            
            // Calculate improvement from previous version
            const prevScore = index > 0 ? (history[index - 1].analysis?.matchScore || 0) : null;
            const diff = prevScore !== null ? score - prevScore : 0;

            return (
              <div key={index} className="relative pl-6 sm:pl-8 md:pl-12">
                {/* Timeline Dot */}
                <div className={`absolute -left-2.75 top-6 w-5 h-5 rounded-full border-4 border-bg-base ${isOriginal ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                
                <div className="bg-bg-surface border border-border-subtle rounded-2xl shadow-sm overflow-hidden">
                  {/* Header */}
                  <div className="px-6 py-5 border-b border-border-subtle bg-bg-surface-hover/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-extrabold text-text-primary flex flex-wrap items-center gap-2 sm:gap-3">
                        {entry.version}
                        {isOriginal && <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] uppercase tracking-widest border border-amber-500/20">Baseline</span>}
                        {!isOriginal && <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] uppercase tracking-widest border border-emerald-500/20">Tailored</span>}
                      </h3>
                      <p className="text-xs text-text-tertiary mt-1">
                        {new Date(entry.createdAt).toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-start sm:items-end mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-border-subtle sm:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-text-secondary">Match Score:</span>
                        <span className={`text-2xl font-black ${score >= 75 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                          {score}%
                        </span>
                      </div>
                      {!isOriginal && diff !== 0 && (
                        <span className={`text-xs font-bold ${diff > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {diff > 0 ? '↗' : '↘'} {Math.abs(diff)}% from previous
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Analysis Column */}
                    <div className="space-y-6">
                      <div>
                        <h4 className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2">
                          <CheckCircle2 className="w-4 h-4" /> Strongest Point
                        </h4>
                        <p className="text-sm text-text-secondary leading-relaxed">
                          {entry.analysis?.whatsStrong || "No data available."}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">
                          <AlertTriangle className="w-4 h-4" /> Remaining Gap
                        </h4>
                        <p className="text-sm text-text-secondary leading-relaxed">
                          {entry.analysis?.biggestGap || "No data available."}
                        </p>
                      </div>
                    </div>

                    {/* Tips / Action Column */}
                    <div className="bg-bg-base rounded-xl p-5 border border-border-default">
                      <h4 className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-4">
                        <Lightbulb className="w-4 h-4" /> AI Evaluation Feedback
                      </h4>
                      {entry.analysis?.improvementTips?.length > 0 ? (
                        <ul className="space-y-3">
                          {entry.analysis.improvementTips.map((tip: string, i: number) => (
                            <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                              <span className="text-primary mt-0.5">•</span>
                              <span className="leading-relaxed">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-text-tertiary italic">No feedback available.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
