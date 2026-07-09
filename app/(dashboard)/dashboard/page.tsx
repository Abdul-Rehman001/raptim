import { AddJobModal } from "@/components/jobs/AddJobModal";
import { cn, getPlatformIcon } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { cache } from "react";
import dbConnect from "@/lib/mongodb";
import { Job } from "@/models/Job";
import { User } from "@/models/User";
import {
  Send, MessageSquare, CalendarDays, Flame, Plus,
  Bell, MoreHorizontal, CheckCircle2, Circle, ArrowRight,
  AlertTriangle, Sparkles, CalendarCheck, Zap, Globe
} from "lucide-react";
import mongoose from "mongoose";
import Link from "next/link";
import { Greeting } from "@/components/dashboard/Greeting";

// Cache auth() result for the duration of this server request
// so layout + page don't each make a separate auth call
const getSession = cache(auth);

// Revalidate cached page every 0 seconds
export const revalidate = 0;

interface BaseJob {
  _id: string | mongoose.Types.ObjectId;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  matchScore?: number | null;
  followUpDate?: Date | null;
  appliedDate?: Date | null;
  company: string;
  title: string;
}

interface BaseUser {
  _id: string | mongoose.Types.ObjectId;
  resumeText?: string;
  completedOnboarding?: boolean;
}

async function getDashboardData(userId: string) {
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return { totalApplications: 0, interviews: 0, offers: 0, responseRate: 0, recentlyApplied: [], user: null, focusItems: [], setupItems: [] };
  }
  await dbConnect();

  const [jobs, user] = await Promise.all([
    Job.find({ userId }).sort({ updatedAt: -1 }).lean(),
    User.findById(userId).select("resumeText completedOnboarding").lean(),
  ]);

  const totalApplications = jobs.length;
  const interviews = jobs.filter((j: BaseJob) => j.status === "interview").length;
  const offers = jobs.filter((j: BaseJob) => j.status === "offer").length;
  const appliedJobs = jobs.filter((j: BaseJob) => j.status !== "saved");
  const responses = jobs.filter((j: BaseJob) => ["interview", "offer", "rejected"].includes(j.status));
  const responseRate = appliedJobs.length > 0
    ? Math.round((responses.length / appliedJobs.length) * 100) : 0;
    
  let streak = 0;
  if (totalApplications > 0) {
    const uniqueDates = new Set(jobs.map((j: BaseJob) => {
      const d = new Date(j.createdAt);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    }));
    
    let currentDate = new Date();
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    
    if (uniqueDates.has(currentDate.getTime())) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      currentDate.setDate(currentDate.getDate() - 1);
      if (uniqueDates.has(currentDate.getTime())) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      }
    }
    
    while (uniqueDates.has(currentDate.getTime())) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
  }
  const dailyStreak = streak;
  
  const recentlyApplied = jobs.slice(0, 3);

  // ── Setup Checklist ──
  const typedUser = user as BaseUser | null;
  const hasResume = !!typedUser?.resumeText && typedUser.resumeText.length > 50;
  const hasJobs = totalApplications > 0;
  const hasAnalysis = jobs.some((j: BaseJob) => j.matchScore !== null && j.matchScore !== undefined);
  const setupItems = [
    { key: "resume", done: hasResume, label: "Upload your resume", action: "Upload in Settings", href: "/settings" },
    { key: "job", done: hasJobs, label: "Add your first job", action: "Add a job", href: "/jobs" },
    { key: "analysis", done: hasAnalysis, label: "Run your first AI analysis", action: "Analyze a job", href: "/jobs" },
  ];
  const incompleteSetup = setupItems.filter((s) => !s.done);

  // ── Today's Focus ──
  const now = new Date();
  const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const ago7days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const ago14days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const focusItems: { type: string; job: BaseJob; label: string; action: string; href: string }[] = [];

  // Priority 1: Interviews this week
  const upcomingInterviews = jobs.filter((j: BaseJob) =>
    j.status === "interview" && j.followUpDate && new Date(j.followUpDate) <= in7days && new Date(j.followUpDate) >= now
  );
  for (const job of upcomingInterviews.slice(0, 3 - focusItems.length)) {
    focusItems.push({ type: "interview", job, label: "Interview coming up", action: "Prep with AI", href: `/jobs/${job._id.toString()}?tab=interview-prep` });
  }

  // Priority 2: Overdue follow-ups
  if (focusItems.length < 3) {
    const overdue = jobs.filter((j: BaseJob) =>
      j.status === "applied" && j.appliedDate && new Date(j.appliedDate) < ago7days
    );
    for (const job of overdue.slice(0, 3 - focusItems.length)) {
      focusItems.push({ type: "followup", job, label: "Follow-up overdue", action: "Send Follow-up", href: `/jobs/${job._id.toString()}?tab=notes` });
    }
  }

  // Priority 3: Stale jobs
  if (focusItems.length < 3) {
    const stale = jobs.filter((j: BaseJob) =>
      new Date(j.updatedAt) < ago14days && j.status !== "offer" && j.status !== "rejected"
    );
    for (const job of stale.slice(0, 3 - focusItems.length)) {
      focusItems.push({ type: "stale", job, label: "No updates in 14+ days", action: "Update Status", href: `/jobs/${job._id.toString()}` });
    }
  }

  const pipeline = {
    saved: jobs.filter((j: BaseJob) => j.status === "saved").length,
    applied: jobs.filter((j: BaseJob) => j.status === "applied").length,
    interview: jobs.filter((j: BaseJob) => j.status === "interview").length,
    offer: jobs.filter((j: BaseJob) => j.status === "offer").length,
    rejected: jobs.filter((j: BaseJob) => j.status === "rejected").length,
  };

  // Platform distribution
  const platformMap: Record<string, number> = {};
  jobs.forEach((j: BaseJob & { platform?: string }) => {
    const p = j.platform || "Other";
    platformMap[p] = (platformMap[p] || 0) + 1;
  });
  const platformDistribution = Object.entries(platformMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count, pct: totalApplications > 0 ? Math.round((count / totalApplications) * 100) : 0 }));

  return { totalApplications, interviews, offers, responseRate, dailyStreak, recentlyApplied, setupItems: incompleteSetup, focusItems, userResumeText: typedUser?.resumeText || "", pipeline, platformDistribution };
}

export default async function DashboardPage() {
  const session = await getSession();
  const userId = session?.user && 'id' in session.user ? (session.user as { id: string }).id : "";
  const stats = await getDashboardData(userId);

  const statConfig = [
    { label: "Total Applied", value: stats.totalApplications, icon: Send, delta: "All time" },
    { label: "Response Rate", value: `${stats.responseRate}%`, icon: MessageSquare, delta: "Avg" },
    { label: "Interviews", value: stats.interviews, icon: CalendarDays, delta: "Active" },
    { label: "Daily Streak", value: stats.dailyStreak, icon: Flame, delta: "Days" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight flex items-center gap-2">
            <Greeting name={session?.user?.name?.split(" ")[0] || "User"} />
          </h1>
          <p className="text-text-secondary mt-1 font-medium">
            You have {stats.interviews} interviews scheduled for this week.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-10 w-10 rounded-md bg-bg-surface-elevated border border-border-subtle flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors">
            <Bell className="h-4 w-4" />
          </button>
          <AddJobModal userResumeText={stats.userResumeText}>
            <button className="h-10 rounded-md bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-5 text-sm transition-all shadow-sm flex items-center gap-2">
              <Plus className="h-4 w-4" strokeWidth={3} /> Add New Job
            </button>
          </AddJobModal>
        </div>
      </div>

      {/* Setup Checklist — only shown if any item incomplete */}
      {stats.setupItems.length > 0 && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-5 shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-lg" />
          <div className="flex items-center justify-between mb-3 pl-2">
            <h2 className="text-sm font-semibold text-text-primary">Get started</h2>
            <span className="text-xs font-semibold text-text-tertiary">
              {3 - stats.setupItems.length} of 3 complete
            </span>
          </div>
          <div className="space-y-2.5 pl-2">
            {stats.setupItems.map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <Circle className="w-4 h-4 text-text-tertiary shrink-0" />
                  <span className="text-sm text-text-secondary">{item.label}</span>
                </div>
                <Link
                  href={item.href}
                  className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 shrink-0 transition-colors"
                >
                  {item.action} <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statConfig.map((stat) => (
          <div key={stat.label} className="bg-bg-surface border border-border-subtle p-6 rounded-lg shadow-sm relative overflow-hidden group hover:border-border-default transition-all duration-300">
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="w-10 h-10 rounded-md flex items-center justify-center border bg-bg-surface-elevated border-border-subtle text-text-secondary">
                  <stat.icon className="h-5 w-5" strokeWidth={2.5} />
                </div>
                <div className={cn(
                  "flex items-center gap-0.5 text-[11px] font-bold px-2 py-1 rounded-full",
                  "bg-bg-surface-elevated text-text-secondary border border-border-subtle"
                )}>
                  {stat.delta}
                </div>
              </div>
              <div>
                <p className="text-xs text-text-secondary font-medium tracking-wide mb-1">{stat.label}</p>
                <div className="text-2xl font-bold text-text-primary flex items-center gap-2">
                  {stat.value}
                  {stat.label === "Daily Streak" && <Sparkles className="h-5 w-5 text-orange-500" />}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Today's Focus */}
      {stats.focusItems.length > 0 ? (
        <div>
          <h2 className="text-lg font-semibold text-text-primary tracking-tight mb-4">Today&apos;s Focus</h2>
          <div className="space-y-3">
            {stats.focusItems.map((item, i) => {
              const Icon = item.type === "interview" ? CalendarCheck
                : item.type === "followup" ? Send
                : AlertTriangle;
              const iconClass = item.type === "interview" ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                : item.type === "followup" ? "text-amber-500 bg-amber-500/10 border-amber-500/20"
                : "text-orange-500 bg-orange-500/10 border-orange-500/20";
              const badgeClass = item.type === "interview" ? "text-emerald-500 bg-emerald-500/10"
                : item.type === "followup" ? "text-amber-500 bg-amber-500/10"
                : "text-orange-500 bg-orange-500/10";
              return (
                <div key={i} className="bg-bg-surface border border-border-subtle rounded-lg p-4 flex items-center gap-4 shadow-sm hover:border-border-default transition-colors">
                  <div className={cn("w-9 h-9 rounded-md flex items-center justify-center border shrink-0", iconClass)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-tertiary font-medium truncate">{item.job.company}</p>
                    <p className="text-sm font-semibold text-text-primary truncate">{item.job.title}</p>
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", badgeClass)}>{item.label}</span>
                  </div>
                  <Link
                    href={item.href}
                    className="shrink-0 text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {item.action} <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Only show "on top of everything" if user has some jobs and focus is empty */
        stats.setupItems.length === 0 && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">You&apos;re on top of everything!</p>
          </div>
        )
      )}

      {/* Bottom Section: Pipeline & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Preview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary tracking-tight">Applications Pipeline</h2>
            <Link href="/jobs" className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
            <div className="flex flex-col gap-3">
              {[
                { label: "Saved", value: stats.pipeline?.saved || 0, icon: Circle, desc: "Waiting to apply" },
                { label: "Applied", value: stats.pipeline?.applied || 0, icon: Send, desc: "Awaiting response" },
                { label: "Interview", value: stats.pipeline?.interview || 0, icon: CalendarDays, desc: "Active conversations" },
                { label: "Offer", value: stats.pipeline?.offer || 0, icon: Zap, desc: "Successfully secured" },
                { label: "Rejected", value: stats.pipeline?.rejected || 0, icon: AlertTriangle, desc: "Not moving forward" },
              ].map((item) => (
                <Link key={item.label} href="/jobs" className={cn(
                  "block group relative overflow-hidden bg-bg-surface rounded-lg p-4 transition-all duration-300",
                  "border border-border-subtle hover:border-border-default hover:-translate-y-px shadow-sm"
                )}>
                  {/* Subtle background glow on hover */}
                  <div className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-bg-surface-elevated/50"
                  )} />
                  
                  <div className="relative z-10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-md flex items-center justify-center transition-transform group-hover:scale-105 duration-300 shrink-0",
                        "bg-bg-surface-elevated border border-border-subtle text-text-secondary"
                      )}>
                        <item.icon className={cn("h-5 w-5")} strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-sm sm:text-base font-semibold text-text-primary mb-0.5">{item.label}</p>
                        <p className="text-xs font-medium text-text-tertiary">{item.desc}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={cn("text-2xl font-bold tracking-tight text-text-primary")}>{item.value}</p>
                      </div>
                      <div className="w-8 flex justify-end">
                        <ArrowRight className="w-4 h-4 text-text-tertiary opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary tracking-tight">Recent Activity</h2>
            <button className="text-text-secondary hover:text-text-primary transition-colors">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
          <div className="rounded-lg border border-border-subtle bg-bg-surface p-4 flex flex-col min-h-70">
            {stats.recentlyApplied.length > 0 ? (
              <div className="space-y-4 flex-1">
                {stats.recentlyApplied.map((job: BaseJob) => (
                  <div key={job._id.toString()} className="flex gap-4">
                    <div className="mt-1 relative">
                      <div className="w-8 h-8 rounded-full bg-bg-surface-elevated border border-border-subtle flex items-center justify-center z-10 relative">
                        <Send className="w-3.5 h-3.5 text-text-secondary" />
                      </div>
                      <div className="absolute top-8 -bottom-4 left-1/2 w-px bg-border-subtle transform -translate-x-1/2" />
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm font-bold text-text-primary">Application Added</p>
                      <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                        {job.company} — {job.title}
                      </p>
                      <p className="text-[10px] text-text-tertiary font-medium uppercase tracking-wider mt-2">Recently</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <p className="text-sm font-medium text-text-secondary mb-1">No activity yet</p>
                <p className="text-xs text-text-tertiary">Activities will appear here</p>
              </div>
            )}
            <button className="w-full mt-4 py-2.5 rounded-xl bg-bg-surface-elevated hover:bg-border-subtle text-xs font-semibold text-text-primary transition-colors border border-border-subtle">
              View All Activity
            </button>
          </div>

          {/* Platform Distribution */}
          {stats.platformDistribution && stats.platformDistribution.length > 0 && (
            <div className="rounded-lg border border-border-subtle bg-bg-surface p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-text-primary">Top Platforms</h3>
                <Link href="/analytics" className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors">
                  Details <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-3">
                {stats.platformDistribution.map((p: { name: string; count: number; pct: number }) => (
                  <div key={p.name}>
                    <div className="flex justify-between text-xs font-medium text-text-secondary mb-1.5">
                      <span className="flex items-center gap-2">
                         {getPlatformIcon(p.name) ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={getPlatformIcon(p.name)!} alt="" className="w-4 h-4 rounded-sm" />
                          ) : (
                            <Globe className="w-4 h-4 text-text-tertiary" />
                          )}
                         {p.name}
                      </span>
                      <span className="text-text-tertiary">{p.count} ({p.pct}%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-border-subtle rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${p.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
